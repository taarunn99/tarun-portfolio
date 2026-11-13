/**
 * Tile layouts for the rebuild story. Both layouts use exactly TILES tiles in
 * a unit box (x and y from -0.5 to 0.5, y up), so tile i of the old site flies
 * to tile i of the new one.
 *
 *   old: a cluttered page as a mosaic: header, nav, ad banners, a sidebar,
 *        walls of text, a pop-up over the content; every tile slightly off
 *   new: 62 clean blocks (nav, hero, product cards, brand strip, features,
 *        footer); each block is a tidy sub-grid of tiles
 *
 * TILES matches the ~1,200 pages lapizblue.com had; BLOCKS the 62 it kept
 * (src/content/services.ts outcomes).
 */

export const TILES = 1200;
export const BLOCKS = 62;

/** Colour roles; the canvas maps them to design tokens. */
export const Role = {
  Base: 0, // old page background
  Header: 1, // old header bar
  Ad: 2, // old banners
  Text: 3, // old text lines
  Popup: 4, // old pop-up
  Ink: 5, // new: text
  Media: 6, // new: images
  Action: 7, // new: buttons and highlights
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export type Layout = {
  /** x, y per tile */
  pos: Float32Array;
  /** tile edge length, in unit-box widths */
  size: Float32Array;
  role: Float32Array;
};

/** Deterministic random (no Math.random during render). */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- old -- */

/** Role of the old page at (u, v): u, v in 0..1 from the top-left. */
function oldRole(u: number, v: number, narrow: boolean, r: number): Role {
  // a pop-up box over the middle of the page
  const pop = narrow ? u > 0.12 && u < 0.88 && v > 0.42 && v < 0.6 : u > 0.3 && u < 0.62 && v > 0.36 && v < 0.6;
  if (pop) return Role.Popup;
  if (v < 0.07) return Role.Header;
  if (v < 0.11) return r < 0.35 ? Role.Ad : Role.Text; // a nav row of loud links
  if (v < 0.27) return u < (narrow ? 1 : 0.7) ? Role.Ad : Role.Text; // the big banner
  const side = !narrow && u > 0.74;
  if (side) {
    // sidebar: stacked boxes with gaps
    const box = Math.floor((v - 0.27) / 0.12);
    return (v - 0.27) % 0.12 < 0.09 ? (box % 2 ? Role.Ad : Role.Header) : Role.Base;
  }
  if (v > 0.9) return Role.Header; // footer
  // walls of text: lines with ragged ends
  const line = (v * 40) % 1;
  if (line > 0.62) return Role.Base;
  return u < 0.68 - r * 0.08 || narrow ? (r < 0.06 ? Role.Ad : Role.Text) : Role.Base;
}

export function oldSite(aspect: number, narrow: boolean): Layout {
  const pos = new Float32Array(TILES * 2);
  const size = new Float32Array(TILES);
  const role = new Float32Array(TILES);
  const cols = Math.round(Math.sqrt(TILES * aspect));
  const rows = Math.ceil(TILES / cols);
  const cell = 1 / cols;
  const rand = rng(0x01d5);
  for (let i = 0; i < TILES; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const u = (c + 0.5) / cols;
    const v = (r + 0.5) / rows;
    // messy: every tile a little off its grid cell
    pos[i * 2] = u - 0.5 + (rand() - 0.5) * cell * 0.3;
    pos[i * 2 + 1] = (0.5 - v) / aspect + (rand() - 0.5) * cell * 0.3;
    size[i] = cell * (0.78 + rand() * 0.18);
    role[i] = oldRole(u, v, narrow, rand());
  }
  return { pos, size, role };
}

/* ---------------------------------------------------------------- new -- */

type Rect = { x: number; y: number; w: number; h: number; role: Role };

/** A row of `n` equal rects across [x0, x0 + w], gap g. */
function row(rects: Rect[], n: number, x0: number, y: number, w: number, h: number, g: number, role: Role) {
  const cw = (w - g * (n - 1)) / n;
  for (let i = 0; i < n; i++) rects.push({ x: x0 + i * (cw + g), y, w: cw, h, role });
}

/** Exactly BLOCKS rects describing a clean site, in 0..1 page units (v down). */
function cleanBlocks(narrow: boolean): Rect[] {
  const R: Rect[] = [];
  const m = 0.06; // side margin
  const W = 1 - m * 2;
  const g = narrow ? 0.03 : 0.018;

  if (!narrow) {
    // nav: logo + 5 links (6)
    R.push({ x: m, y: 0.035, w: 0.12, h: 0.035, role: Role.Action });
    row(R, 5, 0.52, 0.04, W - 0.46, 0.022, 0.025, Role.Ink);
    // hero: title, line, 2 buttons, image (5)
    R.push({ x: m, y: 0.12, w: 0.42, h: 0.07, role: Role.Ink });
    R.push({ x: m, y: 0.205, w: 0.34, h: 0.03, role: Role.Ink });
    R.push({ x: m, y: 0.255, w: 0.12, h: 0.04, role: Role.Action });
    R.push({ x: m + 0.135, y: 0.255, w: 0.12, h: 0.04, role: Role.Ink });
    R.push({ x: 0.55, y: 0.12, w: W - 0.49, h: 0.175, role: Role.Media });
    // products: 4 x 3 cards, image + caption each (24)
    for (let r = 0; r < 3; r++) {
      const y = 0.34 + r * 0.115;
      row(R, 4, m, y, W, 0.07, g, Role.Media);
      row(R, 4, m, y + 0.078, W, 0.018, g, Role.Ink);
    }
    // brand strip (8)
    row(R, 8, m, 0.69, W, 0.03, g, Role.Ink);
    // features: icon + text in 3 columns (6)
    for (let i = 0; i < 3; i++) {
      const x = m + i * ((W + g) / 3);
      R.push({ x, y: 0.75, w: 0.035, h: 0.05, role: Role.Action });
      R.push({ x: x + 0.045, y: 0.755, w: (W + g) / 3 - g - 0.05, h: 0.04, role: Role.Ink });
    }
    // footer: 4 columns of 3 lines + copyright (13)
    for (let c = 0; c < 4; c++) for (let l = 0; l < 3; l++) R.push({ x: m + c * ((W + g) / 4), y: 0.84 + l * 0.032, w: 0.12, h: 0.016, role: Role.Ink });
    R.push({ x: m, y: 0.955, w: W, h: 0.012, role: Role.Ink });
  } else {
    // nav: logo + menu, then a row of 4 category chips (6)
    R.push({ x: m, y: 0.025, w: 0.22, h: 0.025, role: Role.Action });
    R.push({ x: 1 - m - 0.08, y: 0.025, w: 0.08, h: 0.025, role: Role.Ink });
    row(R, 4, m, 0.058, W, 0.012, g, Role.Ink);
    // hero: title, line, 2 buttons, image (5)
    R.push({ x: m, y: 0.085, w: W, h: 0.045, role: Role.Ink });
    R.push({ x: m, y: 0.14, w: W * 0.8, h: 0.02, role: Role.Ink });
    R.push({ x: m, y: 0.175, w: W * 0.45, h: 0.03, role: Role.Action });
    R.push({ x: m + W * 0.5, y: 0.175, w: W * 0.45, h: 0.03, role: Role.Ink });
    R.push({ x: m, y: 0.22, w: W, h: 0.1, role: Role.Media });
    // products: 2 x 6 cards, image + caption each (24)
    for (let r = 0; r < 6; r++) {
      const y = 0.34 + r * 0.068;
      row(R, 2, m, y, W, 0.045, g, Role.Media);
      row(R, 2, m, y + 0.05, W, 0.01, g, Role.Ink);
    }
    // brand strip (8)
    row(R, 4, m, 0.755, W, 0.018, g, Role.Ink);
    row(R, 4, m, 0.78, W, 0.018, g, Role.Ink);
    // features: icon + text, 3 rows (6)
    for (let i = 0; i < 3; i++) {
      R.push({ x: m, y: 0.815 + i * 0.03, w: 0.06, h: 0.022, role: Role.Action });
      R.push({ x: m + 0.09, y: 0.818 + i * 0.03, w: W - 0.09, h: 0.016, role: Role.Ink });
    }
    // footer: 2 columns of 6 lines + copyright (13)
    for (let c = 0; c < 2; c++) for (let l = 0; l < 6; l++) R.push({ x: m + c * (W / 2), y: 0.91 + l * 0.012, w: W * 0.35, h: 0.007, role: Role.Ink });
    R.push({ x: m, y: 0.988, w: W, h: 0.006, role: Role.Ink });
  }
  return R;
}

export function newSite(aspect: number, narrow: boolean): Layout {
  const rects = cleanBlocks(narrow);
  if (rects.length !== BLOCKS) throw new Error(`rebuild: ${rects.length} blocks, expected ${BLOCKS}`);
  const pos = new Float32Array(TILES * 2);
  const size = new Float32Array(TILES);
  const role = new Float32Array(TILES);

  // share the tiles by block area (largest remainder, at least 4 each)
  const area = rects.map((r) => r.w * r.h);
  const spare = TILES - BLOCKS * 4;
  const total = area.reduce((a, b) => a + b, 0);
  const exact = area.map((a) => (a / total) * spare);
  const counts = exact.map((e) => 4 + Math.floor(e));
  let left = TILES - counts.reduce((a, b) => a + b, 0);
  const order = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) {
    const at = order[k]?.[1] ?? 0;
    counts[at] = (counts[at] ?? 4) + 1;
  }

  // page units: x 0..1 across, y 0..1 down the page, page height = 1/aspect
  let t = 0;
  rects.forEach((r, b) => {
    const n = counts[b] ?? 4;
    const pw = r.w;
    const ph = r.h / aspect;
    const cols = Math.max(1, Math.round(Math.sqrt((n * pw) / ph)));
    const rows = Math.ceil(n / cols);
    const cw = pw / cols;
    const rh = ph / rows;
    const edge = Math.min(cw, rh) * 1.04;
    for (let k = 0; k < n; k++, t++) {
      const c = k % cols;
      const rr = Math.floor(k / cols);
      pos[t * 2] = r.x + (c + 0.5) * cw - 0.5;
      pos[t * 2 + 1] = 0.5 / aspect - (r.y / aspect + (rr + 0.5) * rh);
      size[t] = edge;
      role[t] = r.role;
    }
  });
  return { pos, size, role };
}

/** Per-tile random values for the storm: radius, angle, height, speed. */
export function stormSeeds(): Float32Array {
  const rand = rng(0x5707);
  const out = new Float32Array(TILES * 4);
  for (let i = 0; i < out.length; i++) out[i] = rand();
  return out;
}
