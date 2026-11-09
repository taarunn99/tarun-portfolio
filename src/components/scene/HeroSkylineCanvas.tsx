"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroSkylineCanvas.module.css";

type Props = {
  /** next/image srcSet strings ("url 640w, url 828w, …") */
  phoneSet: string;
  wideSet: string;
  /** must match the CSS breakpoint in HeroSkyline.module.css */
  phoneQuery: string;
};

/** Smallest candidate at least `need` px wide (or the largest available). */
function pick(srcSet: string, need: number): string {
  const candidates = srcSet
    .split(",")
    .map((part) => {
      const [url, w] = part.trim().split(/\s+/);
      return { url, w: Number.parseInt(w ?? "0", 10) };
    })
    .filter((c) => c.url && c.w > 0)
    .sort((a, b) => a.w - b.w);
  return (candidates.find((c) => c.w >= need) ?? candidates[candidates.length - 1])?.url ?? "";
}

/**
 * Paints the skyline render into a <canvas>. A canvas is never an LCP
 * candidate, so the hero copy stays the page's LCP while this, the largest
 * graphic in the hero, arrives right after it and fades up. Phones and wide
 * screens get their own crop (contain on wide, cover on phones), redrawn on
 * resize. Decoding happens off the main thread via createImageBitmap.
 */
export default function HeroSkylineCanvas({ phoneSet, wideSet, phoneQuery }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    if (!canvas || !box) return;

    const phone = window.matchMedia(phoneQuery);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let bitmap: ImageBitmap | null = null;
    let loadedFor: "phone" | "wide" | null = null;
    let pendingFor: "phone" | "wide" | null = null;
    let cancelled = false;

    const draw = () => {
      if (!bitmap) return;
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cover = loadedFor === "phone";
      const scale = cover
        ? Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height)
        : Math.min(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const dw = bitmap.width * scale;
      const dh = bitmap.height * scale;
      // centred horizontally, sitting on the ground line
      ctx.drawImage(bitmap, (canvas.width - dw) / 2, canvas.height - dh, dw, dh);
    };

    const load = async () => {
      const which = phone.matches ? "phone" : "wide";
      if (which === loadedFor) return draw();
      if (which === pendingFor) return;
      pendingFor = which;
      const need = Math.round(box.clientWidth * dpr * (which === "phone" ? 1.2 : 1));
      const url = pick(which === "phone" ? phoneSet : wideSet, need);
      try {
        if (!url) return;
        // same negotiation as an <img>: AVIF/WebP from the image optimiser
        const response = await fetch(url, {
          priority: "low",
          headers: { Accept: "image/avif,image/webp,image/*" },
        } as RequestInit);
        if (!response.ok) return;
        const next = await createImageBitmap(await response.blob());
        if (cancelled) {
          next.close();
          return;
        }
        bitmap?.close();
        bitmap = next;
        loadedFor = which;
        draw();
        canvas.classList.add(styles.visible);
      } catch {
        // Network or decode failure: the hero simply shows the aurora sky.
      } finally {
        if (pendingFor === which) pendingFor = null;
      }
    };

    void load();
    const resize = new ResizeObserver(() => void load());
    resize.observe(box);
    return () => {
      cancelled = true;
      resize.disconnect();
      bitmap?.close();
    };
  }, [phoneSet, wideSet, phoneQuery]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
