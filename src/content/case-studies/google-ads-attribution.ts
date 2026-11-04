import type { CaseStudy } from "../types";

export const googleAdsAttribution: CaseStudy = {
  slug: "google-ads-attribution",
  title: "Google Ads that returned AED 242K on AED 26K",
  short: "Google Ads & attribution",
  client: "Lapiz Blue General Trading LLC",
  year: "2026",
  period: "Feb – Jul 2026 (channel live since Nov 2025)",
  role: "Head of Technology — campaigns, tracking, attribution",
  summary:
    "Built the group's paid-search channel from zero, fixed conversion tracking, and matched leads to invoices in Zoho Books to prove 9.2× return on ad spend.",
  headlineMetric: { label: "return on ad spend", value: "9.2×", source: "halfyearly-report", note: "AED 242,642 invoiced from AED 26,358 spend" },
  metrics: [
    { label: "cost per conversion", value: "AED 66 → 35", source: "resume", note: "−47%" },
    { label: "conversions", value: "448", source: "resume", note: "Feb–Jul 2026" },
    { label: "impressions", value: "72.5K", source: "resume", note: "Feb–Jul 2026" },
    { label: "lead companies attributed", value: "25", source: "resume" },
    { label: "negative keywords", value: "507", source: "deliverables-xlsx" },
  ],
  sections: {
    context:
      "A trading company with three branches and no digital lead channel. Sales came from walk-ins, WhatsApp and the salesmen's own networks. The first campaigns (Mapei and Profilpas) were an experiment with a small budget.",
    constraint:
      "Management would only fund the channel if it paid for itself in invoiced revenue, not in clicks. Conversion tracking was broken when I inherited it, advertiser verification and ad-policy blocks had to be cleared, and attribution had to survive leads that arrived by WhatsApp and phone, not forms.",
    approach:
      "I started with Mapei and Profilpas search campaigns, then grew to five (Mapei, Dulux, Kalinga Stone, Kerakoll, Weber) at AED 5,000 a month, writing the ad copy packs after competitor research and adding 507 negative keywords across four campaigns. I rebuilt GTM conversion tracking for calls, forms and WhatsApp with a Google expert. For attribution I designed a lead ledger: every website, WhatsApp and email lead is checked against Zoho Books, priced at trader rates, assigned to a salesman by emirate, and later matched to invoices by company.",
    result:
      "Thirty-eight conversions in the first fifteen days; CTR up from 4.18% to 5.47%. Over the half-year review the account recorded 448 conversions and 72.5K impressions with cost per conversion down 47% to AED 35. Ledger matching attributed AED 242,642 of confirmed invoiced revenue to 25 lead companies against AED 26,358 of spend — 9.2× — and the wider ledger priced 209 qualified leads into a AED 2.27M pipeline. The channel has been cash-positive since April 2026.",
    stack: ["Google Ads", "Google Tag Manager", "GA4", "Zoho Books", "Zoho CRM", "Excel", "WhatsApp Business"],
    retrospective:
      "Attribution by ledger matching is manual and conservative; it undercounts revenue from companies that first found us on Ads and later bought through a salesman. A CRM-native attribution field from day one would have made the number larger and the argument shorter.",
  },
  cover: { id: "cover-ads", alt: "Abstract render: ascending bars of frosted glass, one with a lime edge light" },
  gallery: [],
  links: {},
  tags: ["ads", "seo", "dashboard"],
  services: ["ai-automation"],
  featured: true,
  updated: "2026-11-04",
  order: 2,
};
