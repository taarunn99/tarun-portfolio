"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { afterInteraction } from "@/lib/after-interaction";
import styles from "./HeroScene.module.css";

/**
 * Three.js is heavy, so the canvas is loaded in a separate chunk and only
 * mounted once the page is interactive:
 *   - never when the user prefers reduced motion or has Data Saver on
 *   - immediately on the first user gesture (pointer, touch, wheel, key)
 *   - otherwise a few seconds after `load`
 *
 * This keeps Three.js out of LCP / TBT entirely — the hero text is the
 * LCP element and is server-rendered.
 */
const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export function HeroScene() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;

    return afterInteraction(() => setReady(true));
  }, []);

  return (
    <div className={styles.scene} aria-hidden="true">
      {ready ? <HeroCanvas /> : null}
    </div>
  );
}
