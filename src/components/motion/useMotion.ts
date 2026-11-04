"use client";

import { useEffect, useRef } from "react";
import { loadMotion, type Motion } from "./runtime";

type Cleanup = void | (() => void);

/**
 * Runs `effect` once the motion runtime is available. The effect receives
 * `{ gsap, ScrollTrigger, lenis, fine }` and may return a cleanup.
 * If the runtime never loads (reduced motion, SSR, failure), nothing runs
 * and the DOM stays in its readable default state.
 */
export function useMotion(effect: (m: Motion) => Cleanup, deps: readonly unknown[] = []): void {
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current = effect;
  });

  useEffect(() => {
    let cancelled = false;
    let cleanup: Cleanup;

    void loadMotion().then((m) => {
      if (cancelled || !m) return;
      cleanup = effectRef.current(m);
    });

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** True if `el` is already (partly) inside the viewport — such elements must not be hidden by a reveal. */
export function isInViewport(el: Element, margin = 0): boolean {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight + margin && r.bottom > -margin;
}
