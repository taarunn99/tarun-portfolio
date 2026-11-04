<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

I have what I need; no further fetches required. Here is the report.

# Scroll-Driven "Journey" Animation — Research Report (2026-11-04)

Scope: read-only web research for a Next.js 16 + Three.js + GSAP/Lenis portfolio. Codrops article pages return HTTP 403 to automated fetchers, so where I could not read the article directly I used the demo pages, the authors' GitHub repos, or mirrors; those are flagged.

Licensing note that affects everything below: **GSAP 3.13+ (April 30, 2025) made the whole library free, including the former Club plugins (DrawSVG, MorphSVG, SplitText, MotionPath, ScrollTrigger)**, under Webflow's ownership — [gsap.com/blog/3-13](https://gsap.com/blog/3-13/), [Webflow announcement](https://webflow.com/blog/gsap-becomes-free). DrawSVG is therefore usable, though a plain `stroke-dasharray/dashoffset` tween does the same job with zero extra bytes.

---

## 1. Catalogue of "journey/travel on scroll" patterns

| | Pattern | Libraries | Difficulty | Mobile perf | Reduced-motion fallback | Lighthouse-100 strategy |
|---|---|---|---|---|---|---|
| **(a)** | **SVG route + MotionPath + ScrollTrigger** — a stylised map/route path draws itself; a marker (plane/dot) rides it; a "camera" group pans/zooms; milestone cards activate at labels | GSAP core + ScrollTrigger + MotionPathPlugin (+ optional DrawSVG), inline SVG | Low–Medium (one timeline; main gotcha is MotionPath alignment not recalculating on resize) | Excellent — no WebGL, only transforms on a handful of SVG nodes; works on any Android | Trivial — SSR the SVG fully drawn, markers visible, cards as a plain list; `gsap.matchMedia('(prefers-reduced-motion: reduce)')` skips the timeline | ~35 KB gz of GSAP total; load the animation chunk after idle / near-viewport; SVG is server-rendered so no CLS and no LCP dependency |
| **(b)** | **Three.js camera on a CatmullRomCurve3**, scroll progress → `curve.getPointAt(t)`, flying past 3D/2D "stations" | three / R3F + drei `ScrollControls` or hand-rolled Lenis progress; GSAP optional for scrubbed timeline | Medium–High (curve authoring, look-at, per-section remapping, resize, lazy mount) | Mediocre by default: continuous RAF heats phones; needs DPR cap 1–1.5, render-on-demand, offscreen pause, texture budget | Place camera at final framing, render one frame, keep all copy in HTML | three ≈150 KB gz before scene; `next/dynamic` in a client wrapper, mount only after first interaction/idle AND `pointer:fine` or wide viewport; `frameloop="demand"` + `invalidate()` on scroll |
| **(c)** | **Scroll-scrubbed image sequence** (Apple AirPods): a frame index tween draws decoded frames to `<canvas>` | GSAP ScrollTrigger (`scrub`, `snap:'frame'`) + canvas; FFmpeg → WebP frames | Low code, High asset cost | Memory is the killer: decoded frame = w×h×4 bytes (1920×1080 ≈ 8.3 MB; 150 frames ≈ 1.2 GB). Needs a separate smaller mobile set (40–100 frames), progressive sparse preload, DPR cap 1.5–2, and iOS tab-kill mitigation | Show poster frame (first/last) as `<img>`; no canvas | Poster as LCP image, frames loaded after first paint and only when section nears viewport; reserve height to avoid CLS |
| **(d)** | **3D globe with arcs between cities** (India→SG→Dubai) | `cobe` (~5 KB, zero deps; `markers`, `arcs`, `phi/theta`, `onRender`) or `three-globe`/`react-globe.gl` (full three.js; `arcsData`, `arcDashAnimateTime`, `pointOfView({lat,lng,altitude}, ms)`) | Low (cobe) / Medium (three-globe) | cobe: good, single canvas, animate `phi` to a city from scroll. three-globe: heavy, same caveats as (b) | Static globe PNG/SVG with pins; cobe repo examples already fall back to SVG globe | cobe is cheap enough to ship; still lazy-mount and pause `onRender` when offscreen |
| **(e)** | **Horizontal "timeline" pinned section** — vertical scroll drives `xPercent` of a wide track; inner triggers use `containerAnimation` | GSAP ScrollTrigger (`pin`, `scrub`, `containerAnimation`, `snap`) | Low–Medium | Pinning on mobile is fragile (address-bar resize, 100vh jumps); common advice is to hide the pinned version below `md` and show a static vertical list | Static vertical list | Pure DOM; fine. Use `100svh`, `ScrollTrigger.normalizeScroll()` if needed |
| **(f)** | **Map engine flyTo on scroll** (Mapbox/MapLibre storytelling) — chapters in the DOM, `map.flyTo()` when a chapter enters | maplibre-gl (free tiles e.g. OpenFreeMap) or mapbox-gl (token) + scrollama/IntersectionObserver | Low (templates exist) | Heavy JS (maplibre ≈ 200+ KB gz) + tile network; poor Lighthouse unless deferred; vector tile rendering taxes low-end phones | Static map image per chapter | Hard to hit 100 with a live map on first load; must mount after interaction. Overkill for 3 cities |

