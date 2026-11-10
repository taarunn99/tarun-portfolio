/**
 * Pure timing for the hero story. `p` is scroll progress through the pinned
 * hero (0 to 1). Nothing here touches three.js, so the numbers can be read
 * and tuned in one place. The caption timings in sections/Hero.tsx and
 * Hero.module.css follow the same marks.
 *
 *   0.00 to 0.08  hero copy leaves; laptop slides to centre and springs up
 *   0.10 to 0.47  the website peels off the screen, layer by layer, each on
 *                 its own spring, and stacks above the keyboard
 *   0.06 to 0.62  one full turn, ending face on
 *   0.47 to 0.54  hold, full stack, captions beside each layer
 *   0.54 to 0.62  the layers fly back into the screen
 *   0.62 to 0.72  camera dives into the screen
 *   0.72 to 1.00  the journey, on the globe: Bhopal, Singapore, Dubai
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
/** overshoots then settles: the "spring" in each part's separation */
export const easeOutBack = (t: number, s = 1.5) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;

const LAYER_START = 0.1;
const LAYER_STEP = 0.045;
const LAYER_SPAN = 0.14;
const LAYER_COUNT = 6;
const IMPLODE_START = 0.54;
const IMPLODE_SPAN = 0.08;
export const ZOOM_START = 0.62;
const ZOOM_SPAN = 0.1;
export const JOURNEY_START = ZOOM_START + ZOOM_SPAN;

const implode = (p: number) => easeInOutCubic(clamp01((p - IMPLODE_START) / IMPLODE_SPAN));

/**
 * How far layer `i` (0 = top of the stack) has travelled from the screen to
 * its floor: 0 to 1 with a springy overshoot, then back to 0 as they return.
 * Returning, the bottom layers go first so the stack collapses top down.
 */
export function layerAmount(p: number, i: number): number {
  const t = clamp01((p - (LAYER_START + i * LAYER_STEP)) / LAYER_SPAN);
  const out = t === 0 ? 0 : easeOutBack(t, 1.3);
  const back = easeInOutCubic(clamp01((p - IMPLODE_START - (LAYER_COUNT - 1 - i) * 0.008) / (IMPLODE_SPAN - 0.04)));
  return out * (1 - back);
}

/** 0 at rest beside the copy, 1 centred. */
export function moveAmount(p: number): number {
  return easeInOutCubic(clamp01(p / 0.08));
}

/** Lift with a little bounce as the laptop leaves the copy. */
export function liftAmount(p: number): number {
  const t = clamp01((p - 0.01) / 0.08);
  return t === 0 ? 0 : easeOutBack(t, 2.2);
}

/** Absolute yaw: from `base` round one full turn to face on (0). */
export function spinYaw(p: number, base: number): number {
  return mix(base, Math.PI * 2, easeInOutCubic(clamp01((p - 0.06) / 0.56)));
}

/** How built the stack is, for framing (no overshoot). */
export function stackAmount(p: number): number {
  return easeOutCubic(clamp01((p - LAYER_START) / (LAYER_STEP * (LAYER_COUNT - 1) + LAYER_SPAN))) * (1 - implode(p));
}

/** 0 framed, 1 the screen fills the viewport. */
export function zoomAmount(p: number): number {
  return easeInOutCubic(clamp01((p - ZOOM_START) / ZOOM_SPAN));
}

/** 0 to 1 through the journey. */
export function journeyT(p: number): number {
  return clamp01((p - JOURNEY_START) / (1 - JOURNEY_START));
}

/** Lid opening on load: closed, short pause, then a swing with a soft settle. */
export function lidAmount(seconds: number): number {
  const t = clamp01((seconds - 0.35) / 1.7);
  return t === 0 ? 0 : easeOutBack(t, 0.9);
}

/**
 * Where the laptop sits on screen and how much of the screen it may use,
 * as fractions of the viewport. `x`/`y` are the object's centre offset from
 * the middle (+x right, +y down).
 */
export type Frame = { x: number; y: number; fw: number; fh: number };

