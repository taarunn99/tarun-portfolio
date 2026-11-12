import type { ImageRef } from "./types";

/**
 * The websites showcase at the top of /work: client sites, newest build
 * first in the order Tarun set. Deliberately no metrics here (those live in
 * the case studies): what the site is, who it is for, and what it is built
 * with. Stacks are copied from each case study's `sections.stack`, or read
 * from the live build where there is no case study.
 */
export type Website = {
  id: string;
  domain: string;
  url: string;
  client: string;
  year: string;
  /** one or two sentences, no numbers */
  about: string;
  stack: string[];
  /** first is the hero shot; the rest fan out behind it */
  screens: ImageRef[];
  /** case study slug, when there is one */
  caseStudy?: string;
};

export const websites: Website[] = [
  {
    id: "lapizblue",
    domain: "lapizblue.com",
    url: "https://lapizblue.com",
    client: "Lapiz Blue General Trading LLC",
    year: "2025",
    about:
      "A building materials and construction chemicals distributor, moved off an agency WordPress site onto a fast Next.js build with brand catalogues, category pages and product datasheets.",
    stack: ["Next.js 16", "TypeScript", "MDX", "Vercel", "Google Search Console", "GTM"],
    screens: [
      { id: "lapizblue-home", alt: "lapizblue.com home page" },
      { id: "lapizblue-category", alt: "lapizblue.com Mapei waterproofing category page" },
      { id: "lapizblue-brands", alt: "lapizblue.com brands index" },
    ],
    caseStudy: "lapizblue-relaunch",
  },
  {
    id: "gcbuae",
    domain: "gcbuae.com",
    url: "https://gcbuae.com",
    client: "Global Classic Building Materials Trading LLC",
    year: "2026",
    about:
      "A catalogue site for KalingaStone, Jaquar and FILA, built from extracted supplier data: quartz shade grids with filters, collection pages and product tables.",
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "GSAP", "Lenis", "sharp", "Vercel"],
    screens: [
      { id: "gcbuae-home", alt: "gcbuae.com home page" },
      { id: "gcbuae-quartz", alt: "gcbuae.com KalingaStone quartz shade grid" },
      { id: "gcbuae-sku", alt: "gcbuae.com Jaquar collection page" },
    ],
    caseStudy: "gcbuae-catalogue",
  },
  {
    id: "60newton",
    domain: "60newton.com",
    url: "https://60newton.com",
    client: "Sixty Newton Technical Services",
    year: "2026",
    about:
      "A dark, scroll-animated brand site for a specialist contractor, with a page for every discipline and a discipline-by-location layer for search.",
    stack: ["Next.js 16", "TypeScript", "GSAP", "Lenis", "Vercel", "IndexNow"],
    screens: [
      { id: "60newton-home", alt: "60newton.com home page" },
      { id: "60newton-disciplines", alt: "60newton.com disciplines index" },
      { id: "60newton-location", alt: "60newton.com discipline by location page" },
    ],
    caseStudy: "60newton",
  },
  {
    id: "castedluxe",
    domain: "castedluxe.com",
    url: "https://castedluxe.com",
    client: "Casted Luxe by Ashrat",
    year: "2026",
    about:
      "Name, logo, tagline and website for a bespoke epoxy and calligraphy art studio, opening on an AI-made hero film.",
    stack: ["Next.js 16", "TypeScript", "GSAP", "Lenis", "Vercel", "AI image and video tools"],
    screens: [
      { id: "castedluxe-home", alt: "castedluxe.com home page" },
      { id: "castedluxe-gallery", alt: "castedluxe.com gallery of commissioned pieces" },
    ],
    caseStudy: "castedluxe",
  },
];

/** Case studies shown in the showcase, so the index below can skip them. */
export const websiteCaseStudies = new Set(websites.flatMap((w) => (w.caseStudy ? [w.caseStudy] : [])));
