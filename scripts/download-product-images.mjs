/**
 * Downloads product images for all ASINs and saves them locally.
 *
 * Strategy (in order):
 *   1. Skip if local file already exists and is valid
 *   2. Try ~8 Amazon CDN URL patterns directly
 *   3. Try to scrape og:image from the Amazon product page
 *   4. If BING_API_KEY is set, search Bing Images for "{product name} amazon"
 *   5. Give up → product card shows emoji fallback
 *
 * Usage:
 *   node scripts/download-product-images.mjs
 *   BING_API_KEY=yourkey node scripts/download-product-images.mjs
 *   FORCE=1 node scripts/download-product-images.mjs   (re-download even existing)
 *
 * Get a free Bing key (1,000 calls/month):
 *   1. portal.azure.com → search "Bing Search v7" → Create → F1 (Free) tier
 *   2. Keys and Endpoint → copy Key 1
 *   3. Set as env var: BING_API_KEY=your_key
 */

import fs from "fs";
import path from "path";

const HEALTH_JSON = new URL("../src/data/product-health.json", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const PRODUCTS_SRC = new URL("../src/data/products.ts", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const OUT_DIR = new URL("../public/images/products", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const BING_KEY = process.env.BING_API_KEY ?? "";
const FORCE = process.env.FORCE === "1";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
};

const IMG_HEADERS = {
  ...BROWSER_HEADERS,
  Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
  Referer: "https://www.amazon.com/",
};

// Extract ASIN → product name map from products.ts source
function loadProductNames() {
  const src = fs.readFileSync(PRODUCTS_SRC, "utf8");
  const map = {};
  // Match pairs of name and asin fields (order in TS objects)
  const blocks = src.matchAll(/name:\s*"([^"]+)"[\s\S]*?asin:\s*"([A-Z0-9]+)"/g);
  for (const [, name, asin] of blocks) map[asin] = name;
  return map;
}

// All Amazon CDN patterns for a given ASIN
// NOTE: /images/P/{ASIN} is an old redirect, unreliable for newer ASINs.
// The real URLs are /images/I/{imageId} which we get from PA API.
// These patterns work for older catalog items.
function amazonCandidates(asin) {
  return [
    `https://m.media-amazon.com/images/P/${asin}.01._AC_SX300_SY300_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SL300_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SX200_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SX450_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._AC_SL300_.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01._SL500_.jpg`,
  ];
}

async function fetchBuf(url, headers, timeoutMs = 10000) {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 2000) return null; // real images are at least 2KB
    return buf;
  } catch {
    return null;
  }
}

// Try all Amazon CDN URL patterns
async function tryAmazonCdn(asin) {
  for (const url of amazonCandidates(asin)) {
    const buf = await fetchBuf(url, IMG_HEADERS);
    if (buf) return { buf, source: `amazon-cdn:${url}` };
  }
  return null;
}

// Scrape the Amazon product page and extract og:image
async function tryAmazonPageScrape(asin) {
  const url = `https://www.amazon.com/dp/${asin}`;
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const html = await res.text();

    // Try og:image first (most reliable)
    const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
                 ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    if (ogMatch) {
      const imgUrl = ogMatch[1].replace(/&amp;/g, "&");
      const buf = await fetchBuf(imgUrl, IMG_HEADERS);
      if (buf) return { buf, source: `amazon-page-og:${imgUrl}` };
    }

    // Try landingImage (main product image data attribute)
    const landingMatch = html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\.jpg)"/);
    if (landingMatch) {
      const buf = await fetchBuf(landingMatch[1], IMG_HEADERS);
      if (buf) return { buf, source: `amazon-page-hiRes:${landingMatch[1]}` };
    }

    const medMatch = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\.jpg)"/);
    if (medMatch) {
      const buf = await fetchBuf(medMatch[1], IMG_HEADERS);
      if (buf) return { buf, source: `amazon-page-large:${medMatch[1]}` };
    }
  } catch {
    // blocked or timeout
  }
  return null;
}

