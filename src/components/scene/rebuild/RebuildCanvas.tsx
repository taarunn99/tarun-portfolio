"use client";

import { useEffect, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, NormalBlending, PerspectiveCamera, Points, Scene, ShaderMaterial, WebGLRenderer } from "three";
import { yieldToMain } from "@/components/motion/runtime";
import { compileScene } from "@/lib/compile-scene";
import { STORY_SELECTOR, storyProgress } from "@/lib/story-progress";
import { newSite, oldSite, stormSeeds, TILES } from "./layouts";
import { REBUILD_FRAGMENT, REBUILD_VERTEX } from "./shaders";
import styles from "./RebuildScene.module.css";

const FOV = 30;

/** A token colour resolved on `el`, as a three Color. */
function token(el: Element, name: string, fallback: string): Color {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx && value) {
      ctx.fillStyle = "#000";
      ctx.fillStyle = value;
      if (/^(#|rgb)/.test(ctx.fillStyle)) return new Color(ctx.fillStyle);
    }
  } catch {
    // fall through
  }
  return new Color(fallback);
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
 * The lapizblue.com rebuild as 1,200 tiles. The HTML browser frame and
 * captions in RebuildStory are the DOM twin; the tiles sit inside the
 * frame's page box (`[data-page]`) and are driven entirely in the vertex
 * shader from the story progress.
 */
export default function RebuildCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const story = host?.closest<HTMLElement>(STORY_SELECTOR);
    const page = story?.querySelector<HTMLElement>("[data-page]");
    if (!canvas || !host || !story || !page) return;

    let disposed = false;
    const disposers: Array<() => void> = [];
    const onDispose = (fn: () => void) => disposers.push(fn);

    void (async () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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

      const scene = new Scene();
      const camera = new PerspectiveCamera(FOV, 1, 10, 10000);
      const geometry = new BufferGeometry();
      geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(TILES * 3), 3));
      geometry.setAttribute("aSeed", new Float32BufferAttribute(stormSeeds(), 4));

      const colors = [
        token(story, "--line-strong", "#444444").multiplyScalar(0.7),
        token(story, "--brand-midnight", "#001f3f").lerp(token(story, "--muted", "#b4bdc7"), 0.22),
        token(story, "--danger", "#ff6b6b").multiplyScalar(0.7),
        token(story, "--muted", "#b4bdc7").multiplyScalar(0.55),
        token(story, "--aurora-violet", "#6b4fc8"),
        token(story, "--fg", "#ffffff").multiplyScalar(0.88),
        token(story, "--aurora-glow", "#48a89a").lerp(token(story, "--aurora-ice", "#cbefeb"), 0.25),
        token(story, "--accent", "#00d1b2"),
      ];
      const material = new ShaderMaterial({
        vertexShader: REBUILD_VERTEX,
        fragmentShader: REBUILD_FRAGMENT,
        uniforms: {
          uP: { value: 0 },
          uTime: { value: 0 },
          uW: { value: 600 },
          uAspect: { value: 1.6 },
          uCenter: { value: [0, 0] },
          uPx: { value: px },
          uCam: { value: 1000 },
          uColors: { value: colors },
          uAccent: { value: token(story, "--accent", "#00d1b2") },
          uIce: { value: token(story, "--aurora-ice", "#cbefeb") },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        premultipliedAlpha: true,
        blending: NormalBlending,
      });
      const points = new Points(geometry, material);
      points.frustumCulled = false;
      scene.add(points);
      onDispose(() => {
        geometry.dispose();
        material.dispose();
      });
      const u = material.uniforms as Record<string, { value: unknown }>;
      const set = (name: string, value: unknown) => {
        const slot = u[name];
        if (slot) slot.value = value;
      };

      // --- layout: fit both pages into the frame's page box ---------------
      let laidOut = "";
      const layout = () => {
        const s = host.getBoundingClientRect();
        const b = page.getBoundingClientRect();
        if (!s.width || !s.height || !b.width || !b.height) return;
        renderer.setSize(s.width, s.height, false);
        camera.aspect = s.width / s.height;
        const dist = s.height / 2 / Math.tan((FOV * Math.PI) / 360);
        camera.position.set(0, 0, dist);
        camera.updateProjectionMatrix();
        set("uCam", dist);
        set("uW", b.width);
        set("uCenter", [b.left - s.left + b.width / 2 - s.width / 2, s.height / 2 - (b.top - s.top + b.height / 2)]);
        const aspect = b.width / b.height;
        set("uAspect", aspect);

        const narrow = aspect < 1;
        const key = `${narrow}:${aspect.toFixed(2)}`;
        if (key === laidOut) return;
        laidOut = key;
        const before = oldSite(aspect, narrow);
        const after = newSite(aspect, narrow);
        geometry.setAttribute("aOld", new Float32BufferAttribute(before.pos, 2));
        geometry.setAttribute("aOldSize", new Float32BufferAttribute(before.size, 1));
        geometry.setAttribute("aOldRole", new Float32BufferAttribute(before.role, 1));
        geometry.setAttribute("aNew", new Float32BufferAttribute(after.pos, 2));
        geometry.setAttribute("aNewSize", new Float32BufferAttribute(after.size, 1));
        geometry.setAttribute("aNewRole", new Float32BufferAttribute(after.role, 1));
      };
      layout();
      await yieldToMain();
      if (disposed) return;

      let relayout = 0;
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(relayout);
        relayout = window.setTimeout(layout, 120);
      });
      resizeObserver.observe(host);
      onDispose(() => {
        clearTimeout(relayout);
        resizeObserver.disconnect();
      });

      // --- loop ------------------------------------------------------------
      let last = performance.now();
      let elapsed = 0;
      let p = storyProgress(story);
      let running = false;
      let revealed = false;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        elapsed += dt;
        p += (storyProgress(story) - p) * Math.min(1, dt * 6);
        set("uP", p);
        set("uTime", elapsed);
        renderer.render(scene, camera);
        if (!revealed) {
          revealed = true;
          canvas.classList.add(styles.visible);
          story.dataset.tiles = "on";
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
        delete story.dataset.tiles;
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
