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
    title: "Best USB-C Hubs Under $50 in 2026",
    metaDescription: "The best budget USB-C hubs for MacBooks and Windows laptops — tested and ranked.",
    intro: "Modern laptops ship with fewer ports than ever. A good USB-C hub solves that instantly — and you don't need to spend $100+ to get one that works great.",
    updatedAt: "May 2026",
    category: "USB-C Hubs",
  },
  {
    slug: "best-budget-webcams",
    title: "Best Budget Webcams Under $50 for Work From Home (2026)",
    metaDescription: "Upgrade your video calls without overspending. The best webcams under $50 for crisp 1080p+ video.",
    intro: "Your laptop's built-in webcam makes you look like you're in witness protection. These picks cost less than a dinner out and look ten times better.",
    updatedAt: "May 2026",
    category: "Webcams",
  },
  {
    slug: "best-wireless-earbuds-under-50",
    title: "Best Wireless Earbuds Under $50 That Actually Sound Good (2026)",
    metaDescription: "You don't need AirPods. These wireless earbuds under $50 deliver great audio, long battery, and solid call quality.",
    intro: "Premium earbuds cost $250+. But the gap between $50 and $250 has never been smaller. Here are the picks that punch way above their price.",
    updatedAt: "May 2026",
    category: "Wireless Earbuds",
  },
  {
    slug: "best-desk-accessories-under-50",
    title: "Best Desk Accessories Under $50 to Upgrade Your Home Office (2026)",
    metaDescription: "Small upgrades, big impact. The best desk accessories under $50 for a more organized, productive workspace.",
    intro: "You don't need a $5,000 standing desk setup to have a great workspace. A few well-chosen accessories under $50 can transform a cluttered desk.",
    updatedAt: "May 2026",
    category: "Desk Accessories",
  },
  {
    slug: "best-gaming-gear-under-50",
    title: "Best Budget Gaming Gear Under $50 (2026)",
    metaDescription: "Level up your setup without breaking the bank. The best gaming mice, keyboards, headsets, and RGB gear under $50.",
    intro: "You don't need to spend $200 on a gaming mouse to dominate. These picks deliver real gaming performance at a fraction of the price.",
    updatedAt: "May 2026",
    category: "Gaming Gear",
  },
  {
    slug: "best-desk-toys-under-50",
    title: "Best Desk Toys & Fidget Gadgets Under $50 (2026)",
    metaDescription: "The best desk toys, fidget gadgets, and fun office accessories under $50 to keep your hands busy and your mind sharp.",
    intro: "The best desk toys do two things: relieve stress and spark creativity. These picks are satisfying, conversation-starting, and all under $50.",
    updatedAt: "May 2026",
    category: "Desk Toys & Fun",
  },
  {
    slug: "best-smart-home-under-50",
    title: "Best Smart Home Gadgets Under $50 (2026)",
    metaDescription: "Start your smart home without spending a fortune. The best smart plugs, bulbs, and speakers under $50.",
    intro: "A smart home doesn't require a $500 setup. These gadgets work with Alexa and Google Home and cost under $50 each.",
    updatedAt: "May 2026",
    category: "Smart Home",
  },
  {
    slug: "best-portable-tech-under-50",
    title: "Best Portable Tech Gadgets Under $50 (2026)",
    metaDescription: "Power banks, Bluetooth speakers, item trackers — the best portable tech under $50 for life on the go.",
    intro: "The best portable tech keeps you charged, connected, and never losing your stuff — for under $50.",
    updatedAt: "May 2026",
    category: "Portable Tech",
  },
  {
    slug: "best-monitors-and-displays",
    title: "Best Monitors & Displays for Every Budget (2026)",
    metaDescription: "From $229 budget gaming monitors to $1,300 OLED masterpieces — the best displays for gaming, work, and content creation.",
    intro: "Your monitor is the one piece of tech you stare at for 8+ hours a day. It deserves more thought than your GPU. Whether you're on a tight budget or ready to splurge on QD-OLED, here's what's actually worth buying.",
    updatedAt: "May 2026",
    category: "Monitors & Displays",
  },
  {
    slug: "best-streaming-gear",
    title: "Best Streaming & Content Creator Gear (2026)",
    metaDescription: "Microphones, capture cards, key lights, and stream decks — everything you need to go from bedroom streamer to professional creator.",
    intro: "Great content doesn't need a $10,000 studio. A few hundred dollars of the right gear turns your desk into a broadcast setup. Here's exactly what to buy and in what order.",
    updatedAt: "May 2026",
    category: "Streaming Gear",
  },
  {
    slug: "best-audio-gear",
    title: "Best Headphones & Microphones for Every Budget (2026)",
    metaDescription: "From $149 studio reference headphones to $399 broadcast microphones — the best audio gear for music, gaming, and work.",
    intro: "Good audio is felt before it's understood. Whether you're mixing music, gaming, or just tired of hearing every noise in your office, these picks represent the best sound per dollar at every price point.",
    updatedAt: "May 2026",
    category: "Audio & Microphones",
  },
  {
    slug: "best-gaming-setups",
    title: "Best Gaming Setup Gear: Budget to Extreme (2026)",
    metaDescription: "Gaming keyboards, mice, chairs, handhelds, standing desks — the full gaming setup breakdown from $80 to over-the-top.",
    intro: "A great gaming setup isn't about spending the most — it's about spending smart. We cover everything from the $80 mechanical keyboard that competes with $200 boards to the Steam Deck and ROG Ally that put your entire PC in your hands.",
    updatedAt: "May 2026",
    category: "Gaming Setups",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

