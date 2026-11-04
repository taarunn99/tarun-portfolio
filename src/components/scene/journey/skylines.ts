/**
 * Original silhouette art for the three stations, as normalised polygons
 * (x, y in 0..1, y from the top). Shared by the SVG paintings (server) and the
 * diorama's canvas-painted layer (client), so both read as the same place.
 *
 * Each shape is either a filled polygon or a stroked ring. `tone` picks the
 * ink: "ink" (near-black) or "ink2" (same hue, lighter — water, far blocks).
 */
import type { StationId } from "./geometry";

export type Shape =
  | { kind: "poly"; tone: "ink" | "ink2"; points: [number, number][] }
  | { kind: "ring"; tone: "ink"; cx: number; cy: number; r: number; width: number };

export type Skyline = {
  /** Where the ground/water starts (0..1 from top) — the diorama uses it for the horizon */
  horizon: number;
  shapes: Shape[];
};

const bhopal: Skyline = {
  horizon: 0.72,
  shapes: [
    // far hills
    {
      kind: "poly",
      tone: "ink2",
      points: [
        [0, 0.64], [0.08, 0.56], [0.17, 0.6], [0.27, 0.5], [0.36, 0.55], [0.46, 0.47], [0.55, 0.53],
        [0.64, 0.49], [0.74, 0.56], [0.84, 0.51], [0.93, 0.58], [1, 0.55], [1, 0.74], [0, 0.74],
      ],
    },
    // near ridge with a few trees
    {
      kind: "poly",
      tone: "ink",
      points: [
        [0, 0.7], [0.1, 0.66], [0.14, 0.6], [0.16, 0.66], [0.3, 0.64], [0.33, 0.57], [0.35, 0.64],
        [0.5, 0.66], [0.62, 0.62], [0.65, 0.55], [0.67, 0.62], [0.8, 0.65], [0.9, 0.68], [1, 0.66], [1, 0.74], [0, 0.74],
      ],
    },
    // the lake
    { kind: "poly", tone: "ink2", points: [[0, 0.74], [1, 0.74], [1, 1], [0, 1]] },
    // a lone boat
    { kind: "poly", tone: "ink", points: [[0.56, 0.84], [0.64, 0.84], [0.63, 0.865], [0.57, 0.865]] },
    { kind: "poly", tone: "ink", points: [[0.597, 0.84], [0.603, 0.84], [0.603, 0.76], [0.597, 0.76]] },
  ],
};

const singapore: Skyline = {
  horizon: 0.86,
  shapes: [
    // distant blocks
    {
      kind: "poly",
      tone: "ink2",
      points: [
        [0, 0.72], [0.06, 0.72], [0.06, 0.64], [0.11, 0.64], [0.11, 0.7], [0.16, 0.7], [0.16, 0.6], [0.2, 0.6],
        [0.2, 0.74], [0.8, 0.74], [0.8, 0.62], [0.85, 0.62], [0.85, 0.68], [0.9, 0.68], [0.9, 0.58], [0.95, 0.58],
        [0.95, 0.7], [1, 0.7], [1, 0.88], [0, 0.88],
      ],
    },
    // three towers (slight inward lean)
    { kind: "poly", tone: "ink", points: [[0.24, 0.88], [0.26, 0.44], [0.36, 0.44], [0.36, 0.88]] },
    { kind: "poly", tone: "ink", points: [[0.45, 0.88], [0.45, 0.44], [0.55, 0.44], [0.55, 0.88]] },
    { kind: "poly", tone: "ink", points: [[0.64, 0.88], [0.64, 0.44], [0.74, 0.44], [0.76, 0.88]] },
    // the skypark slab, cantilevered to the left
    {
      kind: "poly",
      tone: "ink",
      points: [[0.14, 0.405], [0.2, 0.37], [0.8, 0.37], [0.82, 0.41], [0.76, 0.44], [0.24, 0.44], [0.19, 0.44]],
    },
    // ground / bay
    { kind: "poly", tone: "ink", points: [[0, 0.88], [1, 0.88], [1, 1], [0, 1]] },
  ],
};

const dubai: Skyline = {
  horizon: 0.84,
  shapes: [
    // low skyline band
    {
      kind: "poly",
      tone: "ink2",
      points: [
        [0, 0.78], [0.08, 0.78], [0.08, 0.7], [0.12, 0.7], [0.12, 0.76], [0.3, 0.76], [0.34, 0.66], [0.38, 0.66],
        [0.38, 0.74], [0.6, 0.74], [0.6, 0.68], [0.66, 0.68], [0.66, 0.78], [1, 0.78], [1, 0.86], [0, 0.86],
      ],
    },
    // the sail, on the left
    { kind: "poly", tone: "ink", points: [[0.14, 0.86], [0.14, 0.5], [0.2, 0.32], [0.3, 0.46], [0.3, 0.86]] },
    { kind: "poly", tone: "ink", points: [[0.17, 0.86], [0.17, 0.6], [0.19, 0.6], [0.19, 0.86]] },
    // the needle spire, tiered
    {
      kind: "poly",
      tone: "ink",
      points: [
        [0.44, 0.86], [0.44, 0.6], [0.46, 0.6], [0.46, 0.42], [0.48, 0.42], [0.48, 0.26], [0.495, 0.26], [0.495, 0.12],
        [0.5, 0.04], [0.505, 0.12], [0.505, 0.26], [0.52, 0.26], [0.52, 0.42], [0.54, 0.42], [0.54, 0.6], [0.56, 0.6], [0.56, 0.86],
      ],
    },
    // the wheel, on the right
    { kind: "ring", tone: "ink", cx: 0.8, cy: 0.62, r: 0.15, width: 0.012 },
    { kind: "poly", tone: "ink", points: [[0.72, 0.86], [0.795, 0.62], [0.805, 0.62], [0.88, 0.86]] },
    // sand
    { kind: "poly", tone: "ink", points: [[0, 0.86], [1, 0.86], [1, 1], [0, 1]] },
  ],
};

export const skylines: Record<StationId, Skyline> = { bhopal, singapore, dubai };

/** SVG `points` attribute for a polygon scaled to a box */
export function polygonPoints(points: [number, number][], w: number, h: number): string {
  return points.map(([x, y]) => `${(x * w).toFixed(1)},${(y * h).toFixed(1)}`).join(" ");
}
