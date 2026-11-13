"use client";

import { useEffect, useRef } from "react";

type Speck = { x: number; y: number; vx: number; vy: number; d: number; r: number; a: number; w: number; tint: boolean };

/** Share of the scroll spent gliding; the rest is the dust. */
const GLIDE = 0.8;
/** Scroll per project, as a multiple of the spacing between projects. */
const PACE = { fine: 1.7, coarse: 1.4 };

/** Gentle ease that still follows the scroll closely. */
const easeA = (a: number) => a * a * (3 - 2 * a) * 0.35 + a * 0.65;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Drives the project timeline (sections/ProjectTimeline). Turns the plain
 * list into a pinned scene, then on every frame while it is on screen:
 *  - glide: the track slides sideways and slowly zooms (0.92 to 1.1),
 *    eased, over the first 80% of the scroll
 *  - lighting: each project gets `data-on` as it reaches the current spot;
 *    CSS fades it on a timer, so it stays smooth at any scroll speed
 *  - dust: over the last 20% a sweep crosses the screen left to right; what
 *    it passes (line, dots, text) breaks into specks that rise and drift
 *    away on a 2D canvas, sampled from whatever is on screen at that moment
 * Fine pointers sweep with a moving mask; touch screens fade each piece in
 * turn (a moving mask repaints the whole screen every frame on a phone).
 * Reduced motion: does nothing, the list stays a list.
 */
