import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "nextjs-development-dubai",
    title: "Next.js websites that rank and load in under a second",
    seoTitle: "Next.js development in Dubai | Tarun Shukla",
    description:
      "Next.js and TypeScript websites for UAE businesses: migrations off WordPress, catalogue sites with hundreds of pages, Lighthouse 95 to 100, and the SEO foundation built in. Six production sites shipped.",
    eyebrow: "Web",
    accent: "rank",
    intro:
      "Most business sites in the UAE are slow WordPress themes with a thousand pages nobody asked for. I rebuild them in Next.js and TypeScript, keep the rankings, and hand over something a team can maintain.",
    deliverables: [
      "Migration from WordPress or an agency build, with 301 maps and rankings preserved",
      "Brand, product, category and catalogue pages generated from structured data",
      "Forms with email delivery and WhatsApp enquiry paths",
      "Structured data, sitemap, robots, llms.txt and Search Console set-up",
      "Lighthouse 95 to 100 on mobile as the acceptance test",
      "DNS, email records and Vercel hosting handled end to end",
    ],
    outcomes: [
      "lapizblue.com: ~1,200 pages consolidated to 62, Lighthouse 66 → 99, 1,342 clicks in the first three months",
      "60newton.com: 14 service pages plus 182 location pages, built in four days, position 3.2 within ten weeks",
      "gcbuae.com: 250+ catalogue pages, cited first in Google AI Overviews for every brand it sells",
    ],
    proof: ["lapizblue-relaunch", "60newton", "gcbuae-catalogue", "castedluxe"],
    faq: [
      {
        q: "Do you work with existing designs or agencies?",
        a: "Both. I have taken over sites from agencies mid-contract and rebuilt them without downtime for the website or email.",
      },
      {
        q: "What happens to our rankings during a migration?",
        a: "Every old URL is mapped. On lapizblue.com roughly 1,200 ghost pages were redirected into 62 core pages and brand queries stayed at position 1.",
      },
      {
        q: "How long does a site take?",
        a: "A service site with a programmatic location layer took four days; a full catalogue site with 250+ pages took a few weeks; a WordPress migration with legacy cleanup took longer because of the redirects, not the build.",
      },
    ],
    updated: "2026-11-04",
  },
  {
    slug: "zoho-automation-uae",
    title: "Zoho Books, Inventory and CRM that match the warehouse",
    seoTitle: "Zoho Books & CRM automation for UAE businesses | Tarun Shukla",
    description:
      "Zoho Books, Inventory and CRM automation for UAE trading and contracting companies: stock reconciliation, invoice-to-shipment automation, Deluge functions, Chrome add-ons with live margins, daily reports, e-invoicing readiness.",
    eyebrow: "ERP",
    accent: "match",
    intro:
      "I took a three-branch distributor's Zoho estate in-house from an agency, switched off the rules that were failing, and automated the gap between what was invoiced and what actually left the warehouse.",
    deliverables: [
      "Audit of existing automations, API keys and permissions",
      "Invoice-to-package-to-shipment automation and historical backfills in Python",
      "Deluge functions for Books ↔ CRM sync, item-page buttons, purchase history on PO lines",
      "A Chrome add-on for live FIFO margin, low-margin warnings and branch stock inside Zoho",
      "Scheduled daily reports to management and per-salesman mailboxes",
      "UAE e-invoicing (Peppol/ASP) readiness plan",
    ],
    outcomes: [
      "7,321 stuck sales orders closed with 8,346 auto-generated packages and shipments, zero errors",
      "776,478 units corrected across 1,475 items; stock gap down 96.5%",
      "AED 160,000 of agency migration fees avoided by fixing Zoho in-house",
    ],
    proof: ["zoho-stock-sync", "zoho-helper-ops-console", "estimating-workbench"],
    faq: [
      {
        q: "Will this break our existing Zoho setup?",
        a: "Every automation is idempotent, marker-tagged and tested against a copy before it runs on live data. The stock-sync backfill touched 7,321 orders with zero errors.",
      },
      {
        q: "Can you connect Zoho to AI tools?",
        a: "Yes. Zoho Books and CRM are connected to Claude through MCP for reporting and drafting, and an assistant runs inside Zoho Cliq.",
      },
    ],
    updated: "2026-11-04",
  },
  {
    slug: "ai-automation",
    title: "AI workflows that assist people, not replace judgment",
    seoTitle: "AI & workflow automation for SMEs in Dubai | Tarun Shukla",
    description:
      "Claude API, MCP and n8n automations for UAE SMEs: quoting assistants with tool calls, lead staging into CRM, delivery-note OCR, photo-to-purchase-order, executive assistants in Zoho Cliq.",
    eyebrow: "AI",
    accent: "assist",
    intro:
      "The useful automations are the boring ones: the quote assistant that explains a price, the OCR that attaches a signed delivery note to the right invoice, the lead that lands in CRM already assigned. I build those.",
    deliverables: [
      "Claude API assistants that propose through tool calls while deterministic code does the arithmetic",
      "Lead staging from website, WhatsApp and email into Zoho CRM with round-robin assignment",
      "Document pipelines: delivery-note OCR and attachment, photo-to-PO drafts",
      "n8n and GitHub Actions workflows with monitoring and daily digests",
      "MCP servers so your team can talk to Books, CRM and Search Console from Claude",
    ],
    outcomes: [
      "A cost estimator covering 14 work types that pulls material cost from Zoho Books and produces a full quotation PDF",
      "A delivery-note system that attached its first batch of 59 signed notes to invoices and now runs daily",
      "A four-source lead staging app pushing reviewed leads into Zoho CRM",
    ],
    proof: ["estimating-workbench", "lead-revenue-dashboard", "zoho-stock-sync"],
    faq: [
      {
        q: "Which models and tools do you use?",
        a: "Claude via the API and MCP for anything that needs language; n8n, GitHub Actions and Python for scheduling and data; Zoho Deluge where the logic belongs inside Zoho.",
      },
      {
        q: "How do you keep AI from making costly mistakes?",
        a: "The model proposes, code decides. In the estimating workbench the assistant explains and flags prices but never does the arithmetic, and every quote revision is immutable.",
      },
    ],
    updated: "2026-11-04",
  },
];
