// Autonomous product discovery & publishing pipeline.
//
//   Reddit (what owners actually recommend) → rank by community buzz
//   → resolve on Amazon via real Chrome (rating/review-count quality gate)
//   → Ollama writes a review grounded in the real Reddit text
//   → publishes to src/data/auto-products.json via git (dedicated clone)
//
// Designed to run unattended (n8n nightly). Flags: --dry-run (no push), --max N
//
// Every gate is deterministic where it matters:
//   - extracted names must literally appear in the source post (no hallucinations)
//   - Amazon result title must share model tokens with the candidate (no mismatches)
//   - rating >= 4.3 and >= 400 ratings (only proven, widely-bought products)

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";

const DRY_RUN = process.argv.includes("--dry-run");
const MAX_NEW = Number((process.argv.find((a) => a.startsWith("--max=")) || "").split("=")[1] || 4);
const REPO_URL = "https://github.com/nc262/budgettechpicks.git";
const CLONE_DIR = "C:\\n8n-data\\site-repo";
const OLLAMA = "http://127.0.0.1:11434/api/generate";
const MODEL = "llama3.2:3b";

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ── Searches (subreddit/query combos validated against Arctic Shift) ─────────
const SEARCHES = [
  { subreddit: "buildapcsales", query: "monitor" },
  { subreddit: "buildapcsales", query: "keyboard" },
  { subreddit: "buildapcsales", query: "mouse" },
  { subreddit: "buildapcsales", query: "headphones" },
  { subreddit: "MechanicalKeyboards", query: "recommend" },
  { subreddit: "BudgetAudiophile", query: "recommend" },
  { subreddit: "Monitors", query: "recommend" },
  { subreddit: "homeoffice", query: "recommend" },
  { subreddit: "smarthome", query: "recommend" },
  { subreddit: "pcmasterrace", query: "peripherals" },
  { subreddit: "hometheater", query: "recommend" },
  { subreddit: "Twitch", query: "microphone" },
];

const SLUG_RULES = [
  [/(monitor|ultrawide|qd-?oled|1440p|144hz|165hz)/i, "best-monitors-and-displays"],
  [/(earbud|airpod|iem\b)/i, "best-wireless-earbuds-under-50"],
  [/(headphone|\bdac\b|\bamp\b|planar)/i, "best-audio-gear"],
  [/(microphone|\bmic\b|stream deck|capture card|key light|ring light)/i, "best-streaming-gear"],
  [/(webcam)/i, "best-budget-webcams"],
  [/(usb-?c hub|docking|thunderbolt|dock\b)/i, "best-usb-c-hubs-under-50"],
  [/(smart (plug|bulb|lock|display)|alexa|echo|hue|nest|matter)/i, "best-smart-home-under-50"],
  [/(power bank|gan charger|airtag|tile\b|bluetooth speaker|kindle|tracker)/i, "best-portable-tech-under-50"],
  [/(chair|standing desk|steam deck|rog ally|handheld)/i, "best-gaming-setups"],
  [/(monitor arm|desk mat|screenbar|light bar|laptop stand|cable)/i, "best-desk-accessories-under-50"],
  [/(keyboard|mouse|headset|controller)/i, "best-gaming-gear-under-50"],
];
const SUBREDDIT_DEFAULT = {
  Monitors: "best-monitors-and-displays",
  MechanicalKeyboards: "best-gaming-gear-under-50",
  BudgetAudiophile: "best-audio-gear",
  homeoffice: "best-desk-accessories-under-50",
  smarthome: "best-smart-home-under-50",
  pcmasterrace: "best-gaming-setups",
  hometheater: "best-audio-gear",
  Twitch: "best-streaming-gear",
};