export function frameFor(narrow: boolean, move: number, stack: number): Frame {
  if (narrow) {
    const start: Frame = { x: 0, y: 0.31, fw: 0.84, fh: 0.3 };
    const mid: Frame = { x: 0, y: 0.05, fw: 0.84, fh: 0.36 };
    const end: Frame = { x: 0, y: -0.1, fw: 0.78, fh: 0.62 };
    const m: Frame = {
      x: 0,
      y: mix(start.y, mid.y, move),
      fw: mix(start.fw, mid.fw, move),
      fh: mix(start.fh, mid.fh, move),
    };
    return { x: 0, y: mix(m.y, end.y, stack), fw: mix(m.fw, end.fw, stack), fh: mix(m.fh, end.fh, stack) };
  }
  const start: Frame = { x: 0.24, y: 0.05, fw: 0.42, fh: 0.6 };
  const mid: Frame = { x: 0, y: 0.06, fw: 0.4, fh: 0.62 };
  const end: Frame = { x: 0, y: 0.08, fw: 0.34, fh: 0.74 };
  return {
    x: mix(start.x, mid.x, move),
    y: mix(mix(start.y, mid.y, move), end.y, stack),
    fw: mix(mix(start.fw, mid.fw, move), end.fw, stack),
    fh: mix(mix(start.fh, mid.fh, move), end.fh, stack),
  };
}

// --- journey -----------------------------------------------------------------

type LatLng = { lat: number; lng: number };

/** The wallpaper view: India-centred, the whole globe in frame. */
export const WALLPAPER: LatLng & { dist: number } = { lat: 18, lng: 72, dist: 3.5 };

export type JourneyState = {
  /** camera centre: either a fixed point or a leg in progress */
  from: LatLng;
  to: LatLng;
  /** 0 to 1 along the great circle from `from` to `to` */
  along: number;
  dist: number;
  legs: [number, number];
  lit: [number, number, number];
  /** label opacity per stop */
  labels: [number, number, number];
};

const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/**
 * Camera and route state through the journey. `stops` is Bhopal, Singapore,
 * Dubai; `overview` is a centre that frames all three.
 */
export function journeyState(t: number, stops: [LatLng, LatLng, LatLng], narrow: boolean): JourneyState {
  const [b, s, d] = stops;
  const near = narrow ? 2.3 : 1.9;
  const far = narrow ? 3.2 : 2.6;
  const overview: LatLng = { lat: 16, lng: 78 };
  const overviewDist = narrow ? 4.2 : 3.1;
  const fade = (x: number) => clamp01(x * 8);

  const legs: [number, number] = [easeInOutCubic(seg(t, 0.24, 0.44)), easeInOutCubic(seg(t, 0.54, 0.74))];
  const lit: [number, number, number] = [fade(t - 0.08), fade(t - 0.43), fade(t - 0.73)];
  const all = fade(t - 0.88);
  const labels: [number, number, number] = [
    Math.max(Math.min(fade(t - 0.1), fade(0.3 - t)), all),
    Math.max(Math.min(fade(t - 0.42), fade(0.6 - t)), all),
    Math.max(fade(t - 0.72), all),
  ];

  const travel = (k: number, a0: number, a1: number) => {
    const u = easeInOutCubic(seg(t, a0, a1));
    return { u, dist: mix(near, far, Math.sin(Math.PI * u)) + (k === 0 ? 0 : 0) };
  };

  if (t < 0.14) {
    const u = easeInOutCubic(seg(t, 0, 0.14));
    return { from: WALLPAPER, to: b, along: u, dist: mix(WALLPAPER.dist, near, u), legs, lit, labels };
  }
  if (t < 0.24) return { from: b, to: b, along: 0, dist: near, legs, lit, labels };
  if (t < 0.44) {
    const { u, dist } = travel(0, 0.24, 0.44);
    return { from: b, to: s, along: u, dist, legs, lit, labels };
  }
  if (t < 0.54) return { from: s, to: s, along: 0, dist: near, legs, lit, labels };
  if (t < 0.74) {
    const { u, dist } = travel(1, 0.54, 0.74);
    return { from: s, to: d, along: u, dist, legs, lit, labels };
  }
  if (t < 0.84) return { from: d, to: d, along: 0, dist: near, legs, lit, labels };
  const u = easeInOutCubic(seg(t, 0.84, 1));
  return { from: d, to: overview, along: u, dist: mix(near, overviewDist, u), legs, lit, labels };
}
