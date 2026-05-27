import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { getFeaturedProducts, products as allProducts, categoryEmoji, categoryColor, affiliateUrl, amazonImageUrl, amazonImageFallback } from "@/data/products";
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

const trustSignals = [
  { icon: "🔬", title: "Spec-Verified Picks", body: "We cross-reference specs, benchmarks, and real-world tests — not just box copy." },
  { icon: "🚫", title: "Zero Paid Placements", body: "No brand ever pays to be ranked here. Affiliate links fund the site, not our opinions." },
  { icon: "⚡", title: "No-BS Scoring", body: "Every product gets an honest score. A 6/10 means a 6/10, not a polite 8." },
  { icon: "📦", title: "Build Quality Focus", body: "We flag flimsy plastics, bad cables, and products that won't survive six months." },
  { icon: "💰", title: "Value Over Brand", body: "An unknown brand that outperforms a famous one gets ranked higher. Always." },
];

export default function HomePage() {
  const featured = getFeaturedProducts();
  const trendingPicks = allProducts
    .filter((p) => p.badge === "🏆 Best Overall" || p.badge === "🔥 Editor's Pick")
    .slice(0, 6);

  // Featured hero product — highest-rated "Best Overall"
  const heroProduct = allProducts
    .filter((p) => p.badge === "🏆 Best Overall")
    .sort((a, b) => b.rating - a.rating)[0];

  const heroNobsScore = heroProduct ? Math.round(heroProduct.rating * 2 * 10) / 10 : null;

  return (
    <div>
      <Script id="jsonld-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#0a0e1a] to-blue-950 text-white px-4 py-20">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                🔥 125+ Products Reviewed · Updated May 2026
              </span>
              <h1 className="text-5xl lg:text-6xl font-black mb-5 leading-[1.05]">
                Less Hype.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">More Hardware.</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl mb-3 leading-relaxed">
                Real-world tech recommendations tested for performance, value, and practicality. No fluff. No sponsored nonsense.
              </p>
              <p className="text-gray-500 text-sm max-w-lg mb-8">
                125+ picks across gaming, audio, streaming, home office, and more.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="/best-gaming-gear-under-50" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/25">
                  🔥 Best Tech Deals →
                </Link>
                <Link href="/about" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/10 hover:border-blue-400/30">
                  🧠 Buying Guides →
                </Link>
                <Link href="#staff-picks" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/10 hover:border-blue-400/30">
                  🛠 Staff Picks →
                </Link>
              </div>
            </div>

            {/* Right: featured product card */}
            {heroProduct && (
              <div className="shrink-0 w-full lg:w-72">
                <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5 glow-blue">
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    🏆 Best Overall
                  </div>
                  <a href={affiliateUrl(heroProduct.asin)} target="_blank" rel="noopener noreferrer sponsored" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={amazonImageUrl(heroProduct.asin)}
                      alt={heroProduct.name}
                      className="w-full h-40 object-contain bg-gray-800/50 rounded-xl mb-4"
                      onError={(e) => {
                        const t = e.currentTarget;
                        if (t.src !== amazonImageFallback(heroProduct.asin)) t.src = amazonImageFallback(heroProduct.asin);
                      }}
                    />
                    <p className="text-xs text-blue-400 font-bold uppercase tracking-wide mb-1">{heroProduct.category}</p>
                    <h3 className="font-bold text-white text-sm leading-snug mb-3">{heroProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-blue-400">{heroProduct.price}</span>
                      <span className="text-xs font-black px-2 py-1 rounded-full border bg-green-400/10 text-green-400 border-green-400/30">
                        ⚡ {heroNobsScore}/10
                      </span>
                    </div>
                    <div className="mt-4 w-full text-center bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition-all">
                      View on Amazon →
                    </div>
                  </a>
                </div>
              </div>
            )}
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
            <span className="text-sm text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/50">All price ranges</span>
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
                  className="bg-gray-900 rounded-2xl border border-gray-700/50 p-4 glow-card transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{emoji}</div>
                    {product.badge && (
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">{product.badge}</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors text-sm leading-snug">{product.name}</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {articles.map((article) => {
              const emoji = categoryEmoji[article.category] ?? "🛒";
              const color = categoryColor[article.category] ?? "bg-gray-800 text-gray-300";
              return (
                <Link
                  key={article.slug}
                  href={`/${article.slug}`}
                  className="bg-gray-900 rounded-2xl border border-gray-700/50 p-4 glow-card transition-all duration-200 group flex flex-col items-center text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${color}`}>{emoji}</div>
                  <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors text-sm leading-snug">{article.category}</p>
                  <p className="text-xs text-gray-500 mt-1">See picks →</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Mid ad */}
        <AdSlot slot="6127167489" style="horizontal" className="mb-10" />

        {/* Stats bar */}
        <section className="bg-gradient-to-r from-gray-900 to-blue-950 rounded-2xl p-6 mb-10 text-white border border-gray-700/50 glow-blue">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
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

        {/* Why Trust Us — authority section */}
        <section className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">Why Trust TotalTechPicks?</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              The internet is full of affiliate sludge. Here&apos;s what makes us different.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {trustSignals.map((signal) => (
              <div key={signal.title} className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 glow-card transition-all">
                <div className="text-3xl mb-3">{signal.icon}</div>
                <h3 className="font-bold text-white mb-1.5">{signal.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{signal.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/about" className="inline-block text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Read our full methodology →
            </Link>
          </div>
        </section>

        {/* Bottom ad */}
        <AdSlot slot="8753330826" style="horizontal" />
      </div>
    </div>
  );
}