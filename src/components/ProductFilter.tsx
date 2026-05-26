"use client";

import { useState } from "react";
import { Product } from "@/data/products";
import ProductCard from "./ProductCard";
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

interface Props {
  products: Product[];
}

export default function ProductFilter({ products }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeRange = RANGES[activeIndex];

  const countFor = (range: Range) =>
    range.label === "All"
      ? products.length
      : products.filter((p) => p.priceNum >= range.min && p.priceNum < range.max).length;

  const filtered =
    activeRange.label === "All"
      ? products
      : products.filter((p) => p.priceNum >= activeRange.min && p.priceNum < activeRange.max);

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
                    ? "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
                    : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                }`}
              >
                {range.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  active ? "bg-white/20 text-white" : hasItems ? "bg-gray-100 text-gray-500" : "bg-gray-100 text-gray-300"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {activeRange.label !== "All" && (
          <p className="text-sm text-gray-500 mt-3">
            Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{" "}
            <span className="font-bold text-gray-900">{products.length}</span> products
            {" · "}
            <button
              onClick={() => setActiveIndex(0)}
              className="text-blue-600 font-bold hover:underline"
            >
              Show all
            </button>
          </p>
        )}
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold text-gray-700 text-lg mb-1">No products in this range</p>
          <button
            onClick={() => setActiveIndex(0)}
            className="mt-4 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
          >
            Show all products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((product, index) => (
            <div key={product.id}>
              <ProductCard product={product} rank={index + 1} />
              {index === 1 && (
                <div className="mt-6">
                  <AdSlot slot="8753330826" style="rectangle" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

