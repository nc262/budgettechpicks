'use client';

import { affiliateUrl, amazonImageUrl, amazonImageFallback, amazonImageFallback2 } from "@/data/products";

interface Product {
  asin: string;
  name: string;
  category: string;
  price: string;
  rating: number;
}

export default function HeroProductCard({ product }: { product: Product }) {
  const nobsScore = Math.round(product.rating * 2 * 10) / 10;

  return (
    <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 glow-blue">
      <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-lg">
        🏆 Best Overall
      </div>
      <a href={affiliateUrl(product.name)} target="_blank" rel="noopener noreferrer sponsored" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={amazonImageUrl(product.asin)}
          alt={product.name}
          className="w-full h-40 object-contain bg-gray-800/50 rounded-xl mb-4"
          onError={(e) => {
            const t = e.currentTarget;
            const fb1 = amazonImageFallback(product.asin);
            const fb2 = amazonImageFallback2(product.asin);
            if (t.src !== fb1) { t.src = fb1; }
            else if (t.src !== fb2) { t.src = fb2; }
            else { t.style.display = 'none'; }
          }}
        />
        <p className="text-xs text-blue-400 font-bold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-bold text-white text-sm leading-snug mb-3">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-blue-400">{product.price}</span>
          <span className="text-xs font-black px-2 py-1 rounded-full border bg-green-400/10 text-green-400 border-green-400/30">
            ⚡ {nobsScore}/10
          </span>
        </div>
        <div className="mt-4 w-full text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition-all">
          View on Amazon →
        </div>
      </a>
    </div>
  );
}
