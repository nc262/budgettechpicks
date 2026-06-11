"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import ProductCard from "./ProductCard";
import CompareDrawer from "./CompareDrawer";
import AdSlot from "./AdSlot";

interface Range {
  label: string;
  min: number;
  max: number;
}

const RANGES: Range[] = [
  { label: "All", min: 0, max: Number.MAX_VALUE },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25–$50", min: 25, max: 50 },
  { label: "$50–$100", min: 50, max: 100 },
  { label: "$100–$250", min: 100, max: 250 },
  { label: "$250–$500", min: 250, max: 500 },
  { label: "$500+", min: 500, max: Number.MAX_VALUE },
];

export interface RedditInsight {
  product: string;
  productSlug?: string;
  summary: string;
  pros: string[];
  cons: string[];
  sentiment: string;
  key_insights?: string[];
  recommended_by_users?: boolean;
  sourcePost?: string;
  sourceUrl?: string;
  scrapedAt?: string;
}

interface Props {
  products: Product[];
  redditByProduct?: Record<string, RedditInsight>;
}

const MAX_COMPARE = 4;

// Match insights to products even when names differ slightly
// ("Sony WF-1000XM5" vs "Sony WF-1000XM5 — Best ANC Earbuds")
function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findInsight(
  productName: string,
  redditByProduct: Record<string, RedditInsight>
): RedditInsight | undefined {
  const exact = redditByProduct[productName.toLowerCase()] ?? redditByProduct[productName];
  if (exact) return exact;
  const target = normalizeName(productName);
  for (const [key, insight] of Object.entries(redditByProduct)) {
    const k = normalizeName(key);
    if (k && (target.includes(k) || k.includes(target))) return insight;
  }
  return undefined;
}

export default function ProductFilter({ products, redditByProduct = {} }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const activeRange = RANGES[activeIndex];

  const countFor = (range: Range) =>
    range.label === "All"
      ? products.length
      : products.filter((p) => p.priceNum >= range.min && p.priceNum < range.max).length;

  const filtered =
    activeRange.label === "All"
      ? products
      : products.filter((p) => p.priceNum >= activeRange.min && p.priceNum < activeRange.max);

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev; // silently ignore when at max
      return [...prev, id];
    });
  }

  const compareProducts = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  const atMax = compareIds.length >= MAX_COMPARE;

  return (
    <div>
      {/* Price filter bar */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Filter by Price
        </p>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((range, i) => {
            const count = countFor(range);
            const active = i === activeIndex;
            const hasItems = count > 0;
            return (
              <button
                key={range.label}
                onClick={() => hasItems && setActiveIndex(i)}
                disabled={!hasItems}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-1.5 ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : hasItems
                    ? "bg-gray-800 text-gray-300 border-gray-700 hover:border-blue-500 hover:text-blue-400 cursor-pointer"
                    : "bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed"
                }`}
              >
                {range.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  active ? "bg-white/20 text-white" : hasItems ? "bg-gray-700 text-gray-400" : "bg-gray-800 text-gray-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {activeRange.label !== "All" && (
          <p className="text-sm text-gray-400 mt-3">
            Showing <span className="font-bold text-gray-100">{filtered.length}</span> of{" "}
            <span className="font-bold text-gray-100">{products.length}</span> products
            {" · "}
            <button
              onClick={() => setActiveIndex(0)}
              className="text-blue-400 font-bold hover:underline"
            >
              Show all
            </button>
          </p>
        )}
      </div>

      {/* Compare hint — shown once at least 1 product is selected */}
      {compareIds.length === 1 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 font-medium">
          ⚖️ Select one more product to start comparing.
        </div>
      )}
      {atMax && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300 font-medium">
          ⚖️ Maximum {MAX_COMPARE} products selected for comparison.
        </div>
      )}

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-700/50">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold text-gray-100 text-lg mb-1">No products in this range</p>
          <button
            onClick={() => setActiveIndex(0)}
            className="mt-4 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
          >
            Show all products
          </button>
        </div>
      ) : (
        <div className={`space-y-6 ${compareProducts.length >= 2 ? "pb-64" : ""}`}>
          {filtered.map((product, index) => {
            const insight = findInsight(product.name, redditByProduct);
            const isSelected = compareIds.includes(product.id);
            return (
              <div key={product.id}>
                <ProductCard
                  product={product}
                  rank={index + 1}
                  redditInsight={insight}
                  isCompareSelected={isSelected}
                  onToggleCompare={() => toggleCompare(product.id)}
                  compareDisabled={atMax && !isSelected}
                />
                {index === 1 && (
                  <div className="mt-6">
                    <AdSlot slot="8753330826" style="rectangle" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison drawer */}
      <CompareDrawer
        products={compareProducts}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
        onClear={() => setCompareIds([])}
      />
    </div>
  );
}