// ── Token helpers (same rules the insights pipeline uses) ────────────────────
const squash = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const wordSet = (s) => new Set((s || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
const STOPWORDS = ["the", "and", "for", "with", "best", "pro", "plus", "wireless", "gaming", "true"];

function modelTokens(name) {
  const words = (name || "").replace(/[—–-]/g, " ").split(/\s+/).filter(Boolean);
  return [...new Set(words
    .filter((w) => /\d/.test(w))
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 3
      // generic capacity/spec/ordinal tokens identify nothing ("16gb" matches GPUs and Kindles alike)
      && !/^\d+(pack|pk|th|nd|rd|st|gen|k|gb|tb|mm|cm|hz|w|p|in|ft|ohm)?$/.test(t)
      && !/^(19|20)\d{2}$/.test(t)))];
}
function tokenVariants(toks) {
  return toks.flatMap((t) => {
    const suffix = (t.match(/[a-z]+\d+[a-z]*$/) || [])[0] || "";
    return [t, t.replace(/s$/, ""), suffix, suffix.replace(/s$/, "")];
  }).filter((v) => v.length >= 3);
}
function nameWords(name) {
  return [...new Set((name || "").toLowerCase().split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length >= 3 && !/\d/.test(t) && !STOPWORDS.includes(t)))];
}
function nameAppearsIn(name, text) {
  const toks = modelTokens(name);
  if (toks.length > 0) {
    const hay = squash(text);
    return tokenVariants(toks).some((v) => hay.includes(v));
  }
  // No model token → exact-word matches only (substrings let "air" match "corsair")
  const w = wordSet(text);
  return nameWords(name).filter((t) => w.has(t)).length >= 2;
}
// Deal matching is stricter: a deal must clearly be THIS product, not a sibling
function dealMatches(name, title) {
  const toks = modelTokens(name);
  if (toks.length > 0) {
    const hay = squash(title);
    return tokenVariants(toks).some((v) => hay.includes(v));
  }
  const w = wordSet(title);
  return nameWords(name).filter((t) => w.has(t)).length >= 3;
}

async function ollama(prompt) {
  const r = await fetch(OLLAMA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false, format: "json" }),
  });
  if (!r.ok) throw new Error(`ollama ${r.status}`);
  return (await r.json()).response || "";
}

