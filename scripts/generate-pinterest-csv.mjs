// Daily Pinterest bulk-upload CSV — drag the file into Pinterest's bulk pin creator each morning.
// Rotates through deep-reviewed products by day, mixes in live deals and fresh community picks.
// Output: C:\n8n-data\pinterest-queue\pins-YYYY-MM-DD.csv
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = "C:\\n8n-data\\pinterest-queue";
const SITE = "https://totaltechpicks.com";
const PINS_PER_DAY = 8;
const UTM = "utm_source=pinterest&utm_medium=pin&utm_campaign=daily";

// ── Load site data ───────────────────────────────────────────────────────────
const productsTs = readFileSync(join(ROOT, "src/data/products.ts"), "utf8");
const reviewsTs = readFileSync(join(ROOT, "src/data/reviews.ts"), "utf8");
const reviewedIds = new Set([...reviewsTs.matchAll(/^  "([a-z0-9-]+)": \{/gm)].map((m) => m[1]));

const productBlocks = [...productsTs.matchAll(
  /id:\s*"([^"]+)",\s*\n\s*name:\s*"(.+?)",\s*\n\s*asin:\s*"([A-Z0-9]{10})",\s*\n\s*price:\s*"([^"]*)"[\s\S]*?description:\s*"(.+?)",\s*\n[\s\S]*?category:\s*"([^"]+)",\s*\n\s*articleSlug:\s*"([^"]+)"/g
)].map((m) => ({
  id: m[1], name: m[2].replace(/\\"/g, '"'), asin: m[3], price: m[4],
  description: m[5].replace(/\\"/g, '"'), category: m[6], articleSlug: m[7],
}));

let health = {};
try { health = JSON.parse(readFileSync(join(ROOT, "src/data/product-health.json"), "utf8")); } catch {}
let radar = { deals: [] };
try { radar = JSON.parse(readFileSync(join(ROOT, "src/data/deal-radar.json"), "utf8")); } catch {}
let autoProducts = [];
try { autoProducts = JSON.parse(readFileSync(join(ROOT, "src/data/auto-products.json"), "utf8")); } catch {}

const isLive = (asin) => health[asin]?.isLive !== false;
function mediaUrl(asin) {
  if (existsSync(join(ROOT, "public/images/products", asin + ".jpg"))) return `${SITE}/images/products/${asin}.jpg`;
  return health[asin]?.imageUrl ?? `https://m.media-amazon.com/images/P/${asin}.01._SX500_QL70_.jpg`;
}

// ── Build today's pin set ────────────────────────────────────────────────────
const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);

const pins = [];
const usedAsins = new Set();

function addPin({ title, asin, board, description, link, keywords }) {
  if (usedAsins.has(asin) || pins.length >= PINS_PER_DAY) return;
  usedAsins.add(asin);
  pins.push({
    Title: title.slice(0, 95),
    "Media URL": mediaUrl(asin),
    "Pinterest board": board,
    Thumbnail: "",
    Description: description.slice(0, 480),
    Link: link,
    "Publish date": "",
    Keywords: keywords.slice(0, 8).join(", "),
  });
}

// 1) Up to 2 live deals (the highest-urgency content)
for (const d of (radar.deals || []).slice(0, 2)) {
  const p = productBlocks.find((x) => x.asin === d.asin);
  if (!p || !isLive(p.asin)) continue;
  addPin({
    title: `Deal Alert: ${p.name}`,
    asin: p.asin,
    board: p.category,
    description: `The community is talking about a deal on the ${p.name} right now. ${p.description} See our full take and check the current price.`,
    link: `${SITE}/${p.articleSlug}?${UTM}&utm_content=deal`,
    keywords: ["tech deals", p.category.toLowerCase(), "deal alert", ...p.name.toLowerCase().split(" ").slice(0, 3)],
  });
}

// 2) Newest community pick, if any
for (const a of autoProducts.slice(0, 1)) {
  if (!isLive(a.asin)) continue;
  addPin({
    title: `Reddit Found It First: ${a.name}`,
    asin: a.asin,
    board: "Community Picks",
    description: `${a.description || "Spotted in Reddit discussions and screened against Amazon ratings."} Rated ${a.rating ?? "highly"} by ${a.reviewCount?.toLocaleString() ?? "thousands of"} owners.`,
    link: `${SITE}/${a.articleSlug}?${UTM}&utm_content=community`,
    keywords: ["reddit finds", "tech finds", "community picks"],
  });
}

// 3) Fill with deep-reviewed products, rotating deterministically by day
const reviewed = productBlocks.filter((p) => reviewedIds.has(p.id) && isLive(p.asin));
for (let i = 0; i < reviewed.length && pins.length < PINS_PER_DAY; i++) {
  const p = reviewed[(dayOfYear * PINS_PER_DAY + i) % reviewed.length];
  addPin({
    title: `${p.name} — Honest Review`,
    asin: p.asin,
    board: p.category,
    description: `${p.description} Read our full hands-on take: why it wins, who it's for, and what to watch out for.`,
    link: `${SITE}/reviews/${p.id}?${UTM}&utm_content=review`,
    keywords: [p.category.toLowerCase(), "tech review", "best tech 2026", ...p.name.toLowerCase().split(" ").slice(0, 3)],
  });
}

// ── Write CSV ────────────────────────────────────────────────────────────────
const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const headers = ["Title", "Media URL", "Pinterest board", "Thumbnail", "Description", "Link", "Publish date", "Keywords"];
const csv = [headers.join(","), ...pins.map((p) => headers.map((h) => esc(p[h])).join(","))].join("\r\n");

mkdirSync(OUT_DIR, { recursive: true });
const outPath = join(OUT_DIR, `pins-${dateStr}.csv`);
writeFileSync(outPath, csv);

// Keep two weeks of history
for (const f of readdirSync(OUT_DIR).filter((f) => f.startsWith("pins-") && f.endsWith(".csv"))) {
  if (Date.now() - statSync(join(OUT_DIR, f)).mtimeMs > 14 * 86400000) unlinkSync(join(OUT_DIR, f));
}

console.log(`WROTE ${pins.length} pins -> ${outPath}`);
for (const p of pins) console.log(`  - [${p["Pinterest board"]}] ${p.Title}`);
