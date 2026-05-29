import { MetadataRoute } from "next";
import { articles } from "@/data/articles";

const BASE = "https://totaltechpicks.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryPages = articles.map((a) => ({
    url: `${BASE}/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/my-setup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...categoryPages,
  ];
}
