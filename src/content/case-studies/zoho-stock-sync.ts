import type { CaseStudy } from "../types";

export const zohoStockSync: CaseStudy = {
  slug: "zoho-stock-sync",
  title: "Zoho stock-sync: 776,478 units reconciled, zero errors",
  short: "Zoho stock-sync automation",
  client: "Lapiz Group (Dubai and Abu Dhabi Zoho orgs)",
  year: "2026",
  period: "2025 – Oct 2026",
  role: "Head of Technology — ERP owner, automation, backfills",
  summary:
    "Took the group's Zoho Books and Inventory in-house, automated packing and shipping for every invoiced order, and ran a backfill that closed 7,321 stuck orders and corrected 776,478 units of stock.",
  headlineMetric: { label: "stock units corrected", value: "776,478", source: "resume", note: "across 1,475 items" },
  metrics: [
    { label: "stuck sales orders closed", value: "7,321", source: "resume", note: "8,346 packages and shipments, 0 errors" },
    { label: "stock gap", value: "782,525 → 27,607 units", source: "resume", note: "−96.5%" },
    { label: "mismatched items", value: "1,631 → 425", source: "resume", note: "−74%" },
    { label: "dead orders closed", value: "951", source: "resume", note: "128,207 units freed" },
    { label: "agency fees avoided", value: "AED 160,000", source: "deliverables-xlsx" },
  ],
  sections: {
    context:
      "Three branches, two Zoho organisations, and an ERP configured by an external agency. Accounting stock and physical stock disagreed by over 780,000 units because invoiced orders were never packed or shipped in the system.",
    constraint:
      "Management had an AED 160,000 quote on the table to migrate to Odoo. Whatever I did had to run on live data in a trading company that invoices all day, with no second chance on a bad write.",
    approach:
      "After comparing Zoho, Odoo and Dynamics and leading the Odoo discovery, I recommended staying on Zoho and fixing it. I audited the agency's automations, switched off the failing rules and removed an exposed API key. Then I built the invoice-to-shipment automation in Deluge — every invoiced sales order packs and ships itself, voided invoices return goods to stock — and a Python backfill with idempotent, marker-tagged, retried writes to process the history. Alongside: a \"to be received\" column kept correct by an hourly check, purchase history on PO lines, item-page buttons, and four scheduled daily reports.",
    result:
      "The backfill closed 7,321 stuck orders with 8,346 auto-generated packages and shipments at zero errors, correcting 776,478 units across 1,475 items. The stock gap fell 96.5% and mismatched items 74%; a further 951 dead orders freed 128,207 committed units. The automation went live on 6 October 2026 and the Odoo migration was cancelled.",
    stack: ["Zoho Books", "Zoho Inventory", "Deluge", "Python", "GitHub Actions", "Zoho Cliq"],
    retrospective:
      "I ran the backfill in batches with manual review between them, which was slow but right. The piece I'd add earlier is the daily invoiced-vs-shipped mismatch report — it existed only after the cleanup and would have caught the drift years ago.",
  },
  cover: { id: "cover-erp", alt: "Abstract render: eight matte-black cubes linked by hairline lime traces" },
  gallery: [],
  links: {},
  tags: ["erp", "automation"],
  services: ["zoho-automation-uae"],
  featured: true,
  updated: "2026-11-04",
  order: 6,
};
