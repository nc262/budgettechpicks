/** @type {import('next').NextConfig} */

// ── Environment variable guard ────────────────────────────────────────────────
// Fails the build loudly if any required env vars are still placeholders.
// Add new required vars here as the site grows.
const REQUIRED_ENV = {
  NEXT_PUBLIC_ADSENSE_ID: {
    value: process.env.NEXT_PUBLIC_ADSENSE_ID,
    placeholder: "pub-XXXXXXXXXXXXXXXX",
    description: "Google AdSense publisher ID (e.g. ca-pub-4358249929867424)",
  },
  NEXT_PUBLIC_AMAZON_TAG: {
    value: process.env.NEXT_PUBLIC_AMAZON_TAG,
    placeholder: "yoursite-20",
    description: "Amazon Associates tag (e.g. budgettechp01-20)",
  },
};

// Only guard the real deploy (Cloudflare Pages sets CF_PAGES). CI and local prod
// builds skip it: they verify data/build soundness and don't need live secrets.
if (process.env.CF_PAGES) {
  const failures = [];
  for (const [key, cfg] of Object.entries(REQUIRED_ENV)) {
    if (!cfg.value || cfg.value === cfg.placeholder) {
      failures.push(`  ❌ ${key} — ${cfg.description}`);
    }
  }
  if (failures.length > 0) {
    console.error("\n🚨 BUILD ABORTED — Required environment variables are missing or still placeholders:\n");
    failures.forEach((f) => console.error(f));
    console.error("\nSet these in Cloudflare Pages → Settings → Environment Variables\n");
    process.exit(1);
  }
}

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "ws-na.amazon-adsystem.com" },
    ],
  },
};

module.exports = nextConfig;
