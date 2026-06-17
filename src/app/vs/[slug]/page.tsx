import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { vsPages, getVsPage } from "@/data/vs-pages";
import { affiliateUrl, amazonImageUrl, Product, liveReviewCount } from "@/data/products";
import { reviews } from "@/data/reviews";
import productHealth from "@/data/product-health.json";
import AdSlot from "@/components/AdSlot";
import NewsletterSignup from "@/components/NewsletterSignup";

const SITE_URL = "https://totaltechpicks.com";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return vsPages.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vs = getVsPage(params.slug);
  if (!vs) return {};
  const url = `${SITE_URL}/vs/${params.slug}`;
  const title = `${vs.matchup}: Which Should You Buy? (2026)`.slice(0, 70);
  const description = vs.verdict.split(".").slice(0, 2).join(".").slice(0, 160) + ".";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

function ContenderCard({ product }: { product: Product }) {
  const health = (productHealth as Record<string, { imageUrl?: string; isLive?: boolean }>)[product.asin];
  const url = affiliateUrl(product.name, product.asin, health?.isLive);
  const imgUrl = health?.imageUrl ?? amazonImageUrl(product.asin);
  const hasReview = !!reviews[product.id];
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 flex flex-col items-center text-center glow-card transition-all duration-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgUrl} alt={product.name} width={120} height={120} loading="lazy" className="w-28 h-28 object-contain rounded-xl bg-gray-800 mb-3" />
      <p className="font-bold text-white leading-snug mb-1">{product.name}</p>
      <p className="text-xs text-gray-400 mb-1">
        <span className="text-yellow-400">★</span> {product.rating} · {liveReviewCount(product.asin, product.reviewCount).toLocaleString()} ratings
      </p>
      <p className="text-xl font-black text-blue-400 mb-3">{product.price}</p>
      <div className="flex flex-col gap-2 w-full mt-auto">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          Check price →
        </a>
        {hasReview && (
          <Link href={`/reviews/${product.id}`} className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Read our full review
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VsPage({ params }: Props) {
  const vs = getVsPage(params.slug);
  if (!vs) notFound();

  // Pull each contender's hand-written take so the comparison carries real
  // editorial substance, not just a one-paragraph verdict.
  const takeA = vs.a ? reviews[vs.a.id] : undefined;
  const takeB = vs.b ? reviews[vs.b.id] : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${vs.matchup}: Which Should You Buy?`,
    description: vs.verdict.split(".")[0],
    author: { "@type": "Organization", name: "TotalTechPicks", url: SITE_URL },
    publisher: { "@type": "Organization", name: "TotalTechPicks", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/vs/${params.slug}`,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-400 transition-colors font-medium">Home</Link>
        <span>›</span>
        <Link href={`/${vs.articleSlug}`} className="hover:text-blue-400 transition-colors font-medium">{vs.category}</Link>
        <span>›</span>
        <span className="text-gray-300 font-semibold">Head-to-Head</span>
      </nav>

      <p className="text-xs text-gray-400 mb-8 leading-relaxed">
        This page contains affiliate links — we earn a small commission if you buy through them, at no extra cost to you.
      </p>

      <div className="text-center mb-8">
        <span className="inline-block text-xs font-black text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full uppercase tracking-wide mb-3">Head-to-Head</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
          {vs.matchup}
        </h1>
        <p className="text-gray-400 text-sm mt-2">Which should you actually buy? Here&apos;s our verdict.</p>
      </div>

      {/* Contenders */}
      {(vs.a || vs.b) && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8 items-stretch">
          {vs.a && <ContenderCard product={vs.a} />}
          {vs.b && <ContenderCard product={vs.b} />}
        </div>
      )}

      {/* The case for each — sourced from our full hands-on reviews */}
      {(takeA || takeB) && (
        <section className="mb-8">
          <h2 className="text-xl font-black text-white mb-4">The case for each</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {([[vs.a, takeA], [vs.b, takeB]] as const).map(([p, take], i) =>
              p && take ? (
                <div key={i} className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
                  <h3 className="font-bold text-white leading-snug mb-3">{p.name}</h3>
                  <p className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-1">Why it wins</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">{take.whyItWins}</p>
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1">Watch out for</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{take.watchOut}</p>
                </div>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Verdict */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-950/40 rounded-2xl border border-gray-700/50 p-6 mb-8">
        <h2 className="text-sm font-bold text-blue-300 uppercase tracking-wide mb-3">Our verdict</h2>
        <p className="text-gray-200 leading-relaxed text-lg">{vs.verdict}</p>
      </div>

      <AdSlot slot="7683791736" style="horizontal" className="mb-8" />

      <div className="text-center mb-8">
        <Link
          href={`/${vs.articleSlug}`}
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
        >
          See every {vs.category} pick →
        </Link>
      </div>

      <NewsletterSignup />
    </div>
  );
}
