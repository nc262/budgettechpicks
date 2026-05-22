import Link from "next/link";
import { articles } from "@/data/articles";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-7xl mb-4">🤖</p>
      <h1 className="text-4xl font-black text-gray-900 mb-3">404 — Page Not Found</h1>
      <p className="text-gray-500 text-lg mb-10">
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
              className="text-sm bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {a.category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
