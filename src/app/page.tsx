import Link from "next/link";
import { getFeaturedProducts, affiliateUrl, categoryEmoji, categoryColor } from "@/data/products";
import { articles } from "@/data/articles";
import AdSlot from "@/components/AdSlot";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white px-8 py-14 mb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center select-none pointer-events-none">💻</div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            All picks under $50
          </span>
          <h1 className="text-4xl font-black mb-4 leading-tight">
            Best Budget Tech That&apos;s Actually Worth Buying
          </h1>
          <p className="text-blue-100 text-lg mb-6">
            We cut through the noise and find the best affordable tech gadgets for your home office, commute, and everyday life.
          </p>
          <Link
            href="/best-usb-c-hubs-under-50"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors"
          >
            See Top Picks →
          </Link>
        </div>
      </section>

      {/* Top ad */}
      <AdSlot slot="1234567890" style="horizontal" className="mb-10" />

      {/* Featured picks */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">⭐ Editor&apos;s Top Picks</h2>
          <span className="text-sm text-gray-500">Updated May 2025</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featured.map((product) => {
            const url = affiliateUrl(product.asin);
            const emoji = categoryEmoji[product.category] ?? "🛒";
            const color = categoryColor[product.category] ?? "bg-gray-100 text-gray-700";
            return (
              <a
                key={product.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 flex gap-4 items-center group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${color}`}>
                  {emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-brand-600 transition-colors">
                    {product.name}
                  </p>
                  <p className="text-brand-600 font-black text-lg">{product.price}</p>
                  <div className="flex mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-xs ${i < Math.round(product.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Category cards */}
      <section className="mb-14">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {articles.map((article) => {
            const emoji = categoryEmoji[article.category] ?? "🛒";
            const color = categoryColor[article.category] ?? "bg-gray-100 text-gray-700";
            return (
              <Link
                key={article.slug}
                href={`/${article.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-brand-500 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
                    {emoji}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full ${color}`}>
                    {article.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{article.metaDescription}</p>
                <span className="inline-block mt-3 text-sm text-brand-600 font-bold">
                  See picks →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 mb-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-black text-brand-600">12+</p>
            <p className="text-sm text-gray-600">Products Reviewed</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand-600">$50</p>
            <p className="text-sm text-gray-600">Max Price</p>
          </div>
          <div>
            <p className="text-3xl font-black text-brand-600">4.4★</p>
            <p className="text-sm text-gray-600">Avg. Rating</p>
          </div>
        </div>
      </section>

      {/* Bottom ad */}
      <AdSlot slot="0987654321" style="horizontal" className="mt-4" />
    </div>
  );
}
