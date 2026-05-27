import Link from "next/link";
import { articles } from "@/data/articles";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <img src="/logo.png" alt="TotalTechPicks" height={52} className="h-10 w-auto mb-3 brightness-0 invert" />
            <p className="text-sm max-w-xs leading-relaxed">
              125+ expert-picked tech products across every budget — from
              hidden $10 gems to premium splurges. No fluff, no paid placements,
              just honest picks.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              🛒 Affiliate disclosure: We earn a small commission from Amazon
              purchases at no extra cost to you.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Categories</p>
            <ul className="space-y-1 text-sm">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/${a.slug}`} className="hover:text-white transition-colors">
                    {a.category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-xs text-center">
          <p>
            © {year} TotalTechPicks. Amazon and the Amazon logo are trademarks
            of Amazon.com, Inc. As an Amazon Associate we earn from qualifying
            purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
