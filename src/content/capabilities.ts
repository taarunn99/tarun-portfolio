import type { Capability } from "./types";

export const capabilities: Capability[] = [
  {
    id: "web",
    title: "Web products",
    blurb: "Next.js and TypeScript sites and apps that score 95 to 100 in Lighthouse and rank.",
    items: ["Next.js 16", "TypeScript", "Supabase", "Vercel", "PWA", "Three.js / GSAP"],
    stat: { label: "production sites", value: "6", source: "resume" },
  },
  {
    id: "growth",
    title: "Growth",
    blurb: "Google Ads, technical SEO and AI-search optimisation measured in invoiced revenue, not clicks.",
    items: ["Google Ads", "GA4 + GTM", "Search Console", "Bing + IndexNow", "llms.txt", "Local SEO"],
    stat: { label: "ROAS", value: "820%", source: "resume" },
  },
  {
    id: "erp",
    title: "ERP & operations",
    blurb: "Zoho Books, Inventory and CRM taken in-house: automations, backfills, a Chrome add-on and daily reports.",
    items: ["Zoho One", "Deluge", "Python", "Chrome extensions", "E-invoicing readiness"],
    stat: { label: "sales orders closed", value: "7,321", source: "resume" },
  },
  {
    id: "ai",
    title: "AI & automation",
    blurb: "Claude API, MCP and n8n workflows that assist people instead of replacing judgment.",
    items: ["Claude API", "MCP servers", "n8n", "GitHub Actions", "Zoho Cliq assistant"],
    stat: { label: "skill toolkit built", value: "13", source: "deliverables-xlsx" },
  },
  {
    id: "brand",
    title: "Brand & content",
    blurb: "Company profiles, catalogues, packaging and social, produced with two mentored interns.",
    items: ["Canva", "Affinity", "Illustrator", "DaVinci Resolve", "Figma"],
    stat: { label: "commercial documents", value: "25+", source: "resume" },
  },
  {
    id: "ops",
    title: "IT & infrastructure",
    blurb: "DNS, email security, 25 workstations across three branches, and the breach that got fixed the same day.",
    items: ["DNS / SPF / DKIM / DMARC", "Microsoft 365", "Zoho Mail", "AWS SAA"],
    stat: { label: "branches run", value: "3", source: "resume" },
  },
];
