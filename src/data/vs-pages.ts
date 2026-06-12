// Standalone "X vs Y" pages, derived from the head-to-head verdicts already written
// in articles.ts — high purchase-intent queries served by content we already have.
import { articles } from "./articles";
import { products, Product } from "./products";

export interface VsPage {
  slug: string;
  matchup: string;
  verdict: string;
  articleSlug: string;
  category: string;
  a?: Product;
  b?: Product;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

function slugify(s: string): string {
  return s.toLowerCase().replace(/[—–]/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function findProduct(side: string): Product | undefined {
  const n = norm(side);
  if (n.length < 4) return undefined;
  return products.find((p) => {
    const pn = norm(p.name);
    return pn.includes(n) || n.includes(pn);
  });
}

const seen = new Set<string>();
export const vsPages: VsPage[] = articles.flatMap((article) =>
  (article.headToHead ?? []).flatMap((h) => {
    const slug = slugify(h.matchup);
    if (seen.has(slug)) return [];
    seen.add(slug);
    const [left, right] = h.matchup.split(/\s+vs\.?\s+/i);
    return [{
      slug,
      matchup: h.matchup,
      verdict: h.verdict,
      articleSlug: article.slug,
      category: article.category,
      a: left ? findProduct(left) : undefined,
      b: right ? findProduct(right.replace(/\s*[—–-].*$/, "")) : undefined,
    }];
  })
);

export function getVsPage(slug: string): VsPage | undefined {
  return vsPages.find((v) => v.slug === slug);
}
