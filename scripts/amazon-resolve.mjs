// Resolve a product name to its top Amazon search result using real Chromium.
// Usage: node scripts/amazon-resolve.mjs "<product name>" ["<product name 2>" ...]
// Prints one JSON line per query: {query, asin, title, price, rating, ratingsCount, imageUrl} or {query, error}
import { chromium } from "playwright";

const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error("usage: node scripts/amazon-resolve.mjs <name> [...names]");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  viewport: { width: 1366, height: 900 },
  locale: "en-US",
});
const page = await ctx.newPage();

for (const query of queries) {
  try {
    await page.goto("https://www.amazon.com/s?k=" + encodeURIComponent(query), {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForSelector('div[data-asin][data-component-type="s-search-result"]', { timeout: 15000 });
    const result = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('div[data-asin][data-component-type="s-search-result"]')]
        .filter((c) => c.getAttribute("data-asin") && !c.querySelector('[aria-label="Sponsored"], .puis-sponsored-label-text'));
      const c = cards[0];
      if (!c) return null;
      const asin = c.getAttribute("data-asin");
      const title = (c.querySelector("img.s-image")?.getAttribute("alt") || c.querySelector("h2")?.textContent || "").trim();
      const priceWhole = c.querySelector(".a-price .a-offscreen")?.textContent?.trim() ?? null;
      const ratingText = c.querySelector('[aria-label*="out of 5 stars"]')?.getAttribute("aria-label") ?? "";
      const rating = ratingText.match(/([\d.]+) out of 5/)?.[1] ?? null;
      const countEl = c.querySelector('[aria-label*="ratings"], [aria-label*="rating"]');
      const countText = countEl?.getAttribute("aria-label") ?? c.querySelector(".s-underline-text")?.textContent ?? "";
      const ratingsCount = countText.replace(/[^\d]/g, "") || null;
      const imageUrl = c.querySelector("img.s-image")?.getAttribute("src") ?? null;
      return { asin, title, price: priceWhole, rating, ratingsCount, imageUrl };
    });
    if (result) console.log(JSON.stringify({ query, ...result }));
    else console.log(JSON.stringify({ query, error: "no organic result" }));
  } catch (e) {
    console.log(JSON.stringify({ query, error: String(e.message).slice(0, 120) }));
  }
  await page.waitForTimeout(2500 + Math.floor(2000 * (queries.indexOf(query) % 3) / 3));
}

await browser.close();
