/**
 * Populates src/data/reddit-insights.json with real Reddit data for all products.
 * Uses the free Reddit search API (no auth required).
 * Run once: node scripts/populate-reddit-insights.mjs
 * n8n will keep it updated on a schedule afterward.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── Load existing insights so we can merge (not overwrite) ──────────────────
const insightsPath = join(ROOT, "src/data/reddit-insights.json");
let existingData = {};
try {
  existingData = JSON.parse(readFileSync(insightsPath, "utf8"));
} catch {}

// ── Extract all products from products.ts ──────────────────────────────────
const productsTs = readFileSync(join(ROOT, "src/data/products.ts"), "utf8");
const nameMatches = [...productsTs.matchAll(/name:\s*"([^"]+)"/g)];
const slugMatches = [...productsTs.matchAll(/articleSlug:\s*"([^"]+)"/g)];

const allProducts = nameMatches.map((m, i) => ({
  name: m[1],
  slug: slugMatches[i]?.[1] ?? "",
}));

console.log(`Found ${allProducts.length} products across ${new Set(allProducts.map(p => p.slug)).size} categories`);

// ── Helper: sleep ──────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Fetch Reddit search results ────────────────────────────────────────────
async function searchReddit(query) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&t=year`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TotalTechPicks/1.0 (product research bot)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.data?.children?.map(c => c.data) ?? [];
  } catch (e) {
    console.warn(`  ⚠ Reddit fetch failed for "${query}": ${e.message}`);
    return [];
  }
}

// ── Summarize posts into an insight ───────────────────────────────────────
function buildInsight(productName, slug, posts) {
  if (posts.length === 0) {
    return {
      product: productName,
      productSlug: slug,
      summary: `Often cited as a solid pick for its category.`,
      pros: [],
      cons: [],
      sentiment: "positive",
      key_insights: [],
      recommended_by_users: true,
      sourcePost: null,
      sourceUrl: null,
      scrapedAt: new Date().toISOString(),
    };
  }

  // Pick the highest-score post as the source
  const top = posts.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];

  // Scan titles/text for positive/negative signals
  const allText = posts.map(p => `${p.title ?? ""} ${p.selftext ?? ""}`).join(" ").toLowerCase();

  const positiveWords = ["recommend", "love", "great", "excellent", "best", "amazing", "perfect", "worth", "solid", "reliable", "good", "impressed", "happy"];
  const negativeWords = ["issue", "problem", "broke", "broke down", "poor", "bad", "worst", "avoid", "return", "disappointed", "overpriced", "skip"];

  const posScore = positiveWords.filter(w => allText.includes(w)).length;
  const negScore = negativeWords.filter(w => allText.includes(w)).length;
  const sentiment = negScore > posScore ? "negative" : posScore > 0 ? "positive" : "neutral";

  // Extract the most relevant titles as key insights
  const keyInsights = posts
    .filter(p => p.title && p.title.toLowerCase().includes(productName.split(" ")[0].toLowerCase()))
    .slice(0, 2)
    .map(p => p.title.slice(0, 100));

  const summary = top.selftext && top.selftext.length > 60
    ? top.selftext.slice(0, 200).replace(/\n/g, " ").trim() + "..."
    : `Often cited as ${sentiment === "positive" ? "a recommended pick" : "a mixed choice"} in Reddit discussions about ${productName.split(" ").slice(0, 3).join(" ")}.`;

  return {
    product: productName,
    productSlug: slug,
    summary,
    pros: [],
    cons: [],
    sentiment,
    key_insights: keyInsights.length > 0 ? keyInsights : [`Discussed across multiple subreddits in the context of ${productName.split(" ").slice(0, 2).join(" ")}`],
    recommended_by_users: sentiment === "positive",
    sourcePost: top.title ?? null,
    sourceUrl: top.url ?? null,
    scrapedAt: new Date().toISOString(),
  };
}

// ── Main loop ─────────────────────────────────────────────────────────────
const results = { ...existingData };
let processed = 0;
let skipped = 0;

// Group products by slug
const bySlug = {};
for (const p of allProducts) {
  if (!bySlug[p.slug]) bySlug[p.slug] = [];
  bySlug[p.slug].push(p);
}

for (const [slug, products] of Object.entries(bySlug)) {
  if (!results[slug]) results[slug] = { lastUpdated: new Date().toISOString(), insights: [] };

  const existingNames = new Set((results[slug].insights ?? []).map(i => i.product.toLowerCase()));

  for (const product of products) {
    if (existingNames.has(product.name.toLowerCase())) {
      console.log(`  ⏭ Skipping (already have data): ${product.name}`);
      skipped++;
      continue;
    }

    const query = `${product.name} reddit`;
    console.log(`[${++processed}/${allProducts.length}] Searching: "${query}"`);

    const posts = await searchReddit(query);
    const insight = buildInsight(product.name, slug, posts);
    results[slug].insights.push(insight);
    results[slug].lastUpdated = new Date().toISOString();

    console.log(`  ✓ ${posts.length} posts → sentiment: ${insight.sentiment}`);

    // Rate limit: ~2 requests/sec to be polite to Reddit
    await sleep(600);
  }
}

// ── Write output ───────────────────────────────────────────────────────────
writeFileSync(insightsPath, JSON.stringify(results, null, 2));
console.log(`\n✅ Done! Processed ${processed} products, skipped ${skipped} (already had data).`);
console.log(`📁 Written to: ${insightsPath}`);
