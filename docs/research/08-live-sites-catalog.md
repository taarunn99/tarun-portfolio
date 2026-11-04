<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

Research is complete; no further fetches are needed. Here is the report.

# Portfolio case-study research: Tarun Shukla / Lapiz Group sites

Date: 2026-11-04. Method: curl against live sites (headers, HTML, robots/sitemap/llms.txt, CSS chunks), GitHub REST + raw.githubusercontent.com, PageSpeed Insights API. No files were modified.

## Cross-site findings (apply to all four)

- Hosting/stack: all four serve `server: Vercel`, `x-nextjs-prerender: 1`, `x-nextjs-stale-time: 300` (ISR/static prerender), Turbopack chunk names (`turbopack-*.js`), App Router (`__next_f` flight payload). Apex domains 301/308 to `www.`. HSTS on all; 60newton adds `includeSubDomains; preload`.
- Versions (from package.json): lapizblue + 60newton on Next 16.1.x / React 19.1; gcbuae Next 16.2.12 / React 19.2.4; castedluxe Next 16.2.10 / React 19.2.4. Tailwind v4 (`@tailwindcss/postcss`) everywhere. GSAP + `@gsap/react` on all four; Lenis smooth-scroll on 60newton/gcbuae/castedluxe; framer-motion on lapizblue/60newton/castedluxe, `motion` on gcbuae.
- Fonts all self-hosted via `next/font` (Google fonts compiled to `/_next/static/media/*.woff2`); no runtime fonts.googleapis.com request except a stray lapizblue reference.
- Analytics: only lapizblue carries a tag manager (GTM-TM86M7FS). No GA/GTM/Meta/Clarity/Vercel Analytics script detected on 60newton, gcbuae or castedluxe homepages. No third-party script hosts at all on any homepage (good for performance; worth confirming intent for the three untagged sites).
- PageSpeed Insights API: returned HTTP 429 "Quota exceeded ... Queries per day" for the shared keyless project on every attempt (mobile and retry); CrUX API requires a key (403). Use the self-reported Lighthouse scores in the Halfyearly-Report repo's DATA.md instead (listed per site below), or run PSI with a key.
- Performance proxies measured (homepage, gzip): lapizblue HTML 29 KB, 15 JS chunks ≈ 264 KB gz; 60newton HTML 21 KB, 15 chunks ≈ 318 KB gz; gcbuae HTML 101 KB (646 KB raw; large flight payload for the catalogue), 18 chunks ≈ 389 KB gz; castedluxe HTML 13 KB, 12 chunks ≈ 300 KB gz. Images via `next/image` with webp/avif, `loading="lazy"` throughout.

---

## 1. lapizblue.com — Lapiz Blue General Trading LLC

**Business:** UAE building-materials and construction-chemicals distributor (Dubai, Abu Dhabi, Sharjah), founded 2020; authorized distributor for Mapei, Weber, AkzoNobel/Dulux, Laticrete, Profilpas, FILA, Kerakoll, Pidilite-Puma, KalingaStone + tools (Montolit, DeWalt, Hilti, Bihui, Peygran). About page: 21 staff, 2,800+ customers. Group parent of Sixty Newton and Global Classic.

**Structure (sitemap: 117 URLs, lastmod mostly 2026-10-29):** `/brands` hub + 9 brand pages + 38 brand/category pages (47 total, e.g. `/brands/mapei/waterproofing`, `/brands/profilpas/bathroom-profiles`); `/tools` hub + 31 tool brand/category pages; `/blog` + 31 posts (MDX; repo has 132 KB of MDX); `/about`, `/contact`, `/privacy`, `/terms`. robots.txt disallows `/api/`, `/private/`. No llms.txt (custom 404 "Oops, I think we're lost...").

**Tech signals:** Next 16.1 / React 19.1, babel-plugin-react-compiler, `@vercel/postgres`, nodemailer (contact form), next-seo, gray-matter + react-markdown (blog), embla carousel, cobe (3D globe), canvas-confetti, critters (critical CSS), `indexnow` npm script (IndexNow pings), `img:optimize`/`img:webp` scripts. Fonts: Manrope (body), Outfit, Dancing Script (accent), Horizon (custom .otf display). GTM-TM86M7FS.

**Schema.org JSON-LD:** homepage: Organization ×6, LocalBusiness, WebSite, WebPage, ContactPoint, OpeningHoursSpecification, PostalAddress, CommunicateAction/EntryPoint (WhatsApp action). Category pages add FAQPage (8–10 Q&A) + BreadcrumbList. Blog posts: Article + ImageObject. Brand hubs (`/brands/mapei`) and `/tools` hub have no JSON-LD (gap).

