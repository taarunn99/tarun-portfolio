import type { CaseStudy } from "../types";

export const offlineCataloguePwa: CaseStudy = {
  slug: "offline-catalogue-pwa",
  title: "An offline catalogue that answers \"what's the equivalent?\"",
  short: "Offline catalogue PWA",
  client: "Lapiz Blue General Trading LLC",
  year: "2026",
  period: "Apr 2026",
  role: "Head of Technology — product, data model, build",
  summary:
    "A staff-only PWA with 183 construction-chemical products across nine brands that suggests exact, near and same-category alternatives and works with no signal in the warehouse.",
  headlineMetric: { label: "products, offline", value: "183", source: "resume" },
  metrics: [
    { label: "brands", value: "9", source: "deliverables-xlsx" },
    { label: "static pages", value: "206", source: "deliverables-xlsx" },
    { label: "first-load JavaScript", value: "< 152 KB", source: "github" },
    { label: "built in", value: "2 days", source: "halfyearly-report" },
  ],
  sections: {
    context:
      "Counter staff and salesmen field questions like \"do you have something equivalent to this Mapei grout?\" across nine brands and thousands of SKUs. The answers lived in people's heads and in supplier PDFs.",
    constraint:
      "It had to work on the shop floor and in warehouses with poor connectivity, open instantly on cheap Android phones, and never show cost prices.",
    approach:
      "I modelled every product with classification tokens (cement-based, C2TE, S1 and so on) so a three-tier engine can propose exact, near and same-category alternatives across brands. The app is a statically exported Next.js PWA with a service worker, fuzzy ⌘K search, a coverage calculator, three-way compare, WhatsApp share and recently-viewed, with deep links into Zoho product search.",
    result:
      "Live on 20 April 2026 with 183 products, nine brands and 206 pages, under 152 KB of first-load JavaScript, fully usable offline. It replaced the catalogue PDFs on the sales floor.",
    stack: ["Next.js", "React 19", "Fuse.js", "Service Worker", "Tailwind", "Vercel"],
    retrospective:
      "The classification tokens were hand-entered; an extraction step from the technical datasheets would have been faster and would stay current as suppliers update products.",
  },
  cover: { id: "cover-pwa", alt: "Abstract render: fanned matte-black cards, one marked with a lime dot" },
  gallery: [],
  links: {},
  tags: ["pwa", "website"],
  services: ["nextjs-development-dubai"],
  featured: false,
  updated: "2026-11-04",
  order: 5,
};
