import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Fetch Amazon product image server-side so the browser never touches
// amazon-adsystem.com (which ad blockers block). The browser only sees
// requests to our own domain.
export async function GET(req: NextRequest) {
  const asin = req.nextUrl.searchParams.get("asin");
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Try to fetch the product page and extract the real image URL
  const productUrl = `https://www.amazon.com/dp/${asin}`;
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
  };

  let imageUrl: string | null = null;

  try {
    const pageRes = await fetch(productUrl, { headers, redirect: "follow" });
    if (pageRes.ok) {
      const html = await pageRes.text();
      // Extract hiRes or large image from Amazon's image JSON block
      const hiRes = html.match(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
      const large = html.match(/"large":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
      const og = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
      imageUrl = hiRes?.[1] ?? large?.[1] ?? og?.[1] ?? null;
    }
  } catch {
    // fall through to fallback
  }

  // Fallback: try the legacy ASIN-based image URL on ssl-images-amazon.com
  if (!imageUrl) {
    imageUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
  }

  try {
    const imgRes = await fetch(imageUrl, {
      headers: { "User-Agent": headers["User-Agent"] },
    });
    if (!imgRes.ok) throw new Error("image fetch failed");

    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const body = await imgRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // Cache for 7 days at CDN, 1 day stale-while-revalidate
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Image not found", { status: 404 });
  }
}
