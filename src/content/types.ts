/**
 * Content model — the single source of truth for everything the site says.
 * Rules: typed data only (no JSX); every metric carries a `source`;
 * unknowns are written as "TODO: verify", never estimated.
 */

export type MetricSource =
  | "resume"
  | "deliverables-xlsx"
  | "halfyearly-report"
  | "gsc"
  | "ga4"
  | "lighthouse"
  | "zoho"
  | "github";

export type Metric = {
  /** Short label, lowercase, no trailing period. e.g. "pages consolidated" */
  label: string;
  /** Display value exactly as it should render. e.g. "1,200 → 62" */
  value: string;
  source: MetricSource;
  /** Optional qualifier shown small. e.g. "Feb–Jul 2026" */
  note?: string;
};

export type ImageRef = {
  /** Manifest id from src/lib/images/manifest.json (or a placeholder id) */
  id: string;
  alt: string;
};

export type Tag =
  | "website"
  | "seo"
  | "ads"
  | "erp"
  | "automation"
  | "ai"
  | "pwa"
  | "extension"
  | "dashboard"
  | "brand"
  | "ops";

export type ServiceSlug =
  | "nextjs-development-dubai"
  | "zoho-automation-uae"
  | "ai-automation";

export type CaseStudy = {
  slug: string;
  /** ≤ 60 chars; outcome, not task */
  title: string;
  /** Short display name used in grids/lists */
  short: string;
  client: string;
  year: string;
  period: string;
  role: string;
  /** One sentence a GM would repeat */
  summary: string;
  headlineMetric: Metric;
  metrics: Metric[];
  sections: {
    context: string;
    constraint: string;
    approach: string;
    result: string;
    stack: string[];
    retrospective: string;
  };
  cover: ImageRef;
  gallery: ImageRef[];
  links: { live?: string; repo?: string };
  tags: Tag[];
  services: ServiceSlug[];
  featured: boolean;
  /** ISO date of last content edit — used for sitemap lastmod (never new Date()) */
  updated: string;
  /** Sort order in the work index (lower first) */
  order: number;
};

export type Service = {
  slug: ServiceSlug;
  title: string;
  /** Title used in <title>; includes the geo qualifier once */
  seoTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  deliverables: string[];
  outcomes: string[];
  /** Case-study slugs that prove this service */
  proof: string[];
  faq: { q: string; a: string }[];
  updated: string;
};

export type Capability = {
  id: string;
  title: string;
  blurb: string;
  items: string[];
  /** Metric shown large in the bento cell */
  stat?: Metric;
};

export type Milestone = {
  id: string;
  kind: "place" | "education" | "role" | "product";
  /** Waypoint this belongs to */
  at: "bhopal" | "singapore" | "dubai";
  /** YYYY-MM */
  date: string;
  title: string;
  subtitle?: string;
  summary: string;
  href?: string;
};

export type Waypoint = {
  id: "bhopal" | "singapore" | "dubai";
  city: string;
  country: string;
  lat: number;
  lng: number;
  from: string;
  to?: string;
  label: string;
};