// Search Bing Images for "{product name} amazon" and download first result
async function tryBingImage(productName) {
  if (!BING_KEY) return null;
  try {
    const query = encodeURIComponent(`${productName} amazon product`);
    const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${query}&count=3&safeSearch=Off&imageType=Photo`;
    const res = await fetch(url, {
      headers: { "Ocp-Apim-Subscription-Key": BING_KEY },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.value ?? [];
    for (const img of results) {
      const imgUrl = img.contentUrl;
      if (!imgUrl) continue;
      const buf = await fetchBuf(imgUrl, IMG_HEADERS, 8000);
      if (buf) return { buf, source: `bing:${imgUrl}` };
    }
  } catch {
    // Bing error
  }
  return null;
}

async function downloadAsin(asin, productName) {
  const outPath = path.join(OUT_DIR, `${asin}.jpg`);
  if (!FORCE && fs.existsSync(outPath) && fs.statSync(outPath).size > 2000) {
    return { asin, status: "skipped" };
  }

  // 1. Amazon CDN
  let result = await tryAmazonCdn(asin);

  // 2. Amazon page scrape (gets real /images/I/ URL)
  if (!result) result = await tryAmazonPageScrape(asin);

  // 3. Bing Image Search fallback
  if (!result && productName) result = await tryBingImage(productName);

  if (result) {
    fs.writeFileSync(outPath, Buffer.from(result.buf));
    return { asin, status: "downloaded", source: result.source };
  }

  return { asin, status: "failed" };
}

async function main() {
  if (!fs.existsSync(HEALTH_JSON)) {
    console.error("product-health.json not found at", HEALTH_JSON);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const health = JSON.parse(fs.readFileSync(HEALTH_JSON, "utf8"));
  const productNames = loadProductNames();
  const asins = Object.keys(health);

  // Only process ASINs that don't have local images (unless FORCE=1)
  const toProcess = FORCE
    ? asins
    : asins.filter(a => !health[a].imageSource?.startsWith("local") ||
        !fs.existsSync(path.join(OUT_DIR, `${a}.jpg`)));

  console.log(`Processing ${toProcess.length}/${asins.length} ASINs...`);
  if (BING_KEY) console.log("  ✓ Bing Image Search enabled as fallback");
  else console.log("  ℹ  No BING_API_KEY set — Bing fallback disabled");

  let downloaded = 0, skipped = 0, failed = 0;
  const failedList = [];

  // Batches of 3 to avoid rate limits
  for (let i = 0; i < toProcess.length; i += 3) {
    const batch = toProcess.slice(i, i + 3);
    const results = await Promise.all(batch.map(a => downloadAsin(a, productNames[a])));
    for (const r of results) {
      if (r.status === "downloaded") {
        downloaded++;
        const src = r.source?.split(":")[0];
        console.log(`  ✅ ${r.asin}  [${src}]  ${productNames[r.asin] ?? ""}`);
      } else if (r.status === "skipped") {
        skipped++;
      } else {
        failed++;
        failedList.push(r.asin);
        console.log(`  ❌ ${r.asin}  ${productNames[r.asin] ?? ""}`);
      }
    }
    if (i + 3 < toProcess.length) await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);

  // Update product-health.json
  let updated = 0;
  for (const asin of asins) {
    const localPath = path.join(OUT_DIR, `${asin}.jpg`);
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 2000) {
      health[asin].imageUrl = `/images/products/${asin}.jpg`;
      health[asin].imageSource = "local";
      updated++;
    }
  }
  fs.writeFileSync(HEALTH_JSON, JSON.stringify(health, null, 2));
  console.log(`Updated product-health.json: ${updated} local paths`);

  if (failedList.length > 0) {
    console.log(`\n⚠ ${failedList.length} products still missing images (will show emoji):`);
    console.log(failedList.map(a => `  ${a}  ${productNames[a] ?? ""}`).join("\n"));
    if (!BING_KEY) {
      console.log("\n→ Re-run with BING_API_KEY=yourkey to fix these via Bing Image Search");
      console.log("  Free key: portal.azure.com → search 'Bing Search v7' → F1 (Free) tier");
    }
  }
}

main().catch(console.error);
