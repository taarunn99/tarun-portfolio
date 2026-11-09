"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { yieldToMain } from "@/components/motion/runtime";
import {
  SKYLINE_WIDTH,
  buildEdges,
  buildSkyline,
  disposeSkyline,
  mulberry32,
  samplePoints,
} from "./hero/skyline";
import { POINT_FRAGMENT, POINT_VERTEX } from "./hero/shaders";
import styles from "./HeroScene.module.css";

const CAMERA_FOV = 40;
const CAMERA_Z = 7;
/** Duration of the noise → skyline resolve, in seconds (expo.out). */
const RESOLVE_SECONDS = 2.4;
const NARROW_QUERY = "(max-width: 47.99rem)";

/**
 * Reads a CSS custom property and normalises it to a hex/rgb string three.js
 * understands (tokens are OKLCH; three's Color parser is not). A 2D canvas
 * resolves any CSS colour the browser supports.
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

function expoOut(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * The hero "signal field": a point cloud that resolves from scattered noise
 * into a wireframe Dubai skyline. Init is chunked (renderer → geometry →
 * sampling → compile) so no single task blocks the main thread, and every
 * resource is tracked so an unmount mid-init still disposes cleanly.
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
      // Yield before touching the canvas: keeps context creation off the
      // mount task, and a strict-mode remount never inherits a force-lost
      // context from the first pass.
      await yieldToMain();
      if (disposed) return;

      // Probe on a throwaway canvas first: three logs its own error when the
      // context is refused, and the fallback must stay silent.
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
        // No usable WebGL — the CSS backdrop is the fallback.
        return;
      }
      onDispose(() => {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer.forceContextLoss();
      });

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

      const scene = new Scene();
      const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50);
      camera.position.set(0, 0, CAMERA_Z);

      const city = new Group();
      scene.add(city);

      await yieldToMain();
      if (disposed) return;

      // --- Step 2: procedural skyline + wireframe ---------------------------
      const groups = buildSkyline();
      onDispose(() => disposeSkyline(groups));

      const edgeGeometry = buildEdges(groups);
      const fgColor = new Color(readCssColor("--fg", "#ffffff"));
      const edgeMaterial = new LineBasicMaterial({
        color: fgColor,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const wireframe = new LineSegments(edgeGeometry, edgeMaterial);
      wireframe.visible = false;
      city.add(wireframe);
      onDispose(() => {
        edgeGeometry.dispose();
        edgeMaterial.dispose();
      });

      await yieldToMain();
      if (disposed) return;

      // --- Step 3: surface sampling ----------------------------------------
      const compact = coarse || narrowQuery.matches;
      const count = compact ? 1800 : 5200;
      const cloud = samplePoints(groups, count, mulberry32(0x1d5b));

      const pointGeometry = new BufferGeometry();
      pointGeometry.setAttribute("position", new Float32BufferAttribute(cloud.position, 3));
      pointGeometry.setAttribute("aNoise", new Float32BufferAttribute(cloud.noise, 3));
      pointGeometry.setAttribute("aScale", new Float32BufferAttribute(cloud.scale, 1));
      pointGeometry.setAttribute("aPhase", new Float32BufferAttribute(cloud.phase, 1));
      pointGeometry.setAttribute("aTint", new Float32BufferAttribute(cloud.tint, 1));
      // Points travel well outside the skyline while unresolved.
      pointGeometry.boundingSphere = null;

      const bg = new Color(readCssColor("--bg", "#001f3f"));
      const lightTheme = bg.r * 0.2126 + bg.g * 0.7152 + bg.b * 0.0722 > 0.5;

      const pointMaterial = new ShaderMaterial({
        vertexShader: POINT_VERTEX,
        fragmentShader: POINT_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uSize: { value: compact ? 19 : 26 },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uAccent: { value: new Color(readCssColor("--accent", "#00d1b2")) },
          uFg: { value: fgColor },
        },
        transparent: true,
        depthWrite: false,
        blending: lightTheme ? NormalBlending : AdditiveBlending,
      });

      const points = new Points(pointGeometry, pointMaterial);
      points.frustumCulled = false;
      city.add(points);
      onDispose(() => {
        pointGeometry.dispose();
        pointMaterial.dispose();
      });

      await yieldToMain();
      if (disposed) return;

      // --- Composition ------------------------------------------------------
      // Horizon sits below the vertical centre; on wide screens the city is
      // pushed to the right third so the hero copy on the left stays clear.
      const layout = (width: number, height: number) => {
        const aspect = width / height;
        const visibleHeight = 2 * CAMERA_Z * Math.tan((CAMERA_FOV * Math.PI) / 360);
        const visibleWidth = visibleHeight * aspect;
        if (narrowQuery.matches) {
          // Portrait: the copy is vertically centred, so the city sits on a
          // horizon in the open band between the nav and the eyebrow.
          const scale = Math.min(0.8, (visibleWidth * 0.9) / 4.8);
          city.scale.setScalar(scale);
          city.position.set(0, visibleHeight * 0.19, 0);
        } else {
          const scale = Math.min(1, (visibleWidth * 0.56) / SKYLINE_WIDTH);
          city.scale.setScalar(scale);
          city.position.set(visibleWidth * 0.24, -visibleHeight * 0.16, 0);
        }
      };

      const resize = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        layout(width, height);
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      onDispose(() => resizeObserver.disconnect());

      // --- Pointer parallax ------------------------------------------------
      const target = { x: 0, y: 0 };
      const pointer = { x: 0, y: 0 };
      const onPointerMove = (event: PointerEvent) => {
        target.x = (event.clientX / window.innerWidth) * 2 - 1;
        target.y = -((event.clientY / window.innerHeight) * 2 - 1);
      };
      if (!coarse) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        onDispose(() => window.removeEventListener("pointermove", onPointerMove));
      }

      // --- Scroll fade -----------------------------------------------------
      let scrollFade = 1;
      const applyScroll = () => {
        const next = 1 - clamp01(window.scrollY / (host.clientHeight * 0.65 || 1));
        if (next === scrollFade) return;
        const wasHidden = scrollFade <= 0.01;
        scrollFade = next;
        host.style.opacity = next >= 1 ? "" : next.toFixed(3);
        if (wasHidden !== scrollFade <= 0.01) sync();
      };
      window.addEventListener("scroll", applyScroll, { passive: true });
      onDispose(() => {
        window.removeEventListener("scroll", applyScroll);
        host.style.opacity = "";
      });

      // --- Render loop -----------------------------------------------------
      let elapsed = 0;
      let last = performance.now();
      let running = false;
      let revealed = false;

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        elapsed += dt;

        const progress = expoOut(Math.min(elapsed / RESOLVE_SECONDS, 1));
        pointMaterial.uniforms.uTime.value = elapsed;
        pointMaterial.uniforms.uProgress.value = progress;

        const wireIn = clamp01((progress - 0.6) / 0.4);
        wireframe.visible = wireIn > 0;
        edgeMaterial.opacity = wireIn * wireIn * 0.1;

        if (coarse) {
          target.x = Math.sin(elapsed * 0.22) * 0.5;
          target.y = Math.cos(elapsed * 0.17) * 0.3;
        }
        pointer.x += (target.x - pointer.x) * 0.05;
        pointer.y += (target.y - pointer.y) * 0.05;
        camera.position.x = pointer.x * 0.5;
        camera.position.y = pointer.y * 0.35;
        camera.lookAt(0, 0, 0);
        city.rotation.y = pointer.x * 0.1;

        renderer.render(scene, camera);

        if (!revealed) {
          revealed = true;
          canvas.classList.add(styles.visible);
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

      // --- Step 4: compile shaders off the first animated frame -----------
      renderer.compile(scene, camera);
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
