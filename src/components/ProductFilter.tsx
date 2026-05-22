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
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 – $50", min: 25, max: 50 },
  { label: "$50 – $100", min: 50, max: 100 },
  { label: "$100 – $250", min: 100, max: 250 },
  { label: "$250 – $500", min: 250, max: 500 },
  { label: "$500+", min: 500, max: Infinity },
];

interface Props {
  products: Product[];
}

export default function ProductFilter({ products }: Props) {
  const [activeRange, setActiveRange] = useState<Range>(RANGES[0]);

  const filtered = products.filter(
    (p) => p.priceNum >= activeRange.min && p.priceNum < activeRange.max
  );

  const hasAny = (range: Range) =>
    products.some((p) => p.priceNum >= range.min && p.priceNum < range.max);

  return (
    <div>
      {/* Price filter bar */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Filter by Price
        </p>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((range) => {
            const active = activeRange.label === range.label;
            const available = hasAny(range);
            return (
              <button
                key={range.label}
                onClick={() => setActiveRange(range)}
                disabled={!available && range.label !== "All Prices"}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : available || range.label === "All Prices"
                    ? "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
        {activeRange.label !== "All Prices" && (
          <p className="text-sm text-gray-500 mt-3">
            Showing <span className="font-bold text-gray-900">{filtered.length}</span> of{" "}
            <span className="font-bold text-gray-900">{products.length}</span> products
            {" "}
            <button
              onClick={() => setActiveRange(RANGES[0])}
              className="text-blue-600 font-bold hover:underline ml-1"
            >
              Clear filter
            </button>
          </p>
        )}
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold text-gray-700 text-lg mb-1">No products in this range yet</p>
          <p className="text-gray-400 text-sm mb-5">We&apos;re always adding new picks</p>
          <button
            onClick={() => setActiveRange(RANGES[0])}
            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
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
                  <AdSlot slot="5566778899" style="rectangle" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
