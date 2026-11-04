import {
  CanvasTexture,
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { CustomEase } from "gsap/CustomEase";
import { yieldToMain } from "@/components/motion/runtime";
import { ATLAS_CELLS, MEDIA_ORIGIN, MEDIA_SIZE, buildAtlas } from "./atlas";
import { readGridPalette, readMonoFontFamily } from "./css-color";
import { LENS_FRAGMENT, LENS_VERTEX, TILE_FRAGMENT, TILE_VERTEX } from "./shaders";
import type { GridTile } from "./types";

type Gsap = typeof import("gsap").gsap;

export type WorkGridOptions = {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  tiles: readonly GridTile[];
  gsap: Gsap;
  onOpen: (slug: string) => void;
  onReady: () => void;
};

export type WorkGridHandle = {
  dispose: () => void;
};

const FOV = 85;
const Z_REST = 3.43;
const Z_PRESS = 3.83;
const Z_INTRO = 4.4;
const LENS_CURVED = -0.07;
const PIXEL_BUDGET = 8_000_000;
const DRAG_THRESHOLD = 3;
const PARALLAX = 0.07;
const SLOW_FRAME_MS = 22;
const ZOOM_EASE = "workGridZoom";

/**
 * Odd grid side ≥ 11 that covers the widest view (intro camera) and never
 * puts the same tile next to itself across the wrap seam with 12 tiles.
 */
function pickGridSize(aspect: number, tileCount: number): number {
  const visible = 2 * Z_INTRO * Math.tan((FOV * Math.PI) / 360) * aspect;
  let n = Math.max(11, Math.ceil(visible) + 1);
  if (n % 2 === 0) n += 1;
  for (;;) {
    const rowWrap = (n * (n - 1)) % tileCount;
    const colWrap = (n - 1) % tileCount;
    const rowStep = n % tileCount;
    if (rowWrap !== 0 && colWrap !== 0 && rowStep !== 0) return n;
    n += 2;
  }
}

function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

/**
 * Builds the whole scene imperatively. Returns null (silently) when WebGL is
 * unavailable or the atlas cannot be painted — the DOM index is the fallback.
 */
export async function createWorkGrid(o: WorkGridOptions): Promise<WorkGridHandle | null> {
  const { host, canvas, tiles, gsap, onOpen, onReady } = o;
  if (tiles.length === 0) return null;

  // --- Context + renderer ------------------------------------------------
  // The context is created here (not by three) so a refusal stays silent.
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
      preserveDrawingBuffer: false,
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, context: gl, alpha: false, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }

  let disposed = false;
  const palette = readGridPalette();
  renderer.setClearColor(new Color(palette.bg), 1);
  renderer.autoClear = true;

  await yieldToMain();
  if (disposed) return null;

  // --- Atlas ---------------------------------------------------------------
  try {
    await document.fonts.ready;
  } catch {
    /* fonts API unavailable — paint with fallbacks */
  }
  const monoFamily = readMonoFontFamily();
  const maxTex = renderer.capabilities.maxTextureSize;
  const atlas = await buildAtlas({ tiles, palette, monoFamily, size: maxTex >= 4096 ? 4096 : 2048 });
  if (!atlas || disposed) {
    renderer.dispose();
    return null;
  }

  const texture = new CanvasTexture(atlas.canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.flipY = true;
  texture.needsUpdate = true;

  await yieldToMain();
  if (disposed) {
    texture.dispose();
    renderer.dispose();
    return null;
  }

  // --- Scene ---------------------------------------------------------------
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.01, 100);
  camera.position.set(0, 0, Z_INTRO);

  const geometry = new PlaneGeometry(0.998, 0.998);
  const material = new ShaderMaterial({
    vertexShader: TILE_VERTEX,
    fragmentShader: TILE_FRAGMENT,
    uniforms: {
      uAtlas: { value: texture },
      uCells: { value: ATLAS_CELLS },
      uMediaOrigin: { value: new Vector2(MEDIA_ORIGIN[0], MEDIA_ORIGIN[1]) },
      uMediaSize: { value: new Vector2(MEDIA_SIZE[0], MEDIA_SIZE[1]) },
      uActive: { value: [-1, -1] },
      uIntensity: { value: [0, 0] },
      uOpacity: { value: 0 },
      uBg: { value: new Color(palette.bg) },
    },
    depthTest: false,
    depthWrite: false,
  });

  let N = 11;
  let half = 5;
  let mesh: InstancedMesh | null = null;
  const matrix = new Matrix4();

  const buildMesh = (n: number) => {
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.dispose();
    }
    N = n;
    half = (n - 1) / 2;
    const count = n * n;
    const tileAttr = new Float32Array(count);
    const indexAttr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      tileAttr[i] = i % tiles.length;
      indexAttr[i] = i;
    }
    const geo = geometry.clone();
    geo.setAttribute("aTile", new InstancedBufferAttribute(tileAttr, 1));
    geo.setAttribute("aIndex", new InstancedBufferAttribute(indexAttr, 1));
    mesh = new InstancedMesh(geo, material, count);
    mesh.frustumCulled = false;
    scene.add(mesh);
  };

  // --- Lens pass -----------------------------------------------------------
  const lens = { factor: 0 };
  let lensActive = true;
  const renderTarget = new WebGLRenderTarget(2, 2, {
    type: UnsignedByteType,
    colorSpace: SRGBColorSpace,
    depthBuffer: false,
    stencilBuffer: false,
    samples: 4,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: false,
  });
  const lensMaterial = new ShaderMaterial({
    vertexShader: LENS_VERTEX,
    fragmentShader: LENS_FRAGMENT,
    uniforms: {
      tDiffuse: { value: renderTarget.texture },
      uK: { value: 0 },
      uBg: { value: new Color(palette.bg) },
    },
    depthTest: false,
    depthWrite: false,
  });
  const lensScene = new Scene();
  const lensQuad = new Mesh(new PlaneGeometry(2, 2), lensMaterial);
  lensQuad.frustumCulled = false;
  lensScene.add(lensQuad);
  const lensCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // --- State ---------------------------------------------------------------
  const offset = new Vector2(0, 0);
  const velocity = new Vector2(0, 0);
  const dragDelta = new Vector2(0, 0);
  const wheelPending = new Vector2(0, 0);
  const parallax = new Vector2(0, 0);
  const parallaxTarget = new Vector2(0, 0);
  const pointerPx = new Vector2(-1, -1);
  const active = [-1, -1];
  const intensity = [0, 0];
  const intensityTarget = [0, 0];

  let width = 1;
  let height = 1;
  let pressed = false;
  let dragging = false;
  let pointerInside = false;
  let keyboardFocus = false;
  let dirty = true;
  let running = false;
  let ticking = false;
  let introDone = false;
  let opened = false;
  let scrollShift = 0;
  let keyTargetX = 0;
  let keyTargetY = 0;
  let renderedLastTick = false;
  let frameSamples = 0;
  let slowSamples = 0;
  let startedAt = 0;

  // --- Helpers -------------------------------------------------------------
  const worldPerPx = () => (2 * camera.position.z * Math.tan((FOV * Math.PI) / 360)) / height;

  const ray = new Vector3();
  /** Screen px (CSS, inside the host) → world xy on the z=0 plane, through the lens. */
  const screenToWorld = (px: number, py: number, out: Vector2): Vector2 => {
    let u = px / width;
    let v = 1 - py / height;
    if (lensActive) {
      const mx = 2 * (u - 0.5);
      const my = 2 * (v - 0.5);
      const f = 0.88 + lensMaterial.uniforms.uK.value * (mx * mx + my * my);
      u = f * mx * 0.5 + 0.5;
      v = f * my * 0.5 + 0.5;
    }
    ray.set(u * 2 - 1, v * 2 - 1, 0.5).unproject(camera).sub(camera.position).normalize();
    const t = -camera.position.z / ray.z;
    out.set(camera.position.x + ray.x * t, camera.position.y + ray.y * t);
    return out;
  };

  const tmpWorld = new Vector2();
  /** Instance index of the tile under a screen point. */
  const instanceAt = (px: number, py: number): number => {
    const w = screenToWorld(px, py, tmpWorld);
    const qx = w.x - parallax.x - offset.x;
    const qy = w.y - parallax.y - offset.y;
    const c = mod(Math.round(qx) + half, N);
    const r = mod(Math.round(qy) + half, N);
    return r * N + c;
  };

  const setActive = (index: number) => {
    if (index === active[0]) return;
    if (index === active[1]) {
      // Hovering back onto the fading tile: swap slots.
      [active[0], active[1]] = [active[1], active[0]];
      [intensity[0], intensity[1]] = [intensity[1], intensity[0]];
    } else {
      active[1] = active[0];
      intensity[1] = intensity[0];
      active[0] = index;
      intensity[0] = 0;
    }
    intensityTarget[0] = index >= 0 ? 1 : 0;
    intensityTarget[1] = 0;
    host.dataset.cursor = index >= 0 ? "View" : "Drag";
    dirty = true;
  };

  const updateHover = () => {
    if (pressed || !pointerInside || !introDone) {
      if (!keyboardFocus || pressed) setActive(-1);
      return;
    }
    setActive(instanceAt(pointerPx.x, pointerPx.y));
  };

  const markDirty = () => {
    dirty = true;
  };

  const zoomTo = (z: number, duration: number) => {
    gsap.killTweensOf(camera.position);
    gsap.to(camera.position, { z, duration, ease: ZOOM_EASE, onUpdate: markDirty });
  };

  // --- Sizing --------------------------------------------------------------
  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    width = w;
    height = h;
    const passes = lensActive ? 2 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(PIXEL_BUDGET / (w * h * passes)));
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (lensActive) renderTarget.setSize(Math.round(w * dpr), Math.round(h * dpr));
    lensMaterial.uniforms.uK.value = lens.factor * camera.aspect;
    const n = pickGridSize(camera.aspect, tiles.length);
    if (!mesh || n !== N) buildMesh(n);
    dirty = true;
  };

  // --- Frame ---------------------------------------------------------------
  const render = () => {
    if (!mesh) return;
    const m = mesh;
    for (let i = 0; i < N * N; i++) {
      const c = i % N;
      const r = Math.floor(i / N);
      let x = c - half + offset.x;
      let y = r - half + offset.y;
      x -= Math.round(x / N) * N;
      y -= Math.round(y / N) * N;
      matrix.makeTranslation(x, y, 0);
      m.setMatrixAt(i, matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.position.set(parallax.x, parallax.y, 0);

    material.uniforms.uActive.value = active;
    material.uniforms.uIntensity.value = intensity;

    if (lensActive) {
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(lensScene, lensCamera);
    } else {
      renderer.render(scene, camera);
    }
  };

  const dropToLowTier = () => {
    if (!lensActive) return;
    lensActive = false;
    gsap.killTweensOf(lens);
    renderTarget.dispose();
    resize();
  };

  const tick = (time: number, deltaMs: number) => {
    if (!running) return;
    const dt = Math.min(deltaMs / 1000, 0.1);
    let moving = false;

    // Drag / inertia
    if (dragging) {
      offset.add(dragDelta);
      velocity.copy(dragDelta);
      dragDelta.set(0, 0);
      moving = true;
    } else if (velocity.lengthSq() > 1e-7) {
      offset.add(velocity);
      velocity.multiplyScalar(1 - Math.min(Math.max(4 * dt, 0), 1));
      moving = true;
    } else if (velocity.lengthSq() > 0) {
      velocity.set(0, 0);
    }

    // Wheel (eased, no inertia)
    if (wheelPending.lengthSq() > 1e-8) {
      const k = Math.min(1, 10 * dt);
      offset.x += wheelPending.x * k;
      offset.y += wheelPending.y * k;
      wheelPending.multiplyScalar(1 - k);
      moving = true;
    } else if (wheelPending.lengthSq() > 0) {
      wheelPending.set(0, 0);
    }

    // Cursor parallax
    if (parallax.distanceToSquared(parallaxTarget) > 1e-8) {
      parallax.lerp(parallaxTarget, Math.min(1, 6 * dt));
      moving = true;
    }

    // Hover intensities: i += (t − i) · 5 · dt
    for (let s = 0; s < 2; s++) {
      const d = intensityTarget[s] - intensity[s];
      if (Math.abs(d) > 0.002) {
        intensity[s] += d * Math.min(1, 5 * dt);
        moving = true;
      } else if (intensity[s] !== intensityTarget[s]) {
        intensity[s] = intensityTarget[s];
        moving = true;
      }
    }

    if (moving && (dragging || velocity.lengthSq() > 1e-7 || wheelPending.lengthSq() > 1e-8)) updateHover();

    if (!dirty && !moving) {
      renderedLastTick = false;
      return;
    }

    // Frame-time sampling (only across consecutive rendered frames, after warm-up)
    if (renderedLastTick && time - startedAt > 1.5) {
      frameSamples++;
      if (deltaMs > SLOW_FRAME_MS) slowSamples++;
      if (frameSamples >= 60) {
        if (slowSamples >= 30) dropToLowTier();
        frameSamples = 0;
        slowSamples = 0;
      }
    }

    dirty = false;
    render();
    renderedLastTick = true;
  };

  // --- Input ---------------------------------------------------------------
  const localPoint = (e: PointerEvent | MouseEvent) => {
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  let downX = 0;
  let downY = 0;
  let lastX = 0;
  let lastY = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || opened) return;
    const p = localPoint(e);
    pressed = true;
    dragging = false;
    keyboardFocus = false;
    downX = lastX = p.x;
    downY = lastY = p.y;
    velocity.set(0, 0);
    dragDelta.set(0, 0);
    host.setPointerCapture(e.pointerId);
    host.dataset.pressed = "true";
    zoomTo(Z_PRESS, 0.4);
    setActive(-1);
    dirty = true;
  };

  const onPointerMove = (e: PointerEvent) => {
    const p = localPoint(e);
    pointerPx.set(p.x, p.y);
    pointerInside = p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height;
    parallaxTarget.set((p.x / width - 0.5) * PARALLAX, -(p.y / height - 0.5) * PARALLAX);
    keyboardFocus = false;

    if (pressed) {
      if (!dragging && Math.hypot(p.x - downX, p.y - downY) > DRAG_THRESHOLD) dragging = true;
      if (dragging) {
        const s = worldPerPx();
        dragDelta.x += (p.x - lastX) * s;
        dragDelta.y -= (p.y - lastY) * s;
      }
      lastX = p.x;
      lastY = p.y;
    } else {
      updateHover();
    }
    dirty = true;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!pressed) return;
    pressed = false;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    host.dataset.pressed = "false";
    const wasDrag = dragging;
    dragging = false;
    zoomTo(Z_REST, 0.4);
    if (!wasDrag) {
      const p = localPoint(e);
      open(instanceAt(p.x, p.y));
    } else {
      updateHover();
    }
    dirty = true;
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (!pressed) return;
    pressed = false;
    dragging = false;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    host.dataset.pressed = "false";
    zoomTo(Z_REST, 0.4);
    dirty = true;
  };

  const onPointerLeave = () => {
    pointerInside = false;
    parallaxTarget.set(0, 0);
    if (!pressed) setActive(-1);
    dirty = true;
  };

  /**
   * Horizontal wheel/trackpad pans the grid. Vertical wheel keeps scrolling
   * the page (the section is full-height, so trapping it would trap the
   * user); the grid drifts with page scroll instead (see onScroll).
   */
  const onWheel = (e: WheelEvent) => {
    if (opened) return;
    const dx = e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX;
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      wheelPending.x -= dx * worldPerPx();
      dirty = true;
    } else if (e.shiftKey) {
      e.preventDefault();
      wheelPending.y += dy * worldPerPx();
      dirty = true;
    }
  };

  const onScroll = () => {
    const next = window.scrollY * worldPerPx() * 0.35;
    offset.y += next - scrollShift;
    scrollShift = next;
    dirty = true;
  };

  const centreInstance = () => instanceAt(width / 2, height / 2);

  const panByKey = (dx: number, dy: number) => {
    keyTargetX = Math.round(offset.x + dx);
    keyTargetY = Math.round(offset.y + dy);
    gsap.killTweensOf(offset);
    gsap.to(offset, {
      x: keyTargetX,
      y: keyTargetY,
      duration: 0.3,
      ease: "power2.inOut",
      onUpdate: markDirty,
      onComplete: () => {
        keyboardFocus = true;
        setActive(centreInstance());
      },
    });
    dirty = true;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (opened) return;
    switch (e.key) {
      case "ArrowLeft":
        panByKey(1, 0);
        break;
      case "ArrowRight":
        panByKey(-1, 0);
        break;
      case "ArrowUp":
        panByKey(0, -1);
        break;
      case "ArrowDown":
        panByKey(0, 1);
        break;
      case "Enter":
      case " ":
        open(centreInstance());
        break;
      default:
        return;
    }
    e.preventDefault();
    keyboardFocus = true;
  };

  const onFocus = () => {
    if (!pointerInside && introDone) {
      keyboardFocus = true;
      setActive(centreInstance());
    }
  };

  const onBlur = () => {
    keyboardFocus = false;
    if (!pointerInside) setActive(-1);
  };

  const open = (instance: number) => {
    if (opened || instance < 0) return;
    const tile = tiles[instance % tiles.length];
    if (!tile) return;
    opened = true;
    host.dataset.cursor = "Drag";
    gsap.to(material.uniforms.uOpacity, { value: 0.3, duration: 1, ease: "power2.out", onUpdate: markDirty });
    gsap.killTweensOf(camera.position);
    gsap.to(camera.position, { z: camera.position.z + 1, duration: 1, ease: "power2.out", onUpdate: markDirty });
    onOpen(tile.slug);
  };

  // --- Lifecycle -----------------------------------------------------------
  let inView = true;
  const sync = () => {
    const shouldRun = inView && !document.hidden;
    if (shouldRun && !ticking) {
      ticking = true;
      running = true;
      dirty = true;
      renderedLastTick = false;
      gsap.ticker.add(tick);
    } else if (!shouldRun && ticking) {
      ticking = false;
      running = false;
      gsap.ticker.remove(tick);
    }
  };

  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry?.isIntersecting ?? true;
    sync();
  });
  const resizeObserver = new ResizeObserver(resize);

  const onContextLost = (e: Event) => {
    e.preventDefault();
    running = false;
  };
  const onContextRestored = () => {
    material.needsUpdate = true;
    lensMaterial.needsUpdate = true;
    texture.needsUpdate = true;
    running = ticking;
    dirty = true;
  };

  gsap.registerPlugin(CustomEase);
  if (!CustomEase.get(ZOOM_EASE)) CustomEase.create(ZOOM_EASE, ".23,1,.32,1");

  resize();
  resizeObserver.observe(host);
  intersection.observe(host);
  document.addEventListener("visibilitychange", sync);
  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", onPointerUp);
  host.addEventListener("pointercancel", onPointerCancel);
  host.addEventListener("pointerleave", onPointerLeave);
  host.addEventListener("wheel", onWheel, { passive: false });
  host.addEventListener("keydown", onKeyDown);
  host.addEventListener("focus", onFocus);
  host.addEventListener("blur", onBlur);
  window.addEventListener("scroll", onScroll, { passive: true });
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  // --- First frame + intro -------------------------------------------------
  await yieldToMain();
  if (disposed) {
    cleanup();
    return null;
  }
  scrollShift = window.scrollY * worldPerPx() * 0.35;
  offset.y += scrollShift;
  startedAt = gsap.ticker.time;
  render();
  onReady();
  sync();

  gsap.to(material.uniforms.uOpacity, { value: 1, duration: 1, ease: "power2.out", onUpdate: markDirty });
  gsap.to(camera.position, {
    z: Z_REST,
    duration: 1,
    ease: "power2.out",
    onUpdate: markDirty,
    onComplete: () => {
      introDone = true;
      updateHover();
    },
  });
  gsap.to(lens, {
    factor: LENS_CURVED,
    duration: 1,
    ease: "power2.out",
    onUpdate: () => {
      lensMaterial.uniforms.uK.value = lens.factor * camera.aspect;
      dirty = true;
    },
  });

  function cleanup() {
    disposed = true;
    running = false;
    if (ticking) gsap.ticker.remove(tick);
    ticking = false;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(material.uniforms.uOpacity);
    gsap.killTweensOf(lens);
    gsap.killTweensOf(offset);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener("visibilitychange", sync);
    host.removeEventListener("pointerdown", onPointerDown);
    host.removeEventListener("pointermove", onPointerMove);
    host.removeEventListener("pointerup", onPointerUp);
    host.removeEventListener("pointercancel", onPointerCancel);
    host.removeEventListener("pointerleave", onPointerLeave);
    host.removeEventListener("wheel", onWheel);
    host.removeEventListener("keydown", onKeyDown);
    host.removeEventListener("focus", onFocus);
    host.removeEventListener("blur", onBlur);
    window.removeEventListener("scroll", onScroll);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    if (mesh) {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.dispose();
      mesh = null;
    }
    geometry.dispose();
    material.dispose();
    texture.dispose();
    lensQuad.geometry.dispose();
    lensMaterial.dispose();
    renderTarget.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return {
    dispose: () => {
      if (!disposed) cleanup();
    },
  };
}
