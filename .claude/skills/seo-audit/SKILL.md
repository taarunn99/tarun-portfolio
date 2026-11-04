---
name: seo-audit
description: Audit a route of this portfolio for SEO and AI-search readiness — titles, descriptions, canonical, JSON-LD validity, sitemap/robots/llms.txt, OG images, internal links, editorial tone. Use after adding or changing a page, or when asked to check SEO, metadata, structured data.
argument-hint: <route, e.g. /work/lapizblue-relaunch>
---

# SEO audit

Strategy and target queries: `docs/research/04-personal-brand-seo.md`. Implementation rules: `docs/research/09-nextjs16-seo-perf-checklist.md` §1.

## Checks for `$ARGUMENTS`

1. Build (`npm run build`) and fetch the route from `next start` (`curl -s localhost:3100<route>`).
2. `<title>` follows the pattern (home: `Tarun Shukla — Head of Technology · Next.js & Zoho automation, Dubai`; service: `<Service> in Dubai — Tarun Shukla`; case study: `<Client>: <outcome ≤ 6 words> — Tarun Shukla`); ≤ 60 chars. Description 140–155 chars with one concrete number, no superlatives.
3. Exactly one `<h1>`; heading order; one Dubai/UAE mention; keyword in first paragraph naturally.
4. Canonical absolute; OG + Twitter tags; `opengraph-image` returns 200 and 1200×630.
5. JSON-LD: parse every `application/ld+json`; required per route — layout: `WebSite` + `Person` (`@id`, `sameAs`, `jobTitle`, `address`); `/about`: `ProfilePage` → Person; `/work/*`: `Article` (+ `BreadcrumbList`); `/services/*`: `Service` (+ `BreadcrumbList`). Validate with the Rich Results test if a URL is live.
6. `/sitemap.xml` lists the route with a content-derived `lastmod`; `/robots.txt` allows AI crawlers; `/llms.txt` mentions the page.
7. Internal links: hub-and-spoke (service ↔ case studies ↔ contact); descriptive anchor text; no `href="#"`.
8. Tone: no "best/top/#1", no "hire me", no keyword stuffing.

Output a pass/fail table and the exact edits needed.
