import { Product, affiliateUrl, amazonImageUrl } from "@/data/products";
import productHealth from "@/data/product-health.json";

interface Props {
  products: Product[];
}

// Server-rendered spec comparison — every cell comes from the product data, not copy.
export default function ComparisonTable({ products }: Props) {
  if (products.length < 2) return null;
  const health = productHealth as Record<string, { imageUrl?: string; isLive?: boolean }>;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-white">At a Glance — Full Comparison</h2>
        <span className="text-xs text-gray-500">ratings from Amazon · prices approximate</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-700/50 bg-gray-900">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-700/50 text-left">
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide w-10">#</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Product</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Price</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Rating</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide hidden md:table-cell">Strongest Point</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const isTop = p.badge === "🏆 Best Overall";
              const imgUrl = health[p.asin]?.imageUrl ?? amazonImageUrl(p.asin);
              return (
                <tr
                  key={p.id}
                  className={`border-b border-gray-800/60 last:border-0 transition-colors hover:bg-white/[0.03] ${
                    isTop ? "bg-yellow-400/[0.04]" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-black text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={p.name} width={36} height={36} loading="lazy" className="w-9 h-9 object-contain rounded-lg bg-gray-800 shrink-0" />
                      <div>
                        <p className="font-bold text-gray-100 leading-snug">{p.name}</p>
                        {p.badge && <p className="text-xs text-blue-400 font-semibold mt-0.5">{p.badge}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-blue-400 whitespace-nowrap">{p.price}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-yellow-400">★</span>{" "}
                    <span className="text-gray-200 font-bold">{p.rating}</span>{" "}
                    <span className="text-gray-500 text-xs">({p.reviewCount.toLocaleString()})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{p.pros[0]}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={affiliateUrl(p.name, p.asin, health[p.asin]?.isLive)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-block bg-gray-800 hover:bg-yellow-400 hover:text-gray-900 text-gray-300 font-bold text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
