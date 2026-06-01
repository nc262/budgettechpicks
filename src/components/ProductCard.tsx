"use client";

import { Product, affiliateUrl, amazonImageUrl, amazonImageFallback, amazonImageFallback2, categoryEmoji, categoryColor } from "@/data/products";
import productHealth from "@/data/product-health.json";
import { RedditInsight } from "./ProductFilter";

interface Props {
  product: Product;
  rank?: number;
  redditInsight?: RedditInsight;
  isCompareSelected?: boolean;
  onToggleCompare?: () => void;
  compareDisabled?: boolean;
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

export default function ProductCard({ product, rank, redditInsight, isCompareSelected = false, onToggleCompare, compareDisabled = false }: Props) {
  const stars = Math.round(product.rating);
  const url = affiliateUrl(product.name);
  // Use n8n-verified image URL if available, otherwise fall back to CDN pattern
  const healthData = (productHealth as Record<string, { imageUrl?: string; isLive?: boolean }>)[product.asin];
  const imgUrl = healthData?.imageUrl ?? amazonImageUrl(product.asin);
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
        isCompareSelected
          ? "border-2 border-blue-400 shadow-blue-500/20"
          : isTopPick
          ? "border-l-4 border-l-yellow-400 border-t border-r border-b border-gray-700/50"
          : "border-gray-700/50"
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
                  const state = parseInt(t.dataset.imgState ?? "0", 10);
                  if (state === 0) { t.dataset.imgState = "1"; t.src = imgFallback; }
                  else if (state === 1) { t.dataset.imgState = "2"; t.src = imgFallback2; }
                  else {
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
              {onToggleCompare && (
                <button
                  onClick={onToggleCompare}
                  disabled={compareDisabled}
                  title={compareDisabled ? "Max 4 products" : isCompareSelected ? "Remove from comparison" : "Add to comparison"}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${
                    isCompareSelected
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/60 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/60"
                      : compareDisabled
                      ? "bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:border-blue-400/60 hover:text-blue-300 hover:bg-blue-500/10"
                  }`}
                >
                  {isCompareSelected ? "⊖ Remove" : "⚖️ Compare"}
                </button>
              )}
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

        {/* Reddit Insight — inline per product */}
        {redditInsight && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">💬</span>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Reddit Says</span>
              {/* Subreddit badge — extracted from sourceUrl */}
              {redditInsight.sourceUrl && (() => {
                const match = redditInsight.sourceUrl.match(/reddit\.com\/r\/([^/]+)/);
                return match ? (
                  <span className="text-xs text-gray-500 bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5">
                    r/{match[1]}
                  </span>
                ) : null;
              })()}
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${
                redditInsight.sentiment === "positive" ? "bg-green-400/10 text-green-400 border-green-400/30" :
                redditInsight.sentiment === "negative" ? "bg-red-400/10 text-red-400 border-red-400/30" :
                "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}>
                {redditInsight.sentiment === "positive" ? "👍 Loved" : redditInsight.sentiment === "negative" ? "👎 Mixed" : "😐 Neutral"}
              </span>
            </div>
            <p className="text-xs text-gray-400 italic leading-relaxed mb-2">&ldquo;{redditInsight.summary}&rdquo;</p>
            {/* ⚠️ Prominent complaint callout — only when real con data exists */}
            {redditInsight.cons.length > 0 && (
              <div className="flex items-start gap-1.5 bg-amber-400/5 border border-amber-400/20 rounded-lg px-2.5 py-1.5 mb-2">
                <span className="text-amber-400 text-xs shrink-0">⚠</span>
                <p className="text-xs text-amber-300/80">Users frequently mention: <span className="font-medium">{redditInsight.cons[0]}</span></p>
              </div>
            )}
            {redditInsight.pros.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {redditInsight.pros.slice(0, 3).map((p, i) => (
                  <span key={i} className="text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">✓ {p}</span>
                ))}
              </div>
            )}
            {/* Last scraped date + source link */}
            <div className="flex items-center justify-between mt-1">
              {redditInsight.scrapedAt && (
                <span className="text-xs text-gray-600">
                  Live Data · Updated {new Date(redditInsight.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              {redditInsight.sourceUrl && (
                <a href={redditInsight.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-gray-600 hover:text-orange-400 transition-colors">
                  📎 Source →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}