**Visual style:** light theme, white background; brand palette steel blue `#406E8E` (dominant), navy `#23395B`, near-black `#161925`, accent `#1E6BA8`, greys `#8E8E93`; heavy `rounded-full` pills, Manrope/Outfit sans. Hero with WhatsApp CTA ("Hi, I have a purchase order for Lapiz Blue" prefilled), product spotlight cards ("Tap to explore"), GM quote block, FAQ.

**Features:** WhatsApp deep links (api.whatsapp.com with prefilled text) ×7 on homepage, 24/7 WhatsApp support widget, contact form (name/company, email, phone, message, T&C checkbox, "Fire Away" button) + a second form with file upload (`type="file"`, likely BOQ upload) on `/contact`; category pages show TDS/datasheet references (TDS ×15 on Mapei waterproofing page), BOQ CTAs (×27), a `<select>` filter, sticky elements; Google Maps iframe; three office locations.

**SEO signals:** Title "Lapiz Blue | Premium Building Materials Supplier in UAE"; H1 "Building Materials & Construction Chemicals."; canonical + og tags + `theme-color`; keyword-targeted category titles ("Mapei Waterproofing UAE | Membranes & Coatings - Lapiz Blue"). Blog H1 is poetic ("Every story begins with a seat...") rather than keyworded. From DATA.md: migration from legacy Trigya site, ~1,200 ghost pages → 95 indexed; Lighthouse before 66/83/74/92 → after 99/96/100/100 (PSI desktop, 24 Dec 2025: FCP 0.3 s, LCP 0.7 s, TBT 20 ms, CLS 0); GSC last-3-months 1,342 clicks / 72.5K impressions / 113 ranking pages; #1 organic "profilpas uae", "kalinga stone uae".

**Screenshot picks:** homepage hero + product spotlight; `/brands` grid (H1 "We Stock Icons Not Imitations"); `/brands/mapei/waterproofing` (FAQ + TDS + BOQ layout); `/contact` (multi-office + file-upload form); Lighthouse before/after (DATA.md says 15 proof screenshots exist for `/public/proof/`).

---

## 2. 60newton.com — Sixty Newton Technical Services

**Business:** specialist applicator/contractor (Dubai-registered, Sharjah ops) for waterproofing, epoxy/self-levelling flooring, microtopping, large-format tiling, marble, polishing, coatings, insulation, painting, maintenance; approved applicator for Mapei, Laticrete, AkzoNobel, X-Calibur (+ Weber, Kerakoll, Saveto). Reference projects: Atlantis The Royal, Al Wathba Desert Resort, St. Regis, Address Boulevard, Jumeirah Golf Villas, Dubai Hills Villas, Le Méridien, Ahlatci Gold Refinery, Delhi Metro.

**Structure (sitemap: 219 URLs, all lastmod 2026-10-12):** 14 discipline pages + **182 programmatic discipline × location pages** (`/disciplines/waterproofing/palm-jumeirah`, `/disciplines/vinyl-flooring/sharjah-al-nahda`...) = 196; `/portfolio` + 11 project case studies; `/approach`, `/faq`, `/blog` (2 posts), `/request-a-quote`, `/legal/privacy`, `/legal/terms`. robots disallows `/api/`, `/_next/`. **Has llms.txt** (custom, dated 2026-05: disciplines, approvals, reference projects, contacts).

**Tech signals:** Next 16.1 / React 19.1, GSAP + Lenis + framer-motion, embla carousel (autoplay/auto-scroll), nodemailer + libphonenumber-js + validator (quote form), sonner toasts, Radix slot/CVA (shadcn-style), next-seo, react-markdown. Custom scripts `frames:optimize/build/fast` — the hero is a **scroll-driven image-sequence animation** (`/animation/desktop/frame-000..N.webp` + mobile set, 29 preload links). Fonts: Cormorant Garamond (serif display) + Geist (UI).

**Schema.org:** Organization, WebSite, ContactPoint, PostalAddress on every page; discipline pages add Service ×6, OfferCatalog, Offer ×5, AdministrativeArea ×3, FAQPage (10 Q&A), BreadcrumbList; `/faq` FAQPage (12); portfolio pages use `Project` + `Place` + BreadcrumbList. Richest schema of the four sites.

