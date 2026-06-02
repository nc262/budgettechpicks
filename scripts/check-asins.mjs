/**
 * check-asins.mjs
 * 
 * Checks every ASIN in products.ts against Amazon to find dead listings.
 * Updates product-health.json with real isLive status.
 * 
 * Usage: node scripts/check-asins.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Extract ASINs from products.ts ──────────────────────────────────────────
const productsSource = readFileSync(join(ROOT, 'src/data/products.ts'), 'utf8');
const asinMatches = [...productsSource.matchAll(/asin:\s*"([A-Z0-9]{10})"/g)];
const nameMap = new Map(); // asin → name

// Also extract names so we can log what product each ASIN is
const productBlocks = productsSource.matchAll(/name:\s*"([^"]+)"[\s\S]*?asin:\s*"([A-Z0-9]{10})"/g);
for (const m of productBlocks) {
  nameMap.set(m[2], m[1]);
}

const asins = [...new Set(asinMatches.map(m => m[1]))];
console.log(`🔍 Checking ${asins.length} ASINs...\n`);

// ── Load existing health data ────────────────────────────────────────────────
let health = {};
try {
  health = JSON.parse(readFileSync(join(ROOT, 'src/data/product-health.json'), 'utf8'));
} catch {}

// ── Check each ASIN ──────────────────────────────────────────────────────────
// Use image CDN check — much more reliable than scraping pages
// Dead ASINs return a 43-byte transparent GIF placeholder
// Live ASINs return a real JPEG product image
const DELAY_MS = 300; // image CDN is fast and doesn't rate limit like the main site
const TAG = 'totaltechpicks-20';

const results = { live: [], dead: [], error: [] };

async function checkAsin(asin) {
  const url = `https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
    });

    const contentType = res.headers.get('content-type') ?? '';
    const contentLength = parseInt(res.headers.get('content-length') ?? '0', 10);

    // Dead ASIN: Amazon returns a 43-byte transparent GIF placeholder
    if (contentType.includes('gif') || contentLength < 200) {
      return { asin, isLive: false, status: res.status };
    }

    // Real product image = live
    if (contentType.includes('jpeg') || contentType.includes('jpg') || contentLength > 500) {
      return { asin, isLive: true, status: res.status };
    }

    return { asin, isLive: null, status: res.status };
  } catch (err) {
    return { asin, isLive: null, error: err.message };
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Main loop ────────────────────────────────────────────────────────────────
for (let i = 0; i < asins.length; i++) {
  const asin = asins[i];
  const name = nameMap.get(asin) || 'Unknown';
  process.stdout.write(`[${i + 1}/${asins.length}] ${asin} (${name.slice(0, 40)})... `);

  const result = await checkAsin(asin);
  const now = new Date().toISOString();

  if (result.isLive === true) {
    console.log('✅ LIVE');
    results.live.push(asin);
    health[asin] = {
      ...health[asin],
      imageUrl: health[asin]?.imageUrl ?? `https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`,
      isLive: true,
      checkedAt: now,
    };
  } else if (result.isLive === false) {
    console.log('❌ DEAD');
    results.dead.push({ asin, name });
    health[asin] = {
      ...health[asin],
      imageUrl: health[asin]?.imageUrl ?? `https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`,
      isLive: false,
      checkedAt: now,
    };
  } else if (result.error) {
    console.log(`⚠️  ERROR: ${result.error}`);
    results.error.push({ asin, error: result.error });
    // Don't overwrite existing health data on error
  } else {
    console.log(`❓ UNKNOWN (status ${result.status}) — keeping as-is`);
    results.error.push({ asin, error: `unknown status ${result.status}` });
  }

  // Save progress after every 10 ASINs
  if ((i + 1) % 10 === 0) {
    writeFileSync(join(ROOT, 'src/data/product-health.json'), JSON.stringify(health, null, 2));
    console.log(`  💾 Progress saved (${i + 1} checked)\n`);
  }

  if (i < asins.length - 1) await sleep(DELAY_MS);
}

// ── Final save ───────────────────────────────────────────────────────────────
writeFileSync(join(ROOT, 'src/data/product-health.json'), JSON.stringify(health, null, 2));

console.log('\n═══════════════════════════════════════');
console.log(`✅ Live:    ${results.live.length}`);
console.log(`❌ Dead:    ${results.dead.length}`);
console.log(`⚠️  Unknown: ${results.error.length}`);
console.log('═══════════════════════════════════════\n');

if (results.dead.length > 0) {
  console.log('🔧 DEAD PRODUCTS (need new ASINs):');
  for (const { asin, name } of results.dead) {
    console.log(`   ${asin}  →  ${name}`);
    console.log(`   Search: https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${TAG}`);
  }
  console.log('\nFor each dead ASIN, find the replacement on Amazon and update products.ts.');
  console.log('Dead products will automatically fall back to search URLs until updated.\n');
}
