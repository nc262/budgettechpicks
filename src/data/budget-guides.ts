// Programmatic "Best [category] under $X" pages — high purchase-intent search targets,
// computed from the live catalog so they self-maintain as products/prices change.
// Rules: >=3 live products under the tier, >=1 product at/above it (real constraint),
// distinct product sets only, max 2 tiers per category, skip $50 (existing articles cover it).
import { products, Product } from "./products";
import productHealth from "./product-health.json";

export interface BudgetGuide {
  slug: string;
  category: string;
  threshold: number;
  title: string;
  metaDescription: string;
  intro: string;
  products: Product[];
}

// Search-friendly URL base per category
const CATEGORY_BASE: Record<string, string> = {
  "USB-C Hubs": "usb-c-hubs",
  "Webcams": "webcams",
  "Wireless Earbuds": "wireless-earbuds",
  "Desk Accessories": "desk-accessories",
  "Gaming Gear": "gaming-gear",
  "Desk Toys & Fun": "desk-gadgets",
  "Smart Home": "smart-home-devices",
  "Portable Tech": "portable-tech",
  "Monitors & Displays": "monitors",
  "Streaming Gear": "streaming-gear",
  "Audio & Microphones": "headphones-and-mics",
  "Gaming Setups": "gaming-setup-gear",
};

const TIERS = [100, 200, 300, 500];
const MAX_PER_CATEGORY = 2;

const health = productHealth as Record<string, { isLive?: boolean }>;
const isLive = (asin: string) => health[asin]?.isLive !== false;

function build(): BudgetGuide[] {
  const guides: BudgetGuide[] = [];

  for (const [category, base] of Object.entries(CATEGORY_BASE)) {
    const inCat = products.filter((p) => p.category === category && isLive(p.asin));
    if (inCat.length < 4) continue;

    let added = 0;
    let lastSetSize = -1;
    for (const tier of TIERS) {
      if (added >= MAX_PER_CATEGORY) break;
      const under = inCat
        .filter((p) => p.priceNum < tier)
        .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      const hasAbove = inCat.some((p) => p.priceNum >= tier);
      if (under.length < 3 || !hasAbove) continue;     // not enough, or "under $X" isn't a real filter
      if (under.length === lastSetSize) continue;        // identical set to a lower tier — no new info
      lastSetSize = under.length;
      added++;

      const top = under.slice(0, 8);
      const cheapest = Math.min(...top.map((p) => p.priceNum));
      guides.push({
        slug: `${base}-under-${tier}`,
        category,
        threshold: tier,
        title: `Best ${category} Under $${tier} (2026)`,
        metaDescription: `The best ${category.toLowerCase()} under $${tier}, ranked — ${top.length} picks from $${cheapest.toFixed(0)}, by Amazon rating and real owner feedback. Updated for 2026.`,
        intro: `You don't have to spend a fortune. These are the best ${category.toLowerCase()} you can buy for under $${tier} right now — ranked by rating, review volume, and how they actually hold up, with every listing re-checked against Amazon nightly.`,
        products: top,
      });
    }
  }
  return guides;
}

export const budgetGuides: BudgetGuide[] = build();

export function getBudgetGuide(slug: string): BudgetGuide | undefined {
  return budgetGuides.find((g) => g.slug === slug);
}
