import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — TotalTechPicks",
  description: "Privacy policy for TotalTechPicks.com — how we collect, use, and protect your information.",
  alternates: { canonical: "https://totaltechpicks.com/privacy-policy" },
};

const LAST_UPDATED = "May 28, 2026";
const SITE = "TotalTechPicks";
const SITE_URL = "https://totaltechpicks.com";
// Split to prevent Cloudflare email obfuscation (which breaks /cdn-cgi/ crawl)
const CONTACT_EMAIL = "contact" + "@" + "totaltechpicks.com";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 mb-6 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300 leading-relaxed">

          <section>
            <p>
              This Privacy Policy describes how {SITE} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects,
              uses, and shares information when you visit <a href={SITE_URL} className="text-blue-400 hover:underline">{SITE_URL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect limited information automatically when you visit our site:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li><strong className="text-gray-300">Log data:</strong> IP address, browser type, pages visited, time and date of visit, referring URL. This is collected automatically by our hosting provider (Cloudflare Pages).</li>
              <li><strong className="text-gray-300">Analytics:</strong> We may use anonymous analytics tools to understand how visitors use the site (e.g., page views, session duration). No personally identifiable information is collected.</li>
              <li><strong className="text-gray-300">Cookies:</strong> We do not set first-party tracking cookies. Third-party services (see below) may set cookies.</li>
            </ul>
            <p className="mt-3 text-gray-400">
              We do <strong className="text-gray-300">not</strong> collect: names, email addresses, payment information, or account data. There is no account or login system on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Affiliate Links (Amazon)</h2>
            <p className="text-gray-400">
              {SITE} participates in the <strong className="text-gray-300">Amazon Services LLC Associates Program</strong>, an affiliate advertising program. When you click a product link and make a purchase on Amazon, we may earn a small commission at no extra cost to you.
            </p>
            <p className="mt-3 text-gray-400">
              Amazon may collect data about your activity on their platform per their own{" "}
              <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468496" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Privacy Notice
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Third-Party Services</h2>
            <p className="mb-3 text-gray-400">Our site may interact with the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-400">
              <li>
                <strong className="text-gray-300">Cloudflare Pages</strong> — Hosting and CDN provider. May collect IP addresses and request logs.{" "}
                <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cloudflare Privacy Policy</a>
              </li>
              <li>
                <strong className="text-gray-300">Google AdSense</strong> — If enabled, serves ads and may use cookies to personalize ads based on your browsing activity.{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Privacy Policy</a>
              </li>
              <li>
                <strong className="text-gray-300">Reddit (public data)</strong> — We display publicly available Reddit community sentiment data. No personal Reddit data is collected.{" "}
                <a href="https://www.reddit.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Reddit Privacy Policy</a>
              </li>
              <li>
                <strong className="text-gray-300">Pinterest</strong> — We maintain Pinterest boards that link back to this site. Pinterest may collect data about your Pinterest activity.{" "}
                <a href="https://policy.pinterest.com/en/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Pinterest Privacy Policy</a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. How We Use Information</h2>
            <p className="text-gray-400">Any information we collect is used solely to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-400">
              <li>Operate and improve the website</li>
              <li>Understand aggregate traffic patterns (not individual users)</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3 text-gray-400">
              We do <strong className="text-gray-300">not</strong> sell, rent, or share personal data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Data Retention</h2>
            <p className="text-gray-400">
              We retain server logs for a limited period as required by our hosting provider. No other personal data is stored by us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Children&apos;s Privacy</h2>
            <p className="text-gray-400">
              This site is not directed at children under 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Your Rights</h2>
            <p className="text-gray-400">
              Depending on your location, you may have rights regarding your personal data (e.g., GDPR, CCPA). Since we collect minimal data, most requests will be trivially satisfied. To make a request, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-400">
              We may update this policy occasionally. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Continued use of the site after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Contact</h2>
            <p className="text-gray-400">
              Questions about this Privacy Policy? Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-400 hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
          <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>
          <Link href="/privacy-policy" className="text-gray-400">Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}
