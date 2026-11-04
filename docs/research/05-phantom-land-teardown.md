<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

I have everything needed; nothing further to fetch. Below is the full teardown.

---

# phantom.land — Technical Teardown & Reverse-Engineering Spec

Research date: 2026-11-04. Read-only; no files were modified. Everything marked **[bundle]** was verified directly in Phantom's production Next.js chunks (`/_next/static/chunks/...`); **[Codrops]** is from Phantom's own making-of article; **[clone]** is from an unaffiliated open-source recreation whose numbers I cross-checked against the bundle.

## 1. Homepage: structure, stack, assets

### 1.1 SSR HTML (what the server sends)
- `<!DOCTYPE html>` from **Next.js App Router** (React Server Components; `self.__next_f.push` flight data, `data-precedence="next"` CSS, `app/layout`, `app/page`, `app/projects/[uid]`, `app/about/[uid]`, `app/about/layout` chunks). **[bundle]**
- `<title>Phantom Studios — Technology Creative Agency — London and Auckland</title>`; OG/Twitter meta; canonical; two `application/ld+json` blocks (Organization with London address, email, VAT).
- Preconnects: `phantom-land.prismic.io`, `images.prismic.io`, `phantom-land.cdn.prismic.io` (CMS = **Prismic**), `storage.googleapis.com` (video/atlas assets), `use.typekit.net` (fonts), GA4 (`G-G1ZCNTQ3G4`).
- 7 CSS files, 26 JS chunks (~1.9 MB total uncompressed JS on home).
- **No `<canvas>`, `<video>` or `<img>` in the SSR HTML.** The WebGL grid is client-only. What *is* server-rendered is an SEO/noscript-friendly **list view**: `styles_ListViewWrapper`, `styles_ProjectGroup` (grouped by year 2026→2016), `styles_ProjectListItemWrapper` → `styles_ProjectLink` (`/projects/<slug>`), `styles_ProjectTitle` (h3), `styles_FeaturesList` + `styles_Pill` (tags: Experience, ai, 3d, motion, website...), `styles_Client`, `styles_MetaInfo`, plus `Loader_Wrapper / Loader_ProgressBar / Loader_LoaderText`, and a `screen-reader-only` h1. 93 projects. **[bundle]**
- Headings: h1 "Phantom is a technology-led creative agency crafting experiences for global brands."; h2 "PHANTOM STUDIOS®", "TECHNOLOGY CREATIVE", "All projects"; h3 "93 projects" + each project title.
- Nav in markup is minimal (only `/privacy-policy`); real nav is client-rendered: Grid/List toggle (`GridListToggleContainer`), Filters overlay (`work-grid-filters-overlay`, URL-state `?zone=|?feature=|?service=|?client=`), About (`/about/agency`, `/about/approach`), Contact (`/contact`), a sound toggle (`SoundInteractionWrapper`).

### 1.2 Libraries detected **[bundle]**
| Library | Evidence | Role |
|---|---|---|
| Next.js (App Router) + React 19 | `/_next/static/chunks/app/*`, `main-app` | Framework, RSC, routing |
| three.js (r16x, `OutputPass`/AgX tonemapping present) | two three chunks, `ShaderMaterial`, `RawShaderMaterial`, `VideoTexture`, `InstancedMesh`, `EffectComposer`, `RenderPass`, `ShaderPass`, `OutputPass`, `GLTFLoader`, `DRACOLoader` | WebGL |
| @react-three/fiber (+ drei `PerformanceMonitor`, `easing.damp`) | `react-three`, `onDecline → setGraphicsTier(LOW)` | Bridges DOM ↔ WebGL |
| GSAP + ScrollTrigger + CustomEase (+ SplitText per Codrops; they also use a custom split hook) | chunks 5911, c15bf2b0, 4451 | Tweens for WebGL uniforms, camera, audio gain; scroll on inner pages |
| Lenis | chunk 5792 | Smooth scroll on inner pages only |
| Motion (Framer Motion) | chunk 3478 (`prefers-reduced-motion`, layout-animation defaults) | DOM page transitions, parallax, reveal variants |
| Zustand | `(0,s.v)()` store with `transitionIntent`, `graphicsTier`, `workgridState`, `theme`, `caseStudyView` | Global UI state |
| Prismic (`@prismicio/*`, slices) | `slice_type`, `prismic.js` | CMS |
| Web Audio API | `AudioContext`, gain tweens | UI sounds |
| `@phantomstudios/css-components` + SASS (CSS Modules naming `styles_X__hash`) | class names | Styling |
| Not used | barba.js, Lottie, OGL (the "ogl" string match was `google`) | — |

