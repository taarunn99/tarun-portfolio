# Tarun Shukla — Portfolio

**Live:** https://tarun-portfolio-pearl.vercel.app

Personal portfolio built for speed and for getting hired: **Lighthouse 100 / 100 / 100 / 100** on every route, mobile and desktop, enforced locally and in CI.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Partial Prefetching) · React 19.3 · TypeScript strict |
| Styling | CSS Modules + design tokens (`src/styles/tokens.css`, OKLCH dark + paper themes) |
| Motion | GSAP 3.15 (ScrollTrigger, SplitText, MotionPath) + Lenis on one `gsap.ticker`, React `<ViewTransition>` for routes |
| 3D | Vanilla three.js 0.187 (one renderer per scene, render-on-demand, DPR-capped, disposed on unmount) |
| Fonts | Geist · Geist Mono · Instrument Serif Italic via `next/font` |
| Content | Typed data in `src/content/**` — every metric carries a `source` |
| Contact | Server Action → Resend (+ Cloudflare Turnstile, honeypot, timing check); `mailto:` fallback when unconfigured |
| QA | ESLint · `tsc` · Lighthouse runner (`scripts/lighthouse.mjs`) · GitHub Actions |

## Showpieces

- **Hero "signal field"** — a point cloud that resolves out of noise into a procedural wireframe Dubai skyline (Burj Khalifa, Burj Al Arab, Museum of the Future, 13 towers). `src/components/scene/hero/`.
- **Work grid** (`/work`) — an infinite, curved, draggable WebGL grid of the 12 case-study covers: runtime atlas, hover glow, press-zoom, inertia, hand-written lens pass, keyboard pan. The DOM index underneath is the accessible twin. `src/components/scene/work-grid/`.
- **The route** (`/about`, teaser on `/`) — scroll-driven SVG route Bhopal → Singapore → Dubai with a MotionPath marker, camera pan/zoom and milestone cards; click a painting to **enter the scene**: a three.js 2.5D diorama with the milestones floating along a path. `src/components/scene/journey/`.

Everything heavy loads only after the first user gesture (or 3.5 s after `load`), never on touch for the WebGL grid/diorama, and never under `prefers-reduced-motion`. The LCP element on every page is text.

## Scripts

```bash
npm run dev          # dev server
npm run check        # lint + typecheck + build
npm run lighthouse   # audit mobile + desktop; LH_PATHS="/,/work" LH_RUNS=3 LH_URL=https://… npm run lighthouse
npm run shots        # Playwright screenshots of the live client sites → assets/src/screens
npm run images       # sharp + thumbhash pipeline → public/images + src/lib/images/manifest.json
```

## Repo system

`CLAUDE.md` (conventions, do-nots, verification), `docs/` (PURPOSE, PRD, DESIGN_CONCEPT, ARCHITECTURE, case-study template, ADRs, 10 research reports), `.claude/skills/` (design-review, motion, images, case-study, seo-audit, ship + vendored reference skills), `.claude/rules/` (path-scoped rules).

## Deploy

Pushes to `main` deploy to Vercel (project `tarun-portfolio`, framework preset Next.js). Production env: `NEXT_PUBLIC_SITE_URL`, `CONTACT_TO`; add `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to enable the form.
