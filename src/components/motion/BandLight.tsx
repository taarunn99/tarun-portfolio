"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer light for the contact band. Writes three variables on the band
 * (the parent of this element), eased toward the pointer and stopping once
 * settled:
 *   --mx / --my  pointer position in the band, for the spotlight and grid
 *   --ang        direction from the horizon's centre to the pointer, so the
 *                light on the planet's rim turns to face it
 *   --dx / --dy  a few px of parallax for the horizon
 * Fine pointers only; touch screens and reduced motion keep the CSS
 * defaults (a still light on the rim).
 */
export function BandLight() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const band = ref.current?.parentElement;
    const rim = band?.querySelector<HTMLElement>("[data-rim]");
    if (!band || !rim) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const REST = { x: 0.28, y: 0.3 };
    let tx = REST.x;
    let ty = REST.y;
    let x = tx;
    let y = ty;
    let ang = 0;
    let tAng = 0;
    let raf = 0;

    const angleTo = (px: number, py: number) => {
      const b = band.getBoundingClientRect();
      const r = rim.getBoundingClientRect();
      const cx = r.left + r.width / 2 - b.left;
      const cy = r.top + r.height / 2 - b.top;
      // conic-gradient angles: 0deg points up, clockwise
      return (Math.atan2(px * b.width - cx, -(py * b.height - cy)) * 180) / Math.PI;
    };

    const loop = () => {
      x += (tx - x) * 0.09;
      y += (ty - y) * 0.09;
      // shortest way round
      let d = tAng - ang;
      d = ((((d + 180) % 360) + 360) % 360) - 180;
      ang += d * 0.09;
      band.style.setProperty("--mx", `${(x * 100).toFixed(2)}%`);
      band.style.setProperty("--my", `${(y * 100).toFixed(2)}%`);
      band.style.setProperty("--ang", `${ang.toFixed(2)}deg`);
      band.style.setProperty("--dx", `${((x - 0.5) * -18).toFixed(1)}px`);
      band.style.setProperty("--dy", `${((y - 0.5) * -10).toFixed(1)}px`);
      if (Math.abs(tx - x) > 0.0008 || Math.abs(ty - y) > 0.0008 || Math.abs(d) > 0.2) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    ang = tAng = angleTo(REST.x, REST.y);
    const move = (e: PointerEvent) => {
      const b = band.getBoundingClientRect();
      tx = (e.clientX - b.left) / b.width;
      ty = (e.clientY - b.top) / b.height;
      tAng = angleTo(tx, ty);
      kick();
    };
    const leave = () => {
      tx = REST.x;
      ty = REST.y;
      tAng = angleTo(tx, ty);
      kick();
    };
    band.addEventListener("pointermove", move);
    band.addEventListener("pointerleave", leave);
    return () => {
      band.removeEventListener("pointermove", move);
      band.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <span ref={ref} hidden />;
}
