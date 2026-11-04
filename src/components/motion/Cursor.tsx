"use client";

import { useRef } from "react";
import { useMotion } from "./useMotion";
import styles from "./Cursor.module.css";

/**
 * Cursor label. Shows a small pill that follows the pointer and reads the
 * `data-cursor` attribute of whatever is hovered ("View", "Drag", "Play").
 * Fine pointers only; never replaces the native cursor; aria-hidden.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useMotion(({ gsap, fine }) => {
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label || !fine) return;

    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    let current = "";

    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      const next = target?.dataset.cursor ?? "";
      if (next !== current) {
        current = next;
        label.textContent = next;
        el.dataset.active = next ? "true" : "false";
      }
    };
    const leave = () => {
      el.dataset.active = "false";
      current = "";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  });

  return (
    <div ref={ref} className={styles.cursor} aria-hidden="true" data-active="false">
      <span ref={labelRef} className={styles.label} />
    </div>
  );
}
