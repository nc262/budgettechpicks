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
    // Placeholder shown in dev / before AdSense approval
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm ${
          style === "horizontal" ? "h-24 w-full" : style === "square" ? "h-64 w-64" : "h-64 w-full"
        } ${className}`}
      >
        Ad Slot ({slot})
      </div>
    );
  }

  const formatMap: Record<string, string> = {
    horizontal: "auto",
    rectangle: "auto",
    square: "auto",
  };

  return (
    <div className={`text-center ${className}`}>
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
