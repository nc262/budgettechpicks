// Builds Pinterest pin images for products: picks the set, computes the on-pin text
// (kicker / headline / rating / price), then hands a manifest to render-pins.ps1 (.NET).
// Output: public/images/pinterest/auto/<asin>.jpg
//
// Flags:
//   --all       render every live catalog product (default: only deep-reviewed products)
//   --asins=A,B  render a specific comma-separated ASIN list (used by the discovery job
//                to make pins for newly found products)
//   --force      re-render even if the image already exists
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/images/pinterest/auto");
const MANIFEST = "C:\\n8n-data\\pin-manifest.json";

const ALL = process.argv.includes("--all");
const FORCE = process.argv.includes("--force");
const asinArg = (process.argv.find((a) => a.startsWith("--asins=")) || "").split("=")[1];
const onlyAsins = asinArg ? new Set(asinArg.split(",").map((s) => s.trim())) : null;

// ── Parse site data ──────────────────────────────────────────────────────────
const productsTs = readFileSync(join(ROOT, "src/data/products.ts"), "utf8");
const products = [...productsTs.matchAll(
  /id:\s*"([^"]+)",\s*\n\s*name:\s*"(.+?)",\s*\n\s*asin:\s*"([A-Z0-9]{10})",\s*\n\s*price:\s*"([^"]*)"[\s\S]*?rating:\s*([\d.]+),\s*\n\s*reviewCount:\s*(\d+)[\s\S]*?category:\s*"([^"]+)",\s*\n\s*articleSlug:\s*"([^"]+)",\s*\n(?:\s*badge:\s*"(.+?)",\s*\n)?\s*\}/g
)].map((m) => ({
  id: m[1], name: m[2].replace(/\\"/g, '"'), asin: m[3], price: m[4],
  rating: Number(m[5]), reviewCount: Number(m[6]), category: m[7], articleSlug: m[8],
  badge: m[9] ? m[9].replace(/\\"/g, '"') : "",
}));

const reviewsTs = readFileSync(join(ROOT, "src/data/reviews.ts"), "utf8");
const reviewedIds = new Set([...reviewsTs.matchAll(/^  "([a-z0-9-]+)": \{/gm)].map((m) => m[1]));

let health = {};
try { health = JSON.parse(readFileSync(join(ROOT, "src/data/product-health.json"), "utf8")); } catch {}
const isLive = (asin) => health[asin]?.isLive !== false;

// Strip emojis / non-ASCII so the .NET renderer never sees tofu glyphs
const cleanText = (s) => (s || "").replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();

// ── Select products ──────────────────────────────────────────────────────────
let selected = products.filter((p) => {
  if (!isLive(p.asin)) return false;
  if (onlyAsins) return onlyAsins.has(p.asin);
  if (ALL) return true;
  return reviewedIds.has(p.id);
});

if (selected.length === 0) {
  console.log("No products to render for the given selection.");
  process.exit(0);
}

// ── Resolve an image for each: local file, else download the health-check CDN
//    image into a cache so every selected product gets a real photo ────────────
const CACHE = "C:\\n8n-data\\pin-cache";
mkdirSync(CACHE, { recursive: true });

async function resolveImage(p) {
  const local = join(ROOT, "public/images/products", p.asin + ".jpg");
  if (existsSync(local)) return local;
  const cached = join(CACHE, p.asin + ".jpg");
  if (existsSync(cached)) return cached;
  const url = health[p.asin]?.imageUrl;
  if (!url || !url.startsWith("http")) return null;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1500) return null; // CDN placeholder / dead image
    writeFileSync(cached, buf);
    return cached;
  } catch {
    return null;
  }
}

// ── Build manifest ───────────────────────────────────────────────────────────
const manifest = [];
for (const p of selected) {
  const imagePath = await resolveImage(p);
  if (!imagePath) { console.log(`  no image for ${p.asin} "${p.name}" — skipped`); continue; }
  const [base, subtitle] = p.name.split(" — "); // em-dash split for "Name — Subtitle"
  const kicker = cleanText(p.badge) || cleanText(subtitle) || cleanText(p.category);
  manifest.push({
    asin: p.asin,
    kicker,
    headline: cleanText(base),
    rating: `★ ${p.rating}  ·  ${p.reviewCount.toLocaleString()} ratings`,
    price: p.price,
    imagePath,
  });
}

if (manifest.length === 0) {
  console.log("No renderable products (no images resolved).");
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Manifest: ${manifest.length} product(s) -> rendering…`);

// ── Render via .NET (proven on this machine) ─────────────────────────────────
const forceFlag = FORCE ? "-Force" : "";
const cmd = `pwsh -NoProfile -ExecutionPolicy Bypass -File "${join(ROOT, "scripts/render-pins.ps1")}" -ManifestPath "${MANIFEST}" -OutDir "${OUT_DIR}" ${forceFlag}`;
const out = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
console.log(out.trim());
