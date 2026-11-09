import styles from "./DubaiSkyline.module.css";

/**
 * Dubai skyline silhouette for the hero horizon (in place of the mountain in
 * the aurora reference). Pure SVG, server rendered: it paints with the first
 * frame, costs no JS, and parallaxes with a CSS scroll-driven animation.
 *
 * Geometry is deterministic (seeded) so server and client markup match.
 * viewBox: 1600 x 300, ground at y = 300.
 */

const W = 1600;
const H = 300;

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

type Box = { x: number; w: number; h: number };

const r = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, w: number, h: number) => `M${r(x)} ${H}V${r(H - h)}H${r(x + w)}V${H}Z`;

/** Filler towers: a deterministic band of mid-rise blocks, some with stepped crowns. */
function fillerTowers(): { d: string; boxes: Box[] } {
  const rand = rng(0x2b7e);
  const boxes: Box[] = [];
  let d = "";
  let x = -10;
  while (x < W + 10) {
    const w = 22 + rand() * 46;
    const h = 40 + rand() * 95;
    d += rect(x, w, h);
    if (rand() > 0.55) d += rect(x + w * 0.25, w * 0.5, h + 8 + rand() * 18);
    if (rand() > 0.82) d += `M${r(x + w / 2 - 1)} ${r(H - h - 4)}V${r(H - h - 28)}h2V${r(H - h - 4)}Z`;
    boxes.push({ x, w, h });
    x += w - 4 + rand() * 10;
  }
  return { d, boxes };
}

/** Burj Khalifa: stepped setbacks around a central core, ending in a long spire. */
function burjKhalifa(cx: number): string {
  const tiers = [
    [70, 70],
    [58, 120],
    [48, 160],
    [38, 196],
    [28, 224],
    [20, 246],
    [12, 262],
  ];
  let d = "";
  for (const [w, h] of tiers) d += rect(cx - w / 2, w, h);
  d += `M${cx - 3} ${H - 262}L${cx} ${H - 300}L${cx + 3} ${H - 262}Z`;
  return d;
}

/** Burj Al Arab: a sail curving out of the water with a mast. */
function burjAlArab(x: number): string {
  return (
    `M${x} ${H}V${H - 8}C${x + 6} ${H - 90} ${x + 30} ${H - 160} ${x + 62} ${H - 190}` +
    `L${x + 66} ${H - 190}V${H}Z` +
    `M${x + 62} ${H - 190}L${x + 64} ${H - 214}L${x + 67} ${H - 190}Z`
  );
}

/** Emirates Towers: two slim towers with angled crowns. */
function emiratesTowers(x: number): string {
  return (
    `M${x} ${H}V${H - 150}L${x + 26} ${H - 182}V${H}Z` +
    `M${x + 36} ${H}V${H - 128}L${x + 58} ${H - 154}V${H}Z`
  );
}

/** Dubai Frame: two legs joined by a top bridge, open in the middle. */
function dubaiFrame(x: number): string {
  return `M${x} ${H}V${H - 150}H${x + 70}V${H}H${x + 58}V${H - 136}H${x + 12}V${H}Z`;
}

/** Museum of the Future: an elliptical torus (even-odd, so the hole stays open). */
function museumOfTheFuture(cx: number): string {
  const cy = H - 52;
  const ring = (rx: number, ry: number) =>
    `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
  return ring(46, 50) + ring(26, 30) + `M${cx - 30} ${H}V${H - 10}H${cx + 30}V${H}Z`;
}

/** Window lights: tiny dots scattered on the filler towers, a few of them pulse. */
function windows(boxes: Box[]) {
  const rand = rng(0x51f3);
  const dots: Array<{ x: number; y: number; pulse: boolean }> = [];
  for (const b of boxes) {
    const n = Math.floor(b.h / 26);
    for (let i = 0; i < n; i++) {
      if (rand() > 0.45) continue;
      dots.push({
        x: r(b.x + 4 + rand() * (b.w - 8)),
        y: r(H - 6 - rand() * (b.h - 12)),
        pulse: rand() > 0.85,
      });
    }
  }
  return dots;
}

const filler = fillerTowers();
const LANDMARKS = [
  dubaiFrame(170),
  burjAlArab(400),
  emiratesTowers(640),
  burjKhalifa(860),
].join("");
const MUSEUM = museumOfTheFuture(1120);
const WINDOWS = windows(filler.boxes);

export function DubaiSkyline({ className }: { className?: string }) {
  return (
    <div className={`${styles.wrap} ${className ?? ""}`} aria-hidden="true">
      <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" focusable="false">
        <defs>
          <linearGradient id="skyline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="color-mix(in oklab, var(--aurora-night) 40%, var(--bg))" />
            <stop offset="0.5" stopColor="var(--bg)" />
          </linearGradient>
        </defs>
        <path className={styles.back} d={filler.d} />
        <path className={styles.front} d={LANDMARKS} fill="url(#skyline-fill)" />
        <path className={styles.front} d={MUSEUM} fill="url(#skyline-fill)" fillRule="evenodd" />
        <g className={styles.lights}>
          {WINDOWS.map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="2" height="2" className={w.pulse ? styles.pulse : undefined} style={w.pulse ? { animationDelay: `${(i % 7) * 0.9}s` } : undefined} />
          ))}
        </g>
      </svg>
      <div className={styles.horizon} />
    </div>
  );
}