### 1.3 Fonts / tokens / breakpoints **[bundle]**
- **Ballinger Mono** via Adobe Typekit (`gtx3zug.css`; weights 300/400/500/700) — the mono "detail" type (`typography_MonoDetail`).
- **Helvetica Now** self-hosted via `next/font` (`--font-helvetica-bold`) — display/body.
- Tokens: `--color-primary:#000`, `--color-secondary:#fff`, `--margin:24px`, `--radius:48px`, `--overlap-margin` (-55/-80/-140px by breakpoint). Awwwards palette lists `#202020`.
- Breakpoints: 599, **1024**, **1440**, **1920**.
- Easings in CSS: `cubic-bezier(.16,1,.3,1)`, `(.93,-.24,.4,1.17)` (overshoot, used for `translate .7s` on toggles), `(1,.01,.22,1)`, `(0,.462,.362,1)`, `(.81,-.01,0,1)`.
- Canvas CSS: `canvas{position:fixed; inset:0; width:100vw; height:100dvh; background:#000}` with variants `pointer-events:none; touch-action:none`.

## 2. Awards & write-ups

- **Awwwards SOTD 2 June 2025** (7.61) + **Developer Award** (7.64; Animations 8.2, WPO 8.2, Responsive 7.8, Accessibility 6.8). Tags: Infinite Scroll, 3D, Gestures/Interaction. Highlighted elements: Loading Sequence, Work Grid, About, Team, Footer. https://www.awwwards.com/sites/phantom-land · "Work Grid" element tagged *grid, infinite canvas, WebGL, distortion*: https://www.awwwards.com/inspiration/work-grid-phantom-land-1
- **GSAP Site of the Week** (June 2025): "That grid is smooooooth… CustomEase, Three.js, WebGL, React." https://x.com/greensock/status/1930290513665466455
- **Primary source — Phantom's Codrops making-of (30 June 2025)**: "Invisible Forces: The Making of Phantom.land's Interactive Grid and 3D Face Particle System." https://tympanus.net/codrops/2025/06/30/invisible-forces-the-making-of-phantom-lands-interactive-grid-and-3d-face-particle-system/ (Codrops is Cloudflare-gated to fetchers; I read it via a text proxy.) Companion performance piece: "Welcome back to Phantomland" on LinkedIn (linked from the article; I could not fetch LinkedIn).
- Secondary: Refs.Gallery (claims LCP ≈1.3 s desktop, Draco meshes, hero shaders boot after main-thread idle — unverified; rate-limited me) https://www.refs.gallery/projects/phantomland · UI/UX Showcase https://uiuxshowcase.com/agency/phantom-land/
- Community recreations documenting behaviour precisely: **FF Grid / "PhantomClone"** (three.js + GSAP + Vite, with `docs/ARCHITECTURE.md` listing every tuned constant) https://github.com/Aphrosidiac/PhantomClone · **Inspira UI "Infinite Grid"** (OGL port with distortion/vignette post-shader, hover blur, inertia) https://inspira-ui.com/docs/en/components/visualization/infinite-grid, source https://github.com/unovue/inspira-ui/tree/main/app/components/inspira/ui/infinite-grid
- Earlier (2018/2019) site: Awwwards SOTD Dec 2018, Creative Review, The Drum "Haunting London" — different site, not relevant to current interactions.

## 3. Signature interactions — observed behaviour

