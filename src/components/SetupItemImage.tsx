"use client";

import { useState } from "react";
import { amazonImageUrl, amazonImageFallback, amazonImageFallback2 } from "@/data/products";

interface Props {
  asin?: string;
  imageUrl?: string;
  name: string;
  className?: string;
  fallback?: React.ReactNode;
}

export default function SetupItemImage({ asin, imageUrl, name, className, fallback }: Props) {
  const [imgState, setImgState] = useState(0);

  const src0 = imageUrl ?? (asin ? amazonImageUrl(asin) : null);
  const src1 = asin ? amazonImageFallback(asin) : null;
  const src2 = asin ? amazonImageFallback2(asin) : null;
  const currentSrc = imgState === 0 ? src0 : imgState === 1 ? src1 : imgState === 2 ? src2 : null;

  if (!currentSrc || imgState >= 3) return <>{fallback ?? null}</>;

  const cls = className ?? "w-24 h-24 object-contain rounded-xl bg-gray-800 shrink-0";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={name}
      className={cls}
      onError={() => {
        if (imgState === 0 && src1) setImgState(1);
        else if (imgState === 1 && src2) setImgState(2);
        else setImgState(3);
      }}
    />
  );
}
