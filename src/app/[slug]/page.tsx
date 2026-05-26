import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { getArticleBySlug, articles } from "@/data/articles";
import { getProductsByArticle, affiliateUrl, amazonImageUrl } from "@/data/products";
import ProductFilter from "@/components/ProductFilter";
import AdSlot from "@/components/AdSlot";

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
  const ogImage = products[0] ? amazonImageUrl(products[0].asin) : `${SITE_URL}/og-default.png`;
  const url = `${SITE_URL}/${params.slug}`;
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: { canonical: url },
    keywords: [article.category, "budget tech", "best value", "review", "under $50", "affiliate picks"],
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

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const products = getProductsByArticle(params.slug);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-blue-600 transition-colors font-medium">Home</Link>
        <span>›</span>
        <span className="text-gray-600 font-semibold">{article.category}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
          {article.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">{article.title}</h1>
        <p className="text-sm text-gray-400 mb-4">Last updated: {article.updatedAt}</p>
        <p className="text-lg text-gray-700 leading-relaxed">{article.intro}</p>
      </div>

      {/* TL;DR Quick Picks */}
      {article.tldr && article.tldr.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-lg uppercase tracking-wide">TL;DR — Our Top Picks</span>
          </div>
          <div className="space-y-3">
            {article.tldr.map((pick, i) => (
              <a
                key={i}
                href={affiliateUrl(pick.asin)}
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

      {/* Affiliate disclosure */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 mb-8">
        <strong>Affiliate Disclosure:</strong> This page contains Amazon affiliate links. If you
        buy through our links we earn a small commission at no extra cost to you. This helps us
        keep the site running. ❤️
      </div>

      {/* Editor's Note */}
      {article.editorNote && (
        <div className="border-l-4 border-blue-500 bg-blue-50 rounded-r-2xl p-5 mb-8 flex gap-4 items-start">
          <div className="text-3xl shrink-0">🎙️</div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Editor&apos;s Note</p>
            <p className="text-gray-800 italic leading-relaxed">&ldquo;{article.editorNote}&rdquo;</p>
            <p className="text-xs text-gray-400 mt-2">— The TotalTechPicks Team</p>
          </div>
        </div>
      )}

      {/* Product list with price filter */}
      <ProductFilter products={products} />

      {/* Buying Guide */}
      {article.buyingGuide && article.buyingGuide.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl font-black text-gray-900">Buying Guide — What to Look For</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {article.buyingGuide.map((tip, i) => {
              const colors = [
                "bg-blue-50 border-blue-100",
                "bg-green-50 border-green-100",
                "bg-orange-50 border-orange-100",
                "bg-purple-50 border-purple-100",
              ];
              const headingColors = [
                "text-blue-800",
                "text-green-800",
                "text-orange-800",
                "text-purple-800",
              ];
              return (
                <div key={i} className={`border rounded-xl p-4 ${colors[i % 4]}`}>
                  <p className={`font-bold text-sm mb-1 ${headingColors[i % 4]}`}>{tip.heading}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom ad */}
      <AdSlot slot="7683791736" style="horizontal" className="mt-4 mb-8" />

      {/* Our Verdict */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
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
    </div>
  );
}