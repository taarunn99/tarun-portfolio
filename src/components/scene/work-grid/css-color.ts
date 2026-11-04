/**
 * Reads a CSS custom property and normalises it to a hex/rgb string three.js
 * and Canvas2D both understand (tokens are OKLCH; three's Color parser is
 * not). A 2D canvas resolves any colour the browser supports.
 * (Local copy of the helper in scene/HeroCanvas.tsx — scenes do not import
 * across each other.)
 */
export function readCssColor(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

/** Resolved token colours used by the atlas painter and the shaders. */
export type GridPalette = {
  bg: string;
  tile: string;
  fg: string;
  muted: string;
  line: string;
  accent: string;
};

export function readGridPalette(): GridPalette {
  return {
    bg: readCssColor("--bg", "#0a0a0a"),
    tile: readCssColor("--bg-elevated", "#141414"),
    fg: readCssColor("--fg", "#f2f2f0"),
    muted: readCssColor("--muted", "#9a9a94"),
    line: readCssColor("--line-strong", "#3a3a3a"),
    accent: readCssColor("--accent", "#c9f55a"),
  };
}

/** The mono font stack with next/font variables already substituted, for Canvas2D. */
export function readMonoFontFamily(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
  return value && !value.includes("var(") ? value : "ui-monospace, Menlo, monospace";
}
