---
name: design-review
description: Review UI components/pages of this portfolio against docs/DESIGN_CONCEPT.md (tokens, motion rules, anti-patterns) and Vercel's web interface guidelines. Use after building or changing anything in src/components or src/app, or when asked to review UI, check design, audit accessibility of a component.
argument-hint: <glob or file paths, e.g. src/components/sections/Hero*>
---

# Design review

Review the files in `$ARGUMENTS` (default: everything changed in `git diff --name-only HEAD` under `src/`).

## Procedure

1. Read `docs/DESIGN_CONCEPT.md` §3 (tokens), §7 (anti-patterns), §8 (floor) and §10 (checklist).
2. Read the reference rule set once: `.claude/skills/_reference/web-design-guidelines/` (Vercel) — if the skill fetches rules from a URL, follow its `command.md`.
3. For each file, check in this order and record findings as `file:line — rule — fix`:
   - **Tokens:** any raw hex / px durations / easings not from `src/styles/tokens.css`.
   - **Type:** one accent word per headline max; eyebrows ≤ 1 per section; headings use the scale tokens; `text-wrap` set.
   - **Motion:** reveals only via transform/opacity/clip-path in reserved boxes; nothing above the fold starts at `opacity: 0`; hover changes colour/opacity only; durations ≤ 300 ms for UI; `prefers-reduced-motion` handled (`gsap.matchMedia` or CSS).
   - **A11y:** semantic landmarks; links/buttons have names; targets ≥ 24 px; focus-visible styles; canvases `aria-hidden` with a DOM twin; no `maximum-scale`; heading order.
   - **Responsive:** 390 px has no horizontal scroll; body ≥ 16 px; images have `sizes`.
   - **Copy:** no superlatives, no "hire me", no `→` decoration, no emoji icons, one Dubai/UAE mention per page, numbers carry a source.
   - **Perf:** no `'use client'` outside motion/scene/leaf components; heavy imports are dynamic; no `new Date()` in render.
4. Output a table of findings ranked by severity (blocker / should / nit), then apply the blockers if asked.
5. Finish by stating which routes need `LH_RUNS=3 npm run lighthouse` re-run.

Never approve a component that fails a blocker; never "fix" by removing content.
