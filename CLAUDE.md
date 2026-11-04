# tarun-portfolio — CLAUDE.md

Personal portfolio for Tarun Shukla (Dubai). Goal: get hired for Head of Digital / AI-native full-stack roles and win SME clients, with evidence-led case studies. Read `docs/PURPOSE.md` once; `docs/PRD.md`, `docs/DESIGN_CONCEPT.md` and `docs/ARCHITECTURE.md` are normative. Research evidence lives in `docs/research/`.

Stack: Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript strict, CSS Modules + tokens, GSAP + Lenis, vanilla three.js, Resend. Vercel.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run check` — lint + typecheck + build (run before claiming anything works)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lighthouse` — builds nothing; starts `next start` on :3100 and audits mobile + desktop; fails below 100. `LH_RUNS=3` for the median; `LH_URL=https://…` to audit a deployment.
- `npm run images` — `scripts/optimize-images.mjs` (assets/src → public/images + manifest)
- `npm run shots` — `scripts/screenshots.mjs` (Playwright captures of the live sites)

## Conventions

- Server components by default. `'use client'` only in `components/motion/**` and `components/scene/**` and leaf form/toggle components.
- Cache Components rules: no route-segment config exports; content getters are `async` + `'use cache'` + `cacheLife('max')`; `await params` inside `<Suspense>`; `generateStaticParams` returns real slugs; `ensureStatic = 'navigation'` stays in the root layout.
- Never call `new Date()`, `Math.random()` or `crypto.randomUUID()` during prerender (build error). Footer year is a cached component; sitemap dates come from content.
- Content is typed data in `src/content/**`, never JSX. Every metric has a `source`. If a number isn't in the résumé, deliverables sheet or Halfyearly-Report, write `TODO: verify` — do not invent.
- Design tokens (`src/styles/tokens.css`) are the only source of colour/type/space/motion values. No raw hex or magic durations in components.
- Animation code lives only in `components/motion/**` (GSAP/Lenis/ViewTransition) and `components/scene/**` (three). One RAF loop: `gsap.ticker` drives Lenis and the renderer.
- Heavy modules are dynamic-imported from client components and mounted via `afterInteraction()` / IntersectionObserver, init chunked with `scheduler.yield()`. Every scene: DPR cap, pause offscreen/hidden, silent WebGL fallback, dispose on unmount, `aria-hidden`, DOM twin.
- Reveals: only `transform`/`opacity`/`clip-path` in reserved boxes; SplitText after `document.fonts.ready`; nothing above the fold starts at `opacity: 0` (it would move LCP).
- Copy: sentence case, no superlatives ("best", "top", "#1"), no "hire me", one Dubai/UAE mention per page, one accent word per headline, no `→` decorations, no emoji icons.
- Images: `next/image` with `sizes`; `preload` (not `priority`) only on an LCP image; screenshots in `BrowserFrame`.
- Accessibility: skip link, one `<main>`, unique titles, focus visible, ≥ 24 px targets, no `maximum-scale`, reduced-motion parity.

## Do not

- Do not add Tailwind, Motion/framer-motion, R3F, or any animation/component library. Reference libraries (React Bits, Motion Primitives, Fancy) are for reading, not installing.
- Do not use `as any`, barrel `index.ts` files, or `images.domains`.
- Do not copy phantom.land / reel screens, copy or assets. We rebuild mechanics with our own content and art.
- Do not add third-party scripts (fonts, analytics, embeds) beyond Vercel Analytics/Speed Insights.
- Do not commit raw renders > 2 MB; run `npm run images` and commit outputs.
- Do not touch `docs/research/*` — they are evidence, not instructions.
- Do not weaken security headers or add CSP nonces (incompatible with static prerender).

## Verification before "done"

1. `npm run check`
2. `LH_RUNS=3 npm run lighthouse` → 100/100/100/100 mobile **and** desktop for every touched route
3. Console empty (errors and warnings) in a production build
4. 390 px and 1440 px screenshots compared against `docs/DESIGN_CONCEPT.md`
5. `prefers-reduced-motion: reduce` walkthrough reads identically
6. `/design-review <glob>` on touched components

## Gotchas

- Lighthouse's `requestIdleCallback` fires immediately in lab runs — defer by interaction/visibility or wall-clock, never by idle (`src/lib/after-interaction.ts` explains why).
- `next/image` `priority` is deprecated in 16 → `preload`; `qualities` must be allow-listed.
- `middleware.ts` is `proxy.ts` in 16 — but this site has none and should stay that way.
- Vercel Hobby: 5K image transformations/month; static imports are keyed by content hash so redeploys don't re-transform.
- Higgsfield outputs are deleted after 7 days — download into `assets/src/` immediately.
- `gh` and Vercel: repo `taarunn99/tarun-portfolio`, Vercel project `tarun-portfolio` in team `tarun-shuklas-projects`.

## Skills

`/design-review`, `/motion`, `/images`, `/case-study`, `/seo-audit`, `/ship`, `/reverse-engineer-anything` (see `.claude/skills/`). Reference skills under `.claude/skills/_reference/` (frontend-design, web-design-guidelines, react-best-practices, gsap-*).
