// Weekly sales-velocity tracker — Amazon review-count growth is the closest public
// proxy for sales velocity. Snapshots every product's rating count, computes growth,
// and publishes a "hot sellers" list the site renders as 🔥 badges.
//
// Run weekly (n8n → automation-runner). Flags: --dry-run, --limit=N (for testing)
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { chromium } from "playwright";

const DRY_RUN = process.argv.includes("--dry-run");
const LIMIT = Number((process.argv.find((a) => a.startsWith("--limit=")) || "").split("=")[1] || 0);
const REPO_URL = "https://github.com/nc262/budgettechpicks.git";
const CLONE_DIR = "C:\\n8n-data\\site-repo";
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

function sh(cmd) { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(); }
function syncClone() {
  if (!existsSync(join(CLONE_DIR, ".git"))) sh(`git clone --depth 5 ${REPO_URL} "${CLONE_DIR}"`);
  sh(`git -C "${CLONE_DIR}" fetch origin master`);
  sh(`git -C "${CLONE_DIR}" reset --hard origin/master`);
}

log(`velocity run starting (dry-run=${DRY_RUN})`);
syncClone();

const productsTs = readFileSync(join(CLONE_DIR, "src/data/products.ts"), "utf8");
let targets = [...productsTs.matchAll(/name:\s*"(.+?)",\s*\n\s*asin:\s*"([A-Z0-9]{10})"/g)]
  .map((m) => ({ name: m[1].replace(/\\"/g, '"'), asin: m[2] }));
// De-dup and optionally limit for test runs
targets = [...new Map(targets.map((t) => [t.asin, t])).values()];
if (LIMIT > 0) targets = targets.slice(0, LIMIT);
log(`${targets.length} products to snapshot`);

const dataPath = join(CLONE_DIR, "src/data/sales-velocity.json");
let data = { updatedAt: null, history: {}, hot: [] };
try { data = JSON.parse(readFileSync(dataPath, "utf8")); } catch {}
if (!data.history) data.history = {};

const today = new Date().toISOString().slice(0, 10);
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--disable-blink-features=AutomationControlled"] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: "en-US" });
const page = await ctx.newPage();

let captured = 0, failed = 0;
for (const t of targets) {
  try {
    // Searching by ASIN returns exactly that product's card — no name ambiguity
    await page.goto("https://www.amazon.com/s?k=" + t.asin, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector('div[data-asin][data-component-type="s-search-result"]', { timeout: 12000 });
    const count = await page.evaluate((asin) => {
      const c = [...document.querySelectorAll('div[data-asin][data-component-type="s-search-result"]')]
        .find((x) => x.getAttribute("data-asin") === asin);
      if (!c) return null;
      const el = c.querySelector('[aria-label$="ratings"], [aria-label$="rating"]');
      const txt = el?.getAttribute("aria-label") ?? c.querySelector(".s-underline-text")?.textContent ?? "";
      return Number(txt.replace(/[^\d]/g, "")) || null;
    }, t.asin);
    if (count) {
      const h = data.history[t.asin] || {};
      h[today] = count;
      // keep the last 10 snapshots
      data.history[t.asin] = Object.fromEntries(Object.entries(h).sort().slice(-10));
      captured++;
    } else failed++;
  } catch {
    failed++;
  }
  await page.waitForTimeout(2200 + Math.random() * 1500);
}
await browser.close();
log(`captured ${captured}, failed ${failed}`);

// Hot sellers: strongest review-count growth over the last ~5 weeks
const growth = [];
for (const [asin, snaps] of Object.entries(data.history)) {
  const entries = Object.entries(snaps).sort();
  if (entries.length < 2) continue;
  const windowStart = entries.find(([d]) => (new Date(today) - new Date(d)) / 86400000 <= 38) ?? entries[0];
  const [, oldCount] = windowStart;
  const [, newCount] = entries[entries.length - 1];
  const delta = newCount - oldCount;
  if (delta < 50) continue; // noise floor
  growth.push({ asin, delta, pct: delta / Math.max(oldCount, 1) });
}
data.hot = growth.sort((a, b) => b.pct - a.pct).slice(0, 8).map((g) => g.asin);
data.updatedAt = new Date().toISOString();
log(`hot sellers: ${data.hot.length ? data.hot.join(", ") : "(none yet — needs 2+ weekly snapshots)"}`);

writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");

const changed = sh(`git -C "${CLONE_DIR}" status --porcelain -- src/data/sales-velocity.json`);
if (!changed) {
  log("no changes — no commit");
} else if (DRY_RUN) {
  log("DRY RUN: would commit velocity snapshot");
} else {
  sh(`git -C "${CLONE_DIR}" add src/data/sales-velocity.json`);
  sh(`git -C "${CLONE_DIR}" -c user.name=BudgetTechPicks -c user.email=automation@totaltechpicks.com commit -m "chore: weekly sales velocity — ${captured} snapshots, ${data.hot.length} hot seller(s) [automated]"`);
  try { sh(`git -C "${CLONE_DIR}" push origin master`); }
  catch { sh(`git -C "${CLONE_DIR}" pull --rebase origin master`); sh(`git -C "${CLONE_DIR}" push origin master`); }
  log("PUBLISHED velocity snapshot");
}
log("done");
