import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: {
    default: "BudgetTechPicks – Best Tech Gadgets Under $50",
    template: "%s | BudgetTechPicks",
  },
  description:
    "Honest reviews of the best budget tech gadgets under $50. USB-C hubs, webcams, wireless earbuds, and desk accessories.",
  metadataBase: new URL("https://budgettechpicks.com"),
  openGraph: {
    siteName: "BudgetTechPicks",
    type: "website",
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
