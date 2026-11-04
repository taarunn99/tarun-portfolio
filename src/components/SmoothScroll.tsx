"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { afterInteraction } from "@/lib/after-interaction";

/**
 * Mounts a Lenis smooth-scroll instance on the document.
 *
 * - Lenis is dynamically imported after the first user gesture (or a few
 *   seconds after load) so it never lands in the critical bundle or trace.
 * - Touch devices keep native scrolling (Lenis default: `smoothTouch: false`),
 *   which is what you want for mobile performance and INP.
 * - Lenis honours `prefers-reduced-motion` itself; we additionally skip the
 *   import entirely in that case so no work is done at all.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | undefined;
    let cancelled = false;

    const cancel = afterInteraction(() => {
      import("lenis").then(({ default: LenisCtor }) => {
        if (cancelled) return;
        lenis = new LenisCtor({
          autoRaf: true,
          lerp: 0.1,
          smoothWheel: true,
          anchors: true,
          stopInertiaOnNavigate: true,
        });
      });
    });

    return () => {
      cancelled = true;
      cancel();
      lenis?.destroy();
    };
  }, []);

  return null;
}
