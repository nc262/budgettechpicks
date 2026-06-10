import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — TotalTechPicks",
  description: "Contact TotalTechPicks for corrections, feedback, partnership questions, or policy requests.",
  alternates: { canonical: "https://totaltechpicks.com/contact" },
};

const CONTACT_EMAIL = "contact" + "@" + "totaltechpicks.com";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-14">
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 inline-block mb-6">
          ← Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Contact</h1>
        <p className="text-gray-400 leading-relaxed mb-8">
          Questions, correction requests, or business inquiries are welcome. The fastest way to reach us is email.
        </p>

        <section className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-black text-white mb-2">Email</h2>
          <p className="text-sm text-gray-300 mb-2">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:text-blue-300 font-semibold">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="text-xs text-gray-500">Typical response window: 2-4 business days.</p>
        </section>

        <section className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-2">Corrections</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Include the article URL, the specific claim, and any supporting source so we can verify and update quickly.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white mb-2">Partnerships</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We do not accept paid ranking placements. Partnership requests are reviewed for disclosure and editorial independence.
            </p>
          </div>
        </section>

        <section className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-black text-white mb-2">Before You Email</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
            <li>For privacy requests, include the words "Privacy Request" in your subject line.</li>
            <li>For content corrections, include a source link so we can validate changes.</li>
            <li>For general buying help, include your budget and use case for better recommendations.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
