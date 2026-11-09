import type { Milestone, Waypoint } from "./types";

/** Route: Bhopal (VIT) → Singapore (NUS) → Dubai (Lapiz Group). Projected into SVG space at build time. */
export const waypoints: Waypoint[] = [
  {
    id: "bhopal",
    city: "Bhopal",
    country: "India",
    lat: 23.26,
    lng: 77.41,
    from: "2021",
    to: "2025",
    label: "B.Tech, VIT Bhopal",
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    lat: 1.35,
    lng: 103.82,
    from: "2025",
    to: "2025",
    label: "NUS School of Computing",
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    lat: 25.2,
    lng: 55.27,
    from: "2025",
    label: "Head of Technology, Lapiz Group",
  },
];

/**
 * Scene art per station (used by the route paintings and the "enter the scene" diorama).
 * `image` / `layer` are manifest ids (src/lib/images/manifest.json); when a file has not
 * been generated yet the components fall back to procedural skies and silhouettes.
 */
export type JourneyScene = {
  /** Backdrop painting manifest id */
  image: string;
  /** Transparent silhouette layer manifest id (PNG/WebP with alpha) */
  layer: string;
  /** Alt text for the painting (describes our own art, not a photograph) */
  alt: string;
};

export const journeyScenes: Record<Waypoint["id"], JourneyScene> = {
  bhopal: {
    image: "scene-bhopal",
    layer: "layer-bhopal",
    alt: "Painted view of Bhopal: the lake and low hills at dusk",
  },
  singapore: {
    image: "scene-singapore",
    layer: "layer-singapore",
    alt: "Painted view of Singapore: three towers under a skypark in the blue hour",
  },
  dubai: {
    image: "scene-dubai",
    layer: "layer-dubai",
    alt: "Painted view of Dubai: a needle spire, a sail and a wheel over golden sand",
  },
};

export const milestones: Milestone[] = [
  {
    id: "vit",
    kind: "education",
    at: "bhopal",
    date: "2021-09",
    title: "B.Tech, Computer Science & Technology",
    subtitle: "Vellore Institute of Technology, Bhopal · CGPA 8.03",
    summary: "200+ DSA problems, a 150-day coding streak, AWS Solutions Architect Associate before graduating.",
  },
  {
    id: "webbers",
    kind: "role",
    at: "bhopal",
    date: "2024-10",
    title: "Full-stack intern, Webbers Technologies",
    subtitle: "Oct to Dec 2024",
    summary: "React interfaces and backend integrations for a company site revamp, shipped in agile sprints.",
  },
  {
    id: "webweaver",
    kind: "product",
    at: "bhopal",
    date: "2024-12",
    title: "WebWeaver",
    subtitle: "Prompt-to-website generator",
    summary: "Claude API, React, TypeScript/Node and in-browser web containers for live previews.",
    href: "/work/webweaver",
  },
  {
    id: "nus",
    kind: "education",
    at: "singapore",
    date: "2025-06",
    title: "NUS School of Computing",
    subtitle: "Applied Machine Learning with Generative AI · Big Data Analytics and Deep Learning",
    summary: "Certificates of completion, Singapore, June 2025.",
  },
  {
    id: "lapiz",
    kind: "role",
    at: "dubai",
    date: "2025-05",
    title: "Head of Technology, Lapiz Group",
    subtitle: "IT, marketing and operations across three companies",
    summary: "Built the group's digital channel from zero: six websites, Google Ads, SEO, Zoho ERP automation.",
  },
  {
    id: "lapizblue",
    kind: "product",
    at: "dubai",
    date: "2025-12",
    title: "lapizblue.com relaunch",
    summary: "WordPress to Next.js; 1,200 ghost pages consolidated with rankings intact.",
    href: "/work/lapizblue-relaunch",
  },
  {
    id: "quiz",
    kind: "product",
    at: "dubai",
    date: "2026-03",
    title: "Staff training quiz platform",
    summary: "Logins, leaderboards, admin controls, automatic emails.",
    href: "/work/staff-quiz-platform",
  },
  {
    id: "catalogue",
    kind: "product",
    at: "dubai",
    date: "2026-04",
    title: "Offline product catalogue PWA",
    summary: "183 products, cross-brand alternatives, works offline on the sales floor.",
    href: "/work/offline-catalogue-pwa",
  },
  {
    id: "60newton",
    kind: "product",
    at: "dubai",
    date: "2026-05",
    title: "60newton.com",
    summary: "Fourteen service pages and a programmatic location layer, built in four days.",
    href: "/work/60newton",
  },
  {
    id: "leads",
    kind: "product",
    at: "dubai",
    date: "2026-07",
    title: "Lead-revenue dashboard",
    summary: "WhatsApp and email leads valued at trader price, by salesman and emirate.",
    href: "/work/lead-revenue-dashboard",
  },
  {
    id: "castedluxe",
    kind: "product",
    at: "dubai",
    date: "2026-07",
    title: "castedluxe.com",
    summary: "A luxury art commission site in twelve days.",
    href: "/work/castedluxe",
  },
  {
    id: "zoho-sync",
    kind: "product",
    at: "dubai",
    date: "2026-10",
    title: "Zoho stock-sync automation",
    summary: "7,321 stuck orders closed, 776,478 units corrected, zero errors.",
    href: "/work/zoho-stock-sync",
  },
];
