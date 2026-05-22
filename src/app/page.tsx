import Link from "next/link";
import { getFeaturedProducts, affiliateUrl, amazonImageUrl, categoryEmoji, categoryColor } from "@/data/products";
import { articles } from "@/data/articles";
import AdSlot from "@/components/AdSlot";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div>
      {/* Hero — dark tech gradient */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              🔥 All picks under $50 · Updated May 2025
            </span>
            <h1 className="text-5xl font-black mb-5 leading-tight">
              Best Budget Tech<br />
              <span className="text-blue-400">That&apos;s Actually Worth It</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mb-8">
              25+ honest reviews across gaming gear, smart home, desk toys, earbuds, and more. No fluff. No paid placements. Just the best stuff under $50.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/best-gaming-gear-under-50" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                🎮 Gaming Gear →
              </Link>
              <Link href="/best-desk-toys-under-50" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                🧲 Desk Toys →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Top ad */}
        <AdSlot slot="1234567890" style="horizontal" className="mb-10" />

        {/* Featured picks */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">⭐ Editor&apos;s Top Picks</h2>
            <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">All under $50</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {featured.map((product) => {
              const url = affiliateUrl(product.asin);
              const imgUrl = amazonImageUrl(product.asin);
              const emoji = categoryEmoji[product.category] ?? "🛒";
              const color = categoryColor[product.category] ?? "bg-gray-100 text-gray-700";
              return (
                <a
                  key={product.id}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="w-20 h-20 object-contain mb-3 rounded-lg"
                    onError={(e) => {
                      const t = e.currentTarget;
                      t.style.display = "none";
                      const next = t.nextElementSibling as HTMLElement | null;
                      if (next) next.style.display = "flex";
                    }}
                  />
                  <div className={`hidden w-20 h-20 rounded-xl items-center justify-center text-3xl mb-3 ${color}`}>
                    {emoji}
                  </div>
                  <p className="font-bold text-gray-900 text-xs leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </p>
                  <p className="text-blue-600 font-black">{product.price}</p>
                </a>
              );
            })}
          </div>
        </section>

        {/* Category grid */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Browse All Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {articles.map((article) => {
              const emoji = categoryEmoji[article.category] ?? "🛒";
              const color = categoryColor[article.category] ?? "bg-gray-100 text-gray-700";
              return (
                <Link
                  key={article.slug}
                  href={`/${article.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group flex flex-col items-center text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${color}`}>
                    {emoji}
                  </div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm leading-snug">
                    {article.category}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">See picks →</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-gradient-to-r from-gray-900 to-blue-950 rounded-2xl p-6 mb-10 text-white">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-blue-400">25+</p>
              <p className="text-xs text-gray-400 mt-1">Products Reviewed</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">8</p>
              <p className="text-xs text-gray-400 mt-1">Categories</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">$50</p>
              <p className="text-xs text-gray-400 mt-1">Max Price</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">4.5★</p>
              <p className="text-xs text-gray-400 mt-1">Avg. Rating</p>
            </div>
          </div>
        </section>

        {/* Bottom ad */}
        <AdSlot slot="0987654321" style="horizontal" />
      </div>
    </div>
  );
}

