---
name: motion
description: Rules and recipes for animation in this repo — GSAP + ScrollTrigger + SplitText, Lenis on gsap.ticker, React ViewTransition, three.js scenes — with the Lighthouse-100 guardrails. Use when writing or changing anything in src/components/motion or src/components/scene, adding a reveal, scroll effect, page transition, cursor, marquee or WebGL scene.
paths: src/components/motion/**, src/components/scene/**, src/styles/tokens.css
---

# Motion

Read `docs/DESIGN_CONCEPT.md` §3 (motion tokens) and §4 first. Reference docs: `.claude/skills/_reference/gsap-*` (official GSAP skills) and `docs/research/01-animation-ui-libraries.md`, `docs/research/07-journey-animation-patterns.md`, `docs/research/05-phantom-land-teardown.md` §4.

## Non-negotiables

1. **One RAF loop.** `GsapProvider` registers plugins and owns `gsap.ticker`. Lenis is created with `autoRaf: false` and ticked from `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`; `lenis.on('scroll', ScrollTrigger.update)`. The three renderer renders from the same ticker, on demand.
2. **Gate heavy work.** `three`, scenes, `gsap/SplitText` are `dynamic(() => import(), { ssr: false })` inside client components; mount via `afterInteraction()` (`src/lib/after-interaction.ts`) and/or IntersectionObserver; chunk init with `await scheduler.yield()` between steps (import → renderer → compile → textures). Never use `requestIdleCallback` as the gate (it fires instantly in Lighthouse).
3. **LCP/CLS safety.** Nothing above the fold starts at `opacity: 0` or `visibility: hidden` in HTML. Reveals use `yPercent 110 → 0` inside `overflow: clip` wrappers or `clip-path`; boxes reserve their size. SplitText only after `document.fonts.ready` with `autoSplit: true` and tweens created in `onSplit`.
4. **Reduced motion.** Every effect is wrapped in `gsap.matchMedia()` with a `reduce` branch that returns early; no Lenis, no scenes, ViewTransition durations 0 via CSS.
5. **Scenes.** DPR `Math.min(devicePixelRatio, coarse ? 1.5 : 2)`; `IntersectionObserver` + `visibilitychange` pause; `failIfMajorPerformanceCaveat` + try/catch with a silent fallback (never `console.error`); dispose geometry/materials/textures and `renderer.forceContextLoss()` on unmount; canvas `aria-hidden`, `pointer-events: none` unless it owns input; a DOM twin carries the content.
6. **Tokens only.** Easings/durations from `tokens.css` or GSAP equivalents (`expo.out` = `--ease-out-expo`, `power4.out` = `--ease-out-quint`, `power3.out` = `--ease-out-quart`).

## Recipes

- **Masked line reveal:** `SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: .8, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 80%', once: true } }) })`.
- **Image curtain:** `gsap.fromTo(wrapper, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)', duration: 1, ease: 'power4.out' })` + inner `scale 1.15 → 1`.
- **Counter:** tween an object `{ v: 0 }` → target with `snap: { v: 1 }`, format with `Intl.NumberFormat`, `once`.
- **Magnetic:** `gsap.quickTo(el, 'x', { duration: .4, ease: 'power3' })` on pointermove within radius; reset on leave; `pointer: fine` only.
- **Page transition:** React `<ViewTransition>` with `name` on thumbnail + hero; CSS `::view-transition-old/new` durations from tokens; `@media (prefers-reduced-motion: reduce)` → 0 s.
- **Scroll-linked route (journey):** ScrollTrigger `scrub: .8`, sticky stage, MotionPath marker, `quickTo` camera pan, labels per milestone, `snap: 'labelsDirectional'`; rebuild on width change only.

## Verification

`npm run check` → `LH_RUNS=3 npm run lighthouse` on the touched route → reduced-motion walkthrough → console empty.
