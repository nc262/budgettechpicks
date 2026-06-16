# DevSecOps Review — TotalTechPicks

## Threat model in brief
A static marketing site has a small attack surface (no server, no user accounts, no DB). The real
security concerns are **secret leakage** (the repo is public), **supply-chain** (npm + the
automation stack), and **deploy integrity** (an automated pipeline commits straight to `master`).

## Secrets & credentials
- **The repo is PUBLIC** (`nc262/budgettechpicks`). Never commit a token, key, or password.
- **Only `NEXT_PUBLIC_*` values belong in client code** — they ship to every browser by design
  (Amazon tag, AdSense ID, GA4 ID, contact email). These are not secrets; treating them as such is
  the mistake (e.g., GA4 `G-747QVQ0GFB` is public and defaulted in `layout.tsx`).
- **Real secrets live outside the repo:** the GitHub PAT/credential is stored in n8n's credential
  store and the local clone's git config; never in workflow exports or scripts.
- History note: an early live workflow had a PAT pasted into HTTP nodes (committed exports only
  ever held a placeholder). All workflows now use the n8n-stored "GitHub account" credential.
  **If a token is ever exposed, rotate it at github.com/settings/tokens — don't just delete the file.**
- **Pre-commit guard:** treat any `ghp_…`, `sk-…`, JWT, or password in a diff as a stop. The n8n
  helper scripts in `C:\n8n-data\` DO contain the n8n API JWT — that directory is not the repo and
  must never be committed here.

## Supply chain
- `npm ci` from a committed lockfile in CI; avoid adding dependencies casually (the front end is
  intentionally tiny: next/react only). Each new dep is new attack surface on a public site.
- The automation stack (n8n, Ollama, Playwright) runs locally and is not part of the deployed
  artifact — but Playwright drives a real Chrome against Amazon; keep it patched.

## Deploy integrity
- **CI build-check** (`.github/workflows/ci.yml`) runs `build` + `verify-site.mjs` on every push,
  including the automated commits. A broken commit fails the build; Cloudflare keeps the last good
  deploy live (fail-safe, not fail-open).
- **Pre-commit validation** in `discover-products.mjs` parses the JSON it writes and sanity-checks
  `products.ts` structure before committing — malformed automated data can't reach production.
- The pipeline commits to `master` with no human review. This is acceptable only because (a) the
  data shape is validated, (b) CI gates the build, and (c) Cloudflare rolls back on failure. Don't
  remove any of those three without adding another.

## Privacy & compliance
- Affiliate disclosure is present on every page carrying affiliate links (FTC).
- No PII is collected by the site itself; the newsletter form (when enabled) POSTs an email to a
  third-party endpoint — disclose in the privacy policy.
- `robots.txt` (Cloudflare-managed) allows search crawlers and blocks AI-training crawlers; this is
  a policy choice, not a security control.

## Outbound link safety
External/affiliate links use `rel="noopener noreferrer sponsored"`. Keep `sponsored` on anything
monetized (compliance) and `noopener` on every `target="_blank"` (tab-nabbing prevention).
