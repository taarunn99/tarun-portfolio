"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DirectionalLight,
  Matrix4,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { yieldToMain } from "@/components/motion/runtime";
import { readCssColor } from "@/components/scene/work-grid/css-color";
import { waypoints } from "@/content/journey";
import { STORY_SELECTOR, storyProgress } from "@/lib/story-progress";
import { buildLaptop, D, DECK_TOP, LID_OPEN, SCREEN_ASPECT, SCREEN_CENTER, SCREEN_H, SCREEN_W, W } from "./model";
import { buildEarth, slerpLatLng } from "./earth";
import { LAYER_IDS, buildLayers, type LayerId } from "./layers";
import {
  WALLPAPER,
  clamp01,
  easeOutCubic,
  layerAmount,
  frameFor,
  journeyState,
  journeyT,
  lidAmount,
  liftAmount,
  mix,
  moveAmount,
  spinYaw,
  stackAmount,
  zoomAmount,
} from "./choreography";
import styles from "./LaptopCanvas.module.css";

const NARROW_QUERY = "(max-width: 59.99rem)";
const FOV = 30;
/** height of the open lid above the deck, for framing */
const LID_RISE = 21;
/** start slightly turned so the first view has depth */
const BASE_YAW = -0.32;

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
 * The hero story in one canvas.
 *
 * 1. A laptop opens on arrival. Its wallpaper is a live 3D Earth (rendered
 *    into the screen through a render target).
 * 2. Scrolling springs it up, takes it apart layer by layer and turns it once;
 *    caption heights are written back to the DOM (`--cy` on `[data-anchor]`).
 * 3. It snaps back together and the camera dives into the screen. When the
 *    screen exactly covers the viewport, the Earth is drawn straight to the
 *    canvas with the same projection, so the hand-over is seamless.
 * 4. The globe flies Bhopal, Singapore, Dubai, drawing the route; stop labels
 *    are DOM (`[data-stop]`, positioned through `--x`/`--y`/`--o`).
 *
 * All text is HTML (the DOM twin); this canvas is decoration and fails
 * silently.
 */
