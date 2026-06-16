# Code Style — TotalTechPicks

Match the surrounding code. The conventions below are what the codebase already does — follow them
rather than introducing new patterns.

## Front end (Next.js / TypeScript / Tailwind)
- **App Router, static export.** No SSR/ISR APIs, no server actions, no runtime env reads that
  aren't `NEXT_PUBLIC_*` (everything is inlined at build).
- **Server components by default.** Add `"use client"` only when a component needs state/effects
  (e.g. `ProductFilter`, `ProductCard`, `NewsletterSignup`). Pages are server components.
- **Data flows from `src/data/`.** Never hardcode product/affiliate data in a component — add it to
  the data file and import. Derived data (budget guides, vs-pages) is computed from the source
  files, not duplicated.
- **One source of truth for config:** affiliate tag → `affiliateUrl()`; author → `author.ts`;
  feature gates → `NEXT_PUBLIC_*` env. Don't scatter literals.
- **Styling is Tailwind utility classes**, dark theme (`bg-gray-900/950`, blue-400 accents,
  rounded-2xl cards, `glow-card`). Reuse existing class patterns; no CSS modules or styled-components.
- **Structured data** (JSON-LD) is emitted with plain inline `<script type="application/ld+json">`,
  NOT `next/script` — `next/script` keeps it out of the static HTML where crawlers need it.
- **Images:** `images.unoptimized` is on (static export). Use `loading="lazy"` and the
  `eslint-disable-next-line @next/next/no-img-element` pattern already in place; the `<img>`
  warnings are expected and acceptable here.
- **Affiliate anchors:** always `target="_blank" rel="noopener noreferrer sponsored"`.
- Keep `npm run lint` clean of errors (the pre-existing `<img>` warnings are fine).

## Automation scripts (`scripts/*.mjs`, `*.ps1`)
- **Node ESM** (`.mjs`), top-level `await`, standard library only where possible. Playwright is the
  one heavy dep, used solely for Amazon (real Chrome channel).
- **Idempotent + best-effort:** scripts re-run safely; non-critical steps (pin render, deal radar)
  are wrapped so they never block the core commit. Validate data before committing.
- **Commit via the dedicated clone** (`C:\n8n-data\site-repo`), never the working tree; use a
  fixed bot identity for automated commits.
- **PowerShell renderers** (`render-pins.ps1`) are ASCII-only source — all display text (incl.
  non-ASCII glyphs) comes from a UTF-8 manifest, so the source never carries encoding-sensitive
  literals. Run via `pwsh` (PowerShell 7), not Windows PowerShell 5.
- Log progress with timestamps; print a clear final summary line (`PUBLISHED n …`, `RENDERED n …`).

## n8n workflows
- Code nodes: be explicit about `mode` (`runOnceForEachItem` vs all-items) — never rely on the
  default. See troubleshooting.md.
- HTTP nodes: set `method` explicitly, plus `timeout`, `retryOnFail`, and
  `onError: continueRegularOutput` on external calls.
- Credentials via the n8n store ("GitHub account"), never inline tokens.
- After editing live, re-export backups with `automation/export-workflows.mjs` and commit them.

## Commits
- Conventional-ish prefixes: `feat:`, `fix:`, `chore:`, `content:`, `docs:`. Body explains the
  *why* and any operational impact.
- Automated pipeline commits are tagged `[automated]`.
- End commit messages with the `Co-Authored-By:` trailer per the harness rules.