### 3.1 Preloader → intro
- Full-screen black loader with mono text + progress bar (`Loader_ProgressBar`, keyframes `move-up / stretch / move-down / move-out-left`). `loaderDelay: 1500` ms minimum. **[bundle]**
- Inside the WebGL scene a **"particle dude" sprite** plays during load: a frame sequence of 25 WebP frames per set, 55 random sets on desktop / 3 on mobile (`.../controlnet-images/webp/setN/i.webp` — AI/ControlNet-generated frames), drawn on a `<sprite>` with a custom shader that **crossfades texture1→texture2 (`morphFactor`, eased cubic) while pixelating** (`pixelSize` stepping through `[80,70,60,50,40,30,20,10,1]`). Then at `elapsed > 4s` the "load" and "whoosh" sounds fire and the intro begins. **[bundle]**
- Intro: grid `opacity 0→1`, camera `z` eases to 3.43, lens distortion tweens **flat (0) → curved (−0.07)** over 1 s `power2.out`; group position offsets (`1.45` WORK vs `−2.75`) over 0.4 s after a 2.5 s delay. **[bundle]**

### 3.2 The Work Grid (hero = the whole homepage)
Verified mechanics **[bundle]** unless noted:
- **Geometry**: one `InstancedMesh` of **11×11 = 121** unit planes (`PlaneGeometry(0.998, 0.998)` — the 0.002 gap is the tile border), `frustumCulled=false`. Slot *i* shows `tiles[i % tiles.length]`; tiles have a `workGridPosition` laid out from a server-side **blueprint JSON** (`workgridAssets/production/blueprint.json` on GCS), sorted by `launch_date`.
- **Infinite wrap**: every frame each instance is re-positioned relative to the grid's `position` offset with `Math.round(n / gridSize) * gridSize` subtraction — i.e. tiles that leave one side re-enter the other; you can never reach an edge.
- **Textures = video atlases**: 3 atlas packs, each a **6×6 cell atlas** (`GRID_SIZE = 6.`) of looping project videos as `VideoTexture`s, with a **separate alpha-matte video** (`alphaMap`, `.r` channel) and a static **label atlas** (client/title text pre-rendered into a texture). Up to 108 tiles. Vertex shader computes per-instance `vUv`, `vMediaUv` (media occupies the centre **70%** of a tile, `MEDIA_ZOOM = 0.7`), `vBlurUv` (`BLUR_ZOOM = 20`), and `vCellBoundsUv` (with `BOUNDS_PADDING` to stop atlas bleed). Fragment composites `background → video (via alpha) → label`.
- **Hover**: nearest tile to the pointer (projected distance in NDC, every frame) becomes `activeInstance` (uniform array of 4 so fades overlap). Intensity eases per frame `i += (target − i) * 5 * dt`. Hovered tile gets a **5×5 box-blurred, 20×-zoomed sample of its own video as a glowing background** at `0.7` opacity, and its label alpha rises `0.8 → 1`. Cursor `grab`/`grabbing`. Hover is **disabled on touch devices**.
- **Ambient cursor parallax**: `pointerUv − 0.5` × **0.07** added to mesh position each frame (Codrops article quotes 0.2; shipped value is 0.07).
- **Press / drag zoom**: on pointer-down camera animates `z: 3.43 → 3.83` (+0.4) over 0.4 s with a `CustomEase('.23,1,0.32,1')` ("cameraZoom"); on release (if it was a drag) back to 3.43. Visually the grid "pulls away" while you drag.
- **Drag + inertia**: pixel delta → world units at depth `camera.z + 0.58`; `velocity.lerp(dragDelta, 1)` while dragging; each frame `positionOffset += isDrag ? dragDelta : velocity; velocity.lerp(0, clamp(4·dt, 0, 1))` → exponential decay (~250 ms half-life).
- **Click**: `≤` drag threshold → `getSelectedTile()` → `router.push('/projects/<slug>')` and grid `fadeOut()` (opacity → 0.3, camera z +1 over 1 s, videos paused). Returning calls `fadeIn()` + `center()`.
- **Keyboard**: Arrow keys pan; `Home`/`End`; focus index walks tiles with `moveTo` (0.3 s `power2.inOut`); Enter opens.
- **Post-processing "lens"**: `EffectComposer` → `RenderPass` → **`DistortionShader` pass** → `OutputPass`. Fragment: `m = 2(uv−.5); uv' = ((0.88 + distortion·dot(m,m))·m)·.5+.5` with `distortion = factor × aspect` (factor **−0.07** curved / **0** flat), outside-bounds pixels black, plus **vignette** `smoothstep(0.8, 0.6·0.799, (0.6+0.6)·dist)`. Flat mode is forced during intro and when a project is clicked (`isForceFlat`).
- **Graphics tiers**: drei `PerformanceMonitor` → on decline `graphicsTier = LOW`, which **bypasses the composer** (`gl.render(scene, camera)` directly, no lens). R3F Canvas: `frameloop: "demand"` with explicit `invalidate()` per frame while the grid is live; `camera: {fov: 85, near: 0.001, far: 1000}`, `gl: {antialias: true, alpha: true}`, `linear: true`.
- **Sound**: Web Audio clips `click / grid(hover) / load / project / other / riser / swipe / whoosh`; gain tweened with GSAP `sine.out`; "interaction mode" switches between DRAG and SCROLL.
- **List view / filters**: `<aside inert>` list toggles with grid; filters (Zone single-select, Feature/Service/Client multi) live in URL search params and drive both grid (`setProjects()` rebuilds instances) and list.
- **Mobile**: touch listeners (`touchstart/move/end/cancel`) on the canvas, `touch-action:none`; hover highlight off; smaller sprite/intro scales (`isMinMedium` switch); 3 mobile atlas sets instead of 55; the clone caps atlases at 2048 px and DPR-budgets to ~8.3 M pixels on phones **[clone]**.

