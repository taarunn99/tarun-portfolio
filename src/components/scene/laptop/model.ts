import {
  BoxGeometry,
  type BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * An original, procedurally built laptop (no brand marks): bottom case and
 * top assembly (keyboard deck + hinged lid with the display). It stays in one
 * piece; what comes apart in the hero is the website on its screen
 * (see layers.ts).
 *
 * Units are roughly centimetres. x = width, y = up, z = depth (+z faces the
 * viewer). Every part is a Group whose `y` the scene animates between its
 * assembled and exploded height. Internals sit inside the deck volume when
 * assembled, so the closed or open laptop looks solid.
 */

export const W = 31.2;
export const D = 22;
/** one thin body (no separate case slab, so no seam) and a thin lid */
const DECK_H = 0.82;
const LID_T = 0.26;
const LID_D = D - 0.4;
/** deck top, for framing in the scene */
export const DECK_TOP = DECK_H;

export type PartId = "top" | "bottom";

export type Part = {
  id: PartId;
  object: Group;
  /** y when assembled and when fully exploded */
  assembled: number;
  exploded: number;
};

export type Laptop = {
  root: Group;
  parts: Part[];
  /** hinge pivot: rotate around x; 0 = closed, LID_OPEN = open */
  lid: Group;
  dispose: () => void;
};

export const LID_OPEN = -1.83; // about 105 degrees

/** The display panel, in lid-local space (x across, z from hinge to top edge). */
export const SCREEN_W = W - 0.9;
export const SCREEN_H = LID_D - 1.15;
export const SCREEN_CENTER = { x: 0, y: -0.008, z: LID_D / 2 + 0.06 } as const;
export const SCREEN_ASPECT = SCREEN_W / SCREEN_H;

/** Deterministic PRNG so the board layout is identical on every load. */
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

type Palette = { accent: string; glow: string; deep: string; ice: string; night: string };

/** Screen art: aurora light curtains in the site palette, drawn once. */
function screenTexture(p: Palette): CanvasTexture {
  const cw = 1024;
  const ch = 680;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const bg = ctx.createLinearGradient(0, 0, 0, ch);
    bg.addColorStop(0, "#02060a");
    bg.addColorStop(1, p.night);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    const rand = rng(0x7a11);
    const colours = [p.accent, p.glow, p.ice, p.deep];
    ctx.globalCompositeOperation = "lighter";
    // three soft curtains of thin vertical streaks
    for (const [cx, spread, top] of [
      [0.24, 0.16, 0.08],
      [0.56, 0.2, 0.22],
      [0.84, 0.13, 0.04],
    ] as const) {
      for (let i = 0; i < 150; i++) {
        const x = (cx + (rand() - 0.5) * spread * 2) * cw;
        const y0 = (top + rand() * 0.18) * ch;
        const y1 = y0 + (0.35 + rand() * 0.5) * ch;
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        const c = colours[Math.floor(rand() * colours.length)] ?? p.accent;
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.35, c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = 0.05 + rand() * 0.18;
        ctx.fillStyle = g;
        ctx.fillRect(x, y0, 1 + rand() * 3, y1 - y0);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    // the site's mark, small, bottom left
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 34px ui-monospace, Menlo, monospace";
    ctx.fillText("TS", 44, ch - 44);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function buildLaptop(palette: Palette, screenMap?: Texture): Laptop {
  const geometries: Array<{ dispose: () => void }> = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const track = <T extends { dispose: () => void }>(x: T): T => {
    geometries.push(x);
    return x;
  };
  const mat = <T extends Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  // --- materials -----------------------------------------------------------
  // space black anodised aluminium: dark faces, light only on the rounded edges
  const aluminium = mat(new MeshStandardMaterial({ color: "#1b1e22", metalness: 1, roughness: 0.3 }));
  const aluminiumDark = mat(new MeshStandardMaterial({ color: "#1c1e22", metalness: 0.9, roughness: 0.4 }));
  const black = mat(new MeshStandardMaterial({ color: "#07080a", metalness: 0.3, roughness: 0.5 }));
  const keyMat = mat(new MeshStandardMaterial({ color: "#0d0e11", metalness: 0.2, roughness: 0.55 }));
  const glass = mat(new MeshPhysicalMaterial({ color: "#121418", metalness: 0.6, roughness: 0.12, clearcoat: 0.3, clearcoatRoughness: 0.2 }));

  // the wallpaper: a live render target from the Earth scene when given,
  // otherwise static aurora art
  let screenTex: Texture | undefined = screenMap;
  if (!screenTex) {
    const art = screenTexture(palette);
    textures.push(art);
    screenTex = art;
  }
  const screen = mat(new MeshBasicMaterial({ map: screenTex, toneMapped: false }));

  const root = new Group();
  const parts: Part[] = [];
  const part = (id: PartId, assembled: number, exploded: number) => {
    const object = new Group();
    object.name = id;
    object.position.y = assembled;
    root.add(object);
    parts.push({ id, object, assembled, exploded });
    return object;
  };

  const mesh = (geometry: BufferGeometry, material: Material, x = 0, y = 0, z = 0) => {
    const m = new Mesh(track(geometry), material);
    m.position.set(x, y, z);
    return m;
  };

  // --- underside: four low feet only ---------------------------------------
  const bottom = part("bottom", 0, 0);
  for (const [x, z] of [
    [-W / 2 + 2.4, -D / 2 + 2.4],
    [W / 2 - 2.4, -D / 2 + 2.4],
    [-W / 2 + 2.4, D / 2 - 2.4],
    [W / 2 - 2.4, D / 2 - 2.4],
  ] as const) {
    bottom.add(mesh(new CylinderGeometry(0.55, 0.55, 0.05, 24), black, x, -0.02, z));
  }

  // --- top assembly: keyboard deck + lid -----------------------------------
  const top = part("top", 0, 0);
  {
    // one body, edges fully rounded (radius is half the thickness)
    top.add(mesh(new RoundedBoxGeometry(W, DECK_H, D, 6, DECK_H / 2 - 0.01), aluminium, 0, DECK_H / 2, 0));
    const deckTop = DECK_H + 0.002;
    // keyboard well, speaker grilles either side, low-profile keys
    top.add(mesh(new BoxGeometry(26.6, 0.012, 11.2), black, 0, deckTop, -3.1));
    for (const x of [-14.25, 14.25]) top.add(mesh(new BoxGeometry(1.1, 0.01, 10.6), aluminiumDark, x, deckTop, -3.1));
    const keyGeo = track(new RoundedBoxGeometry(1, 0.07, 1, 2, 0.03));
    const rows: number[][] = [
      Array<number>(14).fill(1.55).map((w, i) => (i === 0 || i === 13 ? 1.55 : w)),
      [1.55, ...Array<number>(12).fill(1.55), 2.4],
      [2.4, ...Array<number>(12).fill(1.55), 1.55],
      [2.9, ...Array<number>(11).fill(1.55), 3.05],
      [3.8, ...Array<number>(10).fill(1.55), 3.95],
      [1.55, 1.55, 1.55, 2.0, 9.4, 2.0, 1.55, 1.55, 1.55],
    ];
    const keyCount = rows.reduce((n, r) => n + r.length, 0);
    const keys = new InstancedMesh(keyGeo, keyMat, keyCount);
    const m4 = new Matrix4();
    let k = 0;
    const gap = 0.24;
    rows.forEach((row, ri) => {
      const total = row.reduce((s, w) => s + w, 0) + gap * (row.length - 1);
      let x = -total / 2;
      const depth = ri === 0 ? 0.9 : 1.55;
      const z = -8.1 + ri * 1.8 + (ri === 0 ? 0.3 : 0);
      for (const w of row) {
        m4.makeScale(w, 1, depth).setPosition(x + w / 2, deckTop + 0.035, z);
        keys.setMatrixAt(k++, m4);
        x += w + gap;
      }
    });
    top.add(keys);
    // trackpad
    top.add(mesh(new RoundedBoxGeometry(14.5, 0.02, 8.6, 2, 0.01), glass, 0, deckTop, 6.3));
    // one long, slim hinge barrel
    const hinge = mesh(new CylinderGeometry(0.3, 0.3, W - 7, 24), aluminiumDark, 0, DECK_H + 0.02, -D / 2 + 0.28);
    hinge.rotation.z = Math.PI / 2;
    top.add(hinge);
  }

  const lid = new Group();
  lid.position.set(0, DECK_H + 0.02, -D / 2 + 0.2);
  top.add(lid);
  {
    lid.add(mesh(new RoundedBoxGeometry(W, LID_T, LID_D, 4, LID_T / 2 - 0.01), aluminium, 0, LID_T / 2, LID_D / 2));
    // edge-to-edge glass with slim bezels on the inner face (local -y)
    const bezel = mesh(new PlaneGeometry(W - 0.3, LID_D - 0.3), black, 0, -0.004, LID_D / 2);
    bezel.rotation.x = Math.PI / 2;
    lid.add(bezel);
    const panel = mesh(new PlaneGeometry(SCREEN_W, SCREEN_H), screen, SCREEN_CENTER.x, SCREEN_CENTER.y, SCREEN_CENTER.z);
    panel.rotation.x = Math.PI / 2;
    lid.add(panel);
  }


  return {
    root,
    parts,
    lid,
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
