# PRD — Tarun Shukla portfolio v1

Status: approved 2026-11-04 · Owner: Tarun Shukla · Builder: Claude Code · Cites: [PURPOSE.md](./PURPOSE.md), [DESIGN_CONCEPT.md](./DESIGN_CONCEPT.md), [ARCHITECTURE.md](./ARCHITECTURE.md), `research/*`

## 1. Summary

A static, heavily animated, mobile-first personal site that positions Tarun as a Head of Digital & Technology / AI-native full-stack engineer and converts two audiences (hiring decision-makers; SME owners) through evidence-led case studies. Built on Next.js 16 + TypeScript + GSAP + Lenis + Three.js, deployed on Vercel, with Lighthouse 100/100/100/100 on every route as a release gate.

## 2. Users and jobs-to-be-done

- **Persona A — Decision-maker / recruiter.** Lands from LinkedIn, a referral, or the résumé link. Scans on a phone. JTBD: confirm in under a minute that Tarun can own an entire digital stack with measurable business outcomes; get an ATS-friendly résumé; start a conversation.
- **Persona B — SME owner.** Lands from Google (long-tail service query), WhatsApp referral, or LinkedIn. JTBD: see that Tarun has solved *their* problem for a comparable business, understand what he offers as a bundle, and enquire without friction.

## 3. User stories (prioritised, independently testable)

### P1 — must ship
- **US-01** As A, I land on `/` and within 5 seconds understand who Tarun is, what he does and the scale of his results. *Test:* hero + proof strip visible above the fold at 390 px without scrolling; LCP element is text.
- **US-02** As A or B, I open a case study from the home page in one tap and read a structured story with numbers. *Test:* ≤ 1 tap from `/` to `/work/<slug>`; each case study has Context → Constraint → What I did → Result → Stack sections and ≥ 1 sourced metric.
- **US-03** As A, I download an ATS-safe résumé (PDF) and can also read it as HTML. *Test:* `/resume` renders HTML with the same content as the PDF; PDF is single-column, real text.
- **US-04** As A or B, I send a message that reaches Tarun's inbox, with spam blocked. *Test:* `/contact` form delivers to the configured address via Resend; honeypot/Turnstile failures do not send; a `mailto:` fallback exists when the service is unconfigured.
- **US-05** As any user, the site is fast and stable on a mid-range phone. *Test:* Lighthouse mobile 100/100/100/100 on every route; CLS 0; no console errors.
- **US-06** As a keyboard or screen-reader user, every interaction is reachable and labelled. *Test:* skip link, focus visible, unique page titles, canvases `aria-hidden`, the work grid has an SSR list alternative.
- **US-07** As a user who prefers reduced motion, I get the same content without smooth-scroll, scrub or WebGL. *Test:* with `prefers-reduced-motion: reduce`, no Lenis instance, no canvas mounted, all content visible.

### P2 — should ship
- **US-08** As B, I read a service page that matches my search intent and links to proof. *Test:* 3 service routes, each linking ≥ 2 case studies and the contact page.
- **US-09** As A or B, I filter the work index by capability and switch between grid and list. *Test:* filter state in URL params; list is the SSR'd `<ul>`.
- **US-10** As a crawler/AI engine, I find structured data and a plain-text index. *Test:* Person + WebSite + ProfilePage + Article + BreadcrumbList JSON-LD validate; `/llms.txt`, `/sitemap.xml`, `/robots.txt` exist.
- **US-11** As A, I see Tarun's journey (India → Singapore → Dubai) as a scroll-driven route with milestones. *Test:* SVG route draws on scroll; SSR state is the fully drawn route; milestones are an ordered list.

### P3 — nice to have
- **US-12** As a desktop user, the work index is an infinite, draggable WebGL grid with a lens effect. *Test:* mounts only on `pointer: fine` after interaction; falls back to the DOM grid.
- **US-13** As a desktop user, I can "enter" a journey scene and pan through dated project cards. *Test:* desktop only, Esc exits, no Lighthouse regression.
- **US-14** As any user, pages share a theme toggle (dark / paper). *Test:* persisted, no flash.
- **US-15** As a social sharer, each page has a specific Open Graph image. *Test:* `/work/<slug>/opengraph-image` renders title + metric.

## 4. Functional requirements