// ── 1. Pull Reddit posts ─────────────────────────────────────────────────────
async function fetchPosts() {
  const after = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
  const posts = [];
  for (const s of SEARCHES) {
    try {
      const url = new URL("https://arctic-shift.photon-reddit.com/api/posts/search");
      url.searchParams.set("query", s.query);
      url.searchParams.set("subreddit", s.subreddit);
      url.searchParams.set("limit", "15");
      url.searchParams.set("after", String(after));
      const j = await fetch(url, { signal: AbortSignal.timeout(30000) }).then((r) => r.json());
      for (const p of (j.data || []).filter((p) => p && (p.score || 0) >= 5).slice(0, 5)) {
        posts.push({
          subreddit: p.subreddit || s.subreddit,
          title: p.title || "",
          body: (p.selftext || "").slice(0, 600),
          score: p.score || 0,
          numComments: p.num_comments || 0,
          url: "https://reddit.com" + (p.permalink || ""),
        });
      }
    } catch (e) {
      log(`  search ${s.subreddit}/${s.query} failed: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return posts;
}

// ── 2. Extract product names (LLM) + verify they exist in the post ──────────
async function extractCandidates(posts) {
  const byName = new Map();
  for (const post of posts) {
    try {
      const resp = await ollama(
        "Extract specific tech product names mentioned in this Reddit post. Return ONLY valid JSON: " +
        '{"products": ["..."]}. Only include specific named products like "Logitech MX Keys" or "Samsung Odyssey G5" — ' +
        "never generic terms like keyboard or monitor. Empty array if none.\n\n" +
        `Title: ${post.title}\nBody: ${post.body}`
      );
      let names = [];
      try { names = JSON.parse(resp).products || []; } catch {}
      for (const raw of names) {
        if (typeof raw !== "string" || raw.length < 6 || raw.length > 70) continue;
        const name = raw.trim();
        // Anti-hallucination: the name must actually appear in the post text
        if (!nameAppearsIn(name, post.title + " " + post.body)) continue;
        const key = squash(name);
        const cur = byName.get(key) || { name, mentions: 0, bestPost: post, posts: [] };
        cur.mentions += 1;
        cur.posts.push(post);
        if (post.score > cur.bestPost.score) cur.bestPost = post;
        byName.set(key, cur);
      }
    } catch (e) {
      log(`  extract failed: ${e.message}`);
    }
  }
  return [...byName.values()];
}

// ── 3. Slug classification ───────────────────────────────────────────────────
// PC components aren't site categories — never publish them
const COMPONENT_BLOCKLIST = /(\bcpu\b|ryzen|intel core|threadripper|\bgpu\b|geforce|rtx \d|radeon|motherboard|\bb\d{3}[me]?\b|\bx\d{3}e?\b|\bz\d{3}\b|ddr\d|\bram\b|m\.2|nvme|\bssd\b|\bhdd\b|\bpsu\b|power supply|case fan|\bfans?\b|pc case|cooler|\baio\b|thermal paste|riser cable)/i;

function classify(candidate) {
  const text = candidate.name + " " + candidate.bestPost.title;
  if (COMPONENT_BLOCKLIST.test(text)) return null;
  for (const [re, slug] of SLUG_RULES) if (re.test(text)) return slug;
  return SUBREDDIT_DEFAULT[candidate.bestPost.subreddit] || null;
}

// ── 4. Amazon resolution with quality gate ───────────────────────────────────
async function resolveOnAmazon(browser, candidate) {
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "en-US" })).newPage();
  try {
    await page.goto("https://www.amazon.com/s?k=" + encodeURIComponent(candidate.name), { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector('div[data-asin][data-component-type="s-search-result"]', { timeout: 15000 });
    const results = await page.evaluate(() => {
      return [...document.querySelectorAll('div[data-asin][data-component-type="s-search-result"]')]
        .filter((c) => c.getAttribute("data-asin") && !c.querySelector(".puis-sponsored-label-text"))
        .slice(0, 3)
        .map((c) => {
          const ratingText = c.querySelector('[aria-label*="out of 5 stars"]')?.getAttribute("aria-label") ?? "";
          const countText = c.querySelector('[aria-label$="ratings"], [aria-label$="rating"]')?.getAttribute("aria-label")
            ?? c.querySelector(".s-underline-text")?.textContent ?? "";
          return {
            asin: c.getAttribute("data-asin"),
            // The full product title lives in the image alt; h2 often holds only the brand now
            title: (c.querySelector("img.s-image")?.getAttribute("alt") || c.querySelector("h2")?.textContent || "").trim(),
            price: c.querySelector(".a-price .a-offscreen")?.textContent?.trim() ?? null,
            rating: Number((ratingText.match(/([\d.]+) out of 5/) || [])[1]) || null,
            ratingsCount: Number(countText.replace(/[^\d]/g, "")) || null,
            imageUrl: c.querySelector("img.s-image")?.getAttribute("src") ?? null,
          };
        });
    });
    // Title must share model tokens with the candidate, then pass the quality bar
    for (const r of results) {
      if (!r.asin || !r.title) continue;
      if (!nameAppearsIn(candidate.name, r.title)) continue;
      if ((r.rating ?? 0) < 4.3 || (r.ratingsCount ?? 0) < 400) {
        log(`    "${candidate.name}" → ${r.asin} fails quality gate (${r.rating}★, ${r.ratingsCount} ratings)`);
        continue;
      }
      return r;
    }
    return null;
  } finally {
    await page.close();
  }
}

// ── 5. Grounded review ───────────────────────────────────────────────────────
async function writeReview(candidate, amazon) {
  const evidence = candidate.posts
    .map((p) => `r/${p.subreddit} (${p.score} upvotes): "${p.title}" ${p.body ? "— " + p.body.slice(0, 300) : ""}`)
    .join("\n");
  const resp = await ollama(
    `Real Reddit posts mentioning "${amazon.title.slice(0, 90)}":\n${evidence}\n\n` +
    `Amazon data: ${amazon.rating} stars across ${amazon.ratingsCount} ratings.\n\n` +
    "Write an honest product blurb based ONLY on the text above. Return valid JSON: " +
    '{"description": "1-2 factual sentences on why the community recommends it", ' +
    '"pros": ["max 3, only points supported by the text"], "cons": ["max 2, only if supported, else empty"]}'
  );
  try {
    const parsed = JSON.parse(resp);
    return {
      description: typeof parsed.description === "string" ? parsed.description.slice(0, 280) : "",
      pros: (Array.isArray(parsed.pros) ? parsed.pros : []).filter((p) => typeof p === "string").slice(0, 3),
      cons: (Array.isArray(parsed.cons) ? parsed.cons : []).filter((c) => typeof c === "string").slice(0, 2),
    };
  } catch {
    return { description: "", pros: [], cons: [] };
  }
}

// ── Deal radar: fresh r/buildapcsales threads that mention products we cover ─
async function buildDealRadar(siteProductNames) {
  const after = Math.floor(Date.now() / 1000) - 48 * 3600;
  const deals = [];
  try {
    const url = new URL("https://arctic-shift.photon-reddit.com/api/posts/search");
    url.searchParams.set("subreddit", "buildapcsales");
    url.searchParams.set("limit", "40");
    url.searchParams.set("after", String(after));
    const j = await fetch(url, { signal: AbortSignal.timeout(30000) }).then((r) => r.json());
    for (const p of (j.data || []).filter((p) => p && (p.score || 0) >= 15)) {
      const match = siteProductNames.find((n) => dealMatches(n.name, p.title));
      if (!match) continue;
      deals.push({
        product: match.name,
        asin: match.asin,
        slug: match.articleSlug,
        title: (p.title || "").slice(0, 140),
        url: "https://reddit.com" + (p.permalink || ""),
        score: p.score || 0,
        postedAt: new Date((p.created_utc || 0) * 1000).toISOString(),
      });
    }
  } catch (e) {
    log(`  deal radar failed: ${e.message}`);
  }
  return deals.sort((a, b) => b.score - a.score).slice(0, 6);
}

// ── Promote/retire: mature, proven auto-products graduate into products.ts ──
const CATEGORY_BY_SLUG = {
  "best-usb-c-hubs-under-50": "USB-C Hubs",
  "best-budget-webcams": "Webcams",
  "best-wireless-earbuds-under-50": "Wireless Earbuds",
  "best-desk-accessories-under-50": "Desk Accessories",
  "best-gaming-gear-under-50": "Gaming Gear",
  "best-desk-toys-under-50": "Desk Toys & Fun",
  "best-smart-home-under-50": "Smart Home",
  "best-portable-tech-under-50": "Portable Tech",
  "best-monitors-and-displays": "Monitors & Displays",
  "best-streaming-gear": "Streaming Gear",
  "best-audio-gear": "Audio & Microphones",
  "best-gaming-setups": "Gaming Setups",
};

function promoteMature(autoProducts, productsTsPath) {
  const fourteenDays = Date.now() - 14 * 24 * 3600 * 1000;
  const due = autoProducts.find((p) =>
    new Date(p.addedAt || 0).getTime() < fourteenDays &&
    (p.rating ?? 0) >= 4.4 && (p.reviewCount ?? 0) >= 1000 &&
    CATEGORY_BY_SLUG[p.articleSlug]
  );
  if (!due) return null;

  const src = readFileSync(productsTsPath, "utf8");
  const arrStart = src.indexOf("export const products");
  const arrEnd = src.indexOf("\n];", arrStart);
  if (arrStart < 0 || arrEnd < 0) { log("  promote: products array not found — skipped"); return null; }

  const J = JSON.stringify; // escape-safe string emission
  const entry = `
  // Promoted from community picks after 14+ days live (auto-pipeline)
  {
    id: ${J("auto-" + due.asin.toLowerCase())},
    name: ${J(due.name)},
    asin: ${J(due.asin)},
    price: ${J(due.price || "$—")},
    priceNum: ${Number(String(due.price || "0").replace(/[^\d.]/g, "")) || 0},
    rating: ${due.rating},
    reviewCount: ${due.reviewCount},
    description: ${J(due.description || "Community-recommended pick, verified against Amazon ratings.")},
    pros: ${J(due.pros?.length ? due.pros : ["Community recommended", "Strong Amazon rating"])},
    cons: ${J(due.cons?.length ? due.cons : ["Newer to our list — less long-term data"])},
    category: ${J(CATEGORY_BY_SLUG[due.articleSlug])},
    articleSlug: ${J(due.articleSlug)},
    badge: "🚀 Community Fave",
  },`;
  writeFileSync(productsTsPath, src.slice(0, arrEnd) + entry + src.slice(arrEnd));
  return due;
}

// ── 6. Git plumbing (dedicated clone, never touches the working repo) ───────
function sh(cmd) { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
function syncClone() {
  if (!existsSync(join(CLONE_DIR, ".git"))) {
    log(`cloning ${REPO_URL} → ${CLONE_DIR}`);
    sh(`git clone --depth 5 ${REPO_URL} "${CLONE_DIR}"`);
  }
  sh(`git -C "${CLONE_DIR}" fetch origin master`);
  sh(`git -C "${CLONE_DIR}" reset --hard origin/master`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
log(`discovery run starting (dry-run=${DRY_RUN}, max=${MAX_NEW})`);
syncClone();

const productsTs = readFileSync(join(CLONE_DIR, "src/data/products.ts"), "utf8");
const existingNames = [...productsTs.matchAll(/^\s+name:\s*"(.+?)",\s*$/gm)].map((m) => squash(m[1]));
const existingAsins = new Set([...productsTs.matchAll(/asin:\s*"([A-Z0-9]{10})"/g)].map((m) => m[1]));
const autoPath = join(CLONE_DIR, "src/data/auto-products.json");
let autoProducts = [];
try { autoProducts = JSON.parse(readFileSync(autoPath, "utf8")); } catch {}
if (!Array.isArray(autoProducts)) autoProducts = [];
for (const p of autoProducts) existingAsins.add(p.asin);

log("searching Reddit…");
const posts = await fetchPosts();
log(`${posts.length} qualifying posts`);

log("extracting product names (Ollama)…");
let candidates = await extractCandidates(posts);
log(`${candidates.length} verified name candidates`);

// Drop anything already on the site (curated or auto), classify, rank by buzz
candidates = candidates
  .filter((c) => {
    const k = squash(c.name);
    return !existingNames.some((n) => n.includes(k) || k.includes(n))
      && !autoProducts.some((p) => squash(p.name).includes(k) || k.includes(squash(p.name)));
  })
  .map((c) => ({ ...c, articleSlug: classify(c) }))
  .filter((c) => c.articleSlug)
  .sort((a, b) => b.mentions - a.mentions || b.bestPost.score - a.bestPost.score)
  .slice(0, MAX_NEW * 3); // resolve extra in case some fail the quality gate

log(`${candidates.length} new candidates to resolve: ${candidates.map((c) => c.name).join(" | ")}`);

const published = [];
if (candidates.length > 0) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--disable-blink-features=AutomationControlled"] });
  try {
    for (const c of candidates) {
      if (published.length >= MAX_NEW) break;
      try {
        log(`  resolving "${c.name}"…`);
        const amazon = await resolveOnAmazon(browser, c);
        if (!amazon) { log("    no qualifying Amazon match"); continue; }
        if (existingAsins.has(amazon.asin)) { log(`    ${amazon.asin} already on site`); continue; }
        // The resolved Amazon title often reveals what a vague candidate really is —
        // run the component blocklist against it too (catches "Liquid CPU Cooler" etc.)
        if (COMPONENT_BLOCKLIST.test(amazon.title)) { log(`    "${amazon.title.slice(0, 60)}" is a PC component — skipped`); continue; }
        const review = await writeReview(c, amazon);
        published.push({
          asin: amazon.asin,
          name: amazon.title.length > 70 ? c.name : amazon.title,
          price: amazon.price,
          imageUrl: amazon.imageUrl,
          rating: amazon.rating,
          reviewCount: amazon.ratingsCount,
          articleSlug: c.articleSlug,
          description: review.description,
          pros: review.pros,
          cons: review.cons,
          sourceUrl: c.bestPost.url,
          sourceSubreddit: c.bestPost.subreddit,
          mentions: c.mentions,
          addedAt: new Date().toISOString(),
        });
        existingAsins.add(amazon.asin);
        log(`    ✓ ${amazon.asin} "${c.name}" (${amazon.rating}★ × ${amazon.ratingsCount}) → ${c.articleSlug}`);
        await new Promise((r) => setTimeout(r, 5000 + Math.random() * 4000));
      } catch (e) {
        log(`    resolve failed: ${String(e.message).slice(0, 120)}`);
      }
    }
  } finally {
    await browser.close();
  }
}

// Merge: newest first, cap 6 per slug, retire entries older than 60 days
const cutoff = Date.now() - 60 * 24 * 3600 * 1000;
const merged = [...published, ...autoProducts.filter((p) => new Date(p.addedAt || 0).getTime() > cutoff)];
const bySlug = {};
let finalAuto = [];
for (const p of merged) {
  bySlug[p.articleSlug] = (bySlug[p.articleSlug] || 0) + 1;
  if (bySlug[p.articleSlug] <= 6) finalAuto.push(p);
}

// Promote: a mature, proven community pick graduates into the curated list (max 1/night)
let promoted = null;
if (!DRY_RUN) {
  promoted = promoteMature(finalAuto, join(CLONE_DIR, "src/data/products.ts"));
  if (promoted) {
    finalAuto = finalAuto.filter((p) => p.asin !== promoted.asin);
    log(`promoted to curated picks: "${promoted.name}" (${promoted.rating}★ × ${promoted.reviewCount})`);
  }
}

writeFileSync(autoPath, JSON.stringify(finalAuto, null, 2) + "\n");

// Deal radar: fresh deal threads matching anything we cover (curated + auto)
log("scanning deal radar…");
const siteProductIndex = [
  ...[...productsTs.matchAll(/id:\s*"[^"]+"[\s\S]*?name:\s*"(.+?)"[\s\S]*?asin:\s*"([A-Z0-9]{10})"[\s\S]*?articleSlug:\s*"([^"]+)"/g)]
    .map((m) => ({ name: m[1].replace(/\\"/g, '"'), asin: m[2], articleSlug: m[3] })),
  ...finalAuto.map((p) => ({ name: p.name, asin: p.asin, articleSlug: p.articleSlug })),
];
const deals = await buildDealRadar(siteProductIndex);
log(`${deals.length} live deal(s) matched site products`);
writeFileSync(join(CLONE_DIR, "src/data/deal-radar.json"),
  JSON.stringify({ updatedAt: new Date().toISOString(), deals }, null, 2) + "\n");

// Render branded Pinterest pins for anything new — best-effort, never blocks the commit
const newPinAsins = [...published.map((p) => p.asin), ...(promoted ? [promoted.asin] : [])];
if (!DRY_RUN && newPinAsins.length) {
  try {
    execSync(`node "${join(CLONE_DIR, "scripts/generate-pin-images.mjs")}" --asins=${newPinAsins.join(",")}`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    log(`rendered Pinterest pins for ${newPinAsins.length} new product(s)`);
  } catch (e) {
    log(`pin render skipped: ${String(e.message).slice(0, 100)}`);
  }
}

// Single commit for everything that changed tonight
const DATA_PATHS = "src/data/auto-products.json src/data/deal-radar.json src/data/products.ts public/images/pinterest/auto";
const changed = sh(`git -C "${CLONE_DIR}" status --porcelain -- ${DATA_PATHS}`);
if (!changed) {
  log("no data changes tonight — no commit");
} else if (DRY_RUN) {
  log(`DRY RUN: would commit ${published.length} new, ${promoted ? 1 : 0} promoted, ${deals.length} deals`);
} else {
  const parts = [];
  if (published.length) parts.push(`${published.length} new pick(s)`);
  if (promoted) parts.push("1 promoted to curated");
  parts.push(`${deals.length} live deal(s)`);
  sh(`git -C "${CLONE_DIR}" add ${DATA_PATHS}`);
  sh(`git -C "${CLONE_DIR}" -c user.name=BudgetTechPicks -c user.email=automation@totaltechpicks.com commit -m "chore: nightly refresh — ${parts.join(", ")} [automated]"`);
  try {
    sh(`git -C "${CLONE_DIR}" push origin master`);
  } catch {
    sh(`git -C "${CLONE_DIR}" pull --rebase origin master`);
    sh(`git -C "${CLONE_DIR}" push origin master`);
  }
  log(`PUBLISHED ${published.length} product(s), ${deals.length} deal(s)${promoted ? ", 1 promotion" : ""} → site rebuild triggered`);
}
log("done");
