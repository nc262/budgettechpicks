"use client";

import { amazonImageUrl, amazonImageFallback } from "@/data/products";

interface Props {
  asin?: string;
  imageUrl?: string;
  name: string;
  className?: string;
}

export default function SetupItemImage({ asin, imageUrl, name, className }: Props) {
  const src = imageUrl ?? (asin ? amazonImageUrl(asin) : null);
  if (!src) return null;

  const cls = className ?? "w-24 h-24 object-contain rounded-xl bg-gray-800 shrink-0";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={cls}
      onError={(e) => {
        if (asin) {
          const t = e.currentTarget;
          const fb = amazonImageFallback(asin);
          if (t.src !== fb) {
            t.src = fb;
          } else {
            t.style.display = "none";
          }
        } else {
          e.currentTarget.style.display = "none";
        }
      }}
    />
  );
}
