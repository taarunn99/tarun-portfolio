"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's photo aurora, drawn into a canvas once the page has loaded.
 * A canvas is never a "largest paint" candidate, so the photo can cover the
 * whole sky without taking the LCP from the name. The parent's CSS handles
 * size (object-fit), the soft fade masks and the fade-in (`data-on`).
 */
const SOURCES = {
  narrow: ["/images/hero/aurora-768.avif", "/images/hero/aurora-768.webp"],
  wide: ["/images/hero/aurora-1344.avif", "/images/hero/aurora-1344.webp"],
};

async function loadFirst(urls: string[]): Promise<HTMLImageElement | null> {
  for (const url of urls) {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
      return img;
    } catch {
      // format not supported here: try the next one
    }
  }
  return null;
}

export function SkyPhoto({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = ref.current;
    if (!canvas) return;

    const draw = async () => {
      const narrow = window.matchMedia("(max-width: 47.99rem)").matches;
      const img = await loadFirst(narrow ? SOURCES.narrow : SOURCES.wide);
      if (!img || cancelled) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      canvas.dataset.on = "";
    };

    if (document.readyState === "complete") void draw();
    else window.addEventListener("load", () => void draw(), { once: true });

    return () => {
      cancelled = true;
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
