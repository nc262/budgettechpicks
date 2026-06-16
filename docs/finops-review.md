# FinOps Review — TotalTechPicks

## Running cost today: ~$0/month in cloud spend
The architecture is deliberately near-zero-cost:

| Component | Plan | Cost |
|-----------|------|------|
| Cloudflare Pages (hosting + CDN + builds) | Free tier | $0 |
| GitHub (public repo, Actions CI) | Free | $0 |
| n8n, Ollama, automation-runner | Self-hosted on existing PC | $0 (electricity only) |
| Domain (totaltechpicks.com) | Registrar | ~$10–15/yr |
| Arctic Shift Reddit API | Free public API | $0 |

The only real recurring cost is the domain and the electricity to keep one PC on. That is the
whole point of the static-export + self-hosted-automation design.

## Cost drivers to watch
- **Cloudflare Pages free tier**: 500 builds/month. The pipeline pushes a few commits/day
  (~30–90 builds/month) — comfortably under, but if you add more nightly committing workflows,
  count the builds. Bandwidth on Pages free is effectively unlimited for this scale.
- **GitHub Actions free minutes**: the CI build runs ~2–3 min per push. At current push volume
  that's well within the free allotment; a busier pipeline or more sites could approach it.
- **Compute is "free" but real**: each discovery/velocity run spins up Chrome + Ollama on the PC.
  Cost is electricity and the opportunity cost of the machine, not a bill — but it caps how many
  sites one PC can serve.

## Cost of common changes (estimate before building)
- **Adding a nightly workflow** → +1–N builds/day (Cloudflare), +CI minutes, +PC compute. Cheap
  until you stack many.
- **Adding a paid data source** (price API, ad network, email provider over free tier) → the first
  recurring bill the project would take on. Flag it explicitly; the site currently has none.
- **Adding npm dependencies** → negligible $ but real build-time and supply-chain cost.
- **Spinning up additional niche sites** (templating idea) → each new site is another Pages
  project (free) + domain (~$12/yr) + its share of the single PC's compute. Infra cost scales
  cheaply; the real cost is content production, not hosting.

## Revenue side (for ROI framing)
- Amazon Associates (1–4%) is the active earner; tag `totaltechpicks-20`. Diversifying to
  higher-rate programs / OneLink for international clicks is the cheapest revenue lift (no infra cost).
- AdSense pending (denied once for low-value content; remediated). Ezoic is a no-approval-gate
  alternative if AdSense stays blocked.
- Because fixed costs are ~$0, the breakeven is essentially the domain — every affiliate dollar is
  near-pure margin. Optimize for traffic and conversion, not cost reduction.
