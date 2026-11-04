"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  BackSide,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  Fog,
  Line,
  LineDashedMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RepeatWrapping,
  Scene,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import { yieldToMain } from "@/components/motion/runtime";
import {
  fadeEdges,
  loadImageTexture,
  makeDotTexture,
  makeGroundTexture,
  makeSkylineTexture,
  makeSkyTexture,
  makeWandererTexture,
  readPalette,
} from "./textures";
import type { RouteMilestone, RouteStation } from "./types";
import styles from "./JourneyScene.module.css";

type Props = {
  station: RouteStation;
  milestones: RouteMilestone[];
  /** Element whose computed style carries the scene palette (`--sky-*`, tokens) */
  paletteEl: RefObject<HTMLElement | null>;
  onFallback: () => void;
  onReady: () => void;
};

const CAMERA_PATH = [
  new Vector3(0, 1.3, 10),
  new Vector3(1.1, 1.45, 4),
  new Vector3(-1.0, 1.25, -2),
  new Vector3(0.9, 1.4, -8.5),
  new Vector3(-0.3, 1.55, -14.5),
];

/**
 * 2.5D diorama of one city: a backdrop plane (manifest `scene-*` or a
 * procedural sky), a silhouette plane closer to the camera (manifest
 * `layer-*` or a procedural skyline), a foggy ground, drifting dust and a
 * small wanderer ahead of the lens. The camera walks a Catmull-Rom curve
 * as the user scrolls / drags / presses arrow keys; the city's milestones
 * are DOM cards projected from 3D anchors along the way.
 */
