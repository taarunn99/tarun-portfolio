---
paths: src/components/motion/**, src/components/scene/**
---

All files here are `'use client'`. GSAP plugins register once in `motion/gsap.ts`; Lenis ticks from `gsap.ticker` (`autoRaf: false`); the three renderer is a singleton rendered on demand from the same ticker. Heavy imports are dynamic and gated by `afterInteraction()` / IntersectionObserver, with `scheduler.yield()` between init steps. Reveals only animate transform/opacity/clip-path in reserved boxes; nothing above the fold starts hidden. Every effect has a `prefers-reduced-motion` branch. Every scene caps DPR, pauses offscreen/hidden, falls back silently without WebGL, disposes on unmount, is `aria-hidden`, and has a DOM twin. Easings/durations come from `src/styles/tokens.css`. See `/motion`.
