/**
 * fix-via-google.mjs
 *
 * For the 15 remaining dead ASINs, searches Google for
 * "site:amazon.com PRODUCT NAME" and extracts /dp/ASIN from
 * the Google result URLs. Much less bot-detection than
 * searching Amazon directly.
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

const nameByAsin = new Map();
for (const m of productsSource.matchAll(/name:\s*"([^"]+)"[\s\S]{0,200}?asin:\s*"([A-Z0-9]{10})"/g)) {
  if (!nameByAsin.has(m[2])) nameByAsin.set(m[2], m[1]);
}

const deadAsins = Object.entries(health)
  .filter(([, v]) => v.isLive === false)
  .map(([asin]) => asin);

console.log(`\n🔧 ${deadAsins.length} dead ASINs to fix via Google search\n`);
if (deadAsins.length === 0) { console.log('Nothing to do!'); process.exit(0); }

async function isLiveAsin(asin) {
  try {
    const r = await fetch(`https://m.media-amazon.com/images/P/${asin}.01._SX300_QL70_.jpg`, {
      method: 'HEAD', signal: AbortSignal.timeout(6000)
    });
    const ct = r.headers.get('content-type') || '';
    const cl = parseInt(r.headers.get('content-length') || '0');
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

const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  slowMo: 300,
  args: ['--start-maximized', '--foreground'],
});

const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  viewport: null,
});

const page = await ctx.newPage();

// Accept Google cookies/consent if needed
await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

// Dismiss any consent dialogs
try {
  const consent = page.locator('button:has-text("Accept all"), button:has-text("I agree"), [aria-label="Accept all"]');
  if (await consent.first().isVisible({ timeout: 2000 })) {
    await consent.first().click();
    await page.waitForTimeout(1000);
  }
} catch {}

console.log('✅ Starting Google ASIN search...\n');

const fixes = [];
const failed = [];

for (let i = 0; i < deadAsins.length; i++) {
  const oldAsin = deadAsins[i];
  const name = nameByAsin.get(oldAsin) || 'Unknown Product';

  process.stdout.write(`[${i + 1}/${deadAsins.length}] ${name.slice(0, 50).padEnd(52)}... `);

  let newAsin = null;

  try {
    // Search Google for Amazon product page
    const query = `site:amazon.com/dp "${name}"`;
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded', timeout: 15000
    });
    await page.waitForTimeout(1200 + Math.random() * 800);

    // Extract all /dp/ links from Google results
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(h => h.includes('amazon.com') && h.includes('/dp/'));
    });

    for (const link of links.slice(0, 10)) {
      const asin = extractAsin(link);
      if (!asin || asin === oldAsin) continue;
      if (await isLiveAsin(asin)) {
        newAsin = asin;
        break;
      }
    }

    // Fallback: search without quotes + try clicking first result
    if (!newAsin) {
      const query2 = `amazon.com ${name} buy`;
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query2)}`, {
        waitUntil: 'domcontentloaded', timeout: 15000
      });
      await page.waitForTimeout(1200 + Math.random() * 800);

      const links2 = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(h => h.includes('amazon.com') && h.includes('/dp/'));
      });

      for (const link of links2.slice(0, 10)) {
        const asin = extractAsin(link);
        if (!asin || asin === oldAsin) continue;
        if (await isLiveAsin(asin)) {
          newAsin = asin;
          break;
        }
      }
    }
  } catch (err) {
    // continue
  }

  if (newAsin) {
    console.log(`✅ ${oldAsin} → ${newAsin}`);
    fixes.push({ oldAsin, newAsin, name });
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
    console.log(`❌ no match`);
    failed.push({ oldAsin, name });
  }

  if ((i + 1) % 5 === 0) { save(); console.log(`  💾 Saved\n`); }
  await page.waitForTimeout(1500 + Math.random() * 1500);
}

save();
await browser.close();

console.log('\n═══════════════════════════════');
console.log(`✅ Fixed:  ${fixes.length} / ${deadAsins.length}`);
console.log(`❌ Failed: ${failed.length}`);
console.log('═══════════════════════════════\n');

if (failed.length > 0) {
  console.log('Truly unresolvable (consider replacing these products):');
  for (const { oldAsin, name } of failed) {
    console.log(`  ${oldAsin}  ${name}`);
  }
}
console.log('\nRun: npm run build && git add -A && git commit -m "fix: final dead ASINs" && git push\n');
