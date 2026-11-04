<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

I have what I need. Here is the report.

---

# SEO, Contact Form and LinkedIn-API Research for tarunshukla portfolio (Nov 2026)

## 0. Two findings that reframe everything

1. **The name "Tarun Shukla" is heavily contested.** The SERP is split between a HarperCollins author/journalist (Instagram, strong entity), a C5i consultant, an IMDb actor, an Infogain developer, a Guardian Life tech lead, a UI/UX designer on `tarunshukla.framer.website`, plus ZoomInfo scrapes. There is no Knowledge Panel to "claim" and the author namesake is the most notable entity. Realistic goal: own the top result for **"Tarun Shukla Dubai"**, **"Tarun Shukla developer"**, **"Tarun Shukla Next.js"**, and get a top-3 slot for the bare name via Person/ProfilePage schema + consistent `sameAs`. Not a Knowledge Panel.
2. **You already have an entity footprint via Lapiz Blue.** `dubai-businessdirectory.com` lists "Tarun Shukla" as contact for Lapiz Blue General Trading LLC (Al Quoz) with `tarun.s@lapizblue.com` exposed, and a Lapiz Blue LinkedIn post tags you. lapizblue.com (clearly Next.js on Vercel from `/_next/image` + `dpl=` params) has **no developer credit** anywhere. A single "Site by Tarun Shukla" footer link from lapizblue.com is the most valuable, most relevant backlink you can get, and it corroborates the case study. Ask for it first.

---

## 1. What actually works for a person's site in 2026

