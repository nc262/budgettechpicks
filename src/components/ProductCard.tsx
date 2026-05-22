import { Product, affiliateUrl, categoryEmoji, categoryColor } from "@/data/products";

interface Props {
  product: Product;
  rank?: number;
}

export default function ProductCard({ product, rank }: Props) {
  const stars = Math.round(product.rating);
  const url = affiliateUrl(product.asin);
  const emoji = categoryEmoji[product.category] ?? "🛒";
  const colorClass = categoryColor[product.category] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon + rank */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${colorClass}`}>
              {emoji}
            </div>
            {rank && (
              <span className="text-xs font-bold text-gray-400">#{rank}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <a href={url} target="_blank" rel="noopener noreferrer sponsored">
              <h3 className="font-bold text-gray-900 hover:text-brand-600 transition-colors leading-snug mb-1">
                {product.name}
              </h3>
            </a>

            {/* Stars */}
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < stars ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} <span className="text-gray-400">({product.reviewCount.toLocaleString()})</span>
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.description}</p>

            {/* Price + CTA */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-2xl font-black text-gray-900">{product.price}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <span>View on Amazon</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="mt-2 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5">Pros</p>
            <ul className="space-y-1">
              {product.pros.map((p) => (
                <li key={p} className="flex gap-1.5 text-xs text-gray-700">
                  <span className="text-green-500 shrink-0">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1.5">Cons</p>
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
