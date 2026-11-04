import type { CaseStudy } from "../types";

export const castedluxe: CaseStudy = {
  slug: "castedluxe",
  title: "Casted Luxe: a luxury art site in twelve days",
  short: "castedluxe.com",
  client: "Casted Luxe by Ashrat",
  year: "2026",
  period: "Jul 2026",
  role: "Brand, design and build",
  summary:
    "Name, logo, tagline and website for a bespoke epoxy and calligraphy art studio in Dubai, built in twelve days with an AI-made hero film and Lighthouse 100/95/95/100.",
  headlineMetric: { label: "brief to live", value: "12 days", source: "deliverables-xlsx" },
  metrics: [
    { label: "Lighthouse", value: "100 / 95 / 95 / 100", source: "lighthouse" },
    { label: "pages", value: "7", source: "halfyearly-report" },
    { label: "third-party scripts", value: "0", source: "halfyearly-report" },
    { label: "live", value: "17 Jul 2026", source: "deliverables-xlsx" },
  ],
  sections: {
    context:
      "An artist producing hand-poured resin wall art and gold-leaf Arabic calligraphy on commission, with no brand and no online presence beyond Instagram.",
    constraint:
      "Everything — name, logo, tagline, copy, imagery, site — in under two weeks, on a cream palette that still had to pass contrast, with the artwork photography and generated visuals doing most of the talking.",
    approach:
      "I named the studio, drew the logo and wrote the tagline, researched competitors, then built a seven-page Next.js site: a gallery of eight commissions with per-piece WhatsApp enquiry, a five-step process page, about, contact and legal pages. The hero is a short motion film made with AI tools. Serif and script typography on a cream and umber palette carry the brand; there are no third-party scripts.",
    result:
      "Live on 17 July 2026 at Lighthouse 100/95/95/100. The image generation took the most time of any task on the project — a lesson that now shapes how I budget creative builds.",
    stack: ["Next.js 16", "TypeScript", "GSAP", "Lenis", "Vercel", "AI image and video tools"],
    retrospective:
      "The canonical tags point at the apex domain while the site redirects to www, and the process and about pages shipped without an h1 — small things a launch checklist catches. Fixed in the audit that followed.",
  },
  cover: { id: "castedluxe-home", alt: "castedluxe.com home page: serif and script typography on cream" },
  gallery: [{ id: "castedluxe-gallery", alt: "Gallery of commissioned pieces" }],
  links: { live: "https://castedluxe.com" },
  tags: ["website", "brand"],
  services: ["nextjs-development-dubai"],
  featured: false,
  updated: "2026-11-04",
  order: 11,
};
