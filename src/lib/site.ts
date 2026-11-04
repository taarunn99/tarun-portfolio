/**
 * Single source of truth for site-wide content and metadata.
 * Everything marked TODO is placeholder copy — replace before launch.
 */

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Tarun Shukla",
  // TODO: replace with your actual title
  role: "Developer",
  tagline: "Building fast, expressive interfaces for the web.",
  description:
    "Portfolio of Tarun Shukla — developer crafting performant, immersive web experiences with Next.js, TypeScript and WebGL.",
  url: resolveSiteUrl(),
  // TODO: replace with the address you want publicly visible
  email: "hello@example.com",
  locale: "en_US",
  keywords: [
    "Tarun Shukla",
    "portfolio",
    "developer",
    "Next.js",
    "TypeScript",
    "Three.js",
    "WebGL",
    "creative developer",
  ],
  // TODO: add real profiles; leave an entry out to hide it
  socials: [] as { label: string; href: string }[],
} as const;

export type Project = {
  slug: string;
  title: string;
  description: string;
  year: string;
  tags: readonly string[];
  href?: string;
};

// TODO: replace with real work
export const projects: readonly Project[] = [
  {
    slug: "project-one",
    title: "Project One",
    description:
      "A short, outcome-focused line about what this project did and why it mattered.",
    year: "2026",
    tags: ["Next.js", "Three.js", "TypeScript"],
  },
  {
    slug: "project-two",
    title: "Project Two",
    description:
      "Describe the problem, your role, and the measurable result in one sentence.",
    year: "2025",
    tags: ["WebGL", "GLSL", "Performance"],
  },
  {
    slug: "project-three",
    title: "Project Three",
    description:
      "Lead with the impact. Numbers and specifics beat adjectives every time.",
    year: "2025",
    tags: ["Design systems", "Accessibility"],
  },
];
