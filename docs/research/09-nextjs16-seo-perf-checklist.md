<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

Research complete. Below is the structured checklist. Everything cited is from live docs fetched today (nextjs.org v16 docs, web.dev, Chrome Lighthouse docs/source, LHCI docs, GSAP/Lenis READMEs); where I had to infer, I say so.

---

# Next 16.4 + Lighthouse 100×4 implementation checklist

## 0. Scoring facts that shape everything below

- **Performance weights (Lighthouse 13 `default-config.js`)**: TBT 30, LCP 25, CLS 25, FCP 10, SI 10, **INP 0** (not lab-measurable). A composite 100 needs every metric at ~100 — on the default mobile run (simulated slow-4G, 4× CPU slowdown) that means effectively **zero long tasks between FCP and TTI, CLS ≈ 0, LCP ≈ ≤1.2 s**. Source: `https://raw.githubusercontent.com/GoogleChrome/lighthouse/main/core/config/default-config.js`, `https://developer.chrome.com/docs/lighthouse/performance/performance-scoring`
- **Accessibility**: weighted average of pass/fail audits, no partial credit. One failing weighted audit = < 100. `https://developer.chrome.com/docs/lighthouse/accessibility/scoring`
- **Best Practices scored audits (weight)**: `is-on-https` 5, `deprecations` 5, `third-party-cookies` 5, `paste-preventing-inputs` 3, `redirects-http` 1, `geolocation-on-start` 1, `notification-on-start` 1, `image-aspect-ratio` 1, `image-size-responsive` 1, `doctype` 1, `charset` 1, `errors-in-console` 1, `inspector-issues` 1.
  **Informational (weight 0, never move the score)**: `csp-xss`, `has-hsts`, `origin-isolation` (COOP), `clickjacking-mitigation`, `trusted-types-xss`, `baseline`, `js-libraries`, `valid-source-maps`.
- **Lighthouse 13.0.0 removed**: `offscreen-images`, `uses-rel-preload`, `preload-fonts`, `font-size`, `no-document-write`, `uses-passive-event-listeners`, `third-party-facades`, `first-meaningful-paint`; several legacy perf audits replaced by "insights"; min Node 22.19. **Lighthouse 12 removed LightWallet budgets** (`performance-budget`/`timing-budget`), which matters for §5. `https://github.com/GoogleChrome/lighthouse/releases/tag/v13.0.0`, `https://github.com/GoogleChrome/lighthouse/releases/tag/v12.0.0`

---

## 1. Next.js 16 specifics

### 1.1 Config baseline
```ts
// next.config.ts
import type { NextConfig } from 'next'
const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,          // 16.3+, must be set explicitly or you get a warning
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75],             // REQUIRED allowlist in v16 (default [75])
  },
  // headers()/redirects() below
}
export default config
```
- `cacheComponents` requires Node runtime; **remove every `runtime`, `dynamic`, `revalidate`, `fetchCache`, `dynamicParams`, `experimental_ppr` export** — they error. `https://nextjs.org/docs/app/guides/migrating-to-cache-components`
- Regression guard once everything is static: `export const ensureStatic = 'navigation'` in `app/layout.tsx` (16.4). Build fails if anything introduces request-time server work (uncached fetch, `connection()`, cookies/headers, `cacheLife` with `expire` < 5 min). `https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic`

