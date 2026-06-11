import Link from "next/link";
import type { Metadata } from "next";
import { getFeaturedProducts, products as allProducts, categoryEmoji, categoryColor, affiliateUrl } from "@/data/products";
import { articles } from "@/data/articles";
import AdSlot from "@/components/AdSlot";
import FeaturedGrid from "@/components/FeaturedGrid";
import HeroProductCard from "@/components/HeroProductCard";
import SetupItemImage from "@/components/SetupItemImage";
import productHealth from "@/data/product-health.json";
import redditInsightsData from "@/data/reddit-insights.json";

interface IntelItem {
  product: string;
  productSlug?: string;
  summary: string;
  sentiment: string;
  sourceUrl?: string;
  scrapedAt?: string;
  commentCount?: number;
}

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
  {
    icon: "🔍",
    title: "Researched, not lab-tested",
    body: "We don't pretend to have a test lab. Picks are built from spec sheets, teardowns, and thousands of long-term owner reports — and we tell you where each conclusion comes from.",
  },
  {
    icon: "💬",
    title: "Real Reddit feedback, cited",
    body: "Product pages pull in what actual owners say in subreddit discussions — including the complaints — with links to the source threads so you can read them yourself.",
  },
  {
    icon: "🤖",
    title: "Checked against Amazon nightly",
    body: "An automated job verifies every product listing each night. Discontinued or dead listings get pulled instead of leading you to a broken page.",
  },
  {
    icon: "💰",
    title: "Affiliate-funded, honestly",
    body: "We earn a commission if you buy through our links — that's the business model, stated plainly. No brand pays for placement, and a product we wouldn't buy doesn't get listed.",
  },
];

