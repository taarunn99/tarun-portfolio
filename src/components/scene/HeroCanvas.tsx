"use client";

import { useEffect, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { yieldToMain } from "@/components/motion/runtime";
import { compileScene } from "@/lib/compile-scene";
import { AURORA_FRAGMENT, AURORA_VERTEX } from "./hero/aurora";
import { STORY_SELECTOR, storyProgress } from "@/lib/story-progress";
import styles from "./HeroScene.module.css";

const NARROW_QUERY = "(max-width: 47.99rem)";
/** The aurora is soft light, so it renders at a fraction of CSS size and upscales. */
const BUFFER_SCALE = 0.5;

/**
 * Reads a CSS custom property and normalises it to a hex/rgb string three.js
 * understands. A 2D canvas resolves any CSS colour the browser supports.
 */
function readCssColor(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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
    const attrs: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true, powerPreference: "high-performance" };
    const gl = probe.getContext("webgl2", attrs) ?? probe.getContext("webgl", attrs);
    if (!gl || gl.isContextLost()) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * The hero sky: animated aurora curtains that drift with time and with page
 * scroll. The static CSS aurora in the hero is the DOM twin and the fallback;
 * this canvas fades in over it and sets `data-live` on its host so the CSS
 * version can step back. Init is chunked and every resource is disposed.
 */
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let disposed = false;
    const disposers: Array<() => void> = [];
    const onDispose = (fn: () => void) => disposers.push(fn);

    void (async () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrowQuery = window.matchMedia(NARROW_QUERY);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      // --- Step 1: renderer -------------------------------------------------
      await yieldToMain();
      if (disposed) return;
      if (!probeWebGL()) return;

      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true,
        });
      } catch {
        // No usable WebGL: the CSS aurora stays as the hero sky.
        return;
      }
      onDispose(() => {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer.forceContextLoss();
      });

      renderer.setClearColor(0x000000, 0);
      // soft light upscales cleanly: phones draw it at half of CSS size
      renderer.setPixelRatio(coarse ? 0.5 : Math.min(window.devicePixelRatio || 1, 2) * BUFFER_SCALE);

      await yieldToMain();
      if (disposed) return;

      // --- Step 2: full-screen aurora --------------------------------------
      const scene = new Scene();
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // One triangle that covers the viewport.
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));

      const material = new ShaderMaterial({
        vertexShader: AURORA_VERTEX,
        fragmentShader: AURORA_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uAspect: { value: 1 },
          uNarrow: { value: narrowQuery.matches ? 1 : 0 },
          uAccent: { value: new Color(readCssColor("--accent", "#00d1b2")) },
          uGlow: { value: new Color(readCssColor("--aurora-glow", "#48a89a")) },
          uDeep: { value: new Color(readCssColor("--aurora-deep", "#00524d")) },
          uIce: { value: new Color(readCssColor("--aurora-ice", "#cbefeb")) },
          uViolet: { value: new Color(readCssColor("--aurora-violet", "#6b4fc8")) },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        premultipliedAlpha: true,
      });

      const mesh = new Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);
      onDispose(() => {
        geometry.dispose();
        material.dispose();
      });

      await yieldToMain();
      if (disposed) return;

      const resize = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        material.uniforms.uAspect.value = width / height;
        material.uniforms.uNarrow.value = narrowQuery.matches ? 1 : 0;
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      onDispose(() => resizeObserver.disconnect());

      // --- Scroll: the sky drifts through the pinned hero story, then ------
      // hands over to the fixed page backdrop by fading out at its end.
      const story = host.closest(STORY_SELECTOR);
      let scroll = 0;
      let scrollFade = 1;
      const applyScroll = () => {
        let next: number;
        if (story) {
          const p = storyProgress(story);
          scroll = p * 0.8;
          // the laptop scene fills the viewport from 0.72 (inside the screen)
          next = 1 - clamp01((p - 0.6) / 0.12);
        } else {
          const h = host.clientHeight || 1;
          scroll = window.scrollY / h;
          next = 1 - clamp01((window.scrollY - h * 0.35) / (h * 0.65));
        }
        if (next === scrollFade) return;
        const wasHidden = scrollFade <= 0.01;
        scrollFade = next;
        canvas.style.opacity = next >= 1 ? "" : next.toFixed(3);
        if (wasHidden !== scrollFade <= 0.01) sync();
      };
      window.addEventListener("scroll", applyScroll, { passive: true });
      onDispose(() => {
        window.removeEventListener("scroll", applyScroll);
        canvas.style.opacity = "";
      });

      // --- Render loop -----------------------------------------------------
      let elapsed = 0;
      let last = performance.now();
      let running = false;
      let revealed = false;
      let smoothScroll = 0;
      let frame = 0;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        elapsed += dt;
        // Ease toward the scroll position so the curtains glide, not jump.
        smoothScroll += (scroll - smoothScroll) * Math.min(1, dt * 4);
        // Touch screens: the light drifts slowly, so 30 redraws a second look
        // the same and leave the GPU free for the laptop and the scroll.
        frame++;
        if (coarse && revealed && frame % 2 === 0) return;

        material.uniforms.uTime.value = elapsed * 0.6;
        material.uniforms.uScroll.value = smoothScroll;
        renderer.render(scene, camera);

        if (!revealed) {
          revealed = true;
          canvas.classList.add(styles.visible);
          host.dataset.live = "true";
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
        delete host.dataset.live;
      });

      // Only animate while visible, focused, unfaded and motion is allowed.
      let inView = true;
      function sync() {
        if (disposed) return;
        if (inView && !document.hidden && !reducedMotion.matches && scrollFade > 0.01) start();
        else stop();
      }

      const intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry?.isIntersecting ?? true;
        sync();
      });
      intersectionObserver.observe(host);
      onDispose(() => intersectionObserver.disconnect());

      document.addEventListener("visibilitychange", sync);
      reducedMotion.addEventListener("change", sync);
      onDispose(() => {
        document.removeEventListener("visibilitychange", sync);
        reducedMotion.removeEventListener("change", sync);
      });

      const onContextLost = (event: Event) => {
        event.preventDefault();
        stop();
      };
      const onContextRestored = () => sync();
      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);
      onDispose(() => {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
      });

      // --- Step 3: compile off the first animated frame --------------------
      try {
        await compileScene(renderer, scene, camera);
      } catch {
        // compile on first render instead
      }
      await yieldToMain();
      if (disposed) return;

      applyScroll();
      sync();
    })();

    return () => {
      disposed = true;
      for (let i = disposers.length - 1; i >= 0; i--) disposers[i]();
      disposers.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
