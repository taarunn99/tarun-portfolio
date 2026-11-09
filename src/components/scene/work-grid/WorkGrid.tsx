"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loadMotion, yieldToMain } from "@/components/motion/runtime";
import type { GridTile } from "./types";
import styles from "./WorkGrid.module.css";

type Props = {
  tiles: readonly GridTile[];
};

/**
 * The WebGL island. Mounted only by WorkGridCanvas (fine pointer, motion
 * allowed, after the first interaction). Init is chunked: motion runtime →
 * scene module → renderer → atlas → first frame, yielding between steps.
 * Any failure unmounts the stage silently; the DOM index below remains.
 */
export default function WorkGrid({ tiles }: Props) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let cancelled = false;
    let handle: { dispose: () => void } | null = null;

    void (async () => {
      try {
        const motion = await loadMotion();
        if (cancelled || !motion) {
          if (!cancelled) setFailed(true);
          return;
        }
        await yieldToMain();
        const { createWorkGrid } = await import("./scene");
        if (cancelled) return;
        handle = await createWorkGrid({
          host,
          canvas,
          tiles,
          gsap: motion.gsap,
          onOpen: (slug) => router.push(`/work/${slug}`),
          onReady: () => {
            host.dataset.ready = "true";
          },
        });
        if (cancelled) {
          handle?.dispose();
          handle = null;
        } else if (!handle) {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      handle?.dispose();
      handle = null;
    };
  }, [tiles, router]);

  if (failed) return null;

  return (
    <div
      ref={hostRef}
      className={styles.stage}
      tabIndex={0}
      role="application"
      aria-label="Interactive grid of projects. Use arrow keys to pan, Enter to open"
      data-cursor="Drag"
      data-pressed="false"
      data-ready="false"
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
