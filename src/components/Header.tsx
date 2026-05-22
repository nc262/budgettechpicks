import Link from "next/link";
import { articles } from "@/data/articles";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand-600 hover:text-brand-700">
          BudgetTechPicks
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.slug}`}
              className="hover:text-brand-600 transition-colors"
            >
              {a.category}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
