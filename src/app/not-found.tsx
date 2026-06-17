import Link from "next/link";
import { articles } from "@/data/articles";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-7xl mb-4">🤖</p>
      <h1 className="text-4xl font-black text-white mb-3">404 — Page Not Found</h1>
      <p className="text-gray-400 text-lg mb-10">
        We couldn&apos;t find that page. Maybe it was $500+ and we sold out. 🫡
      </p>
      <Link
        href="/"
        className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors mb-10"
      >
        ← Back to Homepage
      </Link>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Or browse a category
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.slug}`}
              className="text-sm bg-gray-900 border border-gray-700/50 hover:border-blue-500/50 hover:text-blue-300 text-gray-300 font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              {a.category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
