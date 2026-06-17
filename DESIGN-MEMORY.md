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

### Design-review pass (2026-06-16) — three slop tells removed
A full `impeccable` critique + audit found three of the skill's hard "AI slop" tells shipping live.
All three are now removed; the detector reports zero. Do not reintroduce them (now also codified in
[DESIGN.md](DESIGN.md) anti-patterns):
- **Animated gradient text** on the homepage hero (`.text-gradient` on "More Hardware.") → replaced
  with a solid `text-blue-400`; the `.text-gradient` utility, its `gradient-pan` keyframe, and the
  reduced-motion reference were deleted from `globals.css`. Gradient text is a classic AI tell and adds
  nothing over weight + color.
- **Side-stripe accent borders** (`border-l-4` colored edge) in three places — the Editor's Note
  callout, the four review "take" sections, and the #1 ProductCard. Replaced with full borders plus the
  element's existing leading cue (🎙️ icon / a small colored dot / the gold rank medal). The skill calls
  the side-stripe "the most recognizable tell of AI-generated UIs."
- **Hero-metric stats bar** (four identical big-number columns on a gradient + `glow-blue` panel) →
  reworked into a quiet inline credibility strip on a plain bordered surface. Same real figures
  (products tracked, guides, daily checks, 8h intel), none of the SaaS-cliché framing.

### Killed the fake "No-BS Score" (for real this time)
**Decision:** removed a fabricated numeric score that appeared on product cards.
**What actually happened:** it was removed from `ProductCard` earlier, but the 2026-06-16 audit found it
**still live in `HeroProductCard`** (`nobsScore = rating × 2`, shown as `⚡ {n}/10`) — i.e. on the
homepage hero *and* every category-page hero. Worse, the [about page](src/app/about/page.tsx) explicitly
promises "We don't invent our own score," so the card was breaking a stated promise on every page. Now
replaced with the **real Amazon star rating** (`★ {rating} on Amazon`).
**Why:** an invented trust signal with no methodology — directly at odds with the product's honesty
promise (see [PRODUCT.md](PRODUCT.md)) and a credibility/AdSense-E-E-A-T risk.
**Apply:** **never reintroduce fabricated metrics**, and when you "remove" one, grep the whole tree —
the same fake metric can survive in a sibling component. Trust comes from the named editor's `OurTake`,
checkable sources, and real owner feedback — not from numbers we made up. Hard line.

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