### 3.3 Page transition (grid → project)
- Zustand `transitionIntent` enum: `NONE | ADD_LAYER_ENTER | ADD_LAYER_EXIT | FADE_LAYER_ENTER | FADE_LAYER_EXIT | SNAP`. A `TransitionElementContainer` + `TransitionElementFill` + `Underlay` wraps each route. Motion variants: **new page layer slides up `translateY(100%) → 0` with opacity 0→1 over 0.5 s** ("add layer"); exit fades after a 0.5 s delay; "fade layer" cross-fades; SNAP instantly resets. The canvas is `position:fixed` **underneath**, so the grid keeps living (dimmed to 0.3, camera pulled back) behind the incoming page. **[bundle]**
- Lenis is **created only on non-home, non-contact routes** (`duration 0.7, easing 1−(1−t)^4, smoothWheel, wheelMultiplier 1, touchMultiplier 1`) and destroyed on home (where the canvas owns the wheel/drag). **[bundle]**

### 3.4 Project page (`/projects/<slug>`) — e.g. Casamigos World Cup 2026
- Prismic slices. Order: mono header row (REGION & ZONE pills linking back to filtered home `/?service=amer`, `/?zone=experience`; "SEE IT LIVE ↗"), **h1 giant title**, hero `<video autoplay muted loop playsinline>` (webm, incl. "transparent video" alpha variant when supported), `LargeSubTitle` summary inside a **`ParalaxContainer`** (Motion `translateY` driven), ABOUT rich text, FEATURES pill list (`/?feature=ai` etc.), media gallery (full/left/right layout grid `layout_Grid`), **Related work** (3 cards with looping video + "view project") and "See all work" → `/`. **[bundle + fetch]**
- **Text reveal**: custom split hook (`split-line / split-word / split-char` classes, `useSplitText(id, "lines,words,chars")`) + `useInView(once)`; lines animate `y: 40px·direction → 0`, 0.8 s; staggered per line; paragraphs fade in with 1 s delay. **[bundle]**
- **Lazy video**: `IntersectionObserver` with `rootMargin: 500px` sets `src` only when near viewport; `poster` WebP generated from the video URL and `<link rel=preload as=image>`; `preload="metadata"`; `.play()` on `loadeddata`; a separate `useInView` pauses/plays. **[bundle]**
- Reveal variants: `opacity 0→1, translateY 10px→0`, 0.5 s, `delay 0.2·index`. **[bundle]**

