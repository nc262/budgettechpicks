"use client";

import { Product, affiliateUrl, amazonImageUrl, liveReviewCount } from "@/data/products";
import productHealth from "@/data/product-health.json";

interface Props {
  products: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ROW_LABELS = [
  { key: "price",   label: "Price" },
  { key: "rating",  label: "Rating" },
  { key: "reviews", label: "Reviews" },
  { key: "badge",   label: "Badge" },
  { key: "pros",    label: "Pros" },
  { key: "cons",    label: "Cons" },
] as const;

function ReviewBar({ rating }: { rating: number }) {
  const pct = (rating / 5) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-yellow-400 font-bold text-xs whitespace-nowrap">{rating} ★</span>
    </div>
  );
}

export default function CompareDrawer({ products, onRemove, onClear }: Props) {
  if (products.length < 2) return null;

  const health = productHealth as Record<string, { imageUrl?: string }>;

  function cell(product: Product, key: typeof ROW_LABELS[number]["key"]) {
    switch (key) {
      case "price":
        return <span className="font-black text-blue-400 text-base">{product.price}</span>;
      case "rating":
        return (
          <div className="w-full">
            <ReviewBar rating={product.rating} />
            <p className="text-xs text-gray-400 mt-1">{liveReviewCount(product.asin, product.reviewCount).toLocaleString()} reviews</p>
          </div>
        );
      case "reviews":
        return null; // folded into rating row
      case "badge":
        return product.badge
          ? <span className="text-xs font-bold text-gray-200">{product.badge}</span>
          : <span className="text-xs text-gray-400">—</span>;
      case "pros":
        return (
          <ul className="space-y-1">
            {product.pros.slice(0, 3).map((p, i) => (
              <li key={i} className="text-xs text-green-400 flex gap-1.5 items-start">
                <span className="shrink-0 mt-0.5">✓</span>{p}
              </li>
            ))}
          </ul>
        );
      case "cons":
        return (
          <ul className="space-y-1">
            {product.cons.slice(0, 3).map((c, i) => (
              <li key={i} className="text-xs text-red-400 flex gap-1.5 items-start">
                <span className="shrink-0 mt-0.5">✕</span>{c}
              </li>
            ))}
          </ul>
        );
    }
  }

  const rows = ROW_LABELS.filter(r => r.key !== "reviews");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
      {/* Backdrop fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none -top-12" />

      <div className="relative bg-gray-950 border-t-2 border-blue-500/60 max-h-[80vh] overflow-y-auto">
        {/* Header bar */}
        <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <span className="font-black text-white text-sm">
              Comparing {products.length} products
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">— select up to 4</span>
          </div>
          <button
            onClick={onClear}
            className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10 border border-gray-700 hover:border-red-400/30"
          >
            Clear all
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-4 pb-6">
          <table className="w-full min-w-[480px] text-left border-collapse">
            {/* Product header row */}
            <thead>
              <tr>
                <th className="w-24 py-4 pr-4 text-xs font-bold text-gray-400 uppercase tracking-wider align-top" />
                {products.map((p) => {
                  const imgUrl = health[p.asin]?.imageUrl ?? amazonImageUrl(p.asin);
                  return (
                    <th key={p.id} className="py-4 px-3 align-top min-w-[140px]">
                      <div className="flex flex-col items-center text-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={p.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-contain rounded-xl bg-gray-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://m.media-amazon.com/images/P/${p.asin}.01._SX300_QL70_.jpg`;
                          }}
                        />
                        <p className="text-xs font-bold text-white leading-snug line-clamp-2">{p.name}</p>
                        <button
                          onClick={() => onRemove(p.id)}
                          className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                          aria-label={`Remove ${p.name} from comparison`}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Data rows */}
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={row.key}
                  className={rowIdx % 2 === 0 ? "bg-gray-900/60" : ""}
                >
                  <td className="py-3 pr-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap align-top">
                    {row.label}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-3 px-3 align-top">
                      {cell(p, row.key)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* CTA row */}
              <tr>
                <td className="py-3 pr-4" />
                {products.map((p) => (
                  <td key={p.id} className="py-3 px-3">
                    <a
                      href={affiliateUrl(p.name)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="block w-full text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                    >
                      Buy →
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
