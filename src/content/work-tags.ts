import type { Tag } from "./types";

/**
 * One line per capability for the work index: shown in the panel above the
 * cards when that tab is open. Descriptive only; the numbers stay in the
 * case studies. The tools under it are read from the projects' stacks.
 */
export const tagIntros: Record<Tag, string> = {
  website: "Fast, search friendly sites built in Next.js and shipped on Vercel.",
  seo: "Technical SEO, structured data and AI search readiness, checked in Search Console.",
  ads: "Google Ads tied to invoiced revenue, not clicks.",
  erp: "Zoho Books, Inventory and CRM set up to match the warehouse, with Deluge doing the repetitive work.",
  automation: "Scripts and workflows that take the repetitive steps out of sales, stock and finance.",
  ai: "AI workflows that assist people, not replace judgment.",
  pwa: "Installable web apps that keep working offline, on a site visit or in the warehouse.",
  extension: "Browser extensions that put the tool where people already work.",
  dashboard: "Dashboards that turn ERP and ads data into one page a manager reads.",
  brand: "Names, logos and identities, designed alongside the site.",
  ops: "Operations tooling that keeps stock, orders and teams in step.",
};

export const allIntro = "Everything beyond the websites: ERP, automation, AI, dashboards and the tools in between.";
