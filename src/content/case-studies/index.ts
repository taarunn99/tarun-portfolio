import type { CaseStudy, ServiceSlug, Tag } from "../types";
import { lapizblueRelaunch } from "./lapizblue-relaunch";
import { googleAdsAttribution } from "./google-ads-attribution";
import { sixtyNewton } from "./60newton";
import { gcbuaeCatalogue } from "./gcbuae-catalogue";
import { offlineCataloguePwa } from "./offline-catalogue-pwa";
import { zohoStockSync } from "./zoho-stock-sync";
import { zohoHelperOpsConsole } from "./zoho-helper-ops-console";
import { estimatingWorkbench } from "./estimating-workbench";
import { leadRevenueDashboard } from "./lead-revenue-dashboard";
import { staffQuizPlatform } from "./staff-quiz-platform";
import { castedluxe } from "./castedluxe";
import { webweaver } from "./webweaver";

/**
 * All case studies, in work-index order. This is a registry, not a barrel of
 * re-exports: consumers import from here only.
 */
export const caseStudies: readonly CaseStudy[] = [
  lapizblueRelaunch,
  googleAdsAttribution,
  sixtyNewton,
  gcbuaeCatalogue,
  offlineCataloguePwa,
  zohoStockSync,
  zohoHelperOpsConsole,
  estimatingWorkbench,
  leadRevenueDashboard,
  staffQuizPlatform,
  castedluxe,
  webweaver,
].sort((a, b) => a.order - b.order);

export const featuredCaseStudies = caseStudies.filter((c) => c.featured);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function caseStudiesForService(service: ServiceSlug): CaseStudy[] {
  return caseStudies.filter((c) => c.services.includes(service));
}

export function caseStudiesByTag(tag: Tag): CaseStudy[] {
  return caseStudies.filter((c) => c.tags.includes(tag));
}

export const allTags: readonly Tag[] = Array.from(
  new Set(caseStudies.flatMap((c) => c.tags)),
);

export const tagLabels: Record<Tag, string> = {
  website: "Websites",
  seo: "SEO",
  ads: "Paid search",
  erp: "ERP",
  automation: "Automation",
  ai: "AI",
  pwa: "PWA",
  extension: "Extensions",
  dashboard: "Dashboards",
  brand: "Brand",
  ops: "Operations",
};
