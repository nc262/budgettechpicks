import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

const SITE_URL = "https://budgettechpicks.vercel.app";
const SITE_NAME = "BudgetTechPicks";
const DEFAULT_DESCRIPTION =
  "Honest reviews of the best budget tech gadgets under $50. USB-C hubs, webcams, wireless earbuds, mechanical keyboards, monitors, and more.";
const OG_IMAGE = `${SITE_URL}/og-default.png`;

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} – Best Budget Tech Gadgets Under $50`,
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
  verification: {
    google: "MClIPiF4Bq8pkSGn-UoTHbd4sTtt-i0fPXHzixXmpCo",
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
    locale: "en_US",
    title: `${SITE_NAME} – Best Budget Tech Gadgets Under $50`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — Best Budget Tech` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Best Budget Tech Gadgets Under $50`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@budgettechpicks",
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
      <body className={inter.className}>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
