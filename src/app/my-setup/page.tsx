import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Actual Setup — What a DevOps Engineer Uses Daily | TotalTechPicks",
  description:
    "3 computers, 1 keyboard, 1 monitor. The real WFH setup behind TotalTechPicks — built over 2 years by a DevOps engineer who games when the work is done.",
  alternates: { canonical: "https://totaltechpicks.com/my-setup" },
};

type SetupItem = {
  name: string;
  note: string;
  tag: string;
  amazonUrl?: string;
  externalUrl?: string;
  siteUrl?: string;
};

type SetupCategory = {
  icon: string;
  title: string;
  items: SetupItem[];
};

const SETUP: SetupCategory[] = [
  {
    icon: "🖥️",
    title: "Display",
    items: [
      {
        name: "Samsung Odyssey G95C 49\" Super Ultrawide",
        note: "I used to run 3 monitors. Then I got this and sold all three. The G95C takes 3 separate inputs simultaneously — so I have my gaming PC, my work laptop, and a second work machine all feeding into one screen. Combined with the KVM switch below, it's genuinely like having 3 full desks collapsed into one. You cannot go back to normal monitors after this.",
        tag: "Game Changer",
        amazonUrl: "https://www.amazon.com/dp/B0BLF2WVB6?tag=totaltechpicks-20",
      },
    ],
  },
  {
    icon: "⌨️",
    title: "Peripherals",
    items: [
      {
        name: "ATEN CS724KM 4-Port USB KM Switch",
        note: "This is the actual secret weapon of the whole setup. One keyboard, one mouse, up to 4 computers — and you switch between them by sliding the cursor off the edge of the screen. No button. No hotkey. You just move the mouse past the border and you're on a different machine. As a DevOps engineer juggling 2 work laptops and a gaming PC, this single device changed everything.",
        tag: "Game Changer",
        externalUrl: "https://www.aten.com/global/en/products/kvm/desktop-kvm-switches/cs724km/",
      },
      {
        name: "Logitech G502 Lightspeed Wireless Mouse",
        note: "Been through a lot of mice. The G502 stays. The weight is perfect, the side buttons are exactly where your thumb wants them, and the scroll wheel has that satisfying notched resistance. Battery life is solid. I've never once felt the need to upgrade this.",
        tag: "Daily Driver",
        amazonUrl: "https://www.amazon.com/dp/B07GBZ4Q68?tag=totaltechpicks-20",
        siteUrl: "/best-gaming-gear-under-50",
      },
      {
        name: "Logitech G915 TKL Wireless Lightspeed (Clicky)",
        note: "Low-profile, wireless, clicky GL switches. The click sound is satisfying without being the kind that gets your coworkers on a call asking what that noise is. Battery lasts so long I forget it needs charging. TKL layout means more desk space and I genuinely don't miss the numpad.",
        tag: "Daily Driver",
        amazonUrl: "https://www.amazon.com/dp/B07NY9ZT92?tag=totaltechpicks-20",
      },
    ],
  },
  {
    icon: "🪑",
    title: "Chair & Desk",
    items: [
      {
        name: "SecretLab Magnus Pro XL Desk",
        note: "Honestly my favorite thing in this entire setup. It's a full steel desk with a magnetic surface, and the cable management tray runs the entire length underneath. With 3 computers, a KVM switch, speakers, webcam, and a 49\" monitor all on one desk — the Magnus Pro is the only reason it doesn't look like a server room exploded. The magnetic accessories are a nice touch too. If this broke tomorrow I'd order another one the same day.",
        tag: "Favorite Piece",
        externalUrl: "https://secretlabchairs.com/products/magnus-pro",
      },
      {
        name: "SecretLab Titan XL — Cyberpunk Edition",
        note: "Went XL because I'm not small and I sit here for 8+ hours between work and gaming. The lumbar support is legitimately good — not just a pillow duct-taped to a chair. The Cyberpunk collab edition looks ridiculous in the best way.",
        tag: "Love It",
        externalUrl: "https://secretlabchairs.com/products/titan-gaming-chair",
      },
    ],
  },
  {
    icon: "🔊",
    title: "Audio",
    items: [
      {
        name: "Logitech G733 Wireless Headset",
        note: "My main audio for gaming and calls. Lightweight, good wireless range, the mic is decent enough for meetings. The problem? I have 3 computers and I wanted the audio from all of them to come through one headset. I tried every cheap hub and splitter I could find — none of them actually worked cleanly. If I were doing it over, I'd skip all that and just buy a proper audio mixer from the start.",
        tag: "Daily Driver",
        amazonUrl: "https://www.amazon.com/dp/B08DF98XFH?tag=totaltechpicks-20",
      },
      {
        name: "HECATE G1500 Gaming Speakers",
        note: "For when I don't want to wear a headset. Way better sound than you'd expect at this price — the bass is real without being muddy. Good for background music during deep work sessions and for gaming when I'm alone.",
        tag: "Solid Value",
        amazonUrl: "https://www.amazon.com/dp/B09KWTF8YN?tag=totaltechpicks-20",
      },
    ],
  },
  {
    icon: "📷",
    title: "Video",
    items: [
      {
        name: "EMEET HD 1080p Webcam",
        note: "Sharp at 1080p, decent autofocus, and the built-in mic handles background noise better than I expected. Does everything I need for meetings and the occasional stream. No complaints.",
        tag: "Does The Job",
        amazonUrl: "https://www.amazon.com/dp/B07W3T6VJV?tag=totaltechpicks-20",
        siteUrl: "/best-budget-webcams",
      },
    ],
  },
  {
    icon: "🖱️",
    title: "Desk Accessories",
    items: [
      {
        name: "XXL Gaming Mouse Pad — Japanese Demon Mask (35.4\" × 15.7\")",
        note: "Covers the entire desk surface. Non-slip rubber base actually stays put even during intense sessions, stitched edges mean it won't fray after a few months. The Demon Mask design fits the dark aesthetic of the setup perfectly.",
        tag: "Love It",
        amazonUrl: "https://www.amazon.com/dp/B0G6DX394S?tag=totaltechpicks-20",
      },
    ],
  },
];

