"use client";

import { afterInteraction } from "@/lib/after-interaction";

/**
 * The motion runtime: GSAP + ScrollTrigger + Lenis, loaded in ONE chunk,
 * only after the first user gesture (or 3.5 s after `load`), and never
 * when the user prefers reduced motion.
 *
 * Everything that animates calls `loadMotion()` and attaches its effects
 * in the resolved callback. Until then the page is fully readable: nothing
 * is hidden, nothing waits.
 */
export type Motion = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  lenis: import("lenis").default | null;
  /** True on devices with a fine pointer and hover — cursor/magnetic effects only */
  fine: boolean;
};

let promise: Promise<Motion | null> | undefined;
let cancelGate: (() => void) | undefined;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function loadMotion(): Promise<Motion | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (promise) return promise;

  promise = new Promise<Motion | null>((resolve) => {
    if (prefersReducedMotion()) {
      resolve(null);
      return;
    }

    cancelGate = afterInteraction(() => {
      void (async () => {
        try {
          const [{ gsap }, { ScrollTrigger }] = await Promise.all([
            import("gsap"),
            import("gsap/ScrollTrigger"),
          ]);
          gsap.registerPlugin(ScrollTrigger);
          await yieldToMain();

          const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

          let lenis: import("lenis").default | null = null;
          try {
            const { default: Lenis } = await import("lenis");
            lenis = new Lenis({
              autoRaf: false,
              lerp: 0.1,
              smoothWheel: true,
              syncTouch: false,
              anchors: true,
              stopInertiaOnNavigate: true,
            });
            lenis.on("scroll", ScrollTrigger.update);
            gsap.ticker.add((time) => lenis?.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
          } catch {
            lenis = null;
          }

          await yieldToMain();
          ScrollTrigger.refresh();
          resolve({ gsap, ScrollTrigger, lenis, fine });
        } catch {
          resolve(null);
        }
      })();
    });
  });

  return promise;
}

/** Cancels a pending gate (used only in tests / hot reload). */
export function cancelMotion(): void {
  cancelGate?.();
  cancelGate = undefined;
  promise = undefined;
}

export function yieldToMain(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (s?.yield) return s.yield();
  return new Promise((r) => setTimeout(r, 0));
}
