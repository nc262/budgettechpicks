/**
 * Downloads Amazon product images for all ASINs and saves them locally.
 * Run once: node scripts/download-product-images.mjs
 * Also run by n8n whenever new products are added.
 */

import fs from "fs";
import path from "path";

const HEALTH_JSON = new URL("../src/data/product-health.json", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const OUT_DIR = new URL("../public/images/products", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.amazon.com/",
};

// Multiple URL patterns to try for each ASIN
function imageUrlCandidates(asin) {
  return [
    `https://m.media-amazon.com/images/P/${asin}.01._AC_SX300_SY300_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SL300_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SX200_QL70_.jpg`,
  ];
}

async function tryFetchImage(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 1000) return null; // too small = placeholder/error image
    return { buf, type };
  } catch {
    return null;
  }
}

async function downloadAsin(asin) {
  const outPath = path.join(OUT_DIR, `${asin}.jpg`);
  if (fs.existsSync(outPath)) {
    const size = fs.statSync(outPath).size;
    if (size > 1000) return { asin, status: "skipped (exists)" };
  }

  for (const url of imageUrlCandidates(asin)) {
    const result = await tryFetchImage(url);
    if (result) {
      fs.writeFileSync(outPath, Buffer.from(result.buf));
      return { asin, status: "downloaded", url };
    }
  }
  return { asin, status: "failed" };
}

async function main() {
  if (!fs.existsSync(HEALTH_JSON)) {
    console.error("product-health.json not found");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const health = JSON.parse(fs.readFileSync(HEALTH_JSON, "utf8"));
  const asins = Object.keys(health);
  console.log(`Downloading images for ${asins.length} ASINs...`);

  let downloaded = 0, skipped = 0, failed = 0;
  const failedAsins = [];

  // Process in batches of 5 to avoid hammering Amazon
  for (let i = 0; i < asins.length; i += 5) {
    const batch = asins.slice(i, i + 5);
    const results = await Promise.all(batch.map(downloadAsin));
    for (const r of results) {
      if (r.status.startsWith("downloaded")) { downloaded++; console.log(`  ✅ ${r.asin}`); }
      else if (r.status.startsWith("skipped")) { skipped++; }
      else { failed++; failedAsins.push(r.asin); console.log(`  ❌ ${r.asin}`); }
    }
    // Small delay between batches
    if (i + 5 < asins.length) await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);

  // Update product-health.json with local image paths
  let updated = 0;
  for (const asin of asins) {
    const localPath = path.join(OUT_DIR, `${asin}.jpg`);
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) {
      health[asin].imageUrl = `/images/products/${asin}.jpg`;
      health[asin].imageSource = "local";
      updated++;
    }
  }
  fs.writeFileSync(HEALTH_JSON, JSON.stringify(health, null, 2));
  console.log(`Updated product-health.json with ${updated} local image paths`);

  if (failedAsins.length > 0) {
    console.log(`\nFailed ASINs (will use emoji fallback):\n${failedAsins.join(", ")}`);
  }
}

main().catch(console.error);
