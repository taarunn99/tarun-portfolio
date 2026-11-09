import type { CaseStudy } from "../types";

export const webweaver: CaseStudy = {
  slug: "webweaver",
  title: "WebWeaver: a website from a prompt, in the browser",
  short: "WebWeaver",
  client: "Personal project",
  year: "2024",
  period: "Nov to Dec 2024",
  role: "Solo build",
  summary:
    "A platform that generates and deploys a website from a prompt using the Claude API, with a React frontend, a TypeScript/Node backend and in-browser web containers for live previews.",
  headlineMetric: { label: "from prompt to running site", value: "in the browser", source: "resume" },
  metrics: [
    { label: "model", value: "Claude 3.5 Sonnet", source: "github" },
    { label: "runtime", value: "WebContainers", source: "github" },
  ],
  sections: {
    context:
      "Built in the final year of my degree, before the current wave of prompt-to-app tools was commonplace, to understand how far a language model could carry a full build loop.",
    constraint:
      "Everything had to run client-side after generation: no deploy step, no server per user, previews that update as the model edits files.",
    approach:
      "An Express backend calls the Claude API to pick a template (node or react) and stream file edits; a Vite/React frontend mounts the generated project in a WebContainer with a Monaco editor so the preview runs live in the tab. The system prompt is adapted from the open-source Bolt prompt, which I say plainly because it matters.",
    result:
      "A working prompt-to-website loop with live previews. It is the project that convinced me to build with AI tooling daily, which is now how every product in this portfolio was made.",
    stack: ["TypeScript", "React", "Express", "Anthropic SDK", "WebContainers", "Monaco"],
    retrospective:
      "It is a learning project, not a product; the live demo is offline. Its value is in what it taught: separate planning from file edits, and keep the human in the loop at the preview, not at the prompt.",
  },
  cover: { id: "cover-webweaver", alt: "Abstract render: a woven lattice of dark filaments, one of them cyan" },
  gallery: [],
  links: { repo: "https://github.com/taarunn99/WebWeaver" },
  tags: ["ai", "website"],
  services: ["ai-automation"],
  featured: false,
  updated: "2026-11-04",
  order: 12,
};
