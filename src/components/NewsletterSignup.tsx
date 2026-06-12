"use client";

import { useState } from "react";

// Renders nothing until NEXT_PUBLIC_NEWSLETTER_ENDPOINT is configured
// (any Formspree-style endpoint that accepts JSON POST works).
export default function NewsletterSignup({ className = "" }: { className?: string }) {
  const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (!endpoint) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || state === "sending") return;
    setState("sending");
    try {
      const r = await fetch(endpoint!, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, source: "totaltechpicks.com" }),
      });
      setState(r.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <section className={`bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl border border-gray-700/50 p-6 glow-blue ${className}`}>
      {state === "done" ? (
        <div className="text-center py-2">
          <p className="font-black text-white text-lg mb-1">You&apos;re in. 🎉</p>
          <p className="text-sm text-gray-400">We&apos;ll only email when there&apos;s something genuinely worth your money.</p>
        </div>
      ) : (
        <>
          <div className="sm:flex items-center justify-between gap-6">
            <div className="mb-4 sm:mb-0">
              <h2 className="font-black text-white text-lg mb-1">Get the picks before everyone else</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                One short email when we publish new picks or spot a real deal. No spam, unsubscribe anytime.
              </p>
            </div>
            <form onSubmit={submit} className="flex gap-2 shrink-0 w-full sm:w-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="flex-1 sm:w-56 bg-gray-950/70 border border-gray-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={state === "sending"}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all whitespace-nowrap"
              >
                {state === "sending" ? "…" : "Subscribe"}
              </button>
            </form>
          </div>
          {state === "error" && (
            <p className="text-xs text-red-400 mt-2">Something went wrong — try again in a moment.</p>
          )}
        </>
      )}
    </section>
  );
}
