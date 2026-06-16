# DESIGN-MEMORY.md — TotalTechPicks

A running log of *why the UI is the way it is* — design decisions, the reasoning, and the
mistakes we won't repeat. New design work reviews this first so we don't re-open settled calls or
re-introduce a pattern we deliberately killed. The "what" lives in [DESIGN.md](DESIGN.md); this is
the "why." Newest at top.

---

### Dark navy-black canvas with electric-blue accent — not a light/neutral theme
**Decision:** `#0a0e1a` base, `brand` blue scale, subtle radial-dot texture + glow.
**Why:** the audience is tech buyers; a dark "command center" feel reads as expert/trustworthy and
makes product imagery (mostly on white Amazon backgrounds) pop. Differentiates from the sea of
light, generic affiliate templates.
**Apply:** keep the palette tight (see DESIGN.md token table). Resist adding new hues — the semantic
accent set already covers badge meanings.

### Killed the fake "No-BS Score"
**Decision:** removed a fabricated numeric score that used to appear on cards.
**Why:** it was an invented trust signal with no real methodology behind it — directly at odds with
the product's honesty promise (see [PRODUCT.md](PRODUCT.md)) and a credibility risk for AdSense/E-E-A-T.
**Apply:** **never reintroduce fabricated metrics.** Trust comes from the named editor's `OurTake`,
checkable sources, and real owner feedback — not from numbers we made up. This is a hard line.

### Replaced "dead listings" stat with positive freshness framing
**Decision:** the homepage stats section talks about live picks "updated daily / best finds," never
dead/expired listings.
**Why:** user directive — internal health tracking is an ops concern, not a user-facing one. Exposing
churn undermines confidence at exactly the wrong moment.
**Apply:** any freshness/health UI stays positively framed. Health data (`product-health.json`) drives
*hiding* dead items silently, never a "X dead listings" counter.

### All machine-generated content gated OFF by default (`NEXT_PUBLIC_SHOW_AUTO_PICKS`)
**Decision:** Community Picks, "Reddit Says" snippets, auto-products, and the "intel refreshed" stamp
are hidden unless the env flag is `=1`.
**Why:** AdSense rejected the site for "low value content." Auto-generated blocks read as thin/templated
and were the likely trigger. The trust layer (deep reviews, named author, editorial policy) is what
carries the site now.
**Apply:** treat re-enabling as a *design + quality* gate, not a flag flip — the auto-content must reach
hand-written quality first. Verifiers assume the gated (off) state.

### Restrained, always-escapable motion
**Decision:** ambient orbs, gradient text, marquee, scroll-reveal — all real, all behind
`prefers-reduced-motion`, and reveal is JS-gated so no-JS users lose nothing.
**Why:** the "shock and aww" brief wanted a site that feels alive and premium, but not at the cost of
accessibility or perceived speed. Motion is seasoning, not structure.
**Apply:** every new animation goes in the reduced-motion off-switch block and must never hide content
by default. If it can't degrade, don't ship it.

### One primary CTA per surface
**Decision:** header has a single `Browse All →` primary button; cards have one affiliate CTA.
**Why:** the job-to-be-done is a confident buy decision. Competing CTAs split attention and lower the
`affiliate_click` rate that is the site's primary metric.
**Apply:** add navigation as ghost/text links, not more filled buttons. Protect the single clear action.

### Consistent radii + spacing ladders
**Decision:** fixed radius ladder (2xl cards → xl images/buttons → lg nav → full pills) and Tailwind-step
spacing only.
**Why:** earlier ad-hoc values made the UI feel slightly "off." A small fixed vocabulary keeps rhythm
tight and reviews fast (anything outside the ladder is an instant flag).
**Apply:** reuse the ladder; don't introduce one-off radius/spacing values.

---

## Open design questions / backlog
- **Re-enabling auto-content** post-AdSense-approval needs a visual treatment that clearly separates
  "community intel" from editorial picks (badge? section styling?) so it never dilutes perceived quality.
- **Compare/`/vs` UX** could use a sharper side-by-side visual hierarchy on mobile (currently table-driven).
- **AdSense slot placement** — `.ad-wrap` collapses unfilled slots; once ads fill, audit that placements
  don't push the buy CTA below the fold on mobile.
