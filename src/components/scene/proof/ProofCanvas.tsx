"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  NormalBlending,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { yieldToMain } from "@/components/motion/runtime";
import { compileScene } from "@/lib/compile-scene";
import { STORY_SELECTOR, storyProgress } from "@/lib/story-progress";
import { PROOF_FRAGMENT, PROOF_VERTEX } from "./shaders";
import { particleSeeds, sampleNumber } from "./targets";
import styles from "./ProofScene.module.css";

const SLOTS = 6;
/** Share of each number's scroll window spent holding before it morphs on. */
const HOLD = 0.6;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Morph position (0 to 5) for story progress `p`. Matches ProofStrip.module.css. */
function morphFor(p: number): number {
  const u = p * SLOTS;
  const i = Math.min(Math.floor(u), SLOTS - 1);
  if (i >= SLOTS - 1) return SLOTS - 1;
  return i + smooth(clamp01((u - i - HOLD) / (1 - HOLD)));
}

/** A token colour resolved on `el` (so a scoped theme applies), as hex/rgb. */
function readColor(el: Element, name: string, fallback: string): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  if (!value) return fallback;
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return fallback;
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    const resolved = ctx.fillStyle;
    return /^(#|rgb)/.test(resolved) ? resolved : fallback;
  } catch {
    return fallback;
  }
}

function probeWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    const attrs: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = probe.getContext("webgl2", attrs) ?? probe.getContext("webgl", attrs);
    if (!gl || gl.isContextLost()) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * The proof numbers as particles. The HTML numbers in ProofStrip are the DOM
 * twin and the fallback; once this canvas has drawn a frame it sets
 * `data-particles` on the section and CSS hides the HTML digits (labels stay).
 * Scroll through the pinned section morphs one number into the next; the
 * pointer scatters the particles and they pull back into shape.
 */
