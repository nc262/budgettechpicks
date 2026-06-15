import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug, articles } from "@/data/articles";
import { getProductsByArticle, products as allSiteProducts, affiliateUrl, amazonImageUrl, categoryEmoji } from "@/data/products";
import ProductFilter, { RedditInsight } from "@/components/ProductFilter";
import AdSlot from "@/components/AdSlot";
import HeroProductCard from "@/components/HeroProductCard";
import ComparisonTable from "@/components/ComparisonTable";
import NewsletterSignup from "@/components/NewsletterSignup";
import ByLine from "@/components/ByLine";
import { AUTHOR } from "@/data/author";
import { vsPages } from "@/data/vs-pages";
import redditInsightsData from "@/data/reddit-insights.json";
import productHealth from "@/data/product-health.json";
import autoProductsRaw from "@/data/auto-products.json";

const SITE_URL = "https://totaltechpicks.com";

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
  pros?: string[];
  cons?: string[];
  rating?: number;
  reviewCount?: number;
  sourceUrl?: string;
  sourceSubreddit?: string;
  mentions?: number;
  addedAt?: string;
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const health = productHealth as Record<string, { imageUrl?: string; isLive?: boolean }>;
  // Cross-category guides (gifts) curate existing products by ASIN; normal guides own a slug
  const allProducts = article.curatedAsins
    ? article.curatedAsins
        .map((asin) => allSiteProducts.find((p) => p.asin === asin))
        .filter((p): p is NonNullable<typeof p> => !!p)
    : getProductsByArticle(params.slug);
  // Hide products marked as discontinued by n8n health check
  const products = allProducts.filter(p => health[p.asin]?.isLive !== false);

  // SHOW_AUTO_PICKS gates ALL auto-generated content off during AdSense review — the
  // AI "Community Picks", the inline "Reddit Says" snippets, and the freshness stamp.
  // The site then shows only human-written reviews. Set NEXT_PUBLIC_SHOW_AUTO_PICKS=1
  // (in Cloudflare env) to re-enable everything once approved.
  const SHOW_AUTO_PICKS = process.env.NEXT_PUBLIC_SHOW_AUTO_PICKS === "1";

  const redditData = SHOW_AUTO_PICKS
    ? (redditInsightsData as Record<string, { lastUpdated: string; insights: RedditInsight[] }>)[params.slug]
    : undefined;
  // Build a lookup map: normalized product name → insight (for inline card display)
  const redditByProduct: Record<string, RedditInsight> = {};
  if (redditData?.insights) {
    for (const insight of redditData.insights) {
      redditByProduct[insight.product.toLowerCase()] = insight;
      // Also index by productSlug if present
      if (insight.productSlug) redditByProduct[insight.productSlug] = insight;
    }
  }
  // Auto-discovered community picks for this slug (hidden if their listing goes dead).
  const autoPicks = SHOW_AUTO_PICKS
    ? (autoProductsRaw as AutoProduct[]).filter(
        p => p.articleSlug === params.slug && health[p.asin]?.isLive !== false
      )
    : [];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: article.title,
    url: `${SITE_URL}/${params.slug}`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: affiliateUrl(p.name, p.asin),
      name: p.name,
    })),
  };

  const faqJsonLd = article.faq && article.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

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
      {/* Plain script tags (not next/script) so structured data is present in the static HTML */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Category Hero */}
      {heroProduct && (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#0a0e1a] to-blue-950 text-white px-4 py-14">
          <div className="orb-float absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="orb-float-2 absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Left: title + intro */}
              <div className="flex-1 text-center lg:text-left">
                <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                  {categoryEmoji[article.category] ?? "🛒"} {article.category}
                </span>
                <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-[1.05] tracking-tight">{article.title}</h1>
                <p className="text-gray-300 text-base max-w-xl mb-2 leading-relaxed">{article.intro}</p>
                <p className="text-gray-500 text-xs">
                  Guide updated {article.updatedAt}
                  {redditData?.lastUpdated && (
                    <>
                      {" · "}
                      <span className="text-blue-400/80">
                        community intel refreshed{" "}
                        {new Date(redditData.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </>
                  )}
                </p>
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
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-400 transition-colors font-medium">Home</Link>
        <span>›</span>
        <span className="text-gray-300 font-semibold">{article.category}</span>
      </nav>

      {/* Author byline — E-E-A-T */}
      <ByLine updated={article.updatedAt} className="mb-4" />

      {/* Affiliate disclosure — required before any affiliate links */}
      <p className="text-xs text-gray-500 mb-8 leading-relaxed">
        This page contains affiliate links. If you buy through them, we earn a small commission from Amazon at no
        extra cost to you. It doesn&apos;t change what we recommend — but you deserve to know before you click.
      </p>

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

      {/* Top ad */}
      <AdSlot slot="5229018783" style="horizontal" className="mb-8" />

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

      {/* How we picked — methodology */}
      {article.howWePicked && (
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 mb-8">
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wide mb-2">How we picked</h2>
          <p className="text-sm text-gray-400 leading-relaxed">{article.howWePicked}</p>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
            Every pick in this guide is re-verified against Amazon nightly, so you&apos;ll only ever see
            products you can actually buy today.
          </p>
        </div>
      )}

      {/* Spec comparison table — generated from product data */}
      <ComparisonTable products={products} />

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
            {article.buyingGuide.map((tip, i) => (
              <div key={i} className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5 glow-card transition-all duration-200">
                <p className="font-bold text-sm mb-1.5 text-blue-300">{tip.heading}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Head-to-Head verdicts */}
      {article.headToHead && article.headToHead.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-white">Head-to-Head</h2>
            <span className="text-xs text-gray-500">the matchups readers actually ask about</span>
          </div>
          <div className="space-y-4">
            {article.headToHead.map((h, i) => {
              const vsPage = vsPages.find((v) => v.matchup === h.matchup);
              return (
                <div key={i} className="bg-gradient-to-br from-gray-900 to-blue-950/40 rounded-2xl border border-gray-700/50 p-5 glow-card transition-all duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full uppercase tracking-wide">VS</span>
                    <h3 className="font-bold text-gray-100">{h.matchup}</h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{h.verdict}</p>
                  {vsPage && (
                    <Link href={`/vs/${vsPage.slug}`} className="inline-block text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors mt-2">
                      Full side-by-side comparison →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ */}
      {article.faq && article.faq.length > 0 && (
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-black text-white mb-5">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {article.faq.map((f, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
                <h3 className="font-bold text-gray-100 mb-2">{f.question}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom ad */}
      <AdSlot slot="7683791736" style="horizontal" className="mt-4 mb-8" />

      {/* Community Picks — sourced from Reddit discussions */}
      {autoPicks.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-white">Community Picks</h2>
            <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">From Reddit</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Spotted automatically in Reddit discussions and screened against Amazon ratings before appearing here.
            Promising — but not yet through our full editorial review like the ranked list above.
          </p>
          <div className="grid gap-3">
            {autoPicks.map((pick) => (
              <div key={pick.asin} className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  {pick.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pick.imageUrl} alt={pick.name} width={60} height={60} loading="lazy" className="w-14 h-14 object-contain rounded-lg bg-gray-700 shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center text-2xl shrink-0">
                      {categoryEmoji[pick.category ?? ""] ?? "🛒"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm leading-snug">{pick.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      {pick.price && <span className="text-blue-400 font-black text-sm">{pick.price}</span>}
                      {pick.rating && (
                        <span className="text-xs text-gray-400">
                          <span className="text-yellow-400">★</span> {pick.rating}
                          {pick.reviewCount ? ` (${pick.reviewCount.toLocaleString()})` : ""}
                        </span>
                      )}
                    </div>
                    {pick.description && <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{pick.description}</p>}
                  </div>
                  <a
                    href={affiliateUrl(pick.name, pick.asin)}
                    target="_blank" rel="noopener noreferrer sponsored"
                    className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xs px-3 py-2 rounded-lg transition-all"
                  >
                    View →
                  </a>
                </div>
                {((pick.pros?.length ?? 0) > 0 || (pick.cons?.length ?? 0) > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(pick.pros ?? []).map((p, i) => (
                      <span key={`p${i}`} className="text-xs text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">✓ {p}</span>
                    ))}
                    {(pick.cons ?? []).map((c, i) => (
                      <span key={`c${i}`} className="text-xs text-red-400 bg-red-400/10 rounded-full px-2 py-0.5">✗ {c}</span>
                    ))}
                  </div>
                )}
                {pick.sourceUrl && (
                  <p className="text-xs text-gray-600 mt-2">
                    Spotted in{" "}
                    <a href={pick.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors underline decoration-gray-700">
                      r/{pick.sourceSubreddit ?? "reddit"}
                    </a>
                    {pick.addedAt && ` · ${new Date(pick.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </p>
                )}
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

      {/* Newsletter */}
      <NewsletterSignup className="mt-8" />
      </div>
    </div>
  );
}