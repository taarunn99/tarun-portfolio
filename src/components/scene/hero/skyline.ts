import {
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  PlaneGeometry,
  Shape,
  TorusGeometry,
} from "three";

/**
 * A minimal, procedural Dubai skyline — every shape is built from three.js
 * primitives in group-local space (horizon at y = 0, Burj Khalifa at x = 0).
 * The hero samples points on these surfaces and draws their edges as a
 * sparse wireframe; nothing here is a model file.
 */

export type SkylinePart = {
  geometry: BufferGeometry;
  /** Threshold angle for `EdgesGeometry`; `null` draws no wireframe for the part. */
  edgeAngle: number | null;
};

export type SkylineGroup = {
  parts: SkylinePart[];
  /** Fraction of the total point budget this group receives. */
  share: number;
  /** Per-point sprite scale range. */
  scale: [number, number];
};

export type PointCloud = {
  position: Float32Array;
  noise: Float32Array;
  scale: Float32Array;
  phase: Float32Array;
  tint: Float32Array;
};

/** Overall footprint in group-local units, used to fit the composition. */
export const SKYLINE_WIDTH = 5.5;
export const SKYLINE_HEIGHT = 2.3;

const TAU = Math.PI * 2;

/** Deterministic PRNG so the composition is identical on every visit. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function part(geometry: BufferGeometry, edgeAngle: number | null = 1): SkylinePart {
  return { geometry, edgeAngle };
}

// --- Burj Khalifa ----------------------------------------------------------
// Y-shaped plan: a hexagonal core with three lobes that step back as they
// rise, topped by a tapering crown and a needle spire.
function burjKhalifa(): SkylinePart[] {
  const parts: SkylinePart[] = [];
  const tierHeight = 0.24;

  const core = new CylinderGeometry(0.055, 0.08, 1.86, 6);
  core.translate(0, 0.93, 0);
  parts.push(part(core));

  const tiersPerLobe = [7, 6, 5];
  tiersPerLobe.forEach((tiers, lobe) => {
    const angle = Math.PI / 2 + (lobe * TAU) / 3;
    for (let i = 0; i < tiers; i++) {
      const rBottom = 0.165 - i * 0.017;
      const rTop = rBottom - 0.01;
      const distance = 0.135 - i * 0.011;
      const tier = new CylinderGeometry(rTop, rBottom, tierHeight, 6);
      tier.translate(Math.cos(angle) * distance, i * tierHeight + tierHeight / 2, Math.sin(angle) * distance);
      parts.push(part(tier));
    }
  });

  const crown = new CylinderGeometry(0.028, 0.055, 0.16, 6);
  crown.translate(0, 1.86 + 0.08, 0);
  parts.push(part(crown));

  const spire = new CylinderGeometry(0.004, 0.016, 0.36, 6);
  spire.translate(0, 2.02 + 0.18, 0);
  parts.push(part(spire));

  return parts;
}

// --- Burj Al Arab ---------------------------------------------------------
// A sail: vertical mast on the inner side, a convex curve bulging outward,
// an X-brace across the façade, helipad near the top.
function burjAlArab(x: number, z: number): SkylinePart[] {
  const parts: SkylinePart[] = [];
  const height = 0.92;
  const width = 0.52;
  const depth = 0.06;

  const sail = new Shape();
  sail.moveTo(0, 0);
  sail.lineTo(0, height);
  sail.quadraticCurveTo(-width * 1.02, height * 0.72, -width, 0);
  sail.lineTo(0, 0);

  const body = new ExtrudeGeometry(sail, { depth, bevelEnabled: false, curveSegments: 20 });
  body.translate(x, 0, z - depth / 2);
  parts.push(part(body, 8));

  const mast = new BoxGeometry(0.018, 0.2, 0.018);
  mast.translate(x, height + 0.1, z);
  parts.push(part(mast));

  const helipad = new CircleGeometry(0.075, 14);
  helipad.rotateX(-Math.PI / 2);
  helipad.translate(x + 0.085, height * 0.8, z);
  parts.push(part(helipad, 30));

  const braceLength = height * 0.62;
  for (const sign of [1, -1]) {
    const brace = new BoxGeometry(0.012, braceLength, 0.012);
    brace.rotateZ(sign * 0.62);
    brace.translate(x - width * 0.36, height * 0.42, z + depth / 2 + 0.006);
    parts.push(part(brace));
  }

  return parts;
}

// --- Museum of the Future -----------------------------------------------
// A torus facing the viewer on a low podium. The high edge threshold keeps
// only the longitudinal rings in the wireframe so it reads as one hoop.
function museumOfTheFuture(x: number, z: number): SkylinePart[] {
  const ring = new TorusGeometry(0.34, 0.125, 8, 36);
  ring.translate(x, 0.48, z);

  const podium = new BoxGeometry(0.95, 0.09, 0.5);
  podium.translate(x, 0.045, z);

  return [part(ring, 20), part(podium)];
}

// --- Towers --------------------------------------------------------------
type Tower = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  kind?: "box" | "tri" | "twist";
};

const TOWERS: Tower[] = [
  { x: -2.65, z: -0.35, w: 0.14, d: 0.14, h: 0.42 },
  { x: -2.38, z: 0.1, w: 0.11, d: 0.11, h: 0.58 },
  { x: -1.3, z: -0.3, w: 0.2, d: 0.2, h: 0.95, kind: "tri" },
  { x: -1.02, z: 0.05, w: 0.17, d: 0.17, h: 0.78, kind: "tri" },
  { x: -0.68, z: -0.45, w: 0.1, d: 0.12, h: 0.52 },
  { x: -0.44, z: 0.3, w: 0.13, d: 0.13, h: 1.12 },
  { x: 0.42, z: -0.4, w: 0.15, d: 0.15, h: 0.84 },
  { x: 0.66, z: 0.22, w: 0.1, d: 0.1, h: 0.56 },
  { x: 0.96, z: -0.15, w: 0.12, d: 0.12, h: 0.66 },
  { x: 2.08, z: -0.3, w: 0.15, d: 0.15, h: 1.3, kind: "twist" },
  { x: 2.32, z: 0.15, w: 0.11, d: 0.11, h: 0.82 },
  { x: 2.52, z: -0.4, w: 0.13, d: 0.13, h: 0.6 },
  { x: 2.74, z: 0.05, w: 0.1, d: 0.1, h: 0.44 },
];

function twistedBox(w: number, h: number, d: number): BufferGeometry {
  const geometry = new BoxGeometry(w, h, d, 1, 24, 1);
  const pos = geometry.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = (y / h + 0.5) * (Math.PI / 2);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    pos.setXYZ(i, x * c - z * s, y, x * s + z * c);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function towers(): SkylinePart[] {
  return TOWERS.map((t) => {
    let geometry: BufferGeometry;
    let edgeAngle = 1;
    if (t.kind === "tri") {
      geometry = new CylinderGeometry(t.w * 0.7, t.w * 0.7, t.h, 3);
    } else if (t.kind === "twist") {
      geometry = twistedBox(t.w, t.h, t.d);
      edgeAngle = 12;
    } else {
      geometry = new BoxGeometry(t.w, t.h, t.d);
    }
    geometry.translate(t.x, t.h / 2, t.z);
    return part(geometry, edgeAngle);
  });
}

// --- Ground ---------------------------------------------------------------
function ground(): SkylinePart[] {
  const plane = new PlaneGeometry(SKYLINE_WIDTH + 1.2, 1.5, 1, 1);
  plane.rotateX(-Math.PI / 2);
  plane.translate(0, 0, -0.2);
  return [part(plane, 1)];
}

export function buildSkyline(): SkylineGroup[] {
  return [
    { parts: burjKhalifa(), share: 0.26, scale: [0.55, 1.2] },
    { parts: burjAlArab(-1.95, 0.15), share: 0.12, scale: [0.55, 1.15] },
    { parts: museumOfTheFuture(1.45, 0.1), share: 0.12, scale: [0.55, 1.15] },
    { parts: towers(), share: 0.36, scale: [0.5, 1.05] },
    { parts: ground(), share: 0.14, scale: [0.3, 0.65] },
  ];
}

/** Concatenates every part's `EdgesGeometry` into one line-segment geometry. */
export function buildEdges(groups: SkylineGroup[]): BufferGeometry {
  const chunks: ArrayLike<number>[] = [];
  let length = 0;
  for (const group of groups) {
    for (const { geometry, edgeAngle } of group.parts) {
      if (edgeAngle === null) continue;
      const edges = new EdgesGeometry(geometry, edgeAngle);
      const array = edges.getAttribute("position").array;
      chunks.push(array);
      length += array.length;
      edges.dispose();
    }
  }
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  const result = new BufferGeometry();
  result.setAttribute("position", new Float32BufferAttribute(merged, 3));
  return result;
}

