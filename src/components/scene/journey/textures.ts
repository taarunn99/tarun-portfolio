"use client";

import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from "three";
import type { StationId } from "./geometry";
import { skylines } from "./skylines";
import type { SceneImage } from "./types";

export type Palette = {
  sky0: string;
  sky1: string;
  sky2: string;
  sun: string;
  sunX: number;
  sunY: number;
  ink: string;
  fg: string;
  accent: string;
  muted: string;
};

/**
 * Reads a CSS custom property from an element and normalises it to a
 * hex/rgb string three.js understands (tokens are OKLCH; three's Color
 * parser is not). A 2D canvas resolves any CSS colour the browser supports.
 */
export function readCssColor(el: Element, name: string, fallback: string): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  if (!value) return fallback;
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    const resolved = ctx.fillStyle;
    return /^(#|rgb)/.test(resolved) ? resolved : fallback;
  } catch {
    return fallback;
  }
}

function readPercent(el: Element, name: string, fallback: number): number {
  const v = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(v) ? v / 100 : fallback;
}

export function readPalette(el: Element): Palette {
  return {
    sky0: readCssColor(el, "--sky-0", "#2a2340"),
    sky1: readCssColor(el, "--sky-1", "#b56a3a"),
    sky2: readCssColor(el, "--sky-2", "#e8c88a"),
    sun: readCssColor(el, "--sun", "#fff2c0"),
    sunX: readPercent(el, "--sun-x", 0.5),
    sunY: readPercent(el, "--sun-y", 0.7),
    ink: readCssColor(el, "--bg", "#0a0a0a"),
    fg: readCssColor(el, "--fg", "#f2f2f0"),
    accent: readCssColor(el, "--accent", "#c9f55a"),
    muted: readCssColor(el, "--muted", "#9a9a94"),
  };
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  return ctx ? [c, ctx] : null;
}

function srgb(tex: Texture): Texture {
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Vertical sky gradient with a low sun — the backdrop when no `scene-*` image exists */
export function makeSkyTexture(p: Palette): Texture | null {
  const made = canvas(512, 512);
  if (!made) return null;
  const [c, ctx] = made;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, p.sky0);
  g.addColorStop(0.58, p.sky1);
  g.addColorStop(1, p.sky2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const sx = p.sunX * 512;
  const sy = p.sunY * 512;
  const r = ctx.createRadialGradient(sx, sy, 0, sx, sy, 150);
  r.addColorStop(0, p.sun);
  r.addColorStop(0.18, p.sun);
  r.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, 512, 512);
  return srgb(new CanvasTexture(c));
}

/**
 * The station's silhouette on a transparent canvas — the mid-ground layer when
 * no `layer-*` image exists. Shapes that span the full painting width (ground,
 * water) are stretched across the whole layer; the rest sit in the middle.
 */
