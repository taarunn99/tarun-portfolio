import { yieldToMain } from "@/components/motion/runtime";
import type { GridPalette } from "./css-color";
import type { GridTile } from "./types";

export const ATLAS_CELLS = 4;

/** Media window inside a unit cell, in canvas coordinates (y down). */
const MEDIA_W = 0.7;
const MEDIA_H = MEDIA_W / 1.6; // 16:10
const MEDIA_X = (1 - MEDIA_W) / 2;
const MEDIA_Y = 0.15;

/** Same window in texture coordinates (y up) — what the shader needs. */
export const MEDIA_ORIGIN: readonly [number, number] = [MEDIA_X, 1 - (MEDIA_Y + MEDIA_H)];
export const MEDIA_SIZE: readonly [number, number] = [MEDIA_W, MEDIA_H];

export type Atlas = {
  canvas: HTMLCanvasElement;
  size: number;
};

type AtlasOptions = {
  tiles: readonly GridTile[];
  palette: GridPalette;
  /** Canvas2D font-family string for the mono face */
  monoFamily: string;
  /** Atlas side in px (4096 → 1024-px cells) */
  size: number;
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      img.decode().then(() => resolve(img), () => resolve(img));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function paintPlaceholder(ctx: CanvasRenderingContext2D, tile: GridTile, p: GridPalette, mono: string, s: number) {
  const x = MEDIA_X * s;
  const y = MEDIA_Y * s;
  const w = MEDIA_W * s;
  const h = MEDIA_H * s;

  ctx.fillStyle = p.bg;
  ctx.fillRect(x, y, w, h);

  // Hairline grid, 8 × 5 cells
  ctx.strokeStyle = p.line;
  ctx.lineWidth = Math.max(1, s * 0.0015);
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let i = 1; i < 8; i++) {
    const gx = x + (w * i) / 8;
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
  }
  for (let j = 1; j < 5; j++) {
    const gy = y + (h * j) / 5;
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Lime index, bottom-left
  ctx.fillStyle = p.accent;
  ctx.font = `500 ${Math.round(s * 0.13)}px ${mono}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(String(tile.index + 1).padStart(2, "0"), x + s * 0.03, y + h - s * 0.03);

  // Short name, top-left
  ctx.fillStyle = p.muted;
  ctx.font = `500 ${Math.round(s * 0.034)}px ${mono}`;
  ctx.textBaseline = "top";
  ctx.fillText(truncate(ctx, tile.short.toUpperCase(), w - s * 0.06), x + s * 0.03, y + s * 0.03);
}

function paintCell(
  ctx: CanvasRenderingContext2D,
  tile: GridTile,
  image: HTMLImageElement | null,
  p: GridPalette,
  mono: string,
  s: number,
) {
  // Tile background (one tone above the page bg; the 0.002 plane gap shows the page bg)
  ctx.fillStyle = p.tile;
  ctx.fillRect(0, 0, s, s);

  if (image) {
    const x = MEDIA_X * s;
    const y = MEDIA_Y * s;
    const w = MEDIA_W * s;
    const h = MEDIA_H * s;
    // Cover-fit from the top (screens are 16:10 already; this guards other ratios)
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.drawImage(image, x + (w - dw) / 2, y, dw, dh);
    ctx.restore();
    ctx.strokeStyle = p.line;
    ctx.lineWidth = Math.max(1, s * 0.002);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  } else {
    paintPlaceholder(ctx, tile, p, mono, s);
  }

  // Label strip
  const left = MEDIA_X * s;
  const right = (MEDIA_X + MEDIA_W) * s;
  const metaSize = Math.round(s * 0.046);
  const nameSize = Math.round(s * 0.072);
  const line1 = (MEDIA_Y + MEDIA_H) * s + s * 0.08;
  const line2 = line1 + s * 0.105;

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `500 ${metaSize}px ${mono}`;
  ctx.fillStyle = p.accent;
  const index = String(tile.index + 1).padStart(2, "0");
  ctx.fillText(index, left, line1);
  const indexWidth = ctx.measureText(`${index}   `).width;

  ctx.textAlign = "right";
  ctx.fillStyle = p.muted;
  ctx.fillText(tile.year, right, line1);
  const yearWidth = ctx.measureText(`${tile.year}   `).width;

  ctx.textAlign = "left";
  ctx.fillStyle = p.muted;
  ctx.fillText(truncate(ctx, tile.client.toUpperCase(), right - left - indexWidth - yearWidth), left + indexWidth, line1);

  ctx.font = `500 ${nameSize}px ${mono}`;
  ctx.fillStyle = p.fg;
  ctx.fillText(truncate(ctx, tile.short, right - left), left, line2);
}

/**
 * Paints the 4×4 cover atlas at runtime: cover image (or a procedural
 * placeholder) inside each cell plus a mono label strip. Images load in
 * parallel; painting yields to the main thread between cells.
 */
export async function buildAtlas({ tiles, palette, monoFamily, size }: AtlasOptions): Promise<Atlas | null> {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;

  const cell = size / ATLAS_CELLS;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, size, size);

  const images = await Promise.all(tiles.map((t) => (t.src ? loadImage(t.src) : Promise.resolve(null))));

  for (let i = 0; i < tiles.length && i < ATLAS_CELLS * ATLAS_CELLS; i++) {
    const cx = i % ATLAS_CELLS;
    const cy = Math.floor(i / ATLAS_CELLS);
    ctx.save();
    ctx.translate(cx * cell, cy * cell);
    paintCell(ctx, tiles[i], images[i], palette, monoFamily, cell);
    ctx.restore();
    if (i % 4 === 3) await yieldToMain();
  }

  return { canvas, size };
}
