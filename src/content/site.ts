import type { Metric } from "./types";

/** The site's own address (Namecheap domain, connected to this Vercel project on 17 Nov 2026). */
const CANONICAL_URL = "https://tarunshukla.com";

function resolveSiteUrl(): string {
  // Production always uses the real domain, so canonical links, the sitemap and share images never point at vercel.app.
  // This comes first on purpose: the old NEXT_PUBLIC_SITE_URL value in Vercel still holds the vercel.app address.
  if (process.env.VERCEL_ENV === "production") return CANONICAL_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Tarun Shukla",
  firstName: "Tarun",
  role: "Head of Technology",
  /** Positioning line — the LCP text on the home page */
  positioning:
    "I build the tech, growth and operations engine for companies that can't hire a department.",
  /** The one italic accent word inside the positioning line (must appear verbatim above) */
  accentWord: "engine",
  description:
    "Tarun Shukla, Head of Technology in Dubai. Next.js and TypeScript products, Google Ads and SEO that pay for themselves, Zoho ERP automation and AI workflows for UAE businesses.",
  seoTitle: "Tarun Shukla | Head of Technology · Next.js & Zoho automation, Dubai",
  url: resolveSiteUrl(),
  locale: "en_AE",
  location: { city: "Dubai", country: "United Arab Emirates", countryCode: "AE" },
  /** Public display email — a mailto fallback when the form is unconfigured. TODO: switch to a domain alias once a domain exists */
  email: "agmnwosgr@gmail.com",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/tarun-shukla-941054329", rel: "me" },
    { label: "GitHub", href: "https://github.com/taarunn99", rel: "me" },
  ],
  keywords: [
    "Tarun Shukla",
    "Tarun Shukla Dubai",
    "Head of Technology Dubai",
    "Next.js developer Dubai",
    "Zoho Books automation UAE",
    "Zoho CRM Deluge developer",
    "AI automation Dubai",
    "Google Ads attribution",
    "technical SEO UAE",
  ],
  availability:
    "Currently Head of Technology at Lapiz Group. Open to conversations about Head of Digital / Technology roles and selected consulting engagements in the UAE.",
  /** ISO date for sitemap lastmod of evergreen pages */
  updated: "2026-11-04",
} as const;

/** The proof strip on the home page — sourced numbers only */
export const proof: Metric[] = [
  { label: "lead pipeline harvested", value: "AED 2.27M", source: "halfyearly-report", note: "209 qualified leads from 264 companies, Feb to Jul 2026, at trader price" },
  { label: "return on Google Ads spend, first purchases alone", value: "9.2×", source: "halfyearly-report", note: "AED 242,642 from AED 26,358; repeat orders come on top" },
  { label: "products shipped in 8 months", value: "7", source: "resume" },
  { label: "stock units corrected", value: "776,478", source: "resume" },
  { label: "in outside ERP quotes avoided", value: "AED 90K to 160K", source: "deliverables-xlsx", note: "Odoo fix and migration AED 160,000; fix-only quote AED 90,000" },
  { label: "Lighthouse on every site", value: "95 to 100", source: "lighthouse" },
];

/** Marquee line: stack and brands actually used */
export const marquee = [
  "Next.js",
  "TypeScript",
  "Supabase",
  "Vercel",
  "Zoho One",
  "Deluge",
  "Python",
  "Google Ads",
  "GA4",
  "Search Console",
  "Claude API",
  "MCP",
  "n8n",
  "AWS",
  "Three.js",
  "GSAP",
] as const;
