import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { getArticleBySlug, articles } from "@/data/articles";
import { getProductsByArticle, affiliateUrl, amazonImageUrl, categoryEmoji } from "@/data/products";
import ProductFilter, { RedditInsight } from "@/components/ProductFilter";
import AdSlot from "@/components/AdSlot";
import HeroProductCard from "@/components/HeroProductCard";
import redditInsightsData from "@/data/reddit-insights.json";
import productHealth from "@/data/product-health.json";
import autoProductsRaw from "@/data/auto-products.json";

const SITE_URL = "https://totaltechpicks.com";

const reviewChecklist = [
  "Price-to-performance compared against at least 3 direct alternatives",
  "Recurring complaint patterns checked across user feedback and forums",
  "Spec sheet claims validated against independent tests where available",
  "Known weaknesses documented so buyers can make tradeoff decisions",
];

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};
  const products = getProductsByArticle(params.slug);
  const redditData = (redditInsightsData as Record<string, { lastUpdated: string; insights: RedditInsight[] }>)[params.slug];
  const ogImage = products[0] ? amazonImageUrl(products[0].asin) : `${SITE_URL}/og-default.png`;
  const url = `${SITE_URL}/${params.slug}`;
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: url },
    keywords: [article.category, "tech picks", "best value", "review", "top rated", "affiliate picks"],
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url,
      type: "article",
      images: [{ url: ogImage, width: 500, height: 500, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
      images: [ogImage],
    },
  };
}

interface AutoProduct {
  asin: string;
  name: string;
  price?: string;
  imageUrl?: string;
  articleSlug: string;
  category?: string;
  description?: string;
  sourceUrl?: string;
  addedAt?: string;
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const health = productHealth as Record<string, { imageUrl?: string; isLive?: boolean }>;
  const allProducts = getProductsByArticle(params.slug);
  // Hide products marked as discontinued by n8n health check
  const products = allProducts.filter(p => health[p.asin]?.isLive !== false);
  const discontinuedCount = allProducts.length - products.length;