**Visual style:** dark luxury theme: bg `#0a0807`, elevated `#11100e`, foreground cream `#efe8d5`, muted `#8f8674`, gold accent `#b8924f` (hover `#cba569`), hairline borders `#efe8d50f`. Serif display + extralight weights, 12-col grid, "Request a Quote" repeated CTA, WhatsApp `wa.me/971502814338` ×9, phone + email, embedded Google Maps, modal (`aria-modal`).

**Features:** quote request page (free site survey, 48-hour quotation), WhatsApp everywhere, portfolio case studies with m² figures (Atlantis: 6,400 m² wet-area waterproofing to Mapelastic Smart spec), `<details>` accordions and TDS references on location pages, hrefLang `en-AE`, custom `opengraph-image.png`, web manifest.

**SEO signals:** Title "Sixty Newton — Specialist technical services & contracting · UAE". **No `<h1>` on the homepage** and none on `/request-a-quote` (gap worth fixing before screenshotting an SEO story). Sub-page titles have a doubled suffix ("... | Sixty Newton · Sixty Newton") — template bug. Location pages: H1 "Waterproofing in Palm Jumeirah", keyworded titles/metas. DATA.md: built in 4 days, live ~20 May 2026, Lighthouse 100/92/100/100; GSC early: homepage pos 3.23, 140 pages in indexing pipeline.

**Screenshot picks:** homepage hero frame-sequence (dark/gold); `/disciplines` ("Fourteen disciplines. One specialist contractor."); a location page to show programmatic SEO; `/portfolio/atlantis-the-royal`; `/request-a-quote`.

---

## 3. gcbuae.com — Global Classic Building Materials Trading LLC

**Business:** Sharjah (Al Sajaa) wholesale slab supplier, 2024 Lapiz Group company: KalingaStone authorized reseller (128 shades: 69 quartz, 35 marble, 24 terrazzo), authorized Jaquar bathware dealer (1,480 catalogued SKUs across 6 categories), FILA stone-care distributor (34 products). B2B: BOQ pricing in AED within one working day, trade accounts.

**Structure (sitemap: 336 URLs):** `/kalingastone` hub → quartz/marble/terrazzo → 129 individual shade pages + 12 collection/colour pages (`/kalingastone/quartz/colours/white-quartz`, `/kalingastone/terrazzo/collections/roma-cafe`); `/jaquar` + 6 category pages + ~83 collection pages (`/jaquar/faucets/aria`); `/fila` + 4 category pages + ~36 product pages; `/blog` ("The Journal") 51 posts in 6 categories; `/products`, `/about`, `/contact`, `/privacy-policy`, `/terms`; company profile PDF. **Has llms.txt** (markdown index of ranges + all blog posts with descriptions). robots allows everything.

**Tech signals:** Next 16.2.12 / React 19.2.4, Tailwind v4 CSS-first `@theme`, GSAP 3.15 + `@gsap/react`, `motion/react`, Lenis via GSAP ticker, embla + wheel gestures, `@number-flow/react` (animated numbers), `ogl` (WebGL), `dotted-map` (world map: "One material, 66 countries"), pdf-lib + opentype.js + sharp (build-time PDF/image generation). README documents the architecture (`components/motion`, `components/seo`, `config/site.ts` single source of truth, no `next lint` in Next 16). Fonts: Manrope (sans), Cormorant Garamond + Fraunces (display), mono for spec numbers; `text-phi-*` golden-ratio type scale. Two `<video>` elements on homepage.

**Schema.org (most complete catalogue schema):** homepage: Organization, WebSite, FAQPage (9 Q&A), ItemList, GeoCoordinates, Country; category pages: CollectionPage + ItemList (up to 73 ListItems) + FAQPage + BreadcrumbList + Brand; shade/collection pages: **Product + Offer + Brand** + BreadcrumbList; blog posts: Article + FAQPage; `/about`: AboutPage.

**Visual style:** warm light theme: limestone `#f7f8f5` bg, midnight/warm-black `#0c1510` ink, travertine `#d2d4c8` surface, verde `#355e4d` borders, sage accent `#6f8f78`; FILA section uses FILA brand yellow `#fed400` / red `#e8442e`. Editorial serif headlines ("Classic is not an era. It is a standard."), numbered sections (01 Sourcing / 02 Supply / 03 Support), `rounded-3xl` cards, sticky elements ×12–20.