export function TimelineMotion() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sec = ref.current?.closest<HTMLElement>("[data-timeline]");
    if (!sec) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pin = sec.querySelector<HTMLElement>("[data-pin]");
    const head = sec.querySelector<HTMLElement>("[data-head]");
    const stage = sec.querySelector<HTMLElement>("[data-stage]");
    const track = sec.querySelector<HTMLElement>("[data-track]");
    const fill = sec.querySelector<HTMLElement>("[data-fill]");
    const line = sec.querySelector<HTMLElement>("[data-line]");
    const canvas = sec.querySelector<HTMLCanvasElement>("[data-dust-canvas]");
    const items = Array.from(sec.querySelectorAll<HTMLElement>("[data-item]"));
    const ctx = canvas?.getContext("2d");
    if (!pin || !head || !stage || !track || !fill || !line || !canvas || !ctx || !items.length) return;

    const n = items.length;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const css = getComputedStyle(sec);
    const ink = css.getPropertyValue("--fg").trim() || "white";
    const tint = css.getPropertyValue("--accent").trim() || "cyan";

    let vw = 0;
    let vh = 0;
    let S = 0;
    let anchor = 0;
    let dpr = 1;
    let lastW = -1;
    let specks: Speck[] | null = null;
    // touch screens: where each piece sits once the glide ends (share of width)
    let spans: Array<{ el: HTMLElement; u0: number; u1: number }> = [];

    sec.toggleAttribute("data-live", true);

    const layout = () => {
      vw = pin.clientWidth;
      vh = pin.clientHeight;
      const narrow = vw < 768;
      S = Math.round(narrow ? vw * 0.62 : Math.min(Math.max(vw * 0.3, 300), 460));
      // the current spot: the middle of the screen (phones: a third in, so the card fits)
      anchor = narrow ? vw * 0.28 : vw / 2;
      track.style.setProperty("--s", `${S}px`);
      sec.style.height = `${Math.round(vh + (n - 1) * S * (coarse ? PACE.coarse : PACE.fine) + vh * 0.9)}px`;
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      specks = null;
      spans = [];
    };

    // Dust is sampled from what is on screen when the sweep starts.
    const makeSpecks = (): Speck[] => {
      const box = pin.getBoundingClientRect();
      const out: Speck[] = [];
      const total = coarse ? 650 : 1500;
      const rects: DOMRect[] = [];
      sec.querySelectorAll<HTMLElement>("[data-dust], h2").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.right > box.left && r.left < box.right && r.bottom > box.top && r.top < box.bottom && r.width > 0) rects.push(r);
      });
      const lr = line.getBoundingClientRect();
      const area = rects.reduce((s, r) => s + r.width * r.height, 0) || 1;
      const add = (x: number, y: number, big: boolean) => {
        out.push({
          x: x - box.left,
          y: y - box.top,
          vx: (Math.random() - 0.5) * 60,
          vy: -(vh * (0.25 + Math.random() * 0.55)),
          d: Math.min(0.62, Math.max(0, ((x - box.left) / vw + 0.12) / 1.35 - 0.04 + Math.random() * 0.06)),
          r: big ? 1.1 + Math.random() * 1.7 : 0.6 + Math.random() * 1.2,
          a: 0.45 + Math.random() * 0.55,
          w: Math.random() * 6.28,
          tint: Math.random() < 0.4,
        });
      };
      const lineCount = Math.round(total * 0.3);
      for (let k = 0; k < lineCount; k++) add(box.left + Math.random() * vw, lr.top + lr.height / 2 + (Math.random() - 0.5) * 2, false);
      for (const r of rects) {
        const c = Math.round(((total - lineCount) * r.width * r.height) / area);
        for (let k = 0; k < c; k++) add(r.left + Math.random() * r.width, r.top + Math.random() * r.height, true);
      }
      return out;
    };

    const drawDust = (b: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      if (b <= 0 || b >= 1) return;
      if (!specks) specks = makeSpecks();
      for (const p of specks) {
        const q = clamp01((b - p.d) / 0.42);
        if (q <= 0 || q >= 1) continue;
        const e = q * q * (3 - 2 * q);
        const x = p.x + p.vx * e + Math.sin(p.w + q * 5) * 10 * q;
        const y = p.y + p.vy * e;
        ctx.globalAlpha = p.a * Math.min(1, q * 8) * Math.pow(1 - q, 1.3);
        ctx.fillStyle = p.tint ? tint : ink;
        ctx.fillRect(x, y, p.r, p.r);
      }
      ctx.globalAlpha = 1;
    };

    const focusAt = (a: number) => S * (0.5 + easeA(a) * (n - 1));
    const scaleAt = (a: number) => 0.92 + 0.18 * easeA(a);

    // touch screens: measure each piece where the glide leaves it
    const measureSpans = () => {
      const focusE = focusAt(1);
      const scE = scaleAt(1);
      const X = (t: number) => anchor + scE * (t - focusE);
      spans = items.map((el, i) => {
        const cw = el.querySelector<HTMLElement>("a")?.offsetWidth ?? S;
        const x0 = S * (i + 0.5) - 12;
        return { el, u0: X(x0) / vw, u1: X(x0 + cw) / vw };
      });
      const pb = pin.getBoundingClientRect();
      for (const el of Array.from(head.children) as HTMLElement[]) {
        const r = el.getBoundingClientRect();
        spans.push({ el, u0: (r.left - pb.left) / vw, u1: (r.right - pb.left) / vw });
      }
    };

    let raf = 0;
    let live = false;
    let lastP = -1;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const r = sec.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(r.height - vh, 1));
      if (Math.abs(p - lastP) < 0.0002) return;
      lastP = p;
      const a = Math.min(1, p / GLIDE);
      const b = Math.max(0, (p - GLIDE) / (1 - GLIDE));
      const focus = focusAt(a);
      const scale = scaleAt(a);

      track.style.transform = `translate3d(${(anchor - scale * focus).toFixed(1)}px,0,0) scale(${scale.toFixed(4)})`;
      fill.style.transform = `scaleX(${(focus / (S * n)).toFixed(4)})`;
      items.forEach((it, i) => it.toggleAttribute("data-on", S * (i + 0.5) <= focus + S * 0.3));

      // the sweep's leading edge, as a share of the screen width
      const edge = b * 1.35 - 0.12;
      if (coarse) {
        if (b > 0 && !spans.length) measureSpans();
        for (const s of spans) {
          const bS = Math.max(0, s.u0 / 1.35);
          const bE = Math.max(bS + 0.04, (s.u1 + 0.12) / 1.35);
          s.el.style.opacity = b > 0 ? String(1 - clamp01((b - bS) / (bE - bS))) : "";
        }
        line.style.opacity = b > 0 ? String(1 - clamp01(edge * 1.25)) : "";
      } else {
        const mask = b > 0 ? `linear-gradient(90deg,transparent ${(edge * 100).toFixed(1)}%,black ${(edge * 100 + 12).toFixed(1)}%)` : "none";
        stage.style.webkitMaskImage = mask;
        stage.style.maskImage = mask;
        head.style.webkitMaskImage = mask;
        head.style.maskImage = mask;
      }
      if (b <= 0) specks = null;
      drawDust(b);
    };

    const start = () => {
      if (live) return;
      live = true;
      lastP = -1;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      live = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver((entries) => (entries[0]?.isIntersecting ? start() : stop()), { rootMargin: "200px 0px" });

    const onResize = () => {
      if (coarse && window.innerWidth === lastW) return; // phones: ignore the address bar showing and hiding
      lastW = window.innerWidth;
      layout();
      lastP = -1;
    };
    layout();
    lastW = window.innerWidth;
    io.observe(sec);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      sec.toggleAttribute("data-live", false);
      sec.style.height = "";
    };
  }, []);

  return <span ref={ref} hidden />;
}
