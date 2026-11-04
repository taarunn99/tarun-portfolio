/**
 * Route geometry for the journey section. Pure data: imported by the server
 * component (to render the SVG) and by the client timeline (to measure it).
 *
 * Two layouts share the same vocabulary: "h" (stations left → right, desktop)
 * and "v" (stations top → bottom, phones). Both are rendered server-side and
 * CSS decides which one is visible, so the HTML never depends on the viewport.
 */
export type Orient = "h" | "v";
export type StationId = "bhopal" | "singapore" | "dubai";

export type Rect = { x: number; y: number; w: number; h: number };

export type StationGeometry = {
  id: StationId;
  /** Station dot, in viewBox units */
  x: number;
  y: number;
  /** Framed painting, in viewBox units */
  painting: Rect;
  /** Offset from the dot to the point the camera settles on while dwelling */
  focus: { dx: number; dy: number };
  /** Where the coordinate caption sits relative to the dot */
  caption: { dx: number; dy: number; anchor: "start" | "middle" | "end" };
};

export type RouteGeometry = {
  orient: Orient;
  viewBox: { w: number; h: number };
  stations: StationGeometry[];
  /** The full route — one `d` used for the base route, the progress stroke and the motion path */
  d: string;
  /** Faint horizon lines (y values for "h", x values for "v") */
  grid: number[];
};

export const STATION_ORDER: StationId[] = ["bhopal", "singapore", "dubai"];

const horizontal: RouteGeometry = {
  orient: "h",
  viewBox: { w: 1200, h: 480 },
  stations: [
    {
      id: "bhopal",
      x: 150,
      y: 300,
      painting: { x: 30, y: 108, w: 240, h: 160 },
      focus: { dx: 0, dy: -70 },
      caption: { dx: 0, dy: 26, anchor: "middle" },
    },
    {
      id: "singapore",
      x: 600,
      y: 362,
      painting: { x: 480, y: 170, w: 240, h: 160 },
      focus: { dx: 0, dy: -70 },
      caption: { dx: 0, dy: 26, anchor: "middle" },
    },
    {
      id: "dubai",
      x: 1050,
      y: 250,
      painting: { x: 930, y: 58, w: 240, h: 160 },
      focus: { dx: 0, dy: -70 },
      caption: { dx: 0, dy: 26, anchor: "middle" },
    },
  ],
  d: "M150,300 C 290,160 470,180 600,362 C 660,230 900,90 1050,250",
  grid: [120, 240, 360],
};

const vertical: RouteGeometry = {
  orient: "v",
  viewBox: { w: 390, h: 820 },
  stations: [
    {
      id: "bhopal",
      x: 96,
      y: 120,
      painting: { x: 150, y: 56, w: 192, h: 128 },
      focus: { dx: 92, dy: 0 },
      caption: { dx: 0, dy: 34, anchor: "middle" },
    },
    {
      id: "singapore",
      x: 294,
      y: 410,
      painting: { x: 48, y: 346, w: 192, h: 128 },
      focus: { dx: -92, dy: 0 },
      caption: { dx: 0, dy: 34, anchor: "middle" },
    },
    {
      id: "dubai",
      x: 96,
      y: 700,
      painting: { x: 150, y: 636, w: 192, h: 128 },
      focus: { dx: 92, dy: 0 },
      caption: { dx: 0, dy: 34, anchor: "middle" },
    },
  ],
  d: "M96,120 C 40,260 340,250 294,410 C 250,560 20,560 96,700",
  grid: [98, 195, 292],
};

export const geometries: Record<Orient, RouteGeometry> = { h: horizontal, v: vertical };

/** Painting rect as percentages of the world box (for absolutely positioned HTML) */
export function pct(rect: Rect, vb: { w: number; h: number }): { left: string; top: string; width: string; height: string } {
  return {
    left: `${(rect.x / vb.w) * 100}%`,
    top: `${(rect.y / vb.h) * 100}%`,
    width: `${(rect.w / vb.w) * 100}%`,
    height: `${(rect.h / vb.h) * 100}%`,
  };
}

/** `23.26° N · 77.41° E` — mono caption under each station */
export function formatCoords(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lng).toFixed(2)}° ${ew}`;
}

/**
 * The small wanderer silhouette that rides the marker (viewBox-relative path,
 * drawn standing on the origin, ~22 units tall, facing right).
 */
export const WANDERER_PATH =
  "M0,-21 a3,3 0 1,1 0.01,0 Z M-2.6,-15.5 h5 l2.4,4.6 2.2,-1 .9,1.4 -3.2,2.1 -1.2,-2.2 .2,5.2 2.8,6.4 -1.9,.9 -2.9,-5.6 -1.5,5.6 -2,-.4 1.1,-7.8 -.3,-4.6 -1.6,2.9 -1.8,-1 2.6,-5.2 Z";
