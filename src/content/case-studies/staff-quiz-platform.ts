import type { CaseStudy } from "../types";

export const staffQuizPlatform: CaseStudy = {
  slug: "staff-quiz-platform",
  title: "Product training the sales floor actually finishes",
  short: "Staff quiz platform",
  client: "Lapiz Blue General Trading LLC",
  year: "2026",
  period: "Mar 2026",
  role: "Head of Technology — build, content, rollout",
  summary:
    "A staff quiz platform with logins, leaderboards, admin re-uploads, practice mode and automatic emails, used to test product knowledge across the sales team.",
  headlineMetric: { label: "staff tested in round one", value: "12", source: "deliverables-xlsx" },
  metrics: [
    { label: "live", value: "20 Mar 2026", source: "deliverables-xlsx" },
    { label: "modes", value: "live + practice", source: "deliverables-xlsx" },
    { label: "emails automated", value: "sign-up, login, scores", source: "deliverables-xlsx" },
  ],
  sections: {
    context:
      "Selling construction chemicals means knowing which Mapei grout goes where. Product training happened in meetings and faded by the following week.",
    constraint:
      "It had to work on phones, let management re-upload a quiz without a developer, and show who actually knows the products — without turning into a leaderboard nobody trusts.",
    approach:
      "I built a quiz site with user IDs and logins, admin controls to upload and re-run quizzes, a practice mode, leaderboards and automatic emails for sign-up, login and score alerts, backed by a database rather than a form tool so results are kept across rounds.",
    result:
      "Live on 20 March 2026; twelve staff sat the first round and the Mapei product-knowledge workbook became the basis for the next ones.",
    stack: ["JavaScript", "HTML/CSS", "Vercel", "Email automation"],
    retrospective:
      "Twelve people is a small first cohort. The platform is built for repeated rounds; the retrospective number worth tracking is score improvement across rounds, which I'd add to the admin view.",
  },
  cover: { id: "cover-quiz", alt: "Abstract render: four black spheres, the third lit with a lime rim light" },
  gallery: [],
  links: { live: "https://mapei-quiz.vercel.app" },
  tags: ["website", "ops"],
  services: ["nextjs-development-dubai"],
  featured: false,
  updated: "2026-11-04",
  order: 10,
};
