import type { CaseStudy } from "../types";

export const leadRevenueDashboard: CaseStudy = {
  slug: "lead-revenue-dashboard",
  title: "Turning WhatsApp leads into a AED 2.27M pipeline view",
  short: "Lead-revenue dashboard",
  client: "Lapiz Blue General Trading LLC",
  year: "2026",
  period: "Nov 2025 to Jul 2026",
  role: "Head of Technology: lead ledger, dashboard, CRM staging",
  summary:
    "A lead ledger and dashboard that value every WhatsApp and email enquiry at trader price, route it to a salesman by emirate, and stage it into Zoho CRM. It is the number behind the 9.2× ad return.",
  headlineMetric: { label: "quantified pipeline", value: "AED 2.27M", source: "resume", note: "Feb to Jul 2026, trader rates" },
  metrics: [
    { label: "verified leads", value: "316", source: "deliverables-xlsx", note: "Nov 2025 to Jul 2026, 264 companies" },
    { label: "June leads valued", value: "39 → AED 406,343", source: "deliverables-xlsx" },
    { label: "cost per lead", value: "AED 128", source: "halfyearly-report" },
    { label: "net profit after ad spend", value: "AED 8,524", source: "deliverables-xlsx", note: "cash-positive since Apr 2026" },
  ],
  sections: {
    context:
      "Leads arrived in three WhatsApp numbers, two inboxes and a website form, and went to whichever salesman answered first. Nobody could say what the channel was worth.",
    constraint:
      "Salesmen in Dubai, Sharjah and Abu Dhabi had to be treated fairly, existing customers had to be filtered out before anything counted as a lead, and the valuation had to be defensible to management: trader price, not list price.",
    approach:
      "I designed the lead ledger: every enquiry is checked against Zoho Books for an existing account, priced at trader rates, assigned in turn across emirates and tracked to outcome, with missed enquiries logged so none are lost again. A dashboard values leads per salesman, emirate and status with period selection and downloadable data; a WhatsApp-chat-to-Excel script and a 17-tab salesman workbook feed it. A separate lead staging app collects leads from four sources into review drafts and pushes them to Zoho CRM with the salesman already assigned.",
    result:
      "316 verified leads from 264 companies between November 2025 and July 2026, priced into a AED 2.27M Category-1 pipeline; June alone valued 39 leads at AED 406,343. The channel was cash-positive from April 2026 with AED 8,524 net profit after ad spend over the review period, and the ledger is what made the 9.2× Google Ads return provable.",
    stack: ["Next.js", "Recharts", "Python", "Zoho Books API", "Zoho CRM", "Excel"],
    retrospective:
      "The ledger started as a spreadsheet and the dashboard was a static export fed by weekly snapshots. It proved the value fast, but the staging app should have been the first thing, not the last. The manual period is where leads leak.",
  },
  cover: { id: "halfyearly-report", alt: "Half-yearly report web app showing lead and revenue charts" },
  gallery: [],
  links: { live: "https://halfyearly-report.vercel.app" },
  tags: ["dashboard", "automation", "ads"],
  services: ["ai-automation"],
  featured: false,
  updated: "2026-11-04",
  order: 9,
};
