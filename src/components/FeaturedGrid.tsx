"use client";

import { Product, affiliateUrl, amazonImageUrl, amazonImageFallback, amazonImageFallback2, categoryEmoji, categoryColor } from "@/data/products";
import productHealth from "@/data/product-health.json";

export default function FeaturedGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {products.map((product) => {
        const url = affiliateUrl(product.name, product.asin);
        const healthData = (productHealth as Record<string, { imageUrl?: string }>)[product.asin];
        const imgUrl = healthData?.imageUrl ?? amazonImageUrl(product.asin);
        const imgFallback = amazonImageFallback(product.asin);
        const imgFallback2 = amazonImageFallback2(product.asin);
        const emoji = categoryEmoji[product.category] ?? "🛒";
        const color = categoryColor[product.category] ?? "bg-gray-800 text-gray-300";
        return (
          <a
            key={product.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="bg-gray-900 rounded-2xl border border-gray-700/50 p-4 hover:shadow-lg hover:shadow-blue-900/30 hover:border-blue-500/50 transition-all duration-200 flex flex-col items-center text-center group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={product.name}
              className="w-20 h-20 object-contain mb-3 rounded-lg bg-gray-800"
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
            <div className={`hidden w-20 h-20 rounded-xl items-center justify-center text-3xl mb-3 ${color}`}>
              {emoji}
            </div>
            <p className="font-bold text-gray-100 text-xs leading-snug mb-1 group-hover:text-blue-400 transition-colors">
              {product.name}
            </p>
            <p className="text-blue-400 font-black">{product.price}</p>
          </a>
        );
      })}
    </div>
  );
}
