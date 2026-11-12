import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  AmbientLight,
  Group,
  ImageBitmapLoader,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TubeGeometry,
  Vector3,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";

/**
 * The laptop's wallpaper and the journey stage: a real 3D Earth (NASA Blue
 * Marble, public domain) with generated clouds, an atmosphere glow and a
 * starfield. Rendered into the laptop screen (a render target) and, once the
 * camera has dived through the screen, straight to the canvas with the exact
 * same camera so the hand-over is invisible.
 *
 * Every Earth material is `toneMapped: false` so both paths match pixel for
 * pixel.
 */

const DEG = Math.PI / 180;
export const EARTH_FOV = 30;

/** Unit-sphere position of a lat/lng, matching three's SphereGeometry UVs. */
export function latLngToVec(lat: number, lng: number, r = 1): Vector3 {
  const phi = (lng + 180) * DEG;
  const th = lat * DEG;
  return new Vector3(-Math.cos(phi) * Math.cos(th) * r, Math.sin(th) * r, Math.sin(phi) * Math.cos(th) * r);
}

/** Great-circle interpolation between two lat/lngs (t 0 to 1). */
export function slerpLatLng(a: { lat: number; lng: number }, b: { lat: number; lng: number }, t: number) {
  const va = latLngToVec(a.lat, a.lng);
  const vb = latLngToVec(b.lat, b.lng);
  const omega = Math.acos(Math.min(1, Math.max(-1, va.dot(vb))));
  if (omega < 1e-5) return { lat: a.lat, lng: a.lng };
  const s = Math.sin(omega);
  const v = va.multiplyScalar(Math.sin((1 - t) * omega) / s).add(vb.multiplyScalar(Math.sin(t * omega) / s));
  let lng = Math.atan2(v.z, -v.x) / DEG - 180;
  if (lng < -180) lng += 360;
  return { lat: Math.asin(Math.max(-1, Math.min(1, v.y))) / DEG, lng };
}

const NOISE = /* glsl */ `
  // 3D value noise + fbm, cheap and smooth enough for clouds
  float h3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p); vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(h3(i), h3(i + vec3(1,0,0)), u.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), u.x), u.y),
      mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), u.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), u.x), u.y),
      u.z);
  }
  float fbm3(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * n3(p); p *= 2.07; a *= 0.5; } return v; }
`;

export type Stop = { id: string; lat: number; lng: number };

export type Earth = {
  scene: Scene;
  camera: PerspectiveCamera;
  /** point the camera at a lat/lng from `dist` Earth radii away */
  view: (lat: number, lng: number, dist: number) => void;
  /** 0 to 1 draw progress of each route leg */
  setLegs: (progress: number[]) => void;
  /** which stop markers are lit (0 to 1 each) */
  setStops: (lit: number[]) => void;
  /** world position of a stop, for projecting DOM labels */
  stopWorld: (i: number, out: Vector3) => Vector3;
  /** true when a stop faces the camera */
  stopVisible: (i: number) => boolean;
  update: (seconds: number) => void;
  renderTo: (renderer: WebGLRenderer, target: WebGLRenderTarget | null) => void;
  dispose: () => void;
};

