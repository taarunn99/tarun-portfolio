"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { afterInteraction } from "@/lib/after-interaction";
import styles from "./ProofScene.module.css";

const ProofCanvas = dynamic(() => import("./ProofCanvas"), { ssr: false });

/**
 * Mounts the particle numbers only when all of these hold: motion is allowed,
 * Data Saver is off, the page has been interacted with (or 3.5 s after load),
 * and the section is within a screen of the viewport. The HTML numbers are
 * readable the whole time.
 */
export function ProofScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return;

    let interacted = false;
    let near = false;
    const check = () => {
      if (interacted && near) setReady(true);
    };
    const cancel = afterInteraction(() => {
      interacted = true;
      check();
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          near = true;
          check();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      cancel();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={styles.scene} aria-hidden="true">
      {ready ? <ProofCanvas /> : null}
    </div>
  );
}