export default function DioramaCanvas({ station, milestones, paletteEl, onFallback, onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const cardEls = useRef<(HTMLLIElement | null)[]>([]);
  const api = useRef<{ goTo: (i: number) => void } | null>(null);
  const [active, setActive] = useState(0);

  const onFallbackRef = useRef(onFallback);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onFallbackRef.current = onFallback;
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const host = hostRef.current;
    const palEl = paletteEl.current;
    if (!host || !palEl) return;

    // A fresh canvas per mount: a context we force-lose on cleanup must never
    // be handed to the next renderer (StrictMode remounts, reopened scenes).
    const canvas = document.createElement("canvas");
    canvas.className = styles.canvas;
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);

    let disposed = false;
    const cleanups: (() => void)[] = [() => canvas.remove()];

    void (async () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;

      // Probe for a context ourselves so an unsupported device falls back
      // silently (three logs to the console before it throws).
      const attrs: WebGLContextAttributes = {
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      };
      let gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
      try {
        gl = canvas.getContext("webgl2", attrs) ?? canvas.getContext("webgl", attrs);
      } catch {
        gl = null;
      }
      if (!gl) {
        onFallbackRef.current();
        return;
      }
      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({ canvas, context: gl, ...attrs });
      } catch {
        onFallbackRef.current();
        return;
      }
      cleanups.push(() => {
        renderer.dispose();
        renderer.forceContextLoss();
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

      await yieldToMain();
      if (disposed) return;

      const p = readPalette(palEl);
      const scene = new Scene();
      scene.background = new Color(p.sky0);
      scene.fog = new Fog(new Color(p.sky2), 18, 120);
      const camera = new PerspectiveCamera(50, 1, 0.1, 400);

      const curve = new CatmullRomCurve3(CAMERA_PATH, false, "centripetal", 0.5);
      const textures: Texture[] = [];
      const track = (t: Texture | null) => {
        if (t) textures.push(t);
        return t;
      };

      // ---- backdrop -------------------------------------------------------
      let backdropTex: Texture | null = null;
      let backdropAspect = 16 / 9;
      if (station.image) {
        try {
          backdropTex = track(await loadImageTexture(station.image));
          backdropAspect = station.image.width / station.image.height;
        } catch {
          backdropTex = null;
        }
      }
      if (!backdropTex) {
        backdropTex = track(makeSkyTexture(p));
        backdropAspect = 1.6;
      }
      if (disposed) return;
      // An inside-facing cylinder arc wrapped around the scene, so the camera
      // can yaw without ever seeing an edge. Its painted horizon sits a touch
      // below eye level (the camera walks at y ≈ 1.3).
      const radius = 150;
      const arc = 2.7;
      const bh = (radius * arc) / backdropAspect;
      if (backdropTex) {
        // Seen from inside, u runs right-to-left; flip it so the picture is not mirrored.
        backdropTex.wrapS = RepeatWrapping;
        backdropTex.repeat.x = -1;
      }
      const backdrop = new Mesh(
        new CylinderGeometry(radius, radius, bh, 64, 1, true, Math.PI - arc / 2, arc),
        new MeshBasicMaterial(backdropTex ? { map: backdropTex, fog: false, side: BackSide } : { color: new Color(p.sky1), fog: false, side: BackSide }),
      );
      backdrop.position.set(0, bh * 0.05 + 0.6, 0);
      scene.add(backdrop);

      await yieldToMain();
      if (disposed) return;

      // ---- silhouette layer ------------------------------------------------
      let layerTex: Texture | null = null;
      let layerAspect = 2048 / 768;
      if (station.layer) {
        try {
          layerTex = track(await loadImageTexture(station.layer));
          layerAspect = station.layer.width / station.layer.height;
        } catch {
          layerTex = null;
        }
      }
      if (!layerTex) layerTex = track(makeSkylineTexture(station.id, p));
      if (layerTex) layerTex = track(fadeEdges(layerTex));
      if (disposed) return;
      // The city stands on the horizon, mid-distance, so it grows as we walk;
      // its base sinks under the ground so no straight edge shows.
      const lw = 68;
      const lh = lw / layerAspect;
      const layer = new Mesh(
        new PlaneGeometry(lw, lh),
        new MeshBasicMaterial({ map: layerTex ?? undefined, transparent: true, depthWrite: false, opacity: 0.96 }),
      );
      layer.position.set(0, lh / 2 - 1.6, -62);
      scene.add(layer);

      // ---- ground: ink underfoot, fading out towards the horizon -----------
      const groundTex = track(makeGroundTexture(p));
      const ground = new Mesh(
        new PlaneGeometry(160, 160),
        groundTex
          ? new MeshBasicMaterial({ map: groundTex, transparent: true, depthWrite: false })
          : new MeshBasicMaterial({ color: new Color(p.ink), transparent: true, opacity: 0.6 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -0.4, -40);
      scene.add(ground);

      // ---- milestone anchors + dotted path -------------------------------
      const n = milestones.length;
      // Signposts beside the path; the camera stops a little before each one so it is in view.
      const anchorT = milestones.map((_, i) => (n === 1 ? 0.5 : 0.14 + (0.84 * i) / (n - 1)));
      const stopT = anchorT.map((t) => Math.max(0, t - 0.08));
      const maxT = stopT[n - 1] ?? 1;
      const up = new Vector3(0, 1, 0);
      const anchors = anchorT.map((t, i) => {
        const pt = curve.getPointAt(t);
        const tangent = curve.getTangentAt(t);
        const right = new Vector3().crossVectors(tangent, up).normalize();
        const side = i % 2 === 0 ? -1 : 1;
        return pt.clone().addScaledVector(right, side * 1.2).setY(0.85);
      });
      const pathGeo = new BufferGeometry().setFromPoints(curve.getPoints(220).map((v) => v.clone().setY(-0.3)));
      const pathLine = new Line(
        pathGeo,
        new LineDashedMaterial({ color: new Color(p.accent), dashSize: 0.22, gapSize: 0.16, transparent: true, opacity: 0.85 }),
      );
      pathLine.computeLineDistances();
      scene.add(pathLine);

      // ---- dust ----------------------------------------------------------
      const count = coarse ? 260 : 520;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 18;
        pos[i * 3 + 1] = Math.random() * 4.5 - 0.3;
        pos[i * 3 + 2] = 12 - Math.random() * 32;
      }
      const dustGeo = new BufferGeometry();
      dustGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
      const dotTex = track(makeDotTexture());
      const dust = new Points(
        dustGeo,
        new PointsMaterial({
          color: new Color(p.sun),
          map: dotTex ?? undefined,
          alphaTest: 0.05,
          size: 0.09,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.6,
          depthWrite: false,
        }),
      );
      scene.add(dust);

      // ---- wanderer ------------------------------------------------------
      const wandererTex = track(makeWandererTexture(p));
      const wanderer = new Sprite(new SpriteMaterial({ map: wandererTex ?? undefined, transparent: true, depthWrite: false, fog: false }));
      wanderer.scale.set(0.26, 0.52, 1);
      wanderer.position.set(-0.95, -1.02, -4.2);
      camera.add(wanderer);
      scene.add(camera);

      await yieldToMain();
      if (disposed) return;

      // ---- sizing --------------------------------------------------------
      const size = { w: 1, h: 1 };
      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        size.w = w;
        size.h = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      cleanups.push(() => ro.disconnect());

      // ---- input ---------------------------------------------------------
      const state = { target: 0, progress: 0, pointerX: 0, pointerY: 0, px: 0, py: 0, dragging: false, lastX: 0 };
      // The walk ends at the last signpost, never past it.
      const clamp = (v: number) => Math.min(maxT, Math.max(0, v));
      const goTo = (i: number) => {
        state.target = stopT[Math.min(n - 1, Math.max(0, i))] ?? 0;
      };
      api.current = { goTo };
      cleanups.push(() => {
        api.current = null;
      });

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        state.target = clamp(state.target + d * 0.00035);
      };
      const onPointerMove = (e: PointerEvent) => {
        state.pointerX = (e.clientX / size.w) * 2 - 1;
        state.pointerY = -((e.clientY / size.h) * 2 - 1);
        if (state.dragging) {
          state.target = clamp(state.target - (e.clientX - state.lastX) * 0.0009);
          state.lastX = e.clientX;
        }
      };
      const onPointerDown = (e: PointerEvent) => {
        if ((e.target as Element).closest("a, button")) return;
        state.dragging = true;
        state.lastX = e.clientX;
        host.dataset.dragging = "true";
        host.setPointerCapture(e.pointerId);
      };
      const onPointerUp = (e: PointerEvent) => {
        state.dragging = false;
        delete host.dataset.dragging;
        if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
      };
      const onKey = (e: KeyboardEvent) => {
        const current = nearest(stopT, state.target);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          goTo(current + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          goTo(current - 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          state.target = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          state.target = maxT;
        }
      };
      host.addEventListener("wheel", onWheel, { passive: false });
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerdown", onPointerDown);
      host.addEventListener("pointerup", onPointerUp);
      host.addEventListener("pointercancel", onPointerUp);
      window.addEventListener("keydown", onKey);
      cleanups.push(() => {
        host.removeEventListener("wheel", onWheel);
        host.removeEventListener("pointermove", onPointerMove);
        host.removeEventListener("pointerdown", onPointerDown);
        host.removeEventListener("pointerup", onPointerUp);
        host.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("keydown", onKey);
      });

      // ---- loop ----------------------------------------------------------
      const lookAt = curve.getPointAt(0.06).clone();
      const projected = new Vector3();
      let last = performance.now();
      let elapsed = 0;
      let running = false;
      let revealed = false;
      let activeIdx = -1;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        elapsed += dt;

        const prev = state.progress;
        state.progress += (state.target - state.progress) * (1 - Math.exp(-5 * dt));
        const speed = Math.abs(state.progress - prev) / Math.max(dt, 1e-3);

        state.px += (state.pointerX - state.px) * 0.05;
        state.py += (state.pointerY - state.py) * 0.05;

        const pr = clamp(state.progress);
        const camPos = curve.getPointAt(pr);
        camera.position.set(camPos.x + state.px * 0.3, camPos.y + state.py * 0.15, camPos.z);
        const ahead = curve.getPointAt(Math.min(pr + 0.07, 1));
        lookAt.lerp(ahead, 0.15);
        camera.lookAt(lookAt.x + state.px * 0.9, lookAt.y + state.py * 0.5, lookAt.z);

        layer.position.x = state.px * 1.1;
        backdrop.position.x = state.px * 0.35;
        dust.position.y = Math.sin(elapsed * 0.35) * 0.25;
        dust.rotation.y = elapsed * 0.012;
        wanderer.position.y = -1.02 + Math.sin(elapsed * 7) * 0.01 * Math.min(1, speed * 14);

        camera.updateMatrixWorld();
        anchors.forEach((a, i) => {
          const el = cardEls.current[i];
          if (!el) return;
          projected.copy(a).project(camera);
          const dist = camera.position.distanceTo(a);
          const behind = projected.z > 1 || dist < 1.1;
          if (behind) {
            el.style.opacity = "0";
            return;
          }
          const sx = (projected.x * 0.5 + 0.5) * size.w;
          const sy = (-projected.y * 0.5 + 0.5) * size.h;
          const s = Math.min(1, Math.max(0.4, 3.4 / dist));
          // Only the next few signposts are legible; the rest wait in the haze.
          const fade = Math.min(1, Math.max(0, (10 - dist) / 4.5)) * Math.min(1, (dist - 1.1) / 1.2);
          el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, calc(-100% - 2rem)) scale(${s.toFixed(3)})`;
          el.style.opacity = fade.toFixed(3);
          el.style.zIndex = String(Math.max(1, Math.round(400 - dist * 10)));
        });
        const nearestIdx = nearest(stopT, pr);
        if (nearestIdx !== activeIdx) {
          activeIdx = nearestIdx;
          setActive(nearestIdx);
        }
        if (fillRef.current) fillRef.current.style.setProperty("--p", pr.toFixed(4));

        renderer.render(scene, camera);
        if (!revealed) {
          revealed = true;
          onReadyRef.current();
        }
      };

      const start = () => {
        if (running) return;
        running = true;
        last = performance.now();
        renderer.setAnimationLoop(tick);
      };
      const stop = () => {
        if (!running) return;
        running = false;
        renderer.setAnimationLoop(null);
      };
      const sync = () => {
        if (!document.hidden && !disposed) start();
        else stop();
      };
      document.addEventListener("visibilitychange", sync);
      const onLost = (e: Event) => {
        e.preventDefault();
        stop();
      };
      canvas.addEventListener("webglcontextlost", onLost);
      canvas.addEventListener("webglcontextrestored", sync);
      cleanups.push(() => {
        stop();
        document.removeEventListener("visibilitychange", sync);
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", sync);
        scene.traverse((obj) => {
          const mesh = obj as Mesh;
          mesh.geometry?.dispose?.();
          const mat = mesh.material as { dispose?: () => void } | undefined;
          mat?.dispose?.();
        });
        textures.forEach((t) => t.dispose());
      });
      sync();
    })();

    return () => {
      disposed = true;
      cleanups.reverse().forEach((fn) => fn());
    };
  }, [station, milestones, paletteEl]);

  return (
    <div ref={hostRef} className={styles.diorama} data-cursor="Drag">
      <ol className={styles.sceneCards}>
        {milestones.map((m, i) => (
          <li
            key={m.id}
            ref={(el) => {
              cardEls.current[i] = el;
            }}
            className={styles.sceneCard}
            data-active={i === active ? "true" : "false"}
            aria-current={i === active ? "step" : undefined}
          >
            <time className={styles.cardDate} dateTime={m.date}>
              {m.dateLabel}
            </time>
            <p className={styles.cardTitle}>{m.title}</p>
            {m.subtitle ? <p className={styles.cardSub}>{m.subtitle}</p> : null}
            <p className={styles.cardSummary}>{m.summary}</p>
            {m.href ? (
              <Link href={m.href} className={styles.cardLink} tabIndex={i === active ? 0 : -1}>
                Case study
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
      <p className={styles.hint}>Scroll or drag to walk the path. Arrow keys step.</p>
      <div className={styles.strip} role="group" aria-label="Milestones along the path">
        <span ref={fillRef} className={styles.stripFill} aria-hidden="true" />
        {milestones.map((m, i) => (
          <button
            key={m.id}
            type="button"
            className={styles.tick}
            data-active={i === active ? "true" : "false"}
            aria-pressed={i === active}
            onClick={() => api.current?.goTo(i)}
          >
            {m.dateLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function nearest(ts: number[], v: number): number {
  let idx = 0;
  let best = Infinity;
  ts.forEach((t, i) => {
    const d = Math.abs(t - v);
    if (d < best) {
      best = d;
      idx = i;
    }
  });
  return idx;
}