| ID | Requirement |
|---|---|
| FR-001 | Routes: `/`, `/work`, `/work/[slug]`, `/services/[slug]` ×3, `/about`, `/resume`, `/contact`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, per-route `opengraph-image`. |
| FR-002 | Content lives in `src/content/**` as typed TypeScript; every metric carries a `source` field. |
| FR-003 | Case-study schema: slug, title, client, year, role, summary, headlineMetric, metrics[], sections (context, constraint, approach, result, stack, retrospective), cover, gallery[], links (live/repo), tags[], featured. |
| FR-004 | Work index supports filter by tag (URL `?tag=`), grid/list toggle, and an SSR'd list. |
| FR-005 | Contact: Server Action → Resend; fields name, email, company (optional), message, track (role/consulting); Turnstile token verified server-side; honeypot; minimum 3 s fill time; zod validation; rate-limited at the edge. |
| FR-006 | Résumé: HTML route, downloadable PDF(s), `/resume.json` (JSON Resume). |
| FR-007 | SEO: `generateMetadata` per route; canonical; OG/Twitter; JSON-LD per §4 of the plan; sitemap with content-derived dates; robots allowing major AI crawlers. |
| FR-008 | Analytics: Vercel Analytics + Speed Insights only; custom events `cta_click`, `case_study_open`, `resume_download`, `contact_submit`. |
| FR-009 | Images: optimised at build (`scripts/optimize-images.mjs`), served via `next/image` with blur placeholders; screenshots framed in a DOM `BrowserFrame`. |
| FR-010 | Theme: dark default; case-study pages use the paper theme; `data-theme` on `<html>`. |

## 5. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-001 | Lighthouse 100/100/100/100 (Performance, Accessibility, Best Practices, SEO) on every route, mobile and desktop, median of 3 runs. |
| NFR-002 | Lab LCP ≤ 1.2 s on `/` (mobile), CLS 0, TBT ≤ 50 ms. |
| NFR-003 | ≤ 250 KB gzipped JS on `/` before any gated scene loads. |
| NFR-004 | WCAG 2.2 AA; reduced-motion parity; ≥ 24 px targets; ≥ 16 px body text on mobile. |
| NFR-005 | No third-party scripts except Vercel Analytics/Speed Insights; fonts self-hosted. |
| NFR-006 | Security headers: CSP (header-based), HSTS, COOP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. Zero console errors. |
| NFR-007 | Every number on the site traceable to a named source. |

## 6. Information architecture

See plan §4 / [ARCHITECTURE.md](./ARCHITECTURE.md). Home → (work, services, about, contact). Hub-and-spoke internal linking: home → 3 services + 3 featured case studies; service → its case studies + contact; case study → its service + related work.

## 7. Success criteria (measurable, tech-agnostic)

| ID | Criterion | Horizon |
|---|---|---|
| SC-001 | ≥ 40 % of home sessions open a case study | 3 months |
| SC-002 | Median case-study time ≥ 90 s | 3 months |
| SC-003 | ≥ 2 qualified conversations (roles) and ≥ 2 qualified enquiries (clients) per quarter | 6 months |
| SC-004 | Page 1 for 3 target long-tail queries (e.g. "Next.js developer Dubai", "Zoho Books automation UAE", "Tarun Shukla Dubai") | 6 months |
| SC-005 | Core Web Vitals "good" in CrUX once traffic qualifies | 6 months |

## 8. Assumptions and open questions

- `[NEEDS CLARIFICATION]` lapizblue.com page consolidation: résumé says 1,200 → 62 pages; Halfyearly-Report says 95 indexed. Use the résumé figure with a "core pages" qualifier until confirmed.
- `[NEEDS CLARIFICATION]` Public email for the site (currently `agmnwosgr@gmail.com` as the delivery address; display a `hello@` alias once a domain exists).
- Assumption: real screenshots of the four public sites may be used; private apps get abstract covers until the user supplies screenshots.
- Assumption: freelance availability copy stays soft ("open to conversations") until permit/NOC.

## 9. Milestones

M0 Foundation + docs + skills (done/today) · M1 Content model · M2 Design system + motion primitives · M3 Routes + contact (gate: 100×4 everywhere) · M4 Imagery · M5 Showpieces (hero field, work grid, journey, enter-the-scene) · M6 QA + SEO hardening · M7 Ship.

## 10. Decision log

See `docs/decisions/` (MADR format).
