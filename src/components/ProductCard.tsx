"use client";

import { Product, affiliateUrl, amazonImageUrl, amazonImageFallback, categoryEmoji, categoryColor } from "@/data/products";

interface Props {
  product: Product;
  rank?: number;
}

const badgeColors: Record<string, string> = {
  "🏆 Best Overall": "bg-yellow-400 text-yellow-900",
  "💰 Best Value": "bg-green-100 text-green-800",
  "🔥 Editor's Pick": "bg-orange-100 text-orange-800",
  "💎 Hidden Gem": "bg-purple-100 text-purple-800",
  "🤯 Overkill Mode": "bg-red-100 text-red-800",
  "🚀 Most Popular": "bg-blue-100 text-blue-800",
  "🎯 Best for Work": "bg-teal-100 text-teal-800",
  "🎮 Gamer Approved": "bg-indigo-100 text-indigo-800",
  "⚡ Budget Beast": "bg-lime-100 text-lime-800",
  "✨ Staff Fave": "bg-pink-100 text-pink-800",
};

const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-gray-300 text-gray-700",
  3: "bg-amber-600 text-white",
};

export default function ProductCard({ product, rank }: Props) {
  const stars = Math.round(product.rating);
  const url = affiliateUrl(product.asin);
  const imgUrl = amazonImageUrl(product.asin);
  const imgFallback = amazonImageFallback(product.asin);
  const emoji = categoryEmoji[product.category] ?? "🛒";
  const colorClass = categoryColor[product.category] ?? "bg-gray-100 text-gray-700";
  const badgeColor = product.badge ? (badgeColors[product.badge] ?? "bg-gray-100 text-gray-700") : null;
  const isTopPick = rank === 1;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden relative ${
        isTopPick ? "border-l-4 border-l-yellow-400 border-t border-r border-b border-gray-100" : "border-gray-100"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Image + badge */}
          <div className="relative shrink-0">
            {rank && rank <= 3 && (
              <span
                className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10 shadow-md ${rankColors[rank]}`}
              >
                {rank}
              </span>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer sponsored">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={product.name}
                width={100}
                height={100}
                className="rounded-xl object-contain bg-gray-50 w-24 h-24"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.src !== imgFallback) {
                    t.src = imgFallback;
                  } else {
                    t.style.display = "none";
                    const next = t.nextElementSibling as HTMLElement | null;
                    if (next) next.style.display = "flex";
                  }
                }}
              />
              <div
                className={`hidden w-24 h-24 rounded-xl items-center justify-center text-4xl ${colorClass}`}
              >
                {emoji}
              </div>
            </a>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1">
                {rank && rank > 3 && (
                  <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                    #{rank} Pick
                  </span>
                )}
                <a href={url} target="_blank" rel="noopener noreferrer sponsored">
                  <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors leading-snug">
                    {product.name}
                  </h3>
                </a>
              </div>
              {badgeColor && product.badge && (
                <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>
                  {product.badge}
                </span>
              )}
            </div>

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
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                🛒 View on Amazon →
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