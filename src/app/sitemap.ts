import { MetadataRoute } from "next";
import { articles } from "@/data/articles";
import { products } from "@/data/products";
import { reviews } from "@/data/reviews";
import { vsPages } from "@/data/vs-pages";

const BASE = "https://totaltechpicks.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryPages = articles.map((a) => ({
    url: `${BASE}/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const reviewPages = Object.keys(reviews)
    .filter((id) => products.some((p) => p.id === id))
    .map((id) => ({
      url: `${BASE}/reviews/${id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const versusPages = vsPages.map((v) => ({
    url: `${BASE}/vs/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/my-setup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...categoryPages,
    ...reviewPages,
    ...versusPages,
  ];
}