/**
 * Area-weighted surface sampling over a list of geometries: every triangle
 * is picked with probability proportional to its area, then a uniform
 * barycentric point is taken inside it.
 */
function sampleParts(parts: SkylinePart[], count: number, rand: () => number, out: Float32Array, offset: number): void {
  const tris: number[] = [];
  const cumulative: number[] = [];
  let total = 0;

  for (const { geometry } of parts) {
    const pos = geometry.getAttribute("position");
    const index = geometry.getIndex();
    const n = index ? index.count : pos.count;
    for (let i = 0; i + 2 < n; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      const ax = pos.getX(ia), ay = pos.getY(ia), az = pos.getZ(ia);
      const bx = pos.getX(ib), by = pos.getY(ib), bz = pos.getZ(ib);
      const cx = pos.getX(ic), cy = pos.getY(ic), cz = pos.getZ(ic);
      const ux = bx - ax, uy = by - ay, uz = bz - az;
      const vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      const area = Math.sqrt(nx * nx + ny * ny + nz * nz) * 0.5;
      if (area <= 0) continue;
      total += area;
      cumulative.push(total);
      tris.push(ax, ay, az, bx, by, bz, cx, cy, cz);
    }
  }

  if (total === 0) return;

  for (let s = 0; s < count; s++) {
    const r = rand() * total;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    const t = lo * 9;
    let u = rand();
    let v = rand();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;
    const o = (offset + s) * 3;
    out[o] = w * tris[t] + u * tris[t + 3] + v * tris[t + 6];
    out[o + 1] = w * tris[t + 1] + u * tris[t + 4] + v * tris[t + 7];
    out[o + 2] = w * tris[t + 2] + u * tris[t + 5] + v * tris[t + 8];
  }
}

