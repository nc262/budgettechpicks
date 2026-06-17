// Resolves HIGH-RES product images for Pinterest pins and caches them in pin-cache-hd.
//
// Why this exists: the nightly health check stores Amazon's `P/<asin>` image URL, which
// is capped at ~300px (2-5KB) — fine for the site's small cards, blurry when a pin draws
// it onto a 660px card. The real high-res image lives at the `I/<imageId>` path, which is
// only obtainable by reading the product card off an Amazon search page. This script does
// that (reusing discover-products.mjs's proven chrome-channel Playwright access), upsizes
// the image token to _SL1500_, and downloads the full-res JPEG into the pin cache that
// generate-pin-images.mjs reads first.
//
// Sources, cheapest first:
//   1. pin-cache-hd/<asin>.jpg already present (skip unless --force)
//   2. auto-products.json `I/` URL (discovered products already carry the real image id)
//   3. Amazon search by ASIN -> img.s-image `I/` URL (Playwright)
//
// Flags: --all (every live catalog product; default) · --asins=A,B · --force · --limit=N
import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = "C:\\n8n-data\\pin-cache-hd";
const MIN_BYTES = 9000; // reject CDN placeholders / thumbnails
const FORCE = process.argv.includes("--force");
const asinArg = (process.argv.find((a) => a.startsWith("--asins=")) || "").split("=")[1];
const onlyAsins = asinArg ? new Set(asinArg.split(",").map((s) => s.trim())) : null;
const limit = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1]) || Infinity;

mkdirSync(CACHE, { recursive: true });
const log = (m) => console.log(m);

// ── Catalog ──────────────────────────────────────────────────────────────────
const productsTs = readFileSync(join(ROOT, "src/data/products.ts"), "utf8");
const products = [...productsTs.matchAll(
  /id:\s*"([^"]+)",\s*\n\s*name:\s*"(.+?)",\s*\n\s*asin:\s*"([A-Z0-9]{10})"/g
)].map((m) => ({ id: m[1], name: m[2].replace(/\\"/g, '"'), asin: m[3] }));

let health = {};
try { health = JSON.parse(readFileSync(join(ROOT, "src/data/product-health.json"), "utf8")); } catch {}
const isLive = (asin) => health[asin]?.isLive !== false;

let autoProducts = [];
try { autoProducts = JSON.parse(readFileSync(join(ROOT, "src/data/auto-products.json"), "utf8")); } catch {}
const autoImg = Object.fromEntries(autoProducts.filter((p) => p.imageUrl).map((p) => [p.asin, p.imageUrl]));

// Rewrite any Amazon image URL's size token up to a large variant.
function upsize(url) {
  if (!url || !url.startsWith("http")) return null;
  if (/\._[^/.]*_\.(jpg|jpeg|png)/i.test(url)) return url.replace(/\._[^/.]*_\.(jpg|jpeg|png)/i, "._SL1500_.$1");
  return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, "._SL1500_.$1");
}

async function download(url) {
  if (!url) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length >= MIN_BYTES ? buf : null;
  } catch { return null; }
}

const cachedOk = (asin) => existsSync(join(CACHE, asin + ".jpg")) && statSync(join(CACHE, asin + ".jpg")).size >= MIN_BYTES;

let selected = products.filter((p) => isLive(p.asin) && (onlyAsins ? onlyAsins.has(p.asin) : true));
if (!FORCE) selected = selected.filter((p) => !cachedOk(p.asin));
selected = selected.slice(0, limit);

log(`Resolving high-res images for ${selected.length} product(s)…`);

// ── Pass 1: seed from auto-products I/ URLs (no browser needed) ────────────────
const needBrowser = [];
let viaAuto = 0;
for (const p of selected) {
  const buf = await download(upsize(autoImg[p.asin]));
  if (buf) { writeFileSync(join(CACHE, p.asin + ".jpg"), buf); viaAuto++; continue; }
  needBrowser.push(p);
}
log(`  ${viaAuto} resolved from auto-products; ${needBrowser.length} need an Amazon lookup`);

// ── Pass 2: Amazon search by ASIN -> I/ image url (Playwright, sequential) ──────
let viaSearch = 0, failed = 0;
if (needBrowser.length) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--disable-blink-features=AutomationControlled"] });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "en-US" });
    for (const p of needBrowser) {
      const page = await ctx.newPage();
      try {
        await page.goto("https://www.amazon.com/s?k=" + encodeURIComponent(p.asin), { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForSelector("img.s-image", { timeout: 12000 });
        const src = await page.evaluate((asin) => {
          const exact = document.querySelector(`div[data-asin="${asin}"] img.s-image`);
          return (exact || document.querySelector('div[data-component-type="s-search-result"] img.s-image'))?.getAttribute("src") || null;
        }, p.asin);
        const buf = await download(upsize(src));
        if (buf) { writeFileSync(join(CACHE, p.asin + ".jpg"), buf); viaSearch++; log(`  ✓ ${p.asin}  ${(buf.length / 1024 | 0)}KB`); }
        else { failed++; log(`  ✗ ${p.asin} "${p.name}" — no high-res found`); }
      } catch (e) {
        failed++; log(`  ✗ ${p.asin} — ${e.message.split("\n")[0]}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

log(`DONE — ${viaAuto + viaSearch} cached (${viaAuto} auto, ${viaSearch} search), ${failed} unresolved -> ${CACHE}`);