### 3.5 About (`/about/agency`, `/about/approach`)
- Agency/Approach **toggle** (`AboutLayoutToggle`, `translate .7s cubic-bezier(.93,-.24,.4,1.17)`), body is client-rendered slices (`About_SlicesWrapper`): hero statement with char/word split reveal, sections tracked in a store (`aboutIntersectingSection`) to drive a side label, `#logo-grid` client logos with row-aware stagger, **Awards list table** with animated `scaleX` rules and SVG `pathLength` draws, and the **Team face-particle carousel** (lazy chunk). **[bundle]**
- **Face particles** **[Codrops]**: each team member = a 256×256 WebP colour map + 256×256 WebP depth map (<15 KB each, from iPhone RealityScan → C4D position/colour pass → Photoshop depth). `<points>` with **280×280 = 78,400** vertices; `vIndex` attribute samples both textures; `pos.z = (1 − depth)·2−1 · zScale`; particle size `mix(pScaleMin, pScaleMax, luminance)` so bright features get bigger points; **curl noise** ambient drift (`pos += curlNoise(pos·curlFreq + time)·noiseScale·0.1`); pointer tilt via `easing.damp(rotation.y, mouse.x·0.12π, 0.25)`; **transition between people** = GSAP timeline tweening `transition 0→1.3`, `posZ`, `zScale` over 1.6 s while shader `mix()`es both texture pairs and injects extra noise peaking at mid-transition (`abs(sin(speed·π))`); **DOF** = `vDistance = |focus + viewZ|` → `gl_PointSize *= vDistance·blur` and fragment alpha `1.04 − clamp(vDistance·1.5)`; per-face hand-tuned `offset_z / z_depth_scale / face_size`.

## 4. Reverse-engineering spec for a Next.js 16 + vanilla three.js/GSAP/Lenis portfolio

Design goal: same *techniques*, original assets/design, Lighthouse 100.

### 4.1 Architecture
```
app/
  layout.tsx            RSC shell; <WorkList/> SSR'd (SEO + noscript + reduced-motion fallback)
  page.tsx              home: <WorkList/> + <WorkGridCanvas/> (client, dynamic import, ssr:false)
  projects/[slug]/page.tsx   RSC; media via <LazyVideo/> client island
  about/page.tsx
components/webgl/
  WorkGrid.ts           vanilla three class (InstancedMesh + atlases + input + wrap)
  LensPass.ts           ShaderPass (barrel + vignette)
  Navigation.ts         drag/velocity/keyboard; emits {offset, pressed, hoverIndex}
lib/
  lenis.ts              created only on inner routes; synced to gsap.ticker + ScrollTrigger.update
  transition-store.ts   tiny zustand/useSyncExternalStore: intent enum
```
Skip R3F (user wants vanilla three); mount the three app imperatively in a `useEffect` inside a `dynamic(() => import(...), { ssr: false })` island so the RSC HTML stays pure and ships zero WebGL JS until hydration.

