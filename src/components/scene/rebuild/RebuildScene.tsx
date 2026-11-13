"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { afterInteraction } from "@/lib/after-interaction";
import styles from "./RebuildScene.module.css";

const RebuildCanvas = dynamic(() => import("./RebuildCanvas"), { ssr: false });

/**
 * Mounts the rebuild tiles only when motion is allowed, Data Saver is off,
 * the page has been interacted with (or 3.5 s after load) and the story is
 * within a quarter screen of the viewport (it sits right under the opening,
 * so a wider margin would load it on every visit, scroll or not). The HTML frame and captions tell the
 * same story the whole time.
 */
export function RebuildScene() {
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
      { rootMargin: "25% 0px" },
    );
    io.observe(el);
    return () => {
      cancel();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={styles.scene} aria-hidden="true">
      {ready ? <RebuildCanvas /> : null}
    </div>
  );
}
