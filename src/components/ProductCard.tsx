import Image from "next/image";
import { Product, affiliateUrl } from "@/data/products";

interface Props {
  product: Product;
  rank?: number;
}

export default function ProductCard({ product, rank }: Props) {
  const stars = "★".repeat(Math.round(product.rating)) + "☆".repeat(5 - Math.round(product.rating));
  const url = affiliateUrl(product.asin);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        {/* Rank badge */}
        {rank && (
          <div className="hidden sm:flex items-start pt-1">
            <span className="bg-brand-600 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">
              {rank}
            </span>
          </div>
        )}

        {/* Product image */}
        <a href={url} target="_blank" rel="noopener noreferrer sponsored" className="shrink-0 mx-auto sm:mx-0">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={120}
            height={120}
            className="object-contain rounded"
            unoptimized
          />
        </a>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <a href={url} target="_blank" rel="noopener noreferrer sponsored">
            <h3 className="font-semibold text-gray-900 hover:text-brand-600 transition-colors leading-tight mb-1">
              {product.name}
            </h3>
          </a>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-sm">{stars}</span>
            <span className="text-sm text-gray-500">
              {product.rating} ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xl font-bold text-gray-900">{product.price}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors text-center"
            >
              Check Price on Amazon →
            </a>
          </div>

          {/* Pros & Cons */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <ul className="space-y-1">
              {product.pros.map((p) => (
                <li key={p} className="flex gap-1 text-green-700">
                  <span>✓</span> {p}
                </li>
              ))}
            </ul>
            <ul className="space-y-1">
              {product.cons.map((c) => (
                <li key={c} className="flex gap-1 text-red-600">
                  <span>✗</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