**Features:** global search (`placeholder="Search shades, materials, pages…"`, `type="search"`), shade filters (`Filter`, `<select>` ×2, checkbox, tablist, "Show all", Compare) on quartz page, Jaquar collection pages with SKU `<table>` + Download (price list/PDF) + BOQ CTA, "Check stock", "Get a price", "Book a visit" buttons, contact form (name/company/email/phone/message), WhatsApp `wa.me/971529927827`, expandable map (Al Sajaa showroom), "Two more doors" group cross-links.

**SEO signals:** Title "Global Classic Building Materials - Marble Slab Supplier UAE"; H1 "Classic is not an era. It is a standard."; `/products` H1 is a keyword-stuffed sentence (over-long); hrefLang en + x-default; canonical; per-shade titles ("Calacatta Rivolo - KalingaStone Quartz Slab UAE") with dimensional metas; 51-post topical blog cluster with 2026-dated pricing guides. Note: no analytics tag detected.

**Screenshot picks:** homepage hero + "Ten lines. One standard." collection rail; `/kalingastone/quartz` filter grid (232 images); a shade page (Product schema); `/jaquar/faucets/aria` SKU table; `/blog` index; world map section.

---

## 4. castedluxe.com — Casted Luxe by Ashrat

**Business:** Dubai bespoke art commissions by artist Ashrat (Lapiz Group MD per DATA.md): hand-poured epoxy resin wall art, gold-leaf Arabic calligraphy, luminous canvases, sculptural pieces; made to measure, no prints; delivery UAE/GCC/worldwide; 2–6 week turnaround.

**Structure (sitemap: 7 URLs, 2026-07-29):** `/`, `/gallery` (8 original commissions), `/process` (5 steps: Conversation → Vision → Quote → Making → Arrival), `/about`, `/contact`, `/privacy`, `/terms`. No llms.txt (custom 404 "Out of the frame"). Sitemap/canonical use apex `castedluxe.com` while the site redirects to `www.` (canonical mismatch to fix).

**Tech signals:** Next 16.2.10 / React 19.2.4, Tailwind v4, GSAP 3.15, Lenis, framer-motion 12 — smallest dependency set. Fonts: Cormorant Garamond (serif) + Parisienne (script, `font-script` class). Repo name "crafted-luxe" (package.json) / `casted_luxe`; built in 12 days (DATA.md), live 17 Jul 2026.

**Schema.org:** Organization, Person (artist), WebSite, ContactPoint, PostalAddress on all pages. No Product/CreativeWork/ImageGallery on `/gallery` (opportunity).

**Visual style:** cream/paper palette: cream `#f1efe3`, paper `#e5e4dc`, ink `#2c1405` (deep brown), umber `#3b1c0a`, royal purple `#3a0f62`, lilac `#ece4fa`; serif + script typography, H1 "Eternally Yours", artwork cards ("Ocean in Six — Oil pastel & transparent epoxy", "Drift & Ember — Die-cast Porsche & tinted epoxy", "Andalus"), roman-numeral process steps, pull-quote from the artist.

**Features:** homepage commission intake field (`placeholder="Tell us what you dream of hanging…"`), contact form (name/email/message, "Send Enquiry"), WhatsApp `wa.me` ×8 on gallery (per-piece enquiry), mailto. Note: the mailto on the homepage points to `tarun.s@lapizblue.com?subject=Commission enquiry` — probably a placeholder to swap for the client's address before showcasing.

**SEO signals:** very long title (≈130 chars) and keyword meta tag; H1 only on `/` and `/gallery` — none on `/process`, `/about`, `/contact`. DATA.md Lighthouse 100/95/95/100.

**Screenshot picks:** homepage hero (serif + script type on cream); `/gallery` grid; `/process` five-step section; mobile view (small, elegant).

---

## GitHub summary — github.com/taarunn99

Profile: Tarun Shukla, 28 public repos, 6 followers, created 2024-09; bio "Full-stack developer proficient in the MERN stack, blending web development with Generative AI... AWS, Docker". Stars are negligible (lapizbluewebsite has 1) so don't headline stars.

