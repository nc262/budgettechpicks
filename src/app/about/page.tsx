import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About TotalTechPicks — How We Pick, Why We're Different",
  description:
    "TotalTechPicks is an independent tech review site built on real-world testing, value analysis, and zero corporate sponsorships. Learn how we pick products and score them.",
  alternates: { canonical: "https://totaltechpicks.com/about" },
};

const methodology = [
  {
    icon: "🔬",
    title: "Real Specs, Not Marketing Copy",
    body: "We dig into spec sheets, chipsets, driver history, and real-world benchmarks — not the box quote. If a manufacturer says '10 hours battery life' we check what testers actually get.",
  },
  {
    icon: "💰",
    title: "Value Is Non-Negotiable",
    body: "A $200 mouse is only good if it performs like a $200 mouse. We evaluate everything against its price point and its competition. No free passes for brand names.",
  },
  {
    icon: "📦",
    title: "Build Quality Matters",
    body: "We look at materials, weight, cable quality, hinge mechanisms, and durability signals. A product that falls apart in six months is a bad product at any price.",
  },
  {
    icon: "🧑‍💻",
    title: "Who Actually Uses This?",
    body: "We contextualize picks for specific use cases — competitive gaming, remote work, content creation, EDC. The 'best overall' pick might not be best for you specifically.",
  },
  {
    icon: "⭐",
    title: "Amazon Reviews Are a Signal, Not the Verdict",
    body: "We analyze review patterns, look for recurring complaints, check Q&A sections, and cross-reference with editorial sources. 4.7 stars means nothing if 40% of reviews mention the same flaw.",
  },
  {
    icon: "🚫",
    title: "No Paid Placements. Ever.",
    body: "We are not sponsored by any brand. Products are selected on merit. Affiliate links to Amazon help keep the site funded — but they never influence our rankings.",
  },
];

const scores = [
  { range: "9.0–10", label: "Exceptional", color: "text-green-400 border-green-400/30 bg-green-400/10", desc: "Punches well above its price. Buy it without hesitation." },
  { range: "8.0–8.9", label: "Great", color: "text-blue-400 border-blue-400/30 bg-blue-400/10", desc: "Solid pick with only minor compromises." },
  { range: "7.0–7.9", label: "Good", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10", desc: "Worth buying, but know what you're getting into." },
  { range: "< 7.0", label: "Skip It", color: "text-orange-400 border-orange-400/30 bg-orange-400/10", desc: "Better options exist at this price. We'll tell you what they are." },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <span className="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
          About Us
        </span>
        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
          Less Hype.<br />
          <span className="text-blue-400">More Hardware.</span>
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed mb-4">
          TotalTechPicks is an independent tech recommendation site. We exist because the internet is drowning in AI-generated affiliate sludge, influencer hot takes, and manufacturer-sponsored &quot;reviews.&quot;
        </p>
        <p className="text-gray-400 leading-relaxed">
          We built TotalTechPicks to be the site we actually wanted to use when spending money on tech — one that gives you a straight answer, explains the trade-offs, and doesn&apos;t waste your time.
        </p>
      </div>

      {/* Mission callout */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-6 mb-12 border border-gray-700/50">
        <div className="flex gap-4 items-start">
          <span className="text-4xl shrink-0">🎯</span>
          <div>
            <h2 className="font-black text-white text-xl mb-2">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To be the trusted armory where people go <em>before</em> spending money on tech — not after buyer&apos;s remorse kicks in. We care about your wallet and your desk more than our click-through rate.
            </p>
          </div>
        </div>
      </div>

      {/* How we pick */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-white mb-2">How We Pick Products</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Every product on TotalTechPicks passes the same filter. No exceptions.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {methodology.map((item) => (
            <div key={item.title} className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* No-BS Score explanation */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-white mb-2">The ⚡ No-BS Score</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Every product gets a score out of 10. It&apos;s derived from verified customer ratings, weighted by review volume, and cross-referenced with editorial assessments. Here&apos;s what each range means:
        </p>
        <div className="space-y-3">
          {scores.map((s) => (
            <div key={s.range} className="flex items-center gap-4 bg-gray-900 rounded-xl border border-gray-700/50 p-4">
              <span className={`text-sm font-black px-3 py-1 rounded-full border whitespace-nowrap ${s.color}`}>
                ⚡ {s.range}
              </span>
              <div>
                <p className="font-bold text-white text-sm">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Affiliate disclosure */}
      <section className="mb-12">
        <h2 className="text-2xl font-black text-white mb-4">Affiliate Disclosure</h2>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <p className="text-gray-300 leading-relaxed mb-3">
            TotalTechPicks participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <p className="text-gray-300 leading-relaxed mb-3">
            When you click an Amazon link and make a purchase, we earn a small commission at <strong className="text-white">no extra cost to you</strong>. This is how we fund the site and keep it free.
          </p>
          <p className="text-gray-400 text-sm">
            Our affiliate relationships <strong className="text-gray-300">never</strong> influence which products we recommend or how we rank them. A product that earns us zero commission will still get ranked #1 if it&apos;s the best pick.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">Ready to find your next piece of hardware?</p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Browse All Picks →
        </Link>
      </div>
    </div>
  );
}
