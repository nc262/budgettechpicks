// Post-build verification: links, structured data, affiliate tags, sitemap, assets.
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OUT = 'out';
let failures = 0;
const fail = (msg) => { failures++; console.log('  ❌ ' + msg); };
const ok = (msg) => console.log('  ✅ ' + msg);

// Collect all generated HTML pages
function htmlFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
const pages = htmlFiles(OUT);
console.log(`\n── Pages (${pages.length} HTML files) ──`);

// Build set of valid internal routes
const routes = new Set(['/']);
for (const p of pages) {
  const rel = p.replace(/\\/g, '/').replace(/^out/, '').replace(/index\.html$/, '').replace(/\.html$/, '');
  routes.add(rel === '' ? '/' : rel);
  if (rel.endsWith('/') && rel !== '/') routes.add(rel.slice(0, -1));
}

// 1. Internal links resolve
console.log('\n── Internal links ──');
let badLinks = 0, totalLinks = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = m[1];
    if (href.startsWith('/_next') || href.startsWith('/images') || /\.(png|ico|xml|txt|json|jpg)$/.test(href)) continue;
    totalLinks++;
    const norm = href.endsWith('/') ? href : href + '/';
    if (!routes.has(href) && !routes.has(norm) && !routes.has(href.replace(/\/$/, ''))) {
      badLinks++;
      fail(`${p.replace(/\\/g, '/')} → broken internal link: ${href}`);
    }
  }
}
if (badLinks === 0) ok(`all ${totalLinks} internal links resolve`);

// 2. JSON-LD validity
console.log('\n── Structured data ──');
let ldCount = 0, ldBad = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    ldCount++;
    try { JSON.parse(m[1]); } catch (e) { ldBad++; fail(`${p}: invalid JSON-LD (${e.message})`); }
  }
}
if (ldBad === 0) ok(`${ldCount} JSON-LD blocks all parse`);

// 3. Affiliate tags on Amazon links
console.log('\n── Affiliate links ──');
let amzn = 0, untagged = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(https:\/\/www\.amazon\.com[^"]*)"/g)) {
    if (m[1].includes('/gp/help/')) continue; // documentation links shouldn't be tagged
    amzn++;
    if (!m[1].includes('tag=')) { untagged++; fail(`${p}: untagged Amazon link ${m[1].slice(0, 80)}`); }
  }
}
if (untagged === 0) ok(`all ${amzn} Amazon links carry an affiliate tag`);

// 4. rel=sponsored on affiliate anchors
let unsponsored = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/<a[^>]+href="https:\/\/www\.amazon\.com[^>]*>/g)) {
    if (m[0].includes('/gp/help/')) continue;
    if (!/rel="[^"]*sponsored/.test(m[0])) unsponsored++;
  }
}
unsponsored === 0 ? ok('all Amazon anchors use rel="sponsored"') : fail(`${unsponsored} Amazon anchors missing rel=sponsored`);

// 5. Sitemap covers all article slugs + core pages
console.log('\n── Sitemap & assets ──');
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
const slugs = [...readFileSync('src/data/articles.ts', 'utf8').matchAll(/slug: "([a-z0-9-]+)"/g)].map(m => m[1]);
const missing = slugs.filter(s => !sitemap.includes(`/${s}`));
missing.length === 0 ? ok(`sitemap covers all ${slugs.length} article slugs`) : fail(`sitemap missing: ${missing.join(', ')}`);
['about', 'my-setup', 'privacy-policy'].forEach(s => { if (!sitemap.includes(`/${s}`)) fail(`sitemap missing /${s}`); });

// 6. Assets referenced in metadata exist
for (const a of ['og-default.png', 'logo.png', 'favicon.ico']) {
  const p = join(OUT, a);
  existsSync(p) ? ok(`${a} present (${Math.round(statSync(p).size / 1024)}KB)`) : fail(`${a} MISSING from out/`);
}

// 7. Per-article sections render
console.log('\n── Article page sections ──');
let missingSections = 0;
for (const s of slugs) {
  const p = join(OUT, s, 'index.html');
  if (!existsSync(p)) { fail(`page missing for ${s}`); continue; }
  const html = readFileSync(p, 'utf8');
  for (const section of ['How we picked', 'Frequently Asked Questions', 'affiliate links']) {
    if (!html.includes(section)) { missingSections++; fail(`${s}: missing "${section}"`); }
  }
}
if (missingSections === 0) ok(`all ${slugs.length} guides have methodology, FAQ, and disclosure`);

// 8. Reddit insights render on guide pages — only when auto-content is enabled.
//    With NEXT_PUBLIC_SHOW_AUTO_PICKS off (AdSense-review state), their absence is correct.
const autoOn = process.env.NEXT_PUBLIC_SHOW_AUTO_PICKS === '1';
let insightPages = 0;
for (const s of slugs) {
  const p = join(OUT, s, 'index.html');
  if (existsSync(p) && readFileSync(p, 'utf8').includes('Pulled from Reddit')) insightPages++;
}
if (autoOn) {
  insightPages > 0 ? ok(`Reddit insights render on ${insightPages} guide pages`) : fail('no guide page shows a Reddit insight');
} else {
  insightPages === 0 ? ok('auto-generated AI content correctly gated off (AdSense-review mode)') : fail(`AI content leaked on ${insightPages} pages despite SHOW_AUTO_PICKS off`);
}

// 8b. Every guide carries the human author byline (E-E-A-T)
let bylinePages = 0;
for (const s of slugs) {
  const p = join(OUT, s, 'index.html');
  if (existsSync(p) && readFileSync(p, 'utf8').includes('Nathan Ceniceros')) bylinePages++;
}
bylinePages === slugs.length ? ok(`author byline on all ${slugs.length} guides`) : fail(`byline missing on ${slugs.length - bylinePages} guides`);

// 8c. Trust pages exist in the build
for (const tp of ['contact', 'editorial-policy']) {
  existsSync(join(OUT, tp, 'index.html')) ? ok(`${tp} page built`) : fail(`${tp} page missing`);
}

// 9. No leaked secrets in build output
console.log('\n── Secrets scan ──');
let leaked = 0;
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  if (/ghp_[A-Za-z0-9]{20,}/.test(html)) { leaked++; fail(`${p}: contains a GitHub token!`); }
}
if (leaked === 0) ok('no tokens in build output');

console.log(`\n${failures === 0 ? '✅ ALL CHECKS PASSED' : `❌ ${failures} FAILURES`}`);
process.exit(failures === 0 ? 0 : 1);
