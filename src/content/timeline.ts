import { caseStudies } from "./case-studies";
import type { CaseStudy } from "./types";

/**
 * Every project in the order it started, for the project timeline (About).
 * Dates are each case study's own `period`. Three projects record only the
 * year (estimating workbench, gcbuae.com, Zoho Helper: "2026") and the stock
 * sync only its start year ("2025 to Oct 2026"), so they sit after the
 * dated projects of that year. TODO: verify their start months.
 */
const ORDER = [
  "webweaver", // Nov to Dec 2024
  "lapizblue-relaunch", // Jul to Dec 2025
  "zoho-stock-sync", // 2025 to Oct 2026 (start month not on record)
  "lead-revenue-dashboard", // Nov 2025 to Jul 2026
  "google-ads-attribution", // Feb to Jul 2026
  "staff-quiz-platform", // Mar 2026
  "offline-catalogue-pwa", // Apr 2026
  "60newton", // May 2026
  "castedluxe", // Jul 2026
  "estimating-workbench", // 2026
  "gcbuae-catalogue", // 2026
  "zoho-helper-ops-console", // 2026
];

export const projectTimeline: CaseStudy[] = ORDER.map((slug) => caseStudies.find((c) => c.slug === slug)).filter(
  (c): c is CaseStudy => Boolean(c),
);
