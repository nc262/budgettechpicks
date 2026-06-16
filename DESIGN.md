# DESIGN.md — TotalTechPicks Design System

The actual system, read off the code (`tailwind.config.ts`, `src/app/globals.css`,
`src/components/*`). This is the source of truth for visual decisions — if you add UI, match
this; if you deviate, justify it in [DESIGN-MEMORY.md](DESIGN-MEMORY.md). Product intent lives in
[PRODUCT.md](PRODUCT.md).

## Voice & feel
Dark, technical, confident — "a sharp reviewer's command center," not a generic Tailwind starter.
Deep navy-black canvas, electric-blue accent, subtle glow and depth, restrained motion. Premium but
fast: every effect must survive a mobile Lighthouse run and `prefers-reduced-motion`.

## Color tokens (canonical — don't invent new ones)
| Role | Value | Where |
|------|-------|-------|
| Canvas / body bg | `#0a0e1a` (deep navy-black) | `globals.css` body |
| Canvas texture | radial dot grid `rgba(59,130,246,0.06)`, 28px | `globals.css` body |
| Surface (cards) | `bg-gray-900` | ProductCard, panels |
| Surface (header) | `bg-gray-950/90` + `backdrop-blur-md` | Header |
| Brand blue | `brand.500 #3b82f6` / `600 #2563eb` / `700 #1d4ed8` / `50 #eff6ff` | `tailwind.config.ts` |
| Accent gradient | `#60a5fa → #818cf8 → #38bdf8` | `.text-gradient`, hairline, glows |
| Text primary | `text-gray-100` | body |
| Text secondary | `text-gray-300` | nav, labels |
| Text muted | `text-gray-400` | meta, captions |
| Borders | `border-gray-700/50` (hairline `rgba(96,165,250,0.35)`) | cards, dividers |
| Focus ring | `2px solid rgba(96,165,250,0.7)`, offset 2px | `:focus-visible` |

**Semantic accent set** (used for badges/take-sections — keep these meanings consistent):
blue = primary/why-it-wins, green = value/who-it's-for, purple = longevity, amber = caution/watch-out,
yellow = #1/best-overall, orange = editor's pick, red = overkill, teal = work, pink = staff fave.

## Typography
- **Headings:** Space Grotesk (`--font-heading`), weights 400–700, `letter-spacing: -0.01em`.
- **Body/UI:** Inter (`--font-inter`).
- `text-rendering: optimizeLegibility`, `antialiased` globally.
- Scale via Tailwind defaults; product names `line-clamp-2` to protect card rhythm.

## Spacing, radii, layout
- **Container:** `max-w-5xl mx-auto px-4`. One column on mobile, grid on `lg`.
- **Radii ladder (consistent — don't free-style):** cards `rounded-2xl`, images/buttons/drawer items
  `rounded-xl`, nav links/small chips `rounded-lg`, pills/badges `rounded-full`.
- **Card padding:** `p-5`. **Header:** `py-2.5`. Gaps in multiples of Tailwind's 0.5 step (`gap-2`, `gap-4`).
- `scroll-margin-top: 90px` on `[id]` so anchored sections clear the sticky header.

## Core components (the real ones)
- **Header** (`Header.tsx`) — sticky, blurred, logo + 5 desktop nav links + My Setup/About + a single
  primary CTA (`Browse All →`). Mobile: hamburger (`aria-expanded`) → 2-col drawer. Gradient hairline
  under it. Only **one** primary CTA in the bar — don't add competing buttons.
- **ProductCard** (`ProductCard.tsx`) — `bg-gray-900 rounded-2xl`, hover lift + blue glow. Carries:
  rank medal (gold/silver/bronze for 1–3), one award badge (color-coded by meaning), 3-stage image
  fallback → emoji placeholder, expandable **Our Take** (4 fixed sections), optional 🔥 Hot Seller.
  This is the workhorse — new product surfaces should reuse it, not reinvent it.
- **Buttons (primary):** `bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md
  shadow-blue-600/20 hover:-translate-y-px`. Secondary: ghost (`hover:bg-white/5`).
- **Utilities:** `.glow-card` (depth + hover lift), `.glow-blue`, `.text-gradient` (animated),
  `.header-hairline`, `.marquee` (verified-picks ticker), `.ad-wrap` (collapses unfilled AdSense slots
  so there are never blank gaps).

## Motion (restrained, always escapable)
- Hover: cards lift `translateY(-2px)`; buttons `-translate-y-px`. 200ms.
- Ambient: drifting hero glow orbs (16s/22s), animated gradient text (7s), verified-picks marquee
  (45s linear, pauses on hover, edge-masked).
- Entrance: scroll-reveal fade+rise — **gated behind a JS-added `.reveal-ready` class so no-JS users
  see all content immediately.** Never hide content behind animation by default.
- **`@media (prefers-reduced-motion: reduce)` disables all of the above.** Any new animation MUST be
  added to that block too. Non-negotiable.

## Accessibility (the bar — these already exist, keep them)
- Visible `:focus-visible` ring on every interactive element. Never remove outlines without a replacement.
- `prefers-reduced-motion` fully honored.
- Interactive controls have `aria-label`/`aria-expanded` (see hamburger).
- Content degrades gracefully without JS (reveal, marquee).
- Color is never the *only* signal — badges pair color with emoji + text label.
- Target AA contrast on text; `text-gray-400` is the lightest acceptable on `#0a0e1a` for meta only.
- Affiliate links: `target="_blank" rel="noopener noreferrer sponsored"`.

## Responsive
Mobile-first (375px is the design target). Breakpoints: `sm` (CTA appears), `lg` (desktop nav, card
grid). Test one-handed mobile before desktop — the primary user is on a phone.

## Anti-patterns — REJECT in review (per global standard)
- **Generic AI-generated UI** — default Tailwind cards with no glow/depth, centered hero + 3 feature
  boxes, lorem-ipsum trust badges. If it looks like every other AI site, it's wrong here.
- **Fabricated signals** — fake scores, invented review counts, fake scarcity/urgency. (We removed a
  fake "No-BS Score" — see [DESIGN-MEMORY.md](DESIGN-MEMORY.md).)
- **Inconsistent spacing/radii** — new values outside the ladders above.
- **Unnecessary visual complexity** — decoration that costs page speed or buries the buy decision.
- **Accessibility regressions** — removing focus rings, motion with no reduced-motion fallback,
  color-only state, contrast below AA.
