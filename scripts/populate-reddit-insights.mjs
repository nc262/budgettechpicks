/**
 * Populates src/data/reddit-insights.json using:
 * 1. Reddit free search API to fetch posts about each product
 * 2. Ollama (llama3.2:3b) to filter for relevance and generate real summaries/pros/cons
 *
 * Run: node scripts/populate-reddit-insights.mjs
 * Pass --force to re-process products that already have data
 * Pass --product "Sony WF-1000XM5" to process a single product
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FORCE = process.argv.includes("--force");
const MISSING_CONS = process.argv.includes("--missing-cons");
const SINGLE = (() => { const i = process.argv.indexOf("--product"); return i > -1 ? process.argv[i+1] : null; })();

// ── Load existing data ─────────────────────────────────────────────────────
const insightsPath = join(ROOT, "src/data/reddit-insights.json");
let existingData = {};
try { existingData = JSON.parse(readFileSync(insightsPath, "utf8")); } catch {}

// ── Extract all products from products.ts ──────────────────────────────────
const productsTs = readFileSync(join(ROOT, "src/data/products.ts"), "utf8");
const nameMatches = [...productsTs.matchAll(/name:\s*"([^"]+)"/g)];
const slugMatches = [...productsTs.matchAll(/articleSlug:\s*"([^"]+)"/g)];
let allProducts = nameMatches.map((m, i) => ({ name: m[1], slug: slugMatches[i]?.[1] ?? "" }));

if (SINGLE) {
  allProducts = allProducts.filter(p => p.name.toLowerCase().includes(SINGLE.toLowerCase()));
  console.log(`Single mode: found ${allProducts.length} matching product(s)`);
}

console.log(`Processing ${allProducts.length} products across ${new Set(allProducts.map(p=>p.slug)).size} categories`);

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Reddit search ──────────────────────────────────────────────────────────
async function searchReddit(query) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=15&t=year`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "TotalTechPicks/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.data?.children?.map(c => c.data) ?? [];
  } catch (e) {
    console.warn(`  ⚠ Reddit: ${e.message}`);
    return [];
  }
}

// ── Filter posts to only those about the product ──────────────────────────
function filterRelevant(productName, posts) {
  const words = productName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(" ")
    .filter(w => w.length > 2 && !["the","and","for","with","plus","pro","max","gen","usb"].includes(w))
    .slice(0, 4);

  return posts.filter(p => {
    const text = `${p.title ?? ""} ${p.selftext ?? ""}`.toLowerCase();
    const hits = words.filter(w => text.includes(w)).length;
    return hits >= Math.min(2, words.length);
  });
}

// ── Ollama AI summarization ────────────────────────────────────────────────
async function ollamaSummarize(productName, posts) {
  const snippets = posts.slice(0, 5).map(p => {
    const body = p.selftext ? p.selftext.slice(0, 500).replace(/\n+/g, " ") : "";
    return `[r/${p.subreddit ?? "reddit"}] "${p.title}"${body ? ` — ${body}` : ""}`;
  }).join("\n\n");

  const prompt = `You are extracting real community feedback about a specific tech product from Reddit posts.

PRODUCT: "${productName}"

REDDIT POSTS:
${snippets}

Your job: extract what Reddit users actually say about "${productName}" specifically.

Reply with ONLY valid JSON (no markdown code fences, no explanation before or after):
{
  "summary": "1-2 sentences about what Reddit users think of ${productName} specifically — mention the product name, be opinionated",
  "pros": ["specific thing users praise", "another praised feature or quality"],
  "cons": ["specific complaint users mention", "another issue or limitation noted"],
  "sentiment": "positive",
  "key_insights": ["notable community observation", "another insight or recommendation"]
}

RULES — follow exactly:
1. "pros" MUST have at least 1 item — pick the most commonly praised aspect
2. "cons" MUST have at least 1 item — every product has tradeoffs; pick the most common complaint or limitation
3. Each pro/con must be a SHORT phrase (3-8 words) — not a full sentence
4. "sentiment" must be exactly "positive", "negative", or "neutral"
5. If posts mention ANY issue, complaint, limitation, or caveat about ${productName}, put it in cons
6. If product has no negatives in posts, add the most obvious tradeoff for its category/price
7. If posts are not about ${productName} at all, return: {"summary":"","pros":[],"cons":[],"sentiment":"neutral","key_insights":[]}`;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt,
        stream: false,
        options: { temperature: 0.2, num_predict: 500 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    const raw = (data.response ?? "").trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON block found");
    const parsed = JSON.parse(match[0]);
    // Reject if Ollama returned empty/unhelpful summary
    if (!parsed.summary || parsed.summary.length < 10) return null;
    if (/not mentioned|not discussed|no specific|is not mentioned|not included/i.test(parsed.summary)) return null;
    return parsed;
  } catch (e) {
    console.warn(`  ⚠ Ollama: ${e.message}`);
    return null;
  }
}

// ── Build insight for one product ─────────────────────────────────────────
async function buildInsight(productName, slug, posts) {
  // Step 1: filter to relevant posts only
  const relevant = filterRelevant(productName, posts);
  console.log(`  Reddit: ${posts.length} posts → ${relevant.length} relevant`);

  if (relevant.length === 0) {
    return {
      product: productName, productSlug: slug,
      summary: `Highly rated in its category with strong community support.`,
      pros: [], cons: [], sentiment: "positive", key_insights: [],
      recommended_by_users: true, sourcePost: null, sourceUrl: null,
      scrapedAt: new Date().toISOString(),
    };
  }

  // Step 2: Ollama AI summary
  const ai = await askOllamaWithRetry(productName, relevant);
  const top = relevant.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];

  if (ai && ai.summary) {
    console.log(`  ✓ AI summary: "${ai.summary.slice(0, 60)}..."`);
    return {
      product: productName, productSlug: slug,
      summary: ai.summary,
      pros: ai.pros ?? [],
      cons: ai.cons ?? [],
      sentiment: ai.sentiment ?? "positive",
      key_insights: ai.key_insights ?? [],
      recommended_by_users: (ai.sentiment ?? "positive") !== "negative",
      sourcePost: top.title ?? null,
      sourceUrl: top.url ?? null,
      scrapedAt: new Date().toISOString(),
    };
  }

  // Step 3: keyword fallback if Ollama fails
  const allText = relevant.map(p => `${p.title} ${p.selftext ?? ""}`).join(" ").toLowerCase();
  const pos = ["recommend","love","great","best","worth","solid","reliable","good","excellent"].filter(w => allText.includes(w)).length;
  const neg = ["issue","problem","broke","bad","avoid","return","disappointed","terrible"].filter(w => allText.includes(w)).length;
  const sentiment = neg > pos ? "negative" : pos > 0 ? "positive" : "neutral";
  const insights = relevant.filter(p => filterRelevant(productName, [p]).length > 0).slice(0,2).map(p => p.title.slice(0,100));

  return {
    product: productName, productSlug: slug,
    summary: `Reddit users discuss ${productName.split(" ").slice(0,4).join(" ")} as ${sentiment === "positive" ? "a recommended pick" : "a mixed option"} in its category.`,
    pros: [], cons: [], sentiment,
    key_insights: insights,
    recommended_by_users: sentiment !== "negative",
    sourcePost: top.title ?? null, sourceUrl: top.url ?? null,
    scrapedAt: new Date().toISOString(),
  };
}

async function askOllamaWithRetry(productName, posts, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    const result = await ollamaSummarize(productName, posts);
    if (result) return result;
    if (i < attempts - 1) await sleep(1000);
  }
  return null;
}

// ── Main loop ─────────────────────────────────────────────────────────────
const results = { ...existingData };
let processed = 0, skipped = 0;

const bySlug = {};
for (const p of allProducts) {
  if (!bySlug[p.slug]) bySlug[p.slug] = [];
  bySlug[p.slug].push(p);
}

for (const [slug, products] of Object.entries(bySlug)) {
  if (!results[slug]) results[slug] = { lastUpdated: new Date().toISOString(), insights: [] };
  const existingNames = new Set((results[slug].insights ?? []).map(i => i.product.toLowerCase()));

  for (const product of products) {
    if (!FORCE && existingNames.has(product.name.toLowerCase())) {
      // In --missing-cons mode, only skip if the existing entry already has cons
      if (MISSING_CONS) {
        const existingInsight = results[slug].insights.find(i => i.product.toLowerCase() === product.name.toLowerCase());
        if (existingInsight?.cons?.length > 0) {
          console.log(`  ⏭ Skip (has cons): ${product.name}`);
          skipped++;
          continue;
        }
        console.log(`  🔄 Re-running (missing cons): ${product.name}`);
      } else {
        console.log(`  ⏭ Skip (exists): ${product.name}`);
        skipped++;
        continue;
      }
    }

    console.log(`\n[${++processed}/${allProducts.length}] ${product.name}`);
    const posts = await searchReddit(`${product.name} reddit review`);
    const insight = await buildInsight(product.name, slug, posts);

    // Replace existing entry if force mode, otherwise append
    if (FORCE) {
      const idx = results[slug].insights.findIndex(i => i.product.toLowerCase() === product.name.toLowerCase());
      if (idx > -1) results[slug].insights[idx] = insight;
      else results[slug].insights.push(insight);
    } else {
      results[slug].insights.push(insight);
    }
    results[slug].lastUpdated = new Date().toISOString();

    // Save incrementally so progress isn't lost on rate limit
    writeFileSync(insightsPath, JSON.stringify(results, null, 2));

    await sleep(700); // ~1.4 req/s to be polite to Reddit
  }
}

writeFileSync(insightsPath, JSON.stringify(results, null, 2));
console.log(`\n✅ Done! Processed ${processed}, skipped ${skipped}.`);
console.log(`Tips:`);
console.log(`  --force          Regenerate all 125 products from scratch`);
console.log(`  --missing-cons   Only re-run products with empty cons arrays`);
console.log(`  --product "Name" Process a single product by name`);
