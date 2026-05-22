export interface Article {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  updatedAt: string;
  category: string;
}

export const articles: Article[] = [
  {
    slug: "best-usb-c-hubs-under-50",
    title: "Best USB-C Hubs Under $50 in 2025",
    metaDescription:
      "Looking for the best USB-C hub without breaking the bank? We tested the top budget hubs under $50 for MacBooks and Windows laptops.",
    intro:
      "Modern laptops ship with fewer ports than ever. A good USB-C hub solves that instantly — and you don't need to spend $100+ to get one that works great. We've tested the best options under $50 so you don't have to.",
    updatedAt: "May 2025",
    category: "USB-C Hubs",
  },
  {
    slug: "best-budget-webcams",
    title: "Best Budget Webcams Under $50 for Work From Home (2025)",
    metaDescription:
      "Upgrade your video calls without overspending. These are the best webcams under $50 that deliver crisp 1080p or better video.",
    intro:
      "Your laptop's built-in webcam makes you look like you're in witness protection. Upgrading to a dedicated webcam is the single best investment for looking professional on video calls — and the best ones cost less than a dinner out.",
    updatedAt: "May 2025",
    category: "Webcams",
  },
  {
    slug: "best-wireless-earbuds-under-50",
    title: "Best Wireless Earbuds Under $50 That Actually Sound Good (2025)",
    metaDescription:
      "You don't need AirPods to get great sound. These wireless earbuds under $50 deliver impressive audio, long battery life, and solid call quality.",
    intro:
      "Premium wireless earbuds can cost $250+. But for everyday commuting, gym sessions, and casual listening, the gap between $50 and $250 earbuds has never been smaller. Here are the picks that punch way above their price.",
    updatedAt: "May 2025",
    category: "Wireless Earbuds",
  },
  {
    slug: "best-desk-accessories-under-50",
    title: "Best Desk Accessories Under $50 to Upgrade Your Home Office (2025)",
    metaDescription:
      "Small upgrades, big impact. These desk accessories under $50 will make your workspace more organized, ergonomic, and productive.",
    intro:
      "You don't need a $5,000 standing desk setup to have a great workspace. A few well-chosen accessories under $50 can transform a cluttered desk into a clean, productive environment. Here's what's actually worth buying.",
    updatedAt: "May 2025",
    category: "Desk Accessories",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
