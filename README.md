# BudgetTechPicks – Setup & Deploy Guide

## What This Is
A static Next.js affiliate site that earns via Amazon Associates commissions and Google AdSense ads. Targets budget tech searches like "best USB-C hub under $50".

---

## One-Time Setup (15 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Create your environment file
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your real values.

### 3. Get your Amazon Associates tag (free)
1. Go to https://affiliate-program.amazon.com
2. Sign up (takes ~1 day to approve)
3. Your tag looks like: `yourname-20`
4. Put it in `.env.local` as `NEXT_PUBLIC_AMAZON_TAG=yourname-20`

### 4. Get your Google AdSense ID (free, ~1-2 weeks approval)
1. Go to https://adsense.google.com
2. Sign up and add your site URL
3. Your publisher ID looks like: `pub-1234567890123456`
4. Put it in `.env.local` as `NEXT_PUBLIC_ADSENSE_ID=pub-XXXXXXXXXXXXXXXX`
5. Replace the placeholder ad slot IDs in `src/app/page.tsx` and `src/app/[slug]/page.tsx` with your real slot IDs from AdSense

### 5. (Optional) Google Analytics
1. Go to https://analytics.google.com and create a property
2. Get your Measurement ID (looks like `G-XXXXXXXXXX`)
3. Put it in `.env.local` as `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

---

## Local Development
```bash
npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel (free, set & forget)

1. Push this repo to GitHub
2. Go to https://vercel.com and sign in with GitHub
3. Click **"Add New Project"** → import your repo
4. Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**
5. Click **Deploy** — done!

Vercel auto-deploys on every git push. Your site will be live at `https://yourproject.vercel.app`.

---

## How the Money Works

| Source | How | Typical rate |
|--------|-----|-------------|
| Amazon Associates | User clicks your link and buys anything on Amazon within 24h | 1–4% of sale |
| Google AdSense | Ads shown on every page view | $1–5 per 1,000 page views |

**To hit $5/day you need roughly:**
- ~150–200 visitors/day (AdSense alone), OR
- 3–4 Amazon purchases via your links, OR
- A mix of both

**How to get traffic (the only ongoing work):**
- Share articles in Reddit communities (r/homeoffice, r/buildapc, r/BudgetAudiophile)
- Pin articles to a free Pinterest account
- Post on Facebook groups about home office / remote work

---

## Customization
- **Add products:** Edit `src/data/products.ts`
- **Add articles:** Edit `src/data/articles.ts` and add a matching entry in `products.ts`
- **Change site name:** Search for `BudgetTechPicks` and replace

---

## File Structure
```
src/
  app/
    page.tsx          # Homepage
    [slug]/page.tsx   # Article pages (auto-generated per slug)
    layout.tsx        # Global layout (header/footer/ads/analytics)
    globals.css
  components/
    Header.tsx
    Footer.tsx
    ProductCard.tsx   # Individual product with affiliate link
    AdSlot.tsx        # Google AdSense slot wrapper
  data/
    products.ts       # All products with ASINs
    articles.ts       # Article metadata
```
