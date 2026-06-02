/**
 * fix-dead-asins.mjs
 * 
 * For each dead ASIN in product-health.json, searches Amazon for the product
 * name and extracts the first result's ASIN. Updates products.ts in place.
 * 
 * Usage: node scripts/fix-dead-asins.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Load data ────────────────────────────────────────────────────────────────
let health = JSON.parse(readFileSync(join(ROOT, 'src/data/product-health.json'), 'utf8'));
let productsSource = readFileSync(join(ROOT, 'src/data/products.ts'), 'utf8');

// Extract name → asin map from products.ts
const nameByAsin = new Map();
for (const m of productsSource.matchAll(/name:\s*"([^"]+)"[\s\S]*?asin:\s*"([A-Z0-9]{10})"/g)) {
  nameByAsin.set(m[2], m[1]);
}

const deadAsins = Object.entries(health)
  .filter(([, v]) => v.isLive === false)
  .map(([asin]) => asin);

console.log(`🔧 Fixing ${deadAsins.length} dead ASINs...\n`);

// ── Amazon search ASIN extraction ────────────────────────────────────────────
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function findReplacementAsin(productName) {
  const query = encodeURIComponent(productName.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim());
  const url = `https://www.amazon.com/s?k=${query}`;
  
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();
    
    // Extract data-asin from search results (first actual product result)
    const matches = [...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)];
    const asins = matches.map(m => m[1]).filter(a => a && a !== 'B000000000');
    
    if (asins.length === 0) return null;
    
    // Verify the first result is live via image CDN
    for (const candidate of asins.slice(0, 3)) {
      const imgRes = await fetch(`https://m.media-amazon.com/images/P/${candidate}.01._SX300_QL70_.jpg`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      
      if (imgRes) {
        const ct = imgRes.headers.get('content-type') ?? '';
        const cl = parseInt(imgRes.headers.get('content-length') ?? '0');
        if (ct.includes('jpeg') || cl > 200) return candidate;
      }
    }
    
    // Return first candidate even if image check inconclusive
    return asins[0];
  } catch (err) {
    return null;
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Fix each dead ASIN ───────────────────────────────────────────────────────
const fixes = [];
const failed = [];

for (let i = 0; i < deadAsins.length; i++) {
  const oldAsin = deadAsins[i];
  const name = nameByAsin.get(oldAsin) || 'Unknown';
  
  process.stdout.write(`[${i + 1}/${deadAsins.length}] ${oldAsin} (${name.slice(0, 40)})... `);
  
  const newAsin = await findReplacementAsin(name);
  
  if (newAsin && newAsin !== oldAsin) {
    console.log(`✅ → ${newAsin}`);
    fixes.push({ oldAsin, newAsin, name });
    
    // Update products.ts: replace old ASIN with new one
    productsSource = productsSource.replace(
      new RegExp(`asin:\\s*"${oldAsin}"`, 'g'),
      `asin: "${newAsin}"`
    );
    
    // Update health data
    health[newAsin] = {
      imageUrl: `https://m.media-amazon.com/images/P/${newAsin}.01._SX300_QL70_.jpg`,
      isLive: true,
      checkedAt: new Date().toISOString(),
    };
    delete health[oldAsin];
    
  } else if (newAsin === oldAsin) {
    console.log(`⚠️  same ASIN returned — skipping`);
    failed.push({ oldAsin, name, reason: 'same ASIN' });
  } else {
    console.log(`❌ no replacement found`);
    failed.push({ oldAsin, name, reason: 'not found' });
  }
  
  // Save progress every 10 fixes
  if ((i + 1) % 10 === 0) {
    writeFileSync(join(ROOT, 'src/data/products.ts'), productsSource);
    writeFileSync(join(ROOT, 'src/data/product-health.json'), JSON.stringify(health, null, 2));
    console.log(`  💾 Progress saved (${i + 1} processed)\n`);
  }
  
  await sleep(800);
}

// ── Final save ───────────────────────────────────────────────────────────────
writeFileSync(join(ROOT, 'src/data/products.ts'), productsSource);
writeFileSync(join(ROOT, 'src/data/product-health.json'), JSON.stringify(health, null, 2));

console.log('\n═══════════════════════════════════════');
console.log(`✅ Fixed:  ${fixes.length}`);
console.log(`❌ Failed: ${failed.length}`);
console.log('═══════════════════════════════════════\n');

if (failed.length > 0) {
  console.log('⚠️  Manual fixes needed:');
  for (const { oldAsin, name, reason } of failed) {
    console.log(`  ${oldAsin}  ${name}  (${reason})`);
    console.log(`  → https://www.amazon.com/s?k=${encodeURIComponent(name)}`);
  }
}

console.log('\n✅ products.ts and product-health.json updated.');
console.log('Run `npm run build` to verify no TypeScript errors.\n');
