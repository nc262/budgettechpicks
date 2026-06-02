/**
 * get-affiliate-asins.mjs
 *
 * Opens a real Chrome browser, lets you log into Amazon once,
 * then automatically searches for every dead product, grabs the
 * first valid ASIN from the product page URL, and updates
 * products.ts + product-health.json.
 *
 * Usage:
 *   node scripts/get-affiliate-asins.mjs
 *
 * What happens:
 *   1. Browser opens Amazon — log in if needed (you have 60s)
 *   2. Script iterates all dead ASINs, searches each product name
 *   3. Clicks the first result, extracts ASIN from /dp/XXXX/ URL
 *   4. Saves progress every 10 products
 *   5. Prints a final report of fixes + any failures
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TAG = 'totaltechpicks-20';

// ── Load data ────────────────────────────────────────────────────────────────
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
if (deadAsins.length === 0) {
  console.log('Nothing to do!');
  process.exit(0);
}

// ── Browser setup ────────────────────────────────────────────────────────────
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',      // use your real installed Chrome, not Playwright's Chromium
  slowMo: 300,
  args: ['--start-maximized', '--foreground'],
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: null,
});

const page = await context.newPage();

// ── Step 1: Let user log in ──────────────────────────────────────────────────
console.log('🌐 Opening Amazon...');
console.log('   Log in if needed. Script starts in 60 seconds automatically.\n');
await page.goto('https://www.amazon.com', { waitUntil: 'domcontentloaded' });

// Wait up to 60s for user to log in (or skip if already logged in)
await page.waitForTimeout(5000);

const isLoggedIn = await page.locator('#nav-link-accountList-nav-line-1').textContent()
  .then(t => !t.toLowerCase().includes('sign in'))
  .catch(() => false);

if (!isLoggedIn) {
  console.log('   Waiting up to 90s for you to log in...');
  await page.waitForTimeout(85000);
}

console.log('✅ Starting ASIN hunt...\n');

// ── Helper: extract ASIN from URL ────────────────────────────────────────────
function extractAsin(url) {
  const m = url.match(/\/dp\/([A-Z0-9]{10})/);
  return m ? m[1] : null;
}

// Known bad ASINs that appear as ads on every page - never use these
const BLACKLIST = new Set(['B00569GU18']);

// ── Helper: verify ASIN via image CDN ────────────────────────────────────────
async function isLiveAsin(asin) {
  if (BLACKLIST.has(asin)) return false;
  try {
    const res = await fetch(`https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`, {
      method: 'HEAD', signal: AbortSignal.timeout(5000),
    });
    const ct = res.headers.get('content-type') ?? '';
    const cl = parseInt(res.headers.get('content-length') ?? '0');
    return ct.includes('jpeg') || cl > 200;
  } catch { return false; }
}

// ── Helper: save progress ────────────────────────────────────────────────────
function save() {
  writeFileSync(join(ROOT, 'src/data/products.ts'), productsSource);
  writeFileSync(join(ROOT, 'src/data/product-health.json'), JSON.stringify(health, null, 2));
}

// ── Step 2: Process each dead ASIN ──────────────────────────────────────────
const fixes = [];
const failed = [];

for (let i = 0; i < deadAsins.length; i++) {
  const oldAsin = deadAsins[i];
  const name = nameByAsin.get(oldAsin) || 'Unknown Product';
  
  process.stdout.write(`[${i + 1}/${deadAsins.length}] ${name.slice(0, 50).padEnd(52)}... `);

  try {
    // Search Amazon
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(name)}&tag=${TAG}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000 + Math.random() * 800);

    // Find first ORGANIC (non-sponsored) product result with a /dp/ link
    // Sponsored results have [data-component-type="sp-sponsored-result"] or "Sponsored" label
    const productLinks = await page.locator(
      '[data-component-type="s-search-result"]:not([data-component-type="sp-sponsored-result"]) h2 a'
    ).all();
    
    let newAsin = null;
    let newUrl = null;

    // Try clicking the first few results to find a live one
    for (const link of productLinks.slice(0, 4)) {
      try {
        const href = await link.getAttribute('href');
        if (!href) continue;

        const asin = extractAsin(href) ||
          extractAsin(new URL(href, 'https://www.amazon.com').pathname);

        // Check data-asin attribute from parent
        const dataAsin = await link.locator('..').locator('..').locator('..').locator('..').locator('..').getAttribute('data-asin').catch(() => null);
        const candidateAsin = asin || dataAsin;

        if (candidateAsin === oldAsin || BLACKLIST.has(candidateAsin)) continue;

        // Quick image check
        if (await isLiveAsin(candidateAsin)) {
          newAsin = candidateAsin;
          newUrl = `https://www.amazon.com/dp/${candidateAsin}?tag=${TAG}`;
          break;
        }
      } catch { continue; }
    }

    // Fallback: scrape data-asin from ORGANIC search results only
    if (!newAsin) {
      const dataAsins = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(
          '[data-component-type="s-search-result"]:not([data-component-type="sp-sponsored-result"]) [data-asin]'
        ))
          .map(el => el.getAttribute('data-asin'))
          .filter(a => a && a.length === 10);
      });
      
      for (const candidate of [...new Set(dataAsins)].slice(0, 5)) {
        if (candidate === oldAsin || BLACKLIST.has(candidate)) continue;
        if (await isLiveAsin(candidate)) {
          newAsin = candidate;
          newUrl = `https://www.amazon.com/dp/${candidate}?tag=${TAG}`;
          break;
        }
      }
    }

    if (newAsin) {
      console.log(`✅ ${oldAsin} → ${newAsin}`);
      fixes.push({ oldAsin, newAsin, name });

      // Update products.ts
      productsSource = productsSource.replace(
        new RegExp(`(asin:\\s*")${oldAsin}(")`,'g'),
        `$1${newAsin}$2`
      );

      // Update health
      health[newAsin] = {
        imageUrl: `https://m.media-amazon.com/images/P/${newAsin}.01._SX300_QL70_.jpg`,
        isLive: true,
        checkedAt: new Date().toISOString(),
      };
      delete health[oldAsin];
    } else {
      console.log(`❌ no live replacement found`);
      failed.push({ oldAsin, name });
    }

  } catch (err) {
    console.log(`⚠️  error: ${err.message.slice(0, 60)}`);
    failed.push({ oldAsin, name, error: err.message });
  }

  // Save every 10
  if ((i + 1) % 10 === 0) {
    save();
    console.log(`  💾 Progress saved\n`);
  }

  // Random delay between 1.5-3s to avoid bot detection
  await page.waitForTimeout(1500 + Math.random() * 1500);
}

// ── Final save + report ──────────────────────────────────────────────────────
save();
await browser.close();

console.log('\n═══════════════════════════════════════════');
console.log(`✅ Fixed:  ${fixes.length} / ${deadAsins.length}`);
console.log(`❌ Failed: ${failed.length}`);
console.log('═══════════════════════════════════════════\n');

if (failed.length > 0) {
  console.log('Manual fixes needed:');
  for (const { oldAsin, name } of failed) {
    console.log(`  ${oldAsin}  →  ${name}`);
    console.log(`  https://www.amazon.com/s?k=${encodeURIComponent(name)}`);
  }
  console.log();
}

console.log('Run `npm run build` then `git add -A && git commit -m "fix: update dead ASINs via Playwright" && git push`\n');
