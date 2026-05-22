// Run this once: node setup-dirs.js
const fs = require("fs");
const dirs = [
  "src/app/[slug]",
  "src/components",
  "src/data",
  "public",
];
dirs.forEach((d) => {
  fs.mkdirSync(d, { recursive: true });
  console.log("✓", d);
});
console.log("\nDone! Now run: npm install");
