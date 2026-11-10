import {
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import { SCREEN_H, SCREEN_W } from "./model";

/**
 * The website that comes out of the laptop screen, as six glass layers,
 * top of the stack first. Each is a plane with art drawn once on a 2D canvas
 * (no numbers, no claims: the captions beside them carry the words).
 *
 *   interface · brand · growth · automation · data · infrastructure
 */

export const LAYER_IDS = ["web", "brand", "growth", "ai", "erp", "ops"] as const;
export type LayerId = (typeof LAYER_IDS)[number];

type Palette = { accent: string; glow: string; deep: string; ice: string; night: string; midnight: string; carbon: string };

const CW = 1024;
const CH = Math.round(CW / (SCREEN_W / SCREEN_H));

type Ctx = CanvasRenderingContext2D;

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function bar(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string) {
  ctx.fillStyle = fill;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
}

/** Glass panel: tinted body, bright hairline edge, small tag top left. */
function panel(ctx: Ctx, p: Palette, tag: string) {
  ctx.clearRect(0, 0, CW, CH);
  const g = ctx.createLinearGradient(0, 0, CW, CH);
  g.addColorStop(0, "rgba(6, 26, 40, 0.86)");
  g.addColorStop(1, "rgba(2, 10, 18, 0.9)");
  ctx.fillStyle = g;
  rr(ctx, 6, 6, CW - 12, CH - 12, 28);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = p.accent;
  ctx.globalAlpha = 0.85;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.accent;
  ctx.font = "600 22px ui-monospace, Menlo, monospace";
  ctx.fillText(tag, 40, 52);
}

const DRAW: Record<LayerId, (ctx: Ctx, p: Palette) => void> = {
  // the site itself: browser, nav, headline, button, cards
  web: (ctx, p) => {
    panel(ctx, p, "01 / INTERFACE");
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    rr(ctx, 40, 76, CW - 80, 48, 14);
    ctx.fill();
    ["#ff6b6b", "#ffcc66", p.accent].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(70 + i * 26, 100, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    bar(ctx, 300, 90, 420, 20, "rgba(255,255,255,0.14)");
    bar(ctx, 60, 156, 90, 14, "rgba(255,255,255,0.5)");
    for (let i = 0; i < 4; i++) bar(ctx, 620 + i * 90, 156, 64, 12, "rgba(255,255,255,0.22)");
    bar(ctx, 60, 214, 520, 38, "#ffffff");
    bar(ctx, 60, 266, 400, 38, "#ffffff");
    bar(ctx, 60, 326, 460, 14, "rgba(255,255,255,0.35)");
    bar(ctx, 60, 350, 380, 14, "rgba(255,255,255,0.35)");
    bar(ctx, 60, 392, 150, 44, p.accent);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    rr(ctx, 226, 392, 150, 44, 22);
    ctx.stroke();
    const hero = ctx.createLinearGradient(640, 200, 960, 440);
    hero.addColorStop(0, p.deep);
    hero.addColorStop(1, p.accent);
    ctx.fillStyle = hero;
    rr(ctx, 640, 206, 324, 230, 18);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      rr(ctx, 60 + i * 306, 476, 290, 150, 16);
      ctx.fill();
      bar(ctx, 80 + i * 306, 596, 150, 12, "rgba(255,255,255,0.3)");
    }
  },

  // identity: palette, type, mark
  brand: (ctx, p) => {
    panel(ctx, p, "02 / BRAND");
    const sw = [p.accent, p.midnight, "#ffffff", p.carbon, p.glow];
    sw.forEach((c, i) => {
      ctx.fillStyle = c;
      rr(ctx, 60 + i * 120, 100, 100, 150, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 400 190px Georgia, 'Times New Roman', serif";
    ctx.fillText("Aa", 60, 470);
    ctx.font = "600 150px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = p.accent;
    ctx.fillText("Aa", 330, 470);
    [40, 30, 22, 16].forEach((h, i) => bar(ctx, 60, 520 + i * 32, 260 - i * 40, h * 0.5, "rgba(255,255,255,0.3)"));
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 6;
    rr(ctx, 700, 110, 260, 260, 56);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 120px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("TS", 830, 282);
    ctx.textAlign = "start";
    for (let i = 0; i < 3; i++) bar(ctx, 700, 420 + i * 40, 260 - i * 50, 16, "rgba(255,255,255,0.25)");
  },

  // reach: rising line, bars, a search result
  growth: (ctx, p) => {
    panel(ctx, p, "03 / GROWTH");
    const x0 = 60;
    const y0 = 420;
    const pts = [0.1, 0.18, 0.15, 0.3, 0.36, 0.33, 0.52, 0.6, 0.72, 0.86].map((v, i) => [x0 + i * 62, y0 - v * 300] as const);
    const area = ctx.createLinearGradient(0, 120, 0, y0);
    area.addColorStop(0, "rgba(0,209,178,0.45)");
    area.addColorStop(1, "rgba(0,209,178,0)");
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(pts[pts.length - 1]?.[0] ?? x0, y0);
    ctx.closePath();
    ctx.fillStyle = area;
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x0, 120 + i * 100);
      ctx.lineTo(620, 120 + i * 100);
      ctx.stroke();
    }
    [0.3, 0.45, 0.4, 0.62, 0.8].forEach((v, i) => {
      ctx.fillStyle = i === 4 ? p.accent : "rgba(255,255,255,0.35)";
      rr(ctx, 690 + i * 56, 420 - v * 280, 38, v * 280, 8);
      ctx.fill();
    });
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    rr(ctx, 60, 470, CW - 120, 150, 16);
    ctx.fill();
    bar(ctx, 90, 498, 70, 12, p.glow);
    bar(ctx, 90, 524, 420, 22, "#8ab4ff");
    bar(ctx, 90, 562, 640, 12, "rgba(255,255,255,0.35)");
    bar(ctx, 90, 586, 520, 12, "rgba(255,255,255,0.35)");
  },

  // automation: a workflow graph beside code
  ai: (ctx, p) => {
    panel(ctx, p, "04 / AUTOMATION");
    const code = [
      [0, 0.5, p.accent],
      [1, 0.7, "rgba(255,255,255,0.45)"],
      [1, 0.55, "#ffcc66"],
      [2, 0.6, "rgba(255,255,255,0.45)"],
      [2, 0.35, p.glow],
      [1, 0.5, "rgba(255,255,255,0.45)"],
      [0, 0.25, p.accent],
      [0, 0.6, "rgba(255,255,255,0.45)"],
      [1, 0.45, "#8ab4ff"],
      [0, 0.3, "rgba(255,255,255,0.45)"],
    ] as const;
    code.forEach(([indent, w, c], i) => bar(ctx, 60 + indent * 28, 100 + i * 50, w * 260, 14, c));
    const nodes = [
      [460, 120],
      [460, 330],
      [700, 225],
      [700, 470],
      [880, 350],
    ] as const;
    const links = [
      [0, 2],
      [1, 2],
      [2, 4],
      [1, 3],
      [3, 4],
    ] as const;
    ctx.lineWidth = 4;
    for (const [a, b] of links) {
      const A = nodes[a];
      const B = nodes[b];
      if (!A || !B) continue;
      ctx.strokeStyle = "rgba(0,209,178,0.7)";
      ctx.beginPath();
      ctx.moveTo(A[0] + 120, A[1] + 40);
      ctx.bezierCurveTo(A[0] + 200, A[1] + 40, B[0] - 80, B[1] + 40, B[0], B[1] + 40);
      ctx.stroke();
    }
    nodes.forEach(([x, y], i) => {
      ctx.fillStyle = i === 2 ? "rgba(0,209,178,0.2)" : "rgba(255,255,255,0.08)";
      rr(ctx, x, y, i === 4 ? 104 : 120, 80, 16);
      ctx.fill();
      ctx.strokeStyle = i === 2 ? p.accent : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
      bar(ctx, x + 18, y + 24, 60, 12, "rgba(255,255,255,0.55)");
      bar(ctx, x + 18, y + 46, 84, 10, "rgba(255,255,255,0.25)");
    });
    // a spark on the AI step
    ctx.fillStyle = p.ice;
    ctx.beginPath();
    const cx = 790;
    const cy = 238;
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? 7 : 18;
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  },

  // operations: a ledger with status chips
  erp: (ctx, p) => {
    panel(ctx, p, "05 / DATA");
    const cols = [60, 300, 520, 720];
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    rr(ctx, 40, 84, CW - 80, 48, 10);
    ctx.fill();
    cols.forEach((x, i) => bar(ctx, x, 102, [120, 100, 90, 110][i] ?? 90, 12, "rgba(255,255,255,0.6)"));
    const chips = [p.accent, "#ffcc66", p.accent, "#5ee6a8", p.accent, "#ff8a8a", "#5ee6a8", p.accent];
    for (let r = 0; r < 8; r++) {
      const y = 152 + r * 56;
      ctx.fillStyle = r % 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.0)";
      ctx.fillRect(40, y - 14, CW - 80, 56);
      bar(ctx, cols[0] ?? 60, y + 6, 160 - (r % 3) * 20, 12, "rgba(255,255,255,0.45)");
      bar(ctx, cols[1] ?? 300, y + 6, 120 - (r % 2) * 30, 12, "rgba(255,255,255,0.3)");
      bar(ctx, cols[2] ?? 520, y + 6, 90, 12, "rgba(255,255,255,0.3)");
      ctx.fillStyle = chips[r] ?? p.accent;
      ctx.globalAlpha = 0.85;
      rr(ctx, cols[3] ?? 720, y - 2, 120, 28, 14);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 610);
    ctx.lineTo(CW - 40, 610);
    ctx.stroke();
    bar(ctx, 720, 626, 200, 16, "#ffffff");
  },

  // the base: servers, network, security
  ops: (ctx, p) => {
    panel(ctx, p, "06 / INFRASTRUCTURE");
    for (let s = 0; s < 3; s++) {
      const x = 70 + s * 200;
      for (let u = 0; u < 5; u++) {
        const y = 110 + u * 92;
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        rr(ctx, x, y, 160, 74, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 2;
        ctx.stroke();
        bar(ctx, x + 18, y + 30, 70, 12, "rgba(255,255,255,0.3)");
        ctx.fillStyle = (u + s) % 3 === 0 ? "#ffcc66" : p.accent;
        ctx.beginPath();
        ctx.arc(x + 134, y + 36, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // network to a cloud, and a lock
    ctx.strokeStyle = "rgba(0,209,178,0.6)";
    ctx.lineWidth = 3;
    for (const y of [180, 360, 520]) {
      ctx.beginPath();
      ctx.moveTo(630, y);
      ctx.bezierCurveTo(720, y, 720, 300, 800, 300);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,209,178,0.18)";
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(830, 300, 46, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(880, 254, 52, Math.PI, Math.PI * 1.9);
    ctx.arc(930, 300, 46, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(880, 470, 30, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    rr(ctx, 836, 470, 88, 74, 12);
    ctx.fill();
    ctx.fillStyle = p.midnight;
    ctx.beginPath();
    ctx.arc(880, 500, 9, 0, Math.PI * 2);
    ctx.fill();
  },
};

export type Layer = {
  id: LayerId;
  mesh: Mesh;
  material: MeshBasicMaterial;
  /** caption anchor in the layer's local space (its outer edge) */
  anchor: Vector3;
};

export type Layers = { group: Group; layers: Layer[]; dispose: () => void };

/** `sides` says which edge each caption sits on, so anchors face it. */
export function buildLayers(palette: Palette, sides: Record<LayerId, "left" | "right">): Layers {
  const group = new Group();
  const geometry = new PlaneGeometry(SCREEN_W, SCREEN_H);
  const disposables: Array<{ dispose: () => void }> = [geometry];

  const layers = LAYER_IDS.map((id) => {
    const canvas = document.createElement("canvas");
    canvas.width = CW;
    canvas.height = CH;
    const ctx = canvas.getContext("2d");
    if (ctx) DRAW[id](ctx, palette);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    disposables.push(texture, material);
    const mesh = new Mesh(geometry, material);
    mesh.visible = false;
    group.add(mesh);
    const anchor = new Vector3((sides[id] === "left" ? -1 : 1) * SCREEN_W * 0.5, 0, 0);
    return { id, mesh, material, anchor };
  });

  return {
    group,
    layers,
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
