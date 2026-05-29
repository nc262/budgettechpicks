"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "🎮 Gaming", href: "/best-gaming-gear-under-50" },
  { label: "🎧 Audio", href: "/best-audio-gear" },
  { label: "🖥️ Monitors", href: "/best-monitors-and-displays" },
  { label: "🌐 Streaming", href: "/best-streaming-gear" },
  { label: "🎵 Earbuds", href: "/best-wireless-earbuds-under-50" },
  { label: "🧲 Desk Toys", href: "/best-desk-toys-under-50" },
  { label: "🏠 Smart Home", href: "/best-smart-home-under-50" },
  { label: "💻 USB-C Hubs", href: "/best-usb-c-hubs-under-50" },
  { label: "📷 Webcams", href: "/best-budget-webcams" },
  { label: "🎒 Portable Tech", href: "/best-portable-tech-under-50" },
  { label: "🖥 Desk Setup", href: "/best-desk-accessories-under-50" },
  { label: "🕹 Gaming Setups", href: "/best-gaming-setups" },
  { label: "⚙️ My Setup", href: "/my-setup" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gray-900/95 border-b border-gray-800 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 shrink-0"
        >
          <img src="/logo.png" alt="TotalTechPicks" className="h-14 w-auto max-w-[180px] object-contain" />
        </Link>

        {/* Nav pills — desktop only */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-300 hover:text-blue-400 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-sm font-semibold text-gray-300 hover:text-blue-400 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Browse All — desktop */}
          <Link
            href="/"
            className="hidden sm:inline-block shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Browse All →
          </Link>

          {/* Hamburger — mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-300 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-300 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800 px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-gray-300 hover:text-blue-400 hover:bg-gray-800 px-3 py-2.5 rounded-xl transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-blue-400 hover:bg-gray-800 px-3 py-2.5 rounded-xl transition-all"
            >
              About
            </Link>
          </div>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mt-3 block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            Browse All →
          </Link>
        </div>
      )}
    </header>
  );
}