export function makeSkylineTexture(id: StationId, p: Palette): Texture | null {
  const W = 2048;
  const H = 768;
  const made = canvas(W, H);
  if (!made) return null;
  const [c, ctx] = made;
  const box = { w: 1100, h: 733 };
  const ox = (W - box.w) / 2;
  const oy = H - box.h;
  const sky = skylines[id];

  for (const shape of sky.shapes) {
    ctx.globalAlpha = shape.tone === "ink2" ? 0.62 : 0.94;
    ctx.fillStyle = p.ink;
    ctx.strokeStyle = p.ink;
    if (shape.kind === "ring") {
      ctx.lineWidth = shape.width * box.h;
      ctx.beginPath();
      ctx.arc(ox + shape.cx * box.w, oy + shape.cy * box.h, shape.r * box.h, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    const xs = shape.points.map(([x]) => x);
    const spansWidth = Math.min(...xs) <= 0 && Math.max(...xs) >= 1;
    const sx = spansWidth ? W : box.w;
    const sxo = spansWidth ? 0 : ox;
    ctx.beginPath();
    shape.points.forEach(([x, y], i) => {
      const px = sxo + x * sx;
      const py = oy + y * box.h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return srgb(new CanvasTexture(c));
}

/** A small figure seen from behind, mid-stride — the wanderer that walks ahead of the camera */
export function makeWandererTexture(p: Palette): Texture | null {
  const made = canvas(128, 256);
  if (!made) return null;
  const [c, ctx] = made;
  ctx.fillStyle = p.ink;
  ctx.globalAlpha = 0.94;
  // head
  ctx.beginPath();
  ctx.ellipse(64, 34, 13, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  // neck + shoulders + torso (tapering to the waist)
  ctx.beginPath();
  ctx.moveTo(58, 46);
  ctx.lineTo(70, 46);
  ctx.lineTo(72, 56);
  ctx.quadraticCurveTo(96, 60, 98, 78);
  ctx.lineTo(90, 140);
  ctx.lineTo(80, 146);
  ctx.lineTo(48, 146);
  ctx.lineTo(38, 140);
  ctx.lineTo(30, 78);
  ctx.quadraticCurveTo(32, 60, 56, 56);
  ctx.closePath();
  ctx.fill();
  // arms
  ctx.beginPath();
  ctx.moveTo(31, 80);
  ctx.lineTo(22, 150);
  ctx.lineTo(32, 152);
  ctx.lineTo(40, 100);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(97, 80);
  ctx.lineTo(108, 142);
  ctx.lineTo(98, 146);
  ctx.lineTo(88, 100);
  ctx.closePath();
  ctx.fill();
  // legs, one stepping forward
  ctx.beginPath();
  ctx.moveTo(48, 144);
  ctx.lineTo(64, 144);
  ctx.lineTo(60, 196);
  ctx.lineTo(46, 240);
  ctx.lineTo(32, 238);
  ctx.lineTo(44, 192);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(66, 144);
  ctx.lineTo(82, 144);
  ctx.lineTo(84, 196);
  ctx.lineTo(90, 240);
  ctx.lineTo(76, 242);
  ctx.lineTo(68, 196);
  ctx.closePath();
  ctx.fill();
  // backpack
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = p.muted;
  ctx.beginPath();
  ctx.roundRect(46, 66, 36, 48, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  return srgb(new CanvasTexture(c));
}

/** Ground: ink near the camera, fading to nothing at the horizon so the backdrop shows through */
export function makeGroundTexture(p: Palette): Texture | null {
  const made = canvas(4, 256);
  if (!made) return null;
  const [c, ctx] = made;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, withAlpha(p.ink, 0));
  g.addColorStop(0.3, withAlpha(p.ink, 0.55));
  g.addColorStop(1, withAlpha(p.ink, 0.92));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  return srgb(new CanvasTexture(c));
}

/** Soft round sprite for the dust points */
export function makeDotTexture(): Texture | null {
  const made = canvas(32, 32);
  if (!made) return null;
  const [c, ctx] = made;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new CanvasTexture(c);
}

/** `#rrggbb` / `rgb(...)` → `rgba(..., a)` */
function withAlpha(color: string, a: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(color);
  if (rgb) {
    const [r, g, b] = rgb[1].split(",").map((v) => v.trim());
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return color;
}

/**
 * Fades a layer's left, right and bottom edges to transparent so a silhouette
 * plane dissolves into the haze instead of ending in a straight line.
 */
export function fadeEdges(tex: Texture): Texture {
  const img = tex.image as { width?: number; height?: number } | undefined;
  const w = img?.width ?? 0;
  const h = img?.height ?? 0;
  const made = w && h ? canvas(w, h) : null;
  if (!made) return tex;
  const [c, ctx] = made;
  ctx.drawImage(tex.image as CanvasImageSource, 0, 0, w, h);
  ctx.globalCompositeOperation = "destination-in";
  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)");
  gx.addColorStop(0.16, "rgba(0,0,0,1)");
  gx.addColorStop(0.84, "rgba(0,0,0,1)");
  gx.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);
  const gy = ctx.createLinearGradient(0, h, 0, h * 0.9);
  gy.addColorStop(0, "rgba(0,0,0,0)");
  gy.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);
  tex.dispose();
  return srgb(new CanvasTexture(c));
}

/** Loads a manifest image (already resolved to the largest WebP ≤ 2048 px) */
export function loadImageTexture(img: SceneImage): Promise<Texture> {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(img.src, (t) => resolve(srgb(t)), undefined, reject);
  });
}
