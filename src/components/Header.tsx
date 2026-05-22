import Link from "next/link";

const NAV_LINKS = [
  { label: "🎮 Gaming", href: "/best-gaming-gear-under-50" },
  { label: "🎧 Audio", href: "/best-audio-gear" },
  { label: "🖥️ Monitors", href: "/best-monitors-and-displays" },
  { label: "🌐 Streaming", href: "/best-streaming-gear" },
  { label: "🔌 Earbuds", href: "/best-wireless-earbuds-under-50" },
];

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-black text-gray-900 hover:text-blue-600 transition-colors shrink-0"
        >
          💻 BudgetTechPicks
        </Link>

        {/* Nav pills — hidden on small screens */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/"
          className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          Browse All →
        </Link>
      </div>
    </header>
  );
}
