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
              125+ expert-picked tech products across every budget. No fluff, no paid placements, just honest picks.
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
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About &amp; Methodology</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Shop Amazon</a></li>
            </ul>

          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {year} TotalTechPicks. Amazon affiliate — links may earn a commission at no extra cost to you.</p>
          <p className="text-blue-400/60">Less Hype. More Hardware.</p>
        </div>
      </div>
    </footer>
  );
}
