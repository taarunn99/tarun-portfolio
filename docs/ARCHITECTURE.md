# Architecture — what belongs where

Status: normative · Evidence: `research/09-nextjs16-seo-perf-checklist.md`, `research/01`, `research/05`, `research/10`

## 1. Stack

Next.js 16.4 (App Router, **Cache Components**, Partial Prefetching, Turbopack) · React 19.3 · TypeScript strict · CSS Modules + design tokens · GSAP 3.15 (+ ScrollTrigger, SplitText, MotionPath; `@gsap/react`) · Lenis 1.3 · three 0.187 (vanilla) · Resend + zod (contact) · `@vercel/analytics` + Speed Insights · sharp + thumbhash (build-time images) · Playwright (screenshots) · Lighthouse + `@lhci/cli` (gates). Deployed on Vercel.

## 2. Directory map

```
src/app/                      Routes ONLY. Server components. Each page = metadata + Suspense-wrapped content.
  layout.tsx                  fonts, providers, skip link, JSON-LD (WebSite + Person), ensureStatic
  page.tsx                    home
  work/page.tsx               work index
  work/[slug]/page.tsx        case study (+ opengraph-image.tsx)
  services/[slug]/page.tsx    3 services (+ opengraph-image.tsx)
  about/page.tsx · resume/page.tsx · contact/page.tsx
  llms.txt/route.ts · sitemap.ts · robots.ts · manifest.ts · icon.svg · opengraph-image.tsx
  contact/actions.ts          Server Action (Resend)
src/content/                  Typed data = single source of truth. No JSX. Every metric has `source`.
  site.ts · case-studies/*.ts · services.ts · journey.ts · resume.ts · capabilities.ts
src/lib/                      Pure utilities, framework-agnostic where possible.
  seo/jsonld.ts · seo/metadata.ts · images/manifest.json · after-interaction.ts · format.ts · env.ts
src/components/ui/            Presentational primitives (server-safe). No animation imports.
src/components/motion/        The ONLY place GSAP/Lenis/ViewTransition code lives. All 'use client'.
src/components/scene/         The ONLY place three.js lives. All 'use client', all dynamic-imported.
src/components/sections/      Page sections composed from ui + motion + content.
src/styles/                   tokens.css (colour/type/space/motion), globals.css, themes.css
public/images/                Optimised outputs (committed). public/fonts only if local fonts needed.
assets/src/                   Raw screenshots / renders (git-ignored above 2 MB; manifest commits).
scripts/                      lighthouse.mjs · optimize-images.mjs · screenshots.mjs · indexnow.mjs
docs/                         PURPOSE · PRD · DESIGN_CONCEPT · ARCHITECTURE · CASE_STUDY_TEMPLATE · research/ · decisions/
.claude/                      skills/ (project procedures) · rules/ (path-scoped) · settings.json (hooks)
```

Rule of thumb: **content → lib → ui → motion/scene → sections → app**. Imports only flow in that direction.

## 3. Rendering model (Cache Components)

- Everything is prerendered. `export const ensureStatic = 'navigation'` in the root layout fails the build if anything becomes request-time.
- No route-segment config exports (`dynamic`, `revalidate`, `runtime`…).
- Content getters: `async`, `'use cache'`, `cacheLife('max')`, serialisable returns (strings, not `URL`).
- Dynamic routes: `generateStaticParams` returns real slugs; `await params` **inside** a `<Suspense>` boundary; unknown slug → `notFound()`.
- Never `new Date()`, `Math.random()`, `crypto.randomUUID()` during prerender. Footer year = cached component; sitemap dates come from content.
- Metadata: root `metadataBase` + `title.template`; per-route `generateMetadata` reading cached content.

## 4. Motion & scene runtime

- **One RAF loop.** `GsapProvider` registers plugins once and owns `gsap.ticker`; `LenisProvider` creates Lenis with `autoRaf: false`, ticks it from `gsap.ticker`, and calls `ScrollTrigger.update` on scroll. The three renderer singleton renders on demand from the same ticker.
- **Gating.** Heavy modules (`three`, scenes, `gsap/SplitText`) are `dynamic(() => import(...), { ssr: false })` inside client components and mount via `afterInteraction()` (first gesture or 3.5 s after `load`) and/or IntersectionObserver. Init is chunked with `scheduler.yield()` so no task exceeds 50 ms on a 4× throttled CPU.
- **Every scene** must: cap DPR (1.5 touch / 2 desktop), render on demand or pause when offscreen/hidden, feature-detect WebGL silently, dispose on unmount, add `aria-hidden`, and have a DOM twin for content.
- **Reveals** animate only `transform`/`opacity`/`clip-path` inside reserved boxes; SplitText runs after `document.fonts.ready` (`autoSplit`); nothing above the fold starts at `opacity: 0`.
- **Reduced motion:** `gsap.matchMedia()` branches; no Lenis; no scenes; ViewTransition durations 0.

## 5. Data flow

`src/content/*` (typed) → page server components (`'use cache'` getters) → sections (props) → ui/motion. Client components receive plain props; they never import content directly (keeps content out of client bundles).

Case-study type (see `CASE_STUDY_TEMPLATE.md`): `{ slug, title, client, year, role, summary, headlineMetric: Metric, metrics: Metric[], sections: { context, constraint, approach, result, stack: string[], retrospective }, cover: ImageRef, gallery: ImageRef[], links: { live?, repo? }, tags: Tag[], featured: boolean, services: ServiceSlug[] }` where `Metric = { label, value, source }`.

## 6. Images

`assets/src/**` → `scripts/optimize-images.mjs` (sharp: normalise ≤ 2560 px, strip metadata, AVIF + WebP width variants, thumbhash `blurDataURL`, OG JPEG 1200×630) → `public/images/**` + `src/lib/images/manifest.json`. Components reference manifest ids; `next/image` adds responsive `srcset`; the LCP image (if ever an image) uses `preload` + `fetchPriority="high"`. Screenshots come from `scripts/screenshots.mjs` (Playwright, 1440×900 @2x + iPhone 15 @3x).

## 7. Contact

`contact/actions.ts` (Server Action): zod-validate → honeypot empty → `fillTime ≥ 3000 ms` → Turnstile `siteverify` → Resend `emails.send({ to: env.CONTACT_TO, replyTo: email })`. If `RESEND_API_KEY` is absent, the UI shows a `mailto:` fallback. Edge rate limit via Vercel WAF (dashboard).

## 8. Security headers

`next.config.ts` `headers()`: CSP (`default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`), HSTS preload, COOP same-origin, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options DENY. Nonces are deliberately not used (incompatible with static prerender; `csp-xss` is informational in Lighthouse).

## 9. Quality gates

`npm run check` (lint + typecheck + build) → `LH_RUNS=3 npm run lighthouse` (mobile + desktop, fails < 100) → CI on push → Lighthouse CI on Vercel previews (`deployment_status`). A `Stop` hook runs `tsc --noEmit` after every Claude Code session.

## 10. Environment variables

`NEXT_PUBLIC_SITE_URL` · `CONTACT_TO` · `RESEND_API_KEY` · `RESEND_FROM` (default `onboarding@resend.dev`) · `TURNSTILE_SECRET_KEY` · `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. All read through `src/lib/env.ts`; public ones must be prefixed.
