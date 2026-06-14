import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { products, affiliateUrl, amazonImageUrl, categoryEmoji, liveReviewCount } from "@/data/products";
import { reviews } from "@/data/reviews";
import { getArticleBySlug } from "@/data/articles";
import productHealth from "@/data/product-health.json";
import redditInsightsData from "@/data/reddit-insights.json";
import AdSlot from "@/components/AdSlot";
import NewsletterSignup from "@/components/NewsletterSignup";
import ByLine from "@/components/ByLine";
import { AUTHOR } from "@/data/author";

const SITE_URL = "https://totaltechpicks.com";

interface Props {
  params: { id: string };
}

// Only products with a written deep review get a page — no thin content
export async function generateStaticParams() {
  return Object.keys(reviews)
    .filter((id) => products.some((p) => p.id === id))
    .map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = products.find((p) => p.id === params.id);
  const take = reviews[params.id];
  if (!product || !take) return {};
  const url = `${SITE_URL}/reviews/${params.id}`;
  const title = `${product.name} Review: ${take.whyItWins.split(".")[0]}.`.slice(0, 70);
  const description = `${take.whoItsFor.split(".")[0]}. Long-term ownership notes, who should skip it, and what real owners say.`.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

const SECTIONS = [
  { key: "whyItWins", label: "Why it wins", color: "text-blue-300", border: "border-blue-500/30" },
  { key: "whoItsFor", label: "Who it's for", color: "text-green-300", border: "border-green-500/30" },
  { key: "longTerm", label: "How it holds up long-term", color: "text-purple-300", border: "border-purple-500/30" },
  { key: "watchOut", label: "Watch out for", color: "text-amber-300", border: "border-amber-500/30" },
] as const;

export default function ReviewPage({ params }: Props) {
  const product = products.find((p) => p.id === params.id);
  const take = reviews[params.id];
  if (!product || !take) notFound();

  const health = (productHealth as Record<string, { imageUrl?: string; isLive?: boolean }>)[product.asin];
  const url = affiliateUrl(product.name, product.asin, health?.isLive);
  const imgUrl = health?.imageUrl ?? amazonImageUrl(product.asin);
  const article = getArticleBySlug(product.articleSlug);

  // Matching Reddit insight, if the pipeline has one for this product
  const slugInsights = (redditInsightsData as Record<string, { insights: { product: string; summary: string; sentiment: string; sourceUrl?: string }[] }>)[product.articleSlug];
  const insight = slugInsights?.insights?.find(
    (i) => i.product.toLowerCase().replace(/[^a-z0-9]+/g, "") === product.name.toLowerCase().replace(/[^a-z0-9]+/g, "")
  );

  const updatedLabel = article?.updatedAt ?? "June 2026";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: `${product.name} Review`,
    description: take.whyItWins.split(".")[0],
    author: { "@type": "Person", name: AUTHOR.name, url: `${SITE_URL}/about`, jobTitle: AUTHOR.role },
    publisher: { "@type": "Organization", name: "TotalTechPicks", url: SITE_URL },
    datePublished: "2026-01-15",
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntityOfPage: `${SITE_URL}/reviews/${params.id}`,
    image: imgUrl.startsWith("http") ? imgUrl : `${SITE_URL}${imgUrl}`,
    itemReviewed: { "@type": "Product", name: product.name, image: imgUrl.startsWith("http") ? imgUrl : `${SITE_URL}${imgUrl}` },
    reviewRating: { "@type": "Rating", ratingValue: product.rating, bestRating: 5 },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: article?.category ?? "Reviews", item: `${SITE_URL}/${product.articleSlug}` },
      { "@type": "ListItem", position: 3, name: `${product.name} Review`, item: `${SITE_URL}/reviews/${params.id}` },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-400 transition-colors font-medium">Home</Link>
        <span>›</span>
        <Link href={`/${product.articleSlug}`} className="hover:text-blue-400 transition-colors font-medium">
          {article?.category ?? "Guide"}
        </Link>
        <span>›</span>
        <span className="text-gray-300 font-semibold">Review</span>
      </nav>

      <p className="text-xs text-gray-500 mb-8 leading-relaxed">
        This review contains affiliate links — we earn a small commission if you buy through them, at no extra
        cost to you. It doesn&apos;t change our verdicts.
      </p>

      {/* Product header */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt={product.name} width={160} height={160} className="w-40 h-40 object-contain rounded-xl bg-gray-800 mx-auto sm:mx-0" />
          <div className="flex-1">
            <span className="inline-block text-xs font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-full mb-2">
              {categoryEmoji[product.category] ?? "🛒"} {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 tracking-tight">
              {product.name} Review
            </h1>
            <ByLine updated={updatedLabel} className="mb-2" />
            <p className="text-sm text-gray-400 mb-3">
              <span className="text-yellow-400">★</span> {product.rating} · {liveReviewCount(product.asin, product.reviewCount).toLocaleString()} Amazon ratings
              {product.badge && <span className="ml-2 text-blue-400 font-semibold">{product.badge}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-black text-blue-400">{product.price}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
              >
                Check price on Amazon →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The take */}
      <div className="space-y-5 mb-8">
        {SECTIONS.map((s) => (
          <section key={s.key} className={`bg-gray-900 rounded-2xl border-l-4 ${s.border} border-t border-r border-b border-gray-700/50 p-5`}>
            <h2 className={`text-sm font-bold uppercase tracking-wide mb-2 ${s.color}`}>{s.label}</h2>
            <p className="text-gray-300 leading-relaxed">{take[s.key]}</p>
          </section>
        ))}
      </div>

      {/* Pros & cons */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
          <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-2">Pros</p>
          <ul className="space-y-1.5">
            {product.pros.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-gray-300"><span className="text-green-500 shrink-0">✓</span> {p}</li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Cons</p>
          <ul className="space-y-1.5">
            {product.cons.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-gray-300"><span className="text-red-400 shrink-0">✗</span> {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reddit signal */}
      {insight && (
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 mb-8">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-2">What Reddit says</p>
          <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{insight.summary}&rdquo;</p>
          {insight.sourceUrl && (
            <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-orange-400 transition-colors mt-2 inline-block">
              Source thread →
            </a>
          )}
        </div>
      )}

      <AdSlot slot="7683791736" style="horizontal" className="mb-8" />

      {/* CTA + back to guide */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-lg font-black mb-2">Bottom line</h2>
        <p className="text-blue-100 text-sm leading-relaxed mb-4">{take.whyItWins.split(".")[0]}. {take.whoItsFor.split(".")[0]}.</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            Check price on Amazon →
          </a>
          <Link
            href={`/${product.articleSlug}`}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            See all {article?.category ?? "category"} picks
          </Link>
        </div>
      </div>

      <NewsletterSignup />
    </div>
  );
}
