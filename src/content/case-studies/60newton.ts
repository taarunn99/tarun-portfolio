import type { CaseStudy } from "../types";

export const sixtyNewton: CaseStudy = {
  slug: "60newton",
  title: "Sixty Newton: 219 pages in four days",
  short: "60newton.com",
  client: "Sixty Newton Technical Services",
  year: "2026",
  period: "May 2026",
  role: "Head of Technology — design, build, SEO",
  summary:
    "A dark, scroll-animated brand site for a specialist contractor, with fourteen discipline pages and a programmatic discipline-by-location layer, live four days after the brief.",
  headlineMetric: { label: "built in", value: "4 days", source: "deliverables-xlsx" },
  metrics: [
    { label: "Lighthouse", value: "100 / 92 / 100 / 100", source: "lighthouse" },
    { label: "URLs in sitemap", value: "219", source: "halfyearly-report" },
    { label: "homepage position", value: "3.2", source: "gsc", note: "within 10 weeks" },
    { label: "SEO service pages", value: "14", source: "resume" },
  ],
  sections: {
    context:
      "Sixty Newton applies waterproofing, epoxy flooring, microtopping, large-format tiling and more for projects like Atlantis The Royal and Al Wathba Desert Resort. It had no site of its own under the new domain and needed one before a tender cycle.",
    constraint:
      "Four days from brief to live, a dark luxury look to match the clients it serves, and every one of fourteen disciplines had to be findable for the Dubai and Sharjah areas the crews actually work in.",
    approach:
      "I designed and built the site in Next.js with a scroll-driven frame-sequence hero, fourteen discipline pages and a programmatic layer that pairs each discipline with the locations it serves, each with its own FAQ, service schema and breadcrumbs. Portfolio case studies carry square-metre figures per project. A quote request flow, privacy and terms pages, an llms.txt index and an IndexNow-backed Bing setup shipped with it, and Search Console got a change-of-address from the old domain.",
    result:
      "Live on 20 May 2026 with Lighthouse 100/92/100/100 and 219 URLs in the sitemap. The homepage reached position 3.2 within ten weeks; the location pages are the long-tail that brings in the enquiries.",
    stack: ["Next.js 16", "TypeScript", "GSAP", "Lenis", "Vercel", "Search Console", "IndexNow"],
    retrospective:
      "Building in four days meant the homepage shipped without an h1 and the title template doubled its suffix — both found later in an audit. A launch checklist run by someone other than the builder would have caught them on day four.",
  },
  cover: { id: "60newton-home", alt: "60newton.com home page: dark hero for a specialist contractor" },
  gallery: [
    { id: "60newton-disciplines", alt: "Fourteen disciplines index" },
    { id: "60newton-location", alt: "Discipline-by-location page" },
  ],
  links: { live: "https://60newton.com" },
  tags: ["website", "seo"],
  services: ["nextjs-development-dubai"],
  featured: true,
  updated: "2026-11-04",
  order: 3,
};
