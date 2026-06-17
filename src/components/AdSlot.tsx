"use client";

import { useEffect } from "react";

interface Props {
  slot: string;
  style?: "horizontal" | "rectangle" | "square";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSlot({ slot, style = "rectangle", className = "" }: Props) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded in dev
    }
  }, []);

  if (!adsenseId || adsenseId === "pub-XXXXXXXXXXXXXXXX") {
    // No AdSense ID configured. In production, render nothing — never show a placeholder
    // box on the live dark site (a light "Ad Slot" box would look broken). The dev-only
    // placeholder below is dark-themed so it doesn't break the layout while building.
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`bg-gray-900/40 border border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500 text-xs ${
          style === "horizontal" ? "h-24 w-full" : style === "square" ? "h-64 w-64" : "h-64 w-full"
        } ${className}`}
      >
        Ad slot ({slot}) — dev placeholder
      </div>
    );
  }

  const formatMap: Record<string, string> = {
    horizontal: "auto",
    rectangle: "auto",
    square: "auto",
  };

  return (
    <div className={`ad-wrap text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={formatMap[style]}
        data-full-width-responsive="true"
      />
    </div>
  );
}
