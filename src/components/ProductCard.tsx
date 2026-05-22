"use client";

import { Product, affiliateUrl, amazonImageUrl, categoryEmoji, categoryColor } from "@/data/products";

interface Props {
  product: Product;
  rank?: number;
}

export default function ProductCard({ product, rank }: Props) {
  const stars = Math.round(product.rating);
  const url = affiliateUrl(product.asin);
  const imgUrl = amazonImageUrl(product.asin);
  const emoji = categoryEmoji[product.category] ?? "🛒";
  const colorClass = categoryColor[product.category] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Product image */}
          <a href={url} target="_blank" rel="noopener noreferrer sponsored" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={product.name}
              width={100}
              height={100}
              className="rounded-xl object-contain bg-gray-50 w-24 h-24"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = "none";
                const next = t.nextElementSibling as HTMLElement | null;
                if (next) next.style.display = "flex";
              }}
            />
            <div
              className={`hidden w-24 h-24 rounded-xl items-center justify-center text-4xl ${colorClass}`}
            >
              {emoji}
            </div>
          </a>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {rank && (
              <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                #{rank} Pick
              </span>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer sponsored">
              <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors leading-snug mb-1">
                {product.name}
              </h3>
            </a>

            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < stars ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.rating} ({product.reviewCount.toLocaleString()})
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-black text-gray-900">{product.price}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                View on Amazon →
              </a>
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1.5">Pros</p>
            <ul className="space-y-1">
              {product.pros.map((p) => (
                <li key={p} className="flex gap-1.5 text-xs text-gray-700">
                  <span className="text-green-500 shrink-0">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1.5">Cons</p>
            <ul className="space-y-1">
              {product.cons.map((c) => (
                <li key={c} className="flex gap-1.5 text-xs text-gray-700">
                  <span className="text-red-400 shrink-0">✗</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

