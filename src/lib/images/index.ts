import manifest from "./manifest.json";

export type ImageEntry = {
  /** Largest optimised source (served through next/image) */
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
  /** Pre-rendered width variants, for <picture> fallbacks */
  variants?: { avif?: { w: number; src: string }[]; webp?: { w: number; src: string }[] };
};

const entries = manifest as Record<string, ImageEntry>;

/** Returns the optimised image for a manifest id, or null when it has not been generated yet. */
export function getImage(id: string): ImageEntry | null {
  return entries[id] ?? null;
}