/**
 * Samples `count` points across the skyline groups (by share) and pairs each
 * with a scattered "noise" origin, a sprite scale, a phase and a tint flag
 * (~15 % of points use the foreground colour).
 */
export function samplePoints(groups: SkylineGroup[], count: number, rand: () => number): PointCloud {
  const position = new Float32Array(count * 3);
  const noise = new Float32Array(count * 3);
  const scale = new Float32Array(count);
  const phase = new Float32Array(count);
  const tint = new Float32Array(count);

  let offset = 0;
  groups.forEach((group, gi) => {
    const n = gi === groups.length - 1 ? count - offset : Math.round(group.share * count);
    sampleParts(group.parts, n, rand, position, offset);
    for (let i = offset; i < offset + n; i++) {
      scale[i] = group.scale[0] + rand() * (group.scale[1] - group.scale[0]);
    }
    offset += n;
  });

  for (let i = 0; i < count; i++) {
    const theta = rand() * TAU;
    const cosPhi = rand() * 2 - 1;
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
    const r = 1.4 + Math.sqrt(rand()) * 2.6;
    noise[i * 3] = r * sinPhi * Math.cos(theta);
    noise[i * 3 + 1] = 0.9 + r * sinPhi * Math.sin(theta) * 0.8;
    noise[i * 3 + 2] = -0.4 + r * cosPhi * 0.6;
    phase[i] = rand() * TAU;
    tint[i] = rand() < 0.15 ? 1 : 0;
  }

  return { position, noise, scale, phase, tint };
}

export function disposeSkyline(groups: SkylineGroup[]): void {
  for (const group of groups) {
    for (const { geometry } of group.parts) geometry.dispose();
  }
}
