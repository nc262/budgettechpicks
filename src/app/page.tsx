import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { getFeaturedProducts, products as allProducts, categoryEmoji, categoryColor } from "@/data/products";
import { articles } from "@/data/articles";
import AdSlot from "@/components/AdSlot";
import FeaturedGrid from "@/components/FeaturedGrid";

const SITE_URL = "https://totaltechpicks.com";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL, type: "website" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TotalTechPicks",
  url: SITE_URL,
  description: "Real-world tech recommendations, tested for performance, value, and practicality.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  const featured = getFeaturedProducts();
  const trendingPicks = allProducts
    .filter((p) => p.badge === "🏆 Best Overall" || p.badge === "🔥 Editor's Pick")
    .slice(0, 6);

  return (
    <div>
      <Script id="jsonld-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white px-4 py-20">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            🔥 125+ Products Reviewed · Updated May 2026
          </span>
          <h1 className="text-5xl font-black mb-4 leading-tight">
            Less Hype.<br />
            <span className="text-blue-400">More Hardware.</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mb-3">
            Real-world tech recommendations, tested for performance, value, and practicality. No fluff. No sponsored nonsense.
          </p>
          <p className="text-gray-500 text-sm max-w-lg mb-8">
            125+ picks across gaming, audio, streaming, home office, and more — from hidden $10 gems to premium splurges.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/best-gaming-gear-under-50" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              🔥 Best Tech Deals →
            </Link>
            <Link href="/about" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors border border-white/10">
              🧠 Buying Guides →
            </Link>
            <Link href="#staff-picks" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors border border-white/10">
              🛠 Staff Picks →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Top ad */}
        <AdSlot slot="5229018783" style="horizontal" className="mb-10" />

        {/* Featured picks */}
        <section className="mb-14" id="staff-picks">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">⭐ Editor&apos;s Top Picks</h2>
            <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">All price ranges</span>
          </div>
          <FeaturedGrid products={featured} />
        </section>

        {/* Trending This Week */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-black text-white">Trending This Week</h2>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ml-1">Hot</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {trendingPicks.map((product) => {
              const emoji = categoryEmoji[product.category] ?? "🛒";
              const color = categoryColor[product.category] ?? "bg-gray-800 text-gray-300";
              return (
                <Link
                  key={product.id}
                  href={`/${product.articleSlug}`}
                  className="bg-gray-900 rounded-2xl border border-gray-700/50 p-4 hover:shadow-lg hover:shadow-blue-900/30 hover:border-blue-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>
                      {emoji}
                    </div>
                    {product.badge && (
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">{product.badge}</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors text-sm leading-snug">
                    {product.name}
                  </p>
                  <p className="text-xs text-blue-400 mt-0.5">{product.price}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Read review →</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Category grid */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-white mb-2">Browse All Categories</h2>
          <p className="text-gray-400 mb-6 text-sm">From $10 budget finds to absolute god-tier gear. Every category has picks for every wallet.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {articles.map((article) => {
              const emoji = categoryEmoji[article.category] ?? "🛒";
              const color = categoryColor[article.category] ?? "bg-gray-800 text-gray-300";
              return (
                <Link
                  key={article.slug}
                  href={`/${article.slug}`}
                  className="bg-gray-900 rounded-2xl border border-gray-700/50 p-4 hover:shadow-lg hover:shadow-blue-900/30 hover:border-blue-500/50 transition-all duration-200 group flex flex-col items-center text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${color}`}>
                    {emoji}
                  </div>
                  <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors text-sm leading-snug">
                    {article.category}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">See picks →</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Mid ad */}
        <AdSlot slot="6127167489" style="horizontal" className="mb-10" />

        {/* Stats bar */}
        <section className="bg-gradient-to-r from-gray-900 to-blue-950 rounded-2xl p-6 mb-10 text-white border border-gray-700/50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-blue-400">125+</p>
              <p className="text-xs text-gray-400 mt-1">Products Reviewed</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">12</p>
              <p className="text-xs text-gray-400 mt-1">Categories</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">$10</p>
              <p className="text-xs text-gray-400 mt-1">Cheapest Pick</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">God Tier 🫡</p>
              <p className="text-xs text-gray-400 mt-1">Top of Price Range</p>
            </div>
          </div>
        </section>

        {/* Bottom ad */}
        <AdSlot slot="8753330826" style="horizontal" />
      </div>
    </div>
  );
}