### 1.2 `'use cache'` rules and the `new Date()` error you hit
- Cached fns/components must be `async`; args and return values must be serializable (**no `URL` instances** — return `metadataBase` as a string if `generateMetadata` is cached; no class instances/functions except pass-through `children`/Server Actions).
- Cannot call `cookies()`/`headers()`/read `searchParams` inside (`next-request-in-use-cache`). Can `await` a `params` promise passed in when `generateStaticParams` makes them build-time known (docs' route-handler example does exactly this).
- Set an explicit `cacheLife()` in every scope. Presets: `max` = stale 5 min / revalidate 30 d / expire 1 y. Only `seconds` is excluded from prerender; `stale` < 30 s excluded; `stale` 30 s–5 min excluded from App Shell. `https://nextjs.org/docs/app/api-reference/functions/cacheLife`
- **`new Date()`/`Date.now()`/`Math.random()`/`crypto.randomUUID()` during prerender is a build error that `instant = false` does not clear.** Four fixes from `https://nextjs.org/docs/messages/next-prerender-current-time`:
  1. diagnostics → `performance.now()`
  2. value may be frozen at build/revalidate → move into a `'use cache'` scope
     ```tsx
     async function Footer() { 'use cache'; cacheLife('days'); return <p>© {new Date().getFullYear()}</p> }
     ```
  3. display-only → Client Component (needs a `<Suspense>` above it)
  4. must be per-request on server → `await connection()` first, inside `<Suspense>`
  - Typical portfolio offenders: footer year, `lastModified: new Date()` in `sitemap.ts` (use dates from content frontmatter instead), `Math.random()` ids for animation targets (use `useId()` on the client or stable ids), third-party libs reading time at import.
- Docs: `https://nextjs.org/docs/app/api-reference/directives/use-cache`

### 1.3 `generateStaticParams` under cacheComponents
- Must return **≥ 1 param** (empty array = build error `empty-generate-static-params`). `dynamicParams` is unsupported → call `notFound()` for unknown slugs.
- With partial prefetching, **await `params` inside `<Suspense>`**, not at the top of the page, so the App Shell stays URL-independent:
  ```tsx
  // app/work/[slug]/page.tsx
  export async function generateStaticParams() { return caseStudies.map(c => ({ slug: c.slug })) }
  export default function Page({ params }: PageProps<'/work/[slug]'>) {
    return (<Suspense fallback={<CaseStudySkeleton />}><CaseStudy params={params} /></Suspense>)
  }
  async function CaseStudy({ params }: Pick<PageProps<'/work/[slug]'>, 'params'>) {
    const { slug } = await params
    const cs = await getCaseStudy(slug)   // 'use cache' + cacheLife('max') inside
    if (!cs) notFound()
    return <article>…</article>
  }
  ```
  `https://nextjs.org/docs/app/api-reference/functions/generate-static-params`, `https://nextjs.org/docs/app/guides/adopting-partial-prefetching`

### 1.4 `generateMetadata` per route
```tsx
import type { Metadata, ResolvingMetadata } from 'next'
export async function generateMetadata({ params }: PageProps<'/work/[slug]'>, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params
  const cs = await getCaseStudy(slug)            // cached getter
  const prev = (await parent).openGraph?.images ?? []
  return {
    title: cs.title,                            // root layout: title: { template: '%s | Tarun', default: 'Tarun' }
    description: cs.summary,
    alternates: { canonical: `/work/${slug}` }, // needs metadataBase in root layout
    openGraph: { type: 'article', title: cs.title, description: cs.summary, images: [...prev] },
    twitter: { card: 'summary_large_image' },
  }
}
```
- Put `metadataBase: new URL('https://your.domain')` + `title.template` + `robots` in root `layout.tsx`. Merging is shallow per key (`openGraph` in a page replaces the whole parent `openGraph`).
- Under cacheComponents, if `generateMetadata` fetches uncached data on an otherwise static page you get `blocking-prerender-metadata-dynamic`; fix with `'use cache'` on the data fn (or on `generateMetadata` itself, then return strings not `URL`). File-based `opengraph-image.tsx` beats `openGraph.images` in priority.
- Streaming metadata (15.2+) is skipped automatically for HTML-limited bots; leave `htmlLimitedBots` default.
- `https://nextjs.org/docs/app/api-reference/functions/generate-metadata`

### 1.5 Dynamic OG images per case study
```tsx
// app/work/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
export const alt = 'Case study'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// read at module scope: "predictable value", not request data
const font = await readFile(join(process.cwd(), 'assets/og/Satoshi-Bold.otf')) // ttf/otf/woff only (no woff2)
export { generateStaticParams } from './page'   // params Promise in v16; prerendered per slug
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cs = await getCaseStudy(slug)           // 'use cache' fn
  return new ImageResponse(<div style={{ display: 'flex', width: '100%', height: '100%', fontFamily: 'Satoshi' }}>{cs.title}</div>,
    { ...size, fonts: [{ name: 'Satoshi', data: font, weight: 700, style: 'normal' }] })
}
```
- Generated images are statically optimized unless they touch request-time APIs/uncached data. Flexbox-only CSS, 500 KB bundle cap (fonts count). `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image`, `https://nextjs.org/docs/app/api-reference/functions/image-response`

### 1.6 JSON-LD (server components)
```tsx
import type { Person, WithContext } from 'schema-dts'
const jsonLd: WithContext<Person> = { '@context': 'https://schema.org', '@type': 'Person', name: '…', url: '…', sameAs: ['…'] }
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
```
- Native `<script>`, **not** `next/script`; escape `<`; type with `schema-dts`. Put `Person`/`WebSite` in root layout, `CreativeWork`/`Article` + `BreadcrumbList` on `/work/[slug]`, `Service` on `/services/[slug]`. Data blocks aren't executed, so CSP `script-src` doesn't block them (no nonce needed). `https://nextjs.org/docs/app/guides/json-ld`

### 1.7 Sitemap, robots, llms.txt
```ts
// app/sitemap.ts  — one file, many entries; NO new Date()
import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://your.domain'
  return [
    { url: base, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 1 },
    ...['/work', '/about', '/contact', '/resume'].map(p => ({ url: base + p, lastModified: SITE_UPDATED, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...caseStudies.map(c => ({ url: `${base}/work/${c.slug}`, lastModified: c.updatedAt, images: [c.cover], priority: 0.7 })),
    ...services.map(s => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.6 })),
  ]
}
```
```ts
// app/llms.txt/route.ts  — dots in segment folders are fine (docs use app/rss.xml/route.ts)
export async function GET() {
  const body = `# Tarun Shukla\n\n> …\n\n## Work\n${caseStudies.map(c => `- [${c.title}](https://your.domain/work/${c.slug}): ${c.summary}`).join('\n')}\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
```
- Under cacheComponents, GET handlers prerender when they don't read uncached/runtime data; wrap any async fs/CMS read in `'use cache'`. `https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap`, `https://nextjs.org/docs/app/api-reference/file-conventions/route`

### 1.8 Redirects / headers
- `redirects()`: `permanent: true` → 308, `false` → 307. `headers()`: `source: '/:path*'`; last matching header wins. Execution order: `headers` → `redirects` → proxy → filesystem. Prefer `next.config` over `proxy.ts` for a static site (proxy runs on every request). `https://nextjs.org/docs/app/api-reference/config/next-config-js/headers`, `https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects`

### 1.9 `next/image`
- **v16: `priority` is deprecated → use `preload`**; prefer `fetchPriority="high"` for the LCP image. `sizes` is mandatory with `fill` (otherwise srcset assumes 100vw). `placeholder="blur"` is automatic for static imports; remote/dynamic images need a tiny `blurDataURL` (e.g. via `sharp` at build/`plaiceholder`). `qualities` allowlist required. Keep intrinsic aspect ratio or you fail the scored `image-aspect-ratio`/`image-size-responsive` audits — use `style={{ height: 'auto' }}` or `fill` + `object-fit`. `https://nextjs.org/docs/app/api-reference/components/image`

### 1.10 `next/font/local` with Fontshare files
```ts
// app/fonts.ts
import localFont from 'next/font/local'
export const satoshi = localFont({
  src: [
    { path: './fonts/Satoshi-Variable.woff2', weight: '300 900', style: 'normal' },
    { path: './fonts/Satoshi-VariableItalic.woff2', weight: '300 900', style: 'italic' },
  ],
  variable: '--font-sans', display: 'swap', preload: true,
  adjustFontFallback: 'Arial',          // local: 'Arial' | 'Times New Roman' | false — pick the metric-closest one
})
```
- Apply `className={satoshi.variable}` on `<html>`; `@theme inline { --font-sans: var(--font-sans) }` for Tailwind v4. Define fonts in one module and import (each call = one self-hosted instance). Preload only fonts used above the fold; `display: 'optional'` is the zero-CLS option if you accept a possible fallback paint. `https://nextjs.org/docs/app/api-reference/components/font`

### 1.11 View Transitions in Next 16
- Guide (updated 2026-10-15): "View transitions work in the App Router with **no configuration**. React 19.3 includes `<ViewTransition>` and `addTransitionType`." `import { ViewTransition } from 'react'`. The `experimental.viewTransition` config page still exists in 16.2.x docs; a GitHub discussion says the flag is gone — try without it on 16.4, add the flag only if nothing animates. `https://nextjs.org/docs/app/guides/view-transitions`, `https://unpkg.com/next@16.2.5/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/viewTransition.md`
- Patterns: shared-element `name` on thumbnail + hero (`share="morph" default="none"`), `<Link transitionTypes={['nav-forward']}>` (16.2+) + `enter/exit={{ 'nav-forward': 'nav-forward', default: 'none' }}`, wrappers in each `page.tsx` not the layout, header pinned with `viewTransitionName`, `::view-transition { pointer-events: none }`, and the reduced-motion override:
  ```css
  @media (prefers-reduced-motion: reduce) { ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) { animation-duration: 0s !important; animation-delay: 0s !important } }
  ```
- Why it matters for Lighthouse: route transitions become browser-composited with zero JS, replacing a GSAP page-transition layer. Lighthouse doesn't measure SPA navigations anyway, but it reduces shipped JS.

### 1.12 Link prefetch with partial prefetching
- Default/`"auto"` prefetch = one cached **App Shell per route** (static + cached content not depending on URL). `prefetch={true}` additionally resolves URL-specific *cached* content (e.g., `/work/[slug]` body behind `'use cache'`) at one server call per visible link. `prefetch={false}` disables. Prefetch only runs in production. Case-study grid: `prefetch` default is fine; use `prefetch={true}` only for the handful of featured links. `https://nextjs.org/docs/app/api-reference/components/link`, `https://nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching`

### 1.13 CSP + `proxy.ts` (see §4 for policy)
- `middleware.ts` → `proxy.ts` in v16 (deprecated name, codemod `npx @next/codemod@canary middleware-to-proxy .`); exports `proxy()`; Node runtime default, `runtime` config not allowed. `https://nextjs.org/docs/app/api-reference/file-conventions/proxy`

---

## 2. Keeping Performance 100 with GSAP / Motion / Three.js / Lenis

### 2.1 Where the JS goes
- **Lab "idle" arrives immediately.** TBT counts long tasks (>50 ms, blocking portion only) between FCP and TTI; TTI needs a 5 s window with no long tasks. `requestIdleCallback` fires almost instantly in a Lighthouse run, so "load on idle" does not move work out of the TBT window — **what matters is that no single task exceeds 50 ms on a 4×-throttled CPU**. Chunk, don't just defer. `https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time`
- Ship GSAP core + ScrollTrigger in the client bundle (small, needed above the fold); **dynamic-import Three.js / R3F / SplitText / heavy plugins**. `ssr: false` is allowed only inside Client Components:
  ```tsx
  'use client'
  const Scene = dynamic(() => import('./scene'), { ssr: false, loading: () => <div className="hero-canvas-slot" aria-hidden /> })
  ```
  Mount the canvas when it is near the viewport (IntersectionObserver) or after first paint + a yield. Reserve its box with `aspect-ratio`/fixed height to avoid CLS. `https://nextjs.org/docs/app/guides/lazy-loading`
- Register plugins once in a `'use client'` module; never touch `window` at module scope in anything a Server Component imports:
  ```ts
  'use client'
  import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { useGSAP } from '@gsap/react'
  gsap.registerPlugin(ScrollTrigger, useGSAP)
  export { gsap, ScrollTrigger, useGSAP }
  ```
  `useGSAP` uses `useLayoutEffect` on the client / `useEffect` on the server, auto-reverts via `gsap.context()`; wrap handler-created tweens in `contextSafe()`. `https://gsap.com/resources/React/`

### 2.2 Break up long tasks
```ts
export function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield()
  return new Promise(r => setTimeout(r, 0))
}
// init sequence
await import('three'); await yieldToMain()
createRenderer(); await yieldToMain()
await renderer.compileAsync(scene, camera); await yieldToMain()
loadTexturesLazily()
```
`https://web.dev/articles/optimize-long-tasks`

### 2.3 LCP with animated heroes
- Elements with `opacity: 0` are **not LCP candidates**; `<canvas>` and CSS gradients aren't either. A hero headline that starts hidden until GSAP runs pushes LCP to whenever it becomes visible. Make the LCP candidate something painted in the HTML (hero image with `preload`/`fetchPriority="high"`, or visible text), and reveal animated text with `clip-path`/mask wrappers that start within ~1 frame of hydration, keeping the first visible paint early. `https://web.dev/articles/lcp`

### 2.4 CLS with text-split reveals
- Reserve space (`min-height`, `aspect-ratio`); animate only `transform`/`opacity`/`clip-path` (composited `translate` doesn't count toward CLS; `top/left/width/height` do). Never toggle `display: none` on reveal. `https://web.dev/articles/optimize-cls`
- SplitText: split after `document.fonts.ready` or use `autoSplit: true` + create tweens in `onSplit()` (re-splits on font load/resize); `mask: 'lines'` gives overflow-clipped wrappers for reveals; `aria: 'auto'` (default) adds `aria-label` on the parent and `aria-hidden` on pieces — use `aria: 'none'` + an sr-only copy when the text contains links. `https://gsap.com/docs/v3/Plugins/SplitText/`
- Fonts: `next/font` self-hosts with `size-adjust`-style fallback metrics; keep `display: 'swap'` + `adjustFontFallback`.

### 2.5 Lenis + GSAP ticker (one RAF loop)
```ts
// 'use client'
const lenis = new Lenis({ autoRaf: false })        // respectReducedMotion defaults to true
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```
React: `<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />` and `gsap.ticker.add(update)` where `update = t => lenisRef.current?.lenis?.raf(t*1000)`. Drive Three.js from the same ticker (R3F: `frameloop="demand"` + `invalidate()` on scroll/tween, or `frameloop="never"` and call `advance()` in the GSAP tick) so there is a single loop. `https://github.com/darkroomengineering/lenis/blob/main/README.md`, `https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md`

### 2.6 INP (field only, but it's the real UX metric)
- Target ≤ 200 ms at p75. Keep scroll/pointer handlers light, no synchronous layout reads after writes (ScrollTrigger batches; don't `getBoundingClientRect` in your own scroll handler), yield after updating UI, keep DOM small, use `content-visibility`. `https://web.dev/articles/optimize-inp`

### 2.7 `content-visibility` and `contain`
```css
.section-below-fold { content-visibility: auto; contain-intrinsic-size: auto 800px; }
.animated-card { contain: layout paint; will-change: transform; }
```
- Skipped subtrees stay in the a11y tree/find-in-page. Don't put `content-visibility: auto` on ScrollTrigger-pinned sections or elements carrying `view-transition-name`. `https://web.dev/articles/content-visibility`

### 2.8 Reduced motion
```ts
const mm = gsap.matchMedia()
mm.add({ reduce: '(prefers-reduced-motion: reduce)', ok: '(prefers-reduced-motion: no-preference)' }, (ctx) => {
  const { reduce } = ctx.conditions!
  gsap.from('.hero-line', { yPercent: reduce ? 0 : 100, opacity: 0, duration: reduce ? 0 : 1 })
  return () => {}   // ctx.revert() is automatic
})
```
CSS: shorten rather than `animation: none` if anything listens for `animationend` (`animation-duration: 1ms !important`). `https://web.dev/articles/prefers-reduced-motion`, `https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/`

### 2.9 Do infinite CSS animations / persistent RAF loops hurt the score?
- **Not directly.** `non-composited-animations` is an unscored diagnostic. Compositor-only animations (`transform`, `opacity`) don't add to TBT or CLS. A RAF loop only hurts TBT if a frame callback exceeds 50 ms on the throttled CPU, and Lighthouse's load detection ends on CPU-quiet = no *long tasks*, so a light loop doesn't stall the trace. `https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations`
- **Indirect hits to watch**: (a) a heavy Three.js frame on 4× CPU = long tasks = TBT and a later TTI; (b) continuously changing above-the-fold pixels delay "visual completeness" and inflate **Speed Index** (10%); (c) animating layout properties (even infinitely) counts toward CLS. Mitigation: start loops/marquees after `load` (class toggle on `animation-play-state`), keep hero loops to opacity/transform, cap Three.js pixel ratio (`Math.min(devicePixelRatio, 1.5)`), pause the loop when the canvas is offscreen (IntersectionObserver) and on `visibilitychange`.
- Offscreen canvas: Lighthouse has no canvas audit (`offscreen-images` was removed in 13); the cost is only its JS and any console errors (§4.3).

---

## 3. Accessibility with heavy motion (all a11y audits are pass/fail)

- **Route changes**: Next's route announcer reads `document.title` → `<h1>` → pathname, so every route needs a unique title via `generateMetadata`. Next does not move focus on client navigation; add a `usePathname()` effect that focuses `<main id="main" tabIndex={-1}>` (or the `h1`) after navigation, and `html { scroll-padding-top: <header height> }`. With cacheComponents the previous route stays mounted in a hidden `<Activity>` — close menus/dialogs in effect cleanups. `https://nextjs.org/docs/architecture/accessibility`, `https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents`
- **Skip link**: first focusable child of `<body>`, `href="#main"`, visible on `:focus-visible`. Satisfies `bypass` (7) and `skip-link` (3); `landmark-one-main` (3) needs exactly one `<main>`.
- **Decorative canvas / cursor / marquee duplicates**: `aria-hidden="true"` and no focusable descendants (`aria-hidden-focus`, 7). Meaningful canvas → `role="img" aria-label="…"`. Custom cursor: `pointer-events: none`, `aria-hidden`, and only hide the native cursor under `@media (hover: hover) and (pointer: fine)`; never for keyboard users.
- **Hover galleries**: the trigger must be a real `<a>`/`<button>` with a text name (`link-name` 7, `button-name` 10; icon-only → `aria-label`); reveal on `:focus-within` as well as `:hover`; hovered content must not be the only way to reach the link.
- **`target-size` (7)**: axe 4.10 rule = every target ≥ 24×24 CSS px *or* a 24 px circle around it that intersects no other target. Pagination dots, social icons, tiny nav links, close buttons are the usual failures. `https://dequeuniversity.com/rules/axe/4.10/target-size`
- **`color-contrast` (7)**: gradient/image backgrounds make axe return "incomplete" (needs review), which Lighthouse does not fail — but test the worst-case stop manually at 4.5:1 (3:1 for ≥ 24 px/bold 18.66 px). Add a solid/overlay backdrop under hero text.
- **`heading-order` (3)**: don't skip levels; animated "title" components must still be `h2`/`h3`, not `div`s.
- **`meta-viewport` (10)**: never `user-scalable=no` or `maximum-scale<5` — common in Lenis/"app-like" templates and an instant fail.
- Also: `html-has-lang` (7), `document-title` (7), `image-alt` (10) — decorative images `alt=""`, `aria-allowed-attr`/`aria-valid-attr-value` (10) on hand-rolled widgets, and `list`/`listitem` (7) when a `<ul>` is wrapped by non-`<li>` animation wrappers (use `<li>` as the split wrapper).
- Lighthouse covers ~30% of WCAG; keep manual keyboard runs (focus trap in menus, logical tab order) as a PR checklist item.

---

## 4. Security / Best-Practices (Lighthouse 13)

### 4.1 Which security audits are scored
Scored: HTTPS (5), `deprecations` (5), `third-party-cookies` (5), `errors-in-console` (1), `inspector-issues` (1), `image-aspect-ratio`/`image-size-responsive` (1 each), `doctype`/`charset` (1 each). **CSP, HSTS, COOP, clickjacking, Trusted Types, source maps are informational** — implement them for green ticks, but they can't cost you points. A *broken* CSP, however, surfaces as DevTools Issues and console errors and **does** fail `inspector-issues`/`errors-in-console`.

### 4.2 CSP strategy with cacheComponents (no nonces)
- Nonces require dynamic rendering: docs say "**Partial Prerendering (PPR) is incompatible with nonce-based CSP**" and nonces disable static optimization and CDN caching — i.e., they are incompatible with a Lighthouse-100 static shell. Hash-based `experimental.sri` only covers external script files, not Next's inline bootstrap scripts. So: **header-based CSP in `next.config` with `'unsafe-inline'` for scripts and styles**, hard restrictions elsewhere, and accept the informational `csp-xss` warning. `https://nextjs.org/docs/app/guides/content-security-policy`, `https://developer.chrome.com/docs/lighthouse/best-practices/csp-xss`
```ts
const isDev = process.env.NODE_ENV === 'development'
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  worker-src 'self' blob:;
  media-src 'self';
  object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
  upgrade-insecure-requests;`.replace(/\s{2,}/g, ' ').trim()

async headers() {
  return [{ source: '/:path*', headers: [
    { key: 'Content-Security-Policy', value: csp },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }, // LH wants ≥1y + both directives
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
    { key: 'X-Frame-Options', value: 'DENY' }, // redundant with frame-ancestors, harmless
  ]}]
}
```
- Three.js needs `img-src blob: data:` (textures), `worker-src blob:` and `'wasm-unsafe-eval'` (Draco/KTX2/Basis decoders), `connect-src 'self'` for `.glb`. Inline `style=""` attributes from React/GSAP need `style-src 'unsafe-inline'`; JS-set `el.style.x` is never blocked.
- Vercel Analytics/Speed Insights are same-origin (`/_vercel/insights/*`, `/_vercel/speed-insights/*`), so no extra origins; verify in the Issues panel.
- `has-hsts` checks presence, `max-age ≥ 31536000`, `includeSubDomains`, `preload`. `https://developer.chrome.com/docs/lighthouse/best-practices/has-hsts`; `clickjacking-mitigation` passes with XFO `DENY|SAMEORIGIN` **or** `frame-ancestors`. `https://developer.chrome.com/docs/lighthouse/best-practices/clickjacking-mitigation`
- Trusted Types (`require-trusted-types-for 'script'`) will break libraries that set `innerHTML`; it's weight 0 — skip and document.

### 4.3 Scored gotchas for an animated site
- `errors-in-console` (1): any `console.error` — React hydration mismatch (common with `Date`/random/`window.matchMedia` during SSR), 404 on a font/`.glb`, **Three.js logging WebGL context failure** in headless CI. Feature-detect WebGL2 before mounting and never `console.error` in the fallback path.
- `deprecations` (5): run Chrome DevTools → Issues; check every library (e.g., `unload` listeners).
- `third-party-cookies` (5): no YouTube/Vimeo iframes (use a facade), no Google Fonts (self-host via `next/font`).
- `valid-source-maps` (0): `productionBrowserSourceMaps` is optional; off is fine.

---

## 5. CI: Lighthouse CI against Vercel previews

- Use `@lhci/cli@0.16.x` (`lhci autorun`). Budgets note: **Lighthouse 12 removed LightWallet budgets**, so `assert.budgetsFile`/`budget.json` is dead with current Lighthouse; use `maxNumericValue` assertions on metrics and `resource-summary:*` inline assertions instead (verify the latter still reports under LH 13 on your first run). `https://raw.githubusercontent.com/GoogleChrome/lighthouse-ci/main/docs/configuration.md`, `https://raw.githubusercontent.com/GoogleChrome/lighthouse-ci/main/docs/getting-started.md`

```js
// lighthouserc.cjs
const base = process.env.LHCI_BASE_URL            // preview URL from the workflow
const paths = ['/', '/work', '/work/<sample-slug>', '/services/<sample-slug>', '/about', '/contact', '/resume']
module.exports = {
  ci: {
    collect: {
      url: paths.map(p => base + p),
      numberOfRuns: 3,
      settings: {
        // preset: 'desktop',  // run a second job for desktop if you want both
        chromeFlags: '--no-sandbox --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader',
        extraHeaders: JSON.stringify({
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
          'x-vercel-set-bypass-cookie': 'true',
        }),
      },
    },
    assert: {
      assertions: {
        'categories:performance':    ['error', { minScore: 1, aggregationMethod: 'median-run' }],
        'categories:accessibility':  ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo':            ['error', { minScore: 1 }],
        'largest-contentful-paint':  ['error', { maxNumericValue: 1800, aggregationMethod: 'median-run' }],
        'total-blocking-time':       ['error', { maxNumericValue: 100,  aggregationMethod: 'median-run' }],
        'cumulative-layout-shift':   ['error', { maxNumericValue: 0.02 }],
        'resource-summary:script:size': ['warn', { maxNumericValue: 250000 }],
      },
    },
    upload: { target: 'temporary-public-storage' },   // or 'filesystem' + actions/upload-artifact
  },
}
```
```yaml
# .github/workflows/lighthouse.yml — triggered by Vercel's GitHub integration
on: deployment_status
jobs:
  lhci:
    if: github.event.deployment_status.state == 'success' && github.event.deployment_status.environment == 'Preview'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm i -g @lhci/cli@0.16.x
      - run: lhci autorun
        env:
          LHCI_BASE_URL: ${{ github.event.deployment_status.environment_url }}
          VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}   # optional status checks
```
- Alternative to `deployment_status`: `patrickedqvist/wait-for-vercel-preview` on `pull_request` and pass its `url` output. Protected previews: create the secret under Project → Deployment Protection → "Protection Bypass for Automation"; header is `x-vercel-protection-bypass`. `https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation`, `https://github.com/patrickedqvist/wait-for-vercel-preview`
- Flakiness: `median-run` aggregation for perf, 3–5 runs, warn (not error) on byte budgets, keep `numberOfRuns` ≥ 3 on shared runners. A custom script (`lighthouse` + `chrome-launcher`) gives the same data with more code; LHCI's assertion engine + GitHub status checks is the pragmatic choice.
- Headless WebGL: GitHub runners have no GPU; Chrome falls back to SwiftShader. Either pass the flags above or make the Three.js layer degrade silently (static poster, no console output) so `errors-in-console` stays green in CI.

---

### Quick "must do" list (highest leverage first)
1. Remove all route-segment configs; `'use cache'` + `cacheLife('max')` on content getters; `ensureStatic = 'navigation'` in root layout.
2. Fix `new Date()`/random: footer year in a cached component, sitemap dates from content.
3. `await params` inside `<Suspense>` on `/work/[slug]` and `/services/[slug]`; `generateStaticParams` returns real slugs.
4. Hero LCP element painted in HTML (not opacity 0); `preload` + `fetchPriority="high"`; `sizes` on every `fill` image; `qualities` configured.
5. GSAP core in bundle; Three.js/SplitText dynamic-imported from a Client Component; init chunked with `scheduler.yield`; single ticker for Lenis + GSAP + Three.
6. Reveals via clip-path/transform in reserved boxes; SplitText after `document.fonts.ready`/`autoSplit`.
7. Skip link, focus-to-main on navigation, `aria-hidden` canvases/cursors, 24 px targets, no `maximum-scale`.
8. Header-based CSP (no nonces) + HSTS/COOP/XFO in `next.config`; verify zero console errors / DevTools Issues.
9. LHCI on `deployment_status` with bypass header, `minScore: 1` on all four categories.
