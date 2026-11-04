/**
 * Résumé data — renders /resume (HTML), feeds /resume.json (JSON Resume-like)
 * and the ATS PDF. Mirrors Tarun_Shukla_Resume.pdf; keep in sync by hand.
 */

export const resume = {
  basics: {
    name: "Tarun Shukla",
    label: "Head of Technology · Full-stack engineer (Next.js/TypeScript) · Growth & ERP automation",
    location: "Dubai, United Arab Emirates",
    // Visa/notice lines are what UAE recruiters look for first; add the notice period once confirmed.
    status: "Employment visa (transferable)",
    summary:
      "Head of Technology running IT, digital marketing and operations for a 3-branch UAE building-materials group. In 17 months, built the group's entire digital channel from scratch: 6 production websites, Google Ads and SEO that turned AED 26K of ad spend into AED 242K of invoiced revenue (820% ROAS) and a AED 2.27M quantified lead pipeline, plus Zoho ERP automations that corrected 776,478 units of stock. Full-stack engineer (Next.js, TypeScript, Supabase) who ships with AI tooling daily.",
    profiles: [
      { network: "LinkedIn", url: "https://www.linkedin.com/in/tarunshukla" },
      { network: "GitHub", url: "https://github.com/taarunn99" },
      { network: "Website", url: "https://lapizblue.com" },
    ],
  },
  work: [
    {
      company: "Lapiz Blue General Trading LLC (Lapiz Group)",
      position: "Head of Technology — IT, Marketing & Operations across Lapiz Blue, Sixty Newton and Global Classic",
      location: "Dubai, UAE",
      start: "2025-05",
      end: null,
      highlights: [
        "Lead generation & ROI: own the Google Ads account (5 search campaigns, AED 5,000/month); half-yearly review (Feb–Jul 2026) counted 448 conversions and 72.5K impressions; cut cost per conversion 47% (AED 66 → 35) by rebuilding GTM conversion tracking. Attributed AED 242,642 confirmed invoiced revenue to 25 lead companies against AED 26,358 spend (9.2×) using Zoho Books ledger matching.",
        "Pipeline & attribution: designed the lead ledger and WhatsApp/email attribution model — 209 qualified leads from 264 companies, priced at trader rates into a AED 2.27M Cat-1 pipeline; routes leads to salesmen across Dubai, Sharjah and Abu Dhabi.",
        "SEO & AI search: rebuilt lapizblue.com on Next.js, consolidating ~1,200 ghost pages into 62 core pages with rankings intact — 1,342 clicks, 72,546 impressions in 3 months, brand queries at position 1.0–1.2; first organic result for “Profilpas UAE” and “Kalinga Stone UAE”; cited in Google AI Overviews for 5 brands (llms.txt shipped early). Manage GA4, Search Console and Bing Webmaster for 3 domains plus Google Business Profiles for 3 branches.",
        "Products shipped (7 in 8 months, all Next.js/TypeScript, Lighthouse 95–100): 60newton.com (14 SEO service pages, built in 4 days), gcbuae.com (KalingaStone, Jaquar, FILA catalogue), castedluxe.com, a 183-SKU offline PWA catalogue with a 3-tier cross-brand alternatives engine, a staff training quiz platform, a lead-estimation dashboard and a Supabase + Claude API cost estimator for the contracting arm.",
        "ERP & operations (Zoho Books, Inventory, CRM, Deluge): took the ERP in-house from an external agency, saving AED 160,000 in agency fees; built the invoice-to-shipment automation and a Python backfill that closed 7,321 stuck sales orders with 8,346 auto-generated packages and shipments at 0 errors, correcting 776,478 units across 1,475 items (stock gap −96.5%, mismatched items −74%); closed 951 dead orders to free 128,207 committed units; published the Lapiz Zoho Helper Chrome add-on (live FIFO margin, low-margin alerts, branch stock in search) with daily margin reports; led UAE e-invoicing (Peppol/ASP) readiness for 2 Zoho orgs.",
        "IT & AI automation: run IT for 3 branches and ~25 workstations, DNS and Zoho Mail (SPF, DKIM, DMARC) for all group domains; built an AI executive assistant on Zoho Cliq, a 4-source lead staging system pushing to Zoho CRM, and n8n/MCP workflows; produced 25+ commercial documents.",
        "Team & brand: lead and mentor 2 marketing interns across brand design, print production, product photography and video; produce the group’s creative in Canva, Affinity, Illustrator and DaVinci Resolve.",
      ],
    },
    {
      company: "Webbers Technologies LLP",
      position: "Full Stack Web Developer Intern",
      location: "Karnataka, India",
      start: "2024-10",
      end: "2024-12",
      highlights: [
        "Built responsive React.js interfaces and backend API integrations for the company website revamp in agile sprints.",
      ],
    },
  ],
  projects: [
    {
      name: "WebWeaver",
      url: "https://github.com/taarunn99/WebWeaver",
      period: "Nov – Dec 2024",
      description:
        "Platform that generates and deploys websites from a prompt using the Anthropic API (Claude), React frontend, TypeScript/Node backend and in-browser web containers for live previews.",
    },
  ],
  skills: [
    {
      group: "Marketing & Growth",
      items: ["Google Ads", "GA4", "Google Tag Manager", "Google Search Console", "Bing Webmaster Tools", "Technical & on-page SEO", "AI search optimisation (llms.txt, AI Overviews)", "Google Business Profile", "Zoho Campaigns", "WhatsApp Business", "Canva", "Affinity", "Adobe Illustrator", "DaVinci Resolve", "Figma"],
    },
    {
      group: "Engineering",
      items: ["TypeScript", "JavaScript", "Python", "Java", "SQL", "Next.js", "React", "Node.js", "Supabase", "PostgreSQL", "MongoDB", "REST APIs", "Vercel", "AWS", "Docker", "Git"],
    },
    {
      group: "AI & Automation",
      items: ["Claude API / Claude Code", "MCP", "Prompt engineering", "n8n", "GitHub Actions", "Python data pipelines", "Zoho Deluge"],
    },
    {
      group: "ERP & Operations",
      items: ["Zoho One (Books, Inventory, CRM, Cliq, Mail)", "ERP administration", "Inventory reconciliation", "UAE e-invoicing", "Chrome extensions"],
    },
  ],
  education: [
    {
      institution: "National University of Singapore, School of Computing",
      area: "Certificates of Completion: Applied Machine Learning with Generative AI; Big Data Analytics and Deep Learning",
      location: "Singapore",
      date: "2025-06",
    },
    {
      institution: "Vellore Institute of Technology, Bhopal",
      area: "Bachelor of Technology in Computer Science & Technology · CGPA 8.03",
      location: "India",
      date: "2021-09 – 2025",
    },
  ],
  certifications: [
    "AWS Certified Solutions Architect – Associate",
    "AWS Certified Cloud Practitioner",
    "AWS Generative AI with Large Language Models",
    "HackerRank SQL (Advanced)",
    "Docker for Developers",
    "200+ DSA problems solved (Java, Python), 150+ day coding streak",
  ],
  updated: "2026-11-04",
} as const;
