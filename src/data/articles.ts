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
    metaDescription: "The best budget USB-C hubs for MacBooks and Windows laptops — tested and ranked.",
    intro: "Modern laptops ship with fewer ports than ever. A good USB-C hub solves that instantly — and you don't need to spend $100+ to get one that works great.",
    updatedAt: "May 2025",
    category: "USB-C Hubs",
  },
  {
    slug: "best-budget-webcams",
    title: "Best Budget Webcams Under $50 for Work From Home (2025)",
    metaDescription: "Upgrade your video calls without overspending. The best webcams under $50 for crisp 1080p+ video.",
    intro: "Your laptop's built-in webcam makes you look like you're in witness protection. These picks cost less than a dinner out and look ten times better.",
    updatedAt: "May 2025",
    category: "Webcams",
  },
  {
    slug: "best-wireless-earbuds-under-50",
    title: "Best Wireless Earbuds Under $50 That Actually Sound Good (2025)",
    metaDescription: "You don't need AirPods. These wireless earbuds under $50 deliver great audio, long battery, and solid call quality.",
    intro: "Premium earbuds cost $250+. But the gap between $50 and $250 has never been smaller. Here are the picks that punch way above their price.",
    updatedAt: "May 2025",
    category: "Wireless Earbuds",
  },
  {
    slug: "best-desk-accessories-under-50",
    title: "Best Desk Accessories Under $50 to Upgrade Your Home Office (2025)",
    metaDescription: "Small upgrades, big impact. The best desk accessories under $50 for a more organized, productive workspace.",
    intro: "You don't need a $5,000 standing desk setup to have a great workspace. A few well-chosen accessories under $50 can transform a cluttered desk.",
    updatedAt: "May 2025",
    category: "Desk Accessories",
  },
  {
    slug: "best-gaming-gear-under-50",
    title: "Best Budget Gaming Gear Under $50 (2025)",
    metaDescription: "Level up your setup without breaking the bank. The best gaming mice, keyboards, headsets, and RGB gear under $50.",
    intro: "You don't need to spend $200 on a gaming mouse to dominate. These picks deliver real gaming performance at a fraction of the price.",
    updatedAt: "May 2025",
    category: "Gaming Gear",
  },
  {
    slug: "best-desk-toys-under-50",
    title: "Best Desk Toys & Fidget Gadgets Under $50 (2025)",
    metaDescription: "The best desk toys, fidget gadgets, and fun office accessories under $50 to keep your hands busy and your mind sharp.",
    intro: "The best desk toys do two things: relieve stress and spark creativity. These picks are satisfying, conversation-starting, and all under $50.",
    updatedAt: "May 2025",
    category: "Desk Toys & Fun",
  },
  {
    slug: "best-smart-home-under-50",
    title: "Best Smart Home Gadgets Under $50 (2025)",
    metaDescription: "Start your smart home without spending a fortune. The best smart plugs, bulbs, and speakers under $50.",
    intro: "A smart home doesn't require a $500 setup. These gadgets work with Alexa and Google Home and cost under $50 each.",
    updatedAt: "May 2025",
    category: "Smart Home",
  },
  {
    slug: "best-portable-tech-under-50",
    title: "Best Portable Tech Gadgets Under $50 (2025)",
    metaDescription: "Power banks, Bluetooth speakers, item trackers — the best portable tech under $50 for life on the go.",
    intro: "The best portable tech keeps you charged, connected, and never losing your stuff — for under $50.",
    updatedAt: "May 2025",
    category: "Portable Tech",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
