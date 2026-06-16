# Troubleshooting & RCA — TotalTechPicks

Common failure modes, their root cause, and the fix. Add new RCAs here as they're found.

## "The site stopped updating" (stale content)
- **Most likely:** the PC was asleep/off at the scheduled time, or pm2 apps stopped. Check
  `pm2 list` (n8n, ollama, automation-runner, reddit-leads should be `online`).
- **Or:** a workflow committed data that failed the Cloudflare build → Cloudflare kept the last
  good deploy (good) but new content isn't showing. Check the GitHub Actions run and the Cloudflare
  build log. The pre-commit validator should prevent this; if it didn't, widen the validation.
- There is no heartbeat alert yet — silent failure is the known gap (roadmap).

## A workflow shows "success" but produced wrong/empty output
Root cause is almost always one of the n8n Code/HTTP-node gotchas:
- **Code node default mode is "run once for ALL items"** → per-item code (`$input.item`) processes
  only the first item. Use `runOnceForEachItem`, or `$input.all()` + `$('Node').itemMatching(i)`.
- **HTTP Request defaults to GET** → a missing `method: POST` returns 405 (this bit the Ollama
  node once). `onError: continueRegularOutput` can mask it as success.
- **`responseFormat: json` can return an unparsed stream object** → use `text` and `JSON.parse`.
- **Always** confirm per-node item counts, not just status.

## Amazon scrape returns nothing / a bot page
Amazon serves an error/"Robot Check" page to plain `fetch`, PowerShell, and headless Chromium.
Resolution requires Playwright with `channel: 'chrome'` (real installed Chrome) headless. The
title often lives in the result card's image `alt`, not the `h2`. Quality gate: rating ≥ 4.3 and
≥ 400 ratings; reject PC components via the blocklist (checked against the resolved Amazon title too).

## A review count looks wrong on the site
`liveReviewCount()` only uses the velocity snapshot when it's ≥ the authored fallback — a scrape
that returns a smaller number (a parse mismatch, e.g. C920s returning 3,464 vs ~45k) is ignored on
purpose. If a count looks stuck, check `sales-velocity.json` for that ASIN.

## An irrelevant Reddit insight attached to a product
The insights pipeline gates on a model-token match (e.g. "G305") appearing in the thread, plus an
LLM relevance flag. If a bad one slips through, `scripts/prune-irrelevant-insights.mjs` applies the
same rule to published data. (Currently all this is gated off via `NEXT_PUBLIC_SHOW_AUTO_PICKS`.)

## Auto content (Community Picks / intel / Reddit Says) isn't showing
That's intentional — it's gated behind `NEXT_PUBLIC_SHOW_AUTO_PICKS` (off during AdSense review).
Set `NEXT_PUBLIC_SHOW_AUTO_PICKS=1` in Cloudflare Pages env to re-enable. `verify-site.mjs` will
then expect it present (or pass `EXPECT_AUTO_CONTENT=1` to verify-live).

## n8n PUT rejects a workflow update
`PUT /api/v1/workflows/{id}` rejects unknown `settings` keys (e.g. `binaryMode`). Filter settings
to the allowed list before PUT, and re-activate via `POST /workflows/{id}/activate` afterward.

## Pinterest CSV "missing"
It generates at 6am to `C:\n8n-data\pinterest-queue\` AND a copy to the OneDrive Desktop as
`Pinterest-Pins-Upload-Today.csv`. If absent, check the `pinterest-csv` runner job and that the
Desktop path resolved (`OneDrive` env).

## Deploy didn't trigger
Cloudflare Pages builds on push to `master`. Confirm the push landed (`git log origin/master`),
then check the Cloudflare Pages dashboard build queue. `netlify.toml`/`vercel.json` were removed —
Cloudflare is the only host.
