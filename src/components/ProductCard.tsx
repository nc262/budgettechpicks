"use client";

import { Product, affiliateUrl, amazonImageUrl, amazonImageFallback, amazonImageFallback2, categoryEmoji, categoryColor } from "@/data/products";

interface Props {
  product: Product;
  rank?: number;
}

const badgeColors: Record<string, string> = {
  "🏆 Best Overall": "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30",
  "💰 Best Value": "bg-green-400/20 text-green-300 border border-green-400/30",
  "🔥 Editor's Pick": "bg-orange-400/20 text-orange-300 border border-orange-400/30",
  "💎 Hidden Gem": "bg-purple-400/20 text-purple-300 border border-purple-400/30",
  "🤯 Overkill Mode": "bg-red-400/20 text-red-300 border border-red-400/30",
  "🚀 Most Popular": "bg-blue-400/20 text-blue-300 border border-blue-400/30",
  "🎯 Best for Work": "bg-teal-400/20 text-teal-300 border border-teal-400/30",
  "🎮 Gamer Approved": "bg-indigo-400/20 text-indigo-300 border border-indigo-400/30",
  "⚡ Budget Beast": "bg-lime-400/20 text-lime-300 border border-lime-400/30",
  "✨ Staff Fave": "bg-pink-400/20 text-pink-300 border border-pink-400/30",
};

const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-gray-400 text-gray-900",
  3: "bg-amber-600 text-white",
};

function getScoreColor(score: number): string {
  if (score >= 9) return "text-green-400 border-green-400/30 bg-green-400/10";
  if (score >= 8) return "text-blue-400 border-blue-400/30 bg-blue-400/10";
  if (score >= 7) return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
  return "text-orange-400 border-orange-400/30 bg-orange-400/10";
}

export default function ProductCard({ product, rank }: Props) {
  const stars = Math.round(product.rating);
  const url = affiliateUrl(product.asin);
  const imgUrl = amazonImageUrl(product.asin);
  const imgFallback = amazonImageFallback(product.asin);
  const imgFallback2 = amazonImageFallback2(product.asin);
  const emoji = categoryEmoji[product.category] ?? "🛒";
  const colorClass = categoryColor[product.category] ?? "bg-gray-800 text-gray-300";
  const badgeColor = product.badge ? (badgeColors[product.badge] ?? "bg-gray-700 text-gray-300") : null;
  const isTopPick = rank === 1;
  const nobsScore = Math.round(product.rating * 2 * 10) / 10;
  const scoreColor = getScoreColor(nobsScore);

  return (
    <div
      className={`bg-gray-900 rounded-2xl border shadow-lg hover:shadow-blue-900/30 hover:shadow-xl transition-all duration-200 overflow-hidden relative ${
        isTopPick ? "border-l-4 border-l-yellow-400 border-t border-r border-b border-gray-700/50" : "border-gray-700/50"
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
                className="rounded-xl object-contain bg-gray-800 w-24 h-24"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.src !== imgFallback) {
                    t.src = imgFallback;
                  } else if (t.src !== imgFallback2) {
                    t.src = imgFallback2;
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
                  <span className="inline-block bg-gray-800 text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                    #{rank} Pick
                  </span>
                )}
                <a href={url} target="_blank" rel="noopener noreferrer sponsored">
                  <h3 className="font-bold text-white hover:text-blue-400 transition-colors leading-snug">
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

            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < stars ? "text-yellow-400" : "text-gray-600"}>★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  {product.rating} ({product.reviewCount.toLocaleString()})
                </span>
              </div>
              {/* No-BS Score */}
              <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${scoreColor}`}>
                ⚡ {nobsScore}/10
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-3 leading-relaxed">{product.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-black text-blue-400">{product.price}</span>
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
        <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-700/50">
          <div>
            <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-1.5">✓ Pros</p>
            <ul className="space-y-1">
              {product.pros.map((p) => (
                <li key={p} className="flex gap-1.5 text-xs text-gray-300">
                  <span className="text-green-500 shrink-0">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1.5">✗ Cons</p>
            <ul className="space-y-1">
              {product.cons.map((c) => (
                <li key={c} className="flex gap-1.5 text-xs text-gray-300">
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