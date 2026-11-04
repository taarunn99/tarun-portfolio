#!/usr/bin/env node
/**
 * Turns a flat silhouette-on-white image into a transparent PNG layer:
 * luminance → alpha (white = transparent, dark = opaque), tinted to a single colour.
 *
 *   node scripts/silhouette-alpha.mjs assets/src/incoming/sil-dubai.jpg assets/src/layers/layer-dubai.png [#121214]
 */
import sharp from "sharp";
import path from "node:path";

const [, , input, output, hex = "#121214"] = process.argv;
if (!input || !output) {
  console.error("usage: silhouette-alpha <input> <output.png> [#rrggbb]");
  process.exit(1);
}
const tint = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const img = sharp(input).rotate();
const { width, height } = await img.metadata();
// alpha = 255 - luminance (soft threshold so antialiased edges survive)
const lum = await img.clone().grayscale().raw().toBuffer();
const alpha = Buffer.alloc(lum.length);
for (let i = 0; i < lum.length; i++) {
  const v = lum[i];
  // map 0..60 → opaque, 60..200 → fade, >200 → transparent
  alpha[i] = v <= 60 ? 255 : v >= 200 ? 0 : Math.round(255 * (1 - (v - 60) / 140));
}
const rgba = Buffer.alloc(lum.length * 4);
for (let i = 0; i < lum.length; i++) {
  rgba[i * 4] = tint[0];
  rgba[i * 4 + 1] = tint[1];
  rgba[i * 4 + 2] = tint[2];
  rgba[i * 4 + 3] = alpha[i];
}
await sharp(rgba, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 1 })
  .png({ compressionLevel: 9 })
  .toFile(output);
console.log(`ok ${path.relative(process.cwd(), output)} ${width}x${height}`);
