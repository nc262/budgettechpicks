# Architecture Review — TotalTechPicks

## System overview
A static publishing pipeline with a content-automation back end. There is no application server
and no database — the "database" is a set of versioned data files in the repo, and the "backend"
is a set of scheduled local jobs that edit those files.

```
                         ┌─────────────────────────── local Windows PC (pm2) ───────────────────────────┐
                         │  n8n (localhost:5678)   Ollama (11434)   automation-runner (127.0.0.1:7799)   │
                         │        │  schedules            │ LLM            │ runs local Node scripts      │
                         │        ▼                       ▼                ▼                              │
   Reddit (Arctic Shift) ───▶  discovery / insights / velocity / deal-radar / pinterest                  │
   Amazon (Chrome scrape) ─▶  resolve ASIN, rating counts, image health                                  │
                         │        │ commit JSON/TS via GitHub Contents API or a dedicated clone           │
                         └────────┼──────────────────────────────────────────────────────────────────────┘
                                  ▼
                        GitHub  nc262/budgettechpicks (master)
                                  │ push triggers build
                                  ▼
                        Cloudflare Pages  →  next build (output: export) → out/ → https://totaltechpicks.com
```

## Front end
- **Next.js App Router**, static export (`output: "export"`, `images.unoptimized`). No SSR/ISR.
- Pages: home, `/[slug]` category guides, `/reviews/[id]` (deep reviews), `/vs/[slug]`
  (head-to-heads), `/best/[slug]` (budget guides), `/about`, `/my-setup`, `/contact`,
  `/editorial-policy`, `/privacy-policy`, plus `sitemap.xml` and `robots.txt` routes.
- Content lives in `src/data/`:
  - Hand-authored: `products.ts`, `articles.ts`, `reviews.ts`, `author.ts`; `budget-guides.ts`
    and `vs-pages.ts` are *derived* from those at build time.
  - Pipeline-generated JSON: `product-health.json`, `reddit-insights.json`, `sales-velocity.json`,
    `deal-radar.json`, `auto-products.json`.

## Automation back end
- **n8n** (pm2 app `n8n`) holds the schedules. Active workflows: Nightly ASIN Health Check (2am),
  Nightly Product Discovery (3am), Reddit Insights (8h), Reddit Lead Finder (2h), Weekly Sales
  Velocity (Sun 4am), Daily Pinterest CSV (6am).
- **automation-runner** (pm2 app, `C:\n8n-data\automation-runner\server.js`, port 7799) bridges
  n8n → local Node scripts, because n8n 2.x dropped the Execute Command node. Jobs: `discovery`,
  `pinterest-csv`, `velocity`.
- **Scripts** (`scripts/`): `discover-products.mjs` (Reddit→Amazon→review→publish + deal radar +
  promote/retire), `track-velocity.mjs`, `generate-pinterest-csv.mjs`, `render-pins.ps1` +
  `generate-pin-images.mjs`, `verify-site.mjs`, `verify-live.ps1`.
- Publishing model: scripts that commit use a **dedicated clone** at `C:\n8n-data\site-repo`
  (never the working tree); n8n HTTP nodes use the stored GitHub credential.

## Key design decisions
- **Static export over SSR**: zero server cost, trivially cacheable, survives traffic spikes; the
  tradeoff is that "live" data refreshes only on rebuild (acceptable — data changes daily, not
  per-request).
- **Data files over a CMS/DB**: every content change is a reviewable git diff; the site is
  reproducible from the repo alone; the pipeline edits content the same way a human would.
- **Commit-to-deploy**: Cloudflare keeps the last good build if a new one fails, so a bad
  automated commit degrades to "stale," never "down."

## Scaling limits & risks (know these before growing)
- **Single point of failure: the PC.** If it's asleep at 2–4am, that night's update silently
  doesn't happen. No heartbeat alert yet (roadmap).
- **Amazon bot detection** scales with scrape volume — multiplying sites/products raises risk.
- **Build time** grows with page count (~180 pages now); fine, but watch it past a few thousand.
- **No CDN-side personalization / search** — intentionally; a declared SearchAction was removed
  because it implied a search feature that doesn't exist.

## Change-impact checklist (per global standards)
Before any change, state its: architecture impact, security impact (see devsecops doc),
operational impact (does it touch the nightly pipeline?), cost impact (see finops doc), and
rollback complexity.
