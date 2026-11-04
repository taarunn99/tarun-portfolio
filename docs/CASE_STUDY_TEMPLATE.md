# Case-study template

Every case study in `src/content/case-studies/*.ts` follows this shape. Tone: editorial, specific, no superlatives. Numbers must carry a `source` (`resume`, `deliverables-xlsx`, `halfyearly-report`, `gsc`, `ga4`, `zoho`, `lighthouse`). Unknowns are `TODO: verify`, never guessed.

```ts
export const caseStudy: CaseStudy = {
  slug: "lapizblue-relaunch",
  title: "Lapiz Blue: rebuilt without losing a ranking",   // ≤ 60 chars; outcome, not task
  client: "Lapiz Blue General Trading LLC",
  year: "2025",
  period: "Jul – Dec 2025",
  role: "Head of Technology — solo build",
  summary: "One sentence a GM would repeat to a colleague.",
  headlineMetric: { label: "pages consolidated", value: "1,200 → 62", source: "resume" },
  metrics: [
    { label: "Lighthouse", value: "66 → 99", source: "halfyearly-report" },
    { label: "clicks in 3 months", value: "1,342", source: "gsc" },
  ],
  sections: {
    context: "What the business was, what existed, why it mattered. 2–4 sentences.",
    constraint: "Time, budget, legacy, team, risk. The thing that made it hard.",
    approach: "What I actually did, in order. Decisions and trade-offs, not a feature list.",
    result: "What changed, with the numbers above in prose and the date they were measured.",
    stack: ["Next.js 16", "TypeScript", "Vercel", "Zoho Mail DNS"],
    retrospective: "What I'd change next time. One honest paragraph — this is what senior people read.",
  },
  cover: { id: "lapizblue-home", alt: "lapizblue.com home page in a browser frame" },
  gallery: [{ id: "lapizblue-brands", alt: "Brands index page" }],
  links: { live: "https://lapizblue.com" },
  tags: ["website", "seo", "nextjs"],
  services: ["nextjs-development-dubai"],
  featured: true,
};
```

Section lengths: context ≤ 90 words · constraint ≤ 70 · approach ≤ 200 · result ≤ 120 · retrospective ≤ 90. Total reading time ≈ 90 seconds.

Checklist before a case study is marked `featured`:
- [ ] Headline metric is the single most convincing number and has a source
- [ ] Cover image is a real screenshot (public sites) or a labelled abstract (private apps)
- [ ] No client-confidential data in screenshots (prices, customer names, internal emails)
- [ ] Links verified live
- [ ] Read aloud once; cut anything a GM would skip
