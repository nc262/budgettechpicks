#!/usr/bin/env node
// One-shot internal-link crawler over the built `out/` export.
// Verifies every internal href/src resolves to a generated file. Not committed —
// a review-time tool. Exits 0 with a report; never mutates anything.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";

const OUT = "out";
const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (e.endsWith(".html")) htmlFiles.push(p);
  }
})(OUT);

// Build a set of resolvable paths: every file under out/, plus directory routes.
const exists = (urlPath) => {
  let clean = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (clean === "" || clean === "/") clean = "/index.html";
  const candidates = [
    join(OUT, clean),
    join(OUT, clean + ".html"),
    join(OUT, clean, "index.html"),
  ];
  return candidates.some((c) => existsSync(c));
};

const internalRefs = new Map(); // url -> Set(sourceFiles)
const hrefRe = /(?:href|src)="([^"]+)"/g;
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  let m;
  while ((m = hrefRe.exec(html))) {
    const url = m[1];
    if (url.startsWith("/") && !url.startsWith("//")) {
      if (!internalRefs.has(url)) internalRefs.set(url, new Set());
      internalRefs.get(url).add(f.replace(OUT + "\\", "").replace(OUT + "/", ""));
    }
  }
}

const broken = [];
for (const [url, sources] of internalRefs) {
  if (!exists(url)) broken.push({ url, sources: [...sources].slice(0, 5) });
}

console.log(`Scanned ${htmlFiles.length} HTML files, ${internalRefs.size} distinct internal refs.`);
if (broken.length === 0) {
  console.log("ALL INTERNAL LINKS RESOLVE ✓");
} else {
  console.log(`\nBROKEN (${broken.length}):`);
  for (const b of broken.sort((a, b) => a.url.localeCompare(b.url))) {
    console.log(`  ✗ ${b.url}`);
    console.log(`      from: ${b.sources.join(", ")}`);
  }
}
