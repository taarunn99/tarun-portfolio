---
name: case-study
description: Write or revise a case study in src/content/case-studies from the résumé, deliverables sheet and Halfyearly-Report, following docs/CASE_STUDY_TEMPLATE.md. Use when asked to add a project, write up work, create a case study, or edit project copy.
argument-hint: <slug or project name>
---

# Case study

Target: `src/content/case-studies/<slug>.ts` for `$ARGUMENTS`. Template and length limits: `docs/CASE_STUDY_TEMPLATE.md`. Evidence: `docs/research/08-live-sites-catalog.md` (per-site facts and screenshot picks), the résumé and deliverables sheet summarised in `docs/research/03` and the plan.

## Procedure

1. Collect every fact about the project from the sources above. List metrics with their source id (`resume`, `deliverables-xlsx`, `halfyearly-report`, `gsc`, `lighthouse`, `zoho`). If two sources disagree, keep both in a comment and use the more conservative one with a `TODO: verify`.
2. Pick the single headline metric a GM would repeat.
3. Write the six sections in editorial voice: specific, first person, past tense, no superlatives, no "I was responsible for". Lead with the constraint. The retrospective must contain one genuine trade-off.
4. Choose cover/gallery ids from the manifest (`src/lib/images/manifest.json`); if missing, add a `TODO` and list the screenshot pages needed for `/images`.
5. Map `tags` (website · seo · ads · erp · automation · ai · pwa · extension · dashboard · brand) and `services` (nextjs-development-dubai · zoho-automation-uae · ai-automation).
6. Type-check (`npm run typecheck`) and read it aloud once; cut anything a GM would skip.

Never invent a client, number, quote or logo. Mark anything unverified.
