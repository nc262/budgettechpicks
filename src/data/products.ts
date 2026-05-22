export interface Product {
  id: string;
  name: string;
  asin: string;
  price: string;
  rating: number;
  reviewCount: number;
  description: string;
  pros: string[];
  cons: string[];
  imageUrl: string;
  category: string;
  articleSlug: string;
}

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "yoursite-20";

export function affiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}&linkCode=ogi&th=1`;
}

export const categoryEmoji: Record<string, string> = {
  "USB-C Hubs": "🔌",
  "Webcams": "📷",
  "Wireless Earbuds": "🎧",
  "Desk Accessories": "🖥️",
};

export const categoryColor: Record<string, string> = {
  "USB-C Hubs": "bg-blue-100 text-blue-700",
  "Webcams": "bg-purple-100 text-purple-700",
  "Wireless Earbuds": "bg-green-100 text-green-700",
  "Desk Accessories": "bg-orange-100 text-orange-700",
};

export const products: Product[] = [
  {
    id: "anker-usbc-hub-7in1",
    name: "Anker 7-in-1 USB-C Hub",
    asin: "B07ZVKTP53",
    price: "$35.99",
    rating: 4.6,
    reviewCount: 28000,
    description: "Turn one USB-C port into seven: 4K HDMI, 100W Power Delivery, SD/microSD card readers, and two USB-A 3.0 ports.",
    pros: ["Compact & travel-friendly", "100W PD pass-through", "4K@30Hz HDMI"],
    cons: ["No Ethernet port", "Gets slightly warm under heavy load"],
    imageUrl: "",
    category: "USB-C Hubs",
    articleSlug: "best-usb-c-hubs-under-50",
  },
  {
    id: "ugreen-usbc-hub-9in1",
    name: "UGREEN 9-in-1 USB-C Hub",
    asin: "B08R6Q1G3F",
    price: "$45.99",
    rating: 4.5,
    reviewCount: 12000,
    description: "Nine ports including dual display output (HDMI + VGA), Ethernet, 3.5mm audio, SD card, and three USB-A ports.",
    pros: ["Dual display support", "Gigabit Ethernet", "Wide compatibility"],
    cons: ["Slightly bulkier", "Needs USB-C PD host for max charging"],
    imageUrl: "",
    category: "USB-C Hubs",
    articleSlug: "best-usb-c-hubs-under-50",
  },
  {
    id: "hiearcool-usbc-hub",
    name: "Hiearcool USB-C Hub 7-in-1",
    asin: "B09413MX6X",
    price: "$27.99",
    rating: 4.4,
    reviewCount: 9500,
    description: "Budget-friendly 7-in-1 hub with 4K HDMI, 100W PD, USB 3.0 ports, and SD/TF card reader in an ultra-slim design.",
    pros: ["Best value pick", "Ultra-slim", "Universal compatibility"],
    cons: ["HDMI limited to 30Hz at 4K", "SD reader is USB 2.0 speed"],
    imageUrl: "",
    category: "USB-C Hubs",
    articleSlug: "best-usb-c-hubs-under-50",
  },
  {
    id: "logitech-c920s",
    name: "Logitech C920s HD Pro Webcam",
    asin: "B07K986YLL",
    price: "$49.99",
    rating: 4.6,
    reviewCount: 45000,
    description: "1080p/30fps Full HD with automatic light correction and dual mics. The gold standard for home office video calls.",
    pros: ["Crystal-clear 1080p", "Auto light correction", "Built-in privacy shutter"],
    cons: ["No 4K", "Fixed focus"],
    imageUrl: "",
    category: "Webcams",
    articleSlug: "best-budget-webcams",
  },
  {
    id: "razer-kiyo",
    name: "Razer Kiyo Webcam with Ring Light",
    asin: "B075N1BYWB",
    price: "$49.99",
    rating: 4.4,
    reviewCount: 31000,
    description: "1080p/30fps webcam with a built-in adjustable ring light — no extra lighting gear needed for a pro look.",
    pros: ["Built-in ring light", "Plug-and-play", "Great in low light"],
    cons: ["Bulkier than competitors", "Ring light non-removable"],
    imageUrl: "",
    category: "Webcams",
    articleSlug: "best-budget-webcams",
  },
  {
    id: "anker-powerconf-c200",
    name: "Anker PowerConf C200 2K Webcam",
    asin: "B09MFMTMPD",
    price: "$39.99",
    rating: 4.4,
    reviewCount: 8200,
    description: "2K resolution with a Sony sensor, dual noise-cancelling mics, and AI-powered auto-framing.",
    pros: ["2K Sony sensor quality", "AI auto-framing", "Dual noise-cancelling mics"],
    cons: ["Not 4K", "Less brand recognition"],
    imageUrl: "",
    category: "Webcams",
    articleSlug: "best-budget-webcams",
  },
  {
    id: "soundcore-p3i",
    name: "Soundcore Life P3i Earbuds",
    asin: "B09W2CGWQY",
    price: "$39.99",
    rating: 4.4,
    reviewCount: 17000,
    description: "Active Noise Cancellation, 10-hour battery, and 4 mics for clear calls — all for under $40.",
    pros: ["ANC under $40", "App EQ control", "10hr playtime"],
    cons: ["ANC not as deep as premium buds", "Bulkier ear tips"],
    imageUrl: "",
    category: "Wireless Earbuds",
    articleSlug: "best-wireless-earbuds-under-50",
  },
  {
    id: "jabra-elite-3",
    name: "Jabra Elite 3 Wireless Earbuds",
    asin: "B09GD6HY71",
    price: "$49.99",
    rating: 4.3,
    reviewCount: 22000,
    description: "Mono audio mode, 28-hour total battery with case, and IP55 sweat resistance — great for commuters.",
    pros: ["Mono mode for calls", "IP55 rated", "28hr total battery"],
    cons: ["No ANC", "Slightly bulky design"],
    imageUrl: "",
    category: "Wireless Earbuds",
    articleSlug: "best-wireless-earbuds-under-50",
  },
  {
    id: "tozo-t6",
    name: "TOZO T6 True Wireless Earbuds",
    asin: "B07RGZ5NKS",
    price: "$25.99",
    rating: 4.3,
    reviewCount: 89000,
    description: "One of Amazon's best-selling earbuds: IPX8 waterproofing, deep bass, and 6hr playtime at an unbeatable price.",
    pros: ["IPX8 waterproof", "Incredible value", "Deep bass"],
    cons: ["No ANC", "Average mic quality"],
    imageUrl: "",
    category: "Wireless Earbuds",
    articleSlug: "best-wireless-earbuds-under-50",
  },
  {
    id: "lamicall-phone-stand",
    name: "Lamicall Adjustable Phone Stand",
    asin: "B01N9ETPHV",
    price: "$14.99",
    rating: 4.5,
    reviewCount: 62000,
    description: "Aluminum adjustable desktop phone holder with 270° angle adjustment. Holds any phone 4–8 inches.",
    pros: ["Sturdy aluminum build", "270° angle adjustment", "Works with cases"],
    cons: ["Doesn't hold tablets well", "Shows fingerprints"],
    imageUrl: "",
    category: "Desk Accessories",
    articleSlug: "best-desk-accessories-under-50",
  },
  {
    id: "magnetic-cable-organizer",
    name: "Magnetic Cable Clips (10-Pack)",
    asin: "B09NQG24NL",
    price: "$9.99",
    rating: 4.4,
    reviewCount: 14000,
    description: "Stick-on magnetic clips keep USB, charging, and headphone cables organized on your desk or monitor.",
    pros: ["Easy peel-and-stick install", "Holds multiple cable types", "Very affordable"],
    cons: ["Adhesive may weaken on textured surfaces"],
    imageUrl: "",
    category: "Desk Accessories",
    articleSlug: "best-desk-accessories-under-50",
  },
  {
    id: "anker-wireless-charger-pad",
    name: "Anker 15W Wireless Charger Pad",
    asin: "B07THHQMHM",
    price: "$15.99",
    rating: 4.5,
    reviewCount: 39000,
    description: "Qi-certified 15W fast wireless charger pad with LED indicator and sleep-friendly design.",
    pros: ["15W fast charge", "Works through cases up to 5mm", "Sleep-friendly LED"],
    cons: ["Adapter not included", "One device at a time"],
    imageUrl: "",
    category: "Desk Accessories",
    articleSlug: "best-desk-accessories-under-50",
  },
];

export function getProductsByArticle(slug: string): Product[] {
  return products.filter((p) => p.articleSlug === slug);
}

export function getFeaturedProducts(): Product[] {
  return [
    products.find((p) => p.id === "anker-usbc-hub-7in1")!,
    products.find((p) => p.id === "logitech-c920s")!,
    products.find((p) => p.id === "soundcore-p3i")!,
    products.find((p) => p.id === "tozo-t6")!,
  ];
}
