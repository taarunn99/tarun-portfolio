import type { CaseStudy } from "../types";

export const zohoHelperOpsConsole: CaseStudy = {
  slug: "zoho-helper-ops-console",
  title: "Live margins inside Zoho, on 25 PCs, by role",
  short: "Zoho Helper & Ops Console",
  client: "Lapiz Group",
  year: "2026",
  period: "2026",
  role: "Head of Technology — Chrome extension, admin console, rollout",
  summary:
    "A Chrome add-on that shows FIFO margin on every quote, order and invoice line, warns before low-margin sales, and hides cost prices — controlled per department from an admin console without reinstalling anything.",
  headlineMetric: { label: "workstations controlled", value: "25", source: "deliverables-xlsx" },
  metrics: [
    { label: "end-to-end tests passed", value: "8", source: "deliverables-xlsx" },
    { label: "branches with stock in search", value: "3", source: "deliverables-xlsx" },
    { label: "daily reports automated", value: "4", source: "deliverables-xlsx" },
    { label: "distribution", value: "Chrome Web Store", source: "deliverables-xlsx" },
  ],
  sections: {
    context:
      "Salesmen quote from Zoho Books all day without seeing what an item actually cost. Low-margin sales were discovered at month end, and cost prices were sometimes quoted to customers by mistake.",
    constraint:
      "Zoho's UI can't be changed, the general manager and the salesmen need different views, and anything deployed to 25 PCs across three branches had to be updated without touching each machine.",
    approach:
      "I built the Lapiz Zoho Helper as a Chrome extension: it reads each quote, sales-order and invoice line, computes live FIFO margin and colours it red, amber or green, warns before saving a low-margin sale, shows Al Quoz, bulk and Sharjah stock inside Zoho search, and hides cost price from sales screens. A separate GM build adds Abu Dhabi stock. The Lapiz Ops Console is an admin app with its own login that switches each feature on or off per department or per Zoho user, pushes changes to every install, shows version and last-seen per machine, and revokes access in one click. Four daily reports — low margin, edited documents, delivery notes, stock check — go out automatically, each salesperson receiving only their own customers.",
    result:
      "Published on the Chrome Web Store and rolled out to staff; the console passed eight end-to-end tests and now controls 25 workstations. Low-margin sales are flagged before they are saved instead of after they are invoiced.",
    stack: ["Chrome Extensions (MV3)", "TypeScript", "Zoho Books API", "Zoho Deluge", "Next.js", "Supabase"],
    retrospective:
      "FIFO cost depends on clean inventory, which is why this shipped after the stock-sync cleanup. The next step is the same margin logic as a Zoho custom function so it also applies to orders created through the API.",
  },
  cover: { id: "cover-extension", alt: "Abstract render: a small puzzle-shaped block docking into a glass slab" },
  gallery: [],
  links: {},
  tags: ["extension", "erp", "dashboard"],
  services: ["zoho-automation-uae"],
  featured: false,
  updated: "2026-11-04",
  order: 7,
};
