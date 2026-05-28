/**
 * Exports products data to public/products-for-pinterest.json
 * Used by the n8n Pinterest workflow to create pins.
 * Run: node scripts/export-pinterest-products.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SITE_URL = "https://totaltechpicks.com";
const AMAZON_TAG = "totaltechpicks-20";

// Category → Pinterest board name mapping
const CATEGORY_BOARDS = {
  "USB-C Hubs":          "Best USB-C Hubs & Docking Stations",
  "Webcams":             "Best Webcams for Work & Streaming",
  "Wireless Earbuds":    "Best Wireless Earbuds & ANC",
  "Desk Accessories":    "Desk Setup Accessories & Upgrades",
  "Gaming Gear":         "Gaming Gear & Peripherals",
  "Desk Toys & Fun":     "Cool Tech Gifts & Desk Toys",
  "Smart Home":          "Smart Home Tech & Automation",
  "Portable Tech":       "Portable Tech & Travel Gadgets",
  "Monitors & Displays": "Best PC Monitors & Displays",
  "Streaming Gear":      "Streaming & Content Creation Setup",
  "Audio & Microphones": "Best Headphones & Microphones",
  "Gaming Setups":       "Ultimate Gaming Setup Gear",
};

// Category → article slug mapping
const CATEGORY_SLUGS = {
  "USB-C Hubs":          "best-usb-c-hubs-under-50",
  "Webcams":             "best-budget-webcams",
  "Wireless Earbuds":    "wireless-earbuds",
  "Desk Accessories":    "desk-accessories",
  "Gaming Gear":         "gaming-gear",
  "Desk Toys & Fun":     "desk-toys",
  "Smart Home":          "smart-home-devices",
  "Portable Tech":       "portable-tech",
  "Monitors & Displays": "monitors",
  "Streaming Gear":      "streaming-gear",
  "Audio & Microphones": "audio-microphones",
  "Gaming Setups":       "gaming-setups",
};

// Parse products.ts manually (avoid TS compilation)
const productsTs = readFileSync(join(ROOT, "src/data/products.ts"), "utf8");

// Extract each product block
const productBlocks = productsTs.match(/\{[^{}]*id:\s*"[^"]+[^{}]*articleSlug:[^{}]*\}/gs) || [];

function extract(block, key) {
  const m = block.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  return m ? m[1] : null;
}

function extractArray(block, key) {
  const m = block.match(new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`));
  if (!m) return [];
  return m[1].match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) ?? [];
}

const products = productBlocks.map(block => {
  const name = extract(block, "name");
  const asin = extract(block, "asin");
  const price = extract(block, "price");
  const category = extract(block, "category");
  const description = extract(block, "description");
  const articleSlug = extract(block, "articleSlug");
  const badge = extract(block, "badge");
  const pros = extractArray(block, "pros");

  if (!name || !asin) return null;

  const board = CATEGORY_BOARDS[category] ?? "Best Tech Picks";
  const pageSlug = CATEGORY_SLUGS[category] ?? articleSlug;
  const pageUrl = `${SITE_URL}/${pageSlug}`;
  const imageUrl = `${SITE_URL}/images/products/${asin}.jpg`;
  const affiliateUrl = `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${AMAZON_TAG}`;

  // Pinterest pin description (max 500 chars)
  const topPros = pros.slice(0, 2).map(p => `✓ ${p}`).join("  ");
  const descriptionText = `${badge ? badge + " — " : ""}${description}${topPros ? "\n\n" + topPros : ""}\n\n💰 ${price} · See full review + Reddit community picks →`;

  return {
    name,
    asin,
    price,
    category,
    board,
    title: `${name} — ${price} | TotalTechPicks`,
    description: descriptionText.slice(0, 499),
    imageUrl,
    link: pageUrl,
    affiliateUrl,
    pinned: false,
  };
}).filter(Boolean);

// Group by board for easy reference
const byBoard = {};
for (const p of products) {
  if (!byBoard[p.board]) byBoard[p.board] = [];
  byBoard[p.board].push(p);
}

const output = {
  generatedAt: new Date().toISOString(),
  siteUrl: SITE_URL,
  totalProducts: products.length,
  boards: Object.keys(CATEGORY_BOARDS).map(cat => ({
    name: CATEGORY_BOARDS[cat],
    category: cat,
    description: `Curated picks with real Reddit community feedback. Updated monthly.`,
    products: byBoard[CATEGORY_BOARDS[cat]] ?? [],
  })),
};

const outPath = join(ROOT, "public/products-for-pinterest.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`✅ Exported ${products.length} products to public/products-for-pinterest.json`);
console.log(`   Boards: ${output.boards.map(b => `${b.name} (${b.products.length})`).join(", ")}`);
