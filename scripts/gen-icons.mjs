// Rasterize public/icon.svg into the PNG sizes the PWA manifest references.
// Run with: npm run icons  (requires sharp). Safe to re-run.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const pub = resolve(here, "../public");

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp not installed — run `npm i -D sharp` then `npm run icons`.");
  process.exit(1);
}

const svg = readFileSync(resolve(pub, "icon.svg"));

const targets = [
  { name: "pwa-192.png", size: 192 },
  { name: "pwa-512.png", size: 512 },
];

for (const { name, size } of targets) {
  const buf = await sharp(svg).resize(size, size).png().toBuffer();
  writeFileSync(resolve(pub, name), buf);
  console.log("wrote", name);
}

// Maskable icon: same art on a solid safe-area background (no transparency).
const maskable = await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#0d1117" },
})
  .composite([{ input: await sharp(svg).resize(360, 360).png().toBuffer(), gravity: "center" }])
  .png()
  .toBuffer();
writeFileSync(resolve(pub, "maskable-512.png"), maskable);
console.log("wrote maskable-512.png");
