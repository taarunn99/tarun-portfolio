import type { CaseStudy } from "../types";

export const lapizblueRelaunch: CaseStudy = {
  slug: "lapizblue-relaunch",
  title: "Lapiz Blue: rebuilt without losing a ranking",
  short: "lapizblue.com",
  client: "Lapiz Blue General Trading LLC",
  year: "2025",
  period: "Jul – Dec 2025",
  role: "Head of Technology — solo build",
  summary:
    "Moved a building-materials distributor from an agency WordPress site to Next.js, cut ~1,200 ghost pages to 62 core pages, and kept every brand query at position one.",
  headlineMetric: { label: "pages consolidated", value: "1,200 → 62", source: "resume", note: "core pages; see note" },
  metrics: [
    { label: "Lighthouse (mobile)", value: "66 → 99", source: "halfyearly-report" },
    { label: "clicks in three months", value: "1,342", source: "gsc" },
    { label: "impressions in three months", value: "72,546", source: "gsc" },
    { label: "brand queries", value: "pos. 1.0–1.2", source: "gsc" },
    { label: "page load", value: "< 1 s", source: "deliverables-xlsx" },
  ],
  sections: {
    context:
      "Lapiz Blue distributes Mapei, Weber, Dulux, Kerakoll and a dozen other brands across Dubai, Sharjah and Abu Dhabi. Its website was an agency-run WordPress build on Hostinger with roughly 1,200 indexed URLs, most of them auto-generated ghost pages, and a mobile Lighthouse score of 66.",
    constraint:
      "I took the site over from the agency during my probation. Email, DNS and the brand's rankings for queries like \"Profilpas UAE\" could not drop for a day, and there was no budget for a second agency.",
    approach:
      "I rebuilt the site in Next.js with brand, product-category, about, contact, careers, FAQ and legal pages generated from structured data. Every legacy URL was mapped into a 301 table so the ~1,200 ghost pages collapsed into 62 core pages. Contact, quote and careers forms got email delivery and WhatsApp enquiry buttons; sitemap, robots, llms.txt, JSON-LD, the Meta pixel and AdSense approval shipped with the launch. I moved hosting to Vercel and the group's DNS and Zoho Mail records (SPF, DKIM, DMARC) with zero downtime, then added TDS pages per product starting with Mapei.",
    result:
      "Live on 24 December 2025. Lighthouse went from 66/83/74/92 to 99/96/100/100 with sub-second loads. In the first three months Search Console recorded 1,342 clicks and 72,546 impressions; brand searches sit at position 1.0–1.2 and the site ranks #1 organically for \"Profilpas UAE\" and \"Kalinga Stone UAE\", with Google AI Overview citations for five brands.",
    stack: ["Next.js 16", "TypeScript", "MDX", "Vercel", "Google Search Console", "GTM", "Zoho Mail DNS"],
    retrospective:
      "The redirect map took longer than the build. If I did it again I would crawl and classify the legacy URLs on day one, before designing anything, and ship the TDS product pages in the first release rather than as a follow-up. (Page counts: the résumé says 62 core pages; the half-yearly report counts 95 indexed URLs including blog posts.)",
  },
  cover: { id: "lapizblue-home", alt: "lapizblue.com home page: building materials and construction chemicals" },
  gallery: [
    { id: "lapizblue-brands", alt: "Brands index page" },
    { id: "lapizblue-category", alt: "Mapei waterproofing category page with FAQ and datasheets" },
  ],
  links: { live: "https://lapizblue.com" },
  tags: ["website", "seo"],
  services: ["nextjs-development-dubai"],
  featured: true,
  updated: "2026-11-04",
  order: 1,
};
