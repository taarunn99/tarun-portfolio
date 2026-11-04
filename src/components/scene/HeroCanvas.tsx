"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  WireframeGeometry,
} from "three";
import styles from "./HeroScene.module.css";

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    float breathe = 1.0 + 0.05 * sin(uTime * 0.5 + aPhase);
    vec4 mvPosition = modelViewMatrix * vec4(position * breathe, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * aScale * uPixelRatio / -mvPosition.z;

    float twinkle = 0.55 + 0.45 * sin(uTime * 0.9 + aPhase * 4.0);
    float depth = smoothstep(-9.0, -3.0, mvPosition.z);
    vAlpha = twinkle * mix(0.2, 1.0, depth);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, a * vAlpha * 0.85);
  }
`;

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

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 6);

    // --- Particle shell -------------------------------------------------
    const count = coarse ? 1400 : 2600;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = Math.PI * 2 * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1.6 + Math.random() ** 2 * 1.0;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = 0.4 + Math.random() * 0.9;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new BufferGeometry();
    particleGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aScale", new Float32BufferAttribute(scales, 1));
    particleGeometry.setAttribute("aPhase", new Float32BufferAttribute(phases, 1));

    const particleMaterial = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: coarse ? 22 : 26 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uColor: { value: new Color(readCssColor("--accent", "#c9f55a")) },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const particles = new Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- Wireframe core -------------------------------------------------
    const icosahedron = new IcosahedronGeometry(1.2, 1);
    const wireGeometry = new WireframeGeometry(icosahedron);
    icosahedron.dispose();

    const wireMaterial = new LineBasicMaterial({
      color: new Color(readCssColor("--fg", "#f5f5f4")),
      transparent: true,
      opacity: 0.12,
    });
    const wireframe = new LineSegments(wireGeometry, wireMaterial);
    scene.add(wireframe);

    // --- Pointer parallax ----------------------------------------------
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    if (!coarse) window.addEventListener("pointermove", onPointerMove, { passive: true });

    // --- Sizing ---------------------------------------------------------
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // --- Render loop ----------------------------------------------------
    let elapsed = 0;
    let last = performance.now();
    let running = false;
    let revealed = false;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed += dt;

      particleMaterial.uniforms.uTime.value = elapsed;
      particles.rotation.y = elapsed * 0.05;
      particles.rotation.x = Math.sin(elapsed * 0.1) * 0.1;
      wireframe.rotation.y = -elapsed * 0.08;
      wireframe.rotation.z = elapsed * 0.04;

      if (coarse) {
        target.x = Math.sin(elapsed * 0.25) * 0.4;
        target.y = Math.cos(elapsed * 0.2) * 0.25;
      }
      pointer.x += (target.x - pointer.x) * 0.04;
      pointer.y += (target.y - pointer.y) * 0.04;
      camera.position.x = pointer.x * 0.5;
      camera.position.y = pointer.y * 0.35;
      camera.lookAt(0, 0, 0);

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

    // Only animate while visible, focused and motion is allowed.
    let inView = true;
    const sync = () => {
      if (inView && !document.hidden && !reducedMotion.matches) start();
      else stop();
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? true;
      sync();
    });
    intersectionObserver.observe(host);

    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      stop();
    };
    const onContextRestored = () => sync();
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    sync();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reducedMotion.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      particleGeometry.dispose();
      particleMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
