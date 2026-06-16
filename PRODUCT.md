# PRODUCT.md — TotalTechPicks

What this product is *for*, who it serves, and how we judge whether a change helped.
Read this before touching anything user-facing; pair it with [DESIGN.md](DESIGN.md) and
[DESIGN-MEMORY.md](DESIGN-MEMORY.md). Engineering detail lives in [CLAUDE.md](CLAUDE.md) + `docs/`.

## The product in one line
A trustworthy, fast-loading tech-recommendation site (https://totaltechpicks.com) that helps
budget-conscious buyers pick the right gadget without wading through fake-review noise — monetized
by Amazon Associates (tag `totaltechpicks-20`) and, pending approval, Google AdSense.

## Who it's for
- **Primary:** a search-driven buyer mid-decision — typing "best USB-C hub under $50", "cheap
  webcam for streaming", "earbuds vs AirPods budget". They want a confident answer, the *why*,
  and a link to buy — in under 30 seconds, on mobile.
- **Secondary:** the browser/deal-seeker who lands on the homepage or a `/best/<budget>` guide and
  scans for "what's good right now."
- **Not for:** spec-obsessed enthusiasts who want 5,000-word teardowns. We're the *curated,
  decided-for-you* layer, not the lab-bench layer.

## Jobs to be done
1. **"Tell me what to buy and why."** Ranked picks with a named editor's take (`OurTake`:
   why it wins / who it's for / how it holds up / watch out for) — not just an affiliate dump.
2. **"Prove I can trust this."** Sources you can check, owner-feedback grounding, a real named
   author, transparent editorial + disclosure policy. This is the spine of the whole product.
3. **"Help me decide between two."** `/vs/<slug>` head-to-head pages.
4. **"What fits my budget?"** `/best/<slug>` programmatic budget guides computed from the live catalog.
5. **"Get me to the buy."** One obvious, honestly-labeled affiliate CTA per pick.

## What "good" looks like (success metrics, in priority order)
1. **Affiliate click-through** — the `affiliate_click` GA4 event firing on Amazon links is the
   primary conversion. Every design decision should make the *right* click easier, never trick it.
2. **Organic search arrival** — Google Search Console impressions/clicks on the `/best` and `/vs`
   pages. Content depth + structured data (JSON-LD) feed this.
3. **AdSense approval, then RPM** — see "Hard product constraints" below; approval is currently
   gating revenue.
4. **Trust signals that survive scrutiny** — return visits, low bounce on review pages.

## Hard product constraints (these have bitten us — don't relearn)
- **AdSense rejected us once for "low value content."** The product response is permanent, not a
  patch: every live product has a hand-written deep review, there's a real E-E-A-T trust layer
  (named author, `/contact`, `/editorial-policy`), and **all machine-generated content is gated OFF**
  via `NEXT_PUBLIC_SHOW_AUTO_PICKS` until a human-quality bar is met. Re-enabling auto-content is a
  *product* decision, not just an env flip — the content must read as editor-curated first.
- **Honesty is the product.** No fabricated trust signals, no fake scarcity, no invented scores
  (we deleted a fake "No-BS Score" for exactly this reason — see [DESIGN-MEMORY.md](DESIGN-MEMORY.md)).
  Affiliate relationships are disclosed; `rel="sponsored"` is on every monetized link.
- **No "dead listings" language to users.** Internally we track live/dead ASINs; users only ever
  see freshness framed positively ("updated daily," "live picks").
- **Near-$0, static.** Static export on Cloudflare Pages. No server, no DB, no per-request compute.
  Anything requiring a backend is out of scope by default.
- **Mobile-first.** The search buyer is on a phone. If it doesn't work one-handed at 375px, it's broken.

## Out of scope (say no to these)
- User accounts, comments, or any UGC (moderation + backend cost + AdSense risk).
- Price-tracking promises we can't keep on a static site.
- Anything that compromises page speed for decoration.
