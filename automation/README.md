# automation/

n8n workflow backups for TotalTechPicks. Exported automatically whenever workflows are updated.

> ⚠️ **Security note (June 2026):** the live Reddit Insights workflow had a GitHub PAT pasted
> directly into HTTP nodes (committed exports only ever had a placeholder, so it never reached
> this public repo). All workflows now use the n8n-stored "GitHub account" credential, which
> never appears in exports. Never paste tokens into workflow nodes — rotating the old PAT is
> still recommended.

## Fixed June 10, 2026

- **ASIN Health Check** only checked 1 of 131 products (Code node ran in "once for all items"
  mode). Now checks all of them — first real run found 17 dead listings.
- **Reddit Insights** timed out every run and analyzed only post titles. Now retries with
  timeouts, fetches real comment threads from Arctic Shift, and feeds actual comment text to
  Ollama. Insights with zero real comments are dropped instead of published.
- **Product Discovery** could never commit (placeholder PAT), called a nonexistent Ollama model
  (`llama3.2` → `llama3.2:3b`), sent GET instead of POST to Ollama, and filtered out every post.
  All fixed; queries retuned toward r/buildapcsales where deal titles carry product names.

## Workflows

| File | Schedule | Purpose |
|------|----------|---------|
| `nightly-asin-health-check.json` | **Nightly 2am** | Checks every ASIN against Amazon image CDN → marks live/dead → commits `src/data/product-health.json` |
| `nightly-product-discovery.json` | **Nightly 3am** | Searches Reddit for trending tech products via Arctic Shift API → uses Ollama to extract product names → commits `scripts/product-candidates.json` |
| `reddit-insights-totaltechpicks.json` | Every 8 hours | Fetches Reddit discussion posts for all product slugs → commits `src/data/reddit-insights.json` |
| `reddit-lead-finder.json` | Every 2 hours | Searches Reddit for buyer questions → uses Ollama to draft helpful replies → saves to local inbox |
| `pinterest-daily-pins.json` | Daily | Creates Pinterest pins for new/featured products |
| `product-health-check.json` | ~~Weekly~~ **REPLACED** | Old health check (buggy — marked everything live without checking). Replaced by `nightly-asin-health-check.json`. **Deactivate this in n8n.** |

## How the nightly health check works

1. Fetches `products.ts` from GitHub, parses every ASIN
2. For each ASIN, fetches `https://m.media-amazon.com/images/P/{ASIN}.01._SX300_QL70_.jpg`
3. Checks response: `image/jpeg` = live product, `image/gif` (43-byte placeholder) = dead ASIN
4. Builds updated `product-health.json` with accurate `isLive` flags
5. Commits to GitHub → triggers Vercel rebuild → dead products show Amazon search link fallback

## How product discovery works

1. Searches 12 subreddit/query combinations via Arctic Shift API
2. Filters posts: score ≥ 30, last 14 days
3. Sends each post to Ollama (llama3.2) to extract specific product names
4. Deduplicates against existing candidates, prunes items older than 30 days
5. Commits updated `scripts/product-candidates.json` to GitHub
6. **Review `scripts/product-candidates.json` weekly** — manually add good ones to `src/data/products.ts`

## Why prices still say "est."

Amazon blocks automated price scraping. Options:
- **Amazon PA-API** (Product Advertising API) — free with your affiliate account, requires setup at [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
- Once PA-API keys are set up, a price-update workflow can be added
- For now: `ProductCard` shows "est. · check Amazon for current price" as a disclosure

## Restoring workflows to n8n

1. Start n8n: `pm2 start C:\n8n-data\ecosystem.config.cjs`
2. Open http://localhost:5678 → Settings → n8n API → create an API key
3. Run:
```powershell
$env:N8N_API_KEY="your-api-key"
node automation/restore-workflows.mjs
```

## Updating backups

After editing workflows in the n8n UI, re-export:
```powershell
node automation/export-workflows.mjs
git add automation/
git commit -m "chore: update n8n workflow backups"
git push
```