const TAG_STYLES: Record<string, string> = {
  "Daily Driver":   "bg-blue-500/20 border-blue-500/30 text-blue-300",
  "Game Changer":   "bg-purple-500/20 border-purple-500/30 text-purple-300",
  "Love It":        "bg-pink-500/20 border-pink-500/30 text-pink-300",
  "Favorite Piece": "bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
  "Clean Setup":    "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
  "Solid Value":    "bg-green-500/20 border-green-500/30 text-green-300",
  "Does The Job":   "bg-gray-600/40 border-gray-500/30 text-gray-300",
  "Just Got It":    "bg-orange-500/20 border-orange-500/30 text-orange-300",
};

export default function MySetupPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <span className="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
          ✅ Verified Owner
        </span>
        <h1 className="text-4xl font-black text-white mb-4 leading-tight">
          My Actual Setup<br />
          <span className="text-blue-400">3 Computers. 1 Keyboard. 1 Screen.</span>
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed mb-4">
          I work from home as a DevOps engineer — 2 work laptops, 1 gaming PC, all running at the same time.
          The whole setup has been built and refined over about 2 years to make it seamless to switch between work and play without touching a single cable.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Everything here I personally bought. No gifted units, no sponsored gear. Just what actually lives on my desk.
        </p>
      </div>

      {/* Callout */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-6 mb-12 border border-gray-700/50">
        <div className="flex gap-4 items-start">
          <span className="text-4xl shrink-0">🖥️</span>
          <div>
            <h2 className="font-black text-white text-xl mb-2">The Setup Philosophy</h2>
            <p className="text-gray-300 leading-relaxed">
              I used to run 3 separate monitors. Then I replaced all of them with one 49&quot; ultrawide and a KVM switch — and suddenly I could control 3 machines with one keyboard and mouse, all on the same screen.
              The goal was: sit down, start working, start gaming, and never think about cable management again. The Magnus Pro desk made that last part possible.
            </p>
          </div>
        </div>
      </div>

      {/* Setup categories */}
      <div className="space-y-12">
        {SETUP.map((cat) => (
          <section key={cat.title}>
            <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.title}
            </h2>
            <div className="space-y-4">
              {cat.items.map((item) => {
                const buyUrl = item.amazonUrl ?? item.externalUrl;
                const isExternal = !item.amazonUrl && !!item.externalUrl;
                const tagStyle = TAG_STYLES[item.tag] ?? "bg-gray-700/50 border-gray-600/50 text-gray-300";

                return (
                  <div
                    key={item.name}
                    className="bg-gray-900 rounded-2xl border border-gray-700/50 p-5 hover:border-gray-600/70 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-bold text-white text-base leading-snug">{item.name}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${tagStyle}`}>
                        {item.tag}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                        ✅ I Own This
                      </span>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      &ldquo;{item.note}&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {buyUrl && (
                        <a
                          href={buyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                        >
                          {isExternal ? "🛍️ Buy Direct" : "🛒 Check on Amazon"}
                        </a>
                      )}
                      {item.siteUrl && (
                        <Link
                          href={item.siteUrl}
                          className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-700 transition-colors"
                        >
                          📝 See Our Review
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Affiliate disclosure */}
      <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
        <p className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-gray-300">Affiliate Disclosure:</strong> Amazon links on this page use the TotalTechPicks affiliate tag.
          If you buy through them, I earn a small commission at no extra cost to you.
          These are products I personally purchased — no gifted units, no paid placements.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-400 mb-4 text-sm">Want curated picks across every category?</p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Browse All Picks →
        </Link>
      </div>
    </div>
  );
}
