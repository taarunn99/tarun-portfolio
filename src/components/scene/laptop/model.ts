import {
  BoxGeometry,
  type BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  TubeGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * An original, procedurally built laptop (no brand marks) that can come
 * apart into seven layers, like an exploded product shot:
 *
 *   top assembly (lid + keyboard deck) · cooling · logic board · speakers ·
 *   battery · hardware · bottom case
 *
 * Units are roughly centimetres. x = width, y = up, z = depth (+z faces the
 * viewer). Every part is a Group whose `y` the scene animates between its
 * assembled and exploded height. Internals sit inside the deck volume when
 * assembled, so the closed or open laptop looks solid.
 */

export const W = 31.2;
export const D = 22;
const CASE_H = 0.7;
const DECK_H = 0.9;
const LID_T = 0.55;
const LID_D = D - 0.4;

export type PartId = "top" | "cooling" | "board" | "speakers" | "battery" | "hardware" | "bottom";

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
  /** anchors for captions, in each part's local space */
  anchors: Record<string, { part: PartId; local: Vector3 }>;
  fanBlades: Object3D[];
  dispose: () => void;
};

export const LID_OPEN = -1.83; // about 105 degrees

/** The display panel, in lid-local space (x across, z from hinge to top edge). */
export const SCREEN_W = W - 1.6;
export const SCREEN_H = LID_D - 2.2;
export const SCREEN_CENTER = { x: 0, y: -0.008, z: LID_D / 2 - 0.1 } as const;
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

