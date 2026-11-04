# 0004 — Cache Components on, everything prerendered, `ensureStatic`

Status: accepted · Date: 2026-11-04 · Evidence: `research/09` §1

## Context

Next 16 defaults to `cacheComponents: true`. It enforces that prerendered output never depends on request time (we hit the `new Date()` build error on day one). A portfolio has no request-time data.

## Decision

Keep Cache Components. No route-segment config exports. Content getters are `'use cache'` + `cacheLife('max')`. `await params` inside `<Suspense>`. `export const ensureStatic = 'navigation'` in the root layout turns any accidental dynamic access into a build failure. Contact is a Server Action (allowed; not part of prerender).

## Consequences

+ Guaranteed static HTML + App Shell prefetching; CDN-cacheable; Lighthouse-friendly.
− Must be disciplined about time/random during render; OG images and route handlers must only read cached data.
