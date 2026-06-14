import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { budgetGuides, getBudgetGuide } from "@/data/budget-guides";
import { categoryEmoji } from "@/data/products";
import { articles } from "@/data/articles";
import ComparisonTable from "@/components/ComparisonTable";
import ProductCard from "@/components/ProductCard";
import AdSlot from "@/components/AdSlot";
import NewsletterSignup from "@/components/NewsletterSignup";

const SITE_URL = "https://totaltechpicks.com";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return budgetGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = getBudgetGuide(params.slug);
  if (!g) return {};
  const url = `${SITE_URL}/best/${params.slug}`;
  return {
    title: g.title,
    description: g.metaDescription,
    alternates: { canonical: url },
    keywords: [`best ${g.category.toLowerCase()} under $${g.threshold}`, `cheap ${g.category.toLowerCase()}`, "budget tech", "2026"],
    openGraph: { title: g.title, description: g.metaDescription, url, type: "article" },
  };
}

export default function BudgetGuidePage({ params }: Props) {
  const g = getBudgetGuide(params.slug);
  if (!g) notFound();

  // Link back to the full category guide if one exists
  const categoryArticle = articles.find((a) => a.category === g.category);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: g.title,
    url: `${SITE_URL}/best/${params.slug}`,
    numberOfItems: g.products.length,
    itemListElement: g.products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}/best/${params.slug}`,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [{
      "@type": "Question",
      name: `What is the best ${g.category.toLowerCase()} under $${g.threshold}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Our top pick is the ${g.products[0].name} (${g.products[0].price}) — ${g.products[0].rating}★ across ${g.products[0].reviewCount.toLocaleString()} Amazon ratings. We rank ${g.products.length} options under $${g.threshold} by rating, review volume, and long-term reliability.`,
      },
    }],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-[#0a0e1a] to-blue-950 text-white px-4 py-14">
        <div className="orb-float absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            {categoryEmoji[g.category] ?? "🛒"} Under ${g.threshold}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-4 leading-[1.05] tracking-tight">{g.title}</h1>
          <p className="text-gray-300 text-base max-w-2xl leading-relaxed">{g.intro}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-400 transition-colors font-medium">Home</Link>
          <span>›</span>
          {categoryArticle ? (
            <Link href={`/${categoryArticle.slug}`} className="hover:text-blue-400 transition-colors font-medium">{g.category}</Link>
          ) : (
            <span>{g.category}</span>
          )}
          <span>›</span>
          <span className="text-gray-300 font-semibold">Under ${g.threshold}</span>
        </nav>

        <p className="text-xs text-gray-500 mb-8 leading-relaxed">
          This page contains affiliate links — we earn a small commission if you buy through them, at no extra cost to you.
        </p>

        <ComparisonTable products={g.products} />

        <AdSlot slot="5229018783" style="horizontal" className="mb-8" />

        <div className="space-y-6">
          {g.products.map((product, i) => (
            <ProductCard key={product.id} product={product} rank={i + 1} />
          ))}
        </div>

        {categoryArticle && (
          <div className="mt-10 text-center">
            <Link
              href={`/${categoryArticle.slug}`}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
            >
              See the full {g.category} guide →
            </Link>
          </div>
        )}

        <NewsletterSignup className="mt-10" />
      </div>
    </div>
  );
}
