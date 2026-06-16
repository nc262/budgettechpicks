# Testing Strategy — TotalTechPicks

There is no unit-test suite (the app is data + static rendering); correctness is enforced by a
**build gate**, a **post-build verifier**, a **live spot-check**, and **pre-commit data
validation** in the pipeline. Use them in this order.

## 1. Build gate — `npm run build`
Static export fails the build on type errors, broken imports, or bad data shapes. This is the
first and cheapest check. CI (`.github/workflows/ci.yml`) runs it on every push, so a bad
automated commit fails loudly and Cloudflare keeps the last good deploy.

## 2. Post-build correctness — `node scripts/verify-site.mjs`
Run after `npm run build`. Asserts against the generated `out/`:
- every internal link resolves; all JSON-LD blocks parse
- every Amazon link carries the affiliate tag and `rel="sponsored"`
- sitemap covers all slugs; OG image, logo, favicon exist
- each guide has methodology + FAQ + disclosure + author byline
- contact/editorial-policy pages built; no secrets (`ghp_…`) in output
- **auto-generated AI content is correctly gated**: with `NEXT_PUBLIC_SHOW_AUTO_PICKS` unset it
  asserts the content is ABSENT; set `NEXT_PUBLIC_SHOW_AUTO_PICKS=1` to assert it's present.

## 3. Live spot-check — `pwsh scripts/verify-live.ps1`
Run after a deploy lands. Hits production and confirms the headline features render (stats badge,
comparison tables, head-to-heads, FAQ schema, byline, review/budget/gift pages, trust pages, and
that AI content stays gated). Set `EXPECT_AUTO_CONTENT=1` if you've enabled auto content.

## 4. Pipeline data validation (automated, pre-commit)
`discover-products.mjs` validates before it commits: JSON parses, `auto-products.json` is an
array, `products.ts` still has its array + trailing helpers, and any promoted ASIN is present.
On failure it aborts the commit (the clone resets next run), so bad data never ships.

## When verifying n8n workflow changes (critical habit)
Do **not** trust `status: success`. A Code node in the default "run once for all items" mode
silently processes only the first item. Check **per-node item counts** in the execution data
(`runData[node][0].data.main[0].length`) and spot-check output *content* for relevance, not just
shape. See [troubleshooting.md](troubleshooting.md).

## Manual deploy-confirmation pattern
After pushing, poll the live URL for the new content before declaring done (Cloudflare build takes
~2–4 min). The repo's verify-live script is the canonical "is it actually live and correct" check.

## What's intentionally NOT tested
No visual regression, no e2e browser tests, no load tests (static CDN). If the project grows
interactive features, add Playwright e2e — Playwright is already a dependency.
