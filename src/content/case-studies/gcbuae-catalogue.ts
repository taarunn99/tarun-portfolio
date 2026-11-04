import type { CaseStudy } from "../types";

export const gcbuaeCatalogue: CaseStudy = {
  slug: "gcbuae-catalogue",
  title: "Global Classic: a catalogue engine the AI engines cite",
  short: "gcbuae.com",
  client: "Global Classic Building Materials Trading LLC",
  year: "2026",
  period: "2026",
  role: "Head of Technology — architecture, data extraction, SEO",
  summary:
    "A 250+-page catalogue site for KalingaStone, Jaquar and FILA built from extracted supplier data, ranked #1 in ChatGPT and Google AI Overviews for every brand it sells.",
  headlineMetric: { label: "AI Overviews & ChatGPT", value: "#1 for every brand", source: "deliverables-xlsx" },
  metrics: [
    { label: "pages", value: "250+", source: "deliverables-xlsx" },
    { label: "Lighthouse", value: "100 / 98 / 100 / 100", source: "lighthouse" },
    { label: "KalingaStone shades extracted", value: "128", source: "deliverables-xlsx" },
    { label: "Jaquar product images", value: "1,387", source: "deliverables-xlsx" },
    { label: "Google UAE", value: "#1 \"global classic building materials\"", source: "gsc", note: "31 Oct 2026" },
  ],
  sections: {
    context:
      "Global Classic is the group's Sharjah-based slab and sanitaryware company: authorised reseller for KalingaStone quartz, marble and terrazzo, Jaquar bathware and FILA stone care. It had suppliers' PDF catalogues and no website.",
    constraint:
      "The product data lived in supplier catalogues, not in a database. Every shade, SKU and product needed its own page with correct dimensions and schema, and the site had to rank for brand-plus-UAE queries that the suppliers' own pages dominate.",
    approach:
      "I extracted the catalogues into structured data — 128 KalingaStone swatches, 1,387 Jaquar product images, 34 FILA products — and generated the site from it: shade, collection and colour pages for quartz, marble and terrazzo; Jaquar category and collection pages with SKU tables; FILA product pages; and 44 blog posts answering the questions buyers search. Each tier carries Product, Offer, Collection, FAQ and Breadcrumb JSON-LD. Routing, mobile and animation performance were tuned until every category hit Lighthouse 100/98/100/100. DNS (ten records including Zoho Mail), the contact form, Search Console and Bing Webmaster went live with it.",
    result:
      "The site is #1 in ChatGPT and Google AI Overviews for every brand it sells, #1 in Google AI Mode for KalingaStone and FILA Surface Solutions, and #1 on Google UAE for \"global classic building materials\" and \"fila uae supplier\", with top-3 positions for KalingaStone quartz, marble, terrazzo and authorised-distributor searches.",
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "GSAP", "Lenis", "sharp", "Vercel", "Zoho Mail DNS"],
    retrospective:
      "The products index page carries a keyword-heavy h1 that reads like SEO rather than editorial copy. It ranks, but I would write it for a buyer now and let the structured data do the ranking.",
  },
  cover: { id: "gcbuae-home", alt: "gcbuae.com home page: marble slab supplier in the UAE" },
  gallery: [
    { id: "gcbuae-quartz", alt: "KalingaStone quartz shade grid with filters" },
    { id: "gcbuae-sku", alt: "Jaquar collection page with SKU table" },
  ],
  links: { live: "https://gcbuae.com" },
  tags: ["website", "seo", "ai"],
  services: ["nextjs-development-dubai"],
  featured: true,
  updated: "2026-11-04",
  order: 4,
};