export default function ProofCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const stage = host?.parentElement;
    const story = host?.closest<HTMLElement>(STORY_SELECTOR);
    if (!canvas || !host || !stage || !story) return;

    let disposed = false;
    const disposers: Array<() => void> = [];
    const onDispose = (fn: () => void) => disposers.push(fn);

    void (async () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.matchMedia("(max-width: 47.99rem)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const count = coarse || narrow ? 2600 : 6500;

      await document.fonts.ready;
      await yieldToMain();
      if (disposed || !probeWebGL()) return;

      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, failIfMajorPerformanceCaveat: true });
      } catch {
        return;
      }
      onDispose(() => {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer.forceContextLoss();
      });
      const px = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      renderer.setPixelRatio(px);
      renderer.setClearColor(0x000000, 0);

      await yieldToMain();
      if (disposed) return;

      // --- particles -------------------------------------------------------
      const scene = new Scene();
      const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
      geometry.setAttribute("aSeed", new Float32BufferAttribute(particleSeeds(count), 4));

      const bg = new Color(readColor(story, "--bg", "#03070b"));
      const light = bg.r * 0.2126 + bg.g * 0.7152 + bg.b * 0.0722 > 0.5;
      const material = new ShaderMaterial({
        vertexShader: PROOF_VERTEX,
        fragmentShader: PROOF_FRAGMENT,
        uniforms: {
          uF: { value: 0 },
          uForm: { value: 0 },
          uTime: { value: 0 },
          uCenter: { value: [0, 0] },
          uBox: { value: [1, 1] },
          uMouse: { value: [99999, 99999] },
          uMouseOn: { value: 0 },
          uRadius: { value: coarse ? 50 : 60 },
          uSize: { value: coarse || narrow ? 2.6 : 2.3 },
          uPx: { value: px },
          uAccent: { value: new Color(readColor(story, "--accent", "#00d1b2")) },
          uIce: { value: new Color(readColor(story, light ? "--accent" : "--aurora-ice", "#cbefeb")) },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        premultipliedAlpha: true,
        blending: light ? NormalBlending : AdditiveBlending,
      });
      const points = new Points(geometry, material);
      points.frustumCulled = false;
      scene.add(points);
      onDispose(() => {
        geometry.dispose();
        material.dispose();
      });

      const u = material.uniforms;
      const vec2 = (name: string) => u[name]?.value as number[];

      // --- layout: fit every number into the HTML number box -------------
      const values = Array.from(story.querySelectorAll<HTMLElement>("[data-value]")).slice(0, SLOTS);
      const first = values[0];
      if (values.length < SLOTS || !first) return;
      const font = getComputedStyle(first).fontFamily || "ui-monospace, monospace";
      const weight = Number(getComputedStyle(first).fontWeight) || 500;
      let laidOut = "";

      const layout = async () => {
        const s = stage.getBoundingClientRect();
        const b = first.getBoundingClientRect();
        if (!s.width || !s.height || !b.width || !b.height) return;
        renderer.setSize(s.width, s.height, false);
        camera.left = -s.width / 2;
        camera.right = s.width / 2;
        camera.top = s.height / 2;
        camera.bottom = -s.height / 2;
        camera.updateProjectionMatrix();
        const center = vec2("uCenter");
        center[0] = b.left - s.left + b.width / 2 - s.width / 2;
        center[1] = s.height / 2 - (b.top - s.top + b.height / 2);
        const box = vec2("uBox");
        box[0] = b.width;
        box[1] = b.height;

        const key = `${Math.round(b.width)}x${Math.round(b.height)}`;
        if (key === laidOut) return;
        laidOut = key;
        for (let i = 0; i < SLOTS; i++) {
          const text = values[i]?.textContent?.trim() ?? "";
          const pts = sampleNumber(text, { width: b.width, height: b.height }, font, weight, count, 0x9a11 + i * 97);
          geometry.setAttribute(`aT${i}`, new Float32BufferAttribute(pts, 2));
          await yieldToMain();
          if (disposed) return;
        }
      };
      await layout();
      if (disposed) return;

      let relayout = 0;
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(relayout);
        relayout = window.setTimeout(() => void layout(), 120);
      });
      resizeObserver.observe(stage);
      onDispose(() => {
        clearTimeout(relayout);
        resizeObserver.disconnect();
      });

      // --- pointer ---------------------------------------------------------
      const mouse = { x: 99999, y: 99999, on: 0 };
      const onPointer = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const s = stage.getBoundingClientRect();
        const inside = e.clientX >= s.left && e.clientX <= s.right && e.clientY >= s.top && e.clientY <= s.bottom;
        mouse.on = inside ? 1 : 0;
        mouse.x = e.clientX - s.left - s.width / 2;
        mouse.y = s.height / 2 - (e.clientY - s.top);
      };
      const onLeave = () => {
        mouse.on = 0;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      onDispose(() => {
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });

      // --- loop ------------------------------------------------------------
      let last = performance.now();
      let elapsed = 0;
      let f = morphFor(storyProgress(story));
      let form = 0;
      let mx = 99999;
      let my = 99999;
      let on = 0;
      let running = false;
      let revealed = false;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        elapsed += dt;

        const rect = story.getBoundingClientRect();
        const arrive = clamp01((window.innerHeight - rect.top) / (window.innerHeight * 0.85));
        f += (morphFor(storyProgress(story)) - f) * Math.min(1, dt * 7);
        form += (arrive - form) * Math.min(1, dt * 4);

        if (mx > 9999) {
          mx = mouse.x;
          my = mouse.y;
        }
        mx += (mouse.x - mx) * Math.min(1, dt * 10);
        my += (mouse.y - my) * Math.min(1, dt * 10);
        on += (mouse.on - on) * Math.min(1, dt * 5);

        (u.uF as { value: number }).value = f;
        (u.uForm as { value: number }).value = form;
        (u.uTime as { value: number }).value = elapsed;
        (u.uMouseOn as { value: number }).value = on;
        const m = vec2("uMouse");
        m[0] = mx;
        m[1] = my;
        renderer.render(scene, camera);

        if (!revealed) {
          revealed = true;
          canvas.classList.add(styles.visible);
          story.dataset.particles = "on";
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
      onDispose(stop);
      onDispose(() => {
        delete story.dataset.particles;
      });

      let inView = true;
      const sync = () => {
        if (disposed) return;
        if (inView && !document.hidden && !reducedMotion.matches) start();
        else stop();
      };
      const io = new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? true;
        sync();
      });
      io.observe(story);
      onDispose(() => io.disconnect());
      document.addEventListener("visibilitychange", sync);
      reducedMotion.addEventListener("change", sync);
      onDispose(() => {
        document.removeEventListener("visibilitychange", sync);
        reducedMotion.removeEventListener("change", sync);
      });

      const onLost = (event: Event) => {
        event.preventDefault();
        stop();
      };
      canvas.addEventListener("webglcontextlost", onLost);
      canvas.addEventListener("webglcontextrestored", sync);
      onDispose(() => {
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", sync);
      });

      try {
        await compileScene(renderer, scene, camera);
      } catch {
        // compile on first render instead
      }
      await yieldToMain();
      if (disposed) return;
      sync();
    })();

    return () => {
      disposed = true;
      for (let i = disposers.length - 1; i >= 0; i--) disposers[i]?.();
      disposers.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
