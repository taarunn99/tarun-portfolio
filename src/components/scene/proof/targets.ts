/**
 * Turns each number ("7", "9.2×", "AED 2.27M" ...) into `count` points that
 * fill its glyphs. The text is drawn once on a 2D canvas, the filled pixels
 * are collected, and `count` of them are picked at random (with jitter, so
 * repeats on short strings don't stack). Every number gets the same count,
 * so particle k always has a home in every number and can fly between them.
 *
 * Output is in CSS pixels, centred on the number box, y up.
 */

export type Box = { width: number; height: number };

/** Small deterministic PRNG so layouts are stable between resizes. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sampling resolution: CSS px per canvas px (lower is finer). */
const STEP = 1.5;

export function sampleNumber(text: string, box: Box, font: string, weight: number, count: number, seed: number): Float32Array {
  const out = new Float32Array(count * 2);
  const w = Math.max(2, Math.round(box.width / STEP));
  const h = Math.max(2, Math.round(box.height / STEP));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return out;

  // fit the string to the box: as tall as possible, never wider than it
  const probe = 100;
  ctx.font = `${weight} ${probe}px ${font}`;
  const m = ctx.measureText(text);
  const glyphH = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || probe * 0.72;
  const size = Math.min((h * 0.94 * probe) / glyphH, (w * 0.98 * probe) / Math.max(1, m.width));
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const mm = ctx.measureText(text);
  const asc = mm.actualBoundingBoxAscent || size * 0.72;
  const desc = mm.actualBoundingBoxDescent || 0;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, w / 2, h / 2 + (asc - desc) / 2);

  const data = ctx.getImageData(0, 0, w, h).data;
  const filled: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if ((data[(y * w + x) * 4 + 3] ?? 0) > 120) filled.push(x, y);
    }
  }
  const n = filled.length / 2;
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    if (n === 0) {
      out[i * 2] = (rand() - 0.5) * box.width;
      out[i * 2 + 1] = (rand() - 0.5) * box.height;
      continue;
    }
    const k = Math.floor(rand() * n) * 2;
    const px = (filled[k] ?? 0) + rand();
    const py = (filled[k + 1] ?? 0) + rand();
    out[i * 2] = px * STEP - box.width / 2;
    out[i * 2 + 1] = box.height / 2 - py * STEP;
  }
  return out;
}

/** Per particle randoms: x = morph delay, y = size/depth, z/w = burst direction. */
export function particleSeeds(count: number): Float32Array {
  const out = new Float32Array(count * 4);
  const rand = rng(0x5eed);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.35 + rand() * 0.65;
    out[i * 4] = rand();
    out[i * 4 + 1] = rand();
    out[i * 4 + 2] = Math.cos(a) * r;
    out[i * 4 + 3] = Math.sin(a) * r;
  }
  return out;
}