| Tactic | Verdict | Evidence |
|---|---|---|
| **Person + ProfilePage JSON-LD with `sameAs`** | Do it. No rich result for Person alone; the value is entity disambiguation (critical given namesakes). Google lists "About Me page on a blog" as a valid ProfilePage use; `mainEntity: Person` required, `sameAs`, `image`, `description`, `alternateName`, `identifier` recommended. | [Google ProfilePage docs](https://developers.google.com/search/docs/appearance/structured-data/profile-page) |
| **WebSite + Organization schema** | WebSite yes (sitewide, `publisher` = Person). Organization only if you trade under a name; otherwise Person as publisher is cleaner and more honest. No 2026 change found to Organization docs. | [Google Organization markup](https://developers.google.com/search/blog/2023/11/introducing-organization-markup) |
| **Knowledge Panel** | Not requestable; Google creates it when it sees a distinct notable entity, then you claim via GSC. With a notable author namesake, don't plan around it. | [Kalicube](https://kalicube.com/learning-spaces/faq-list/knowledge-panels/the-process-of-claiming-a-knowledge-panel-in-google/), [Stackmatix](https://www.stackmatix.com/blog/how-to-get-google-knowledge-panel) |
| **E-E-A-T** | Real photo, real client names, numbers, dated posts, author byline linking to /about, verifiable claims (Lapiz Blue footer credit, LinkedIn recommendation from Lapiz Blue GM). Not a ranking "factor" but it's how AI engines and raters decide who to cite. | Google's AI guidance below |
| **AI search (AI Overviews / AI Mode / ChatGPT / Perplexity)** | Google's official page: "no additional requirements", "you don't need to create new machine readable files, AI text files, or markup"; just be indexed and snippet-eligible; structured data must match visible text; AI Overview/AI Mode traffic shows under "Web" in GSC. Third-party studies: ~28% of ChatGPT's most-cited pages have little Google visibility, Perplexity cites fresh, well-structured pages far more often than ChatGPT. Practical: answer-first paragraphs, dated content, concrete figures, allow `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` in robots.txt. | [Google AI features & your website](https://developers.google.com/search/docs/appearance/ai-features), [AirOps stats](https://www.airops.com/blog/ai-seo-statistics) |
| **llms.txt** | Cheap to add (10 lines), but no provider has confirmed consuming it; adoption 0.3–10% depending on study; crawler-log analyses show ~0.1% of bot traffic touches it. Add it, expect nothing. | [dev.to reality check](https://dev.to/mrtd/llmstxt-reality-check-10-of-sites-have-it-ai-search-engines-almost-never-read-it-2281), [coderlegion](https://coderlegion.com/19861/everyones-telling-you-to-add-llms-txt-for-ai-search-the-2026-data-says-it-gets-1-crawler-tra) |
| **Google Business Profile** | Eligible only if you have a staffed location or **travel to customers in person** (service-area business, address hidden). Remote-only is not eligible; virtual offices are rejected. For a developer it's a weak signal and a suspension risk. Skip unless you genuinely do on-site Zoho work at client offices; then create an SAB with hidden Al Quoz/home address. | [GBP eligibility guidelines](https://support.google.com/business/answer/3038177), [Whitespark](https://whitespark.ca/blog/are-virtual-service-businesses-eligible-for-a-google-business-profile/) |
| **Backlinks** | In order of value: (1) lapizblue.com footer credit, (2) LinkedIn Featured + About links (nofollow but entity-corroborating), (3) GitHub profile README (nofollow), (4) Hashnode/Dev.to republishing with `canonical_url` / `originalArticleURL` set (both support it; Medium only sets canonical on import-from-URL), (5) Zoho Community (help.zoho.com) answers linking to your Zoho write-ups, (6) Upwork/Clutch profile. Avoid directories beyond that. | [Hashnode canonical](https://townhall.hashnode.com/why-you-should-republish-your-devblog-posts-and-how-to-do-it), [dev.to canonical](https://dev.to/maddy/how-to-add-canonical-links-on-devto-4j3h) |
| **Core Web Vitals** | Still part of page experience; Next.js 16 on Vercel passes if you use `next/image`, `next/font`, avoid heavy hero animations, keep INP low (no blocking JS on first interaction). Table stakes, not a differentiator. | Google AI features doc ("good page experience") |
| **hreflang** | Not needed (single English site). Only if you add `/ar`. | — |
| **IndexNow** | Bing, Yandex, Naver, Seznam only; Google does not support it. Worth 20 minutes: Bing Webmaster Tools (import from GSC) + a post-deploy ping, because ChatGPT search leans on Bing's index. | [IndexNow engines](https://meshworld.in/blog/web-dev/seo/indexnow/search-engines-supporting-indexnow/) |
| **FAQ / HowTo schema** | FAQ rich results restricted to gov/health in Aug 2023 and reportedly removed entirely May 2026; HowTo deprecated Sept 2023. Use FAQPage only for machine-readability, expect no rich result. BreadcrumbList still supported. | [Google: HowTo/FAQ changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes) |
| **Google Indexing API** | Still JobPosting/BroadcastEvent only. Not for you. | [Indexing API](https://developers.google.com/search/apis/indexing-api) |

---

## 2. SERP competition check (live results, Nov 2026)

| Query | Who ranks | Difficulty | Page 1 in 3–6 mo? | #1? |
|---|---|---|---|---|
| **Next.js developer Dubai** | Agencies (RW Infotech, ControlShift, Karve, 1stpage.ae, Banao, nDigital) **plus two individuals**: `anastanveer.com/nextjs-developer-dubai/`, `dipanshudev.com/services/nextjs-developer/dubai` | Medium | Yes | Possible; individuals already rank, agencies have thin pages |
| **Next.js freelancer Dubai** | RedBerries, RW Infotech, Karve, hiredeveloper.ae, **Pooya Golchian blog post** (`pooya.blog`), STS, Emote | Low–Medium | Yes | Plausible; weakest SERP of the dev queries |
| **Zoho consultant Dubai** | Entirely Zoho Partners: Codelattice, Burhani, Alif, Penieltech, Zocoden, RIBS, AGN, Al Fahad | High | Unlikely | No; partner badge + years of links |
| **Zoho Books automation UAE** | Codelattice case study, Zavior service page, Zabeel training, pricing/VAT blogs, Techvaria blog | Low–Medium | Yes, with one strong case study | Plausible; SERP is thin and informational |
| **SEO freelancer Dubai** | Dozens of individuals whose whole business is this (Sumayya Latheef, KZY, DigitalGroot, Naseeha, Anand Jha) + Clutch | High | Unlikely | No |
| **AI automation consultant Dubai** | Agencies (UpstartAI, Kinetic, Konvergense, DigeeX, TAIPPA) + individuals (Mohammad Fazil, Lopty Pascal) | Medium | Yes if angled (Zoho + AI) | Unlikely for the generic head term |
| **Google Ads freelancer Dubai** | All individuals with dedicated sites (Mubin, Sumayya, Sudheep, DM Creative, Samanna, PPC&More) | Medium–High | Maybe | No |
| **full stack developer Dubai portfolio** | Indeed, Glassdoor, Bayt job listings + agencies; **zero personal portfolios** | Low competition but job-board intent | Yes | Low value; recruiters searching this are reading job ads |
| **Tarun Shukla** | Instagram (author), LinkedIn x3, ZoomInfo x2, IMDb, Framer designer | Medium (entity collision) | Top 3 yes | Bare name #1 is uncertain; "Tarun Shukla Dubai/developer" #1 is near-certain |

Supplementary checks: "Zoho CRM developer Dubai freelance Deluge" is Upwork/Fiverr/Freelancer-dominated with one job ad; "Zoho Books Next.js integration" has **no** competing service page at all (only API docs and generic consultancies); "Next.js developer UAE hire freelance" is Upwork/Arc/hiredeveloper.ae/Codingclave.

### Realistic targets (8–12)
1. Next.js developer Dubai
2. Next.js freelancer Dubai / freelance Next.js developer UAE
3. Zoho Books automation UAE (+ Dubai variant)
4. Zoho Books API integration (Next.js / custom portal) — zero competition
5. Shopify + Zoho Books integration UAE
6. WhatsApp + Zoho Books invoice automation UAE
7. Zoho CRM Deluge developer Dubai (beat marketplaces with a real case study)
8. Zoho + AI automation Dubai (your angle on "AI automation consultant")
9. Next.js migration / website rebuild for UAE distributor (long-tail from the Lapiz Blue case study, e.g., "building materials distributor website Next.js")
10. Tarun Shukla Dubai / Tarun Shukla developer
11. Core Web Vitals / site speed audit Dubai (secondary, if you want growth-marketing inbound)
12. Headless / Next.js B2B catalogue site UAE

### Vanity queries to avoid as targets
- Zoho consultant Dubai / Zoho partner Dubai
- SEO freelancer Dubai / SEO expert Dubai
- Google Ads freelancer Dubai
- Full stack developer Dubai (job-board SERP)
- Web developer Dubai / website development company Dubai

Note: the top-ranking UAE freelancers conspicuously advertise a **Dubai freelance permit / advertiser permit** as a trust signal. GoFreelance (DDA) is ~AED 7,500/yr; some TECOM clusters paused new individual permits in 2026; freelancing while employed generally needs a permit and employer NOC. Check with MOHRE/your contract before publishing "available for freelance" copy. ([StashAway](https://www.stashaway.ae/r/freelance-visa-dubai), [Takween](https://takweenadvisory.ae/en/blog/how-to-get-freelance-license-dubai))

---

## 3. Site architecture

### Routes
```
/                      Home: one-line positioning, 3 case studies, proof strip, single CTA
/work                  Case-study index
/work/[slug]           e.g. /work/lapizblue-nextjs-rebuild, /work/zoho-books-invoice-automation
/services/nextjs-development-dubai
/services/zoho-automation-uae
/services/ai-automation          (3 service pages max; each links to 1–2 case studies)
/about                 ProfilePage + Person (the entity page)
/resume                HTML résumé (indexable) + PDF link; PDF gets rel=canonical header to /resume
/writing, /writing/[slug]   Blog ("writing"/"notes", not "blog", keeps editorial tone)
/contact
/uses, /now            Optional, cheap, developer-community friendly
```
Separate service URLs beat anchor sections because each maps to a distinct intent. Keep them to three.

### Internal linking (hub–spoke)
Home → 3 services + 3 case studies. Each service → its case studies + 1–2 relevant posts + contact. Each case study → the service it proves + "related work". Every post → author (/about). Footer: About / Work / Writing / Contact / LinkedIn / GitHub. Breadcrumbs on /work/*, /services/*, /writing/*.

### Title / description patterns
- Home: `Tarun Shukla — Next.js developer & Zoho automation, Dubai`
- Service: `Next.js development in Dubai — Tarun Shukla` / `Zoho Books & CRM automation for UAE businesses — Tarun Shukla`
- Case study: `{Client}: {outcome in 6 words} — Tarun Shukla` e.g. `Lapiz Blue: rebuilding a B2B distributor site in Next.js`
- Writing: `{Title} — Tarun Shukla`
- Descriptions 140–155 chars, one concrete number or constraint each, no superlatives.

### Per-page OG images
Use `opengraph-image.tsx` with `ImageResponse` per route segment; dynamic for `/work/[slug]` and `/writing/[slug]` (title + client + one metric). One static branded image for home/about.

### Sitemap and robots
`app/sitemap.ts` with real `lastModified` (Google ignores `priority`; use it anyway: home 1.0, services/case studies 0.9, about 0.8, writing 0.6). `robots.ts`: allow all, including `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bingbot`; disallow `/api/`.

### Structured data
- Layout: `WebSite` (publisher → Person `@id`) + `Person` with `@id: https://domain/#person`, `sameAs` [LinkedIn, GitHub, X, Dev.to/Hashnode, Upwork], `jobTitle`, `address.addressLocality: Dubai`, `knowsAbout`, `image`.
- /about: `ProfilePage` with `mainEntity` → same Person `@id`.
- /work/* and /writing/*: `Article`/`TechArticle` with `author` → Person `@id`, `datePublished`, `dateModified`.
- /services/*: `Service` (provider → Person, `areaServed`: Dubai, UAE). Low direct value, harmless.
- `BreadcrumbList` on nested pages. FAQPage optional, no rich result.

### Editorial tone (avoid the "desperate SEO page")
- H1 is human ("I build fast Next.js sites and Zoho back-offices for UAE businesses"), keyword lives in `<title>` and first paragraph.
- Mention "Dubai"/"UAE" once naturally per page, not in every heading.
- Case-study structure: Context → Constraint → What I did → Result (numbers, before/after) → Stack → What I'd change. No testimonials carousel; one real quote if you have it.
- No "Hire me" in nav. "Contact" or "Work with me". No pricing anxiety, no "limited slots".
- No "best"/"top"/"#1" anywhere. Your competitors' pages are stuffed with it; the contrast is the brand.

---

## 4. Contact form (static Next.js on Vercel → Gmail, address hidden)

| Option | Free tier (verified) | Address hidden? | Notes |
|---|---|---|---|
| **Resend** | 3,000/mo, **100/day**, 3 domains, 30-day logs, 1 webhook; Pro $20 ([pricing](https://resend.com/pricing)) | Yes (server-side `to`) | Needs DNS (SPF/DKIM) on your domain; needs a Server Action/Route Handler (Vercel Hobby functions are free). Set `reply_to` = visitor. |
| **Web3Forms** | 250/mo, unlimited forms, hCaptcha, honeypot ([pricing per 3rd parties](https://splitforms.com/web3forms-pricing)) | Yes (public access key maps to email) | Zero backend. Good fallback if you want a purely static export. |
| **Formspree** | 50/mo | Yes | Too small; branding on free. |
| **Vercel Function + Nodemailer + Gmail app password** | Free | Yes | Vercel explicitly recommends against SMTP from functions; silent 200-with-no-email failures and timeouts are common; ties site to a personal Google account's 2SV/app-password state. Don't. ([Vercel community](https://community.vercel.com/t/next-js-backend-is-not-working/6671), [flaviocopes](https://flaviocopes.com/sending-emails-with-nodemailer-on-vercel.md)) |
| **Turnstile vs hCaptcha** | Turnstile: free, invisible/managed modes, works without Cloudflare DNS, server `siteverify` ([docs](https://developers.cloudflare.com/turnstile/)). hCaptcha free shows visible image challenges. | — | Turnstile wins for a portfolio. |
| **Rate limiting** | **Vercel WAF rate limiting is on Hobby**: 1 rule/project, 1M allowed requests included, fixed window, IP/JA4 keys ([docs](https://vercel.com/docs/security/vercel-waf/rate-limiting)). Alt: Upstash Redis free 500K cmds/mo + `@upstash/ratelimit` ([pricing](https://upstash.com/pricing/redis)). | — | Use the WAF rule on the contact path; no extra infra. |

**Recommendation:** Resend via a Next.js Server Action, `from: hello@yourdomain`, `to: agmnwosgr@gmail.com` (env var, server-only), `reply_to: visitor`, plus Turnstile (managed mode) verified server-side, a hidden honeypot field, a min-time-to-submit check, zod validation, and one Vercel WAF rate-limit rule (e.g., 5 req/10 min per IP on the action path). Cost: $0. Add Cloudflare Email Routing (free) so `hello@domain` forwards to Gmail; then even the destination isn't hard-coded. If you insist on `output: 'export'`, use Web3Forms with hCaptcha.

---

## 5. LinkedIn (and Indeed/Dubizzle/Bayt) API realities for the future dashboard

**Self-serve ("Open Permissions") in 2026, verified on Microsoft Learn ([getting-access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)):**
- *Sign In with LinkedIn using OpenID Connect*: `openid`, `profile`, `email`.
- *Share on LinkedIn*: `w_member_social` — post, comment, like as the member.
- Everything else (Advertising, Community Management `w/r_organization_social`, Sales Navigator SNAP, Talent/ATS, Compliance) is partner-approval or closed.

**Posting:** `/rest/posts` replaces `ugcPosts`; needs `Linkedin-Version: YYYYMM` + `X-Restli-Protocol-Version: 2.0.0`; organic posts support text, image, video, document (PDF carousel), article, multi-image, poll ([Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)). Rate limit: 150 requests/member/day, 100k/app/day ([Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)). **Caveat:** `r_member_social` (reading your own posts/analytics) is "restricted, approved users only", so you cannot read engagement back. Access tokens last 60 days and programmatic refresh is partner-only, so expect to re-authorise roughly every two months ([refresh tokens](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens)).

**Job search / apply / people search:** Not available to individuals. Talent APIs (Job Postings, Apply Connect, Apply with LinkedIn, RSC) are for employers/ATS partners via application form; no endpoint lists other companies' jobs; People Search is gone; Sales Navigator API is not accepting partners; no connections/messaging API. ([Talent partner form](https://business.linkedin.com/talent-solutions/ats-partners/partner-application), [Phyllo 2026 overview](https://www.getphyllo.com/post/linkedin-api-access-in-2026-partner-program-approval-timeline-alternatives))

**Against ToS:** LinkedIn's help page prohibits "crawlers, bots, browser plug-ins, and extensions that scrape LinkedIn, alter its appearance, or automate activity"; consequence is restriction or closure ([Prohibited software and extensions](https://www.linkedin.com/help/linkedin/answer/a1341387); User Agreement §8.2). Easy-Apply bots, cookie-based automation (Phantombuster/Expandi style), and Chrome-extension autoconnect are exactly what's named. Scraped-data vendors (Proxycurl-type) are a legal grey zone and reportedly litigated.

**Realistic architecture:**
- *Posting*: compose/queue in your dashboard → Vercel Cron → `/rest/posts` with `w_member_social`. Fully compliant. Re-auth every 60 days.
- *Job discovery*: no LinkedIn/Indeed/Dubizzle/Bayt APIs. Indeed Publisher API closed to new applicants since ~2022–23; remaining Indeed APIs are employer-side (Job Sync, Indeed Apply) ([jobspipe](https://jobspipe.dev/blog/indeed-publisher-api)). Dubizzle: no developer API, only Apify scrapers ([Apify](https://apify.com/powerbox/dubizzle-jobs-listing-scraper/api)). Bayt: "does not have an API" ([GetApp](https://www.getapp.com/hr-employee-management-software/a/bayt-com-job-posting)). Compliant sources instead: LinkedIn/Indeed **job-alert emails parsed from your own Gmail** (Gmail API), public ATS job-board JSON endpoints (Greenhouse, Lever, Ashby, Workable) for target UAE employers, and company career-page RSS.
- *Apply / networking*: manual-assist only. Dashboard tracks pipeline, drafts tailored cover notes/messages with an LLM, opens the job URL, copies text to clipboard, logs the application. You click Apply and Send. Zero automation inside LinkedIn.

---

## Prioritized action list

1. **Ask Lapiz Blue for a footer credit link** ("Website by Tarun Shukla") and a LinkedIn recommendation. Write the Lapiz Blue case study with before/after numbers (LCP, pages indexed, leads/WhatsApp clicks).
2. **Ship entity schema**: sitewide `WebSite` + `Person` (`@id`, `sameAs`), `ProfilePage` on /about, `Article` on case studies/posts, `BreadcrumbList`. Make LinkedIn/GitHub/X display names, photo and headline identical to the site.
3. **Build the 3 service pages + /work/[slug]** with the title patterns above; target queries 1–8. Publish the Zoho Books automation case study second (thinnest SERP, highest commercial intent in your stack).
4. **Contact form**: Resend + Server Action + Turnstile + honeypot + Vercel WAF rate-limit rule; Cloudflare Email Routing alias → Gmail.
5. **Technical baseline**: `sitemap.ts`/`robots.ts` (allow AI crawlers), per-route `opengraph-image.tsx`, `next/image` + `next/font`, verify CWV in PageSpeed; GSC + Bing Webmaster Tools (import) + IndexNow ping on deploy; add `llms.txt` (10 min, zero expectations).
6. **Distribution**: GitHub profile README linking the site; LinkedIn Featured → case studies; republish 2–3 posts on Hashnode/Dev.to with canonical set; answer 5 Zoho Community threads linking to your Zoho write-ups.
7. **Write 4–6 posts** on zero-competition intersections: Zoho Books API from Next.js Server Actions, Shopify→Zoho Books order sync, WhatsApp invoice notifications with Zoho Books, Deluge patterns, Next.js 16 migration notes. Answer-first, dated, with numbers.
8. **Skip**: Google Business Profile (unless you meet clients on-site), Zoho-consultant/SEO/Google-Ads head terms, FAQ-schema expectations, any LinkedIn browser automation.
9. **Later (dashboard)**: Share on LinkedIn scheduler via `/rest/posts`; Gmail-parsed job alerts + ATS public boards; manual-assist apply/networking. Sort out freelance permit/NOC before advertising availability.
