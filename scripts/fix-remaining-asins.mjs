/**
 * fix-remaining-asins.mjs
 *
 * Targeted fix for the 25 products that the automated script couldn't resolve.
 * Strategy:
 *  1. Use simplified search terms (strip specs in parens)
 *  2. Navigate to the product page and extract ASIN from the URL bar
 *  3. Try up to 5 results per search
 *  4. Longer waits to avoid bot detection
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TAG = 'totaltechpicks-20';

let health = JSON.parse(readFileSync(join(ROOT, 'src/data/product-health.json'), 'utf8'));
let productsSource = readFileSync(join(ROOT, 'src/data/products.ts'), 'utf8');

// Build name → asin map from products.ts
const nameByAsin = new Map();
for (const m of productsSource.matchAll(/name:\s*"([^"]+)"[\s\S]{0,200}?asin:\s*"([A-Z0-9]{10})"/g)) {
  if (!nameByAsin.has(m[2])) nameByAsin.set(m[2], m[1]);
}

const deadAsins = Object.entries(health)
  .filter(([, v]) => v.isLive === false)
  .map(([asin]) => asin);

console.log(`\n🔧 ${deadAsins.length} dead ASINs to fix\n`);
if (deadAsins.length === 0) { console.log('Nothing to do!'); process.exit(0); }

// Simplify search terms — strip parenthetical model numbers, resolution specs etc.
function simplifyName(name) {
  return name
    .replace(/\s*\([^)]*\)/g, '')   // remove (4K/60fps), (Remastered), (16GB, 2023) etc.
    .replace(/\s+\d+\.\d+ft\b/i, '') // remove 32.8ft
    .replace(/\s*—.*$/, '')          // remove "— Premium Felt" suffix
    .replace(/\s+\d+".*$/, '')        // remove 27" and trailing text
    .trim();
}

// Known bad ASINs
const BLACKLIST = new Set(['B00569GU18']);

async function isLiveAsin(asin) {
  if (BLACKLIST.has(asin)) return false;
  try {
    const res = await fetch(`https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`, {
      method: 'HEAD', signal: AbortSignal.timeout(6000),
    });
    const ct = res.headers.get('content-type') ?? '';
    const cl = parseInt(res.headers.get('content-length') ?? '0');
    return ct.includes('jpeg') || cl > 200;
  } catch { return false; }
}

function extractAsin(url) {
  const m = url.match(/\/dp\/([A-Z0-9]{10})/);
  return m ? m[1] : null;
}

function save() {
  writeFileSync(join(ROOT, 'src/data/products.ts'), productsSource);
  writeFileSync(join(ROOT, 'src/data/product-health.json'), JSON.stringify(health, null, 2));
}

// Browser
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  slowMo: 400,
  args: ['--start-maximized', '--foreground'],
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: null,
});

const page = await context.newPage();

console.log('🌐 Opening Amazon...');
console.log('   Log in if needed. Script starts in 60 seconds automatically.\n');
await page.goto('https://www.amazon.com', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);

const isLoggedIn = await page.locator('#nav-link-accountList-nav-line-1').textContent()
  .then(t => !t.toLowerCase().includes('sign in'))
  .catch(() => false);

if (!isLoggedIn) {
  console.log('   Waiting up to 90s for you to log in...');
  await page.waitForTimeout(85000);
}

console.log('✅ Starting ASIN hunt...\n');

const fixes = [];
const failed = [];

for (let i = 0; i < deadAsins.length; i++) {
  const oldAsin = deadAsins[i];
  const fullName = nameByAsin.get(oldAsin) || 'Unknown Product';
  const shortName = simplifyName(fullName);
  
  process.stdout.write(`[${i + 1}/${deadAsins.length}] ${fullName.slice(0, 50).padEnd(52)}... `);

  let newAsin = null;

  // Try two search strategies: simplified name, then brand only
  const searchTerms = [shortName, fullName];

  for (const term of searchTerms) {
    if (newAsin) break;
    try {
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${TAG}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500 + Math.random() * 1000);

      // Strategy 1: Click through to product page and get ASIN from URL
      const productLinks = await page.locator(
        '[data-component-type="s-search-result"]:not([data-component-type="sp-sponsored-result"]) h2 a'
      ).all();

      for (const link of productLinks.slice(0, 5)) {
        if (newAsin) break;
        try {
          const href = await link.getAttribute('href');
          if (!href) continue;

          // Try extracting from href directly first (fastest)
          let candidate = extractAsin(href);

          // If not in href, get data-asin from the result card
          if (!candidate) {
            candidate = await link.evaluate(el => {
              let node = el;
              for (let j = 0; j < 8; j++) {
                node = node.parentElement;
                if (!node) break;
                const a = node.getAttribute('data-asin');
                if (a && a.length === 10) return a;
              }
              return null;
            });
          }

          if (!candidate || candidate === oldAsin || BLACKLIST.has(candidate)) continue;

          // Navigate to product page for definitive ASIN
          const productPage = await context.newPage();
          try {
            await productPage.goto(`https://www.amazon.com${href.startsWith('/') ? href : '/' + href}`, {
              waitUntil: 'domcontentloaded', timeout: 15000
            });
            await productPage.waitForTimeout(1000);
            const finalUrl = productPage.url();
            const urlAsin = extractAsin(finalUrl) || candidate;
            if (urlAsin && urlAsin !== oldAsin && !BLACKLIST.has(urlAsin)) {
              if (await isLiveAsin(urlAsin)) {
                newAsin = urlAsin;
              }
            }
          } finally {
            await productPage.close();
          }
        } catch { continue; }
      }

      // Strategy 2: data-asin fallback from search page
      if (!newAsin) {
        const candidates = await page.evaluate(() =>
          Array.from(document.querySelectorAll(
            '[data-component-type="s-search-result"]:not([data-component-type="sp-sponsored-result"]) [data-asin]'
          )).map(el => el.getAttribute('data-asin')).filter(a => a && a.length === 10)
        );

        for (const c of [...new Set(candidates)].slice(0, 6)) {
          if (c === oldAsin || BLACKLIST.has(c)) continue;
          if (await isLiveAsin(c)) { newAsin = c; break; }
        }
      }
    } catch (err) {
      // continue to next search term
    }
  }

  if (newAsin) {
    console.log(`✅ ${oldAsin} → ${newAsin}`);
    fixes.push({ oldAsin, newAsin, name: fullName });

    productsSource = productsSource.replace(
      new RegExp(`(asin:\\s*")${oldAsin}(")`,'g'),
      `$1${newAsin}$2`
    );
    health[newAsin] = {
      imageUrl: `https://m.media-amazon.com/images/P/${newAsin}.01._SX300_QL70_.jpg`,
      isLive: true,
      checkedAt: new Date().toISOString(),
    };
    delete health[oldAsin];
  } else {
    console.log(`❌ no live replacement found`);
    failed.push({ oldAsin, name: fullName });
  }

  if ((i + 1) % 5 === 0) {
    save();
    console.log(`  💾 Progress saved\n`);
  }

  await page.waitForTimeout(2000 + Math.random() * 2000);
}

save();
await browser.close();

console.log('\n═══════════════════════════════════════════');
console.log(`✅ Fixed:  ${fixes.length} / ${deadAsins.length}`);
console.log(`❌ Failed: ${failed.length}`);
console.log('═══════════════════════════════════════════\n');

if (failed.length > 0) {
  console.log('Still need manual fixes:');
  for (const { oldAsin, name } of failed) {
    console.log(`  ${oldAsin}  →  ${name}`);
    console.log(`  https://www.amazon.com/s?k=${encodeURIComponent(name)}`);
  }
}

console.log('\nRun: npm run build && git add -A && git commit -m "fix: remaining dead ASINs" && git push\n');
