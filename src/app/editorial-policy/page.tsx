import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR } from "@/data/author";

export const metadata: Metadata = {
  title: "Editorial Policy & Review Standards",
  description:
    "How TotalTechPicks researches, ranks, and maintains its recommendations — our independence, sourcing, affiliate disclosure, and corrections policy.",
  alternates: { canonical: "https://totaltechpicks.com/editorial-policy" },
};

const sections = [
  {
    h: "Who writes these reviews",
    b: `Every recommendation on this site is researched and written by ${AUTHOR.name}, ${AUTHOR.role.toLowerCase()} — a working DevOps engineer, not an anonymous content team. Picks lean on a mix of first-hand use, manufacturer spec sheets, teardown analysis, and the lived experience of thousands of owners in places like Reddit and Amazon reviews. Where a conclusion comes from owner reports rather than our own bench time, we say so.`,
  },
  {
    h: "How we choose what to recommend",
    b: "We start from the question a buyer actually has — 'what's the best X for my budget and use case?' — and work backward. Products are judged against their price and their direct competitors, never on brand prestige. A lesser-known product that outperforms a famous one gets ranked higher, every time. We actively look for the failure patterns a category is known for (bad cables, thermal throttling, stick drift, dead-after-six-months complaints) and weight long-term reliability heavily.",
  },
  {
    h: "How we keep picks current",
    b: "Every product's Amazon listing is automatically re-checked every night; anything discontinued or out of stock is pulled from our guides so you never land on a dead page. Displayed rating counts are refreshed from live data, and community discussion is re-scanned regularly. When prices or specs shift enough to change a verdict, we update the ranking — not just the date.",
  },
  {
    h: "Independence & how we make money",
    b: "TotalTechPicks is funded by affiliate commissions: if you buy through our links, we may earn a small percentage at no extra cost to you. That is the entire business model, and we state it plainly on every page that carries those links. No brand can pay to be featured, ranked higher, or reviewed more favorably. A product that earns us zero commission will still be ranked #1 if it's the best choice. If we're ever sent a product to test, we disclose it and it earns no special treatment.",
  },
  {
    h: "Accuracy & corrections",
    b: "We get things wrong sometimes — a price moves, a model gets revised, a link breaks. When that happens we fix it as fast as we can, and for anything that materially changes a recommendation we update the page rather than quietly editing it away. If you spot an error, email us via the contact page and we'll correct it promptly.",
  },
  {
    h: "Use of automation & AI",
    b: "We use automation to do the tedious parts well — checking links nightly, surfacing relevant community discussion, and tracking which products are selling. Editorial judgment, rankings, and the written reviews themselves are human work. Anything sourced automatically (such as community-discussion summaries) is labeled as such and cited back to its source so you can verify it yourself.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Editorial Policy &amp; Review Standards</h1>
      <p className="text-lg text-gray-300 leading-relaxed mb-10">
        The internet is full of affiliate sites that exist to funnel clicks. This page exists so you can judge whether
        we&apos;re different — exactly how we research, rank, fund, and maintain everything you read here.
      </p>

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-black text-white mb-2">{s.h}</h2>
            <p className="text-gray-300 leading-relaxed">{s.b}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/about" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
          Meet the person behind it →
        </Link>
        <Link href="/contact" className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/10">
          Contact us
        </Link>
      </div>
    </div>
  );
}