export function buildEarth(opts: { textureUrl: string; accent: string; stops: Stop[]; lite?: boolean }): Earth {
  // phones: lighter spheres; at that size the silhouette reads the same
  const seg = opts.lite ? 0.66 : 1;
  const sg = (r: number, w: number, h: number) => new SphereGeometry(r, Math.round(w * seg), Math.round(h * seg));
  const disposables: Array<{ dispose: () => void }> = [];
  const keep = <T extends { dispose: () => void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const scene = new Scene();
  scene.background = new Color("#000000");
  const camera = new PerspectiveCamera(EARTH_FOV, 1.5, 0.01, 200);

  // light fixed to the camera's world: lit from front left, dark limb bottom right
  const sun = new DirectionalLight("#ffffff", 2.4);
  sun.position.set(-2.2, 1.4, 2.6);
  scene.add(sun, new AmbientLight("#ffffff", 0.18));

  // tilt (latitude) outside, spin (longitude) inside
  const tilt = new Group();
  const spin = new Group();
  tilt.add(spin);
  scene.add(tilt);

  // --- surface ---------------------------------------------------------------
  const surfaceMat = keep(new MeshStandardMaterial({ color: "#1d3b63", roughness: 0.95, metalness: 0, toneMapped: false }));
  const surface = new Mesh(keep(sg(1, 128, 96)), surfaceMat);
  spin.add(surface);

  let texture: Texture | null = null;
  const loader = new ImageBitmapLoader();
  loader.setOptions({ imageOrientation: "flipY" });
  loader.load(opts.textureUrl, (bitmap) => {
    texture = new Texture(bitmap);
    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    surfaceMat.map = texture;
    surfaceMat.color.set("#ffffff");
    surfaceMat.needsUpdate = true;
  });

  // --- clouds (generated once, drifting slowly) -----------------------------
  // The cloud field is 3D noise, which is far too costly to evaluate per pixel
  // every frame on a phone. It is baked once into an equirectangular map on
  // the GPU (same UV layout as SphereGeometry, so no seam) and the cloud
  // sphere just turns slowly.
  const cloudMap = keep(new WebGLRenderTarget(1024, 512, { depthBuffer: false, magFilter: LinearFilter, minFilter: LinearFilter }));
  cloudMap.texture.wrapS = RepeatWrapping;
  const bakeMat = keep(
    new ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        ${NOISE}
        void main() {
          float phi = vUv.x * 6.28318530718;
          float theta = (1.0 - vUv.y) * 3.14159265359;
          vec3 pos = vec3(-cos(phi) * sin(theta), cos(theta), sin(phi) * sin(theta)) * 1.008;
          vec3 p = pos * 3.6;
          float band = 1.0 - smoothstep(0.55, 0.95, abs(pos.y));
          float c = fbm3(p + vec3(n3(p * 2.3)) * 0.9);
          float a = smoothstep(0.6, 0.84, c) * (0.4 + 0.4 * band);
          gl_FragColor = vec4(a, a, a, 1.0);
        }`,
      depthTest: false,
      depthWrite: false,
    }),
  );
  const bakeScene = new Scene();
  const bakeQuad = new Mesh(keep(new PlaneGeometry(2, 2)), bakeMat);
  bakeQuad.frustumCulled = false;
  bakeScene.add(bakeQuad);
  const bakeCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  let baked = false;
  const bake = (renderer: WebGLRenderer) => {
    if (baked) return;
    baked = true;
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(cloudMap);
    renderer.render(bakeScene, bakeCamera);
    renderer.setRenderTarget(prev);
  };

  const cloudMat = keep(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: { uMap: { value: cloudMap.texture }, uSun: { value: new Vector3() } },
      vertexShader: /* glsl */ `
        varying vec2 vUv; varying vec3 vNormalW;
        void main() {
          vUv = uv;
          vNormalW = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; uniform vec3 uSun;
        varying vec2 vUv; varying vec3 vNormalW;
        void main() {
          float a = texture2D(uMap, vUv).r;
          float light = clamp(dot(normalize(vNormalW), normalize(uSun)) * 0.9 + 0.25, 0.08, 1.0);
          gl_FragColor = vec4(vec3(light), a * 0.85);
        }`,
    }),
  );
  const clouds = new Mesh(keep(sg(1.008, 96, 72)), cloudMat);
  spin.add(clouds);

  // --- atmosphere: halo outside the limb, haze on it ------------------------
  const halo = new Mesh(
    keep(sg(1.14, 64, 48)),
    keep(
      new ShaderMaterial({
        side: BackSide,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            // back faces: -dot is 0 at the halo's edge and ~0.48 at the
            // planet's limb, so the glow peaks at the limb and fades to nothing
            float i = pow(smoothstep(0.0, 0.5, -dot(vN, vV)), 2.2) * 0.85;
            gl_FragColor = vec4(vec3(0.33, 0.62, 1.0) * i, i);
          }`,
      }),
    ),
  );
  scene.add(halo);
  const haze = new Mesh(
    keep(sg(1.012, 96, 72)),
    keep(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        toneMapped: false,
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vN; varying vec3 vV;
          void main() {
            float f = pow(1.0 - clamp(dot(vN, vV), 0.0, 1.0), 2.6);
            gl_FragColor = vec4(vec3(0.45, 0.7, 1.0) * f * 0.9, f);
          }`,
      }),
    ),
  );
  scene.add(haze);

  // --- stars ----------------------------------------------------------------
  {
    const n = 1400;
    const pos = new Float32Array(n * 3);
    let seed = 0x5eed;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      pos.set([r * Math.cos(a) * 60, u * 60, r * Math.sin(a) * 60], i * 3);
    }
    const g = keep(new BufferGeometry());
    g.setAttribute("position", new BufferAttribute(pos, 3));
    scene.add(new Points(g, keep(new PointsMaterial({ color: "#ffffff", size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.75, toneMapped: false }))));
  }

  // --- route legs and stop markers ------------------------------------------
  const accent = new Color(opts.accent);
  const legGeos: TubeGeometry[] = [];
  for (let i = 0; i < opts.stops.length - 1; i++) {
    const a = opts.stops[i];
    const b = opts.stops[i + 1];
    if (!a || !b) continue;
    const va = latLngToVec(a.lat, a.lng);
    const vb = latLngToVec(b.lat, b.lng);
    const omega = Math.acos(va.dot(vb));
    const pts: Vector3[] = [];
    for (let s = 0; s <= 48; s++) {
      const t = s / 48;
      const v = va
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega) / Math.sin(omega))
        .add(vb.clone().multiplyScalar(Math.sin(t * omega) / Math.sin(omega)));
      pts.push(v.multiplyScalar(1.01 + Math.sin(Math.PI * t) * omega * 0.22));
    }
    const geo = keep(new TubeGeometry(new CatmullRomCurve3(pts), 160, 0.0035, 8, false));
    geo.setDrawRange(0, 0);
    legGeos.push(geo);
    spin.add(new Mesh(geo, keep(new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.95, blending: AdditiveBlending, toneMapped: false }))));
  }

  const markers = opts.stops.map((s) => {
    const group = new Group();
    const at = latLngToVec(s.lat, s.lng, 1.004);
    group.position.copy(at);
    group.lookAt(at.clone().multiplyScalar(2));
    const dotMat = keep(new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, toneMapped: false }));
    const ringMat = keep(new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, side: DoubleSide, toneMapped: false }));
    const dot = new Mesh(keep(new SphereGeometry(0.006, 16, 12)), dotMat);
    const ring = new Mesh(keep(new RingGeometry(0.011, 0.014, 40)), ringMat);
    group.add(dot, ring);
    spin.add(group);
    return { group, ring, dotMat, ringMat, lit: 0 };
  });

  const scratch = new Vector3();

  return {
    scene,
    camera,
    view: (lat, lng, dist) => {
      const v = latLngToVec(0, lng);
      spin.rotation.y = -Math.atan2(v.x, v.z);
      tilt.rotation.x = lat * DEG;
      camera.position.set(0, 0, dist);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
    },
    setLegs: (progress) => {
      legGeos.forEach((g, i) => {
        const count = g.index ? g.index.count : 0;
        g.setDrawRange(0, Math.floor(count * Math.min(1, Math.max(0, progress[i] ?? 0)) / 6) * 6);
      });
    },
    setStops: (lit) => {
      markers.forEach((m, i) => {
        m.lit = lit[i] ?? 0;
        m.dotMat.opacity = m.lit;
      });
    },
    stopWorld: (i, out) => {
      const m = markers[i];
      if (!m) return out.set(0, 0, 0);
      return m.group.getWorldPosition(out);
    },
    stopVisible: (i) => {
      const m = markers[i];
      if (!m) return false;
      m.group.getWorldPosition(scratch);
      // facing the camera: surface normal points towards it
      return scratch.clone().normalize().dot(camera.position.clone().sub(scratch).normalize()) > 0.15;
    },
    update: (seconds) => {
      clouds.rotation.y = seconds * 0.003;
      (cloudMat.uniforms.uSun.value as Vector3).copy(sun.position);
      for (const m of markers) {
        const pulse = (seconds * 0.8) % 1;
        m.ring.scale.setScalar(1 + pulse * 2.2);
        m.ringMat.opacity = m.lit * (1 - pulse) * 0.9;
      }
    },
    renderTo: (renderer, target) => {
      bake(renderer);
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 1);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
      texture?.dispose();
      const t = texture as unknown as { image?: ImageBitmap } | null;
      t?.image?.close?.();
    },
  };
}
