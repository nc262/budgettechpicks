# CLAUDE.md — TotalTechPicks

Project context for AI-assisted work. Read this first, then the relevant file in `docs/`.

## What this is
A static **Next.js** affiliate tech-review site (**TotalTechPicks**, https://totaltechpicks.com),
monetized by Amazon Associates and (pending) Google AdSense. Content is data-driven; a local
**n8n + Ollama** automation stack keeps it fresh by committing data files to GitHub, which
auto-deploys via **Cloudflare Pages**.

## Architecture in one paragraph
`next build` with `output: "export"` → static `out/` → Cloudflare Pages, redeployed on every
push to `master`. The site renders from data files in `src/data/` (products, articles, reviews,
budget-guides, plus pipeline-generated JSON: product-health, reddit-insights, sales-velocity,
deal-radar, auto-products). Local automation (n8n, Ollama, a tiny `automation-runner` HTTP
service, Playwright/Chrome) runs on one Windows PC under pm2 and commits those JSON/TS files to
the public repo `nc262/budgettechpicks`. See [docs/architecture-review.md](docs/architecture-review.md).

## Hard rules / gotchas (don't relearn these)
- **Affiliate tag** lives ONLY in `affiliateUrl()` (`src/data/products.ts`); the real tag is
  `totaltechpicks-20`. Never hardcode a tag anywhere else.
- **Auto-generated content is gated** behind `NEXT_PUBLIC_SHOW_AUTO_PICKS` (unset during the
  AdSense review = hidden). Set `=1` in Cloudflare env to re-enable Community Picks / intel /
  Reddit-Says. Both verifiers assume the gated (off) state.
- **Amazon blocks plain scraping** — product resolution needs Playwright with `channel: 'chrome'`
  headless. Plain `fetch`/headless-Chromium hit the bot wall.
- **n8n 2.x has no Execute Command node** — local scripts are triggered via the `automation-runner`
  pm2 service on `127.0.0.1:7799`.
- **The pipeline commits straight to `master`** (no PR). `discover-products.mjs` validates data
  before committing; CI (`.github/workflows/ci.yml`) build-checks every push.
- Verify Code-node output by **per-node item counts**, not just `status: success`. See
  [docs/troubleshooting.md](docs/troubleshooting.md).

## Workflow before changing anything
DISCOVER → PLAN → CHALLENGE → EXECUTE → VERIFY → REVIEW → IMPROVE. Always weigh architecture,
security, operational, and cost impact (the four review docs below).

## Verifying changes
- `npm run build` then `node scripts/verify-site.mjs` (post-build correctness sweep).
- `pwsh scripts/verify-live.ps1` (production spot-check after deploy).
- See [docs/testing-strategy.md](docs/testing-strategy.md).

## The `docs/` set
| Doc | Covers |
|-----|--------|
| [architecture-review.md](docs/architecture-review.md) | System design, data flow, deploy path, scaling limits |
| [devsecops-review.md](docs/devsecops-review.md) | Secrets, credentials, supply chain, CI, deploy safety |
| [finops-review.md](docs/finops-review.md) | What this costs to run; cost of each change |
| [testing-strategy.md](docs/testing-strategy.md) | Build/verify gates, what to check before shipping |
| [troubleshooting.md](docs/troubleshooting.md) | Common pipeline/site failures and RCAs |
| [code-style.md](docs/code-style.md) | Conventions for the codebase and the automation scripts |

## Design review gate (this is a user-facing site — read before any UI change)
| Doc | Covers |
|-----|--------|
| [PRODUCT.md](PRODUCT.md) | What the product is for, who it serves, success metrics, hard product constraints |
| [DESIGN.md](DESIGN.md) | The real design system — color/type/spacing tokens, components, motion, a11y, anti-patterns |
| [DESIGN-MEMORY.md](DESIGN-MEMORY.md) | Why the UI is the way it is — settled design decisions and patterns we deliberately killed |
