import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
// GA4 measurement IDs are public (they ship to every browser), but only default to the
// production property in production builds — dev servers, forks, and preview builds
// must not pollute real analytics. Env var still overrides; placeholder is rejected
// (same pattern as the AdSense gate below).
const GA_PLACEHOLDER = "G-XXXXXXXXXX";
const rawGaId = process.env.NEXT_PUBLIC_GA_ID;
const gaId =
  rawGaId && rawGaId !== GA_PLACEHOLDER
    ? rawGaId
    : process.env.NODE_ENV === "production"
      ? "G-747QVQ0GFB"
      : undefined;

const SITE_URL = "https://totaltechpicks.com";
const SITE_NAME = "TotalTechPicks";
const DEFAULT_DESCRIPTION =
  "Tech picks for every budget, researched against spec sheets and real owner feedback. USB-C hubs, webcams, earbuds, keyboards, monitors, and more — with sources you can check.";
const OG_IMAGE = `${SITE_URL}/og-default.png`;

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} – Honest Tech Picks for Every Budget`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "budget tech", "best gadgets under $50", "USB-C hub review", "cheap webcam",
    "wireless earbuds budget", "mechanical keyboard budget", "affiliate tech picks",
    "best value tech 2026", "desk accessories", "home office tech",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  verification: {
    google: "MClIPiF4Bq8pkSGn-UoTHbd4sTtt-i0fPXHzixXmpCo",
    other: {
      "p:domain_verify": "b5081bc005ef6e5a700de0b9a92dcb3a",
      "msvalidate.01": "AE739AF0E5025A1689B899FE6A404D91",
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
    locale: "en_US",
    title: `${SITE_NAME} – Honest Tech Picks for Every Budget`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — best tech picks` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Honest Tech Picks for Every Budget`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@TotalTechPicks",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {adsenseId && adsenseId !== "pub-XXXXXXXXXXXXXXXX" && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className}`}>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
            {/* Affiliate click tracking — which products/pages actually drive Amazon clicks */}
            <Script id="ga-affiliate-clicks" strategy="afterInteractive">
              {`document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[href*="amazon.com"]'):null;if(!a||typeof gtag!=='function')return;var m=a.href.match(/\\/dp\\/([A-Z0-9]{10})/);gtag('event','affiliate_click',{asin:m?m[1]:'search_link',page_path:location.pathname,link_text:(a.textContent||'').trim().slice(0,40)});});`}
            </Script>
          </>
        )}
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {/* Scroll-reveal: cards below the fold fade in as they enter the viewport */}
        <Script id="scroll-reveal" strategy="afterInteractive">
          {`(function(){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var els=document.querySelectorAll('.glow-card');if(!els.length)return;var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:0.05});els.forEach(function(el){if(el.getBoundingClientRect().top<innerHeight){el.classList.add('in-view')}else{io.observe(el)}});document.documentElement.classList.add('reveal-ready')})();`}
        </Script>
      </body>
    </html>
  );
}