| Repo | What it is | Stack | Last push |
|---|---|---|---|
| lapizbluewebsite | lapizblue.com source (1,003 files, 2.0 MB TS + 132 KB MDX) | Next 16, React compiler, Vercel Postgres, nodemailer, IndexNow | 2026-10-29 |
| sixty-newton-website | 60newton.com | Next 16, GSAP/Lenis, frame-sequence build scripts | 2026-10-12 |
| gcbuae | gcbuae.com (documented README) | Next 16.2, Tailwind v4, GSAP+Motion+Lenis, ogl, number-flow | 2026-10-12 |
| casted_luxe | castedluxe.com | Next 16.2, GSAP, Lenis, framer-motion | 2026-07-29 |
| lapizblue-catalogue | Offline PWA cross-reference catalogue: 198 products / 10 brands / 8 categories, 221 static pages, Fuse.js ⌘K search, alternatives engine by classification tokens (C2TE S1 etc.), coverage calculator, 3-way compare, WhatsApp share, service worker, recently-viewed | Next 16, React 19, Tailwind 3.4, Fuse.js 7 | 2026-05-09 |
| Mapei-quiz (fork of adilm29-droid/Mapei-quiz) | Staff training quiz, live as "Lapiz Blue Quiz Contest" (mapei-quiz.vercel.app); DATA.md: 12 candidates, user IDs, leaderboards, admin controls, re-uploadable + practice quizzes, mail automation, full DB | Vanilla JS/HTML/CSS | 2026-11-02 |
| lapizleadestimation | "Lead Revenue Tracker" dashboard: weekly WhatsApp lead snapshots → pipeline valued at Zoho Books trader price; 3 lead categories; PROCESS.md playbook (WhatsApp Web store crawl via Claude-in-Chrome, Zoho MCP pricing) | Next 14 static export, Recharts, Tailwind | 2026-07-06 |
| sixtynewton-estimating | Private quoting workbench for Sixty Newton: pure-TS pricing engine, Claude assistant that proposes via tool calls (never does arithmetic), rate provenance (books/tds/quote/manual + H/M/L confidence), immutable quote revisions, PDF quotes, Zoho Books sync cron, follow-ups, weekly digest; 12 Supabase migrations, RLS | Next 15.5, Supabase (Postgres/Auth/RLS), @anthropic-ai/sdk, @react-pdf/renderer, shadcn, zod, vitest | 2026-09-08 |
| Halfyearly-Report | Technology report web app Feb–Jul 2026 with DATA.md of all metrics (gold mine for case-study numbers) | Next 14, Recharts, framer-motion, Python xlsx builder | 2026-08-01 |
| lapiz-assistant | Zoho Books/Inventory stock-sync automation: GitHub Actions crons (daily checker 07:40 Dubai, backfill, close-old-SOs, closeout, blacklist cycle), Deluge functions (`lb_sync_so_shipment` v2.2: invoice → package+shipment mirror, void → sales return; idempotent, marker-tagged, retried), delivery-note OCR/attach pipeline with daily email + Cliq webhook | Python (requests, reportlab), Deluge | 2026-11-04 |
| WebWeaver | Prompt-to-website generator: Express backend calling Claude (`claude-3-5-sonnet-20241022`, `/template` picks node/react, `/chat` 8k tokens) + Vite/React frontend with `@webcontainer/api` in-browser runtime and Monaco editor; system prompt is the open-source Bolt prompt ("You are Bolt...") — describe as a Bolt.new-style clone. Live demo URL currently 404. | TS, Express, Anthropic SDK 0.32, WebContainers, Monaco | 2025-03-16 |
| Others | BucketBite (Bedrock + S3 blog gen), DigiCapEx (crypto arbitrage, WebSockets), NetflixClone, zocket-backend-task (Go), assessments | | 2024–25 |

Not found publicly: "Lapiz Zoho Helper" Chrome add-on (no repo with manifest.json/extension files; GitHub code search was rate-limited). `stock-report-automation` repo is empty (0 files) — the actual stock automation lives in lapiz-assistant and Zoho.

**Security flag (important before linking GitHub in a portfolio):** `taarunn99/lapiz-assistant` is public and contains live business data: delivery-note PDFs (`dn-done/2026-10/22 OCT 2026 DN.pdf`), audit XLSX, `dn-ledger.json`, daily reports listing invoice numbers, customer company names, payment status and salesman names, and Zoho customer IDs/org ID hard-coded in Deluge. Recommend making it private (or scrubbing history) before the portfolio goes live. Similarly `sixtynewton-estimating` CLAUDE.md exposes `ZOHO_ORG_ID=719219457` (low severity, but note it).

---

## Metrics available (from Halfyearly-Report DATA.md, self-reported, Feb–Jul 2026)