/** Engraved mark on the processor lid. */
function chipTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#8b9096";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, 228, 228);
    ctx.fillStyle = "rgba(20,22,26,0.85)";
    ctx.font = "700 96px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TS", 128, 120);
    ctx.font = "500 22px ui-monospace, Menlo, monospace";
    ctx.fillText("ENGINE", 128, 190);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
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
  const aluminium = mat(new MeshStandardMaterial({ color: "#45484e", metalness: 0.9, roughness: 0.38 }));
  const aluminiumDark = mat(new MeshStandardMaterial({ color: "#2b2d31", metalness: 0.85, roughness: 0.45 }));
  const black = mat(new MeshStandardMaterial({ color: "#0c0d0f", metalness: 0.2, roughness: 0.55 }));
  const keyMat = mat(new MeshStandardMaterial({ color: "#121316", metalness: 0.1, roughness: 0.6 }));
  const glass = mat(new MeshStandardMaterial({ color: "#4a4e55", metalness: 0.7, roughness: 0.22 }));
  const pcb = mat(new MeshStandardMaterial({ color: "#0e1714", metalness: 0.3, roughness: 0.5 }));
  const shield = mat(new MeshStandardMaterial({ color: "#a9aeb4", metalness: 1, roughness: 0.32 }));
  const copper = mat(new MeshStandardMaterial({ color: "#b8743f", metalness: 1, roughness: 0.32 }));
  const gold = mat(new MeshStandardMaterial({ color: "#c9a14a", metalness: 1, roughness: 0.35 }));
  const cell = mat(new MeshStandardMaterial({ color: "#26282c", metalness: 0.4, roughness: 0.62 }));
  const housing = mat(new MeshStandardMaterial({ color: "#2b2d31", metalness: 0.85, roughness: 0.45, side: DoubleSide }));
  const accent = mat(new MeshStandardMaterial({ color: new Color(palette.accent), emissive: new Color(palette.accent), emissiveIntensity: 0.6, roughness: 0.4 }));

  // the wallpaper: a live render target from the Earth scene when given,
  // otherwise static aurora art
  let screenTex: Texture | undefined = screenMap;
  if (!screenTex) {
    const art = screenTexture(palette);
    textures.push(art);
    screenTex = art;
  }
  const screen = mat(new MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  const chipTex = chipTexture();
  textures.push(chipTex);
  const chipLid = mat(new MeshStandardMaterial({ map: chipTex, metalness: 0.9, roughness: 0.35 }));

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

  // Exploded heights, top to bottom. Assembled, every internal sits inside
  // the deck/case volume (y 0 to CASE_H + DECK_H).
  // --- bottom case ----------------------------------------------------------
  const bottom = part("bottom", 0, -10);
  bottom.add(mesh(new RoundedBoxGeometry(W, CASE_H, D, 4, 0.34), aluminium, 0, CASE_H / 2, 0));
  // inner tray floor, so the open case reads as a tray from above
  bottom.add(mesh(new BoxGeometry(W - 1.4, 0.02, D - 1.4), aluminiumDark, 0, CASE_H + 0.011, 0));
  for (const [x, z] of [
    [-W / 2 + 2.2, -D / 2 + 2.2],
    [W / 2 - 2.2, -D / 2 + 2.2],
    [-W / 2 + 2.2, D / 2 - 2.2],
    [W / 2 - 2.2, D / 2 - 2.2],
  ] as const) {
    bottom.add(mesh(new CylinderGeometry(0.8, 0.8, 0.12, 24), black, x, -0.06, z));
  }

  // --- hardware: screws, brackets, port -------------------------------------
  const hardware = part("hardware", CASE_H + 0.1, -4);
  {
    const screwGeo = track(new CylinderGeometry(0.17, 0.17, 0.9, 10));
    const screws = new InstancedMesh(screwGeo, shield, 10);
    const m4 = new Matrix4();
    const xs = [-12.8, -12.1, -11.4, -6.5, -2.2, 2.2, 6.5, 11.4, 12.1, 12.8];
    xs.forEach((x, i) => {
      m4.makeTranslation(x, 0.45, 2);
      screws.setMatrixAt(i, m4);
    });
    hardware.add(screws);
    for (const x of [-8.4, 8.4]) hardware.add(mesh(new BoxGeometry(1.4, 0.18, 0.8), aluminiumDark, x, 0.1, 2));
    hardware.add(mesh(new BoxGeometry(3.2, 0.4, 0.9), black, 0, 0.2, 2));
    hardware.add(mesh(new BoxGeometry(2.6, 0.12, 0.5), gold, 0, 0.42, 2));
  }

  // --- battery ---------------------------------------------------------------
  const battery = part("battery", CASE_H + 0.05, 1.5);
  for (const x of [-11.3, -3.8, 3.8, 11.3]) {
    battery.add(mesh(new RoundedBoxGeometry(7, 0.6, 9.4, 2, 0.12), cell, x, 0.3, 4.6));
    battery.add(mesh(new BoxGeometry(5.8, 0.02, 0.4), gold, x, 0.61, 0.2));
  }
  battery.add(mesh(new BoxGeometry(1.6, 0.35, 9.4), aluminiumDark, 0, 0.17, 4.6));

  // --- speakers ---------------------------------------------------------------
  const speakers = part("speakers", CASE_H + 0.05, 8.5);
  for (const sx of [-1, 1]) {
    const x = sx * 12.6;
    speakers.add(mesh(new RoundedBoxGeometry(4.2, 0.9, 3, 2, 0.2), black, x, 0.45, -1.8));
    const driver = mesh(new CircleGeometry(0.95, 32), glass, x, 0.91, -1.8);
    driver.rotation.x = -Math.PI / 2;
    speakers.add(driver);
    speakers.add(mesh(new BoxGeometry(3.6, 0.06, 0.5), black, x - sx * 4, 0.1, -1.8));
    speakers.add(mesh(new BoxGeometry(0.9, 0.25, 0.7), gold, x - sx * 6.2, 0.15, -1.8));
  }

  // --- logic board -----------------------------------------------------------
  const board = part("board", CASE_H + 0.15, 15);
  {
    const bw = 22;
    const bd = 7.6;
    const bz = -6.3;
    board.add(mesh(new BoxGeometry(bw, 0.18, bd), pcb, 0, 0.09, bz));
    // processor with the TS mark, and its accent ring
    board.add(mesh(new BoxGeometry(4, 0.12, 4), black, 0, 0.24, bz));
    board.add(mesh(new BoxGeometry(3.4, 0.16, 3.4), chipLid, 0, 0.38, bz));
    board.add(mesh(new BoxGeometry(4.15, 0.02, 4.15), accent, 0, 0.19, bz));
    // memory
    for (const x of [3.1, 4.9]) {
      for (const dz of [-1, 1]) board.add(mesh(new BoxGeometry(1.5, 0.2, 1.8), black, x, 0.28, bz + dz));
    }
    // RF shields
    for (const x of [-8.2, 8.6]) board.add(mesh(new BoxGeometry(3.8, 0.24, 4.8), shield, x, 0.3, bz));
    // small components, two colours, deterministic
    const rand = rng(0xb0a7d);
    const smallGeo = track(new BoxGeometry(0.42, 0.14, 0.3));
    const dark = new InstancedMesh(smallGeo, black, 70);
    const bright = new InstancedMesh(smallGeo, gold, 26);
    const m4 = new Matrix4();
    let di = 0;
    let bi = 0;
    while (di < 70 || bi < 26) {
      const x = (rand() - 0.5) * (bw - 1.4);
      const z = bz + (rand() - 0.5) * (bd - 1);
      // keep the chip, memory and shields clear
      if (Math.abs(x) < 2.4 && Math.abs(z - bz) < 2.4) continue;
      if (x > 2.2 && x < 5.8) continue;
      if (Math.abs(x + 8.2) < 2.1 || Math.abs(x - 8.6) < 2.1) continue;
      m4.makeRotationY(rand() > 0.5 ? 0 : Math.PI / 2).setPosition(x, 0.25, z);
      if (rand() > 0.25 && di < 70) dark.setMatrixAt(di++, m4);
      else if (bi < 26) bright.setMatrixAt(bi++, m4);
    }
    board.add(dark, bright);
  }

  // --- cooling: two fans and a copper heat pipe ----------------------------
  const cooling = part("cooling", CASE_H + 0.2, 21.5);
  const fanBlades: Object3D[] = [];
  {
    const fz = -6.6;
    const bladeGeo = track(new BoxGeometry(1.75, 0.06, 0.5));
    for (const sx of [-1, 1]) {
      const x = sx * 11.3;
      cooling.add(mesh(new CylinderGeometry(3.05, 3.05, 0.7, 48, 1, true), housing, x, 0.35, fz));
      cooling.add(mesh(new CylinderGeometry(3.05, 3.05, 0.05, 48), black, x, 0.03, fz));
      const rotor = new Group();
      rotor.position.set(x, 0.4, fz);
      rotor.add(mesh(new CylinderGeometry(1.05, 1.05, 0.45, 32), black));
      const blades = new InstancedMesh(bladeGeo, black, 15);
      const m4 = new Matrix4();
      const tilt = new Matrix4();
      for (let i = 0; i < 15; i++) {
        const a = (i / 15) * Math.PI * 2;
        m4.makeRotationY(-a);
        tilt.makeRotationX(0.45);
        m4.multiply(new Matrix4().makeTranslation(1.95, 0, 0)).multiply(tilt);
        blades.setMatrixAt(i, m4);
      }
      rotor.add(blades);
      cooling.add(rotor);
      fanBlades.push(rotor);
    }
    const curve = new CatmullRomCurve3([
      new Vector3(-9.2, 0.35, fz + 0.3),
      new Vector3(-4.5, 0.35, fz + 1.6),
      new Vector3(0, 0.35, fz + 0.4),
      new Vector3(4.5, 0.35, fz + 1.6),
      new Vector3(9.2, 0.35, fz + 0.3),
    ]);
    cooling.add(mesh(new TubeGeometry(curve, 80, 0.32, 12, false), copper));
    cooling.add(mesh(new BoxGeometry(4.4, 0.18, 4.4), copper, 0, 0.1, fz + 0.4));
  }

  // --- top assembly: keyboard deck + lid -----------------------------------
  const top = part("top", CASE_H, 30);
  {
    top.add(mesh(new RoundedBoxGeometry(W, DECK_H, D, 4, 0.4), aluminium, 0, DECK_H / 2, 0));
    const deckTop = DECK_H + 0.002;
    // keyboard well and keys
    top.add(mesh(new BoxGeometry(27.2, 0.02, 11.6), black, 0, deckTop, -3.1));
    const keyGeo = track(new RoundedBoxGeometry(1, 0.16, 1, 2, 0.12));
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
        m4.makeScale(w, 1, depth).setPosition(x + w / 2, deckTop + 0.08, z);
        keys.setMatrixAt(k++, m4);
        x += w + gap;
      }
    });
    top.add(keys);
    // trackpad
    top.add(mesh(new RoundedBoxGeometry(13, 0.04, 7.8, 2, 0.02), glass, 0, deckTop, 6.4));
    // hinges
    for (const x of [-11.6, 11.6]) {
      const hinge = mesh(new CylinderGeometry(0.42, 0.42, 3.2, 20), aluminiumDark, x, DECK_H + 0.1, -D / 2 + 0.25);
      hinge.rotation.z = Math.PI / 2;
      top.add(hinge);
    }
  }

  const lid = new Group();
  lid.position.set(0, DECK_H + 0.05, -D / 2 + 0.2);
  top.add(lid);
  {
    lid.add(mesh(new RoundedBoxGeometry(W, LID_T, LID_D, 4, 0.27), aluminium, 0, LID_T / 2, LID_D / 2));
    // bezel and screen on the inner face (local -y), facing the keys when closed
    const bezel = mesh(new PlaneGeometry(W - 0.6, LID_D - 0.6), black, 0, -0.004, LID_D / 2);
    bezel.rotation.x = Math.PI / 2;
    lid.add(bezel);
    const panel = mesh(new PlaneGeometry(SCREEN_W, SCREEN_H), screen, SCREEN_CENTER.x, SCREEN_CENTER.y, SCREEN_CENTER.z);
    panel.rotation.x = Math.PI / 2;
    lid.add(panel);
  }

  const anchors: Laptop["anchors"] = {
    display: { part: "top", local: new Vector3(0, DECK_H + LID_D * 0.55, -D / 2) },
    keyboard: { part: "top", local: new Vector3(W / 2, DECK_H, 0) },
    board: { part: "board", local: new Vector3(-11, 0.2, -6.3) },
    speakers: { part: "speakers", local: new Vector3(14.7, 0.4, -1.8) },
    battery: { part: "battery", local: new Vector3(-14.8, 0.3, 4.6) },
    bottom: { part: "bottom", local: new Vector3(W / 2, CASE_H / 2, 0) },
  };

  return {
    root,
    parts,
    lid,
    anchors,
    fanBlades,
    dispose: () => {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
    },
  };
}