  const redditData = (redditInsightsData as Record<string, { lastUpdated: string; insights: RedditInsight[] }>)[params.slug];
  // Build a lookup map: normalized product name → insight (for inline card display)
  const redditByProduct: Record<string, RedditInsight> = {};
  if (redditData?.insights) {
    for (const insight of redditData.insights) {
      redditByProduct[insight.product.toLowerCase()] = insight;
      // Also index by productSlug if present
      if (insight.productSlug) redditByProduct[insight.productSlug] = insight;
    }
  }
  // Auto-discovered community picks for this slug
  const autoPicks = (autoProductsRaw as AutoProduct[]).filter(p => p.articleSlug === params.slug);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: article.title,
    url: `${SITE_URL}/${params.slug}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: affiliateUrl(p.name),
      name: p.name,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: article.category, item: `${SITE_URL}/${params.slug}` },
    ],
  };

  // Best product for this category — "Best Overall" badge first, else top rated
  const heroProduct =
    products.find((p) => p.badge === "🏆 Best Overall") ??
    [...products].sort((a, b) => b.rating - a.rating)[0];

  return (
    <div>
      <Script id="jsonld-itemlist" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Script id="jsonld-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Category Hero */}
      {heroProduct && (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#0a0e1a] to-blue-950 text-white px-4 py-14">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Left: title + intro */}
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                  {categoryEmoji[article.category] ?? "🛒"} {article.category}
                </span>
                <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-[1.05]">{article.title}</h1>
                <p className="text-gray-300 text-base max-w-xl mb-2 leading-relaxed">{article.intro}</p>
                <p className="text-gray-500 text-xs">Last updated: {article.updatedAt}</p>
              </div>
              {/* Right: best product card */}
              <div className="shrink-0 w-full lg:w-72">
                <HeroProductCard product={heroProduct} />
              </div>
            </div>
          </div>
        </section>
      )}

    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-400 transition-colors font-medium">Home</Link>
        <span>›</span>
        <span className="text-gray-300 font-semibold">{article.category}</span>
      </nav>

      {/* TL;DR Quick Picks */}
      {article.tldr && article.tldr.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-6 mb-8 text-white border border-gray-700/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-lg uppercase tracking-wide">TL;DR — Our Top Picks</span>
          </div>
          <div className="space-y-3">
            {article.tldr.map((pick, i) => (
              <a
                key={i}
                href={affiliateUrl(pick.name, pick.asin)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-300 font-black text-lg w-6">{i + 1}.</span>
                  <div>
                    <p className="text-xs text-blue-300 font-bold uppercase tracking-wide">{pick.label}</p>
                    <p className="font-semibold text-white text-sm">{pick.name}</p>
                  </div>
                </div>
                <span className="text-blue-300 group-hover:text-white transition-colors text-sm font-bold shrink-0">
                  See it →
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Editor's Note */}
      {article.editorNote && (
        <div className="border-l-4 border-blue-500 bg-gray-900 rounded-r-2xl p-5 mb-8 flex gap-4 items-start border border-gray-700/50">
          <div className="text-3xl shrink-0">🎙️</div>
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Editor&apos;s Note</p>
            <p className="text-gray-300 italic leading-relaxed">&ldquo;{article.editorNote}&rdquo;</p>
            <p className="text-xs text-gray-500 mt-2">— The TotalTechPicks Team</p>
          </div>
        </div>
      )}

      {/* Product list with price filter */}
      <ProductFilter products={products} redditByProduct={redditByProduct} />

      {/* Buying Guide */}
      {article.buyingGuide && article.buyingGuide.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl font-black text-white">Buying Guide — What to Look For</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {article.buyingGuide.map((tip, i) => {
              const colors = [
                "bg-blue-500/10 border-blue-500/20",
                "bg-green-500/10 border-green-500/20",
                "bg-orange-500/10 border-orange-500/20",
                "bg-purple-500/10 border-purple-500/20",
              ];
              const headingColors = [
                "text-blue-300",
                "text-green-300",
                "text-orange-300",
                "text-purple-300",
              ];
              return (
                <div key={i} className={`border rounded-xl p-4 ${colors[i % 4]}`}>
                  <p className={`font-bold text-sm mb-1 ${headingColors[i % 4]}`}>{tip.heading}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{tip.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How we reviewed this category */}
      <section className="mb-8 bg-gray-900 rounded-2xl border border-gray-700/50 p-6">
        <h2 className="text-xl font-black text-white mb-2">How This List Was Reviewed</h2>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          This page is maintained with a repeatable process so recommendations stay useful over time. We update picks when pricing shifts, better options appear, or products are discontinued.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
          {reviewChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="mt-4 text-sm">
          <Link href="/editorial-policy" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Full editorial standards →
          </Link>
        </div>
      </section>

      {/* Community Picks — sourced from Reddit discussions */}
      {autoPicks.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🤖</span>
            <h2 className="text-xl font-black text-white">Community Picks</h2>
            <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">From Reddit</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Products spotted in Reddit discussions — not yet in our curated list.</p>
          <div className="grid gap-3">
            {autoPicks.map((pick) => (
              <div key={pick.asin} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
                {pick.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pick.imageUrl} alt={pick.name} width={60} height={60} className="w-14 h-14 object-contain rounded-lg bg-gray-700 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center text-2xl shrink-0">
                    {categoryEmoji[pick.category ?? ""] ?? "🛒"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm leading-snug">{pick.name}</p>
                  {pick.price && <p className="text-blue-400 font-black text-sm">{pick.price}</p>}
                  {pick.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{pick.description}</p>}
                </div>
                <a
                  href={`https://www.amazon.com/dp/${pick.asin}?tag=totaltechpicks-20`}
                  target="_blank" rel="noopener noreferrer sponsored"
                  className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xs px-3 py-2 rounded-lg transition-all"
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Our Verdict */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white border border-blue-500/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h2 className="text-lg font-black uppercase tracking-wide">Our Verdict</h2>
        </div>
        <p className="text-blue-100 leading-relaxed">{article.verdict}</p>
        <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
          <p className="text-xs text-blue-200">Was this helpful? Share it.</p>
          <Link
            href="/"
            className="text-sm font-bold bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors"
          >
            ← Back to all picks
          </Link>
        </div>
      </div>

      {/* Bottom ad */}
      <AdSlot slot="7683791736" style="horizontal" className="mt-8" />
      </div>
    </div>
  );
}