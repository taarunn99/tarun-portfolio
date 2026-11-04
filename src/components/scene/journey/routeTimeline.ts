"use client";

import type { Motion } from "@/components/motion/runtime";
import { geometries, type Orient, type StationGeometry, type StationId } from "./geometry";
import type { RouteMilestone } from "./types";

export type RouteHandle = {
  destroy: () => void;
};

type Segment =
  | { kind: "dwell"; station: number; from: number; to: number }
  | { kind: "flight"; leg: number; from: number; to: number };

const DESKTOP = "(min-width: 64rem)";

/**
 * Scroll-driven route: draws the path, rides the marker along it, pans and
 * zooms the "camera" (the world box) after the marker, cycles the milestone
 * cards and lights up the active station. One ScrollTrigger, `scrub: 0.8`,
 * snapping to milestone labels; the stage is `position: sticky` (CSS), not
 * pinned. Rebuilt only when the viewport width changes.
 *
 * Scroll time is split into dwell windows (one step per milestone) and two
 * fixed-length flight legs. Path progress for the stations is measured from
 * the real path length, so the marker always lands on the dot.
 */
export async function mountRoute(
  root: HTMLElement,
  motion: Motion,
  milestones: RouteMilestone[],
  /** Checked after the async plugin load: a mount that was cleaned up meanwhile must never build */
  isCancelled: () => boolean = () => false,
): Promise<RouteHandle | null> {
  const { gsap, ScrollTrigger, fine } = motion;
  const section = root.closest<HTMLElement>("[data-variant]");
  const stage = root.querySelector<HTMLElement>('[data-journey="stage"]');
  const viewport = root.querySelector<HTMLElement>('[data-journey="viewport"]');
  const world = root.querySelector<HTMLElement>('[data-journey="world"]');
  if (!section || !stage || !viewport || !world || milestones.length === 0) return null;

  const { MotionPathPlugin } = await import("gsap/MotionPathPlugin");
  if (isCancelled()) return null;
  gsap.registerPlugin(MotionPathPlugin);

  let ctx: ReturnType<typeof gsap.context> | null = null;
  let width = window.innerWidth;
  let destroyed = false;
  let center = { x: 0, y: 0 };
  let onResize: (() => void) | null = null;

  const measureCenter = () => {
    center = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
  };

  const build = () => {
    const orient: Orient = window.matchMedia(DESKTOP).matches ? "h" : "v";
    const geo = geometries[orient];
    const svg = root.querySelector<SVGSVGElement>(`[data-journey="svg"][data-orient="${orient}"]`);
    const route = svg?.querySelector<SVGPathElement>('[data-journey="route"]');
    const motionPath = svg?.querySelector<SVGPathElement>('[data-journey="motion"]');
    const marker = svg?.querySelector<SVGGElement>('[data-journey="marker"]');
    if (!svg || !route || !motionPath || !marker) return;

    const dots = Array.from(svg.querySelectorAll<SVGGElement>('[data-journey="dot"]'));
    const paintings = Array.from(root.querySelectorAll<HTMLElement>('[data-journey="painting"]'));
    const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-journey="group"]'));
    const names = Array.from(root.querySelectorAll<HTMLElement>('[data-journey="station"]'));
    const cards = milestones
      .map((m) => root.querySelector<HTMLElement>(`[data-journey="card"][data-id="${m.id}"]`))
      .filter((c): c is HTMLElement => c !== null);
    const counter = root.querySelector<HTMLElement>('[data-journey="counter"]');

    section.dataset.motion = "true";
    measureCenter();

    ctx = gsap.context(() => {
      // ---- measure the path ------------------------------------------------
      const length = route.getTotalLength();
      const raw = MotionPathPlugin.cacheRawPathMeasurements(MotionPathPlugin.getRawPath(motionPath));
      const stationT = geo.stations.map((s, i) => {
        if (i === 0) return 0;
        if (i === geo.stations.length - 1) return 1;
        return nearestProgress(raw, s, MotionPathPlugin);
      });

      // ---- scroll time budget ---------------------------------------------
      const perStation = geo.stations.map((s) => milestones.filter((m) => m.at === s.id).length);
      const legs = geo.stations.length - 1;
      const unit = 1 / (milestones.length + legs * 0.6);
      const flight = unit * 0.6;
      const segments: Segment[] = [];
      const labels: { id: string; at: number; station: number }[] = [];
      let cursor = 0;
      perStation.forEach((count, i) => {
        const from = cursor;
        const to = from + count * unit;
        segments.push({ kind: "dwell", station: i, from, to });
        milestones
          .filter((m) => m.at === geo.stations[i].id)
          .forEach((m, k) => labels.push({ id: m.id, at: from + k * unit, station: i }));
        cursor = to;
        if (i < legs) {
          segments.push({ kind: "flight", leg: i, from: cursor, to: cursor + flight });
          cursor += flight;
        }
      });

      // ---- initial state (undo the SSR "finished" state) ------------------
      gsap.set(route, { strokeDasharray: length, strokeDashoffset: length });
      gsap.set(cards, { autoAlpha: 0, y: 24 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0 });
      gsap.set(world, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });

      const dwellZoom = Number(getComputedStyle(section).getPropertyValue("--zoom-dwell")) || 1.3;
      const cam = { zoom: dwellZoom, weight: 1 };
      const toX = gsap.quickTo(world, "x", { duration: 0.9, ease: "expo" });
      const toY = gsap.quickTo(world, "y", { duration: 0.9, ease: "expo" });
      // `scale` is compound (scaleX + scaleY), which quickTo cannot reset; drive the halves.
      const toScaleX = gsap.quickTo(world, "scaleX", { duration: 0.9, ease: "expo" });
      const toScaleY = gsap.quickTo(world, "scaleY", { duration: 0.9, ease: "expo" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
          snap: {
            snapTo: "labelsDirectional",
            duration: { min: 0.2, max: 0.6 },
            delay: 0.05,
            ease: "power2",
          },
        },
      });

      labels.forEach((l) => tl.addLabel(l.id, l.at));

      // The marker group's origin is the dot; the wanderer stands above it, so
      // the bounding-box centre is not the origin. Align the origin to the path.
      const bb = marker.getBBox();
      const alignOrigin: [number, number] = [bb.width ? -bb.x / bb.width : 0.5, bb.height ? -bb.y / bb.height : 0.5];

      // ---- flights: marker rides the path, route draws, camera pulls out ----
      segments.forEach((seg) => {
        if (seg.kind !== "flight") return;
        const a = stationT[seg.leg];
        const b = stationT[seg.leg + 1];
        const dur = seg.to - seg.from;
        tl.to(
          marker,
          {
            duration: dur,
            immediateRender: seg.leg === 0,
            motionPath: { path: motionPath, align: motionPath, alignOrigin, start: a, end: b },
          },
          seg.from,
        );
        tl.to(route, { strokeDashoffset: length * (1 - b), duration: dur }, seg.from);
        tl.to(cam, { zoom: 1, weight: 0, duration: dur / 2, ease: "power1.inOut" }, seg.from);
        tl.to(cam, { zoom: dwellZoom, weight: 1, duration: dur / 2, ease: "power1.inOut" }, seg.from + dur / 2);
      });

      // ---- cards: in before their label, out before the next one ------------
      labels.forEach((l, i) => {
        const card = cards[i];
        if (!card) return;
        if (i > 0) {
          tl.fromTo(card, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: unit * 0.25, ease: "power2.out" }, l.at - unit * 0.3);
        }
        const next = labels[i + 1];
        if (!next) return;
        const leavesStation = next.station !== l.station;
        const outAt = leavesStation ? l.at + unit * 0.75 : next.at - unit * 0.5;
        tl.to(card, { autoAlpha: 0, y: -16, duration: unit * 0.18, ease: "power2.in" }, outAt);
      });

      // ---- camera + active state, every scrubbed frame ----------------------
      let first = true;
      let activeId = "";
      let activeStation = -1;
      const update = () => {
        const p = tl.progress();
        const seg = segments.find((s) => p >= s.from && p <= s.to) ?? segments[segments.length - 1];
        const stationIdx =
          seg.kind === "dwell" ? seg.station : p < (seg.from + seg.to) / 2 ? seg.leg : seg.leg + 1;
        const focus = geo.stations[stationIdx].focus;

        const mx = Number(gsap.getProperty(marker, "x")) || 0;
        const my = Number(gsap.getProperty(marker, "y")) || 0;
        const k = world.clientWidth / geo.viewBox.w;
        const fx = (mx + focus.dx * cam.weight) * k;
        const fy = (my + focus.dy * cam.weight) * k;
        const s = cam.zoom;
        const x = center.x - fx * s;
        const y = center.y - fy * s;
        if (first) {
          first = false;
          gsap.set(world, { x, y, scale: s });
        } else {
          toX(x);
          toY(y);
          toScaleX(s);
          toScaleY(s);
        }

        if (stationIdx !== activeStation) {
          activeStation = stationIdx;
          const id: StationId = geo.stations[stationIdx].id;
          setActive(dots, id);
          setActive(paintings, id);
          setActive(groups, id);
          setActive(names, id);
        }

        let current = labels[0];
        for (const l of labels) if (l.at <= p + 0.0005) current = l;
        if (current.id !== activeId) {
          activeId = current.id;
          cards.forEach((c) => {
            if (c.dataset.id === activeId) c.setAttribute("aria-current", "step");
            else c.removeAttribute("aria-current");
          });
          if (counter) counter.textContent = pad(labels.indexOf(current) + 1);
        }
      };
      tl.eventCallback("onUpdate", update);
      update();

      // ---- painting tilt on fine pointers ------------------------------------
      if (fine) {
        paintings.forEach((el) => {
          gsap.set(el, { transformPerspective: 900 });
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rx(-py * 10);
            ry(px * 10);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          el.addEventListener("pointermove", move, { passive: true });
          el.addEventListener("pointerleave", leave);
          ctx?.add(() => () => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }
    }, root);
  };

  build();
  ScrollTrigger.refresh();

  const ro = new ResizeObserver(() => {
    if (destroyed) return;
    measureCenter();
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    ctx?.revert();
    build();
    ScrollTrigger.refresh();
  });
  ro.observe(viewport);
  onResize = () => ro.disconnect();

  return {
    destroy: () => {
      destroyed = true;
      onResize?.();
      ctx?.revert();
      ctx = null;
      delete section.dataset.motion;
      [...root.querySelectorAll<HTMLElement>("[data-active]")].forEach((el) => delete el.dataset.active);
      root.querySelectorAll("[aria-current]").forEach((el) => el.removeAttribute("aria-current"));
      ScrollTrigger.refresh();
    },
  };
}

function setActive(els: Element[], id: string) {
  els.forEach((el) => {
    if ((el as HTMLElement | SVGElement).getAttribute("data-id") === id) el.setAttribute("data-active", "true");
    else el.removeAttribute("data-active");
  });
}

/** Path progress (0..1) of the point on `raw` closest to a station dot */
function nearestProgress(raw: unknown, s: StationGeometry, plugin: typeof import("gsap/MotionPathPlugin").MotionPathPlugin): number {
  let best = 0;
  let bestD = Infinity;
  const steps = 800;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pt = plugin.getPositionOnPath(raw as Parameters<typeof plugin.getPositionOnPath>[0], t);
    const d = (pt.x - s.x) ** 2 + (pt.y - s.y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