- Google Ads: AED 26,358 spend → 443 conversions → attributed invoiced revenue AED 242,642 (25 companies, high-confidence match) = the 820% ROAS / "AED 242K from AED 26K" claim; CPA 66 → 35 after fixing GTM triggers; 97.1% of AED 250K target.
- SEO migration: ~1,200 ghost pages → 95 indexed (resume says 62; DATA.md says 95 — reconcile before publishing); Lighthouse 66/83/74/92 → 99/96/100/100; GSC 1,342 clicks / 72,546 impressions / 113 ranking pages in 3 months; ~20 project leads/month from SEO; #1 organic for "profilpas uae", "kalinga stone uae".
- Leads: 316 verified unique leads Nov'25–Jul'26; Cat-1 pipeline AED 2.27M H1; CPL AED 128.
- Automations: 6,600+ SKU weekly stock report, Photo→PO drafts (1,000+ items); stock-sync repair touched 7,300 sales orders (matches "7,321 orders closed"); 776,478 stock units corrected and AED 160K saved are resume figures not independently visible in repos — attribute to resume.
- Catalogue: 198 products / 10 brands / 221 static pages / <152 KB first-load JS / offline PWA; built in 2 days.
- Build times: lapizblue 6 months; 60newton 4 days; castedluxe 12 days; lead dashboard 1 day. 7 products shipped in 7 months.
- Company frame: 50+ staff, 2,800+ customers, 3 branches, 4.7★ (177 reviews).

---

## Proposed case studies (10)

1. **lapizblue.com relaunch** — "Rebuilt a 1,200-page legacy site into 117 fast pages without losing a ranking." Headline: 1,200 → 95 indexed pages (or 62 per resume); Lighthouse 66 → 99. Screens: hero, /brands, Lighthouse before/after.
2. **Paid search that paid for itself** — "AED 26K of Google Ads returned AED 242K in invoiced revenue." Headline: 820% ROAS; CPA 66 → 35 after GTM fix. Screens: GTM/ads dashboards, #1 sponsored badges.
3. **60newton.com in four days** — "A dark, scroll-animated brand site plus 182 programmatic discipline × location pages." Headline: 219 URLs shipped in 4 days; Lighthouse 100/92/100/100. Screens: frame-sequence hero, /disciplines, a location page.
4. **gcbuae.com catalogue engine** — "336 schema-rich pages for 128 slab shades, 1,480 Jaquar SKUs and 51 guides." Headline: 336 pages, Product/Offer/FAQ/Collection JSON-LD on every tier. Screens: quartz filter grid, shade page, SKU table.
5. **Offline PWA sales catalogue** — "Cross-brand equivalents for 198 construction chemicals, answered in one search, offline." Headline: 198 products / 10 brands / 221 pages, <152 KB JS, built in 2 days. Screens: ⌘K search, alternatives tab, coverage calculator.
6. **Zoho stock-sync automation** — "Idempotent Deluge + Python crons that keep inventory honest." Headline: 776,478 stock units corrected; 7,321 sales orders closed; AED 160K saved. Screens: workflow run, Deluge snippet, Cliq alert (sanitize data first).
7. **Sixty Newton estimating workbench** — "A Claude assistant that proposes, a pure TypeScript engine that prices." Headline: 92 stages / 219 product families / 50 observed rates; immutable quote revisions; Supabase RLS. Screens: quote screen, assistant tool-call stream, PDF.
8. **Lead-revenue dashboard** — "Weekly WhatsApp lead snapshots turned into an AED 2.27M pipeline view." Headline: 316 verified leads, CPL AED 128, 60× pipeline per dirham. Screens: period selector + Recharts.
9. **Staff training quiz platform** — "Gamified product training for the sales floor." Headline: leaderboards, admin re-uploads, mail automation; 12 candidates in first cohort (consider aggregating later cohorts for a bigger number). Screens: quiz, leaderboard.
10. **castedluxe.com** — "A 12-day luxury art commission site with 100/95/95/100 Lighthouse." Headline: 12 days, 7 pages, zero third-party scripts. Screens: hero, gallery, process. (Optional 11th: WebWeaver — "Prompt-to-website with Claude + WebContainers", pre-Lapiz 2025 project; be transparent that the system prompt derives from Bolt.)

**Fixes worth making before screenshots/launch:** add an `<h1>` to 60newton homepage and quote page; remove the doubled "· Sixty Newton" title suffix; castedluxe canonical/sitemap use apex vs www; swap the castedluxe mailto to the client's address; make `lapiz-assistant` private; decide whether 60newton/gcbuae/castedluxe should carry analytics.
