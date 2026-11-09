import type { CaseStudy } from "../types";

export const estimatingWorkbench: CaseStudy = {
  slug: "estimating-workbench",
  title: "An estimator where the AI explains and the code prices",
  short: "Estimating workbench",
  client: "Sixty Newton Technical Services",
  year: "2026",
  period: "2026",
  role: "Head of Technology: product design, pricing engine, Claude integration",
  summary:
    "A private quoting app covering all fourteen Sixty Newton work types: material cost from Zoho Books, a pure-TypeScript pricing engine, a Claude assistant that flags over- and under-pricing, and a full quotation PDF with automatic follow-ups.",
  headlineMetric: { label: "work types priced", value: "14", source: "deliverables-xlsx" },
  metrics: [
    { label: "database migrations with RLS", value: "12", source: "github" },
    { label: "quote revisions", value: "immutable", source: "github" },
    { label: "follow-up emails", value: "automatic", source: "deliverables-xlsx", note: "from quotes@60newton.com" },
    { label: "rate provenance levels", value: "4", source: "github", note: "books / tds / quote / manual" },
  ],
  sections: {
    context:
      "Sixty Newton quotes waterproofing, flooring and tiling jobs by the square metre. Estimates were built in spreadsheets from memory of material prices, and follow-ups depended on whoever sent the quote.",
    constraint:
      "A wrong price costs real money on a 6,400 m² job. Any AI in the loop had to be helpful without ever being the thing that does the arithmetic, and every quote revision needed an audit trail.",
    approach:
      "I built the workbench on Next.js and Supabase with row-level security. A pure-TypeScript pricing engine prices stages and product families from rates with provenance: Zoho Books cost, technical datasheet coverage, a previous quote, or a manual entry with a confidence level. Material cost is pulled from Zoho Books. A Claude assistant proposes changes through tool calls and explains each charge, flagging lines that look over- or under-priced; it never computes a total. Quotes are immutable revisions rendered to PDF, synced to Zoho Books by a cron, with automatic follow-up emails and a weekly digest.",
    result:
      "The app covers all fourteen work types and produces a full quotation PDF with an explanation of every charge. Estimators now see where each rate came from and how confident it is before a quote leaves the building.",
    stack: ["Next.js", "Supabase (Postgres, Auth, RLS)", "Claude API", "@react-pdf/renderer", "zod", "Vitest", "Zoho Books API"],
    retrospective:
      "Separating proposal (model) from computation (engine) was the right call and made testing trivial. What I underestimated was rate provenance: half the value turned out to be knowing where a number came from, so I'd design that first next time.",
  },
  cover: { id: "cover-estimator", alt: "Abstract render: an obsidian balance of two floating discs, one holding a cyan pellet" },
  gallery: [],
  links: {},
  tags: ["ai", "automation", "dashboard"],
  services: ["ai-automation", "zoho-automation-uae"],
  featured: true,
  updated: "2026-11-04",
  order: 8,
};
