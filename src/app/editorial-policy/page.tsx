import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Editorial Policy — TotalTechPicks",
  description:
    "How TotalTechPicks researches products, updates recommendations, handles affiliate disclosures, and publishes corrections.",
  alternates: { canonical: "https://totaltechpicks.com/editorial-policy" },
};

const principles = [
  {
    title: "Reader First",
    body: "Recommendations are made for buyer outcomes, not commissions. If a cheaper product performs better, it ranks higher.",
  },
  {
    title: "Evidence Over Marketing",
    body: "We compare specs, user feedback patterns, and independent test sources. Vendor claims are never treated as final proof.",
  },
  {
    title: "Transparent Tradeoffs",
    body: "Every top pick includes downsides. We do not publish all-positive lists or hide known weaknesses.",
  },
  {
    title: "Maintenance and Updates",
    body: "Pages are reviewed regularly for pricing changes, product availability, and new alternatives worth replacing older picks.",
  },
  {
    title: "Corrections Policy",
    body: "If we publish incorrect information, we correct it and update the article revision date as quickly as possible.",
  },
  {
    title: "Affiliate Independence",
    body: "Affiliate links support operations but do not influence ranking order. We do not sell positions in our lists.",
  },
];

const reviewProcess = [
  "Define buyer intent for the category (budget, use case, must-have features)",
  "Shortlist candidates from reputable brands and high-signal community recommendations",
  "Compare performance, reliability, and long-term value against category alternatives",
  "Filter out products with repeated durability, firmware, or support complaints",
  "Publish ranked picks with explicit reasons and practical buying tips",
  "Revisit the page when products are discontinued, overpriced, or outclassed",
];

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-14">
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 inline-block mb-6">
          ← Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Editorial Policy</h1>
        <p className="text-gray-400 leading-relaxed mb-10">
          This page explains how TotalTechPicks evaluates products and keeps recommendations useful. It exists so readers and ad partners can clearly see our quality standards.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-black text-white mb-4">Core Principles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {principles.map((item) => (
              <div key={item.title} className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 bg-gray-900 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-white mb-3">How We Build a Buying Guide</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300 text-sm leading-relaxed">
            {reviewProcess.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="mb-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-black text-white mb-3">Affiliate and Ad Disclosure</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            TotalTechPicks participates in affiliate programs, including Amazon Associates. If you buy through qualifying links, we may earn a commission at no additional cost to you.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Ad placements are separated from editorial decisions. No advertiser or merchant can pay to be ranked higher in a product list.
          </p>
        </section>

        <section className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-black text-white mb-3">Contact and Corrections</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Spot an inaccuracy or outdated recommendation? Send details and source links and we will review quickly.
          </p>
          <Link href="/contact" className="text-blue-400 hover:text-blue-300 font-bold text-sm">
            Submit a correction or feedback →
          </Link>
        </section>
      </div>
    </main>
  );
}
