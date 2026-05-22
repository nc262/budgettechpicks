import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, affiliateUrl } from "@/data/products";
import { articles } from "@/data/articles";
import AdSlot from "@/components/AdSlot";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Best Budget Tech Gadgets Under $50
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We test and review the best affordable tech so you can upgrade your
          setup without overspending. All picks are under $50 and available on
          Amazon.
        </p>
      </section>

      {/* Top ad */}
      <AdSlot slot="1234567890" style="horizontal" className="mb-10" />

      {/* Featured picks */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Editor's Top Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {featured.map((product) => {
            const url = affiliateUrl(product.asin);
            return (
              <a
                key={product.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex gap-4 items-center"
              >
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="object-contain rounded shrink-0"
                  unoptimized
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-snug mb-1">
                    {product.name}
                  </p>
                  <p className="text-brand-600 font-bold">{product.price}</p>
                  <p className="text-xs text-yellow-500 mt-1">
                    {"★".repeat(Math.round(product.rating))} {product.rating}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Category cards */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.slug}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-brand-500 transition-all group"
            >
              <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">{article.metaDescription}</p>
              <span className="inline-block mt-3 text-sm text-brand-600 font-medium">
                See picks →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom ad */}
      <AdSlot slot="0987654321" style="horizontal" className="mt-4" />
    </div>
  );
}