### 4.2 Work grid — implementation checklist
1. **Data**: build a `blueprint.json` at build time (`scripts/build-atlas.ts`): per project `{slug, atlasIndex, cell:[cx,cy], gridPos:[x,y]}` plus the atlas media. Keep an SSR `<ul>` list of the same data.
2. **Atlases**: pre-encode **one 6×6 (or 4×4) atlas per 36 projects**: either (a) a WebM/MP4 video atlas (Phantom's approach; `VideoTexture`, muted/loop/playsinline, 24 fps, ≤1080 px, `requestVideoFrameCallback` to flag `needsUpdate`) or (b) a KTX2/WebP still atlas for Lighthouse-friendly mobile. Use a separate greyscale alpha video only if you need non-rectangular media. Pre-render labels into a 2× label atlas (Canvas2D at build or runtime after `document.fonts.ready`).
3. **Mesh**: `InstancedMesh(PlaneGeometry(0.998,0.998), ShaderMaterial, N*N)` with N=11 (odd so one tile is centred). Per-instance attributes: `uvOffset` (cell), `atlasIndex`, `instanceIndex`. Set `frustumCulled=false`.
4. **Wrap**: each frame for instance *i*: `p = gridPos_i + offset; p -= round(p / N) * N; setMatrixAt(i)`; `instanceMatrix.needsUpdate = true`. (121 matrix writes per frame is trivial.)
5. **Shader**: vertex computes `vUv`, `vMediaUv` (0.7 zoom), `vBlurUv` (20 zoom), cell bounds; fragment composites blurred-bg × hoverIntensity → media → label; `uniform float activeInstance[4], activeIntensity[4], opacity`. Use `flat varying` ints for indices (GLSL3 / WebGL2).
6. **Input** (single `Navigation` class): Pointer Events (`pointerdown/move/up/cancel`, `setPointerCapture`) instead of separate mouse/touch; 3 px drag threshold; `getWorldOffset = pxDelta → NDC → unproject at depth camera.z+0.58`; `velocity.lerp(delta,1)` while dragging, `velocity.lerp(0, clamp(4·dt,0,1))` after; wheel/trackpad: add `deltaX/Y` scaled, eased ~0.1 s, do **not** feed inertia; arrow keys + Tab/Enter with a visible focus ring overlay (fixes Phantom's 6.8 accessibility score); `aria-label`ed canvas + off-screen list as the accessible alternative.
7. **Camera**: `PerspectiveCamera(85, aspect, 0.01, 100)`, rest `z=3.43`; press `gsap.to(camera.position,{z:3.83, duration:.4, ease: CustomEase.create('zoom','.23,1,0.32,1')})`; release back. Or derive FOV from a target tile size (`unitPx = min(0.291·h, w/2.6)`) so phones show ~2.5 columns **[clone]**.
8. **Hover**: project each instance centre to NDC, pick nearest within radius; ease intensity `i += (t−i)·5·dt`; disable when `matchMedia('(hover: none)')`.
9. **Lens pass**: `EffectComposer → RenderPass → ShaderPass(lens) → OutputPass`; `distortion = factor·aspect`, factor tweened 0 ↔ −0.07 (`duration 1, power2.out`); vignette offset/darkness 0.6/0.6. Render scene target at ~1.3–1.5× DPR-budgeted size so the lens' 0.88 centre magnification doesn't blur **[clone]**; invert the lens mapping in hit-testing so click targets match what's seen.
10. **Perf**: `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` then clamp total pixels (canvas + RT) to ~8 M; render **on demand** (dirty flag set by input/velocity > ε/video frame) rather than an always-on RAF; pause videos + loop when `document.hidden` or when the grid is behind a page; `PerformanceMonitor`-style FPS sampler to drop the post pass (LOW tier) under 45 fps; dispose textures on unmount.
11. **Mobile**: smaller atlas (≤2048), stills instead of video atlas on `saveData`/low tier, `touch-action:none` only on the canvas, still provide the list view toggle.

### 4.3 Transitions & scroll
- **Route transition**: keep the canvas `position:fixed` in `layout.tsx` under a `<TransitionLayer>` that reads an intent (`ADD_LAYER_ENTER` = new page slides up `translateY(100%)→0`, 0.5 s, `cubic-bezier(.16,1,.3,1)`; `FADE_LAYER` cross-fade; `SNAP` for back/forward). In Next 16 use `template.tsx` (remounts per route) + the View Transitions API (`document.startViewTransition`) as progressive enhancement, falling back to GSAP timelines. On project click: `grid.fadeOut()` (opacity→0.3, camera +1 over 1 s, pause videos) in parallel with `router.push`.
- **Lenis**: instantiate only on inner routes (`duration .7, easing 1−(1−t)^4, smoothWheel, syncTouch:false`), `gsap.ticker.add(t => lenis.raf(t*1000))`, `lenis.on('scroll', ScrollTrigger.update)`, destroy on route change; use `ScrollTrigger` with `scrub` for the parallax summary block and pinning sections; respect `prefers-reduced-motion` by not creating Lenis and setting `gsap.globalTimeline.timeScale(0)`-style instant reveals.
- **Text reveal**: GSAP SplitText (now free in 3.13+) `lines,words,chars` with `autoSplit` + `onSplit` revert; reveal `y: 40·dir → 0, 0.8 s`, staggered; guard with `IntersectionObserver` once.
- **Lazy video**: `IntersectionObserver({rootMargin:'500px'})` → set `src`; poster `<link rel=preload as=image>` only for the hero; `preload="metadata"`, `muted playsInline loop`; `.play()` on `loadeddata`; pause when out of view. Serve AV1/VP9 webm + H.264 fallback via `<source>` ordering.

### 4.4 Face/particle team module (optional)
- `THREE.Points` + `ShaderMaterial`, 280×280 `vIndex` grid, two 256² WebP textures per person; uniforms `{colorMap1/2, depthMap1/2, transition, zScale, posZ, focus, blur, time, pScaleMin/Max}`; GSAP timeline for transitions (1.6 s); `curlNoise` GLSL; DOF via `vDistance`. Mount lazily (dynamic import on scroll-into-view), `transparent, depthWrite:false, NormalBlending`.

### 4.5 Lighthouse-100 guardrails
- SSR the full project list (Phantom does) — it is your LCP/SEO surface; LCP element should be text, not the canvas.
- `dynamic(..., {ssr:false})` + `requestIdleCallback`/`scheduler.yield` before creating the WebGL context; begin video/atlas fetch only after `load`.
- `next/font` self-host both faces, `display: swap`, subset.
- Preconnect only to hosts actually used before LCP; defer analytics.
- `prefers-reduced-motion`: skip intro, inertia, lens tween, autoplay video (poster only), Lenis.
- DPR cap 2, pixel budget, `powerPreference:'high-performance'`, `antialias:false` when using a supersampled RT, `alpha:false` if background is solid.
- Keep total JS < ~350 KB gz on home (Phantom ships ~1.9 MB raw across three + R3F + Motion + GSAP; vanilla three + GSAP core + Lenis avoids R3F/Motion/drei).
- Accessibility: focusable canvas with roving `aria-activedescendant` mapped to the hidden list items; visible focus ring; list toggle always available.

## 5. Sources
- Phantom homepage / chunks: https://www.phantom.land/ , `/_next/static/chunks/app/page-011a848178cd2676.js`, `app/layout-3e0b59d4139e3f79.js`, `app/projects/[uid]/page-8f0b7a62a5b45f2c.js`, `app/about/[uid]/page-c2e93f2e1c5a73a5.js`, `5792-*.js` (Lenis), `c15bf2b0-*.js` (GSAP/ScrollTrigger), `4451-*.js` (CustomEase)
- Sub-pages: https://www.phantom.land/projects/casamigos-world-cup-2026 , https://www.phantom.land/about/agency , https://www.phantom.land/about/approach
- Codrops making-of: https://tympanus.net/codrops/2025/06/30/invisible-forces-the-making-of-phantom-lands-interactive-grid-and-3d-face-particle-system/
- Awwwards: https://www.awwwards.com/sites/phantom-land , https://www.awwwards.com/inspiration/work-grid-phantom-land-1 , https://www.awwwards.com/PhantomStudios/
- GSAP Site of the Week: https://x.com/greensock/status/1930290513665466455
- FF Grid / PhantomClone (unaffiliated recreation, tuned constants): https://github.com/Aphrosidiac/PhantomClone (README + `docs/ARCHITECTURE.md`)
- Inspira UI Infinite Grid (OGL port): https://inspira-ui.com/docs/en/components/visualization/infinite-grid , https://github.com/unovue/inspira-ui/tree/main/app/components/inspira/ui/infinite-grid
- Refs.Gallery (unverified perf claims): https://www.refs.gallery/projects/phantomland
- UI/UX Showcase: https://uiuxshowcase.com/agency/phantom-land/
- Phantom CSS components lib (referenced in Codrops): https://github.com/phantomstudios/css-components

**Caveats**: I could not fetch Phantom's LinkedIn performance article or Refs.Gallery (blocked/rate-limited), and the live grid was observed via bundle analysis, not a browser session; the exact `blueprint.json` layout and the pause/visibility behaviour on mobile were inferred from code paths rather than seen running. One scan of the Motion chunk was left running in the background and is not needed.