export default function LaptopCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const story = host?.closest<HTMLElement>(STORY_SELECTOR) ?? null;
    if (!canvas || !host) return;

    let disposed = false;
    const disposers: Array<() => void> = [];
    const onDispose = (fn: () => void) => disposers.push(fn);

    void (async () => {
      await yieldToMain();
      if (disposed || !probeWebGL()) return;

      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrowQuery = window.matchMedia(NARROW_QUERY);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, failIfMajorPerformanceCaveat: true });
      } catch {
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(dpr);
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      onDispose(() => {
        renderer.setAnimationLoop(null);
        renderer.dispose();
        renderer.forceContextLoss();
      });

      await yieldToMain();
      if (disposed) return;

      // --- laptop scene, light, reflections ---------------------------------
      const scene = new Scene();
      const pmrem = new PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const env = pmrem.fromScene(room, 0.04).texture;
      room.dispose();
      pmrem.dispose();
      scene.environment = env;
      scene.environmentIntensity = 0.55;
      onDispose(() => env.dispose());

      const accent = readCssColor("--accent", "#00d1b2");
      scene.add(new AmbientLight("#ffffff", 0.25));
      const key = new DirectionalLight("#ffffff", 1.4);
      key.position.set(30, 50, 40);
      scene.add(key);
      const rim = new DirectionalLight(new Color(accent), 3.2);
      rim.position.set(-40, 30, -45);
      scene.add(rim);
      const fill = new DirectionalLight(new Color(readCssColor("--aurora-glow", "#48a89a")), 1.1);
      fill.position.set(35, -10, -30);
      scene.add(fill);

      await yieldToMain();
      if (disposed) return;

      // --- Earth: the wallpaper and the journey -----------------------------
      const stops = waypoints.map((w) => ({ id: w.id, lat: w.lat, lng: w.lng }));
      const [bhopal, singapore, dubai] = stops;
      if (!bhopal || !singapore || !dubai) return;
      const earth = buildEarth({
        // phones keep the lighter texture (GPU memory); larger screens get detail
        textureUrl: !coarse && window.innerWidth * dpr > 1000 ? "/images/sky/earth-4096.webp" : "/images/sky/earth-2048.webp",
        accent,
        stops,
      });
      onDispose(earth.dispose);

      const screenTarget = new WebGLRenderTarget(1024, Math.round(1024 / SCREEN_ASPECT), { colorSpace: SRGBColorSpace });
      onDispose(() => screenTarget.dispose());
      let targetWidth = 1024;
      const sizeTarget = (px: number) => {
        const w = px > 1500 ? 2048 : px > 900 ? 1536 : 1024;
        if (w === targetWidth) return;
        targetWidth = w;
        screenTarget.setSize(w, Math.round(w / SCREEN_ASPECT));
      };

      await yieldToMain();
      if (disposed) return;

      const laptop = buildLaptop(
        {
          accent,
          glow: readCssColor("--aurora-glow", "#48a89a"),
          deep: readCssColor("--aurora-deep", "#00524d"),
          ice: readCssColor("--aurora-ice", "#cbefeb"),
          night: readCssColor("--aurora-night", "#072928"),
        },
        screenTarget.texture,
      );
      scene.add(laptop.root);
      onDispose(laptop.dispose);

      // the website that peels off the screen; caption sides come from the DOM
      const capEls = story ? Array.from(story.querySelectorAll<HTMLElement>("[data-anchor]")) : [];
      const sides = Object.fromEntries(
        LAYER_IDS.map((id) => [id, capEls.find((el) => el.dataset.anchor === id)?.dataset.side === "right" ? "right" : "left"]),
      ) as Record<LayerId, "left" | "right">;
      const web = buildLayers(
        {
          accent,
          glow: readCssColor("--aurora-glow", "#48a89a"),
          deep: readCssColor("--aurora-deep", "#00524d"),
          ice: readCssColor("--aurora-ice", "#cbefeb"),
          night: readCssColor("--aurora-night", "#072928"),
          midnight: readCssColor("--brand-midnight", "#001f3f"),
          carbon: readCssColor("--brand-carbon", "#2e2e2e"),
        },
        sides,
      );
      laptop.root.add(web.group);
      onDispose(web.dispose);
      const layerById = new Map(web.layers.map((l) => [l.id, l]));

      const camera = new PerspectiveCamera(FOV, 1, 0.5, 600);

      // --- DOM hooks ---------------------------------------------------------
      const captions = capEls.flatMap((el) => {
        const layer = layerById.get(el.dataset.anchor as LayerId);
        return layer ? [{ el, layer }] : [];
      });
      const stopLabels = story ? Array.from(story.querySelectorAll<HTMLElement>("[data-stop]")) : [];
      const scratch = new Vector3();
      const capY = new Float32Array(captions.length);
      let capH: number[] = [];
      let stopW: number[] = [];
      let stopH: number[] = [];
      const measureCaptions = () => {
        capH = captions.map(({ el }) => el.offsetHeight);
        stopW = stopLabels.map((el) => el.offsetWidth);
        stopH = stopLabels.map((el) => el.offsetHeight);
      };
      const stopBox = stopLabels.map(() => ({ x: 0, y: 0, w: 0, h: 0, on: false }));

      // --- sizing ----------------------------------------------------------
      let width = 1;
      let height = 1;
      const resize = () => {
        width = host.clientWidth || 1;
        height = host.clientHeight || 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        measureCaptions();
      };
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      onDispose(() => resizeObserver.disconnect());

      // --- state -----------------------------------------------------------
      let target = story ? storyProgress(story) : 0;
      let p = target;
      let velocity = 0;
      let seconds = 0;
      let last = performance.now();
      let running = false;
      let revealed = false;

      const onScroll = () => {
        if (story) target = storyProgress(story);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onDispose(() => window.removeEventListener("scroll", onScroll));

      const vfov = (FOV * Math.PI) / 180;
      const tanHalf = Math.tan(vfov / 2);
      // scratch vectors for the camera path
      const framePos = new Vector3();
      const frameLook = new Vector3();
      const screenC = new Vector3();
      const screenN = new Vector3();
      const screenU = new Vector3();
      const screenX = new Vector3();
      const headPos = new Vector3();
      const corner = new Vector3();
      const up = new Vector3();
      // layer poses, in the laptop root's space
      const rootInv = new Matrix4();
      const rootQInv = new Quaternion();
      const lidQ = new Quaternion();
      const panelQ = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
      const flatQ = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
      const onScreenQ = new Quaternion();
      const onScreenP = new Vector3();
      const outN = new Vector3();
      const floorP = new Vector3();
      /** the stack: website on top, infrastructure at the bottom */
      const STACK_BASE = 7;
      const STACK_GAP = 5.2;
      const STACK_Z = 1.5;
      const STACK_TOP = STACK_BASE + STACK_GAP * (LAYER_IDS.length - 1) + 2;

      /** Screen centre, outward normal, up and across vectors in world space. */
      const screenBasis = () => {
        laptop.lid.updateWorldMatrix(true, false);
        screenC.set(SCREEN_CENTER.x, SCREEN_CENTER.y, SCREEN_CENTER.z);
        laptop.lid.localToWorld(screenC);
        const e = laptop.lid.matrixWorld.elements;
        screenX.set(e[0] ?? 1, e[1] ?? 0, e[2] ?? 0).normalize();
        screenN.set(-(e[4] ?? 0), -(e[5] ?? 1), -(e[6] ?? 0)).normalize();
        screenU.set(e[8] ?? 0, e[9] ?? 0, e[10] ?? 1).normalize();
      };

      const frame = (dt: number) => {
        // spring towards the scroll position: overshoots a touch and settles
        const k = 70;
        const c = 2 * Math.sqrt(k) * 0.72;
        velocity += ((target - p) * k - velocity * c) * dt;
        p += velocity * dt;
        if (p < 0) p = 0;

        const narrow = narrowQuery.matches;
        const move = moveAmount(p);
        const stack = stackAmount(p);
        const zoom = zoomAmount(p);
        const jt = journeyT(p);
        const direct = zoom >= 0.999;

        // --- laptop pose
        // opens on arrival, or at once if the visitor starts scrolling first
        const lidOpen = Math.max(lidAmount(seconds), easeOutCubic(clamp01(p / 0.06)));
        laptop.lid.rotation.x = LID_OPEN * lidOpen;
        const lift = liftAmount(p) * 3 * (1 - zoom);
        laptop.root.position.y = lift;
        laptop.root.rotation.y = spinYaw(p, BASE_YAW);
        laptop.root.updateMatrixWorld(true);

        // --- the website layers: peel off the screen, arc out towards the
        // viewer, turn flat and settle on their floor of the stack
        screenBasis();
        rootInv.copy(laptop.root.matrixWorld).invert();
        laptop.root.getWorldQuaternion(rootQInv).invert();
        laptop.lid.getWorldQuaternion(lidQ);
        onScreenQ.copy(rootQInv).multiply(lidQ).multiply(panelQ);
        onScreenP.copy(screenC).applyMatrix4(rootInv);
        outN.copy(screenN).applyQuaternion(rootQInv);
        web.layers.forEach((layer, i) => {
          const t = layerAmount(p, i);
          const mesh = layer.mesh;
          if (t <= 0.001) {
            mesh.visible = false;
            return;
          }
          const tc = clamp01(t);
          mesh.visible = true;
          floorP.set(0, STACK_BASE + (LAYER_IDS.length - 1 - i) * STACK_GAP, STACK_Z);
          mesh.position
            .copy(onScreenP)
            .addScaledVector(outN, 0.08 + i * 0.03)
            .lerp(floorP, t)
            .addScaledVector(outN, Math.sin(Math.PI * tc) * 6);
          mesh.quaternion.slerpQuaternions(onScreenQ, flatQ, tc);
          mesh.scale.setScalar(mix(1, 0.86, tc));
          layer.material.opacity = clamp01(t * 3) * 0.97;
        });

        // --- Earth view for this moment
        if (!direct) {
          const drift = Math.sin(seconds * 0.12) * 5;
          earth.view(WALLPAPER.lat, WALLPAPER.lng + drift, WALLPAPER.dist);
        } else {
          const j = journeyState(jt, [bhopal, singapore, dubai], narrow);
          const at = j.along === 0 ? j.from : slerpLatLng(j.from, j.to, j.along);
          // the drift at the hand-over is folded into the first leg
          const drift = Math.sin(seconds * 0.12) * 5 * (1 - clamp01(jt / 0.14));
          earth.view(at.lat, at.lng + (j.from === WALLPAPER ? drift * (1 - j.along) : 0), j.dist);
          earth.setLegs(j.legs);
          earth.setStops(j.lit);
          stopLabels.forEach((el, i) => el.style.setProperty("--o", (j.labels[i] ?? 0).toFixed(3)));
        }
        if (!direct) {
          earth.setLegs([0, 0]);
          earth.setStops([0, 0, 0]);
          for (const el of stopLabels) el.style.setProperty("--o", "0");
        }
        earth.update(seconds);

        // --- laptop camera: framed, blending to head-on with the screen
        const topY = Math.max(DECK_TOP + LID_RISE * lidOpen, mix(0, STACK_TOP, stack));
        const bottomY = 0;
        const stackH = topY - bottomY + 2;
        const stackW = mix(W + 3, Math.hypot(W, D) + 2, Math.min(1, move + stack));
        const f = frameFor(narrow, move, stack);
        const hTan = tanHalf * camera.aspect;
        const dist = Math.max(stackH / (2 * tanHalf * f.fh), stackW / (2 * hTan * f.fw));
        // look down on the stack so each floor's face reads
        const elevation = mix(0.24, 0.52, stack);
        const cy = (topY + bottomY) / 2 + lift;
        framePos.set(0, cy + Math.sin(elevation) * dist, Math.cos(elevation) * dist);
        frameLook.set(0, cy, 0);

        screenBasis();
        // cover fit: the screen fills the viewport, edges just past it
        const cover = Math.min(SCREEN_H / (2 * tanHalf), SCREEN_W / (2 * hTan)) * 0.985;
        headPos.copy(screenC).addScaledVector(screenN, cover);

        camera.position.lerpVectors(framePos, headPos, zoom);
        up.set(0, 1, 0).lerp(screenU, zoom).normalize();
        camera.up.copy(up);
        frameLook.lerp(screenC, zoom);
        camera.lookAt(frameLook);
        camera.setViewOffset(width, height, -f.x * width * (1 - zoom), -f.y * height * (1 - zoom), width, height);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();

        if (!direct) {
          // wallpaper at the resolution the screen is drawn at
          corner.copy(screenC).addScaledVector(screenX, -SCREEN_W / 2).project(camera);
          const leftPx = ((corner.x + 1) / 2) * width;
          corner.copy(screenC).addScaledVector(screenX, SCREEN_W / 2).project(camera);
          const rightPx = ((corner.x + 1) / 2) * width;
          sizeTarget(Math.abs(rightPx - leftPx) * dpr);
          earth.camera.aspect = SCREEN_ASPECT;
          earth.camera.clearViewOffset();
          earth.camera.updateProjectionMatrix();
          earth.renderTo(renderer, screenTarget);
          renderer.setClearColor(0x000000, 0);
          renderer.clear();
          renderer.render(scene, camera);
        } else {
          // the screen's rectangle on the viewport (head-on, so axis-aligned)
          corner.copy(screenC).addScaledVector(screenX, -SCREEN_W / 2).addScaledVector(screenU, SCREEN_H / 2).project(camera);
          const x0 = ((corner.x + 1) / 2) * width;
          const y0 = ((1 - corner.y) / 2) * height;
          corner.copy(screenC).addScaledVector(screenX, SCREEN_W / 2).addScaledVector(screenU, -SCREEN_H / 2).project(camera);
          const x1 = ((corner.x + 1) / 2) * width;
          const y1 = ((1 - corner.y) / 2) * height;
          const rw = Math.abs(x1 - x0);
          const rh = Math.abs(y1 - y0);
          // then ease from "inside the screen" to the full viewport
          const b = clamp01(jt / 0.12);
          const e = b * b * (3 - 2 * b);
          const fullW = mix(rw, width, e);
          const fullH = mix(rh, height, e);
          earth.camera.aspect = fullW / fullH;
          earth.camera.setViewOffset(fullW, fullH, mix(-Math.min(x0, x1), 0, e), mix(-Math.min(y0, y1), 0, e), width, height);
          earth.camera.updateProjectionMatrix();
          earth.renderTo(renderer, null);

          // stop labels sit beside their markers: right of the dot unless that
          // runs off screen, inside the viewport, and pushed apart if they meet
          const overview = jt > 0.86;
          if (story && story.hasAttribute("data-overview") !== overview) {
            story.toggleAttribute("data-overview", overview);
            measureCaptions();
          }
          const margin = 12;
          stopLabels.forEach((el, i) => {
            earth.stopWorld(i, scratch).project(earth.camera);
            const mx = ((scratch.x + 1) / 2) * width;
            const my = ((1 - scratch.y) / 2) * height;
            const w = stopW[i] ?? 200;
            const h = stopH[i] ?? 60;
            let x = mx + 18;
            if (x + w > width - margin) x = mx - 18 - w;
            x = Math.min(Math.max(x, margin), width - w - margin);
            const box = stopBox[i];
            if (box) Object.assign(box, { x, y: my - h / 2, w, h, on: earth.stopVisible(i) });
            if (!earth.stopVisible(i)) el.style.setProperty("--o", "0");
          });
          const order = stopBox.map((b2, i) => ({ b: b2, i })).filter((o) => o.b.on).sort((a, b2) => a.b.y - b2.b.y);
          for (let a = 1; a < order.length; a++) {
            const cur = order[a]?.b;
            if (!cur) continue;
            for (let k2 = 0; k2 < a; k2++) {
              const prev = order[k2]?.b;
              if (!prev) continue;
              const overlapX = cur.x < prev.x + prev.w && prev.x < cur.x + cur.w;
              if (overlapX && cur.y < prev.y + prev.h + 8) cur.y = prev.y + prev.h + 8;
            }
          }
          stopLabels.forEach((el, i) => {
            const box = stopBox[i];
            if (!box) return;
            el.style.setProperty("--x", `${box.x.toFixed(1)}px`);
            el.style.setProperty("--y", `${box.y.toFixed(1)}px`);
          });
        }

        // hand back to the page at the very end
        canvas.style.opacity = p > 0.97 ? clamp01((1 - p) / 0.03).toFixed(3) : "";

        // --- caption heights: beside their part, never overlapping a
        // neighbour on the same side, never under the heading
        if (!narrow && !direct) {
          captions.forEach(({ layer }, i) => {
            scratch.copy(layer.anchor);
            layer.mesh.localToWorld(scratch);
            scratch.project(camera);
            capY[i] = ((1 - scratch.y) / 2) * height;
          });
          for (const side of ["left", "right"]) {
            let floor = height * 0.2;
            const order = captions
              .map((c, i) => ({ i, side: c.el.dataset.side }))
              .filter((c) => c.side === side)
              .sort((a, b2) => (capY[a.i] ?? 0) - (capY[b2.i] ?? 0));
            for (const { i } of order) {
              const half = (capH[i] ?? 120) / 2;
              const y = Math.max(capY[i] ?? 0, floor + half);
              capY[i] = Math.min(y, height - half - 16);
              floor = (capY[i] ?? 0) + half + 18;
            }
          }
          captions.forEach(({ el }, i) => el.style.setProperty("--cy", `${(capY[i] ?? 0).toFixed(1)}px`));
        }
      };

      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        seconds += dt;
        frame(dt);
        if (!revealed) {
          revealed = true;
          canvas.classList.add(styles.visible);
          if (story) story.dataset.tracked = "true";
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
        if (story) delete story.dataset.tracked;
        canvas.style.opacity = "";
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
      io.observe(host);
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

      void document.fonts?.ready.then(() => {
        if (!disposed) measureCaptions();
      });
      renderer.compile(scene, camera);
      renderer.compile(earth.scene, earth.camera);
      await yieldToMain();
      if (disposed) return;
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
