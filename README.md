# Tarun Shukla — Portfolio

Personal portfolio built for speed. Target: **100 / 100 / 100 / 100** in Lighthouse on mobile and desktop, enforced in CI.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components) | Static-first rendering, `next/font`, metadata routes |
| Language | TypeScript (strict) | Type safety end to end |
| 3D | [Three.js](https://threejs.org) | Hero particle scene, custom GLSL |
| Scroll | [Lenis](https://lenis.darkroom.engineering) | Smooth wheel scrolling; native on touch |
| Styling | CSS Modules + design tokens | Zero runtime, tiny CSS |
| Fonts | Archivo + Space Grotesk via `next/font` | Self-hosted, preloaded, no layout shift |
| QA | ESLint, `tsc`, Lighthouse | Fails CI below 100 |

## Performance architecture

- **LCP is text.** The hero heading is server-rendered with preloaded, self-hosted fonts. Nothing render-blocking comes from a third party.
- **Three.js never touches the critical path.** It ships as its own chunk and mounts only on the first user gesture or after `load` + idle. It is skipped entirely for `prefers-reduced-motion` and Data Saver.
- **The scene pays for itself.** Pixel ratio is capped (1.5 on touch, 2 on desktop), particle count scales with the device, rendering pauses when the hero is off-screen or the tab is hidden, and everything is disposed on unmount.
- **Lenis is dynamically imported** and left off on touch devices, so mobile INP stays native.
- **No layout shift.** Fonts use `display: swap` with metric-compatible fallbacks, and the canvas is absolutely positioned inside a fixed-size hero.
- **Security headers** (`HSTS`, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.

## Scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run start        # serve the production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run check        # lint + typecheck + build
npm run lighthouse   # build first, then audit mobile + desktop → ./reports
```

`npm run lighthouse` starts the production server on port 3100, audits it in headless Chrome, writes HTML + JSON reports to `reports/`, and exits non-zero if any category is below `LH_MIN` (default 100). Set `LH_RUNS=3` to keep the median performance run; set `LH_URL` to audit a deployed site instead.

## Content

Every piece of copy lives in [`src/lib/site.ts`](src/lib/site.ts). Items marked `TODO` are placeholders — update your role, email, socials and projects there.

## Deploy

Deployed on Vercel. Set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical URLs, Open Graph tags, `robots.txt` and `sitemap.xml` resolve correctly.