export default function HomePage() {
  const health = productHealth as Record<string, { imageUrl?: string; isLive?: boolean; checkedAt?: string }>;
  const isLive = (asin: string) => health[asin]?.isLive !== false;

  const featured = getFeaturedProducts().filter((p) => isLive(p.asin));
  const topRatedPicks = allProducts
    .filter((p) => (p.badge === "🏆 Best Overall" || p.badge === "🔥 Editor's Pick") && isLive(p.asin))
    .slice(0, 6);

  // Featured hero product — highest-rated "Best Overall" that's still purchasable
  const heroProduct = allProducts
    .filter((p) => p.badge === "🏆 Best Overall" && isLive(p.asin))
    .sort((a, b) => b.rating - a.rating)[0];

  // Real numbers, computed from data — not marketing copy
  const trackedCount = allProducts.length;
  const liveCount = allProducts.filter((p) => isLive(p.asin)).length;
  const categoryCount = articles.length;
  const lastChecked = Object.values(health)
    .map((h) => h.checkedAt)
    .filter(Boolean)
    .sort()
    .pop();
  const lastCheckedLabel = lastChecked
    ? new Date(lastChecked).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  // Marquee strip: badged, verified-live picks with images
  const marqueePicks = allProducts
    .filter((p) => p.badge && isLive(p.asin) && health[p.asin]?.imageUrl)
    .slice(0, 14);

  // Most recent community intel across all guides — refreshed by the pipeline every 8 hours
  const latestIntel: (IntelItem & { slug: string })[] = Object.entries(
    redditInsightsData as Record<string, { lastUpdated: string; insights: IntelItem[] }>
  )
    .flatMap(([slug, data]) => (data.insights || []).map((i) => ({ ...i, slug })))
    .filter((i) => i.scrapedAt && i.summary && (i.commentCount ?? 0) > 0)
    .sort((a, b) => new Date(b.scrapedAt!).getTime() - new Date(a.scrapedAt!).getTime())
    .slice(0, 4);

  return (
    <div>
      {/* Plain script tag (not next/script) so structured data is present in the static HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#0a0e1a] to-blue-950 text-white px-4 py-20">
        {/* Glow orbs */}
        <div className="orb-float absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="orb-float-2 absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                {liveCount} picks tracked{lastCheckedLabel ? ` · verified ${lastCheckedLabel}` : ""}
              </span>
              <h1 className="text-5xl lg:text-6xl font-black mb-5 leading-[1.05] tracking-tight">
                Less Hype.<br />
                <span className="text-gradient">More Hardware.</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl mb-3 leading-relaxed">
                Tech picks built from spec sheets, owner reports, and real Reddit threads — with sources you can check.
              </p>
              <p className="text-gray-500 text-sm max-w-lg mb-8">
                {categoryCount} categories covering gaming, audio, streaming, home office, and more.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link href="#staff-picks" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/25">
                  See the picks →
                </Link>
                <Link href="/about" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/10 hover:border-blue-400/30">
                  How we work
                </Link>
                <Link href="/my-setup" className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/10 hover:border-blue-400/30">
                  My real setup
                </Link>
              </div>
            </div>

            {/* Right: featured product card */}
            {heroProduct && (
              <div className="shrink-0 w-full lg:w-72">
                <HeroProductCard product={heroProduct} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Verified picks marquee — every item passed last night's listing check */}
      {marqueePicks.length >= 6 && (
        <div className="border-y border-gray-800/60 bg-gray-950/60 py-3">
          <div className="marquee">
            <div className="marquee-track">
              {[...marqueePicks, ...marqueePicks].map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  href={`/${p.articleSlug}`}
                  className="flex items-center gap-2.5 shrink-0 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(productHealth as Record<string, { imageUrl?: string }>)[p.asin]?.imageUrl ?? `/images/products/${p.asin}.jpg`}
                    alt={p.name}
                    width={32}
                    height={32}
                    loading="lazy"
                    className="w-8 h-8 object-contain rounded-lg bg-gray-800"
                  />
                  <span className="text-xs font-bold text-gray-300 whitespace-nowrap">{p.name}</span>
                  <span className="text-xs font-black text-blue-400 whitespace-nowrap">{p.price}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Top ad */}
        <AdSlot slot="5229018783" style="horizontal" className="mb-10" />

        {/* Featured picks */}
        <section className="mb-14" id="staff-picks">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">Editor&apos;s Top Picks</h2>
            <span className="text-sm text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full border border-gray-700/50">All price ranges</span>
          </div>
          <FeaturedGrid products={featured} />
        </section>

        {/* Top rated picks */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-black text-white">Highest-Rated Picks</h2>
            <span className="text-xs text-gray-500 ml-1">our &ldquo;Best Overall&rdquo; winners across categories</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {topRatedPicks.map((product) => {
              const emoji = categoryEmoji[product.category] ?? "🛒";
              const color = categoryColor[product.category] ?? "bg-gray-800 text-gray-300";
              return (
                <div
                  key={product.id}
                  className="bg-gray-900 rounded-2xl border border-gray-700/50 p-4 glow-card transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {product.asin ? (
                      <SetupItemImage
                        asin={product.asin}
                        imageUrl={(productHealth as Record<string, { imageUrl?: string }>)[product.asin]?.imageUrl}
                        name={product.name}
                        className="w-10 h-10 object-contain rounded-xl bg-gray-800 shrink-0"
                        fallback={<div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>{emoji}</div>}
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${color}`}>{emoji}</div>
                    )}
                    {product.badge && (
                      <span className="text-xs font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full leading-tight">{product.badge}</span>
                    )}
                  </div>
                  <Link href={`/${product.articleSlug}`} className="group flex-1">
                    <p className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors text-sm leading-snug">{product.name}</p>
                    <p className="text-xs text-blue-400 font-black mt-0.5">{product.price}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium group-hover:text-gray-400 transition-colors">Full review →</p>
                  </Link>
                  <a
                    href={affiliateUrl(product.name, product.asin)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-3 w-full text-center bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-gray-900 font-bold text-xs px-3 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-yellow-400/20 hover:shadow-md"
                  >
                    View on Amazon →
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Latest community intel — live data from the pipeline */}
        {latestIntel.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-white">Latest Community Intel</h2>
              <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Auto-refreshed every 8h
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              What real owners are saying right now — pulled from live Reddit threads and summarized, with sources.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {latestIntel.map((intel, i) => (
                <div key={i} className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 glow-card transition-all duration-200 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link href={`/${intel.slug}`} className="font-bold text-gray-100 hover:text-blue-400 transition-colors text-sm leading-snug">
                      {intel.product}
                    </Link>
                    <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border ${
                      intel.sentiment === "positive" ? "bg-green-400/10 text-green-400 border-green-400/30" :
                      intel.sentiment === "negative" ? "bg-red-400/10 text-red-400 border-red-400/30" :
                      "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }`}>
                      {intel.sentiment === "positive" ? "Positive" : intel.sentiment === "negative" ? "Negative" : "Mixed"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed italic flex-1">&ldquo;{intel.summary}&rdquo;</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-600">
                      {intel.commentCount} comments analyzed
                      {intel.scrapedAt && ` · ${new Date(intel.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </span>
                    {intel.sourceUrl && (
                      <a href={intel.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-orange-400 font-semibold transition-colors">
                        Source thread →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category grid */}
        <section className="mb-14">
          <h2 className="text-2xl font-black text-white mb-2">Browse All Categories</h2>
          <p className="text-gray-400 mb-6 text-sm">From $10 budget finds to premium picks. Every category has something for every wallet.</p>
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

        {/* Stats bar — every number here is computed from site data, not written by hand */}
        <section className="bg-gradient-to-r from-gray-900 to-blue-950 rounded-2xl p-6 mb-10 text-white border border-gray-700/50 glow-blue">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-blue-400">{liveCount}</p>
              <p className="text-xs text-gray-400 mt-1">Live Picks</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">{categoryCount}</p>
              <p className="text-xs text-gray-400 mt-1">Categories</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">{trackedCount - liveCount}</p>
              <p className="text-xs text-gray-400 mt-1">Dead Listings Pulled</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-400">Nightly</p>
              <p className="text-xs text-gray-400 mt-1">Listing Checks</p>
            </div>
          </div>
        </section>

        {/* Why Trust Us — authority section */}
        <section className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">Why Trust TotalTechPicks?</h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto">
              Honestly? You shouldn&apos;t trust any review site by default — including this one.
              Here&apos;s exactly how this site works, so you can judge for yourself.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
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