---
paths: src/app/**
---

Routes are server components. No route-segment config exports (`dynamic`, `revalidate`, `runtime`, `fetchCache`, `dynamicParams`). Content getters are `async` + `'use cache'` + `cacheLife('max')`. `await params` only inside a `<Suspense>` boundary; `generateStaticParams` returns real slugs; unknown slug → `notFound()`. Never `new Date()` / `Math.random()` / `crypto.randomUUID()` in render or metadata. Every page exports `generateMetadata` (or `metadata`) with title, description, canonical, OG. JSON-LD via a plain `<script type="application/ld+json">` with `<` escaped. `ensureStatic = 'navigation'` stays in the root layout.