**Takeaway for this portfolio:** (a) gives 90% of the "reel" feel at ~5% of the cost of (b)/(f). (b) is the cinematic option but should be a desktop-only enhancement layer, not the content carrier. (c) is for product hero shots, not a career map. (d) is a nice *accent* (a small cobe globe spinning to the current city) that can sit inside (a). (e) and (f) are poor fits for mobile/Lighthouse.

Key docs used: [MotionPathPlugin](https://gsap.com/docs/v3/Plugins/MotionPathPlugin) (`align`, `alignOrigin`, `autoRotate`, `start/end`, `getPositionOnPath`, `getLength`; alignment is computed once at start → rebuild on resize), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger) (`scrub: <seconds>`, `pin`, `pinSpacing`, `snap` object, `invalidateOnRefresh`, `normalizeScroll`, avoid `content-visibility`), [gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) (conditions object incl. `(prefers-reduced-motion: reduce)`; auto-reverts ScrollTriggers), [Lenis README](https://github.com/darkroomengineering/lenis) (`respectReducedMotion: true` default, `lenis.progress`, `lenis.velocity`, GSAP ticker wiring), [lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md), [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas) (`frameloop`, `dpr=[1,2]` default), [drei ScrollControls](https://drei.docs.pmnd.rs/controls/scroll-controls) (`useScroll().range/curve/visible`).

---

## 2. Concrete references for the top 3 patterns

### (a) SVG route + MotionPath + ScrollTrigger
1. **Codrops — "Creating Scroll-Driven SVG Map Animations with GSAP"** (May 21 2026, Tom Miller): [article](https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/) · [live demo](https://tympanus.net/Tutorials/ScrollMap/) · [minimal pen](https://codepen.io/creativeocean/pen/azBZmdx) · [camera-follow pen](https://codepen.io/creativeocean/pen/jEVryKm). *This is the closest thing to the brief.* Technique (read via [mirror](https://blog.goodlaptops.com/programming/creating-scroll-pushed-svg-map-animations-with-gsap)): `viewBox 0 0 1500 1500`, `preserveAspectRatio="xMidYMid slice"`; outer `.pov` group = zoom, inner `g` = pan; `pin: '.map'`, `scrub: 1`, section `300vh`; `.from('.path',{drawSVG:'0 0'})` + `.to('.dot-end',{motionPath:'.path', immediateRender:true})`; `onUpdate` feeds two `gsap.quickTo()` (x,y, expo ease) with the negated marker coordinates so the camera follows; zoom `fromTo` scale 2.5→4.
2. **Codrops — "Building Responsive, Scroll-Triggered Curved Path Animations with GSAP"** (Dec 17 2025, from the Lando Norris site hero): [article](https://tympanus.net/codrops/2025/12/17/building-responsive-scroll-triggered-curved-path-animations-with-gsap/). S-curve from two cubic Béziers, MotionPath driven, visual configurator for control points, path defined in viewport-relative terms so it holds on any screen.
3. **GreenSock — "Animate path on scroll"** (DrawSVG + MotionPath + pulse at checkpoints): [codepen.io/GreenSock/pen/rNOBLBV](https://codepen.io/GreenSock/pen/rNOBLBV)
4. **mvaneijgen — MotionPath + ScrollTrigger scrub with autoRotate**: [codepen.io/mvaneijgen/pen/mdLaGNP](https://codepen.io/mvaneijgen/pen/mdLaGNP)
5. **GSAP Vault — "Scroll Path Journey"** (sticky stage, 3 stacked copies of the same `d`: faint route / progress stroke / invisible motion path; `ResizeObserver` → save progress, kill, rebuild, restore; reduced-motion early-exit): [write-up](https://gsapvault.com/blog/animate-element-along-svg-path-gsap) · [demo](https://gsapvault.com/demos/scroll-path-journey/index.html)
6. **"Timeline That Draws on Scroll"** (no DrawSVG; milestones get `.is-on` at 65% viewport; no-JS/reduced-motion = fully drawn): [webdevpuneet.com](https://webdevpuneet.com/website-section-templates/scroll-path/)
7. **Pinned React timeline with progress line + filling dots** (`pin`, `scrub: 0.5`, `end: '+=' + steps*1800`, `gsap.context` in `useLayoutEffect`; hides pinned version on mobile, shows static list): [buildwithmatija.com](https://www.buildwithmatija.com/blog/gsap-scrolltrigger-react-timeline)
8. **mikeK — "ScrollTrigger: scroll a map"**: [codepen.io/mikeK/pen/rNWzGaa](https://codepen.io/mikeK/pen/rNWzGaa)

### (b) Three.js camera on a curve, scroll → progress
1. **Codrops — "How to Build Cinematic 3D Scroll Experiences with GSAP"** (Nov 19 2025): [article](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) · [demo](https://tympanus.net/Tutorials/Cinematic3DScroll/) · [repo (MIT, Vite+TS)](https://github.com/JosephASG/codrops-cinematic-scroll-animations) — ScrollTrigger-scrubbed timelines interpolating camera position; demo 2 is a camera fly-through showcase with typography.
2. **Codrops — "Scroll-Driven 3D Gallery Using a Blender Camera Path"** (Jul 7 2026, Gaspard Hedde): [article](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/) — Blender curve → JSON → `CatmullRomCurve3` (Z-up→Y-up remap), GSAP `Observer` for scroll, images distributed along the curve, closed-curve loop option.
3. **Codrops — "Scroll-Reactive 3D Gallery with Velocity"** (Mar 9 2026): [article](https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/) — camera depth tied to scroll with smoothing/clamping.
4. **Codrops — "Camera Fly-through on Scroll with Theatre.js + R3F"** (2023): [article](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/)
5. **Codrops — "Crafting Scroll Based Animations in Three.js"** (2022, Three.js Journey): [article](https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/)
6. **Wawa Sensei — "Recreating Atmos" Part 1: Curved Path** (R3F, `CatmullRomCurve3`, drei `ScrollControls pages/damping`, look-at a point slightly ahead on the curve): [tutorial](https://wawasensei.dev/tuto/recreating-atmos-3d-website-with-react-three-fiber-part-1-curved-path) · [R3F scroll basics](https://wawasensei.dev/tuto/react-three-fiber-tutorial-scroll-animations)
7. **"Scroll-Driven Camera Animation in Three.js"** — the cleanest statement of the method: one normalised progress, set target in scroll handler, ease toward it each frame, remap per-section sub-ranges, interpolate lookAt/FOV, cap DPR 2, render only on change, pause offscreen, reduced-motion = final framing: [aetumi.app](https://aetumi.app/news/threejs-camera-scroll-animation/)
8. **Codrops Curve Gallery demo** [tympanus.net/Tutorials/CurveGallery](https://tympanus.net/Tutorials/CurveGallery/) and **three.js camera path authoring tool** [cjgammon/three.js-camera-path-tool](https://github.com/cjgammon/three.js-camera-path-tool)

### (c) Scroll-scrubbed image sequence
1. **GreenSock — "Airpods & ScrollTrigger Variation"** (`scrub: 0.5`, `snap: 'frame'`, canvas draw in `onUpdate`): [codepen.io/GreenSock/pen/ZEqxKyb](https://codepen.io/GreenSock/pen/ZEqxKyb)
2. **tomzidani — AirPods scroll sequence w/ GSAP**: [codepen.io/tomzidani/pen/xxmpVBX](https://codepen.io/tomzidani/pen/xxmpVBX)
3. **GSAP forum canonical thread** (why canvas, not `img.src` swaps): [gsap.com/community/.../25188](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/)
4. **Codrops — OPTIKKA case study: "From HTML5 Video to Frame Sequences"** (Oct 16 2025, Zajno): [article](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/) — why video scrubbing stutters, FFmpeg→WebP, direction-aware preload queue, separate lower-frame-count mobile set.
5. **"Image sequence scroll animation lagging on mobile? 9 fixes"** — the numbers: 60–350 frames, 10–20 px scroll/frame, 15–90 KB/frame, DPR cap 1.5–2, decoded-memory math, poster-first + sparse-then-dense preload, iOS tab kills: [dev.to](https://dev.to/alki/image-sequence-scroll-animation-lagging-on-mobile-9-fixes-260k)
6. **Apple-style sequence lesson (frame fit, virtual fps, start/end)**: [francescocastronuovo.com](https://francescocastronuovo.com/learn/lessons/apple-style-image-sequence-webflow/)
7. **Canvas image-sequence step-by-step (2026)**: [scrollhaus.ai](https://scrollhaus.ai/blog/image-sequence-scroll-animation-canvas/)
8. **Builder.io — 3D scroll animation with GSAP + Veo-generated frames**: [builder.io/blog/3d-gsap](https://www.builder.io/blog/3d-gsap)

### Shorter lists for (d)/(e)/(f)
- **(d)** [cobe](https://github.com/shuding/cobe) / [cobe.vercel.app](https://cobe.vercel.app/) (markers + arcs, `onRender(state)` to drive `phi`), [react-globe.gl](https://github.com/vasturiano/react-globe.gl) (`arcsData`, `arcDashAnimateTime`, `pointOfView`), [Aceternity GitHub Globe](https://ui.aceternity.com/components/github-globe), [Magic UI Globe (cobe)](https://magicui.design/docs/components/globe), a [portfolio PR using cobe with scroll-tilt, offscreen pause, SVG fallback](https://github.com/lcspaiva87/lucas-paiva-portfolio/pull/2), [three.js globe with flight paths explainer](https://neuraplus-ai.github.io/blog/how-three.js-globe-with-flight-paths-works.html).
- **(e)** [Michelle Barker — Scrollable & Draggable Timeline (Codrops 2022)](https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/), [GSAP forum: horizontal pin + scrub](https://gsap.com/community/forums/topic/31259-horizontal-scroll-pinning-scrub/), [forum: overlapping pinned sections via containerAnimation](https://gsap.com/community/forums/topic/36992-pinning-and-overlapping-sections-in-scrolltrigger-horizontal-scroll/), [Next.js horizontal demo repo](https://github.com/IvanSmiths/next-gsap-scroll), [pin + fade tutorial](https://www.webbae.net/posts/horizontal-scrolling-section-with-pin-and-fade-effects), [Awwwards: Paxafe timeline/milestones](https://www.awwwards.com/inspiration/timeline-scroll-animation-paxafe).
- **(f)** [MapLibre official "fly to a location based on scroll position"](https://maplibre.org/maplibre-gl-js/docs/examples/fly-to-a-location-based-on-scroll-position/), [Mapbox Storytelling template](https://labs.mapbox.com/education/impact-tools/interactive-storytelling/), [digidem/maplibre-storymap](https://www.github.com/digidem/maplibre-storymap), [Mapbox scrollytelling + LineString draw](https://gist.github.com/chriswhong/f2cac4cc2181c1045bc1d466ced95b48), [scrollydrive](https://github.com/willymaps/scrollydrive).

---

## 3. Recommendation + implementation blueprint

### Recommendation: **Pattern (a) — SVG route with MotionPath + ScrollTrigger**, with an *optional* desktop-only three.js parallax layer (b-lite) and an *optional* cobe globe accent (d).

Why (a) over (b):
- The story is geographic (Bengaluru/India → Singapore/NUS → Dubai/Head of Technology) and chronological (7 products). A route-on-a-map with checkpoints *is* that story; a 3D fly-through would need stations invented to justify the camera.
- Codrops' May 2026 ScrollMap is a direct template, including camera pan/zoom, so delivery risk is low.
- It is the only pattern that is simultaneously: Lighthouse-100-safe (no WebGL on the critical path), good on mid-range Android, trivially reversible (scrub), and degrades to a fully-drawn SSR map for reduced-motion/no-JS.
- Your three.js budget is better spent on the project showcase (section 4) where WebGL adds something the DOM can't.

### 3.1 Data model (`content/journey.ts`, server-only)

```ts
export type Waypoint = { id: 'blr'|'sin'|'dxb'; city: string; country: string; lat: number; lng: number;
  from: string; to?: string; role: string; blurb: string };

export type Milestone = {
  id: string;                 // slug
  kind: 'place' | 'education' | 'product';
  at: Waypoint['id'];         // which city it belongs to
  date: string;               // ISO or 'YYYY-MM'
  title: string; subtitle?: string; summary: string;
  image?: { src: string; alt: string; w: number; h: number };
  href?: string;              // case study
  t?: number;                 // 0..1 route progress — COMPUTED, not authored
};

export const waypoints: Waypoint[] = [
  { id:'blr', city:'Bengaluru', country:'IN', lat:12.97, lng:77.59, from:'20xx', role:'...', blurb:'...' },
  { id:'sin', city:'Singapore', country:'SG', lat:1.35,  lng:103.82, from:'20xx', role:'NUS', blurb:'...' },
  { id:'dxb', city:'Dubai',     country:'AE', lat:25.20, lng:55.27, from:'20xx', role:'Head of Technology', blurb:'...' },
];
export const milestones: Milestone[] = [ /* 3 places/edu + 7 products, sorted by date */ ];
```

Route geometry is derived, not hand-drawn:
- `project(lat,lng)` → SVG coords (equirectangular into a `viewBox` cropped to ~60°E–110°E, 0°–35°N is enough; or Mercator if you use a real map raster).
- Build one `<path d>` through the three projected points with a gentle arc per leg (cubic Bézier with control points lifted "north" to read as a flight). Keep the *same `d`* for the faint base route, the progress stroke, and the MotionPath (the gsapvault write-up's "three copies" rule).
- Compute each milestone's `t`: places sit at the leg boundaries (`t_blr=0`, `t_sin≈0.45`, `t_dxb=1` by arc length via `MotionPathPlugin.getLength` or `path.getTotalLength()`); products are spread evenly inside their city's dwell window (e.g. Singapore products between `t_sin` and `t_sin+0.12`). Dwell windows give the camera time to sit on a city while cards cycle.

### 3.2 Component structure (Next.js 16 App Router)

```
app/(site)/page.tsx                       server: imports content, renders <JourneySection/>
components/journey/
  JourneySection.tsx                      server: semantic shell + SSR'd <JourneyMapSvg/> + <ol> of <MilestoneCard/>
  JourneyMapSvg.tsx                       server: inline SVG (map outline/raster <image>, base route, progress route,
                                          motion path (invisible), city dots, marker <g>), fully drawn by default
  MilestoneCard.tsx                       server: real text/links; data-t, data-id attributes
  JourneyController.client.tsx            'use client': IntersectionObserver gate → next/dynamic(() => import('./journeyTimeline'))
  journeyTimeline.ts                      client-only: GSAP timeline builder (ScrollTrigger + MotionPath), matchMedia, resize rebuild
  JourneyGlobeAccent.client.tsx           optional: cobe canvas in a corner, phi driven by current waypoint
  JourneyDepthLayer.client.tsx            optional desktop-only three.js parallax plane (see 3.5)
app/providers/SmoothScroll.client.tsx     ReactLenis root, autoRaf:false, driven by gsap.ticker; lenis.on('scroll', ScrollTrigger.update)
```

Rules: everything the user must *read* is server-rendered HTML; the client component only *moves* what is already there. The SVG default state is the finished state (route drawn, all dots lit) so no-JS, reduced-motion, and the Lighthouse crawler all see the complete thing.

### 3.3 Scroll → progress mapping with Lenis

Lenis (root mode) scrolls the real window, so ScrollTrigger needs no `scrollerProxy` — only the update hook:

```ts
// SmoothScroll.client.tsx
<ReactLenis root options={{ lerp: 0.1, smoothWheel: true, syncTouch: false /* native touch */, anchors: true }} ref={ref} autoRaf={false}>
useEffect(() => {
  const lenis = ref.current?.lenis; if (!lenis) return;
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(tick); lenis.off('scroll', ScrollTrigger.update); };
}, []);
```

- `respectReducedMotion` is on by default in Lenis: smoothing is disabled for those users and `lenis.prefersReducedMotion` is exposed.
- Progress for the map comes from the **ScrollTrigger**, not from `lenis.progress` (that's page-wide). Section layout: `<section>` height = `max(600vh, milestones.length * 110vh)`; stage (the SVG wrapper) is `position: sticky; top: 0; height: 100svh` — sticky instead of `pin` avoids pin-spacing math and the mobile address-bar jump. ScrollTrigger: `trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true`.
- Milestone activation: `tl.addLabel(m.id, m.t)` for every milestone; `snap: { snapTo: 'labelsDirectional', duration: { min: .2, max: .6 }, delay: .05, ease: 'power2' }` so a flick lands on a milestone; `onUpdate` computes the active milestone (`milestones.findLast(m => m.t <= tl.progress())`) and toggles `data-active` / `aria-current="step"` on the card and city dot. Optionally dispatch a `journey:checkpoint` CustomEvent (gsapvault pattern) so the globe accent or nav can listen.

### 3.4 GSAP code outline (primary layer)

```ts
// journeyTimeline.ts  (loaded lazily; runs inside gsap.matchMedia)
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export function mountJourney(root: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add({
    motionOK: '(prefers-reduced-motion: no-preference)',
    reduce:   '(prefers-reduced-motion: reduce)',
    desktop:  '(min-width: 1024px)',
  }, (ctx) => {
    const { reduce, desktop } = ctx.conditions!;
    if (reduce) return;                                  // SSR'd static state stays

    const section = root, stage = q('.stage'), pov = q('.pov'), pan = q('.pov > g');
    const route = q<SVGPathElement>('.route-progress'), motion = q<SVGPathElement>('.route-motion');
    const marker = q('.marker'), cards = qa('[data-t]');
    const L = route.getTotalLength();
    gsap.set(route, { strokeDasharray: L, strokeDashoffset: L });      // undo the SSR "drawn" state only when animating
    gsap.set(cards, { autoAlpha: 0.35, y: 16 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8,
        invalidateOnRefresh: true, snap: { snapTo: 'labelsDirectional', duration: { min: .2, max: .6 }, delay: .05 } },
    });

    tl.to(route, { strokeDashoffset: 0, duration: 1 }, 0);
    tl.to(marker, { duration: 1, immediateRender: true,
      motionPath: { path: motion, align: motion, alignOrigin: [0.5, 0.5], autoRotate: true } }, 0);

    // camera: zoom beats per leg (2.2 wide over the sea, 3.4 tight on a city)
    const zoom = desktop ? [2.2, 3.4] : [1.6, 2.4];
    legs.forEach(({ tStart, tEnd }) => {
      tl.fromTo(pov, { scale: zoom[1] }, { scale: zoom[0], ease: 'power1.inOut', duration: (tEnd - tStart) / 2 }, tStart)
        .to(pov, { scale: zoom[1], ease: 'power1.inOut', duration: (tEnd - tStart) / 2 }, tStart + (tEnd - tStart) / 2);
    });

    // camera follows marker (Codrops ScrollMap technique)
    const toX = gsap.quickTo(pan, 'x', { duration: 1, ease: 'expo' });
    const toY = gsap.quickTo(pan, 'y', { duration: 1, ease: 'expo' });
    tl.eventCallback('onUpdate', () => {
      const { x, y } = MotionPathPlugin.getPositionOnPath(motion, tl.progress(), false);
      toX(-x); toY(-y);
      setActive(tl.progress());                                     // aria-current + data-active
    });

    milestones.forEach(m => tl.addLabel(m.id, m.t));
    milestones.forEach(m => tl.to(`[data-id="${m.id}"]`, { autoAlpha: 1, y: 0, duration: 0.04 }, m.t - 0.02));

    // MotionPath alignment is measured once → rebuild on width change (not height, to ignore address bar)
    let w = innerWidth;
    const ro = new ResizeObserver(() => { if (innerWidth === w) return; w = innerWidth;
      const p = tl.progress(); tl.scrollTrigger?.kill(); tl.kill(); mountJourney(root); ScrollTrigger.refresh(); });
    ro.observe(stage);
    return () => ro.disconnect();
  });
  return () => mm.revert();
}
```

Client gate (`JourneyController.client.tsx`): observe the section with `rootMargin: '100% 0px'`; on first intersection **or** first `wheel/touchstart/keydown` (whichever first), `requestIdleCallback(() => import('./journeyTimeline').then(m => m.mountJourney(el)))`. Lighthouse's lab run never scrolls, so the GSAP chunk never ships during the audit; real users get it before the section is on screen.

### 3.5 Optional three.js depth layer (desktop only, after the above is shipped)

Mount only if `matchMedia('(pointer:fine) and (min-width:1024px) and (prefers-reduced-motion:no-preference)')`, after idle, via `next/dynamic(..., { ssr: false })` inside a client component.

```ts
// JourneyDepthLayer.client.tsx (R3F) — a translucent map plane + cloud/particle layers that parallax with the same progress
<Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}>
  <Scene/>
</Canvas>

// Scene: build the SAME route in 3D from the projected points
const pts = waypointsProjected.map(p => new THREE.Vector3(p.x, 0, p.y));
const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
// read progress from the GSAP ScrollTrigger (single source of truth), not from Lenis directly
useEffect(() => journeyBus.on('progress', p => { target.current = p; invalidate(); }), []);
useFrame((state, dt) => {
  prog.current += (target.current - prog.current) * (1 - Math.exp(-6 * dt));   // exponential ease
  const pos = curve.getPointAt(prog.current), ahead = curve.getPointAt(Math.min(prog.current + 0.02, 1));
  camera.position.set(pos.x, 1.6, pos.z + 2.2); lookAt.lerp(ahead, 0.2); camera.lookAt(lookAt);
  if (Math.abs(target.current - prog.current) > 1e-4) invalidate();              // keep rendering only while settling
});
```

Hygiene: `IntersectionObserver` on the canvas → `setFrameloop('never')` when offscreen; `visibilitychange` → same; dispose textures on unmount; textures ≤ 2048², KTX2 if you add real imagery. Fallback is simply the 2D layer underneath — the 3D plane is decorative.

### 3.6 Mobile behaviour
- Keep the animation (it is cheap) but change the layout: stage `height: 46svh; position: sticky; top: 0`, cards scroll beneath it one per `~90svh`; zoom range 1.6–2.4; `viewBox` cropped tighter (Arabian Sea to SE Asia only).
- Lenis: `syncTouch: false` (native touch momentum), no `normalizeScroll` unless you see address-bar jitter; use `svh` units; rebuild only on *width* change.
- Hit-test: cards are ordinary DOM; snapping to labels helps thumb flicks land on a milestone.
- Images in cards via `next/image` with `sizes`, `loading="lazy"`.

### 3.7 Reduced-motion / no-JS static fallback (and what Lighthouse sees)
- SSR state = finished state: route stroke fully drawn, all city dots and the marker at Dubai, all cards `opacity: 1`. The animation chunk, when it runs, *resets* to the start before scrubbing (as in the outline), so the two never conflict.
- `gsap.matchMedia` `reduce` branch returns early; CSS `@media (prefers-reduced-motion: reduce) { .stage { position: static; height: auto } .journey { min-height: auto } }` collapses the tall section to a normal list with the map on top.
- Lenis already disables smoothing for these users; the Codrops/gsapvault/webdevpuneet examples all use the same "fully drawn when static" convention.
- Accessibility: `<ol>` of milestones with real headings/dates, `aria-current="step"` on the active one, `aria-hidden="true"` on the purely decorative marker/route, `<title>`/`<desc>` on the SVG, cards keyboard-focusable (focus → `tl.tweenTo(label)` for parity with pointer users).

---

## 4. Project-showcase interactions agencies use (and fit for 7–10 projects)

| Interaction | What it is / canonical build | References | Fit for 7–10 projects |
|---|---|---|---|
| **Phantom.land-style WebGL image grid** — infinite, draggable, barrel/lens-distorted plane grid, ambient drift against cursor, custom-ease snap | R3F + GLSL + GSAP `CustomEase`; Draco meshes, lazy images, LCP ≈ 1.3 s reported | [Codrops making-of (Jun 30 2025)](https://tympanus.net/codrops/2025/06/30/invisible-forces-the-making-of-phantom-lands-interactive-grid-and-3d-face-particle-system/) · [Awwwards "Work Grid"](https://www.awwwards.com/inspiration/work-grid-phantom-land-1) · [unaffiliated recreation](https://github.com/Aphrosidiac/PhantomClone) | Needs ≥20 tiles to feel infinite; with 7–10 you repeat tiles — acceptable as a hero wall, weak as *the* index. Heavy; desktop-first. |
| **Lusion-style real-time WebGL** — bespoke shader scenes per project, data baked into textures | Awwwards case study (2019; no newer public breakdown found) | [Awwwards case study](https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html) · [luruke/awesome-casestudy](https://github.com/luruke/awesome-casestudy) | Agency-tier effort; not recommended for a solo portfolio timeline. |
| **WebGL image rows / horizontal parallax gallery** — DOM-synced planes with scroll-velocity distortion | three.js planes mirroring DOM rects; Codrops 2026 builds it DOM-first then ports to WebGL | [Codrops "Horizontal Parallax Gallery: DOM → WebGL" (Feb 19 2026)](https://tympanus.net/codrops/2026/02/19/creating-a-smooth-horizontal-parallax-gallery-from-dom-to-webgl/) · [Codrops "Scroll-Revealed WebGL Gallery" (Feb 2 2026)](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) · [Codrops "Interactive Image Grid with Three.js" (Mar 18 2025)](https://tympanus.net/codrops/2025/03/18/building-an-interactive-image-grid-with-three-js/) · [Codrops "Sticky Grid Scroll" (Mar 2 2026, GSAP+ScrollTrigger+Lenis)](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) · [Codrops 2025 demo highlights (Vortex Gallery, Elastic Grid Scroll, WebGL Image Ring, Infinite Layers Grid)](https://tympanus.net/codrops/hub/2025-demo-highlights/) | **Good fit.** 7–10 cards in one or two rows is exactly the sweet spot; DOM-first means the fallback is free and WebGL is an enhancement. This is where your three.js budget belongs. |
| **Infinite drag gallery** — drag/scroll a plane grid that wraps | OGL/three + GSAP; R3F "infinite canvas" | [bizarro/infinite-webl-gallery](https://github.com/bizarro/infinite-webl-gallery) · [Codrops Infinite Circular Gallery (OGL)](https://tympanus.net/codrops/2021/02/23/creating-an-infinite-circular-gallery-using-webgl-with-ogl-and-glsl-shaders/) · [Codrops "Infinite Canvas" (Jan 7 2026, R3F)](https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/) · [21st.dev infinite-drag-scroll](https://21st.dev/@rylenlobo/components/infinite-drag-scroll) | Works with few items *if* each project contributes 2–3 images (≈25 tiles). Discovery is poor (no order) — fine for a "lab" page, not for a hiring-manager index. |
| **Sticky stacked cards** — each card pins, scales/dims as the next slides over | GSAP ScrollTrigger `pin` + scrub scale, or CSS scroll-driven animations (`animation-timeline: view()`) | [GreenSock "Stacking Cards" pen](https://codepen.io/GreenSock/pen/MWmVwpX) · [CodyHouse stacking cards](https://codyhouse.co/tutorials/how-stacking-cards) · [CSS/JS sticky stacking](https://codeshack.io/sticky-stacking-cards-scroll-effect/) · [21st.dev stacking-cards (Motion)](https://21st.dev/@danielpetho/components/stacking-cards.md) · [Codrops 3DStackMotion](https://www.github.com/codrops/3DStackMotion) | **Good fit** for 5–8 cards; past ~8 the scroll gets long. Pure DOM, Lighthouse-safe, works on mobile. Pairs naturally with the journey (products as cards). |
| **Hover-to-preview: image follows cursor over a text list** | GSAP `quickTo` on a fixed `<img>`/canvas; swap texture per item | [Codrops "Rapid Image Hover Menu" demo](https://tympanus.net/Tutorials/RapidImageHoverMenu/) · [Codrops "Menu Image Animation on Hover" (2020)](https://tympanus.net/codrops/2020/07/01/creating-a-menu-image-animation-on-hover/) · [Codrops cursor-tagged demos](https://tympanus.net/codrops/hub/tag/cursor/) · [Codrops GSAP gravity mouse trail (May 2026)](https://tympanus.net/codrops/2026/05/20/made-with-gsap-building-a-fun-gravity-based-mouse-trail/) · [Framer "Project Hover List" (layout reference)](https://www.framer.com/marketplace/components/project-hover-list/) | **Best fit** for exactly 7–10 projects: a dense, scannable, text-first list (name · role · year · stack) with a cursor-following preview on desktop and the preview inlined as a thumbnail on touch. Zero WebGL, excellent a11y, cheapest to ship. |

**Suggested combination for this portfolio:** journey map (pattern a) → "Products" as *hover-to-preview list* on desktop / *sticky stacked cards* on mobile (or vice-versa), with one WebGL *parallax image row* as the single showpiece if you want three.js on the page. Skip phantom-style grids and live map engines.

---

### Sources (consolidated)
GSAP: [MotionPathPlugin](https://gsap.com/docs/v3/Plugins/MotionPathPlugin) · [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger) · [gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) · [GSAP 3.13 free](https://gsap.com/blog/3-13/) · [Webflow: GSAP free](https://webflow.com/blog/gsap-becomes-free) · [AirPods forum thread](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/)
Codrops: [ScrollMap (May 2026)](https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/) ([mirror](https://blog.goodlaptops.com/programming/creating-scroll-pushed-svg-map-animations-with-gsap), [demo](https://tympanus.net/Tutorials/ScrollMap/)) · [Curved Path (Dec 2025)](https://tympanus.net/codrops/2025/12/17/building-responsive-scroll-triggered-curved-path-animations-with-gsap/) · [Cinematic 3D Scroll (Nov 2025)](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) ([repo](https://github.com/JosephASG/codrops-cinematic-scroll-animations), [demo](https://tympanus.net/Tutorials/Cinematic3DScroll/)) · [Blender Camera Path (Jul 2026)](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/) · [Scroll-Reactive 3D Gallery (Mar 2026)](https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/) · [Theatre.js fly-through (2023)](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/) · [Scroll-based three.js (2022)](https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/) · [OPTIKKA frame sequences (Oct 2025)](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/) · [Phantom.land making-of (Jun 2025)](https://tympanus.net/codrops/2025/06/30/invisible-forces-the-making-of-phantom-lands-interactive-grid-and-3d-face-particle-system/) · [Horizontal Parallax Gallery (Feb 2026)](https://tympanus.net/codrops/2026/02/19/creating-a-smooth-horizontal-parallax-gallery-from-dom-to-webgl/) · [Scroll-Revealed WebGL Gallery (Feb 2026)](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/) · [Interactive Image Grid (Mar 2025)](https://tympanus.net/codrops/2025/03/18/building-an-interactive-image-grid-with-three-js/) · [Sticky Grid Scroll (Mar 2026)](https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/) · [Infinite Canvas (Jan 2026)](https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/) · [Infinite Circular Gallery (2021)](https://tympanus.net/codrops/2021/02/23/creating-an-infinite-circular-gallery-using-webgl-with-ogl-and-glsl-shaders/) · [Draggable Timeline (2022)](https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/) · [Menu Image Hover (2020)](https://tympanus.net/codrops/2020/07/01/creating-a-menu-image-animation-on-hover/) · [Rapid Image Hover Menu demo](https://tympanus.net/Tutorials/RapidImageHoverMenu/) · [2025 demo highlights](https://tympanus.net/codrops/hub/2025-demo-highlights/) · [cursor tag](https://tympanus.net/codrops/hub/tag/cursor/) · [GSAP mouse trail (May 2026)](https://tympanus.net/codrops/2026/05/20/made-with-gsap-building-a-fun-gravity-based-mouse-trail/)
CodePens: [creativeocean minimal](https://codepen.io/creativeocean/pen/azBZmdx) · [creativeocean camera](https://codepen.io/creativeocean/pen/jEVryKm) · [GreenSock path on scroll](https://codepen.io/GreenSock/pen/rNOBLBV) · [mvaneijgen](https://codepen.io/mvaneijgen/pen/mdLaGNP) · [mikeK map](https://codepen.io/mikeK/pen/rNWzGaa) · [GreenSock AirPods](https://codepen.io/GreenSock/pen/ZEqxKyb) · [tomzidani AirPods](https://codepen.io/tomzidani/pen/xxmpVBX) · [GreenSock Stacking Cards](https://codepen.io/GreenSock/pen/MWmVwpX) · [cameronknight horizontal](https://codepen.io/cameronknight/pen/qBNvrRQ)
Other: [gsapvault Scroll Path Journey](https://gsapvault.com/blog/animate-element-along-svg-path-gsap) · [webdevpuneet scroll path](https://webdevpuneet.com/website-section-templates/scroll-path/) · [buildwithmatija timeline](https://www.buildwithmatija.com/blog/gsap-scrolltrigger-react-timeline) · [aetumi camera method](https://aetumi.app/news/threejs-camera-scroll-animation/) · [Wawa Sensei Atmos](https://wawasensei.dev/tuto/recreating-atmos-3d-website-with-react-three-fiber-part-1-curved-path) · [Wawa Sensei scroll](https://wawasensei.dev/tuto/react-three-fiber-tutorial-scroll-animations) · [drei ScrollControls](https://drei.docs.pmnd.rs/controls/scroll-controls) · [R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas) · [Lenis](https://github.com/darkroomengineering/lenis) · [lenis/react](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md) · [Next.js + GSAP + Lenis guide](https://www.hontran.dev/blog/nextjs-smooth-scroll-gsap-lenis) · [cobe](https://github.com/shuding/cobe) · [react-globe.gl](https://github.com/vasturiano/react-globe.gl) · [Aceternity globe](https://ui.aceternity.com/components/github-globe) · [Magic UI globe](https://magicui.design/docs/components/globe) · [cobe portfolio PR](https://github.com/lcspaiva87/lucas-paiva-portfolio/pull/2) · [MapLibre flyTo on scroll](https://maplibre.org/maplibre-gl-js/docs/examples/fly-to-a-location-based-on-scroll-position/) · [Mapbox Storytelling](https://labs.mapbox.com/education/impact-tools/interactive-storytelling/) · [digidem/maplibre-storymap](https://www.github.com/digidem/maplibre-storymap) · [image-sequence 9 fixes](https://dev.to/alki/image-sequence-scroll-animation-lagging-on-mobile-9-fixes-260k) · [scrollhaus canvas sequence](https://scrollhaus.ai/blog/image-sequence-scroll-animation-canvas/) · [francescocastronuovo](https://francescocastronuovo.com/learn/lessons/apple-style-image-sequence-webflow/) · [builder.io 3D GSAP](https://www.builder.io/blog/3d-gsap) · [three.js dirty-flag/mobile heat](https://dev.to/dheerajakula/why-a-static-threejs-scene-still-cooks-your-phone-and-the-dirty-flag-fix-3a6h) · [pixel-ratio governor](https://dev.to/jonasjavier/a-pixel-ratio-governor-for-threejs-that-doesnt-trust-60-fps-4380) · [lazy-load 3D scene](https://www.svilenkovic.com/3d/how-to-lazy-load-3d-scene) · [Phantom Awwwards](https://www.awwwards.com/inspiration/work-grid-phantom-land-1) · [PhantomClone](https://github.com/Aphrosidiac/PhantomClone) · [Lusion case study](https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html) · [bizarro infinite WebGL gallery](https://github.com/bizarro/infinite-webl-gallery) · [CodyHouse stacking cards](https://codyhouse.co/tutorials/how-stacking-cards) · [Framer Project Hover List](https://www.framer.com/marketplace/components/project-hover-list/) · [Awwwards Paxafe](https://www.awwwards.com/inspiration/timeline-scroll-animation-paxafe)

No files were created or modified (plan mode / read-only task).
