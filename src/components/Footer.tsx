import Link from "next/link";
import { articles } from "@/data/articles";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-950 border-t border-gray-800/50 text-gray-400 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="/logo.png" alt="TotalTechPicks" className="h-14 w-auto max-w-[160px] object-contain mb-4 brightness-0 invert" />
            <p className="text-sm leading-relaxed mb-3">
              Curated tech picks across every budget — researched against real owner feedback, checked against
              Amazon nightly, and funded by affiliate links we disclose up front.
            </p>

          </div>

          {/* Categories */}
          <div>
            <p className="text-white font-bold mb-3 text-sm uppercase tracking-widest">Categories</p>
            <ul className="space-y-1.5 text-sm columns-2">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/${a.slug}`} className="hover:text-blue-400 transition-colors">
                    {a.category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site links */}
          <div>
            <p className="text-white font-bold mb-3 text-sm uppercase tracking-widest">TotalTechPicks</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/my-setup" className="hover:text-blue-400 transition-colors">⚙️ My Actual Setup</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About &amp; Methodology</Link></li>
              <li><Link href="/editorial-policy" className="hover:text-blue-400 transition-colors">Editorial Policy</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><a href={`https://www.amazon.com?tag=${process.env.NEXT_PUBLIC_AMAZON_TAG ?? "totaltechpicks-20"}`} target="_blank" rel="noopener noreferrer sponsored" className="hover:text-blue-400 transition-colors">Shop Amazon</a></li>
            </ul>
          </div>
        </div>

        {/* Founder strip */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl px-6 py-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-white mb-0.5">Built by a DevOps engineer who got tired of bad gear.</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              3 computers. 1 keyboard. 1 screen. Every pick on this site has been researched by someone who actually uses this stuff daily — no corporate content farms, no sponsored fluff.
            </p>
          </div>
          <Link
            href="/my-setup"
            className="shrink-0 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500/40 text-gray-200 hover:text-blue-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap"
          >
            ⚙️ See My Setup →
          </Link>
        </div>

        <div className="border-t border-gray-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {year} TotalTechPicks. Amazon affiliate — links may earn a commission at no extra cost to you.</p>
          <p className="text-blue-400/60">Less Hype. More Hardware.</p>
        </div>
      </div>
    </footer>
  );
}
