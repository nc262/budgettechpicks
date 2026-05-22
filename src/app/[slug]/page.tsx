import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug, articles } from "@/data/articles";
import { getProductsByArticle } from "@/data/products";
import ProductFilter from "@/components/ProductFilter";
import AdSlot from "@/components/AdSlot";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.metaDescription,
    openGraph: { title: article.title, description: article.metaDescription },
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
        <p className="text-sm text-brand-600 font-semibold uppercase tracking-wide mb-2">
          {article.category}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
        <p className="text-sm text-gray-500">Last updated: {article.updatedAt}</p>
        <p className="mt-4 text-gray-700 leading-relaxed">{article.intro}</p>
      </div>

      {/* Top ad */}
      <AdSlot slot="1122334455" style="horizontal" className="mb-8" />

      {/* Affiliate disclosure */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 mb-8">
        <strong>Affiliate Disclosure:</strong> This page contains Amazon affiliate links. If you
        buy through our links we earn a small commission at no extra cost to you. This helps us
        keep the site running.
      </div>

      {/* Product list with price filter */}
      <ProductFilter products={products} />

      {/* Bottom ad */}
      <AdSlot slot="9988776655" style="horizontal" className="mt-10" />

      {/* Bottom summary */}
      <div className="mt-10 p-5 bg-gray-100 rounded-xl">
        <h2 className="font-bold text-gray-900 mb-2">Our Verdict</h2>
        <p className="text-sm text-gray-700">
          All picks on this page were selected based on real customer reviews, price-to-value
          ratio, and long-term reliability. We update this list regularly to ensure the
          recommendations stay current.
        </p>
      </div>
    </div>
  );
}
