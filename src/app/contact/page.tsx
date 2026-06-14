import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR } from "@/data/author";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@totaltechpicks.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with TotalTechPicks — feedback, corrections, partnership questions, or just to tell us we got a pick wrong.",
  alternates: { canonical: "https://totaltechpicks.com/contact" },
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Contact Us</h1>
      <p className="text-gray-300 leading-relaxed mb-8">
        TotalTechPicks is run by a real person — {AUTHOR.shortName}, {AUTHOR.role.toLowerCase()} — not a faceless content
        farm. If you have feedback, spotted an error, think we ranked something wrong, or want to reach out about a
        partnership, I read every message.
      </p>

      <div className="space-y-4 mb-10">
        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1.5">Email</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
            {CONTACT_EMAIL}
          </a>
          <p className="text-sm text-gray-400 mt-1">I aim to reply within 2–3 business days.</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1.5">Spotted something wrong?</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Prices change, products get discontinued, and specs get revised. If a pick looks out of date or a link is
            broken, email me with the page and I&apos;ll fix it fast — see our{" "}
            <Link href="/editorial-policy" className="text-blue-400 hover:text-blue-300 font-semibold">corrections policy</Link>.
          </p>
        </div>
      </div>

      <h2 className="text-xl font-black text-white mb-3">A few common questions</h2>
      <div className="space-y-4">
        <div>
          <p className="font-bold text-gray-100 mb-1">Do brands pay to be featured?</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            No. Rankings are never for sale. We earn affiliate commissions when you buy through our links, but that never
            changes which products we recommend or how we order them. Full details on our{" "}
            <Link href="/editorial-policy" className="text-blue-400 hover:text-blue-300 font-semibold">editorial policy</Link> page.
          </p>
        </div>
        <div>
          <p className="font-bold text-gray-100 mb-1">Can you review my product?</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            You&apos;re welcome to send it our way, but a sample never guarantees coverage or a positive review — and we
            disclose anything we&apos;re sent. We only write up gear we genuinely think is worth a reader&apos;s money.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all">
          ← Back to the picks
        </Link>
      </div>
    </div>
  );
}
