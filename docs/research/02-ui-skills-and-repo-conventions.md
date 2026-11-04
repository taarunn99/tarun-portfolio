<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

Research is complete. Here is the report.

---

# Research report: AI-native setup for a Next.js 16 / TypeScript portfolio

Date: 2026-11-04. Star counts marked **(API)** were read from `api.github.com` today; those marked **(page)** were read from the GitHub repo page and may lag slightly.

---

## 1. Skills and agent-instruction repos for UI/UX, frontend quality, and animation

### Summary table

| Repo | Stars | What it is | Install | License |
|---|---|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 187.3k (page) | Anthropic's official skills incl. `frontend-design`; also the Agent Skills spec + template | `/plugin marketplace add anthropics/skills` then `/plugin install example-skills@anthropic-agent-skills`; or copy `skills/frontend-design/` into `.claude/skills/` | Apache-2.0 for most skills (doc skills docx/pdf/pptx/xlsx are source-available only) |
| [obra/superpowers](https://github.com/obra/superpowers) | 312.2k (page) | Methodology skills: brainstorming, writing-plans, TDD, systematic-debugging, verification-before-completion, subagent-driven-development | `/plugin install superpowers@claude-plugins-official` or `/plugin marketplace add obra/superpowers-marketplace` + `/plugin install superpowers@superpowers-marketplace` | MIT |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 145k (page) | Design-database skill: 79 styles, 192 palettes, 74 font pairings, 25 chart types, 119 UX guidelines, 34 landing patterns, 22 stacks; Python BM25 `search.py` generates a `design-system/` folder | `npx ui-ux-pro-max-cli init --ai claude` (writes `.claude/skills/ui-ux-pro-max`), `--global` for `~/.claude/skills/`; or `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` + `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` | MIT (premium tier exists) |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) → `skills/shadcn/SKILL.md` | 127,330 (API) | Official shadcn skill: `user-invocable: false`, injects `npx shadcn@latest info --json`, rules for styling/forms/composition/icons/chat, DESIGN.md-driven theming, `--dry-run`/`--diff` update flow; rules in `rules/*.md`, `cli.md`, `design-system.md` | `npx skills add https://github.com/shadcn-ui/ui --skill shadcn` | MIT |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 78,710 (API) | Curated list of skills (not a skill itself) | n/a | none declared |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 57,221 (API) | Curated list: CLAUDE.md examples, hooks, slash commands, skills | n/a | NOASSERTION (custom) |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 33.5k (page) | `web-design-guidelines` (audits UI vs 100+ rules: a11y, focus, forms, animation, typography, images, perf, dark mode, touch, i18n), `react-best-practices` (40+ perf rules), `react-view-transitions`, `composition-patterns`, `vercel-optimize`, `deploy-to-vercel`, `writing-guidelines` | `npx skills add vercel-labs/agent-skills` | MIT |
| [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | 1,106 (API) | The rule source `web-design-guidelines` WebFetches at run time (`command.md`) | referenced by the skill | MIT |
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | 28.7k (page) | DESIGN.md format (alpha): YAML tokens (colors, typography, rounded, spacing, components with `{path.to.token}` refs) + ordered prose sections; CLI `npx @google/design.md` with `lint` (WCAG contrast), `diff`, `export` (Tailwind v4 CSS / DTCG), `spec` | file in repo root or `.stitch/DESIGN.md` | Apache-2.0 |
| [EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin) | 25,911 (API) | plan/work/review/compound workflow; includes a `ce-frontend-design` skill | `/plugin marketplace add EveryInc/compound-engineering-plugin` + `/plugin install compound-engineering` | MIT |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | 17,860 (API) | Official GSAP skills: gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-utils, gsap-react (`useGSAP`, cleanup, SSR), gsap-performance, gsap-frameworks; `skills/llms.txt` index | `npx skills add https://github.com/greensock/gsap-skills` or `/plugin marketplace add greensock/gsap-skills`; or copy `skills/*` into `~/.claude/skills/` | MIT |
| [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) | 1,239 (API) | Marketplace of ~22 skills: threejs-webgl, react-three-fiber, gsap-scrolltrigger, motion-framer, babylon, pixijs-2d; last push 2025-11 (stale) | plugin marketplace | MIT |
| [devmartinese/awwwards-animations-skill](https://github.com/devmartinese/awwwards-animations-skill) | 15 (API) | Reference files for GSAP+React, Framer Motion, Three.js, Lenis, Anime.js | `npx skills add` | none |
| Motion (Framer Motion) | — | **No official skill found.** Community: `npx skills add lucking7/motiondev-skills@motion` (MIT) | | |

Notes:
- The `frontend-design` SKILL.md (Apache-2.0) is the best single reference for "avoid the AI look": it mandates a token plan (4–6 named hex colors, type roles, ASCII wireframe, principles), a critique pass that removes at least one element, and explicit anti-patterns: cream + terracotta (#D97757), near-black + acid-green accent, uniform rounded cards with `rgba(0,0,0,.1)` shadows, all-caps eyebrow labels, "A · B · C" meta strings, `→` on every link, fade-and-slide-up on every section, hover transitions on every card. Motion guidance: "one orchestrated moment" (e.g. page-load), motion in response to user action is fine. Quality floor: responsive, visible focus, reduced-motion, contrast. [Source](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)
- Anthropic's official plugins have moved to the `claude-plugins-official` repo; the `anthropics/claude-code/plugins` folder is now just a README pointing there.
- Install mechanisms (from [Claude Code skills docs](https://code.claude.com/docs/en/skills)): project skills at `.claude/skills/<name>/SKILL.md` (commit them), personal at `~/.claude/skills/`, plugins namespaced as `/plugin-name:skill-name`. Frontmatter: `name`, `description` (drives auto-load; truncated at 1,536 chars with `when_to_use`), `disable-model-invocation`, `user-invocable`, `allowed-tools`, `context: fork`, `paths`, `argument-hint`. Keep SKILL.md under 500 lines; put long reference material in sibling `.md` files and scripts in `scripts/`. Dynamic context with `` !`cmd` ``.

---

## 2. CLAUDE.md best practice for a Next.js app

### What Anthropic says (official docs)
- Target **under 200 lines**; longer files reduce adherence. Imports (`@path`) organize but don't reduce context cost. [memory docs](https://code.claude.com/docs/en/memory)
- Only write "what Claude can't find by reading the repo, or would rediscover every session." Test: *Could it find this by reading code? Would it look?* If both yes, leave it out. `/doctor` cuts directory layouts, dependency lists, architecture overviews and keeps "pitfalls, rationale, and conventions that differ from tool defaults." [best practices](https://code.claude.com/docs/en/best-practices)
- Four things that belong: exact test/typecheck/lint commands incl. how to run one test file; places where code is misleading; decisions not in the repo; anything corrected twice.
- Concrete over vague: "Use 2-space indentation" not "Format code properly."
- CLAUDE.md is context, not enforcement. Rules that must always hold → hooks (e.g. Stop hook `pnpm tsc --noEmit 1>&2 || exit 2`), deny rules, or managed settings. "If you keep adding emphasis to a CLAUDE.md line and Claude still misses it, that's a sign the line belongs in a hook."
- Multi-step procedures → `.claude/skills/`; part-of-codebase rules → `.claude/rules/*.md` with `paths:` frontmatter.
- Personal prefs → gitignored `CLAUDE.local.md`. Use `/init`, `/doctor prompt-audit`, `/context all` to verify loading.
- Anthropic's own minimal example is three sections: `# Commands`, `# Conventions`, `# Gotchas`.

### What top repos do
- **vercel/next.js `AGENTS.md`** (~380 lines, monorepo-scale): codebase structure, build commands, fast local dev, bundler selection, testing + writing tests ("Generating tests using `pnpm new-test` is mandatory", "Do NOT use `check()`"), lint/types, PR etiquette ("leave PRs in draft"), secrets safety, "Specialized Skills" list under `.agents/skills/`, context-efficient workflows, anti-patterns. [source](https://raw.githubusercontent.com/vercel/next.js/canary/AGENTS.md)
- **cal.com** (`CLAUDE.md` is a one-line stub that points to `AGENTS.md`, ~270 lines): Role intro → **Do** → **Don't** ("Never use `as any`", "Never use barrel imports", "Never skip running type checks before pushing") → PR size limits (<500 lines, <10 files) → Commands → **Boundaries: Always / Ask first / Never** → Project structure → Tech stack → Code examples → PR checklist → When stuck → Extended docs in `agents/`. [source](https://raw.githubusercontent.com/calcom/cal.com/main/AGENTS.md)

### Concrete outline for this portfolio (target ~120–160 lines)

```markdown
# <Name> Portfolio — CLAUDE.md
One paragraph: purpose (get hired + win freelance clients), stack (Next 16 App Router,
TS strict, Tailwind v4, shadcn, Motion/GSAP, MDX content), deploy target (Vercel).
Links: @docs/PURPOSE.md, @docs/PRD.md, @docs/DESIGN_CONCEPT.md  (or reference by path
in backticks to avoid loading them every session)

## Commands
- dev: pnpm dev            (Turbopack is default in Next 16)
- typecheck: pnpm tsc --noEmit
- lint: pnpm eslint .      (next lint is removed in 16; flat config)
- unit: pnpm vitest run <file>
- e2e: pnpm playwright test --project=chromium
- images: pnpm images      (scripts/optimize-images.mjs, see §5)
- build check: pnpm build && pnpm start

## Architecture map (only what's non-obvious)
- app/ routes: (marketing)/ , work/[slug]/ , writing/[slug]/ , api/contact
- content/ = MDX case studies + frontmatter schema in lib/content/schema.ts (zod)
- components/ui = shadcn (generated; edit via CLI diff, don't hand-fork)
- components/motion = the only place animation primitives live
- styles/tokens.css = Tailwind v4 @theme — THE source of truth for color/type/space
- DESIGN.md mirrors tokens.css; lint with `npx @google/design.md lint`

## Conventions
- Server Components by default; "use client" only in leaf components that need it
- Async params/searchParams/cookies (Next 16 breaking change)
- Images: static imports via next/image; LCP image gets `preload` (priority is deprecated in 16)
- Motion: respect prefers-reduced-motion via the <MotionProvider>; one orchestrated
  entrance per page, no per-card hover transitions, no fade-up on every section
- Copy: sentence case, no em-dash label fragments, no "→" decorations, no eyebrow labels
- Case studies follow docs/CASE_STUDY_TEMPLATE.md (problem → constraints → approach →
  trade-offs → outcome with numbers)

## Do not
- Do not add animation libraries beyond motion + gsap without asking
- Do not use `as any`, barrel `index.ts` re-exports, or `images.domains`
- Do not commit raw AI-generated art >2400px; run `pnpm images` first
- Do not touch components/ui/* by hand; use `npx shadcn@latest add --diff`
- Do not invent metrics in case studies; mark unknowns as [TODO: verify]

## Verification before "done"
- pnpm tsc --noEmit && pnpm eslint . && pnpm vitest run
- pnpm build succeeds; Lighthouse (mobile) ≥ 95 perf / 100 a11y on / and /work/[slug]
- Run /design-review (wraps vercel web-design-guidelines) on changed .tsx files
- Screenshot at 390px and 1440px and compare against docs/DESIGN_CONCEPT.md

## Gotchas
- Vercel Hobby image quota: 5K transformations/mo → keep formats ['image/webp'], qualities [75]
- revalidateTag needs a cacheLife profile in 16; `proxy.ts` replaces middleware.ts
```

Pair with: `.claude/rules/content.md` (`paths: content/**`), `.claude/rules/motion.md` (`paths: components/motion/**`), and a `Stop` hook for typecheck. Put long procedures (release, image pipeline, case-study writing, design review) into `.claude/skills/`.

---

## 3. PRD / PURPOSE / DESIGN_CONCEPT templates

### Sources
- **GitHub Spec Kit** `spec-template.md`: prioritized user stories (P1–P3) each independently testable, Given/When/Then acceptance scenarios, edge cases, numbered `FR-001…`, Key Entities, numbered `SC-001…` measurable success criteria, Assumptions, `[NEEDS CLARIFICATION]` markers. [source](https://raw.githubusercontent.com/github/spec-kit/main/templates/spec-template.md); roundup of 9 agent-oriented spec templates (Spec Kit, Kiro EARS, OpenSpec, Task Master, BMAD, AGENTS.md, ai-dev-tasks, spec-workflow-mcp): [ssojet](https://ssojet.com/blog/prd-spec-templates-ai-agents)
- **Google design doc anatomy** (Malte Ubl): Context and scope → Goals and non-goals → Design (overview, system diagram, APIs, data) → Alternatives considered → Cross-cutting concerns; 1–3 page "mini design doc" for small work; skip the doc if there are no trade-offs. [source](https://www.industrialempathy.com/posts/design-docs-at-google/)
- **MADR 4** ADR template: Context and Problem Statement → Decision Drivers → Considered Options → Decision Outcome (Consequences, Confirmation) → Pros/Cons → More Information. [source](https://raw.githubusercontent.com/adr/madr/develop/template/adr-template.md); [adr.github.io](https://adr.github.io)
- **Design tokens as source of truth**: DTCG format (`.tokens.json`, `$value/$type/$description`, aliases `{group.token}`, types color/dimension/fontFamily/typography/shadow…; current doc is "Design Tokens Format Module 2025.10", still a Community Group draft) [spec](https://www.designtokens.org/TR/drafts/format/); Tailwind v4 `@theme` emits both utilities and `:root` CSS variables, so for a solo portfolio the CSS file can *be* the token source and Style Dictionary is optional [dev.to](https://dev.to/raxxostudios/tailwind-v4-theme-design-tokens-that-actually-scale-ip9); Google's DESIGN.md can `export` to Tailwind v4 CSS or DTCG and `lint` contrast.
- **Portfolio-specific advice** (2026 guides, treat as soft): 3–5 deep case studies beat many thumbnails; consistent structure (problem, constraints, approach, trade-offs, outcome); remove tutorial clones; niche down; hiring managers skim on phones in seconds. [templifica](https://templifica.com/blog/7-sections-every-developer-portfolio-needs-to-convert-in-2026), [dev.to](https://dev.to/__be2942592/how-to-build-a-developer-portfolio-that-actually-gets-you-hired-2026-6kn), [scrimba](https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired)

### `docs/PURPOSE.md` (1 page, the "why"; everything else cites it)
1. One-sentence mission (who you are, who you serve, what changes for them)
2. Two audiences, ranked: (a) hiring managers / eng leads for AI-native frontend roles; (b) founders/agencies needing freelance Next.js + design work. One paragraph each: what they're deciding in 30 seconds, what evidence convinces them
3. Positioning statement + the niche ("AI-native frontend engineer who ships design-grade UI fast")
4. Primary conversion per audience (book a call / email / download CV) and the single success metric for each
5. Non-goals (not a blog-first site, not a generic template, not a component library showcase)
6. Principles (3–5): e.g. "proof over claims", "one orchestrated motion moment per page", "fast on a phone"

### `docs/PRD.md` (2–4 pages; agent-readable)
1. Summary + link to PURPOSE
2. Users and jobs-to-be-done (2 personas, their scanning path)
3. User stories, prioritized P1/P2/P3, each with an Independent Test and Given/When/Then acceptance scenarios (Spec Kit style). P1 examples: land on home → understand who/what in 5s → open a case study → contact. P2: filter work by capability; read writing. P3: dark mode, OG images per case study
4. Functional requirements `FR-001…` (routes, case-study schema, contact flow, analytics events, CMS-less MDX content, RSS, sitemap, OG image generation)
5. Non-functional `NFR-…`: Lighthouse mobile ≥95/100/100/100, LCP < 1.8s on 4G, CLS < 0.05, WCAG 2.2 AA, reduced-motion support, no layout shift from fonts, ≤ 5K Vercel image transformations/month
6. Information architecture + sitemap; case-study template fields (problem, constraints, role, approach, trade-offs, outcome metrics, stack, links, visuals)
7. Success criteria `SC-001…` (measurable, tech-agnostic): e.g. ≥ N inbound leads/quarter, ≥ 40% home→case-study click-through, median time on case study ≥ 90s
8. Non-goals and assumptions; `[NEEDS CLARIFICATION]` markers for unknowns
9. Milestones (M0 skeleton, M1 home+1 case study, M2 all case studies + contact, M3 polish/motion/SEO)
10. Decision log pointer: `docs/decisions/NNNN-*.md` (MADR)

### `docs/DESIGN_CONCEPT.md` (design doc + token contract)
1. Concept in one sentence + the "subject" the design is grounded in (frontend-design skill step 1)
2. Goals / non-goals (visual)
3. Token system (normative, mirrored in `styles/tokens.css` and `DESIGN.md`): 4–6 named colors with hex + roles; type (1 family or 2 clearly distinct; scale; line-height rules; ≤ 80ch); spacing/radius/elevation; motion tokens (durations, easings, the one orchestrated moment per page)
4. Layout concept + ASCII wireframes for home, case-study, writing, contact at 390px and 1440px
5. Component inventory (shadcn base + custom), states (hover/focus/empty/error)
6. Anti-patterns list (copy the frontend-design "avoid" list verbatim, plus your own)
7. Accessibility and performance floor (contrast, focus, reduced motion, font loading strategy, image policy)
8. Alternatives considered (2–3 directions rejected and why)
9. Review checklist used by `/design-review`

Keep ADRs for: tokens-in-CSS vs Style Dictionary; Motion vs GSAP; MDX vs CMS; image pipeline (§5); Cache Components on/off.

---

## 4. `morluto/rea` — what it actually is

**It is not a UI/design skill.** REA = "Reverse Engineer Anything": a local MCP server + CLI + agent skill that lets a coding agent reverse-engineer shipped software (native binaries, Electron/JS bundles, .NET, APKs, websites/HAR captures, firmware, pcaps) and build similar features from evidence.

- URL: https://github.com/morluto/rea · site rea.tools · npm `rea-agents`
- Stars **429,207**, forks 106,756, created 2026-04-14, pushed today (API). License **MIT** (REA code); third-party notices separate; commercial engines (IDA, Hopper, JEB) need your own licenses.
- Requires Node 22.23.4+/24.22.1+/26.12.1+. Native analysis needs Hopper/Ghidra/IDA/Kuna; static JS/.NET analysis needs none.
- Structure: `src/`, `bridge/`, `native/`, `docs/`, `.claude-plugin/` (`plugin.json`, `marketplace.json`), `.codex-plugin/`, `.agents/skills/reverse-engineer-anything/SKILL.md`, `AGENTS.md`, `SECURITY.md`, `DISCLAIMER.md`.
- `plugin.json` (v6.8.0): `"skills": "./skills"`, `mcpServers.rea` = `node ${CLAUDE_PLUGIN_ROOT}/scripts/plugin-mcp-launcher.mjs 6.8.0` — the plugin bundles its own server.
- Workflow the README sells: "ask your agent how a feature in an app works, have it show the evidence, then build a similar feature in your own project."

**The skill** (`reverse-engineer-anything`, metadata version 60, 15K installs on skills.sh): routes by artifact type to specific MCP tools (`analyze_javascript_application` for ASAR/JS bundles, `capture_browser_scenario` / `inspect_web_network_capture` for websites, `open_binary` for native…), insists on a summary-first evidence ledger with Evidence IDs, separates observations / inferences / unknowns, and says *skip REA for ordinary source-repo analysis*. Installing the skill alone "only adds instructions" — no tools.

**Install options**
```bash
# A. Full setup (MCP + instructions for Claude Code/Codex/Cursor/Gemini CLI/Grok Build)
npx rea-agents setup            # previews, asks approval, backs up config; restart agent

# B. Claude Code plugin (bundles its own rea server; don't combine with A)
/plugin marketplace add morluto/rea
/plugin install rea@rea

# C. Skill-only (instructions + references into .claude/skills/, no MCP)
npx skills add morluto/rea --skill reverse-engineer-anything

# D. Project-local MCP without touching global config
claude mcp add --scope local rea -- "/abs/path/node" "/abs/path/rea/scripts/rea.mjs" mcp
#   (docs warn: avoid --scope project, which writes a committable .mcp.json)
```
Sources: [README](https://raw.githubusercontent.com/morluto/rea/main/README.md), [installation.md](https://github.com/morluto/rea/blob/main/docs/installation.md), [skills.sh page](https://skills.sh/morluto/rea/reverse-engineer-anything), [SKILL.md](https://raw.githubusercontent.com/morluto/rea/main/.agents/skills/reverse-engineer-anything/SKILL.md), [plugin.json](https://raw.githubusercontent.com/morluto/rea/main/.claude-plugin/plugin.json).

**How it's relevant to the portfolio (and how to "learn" it)**
1. *As a tool*: use option C or D to let Claude capture a reference site's browser scenario / network and inspect its shipped JS bundle to explain how an animation, scroll choreography or transition is implemented, then rebuild your own version. Legal/ethical caveat in REA's own disclaimer: lawful research, interoperability, software you own or are authorized to examine — study patterns, don't lift assets or code.
2. *As a model for writing your own skills*: its SKILL.md is a strong example of (a) explicit "when to use / when NOT to use", (b) routing tables, (c) an evidence standard, (d) separating install-of-instructions from install-of-tools, (e) a recovery guide instead of retrying blindly. Copy that shape for `.claude/skills/design-review`, `/images`, `/case-study`.
3. Don't bundle it into the portfolio repo (`.mcp.json`) — keep it user-scope or local-scope; it is a 100k+-fork security tool with heavy optional dependencies.

---

## 5. Image pipeline for Next.js 16 on Vercel

### Facts that change the plan in Next 16 ([release notes](https://nextjs.org/blog/next-16), [image docs, updated 2026-09-28](https://nextjs.org/docs/app/api-reference/components/image))
- `priority` is **deprecated in favor of `preload`**; docs recommend `loading="eager"` / `fetchPriority="high"` in most cases, `preload` only for the single LCP image.
- Defaults changed: `images.qualities` → `[75]` (quality prop is coerced to the nearest allowed value; field is now required/allow-listed), `images.minimumCacheTTL` → 14400s (4h), `images.imageSizes` drops `16`, `images.maximumRedirects` → 3, new `images.dangerouslyAllowLocalIP` (false), local `src` with query strings now needs `images.localPatterns`. `images.domains` deprecated → `remotePatterns`. `formats` default is `['image/webp']`.
- Static imports (`import hero from './hero.jpg'`) auto-generate `blurDataURL` (for jpg/png/webp/avif, non-animated), set width/height, and get a 1-year immutable `Cache-Control`.
- AVIF: ~20% smaller than WebP but ~50% slower to encode; each format is cached separately (doubles transformations if you list both).
- `sizes` is required for `fill`/responsive images; without it the browser assumes 100vw.

### Vercel cost model (why a solo portfolio should pre-size sources)
Hobby includes **5K transformations, 300K cache reads, 100K cache writes per month**; transformations are billed per cache MISS/STALE; over the limit new optimizations return **402 and the `alt` text is shown**, not a bill. Source limits: 8192px max dimension, 10MB transformed max, jpeg/png/webp/avif only. Vercel's own cost levers: static imports (1-yr cache) or `minimumCacheTTL: 2678400`, one format, `localPatterns` allow-list, `qualities` allow-list, trimmed `deviceSizes`/`imageSizes`, `unoptimized` only for SVG/GIF/<10KB. [limits](https://vercel.com/docs/image-optimization/limits-and-pricing), [managing costs](https://vercel.com/docs/image-optimization/managing-image-optimization-costs)

### Recommended architecture (hybrid)
**Step 0 — generate art.** Real project screenshots beat AI mockups for hiring credibility: capture with Playwright (`npx playwright screenshot --viewport-size=1440,900 --full-page url out.png`, 2x device scale) and composite into device frames. Use AI image models (Gemini "Nano Banana", gpt-image, Midjourney; this session also has Canva, Figma, and Higgsfield MCP connectors) for *concept* mockups, hero textures, and abstract case-study covers — and label them as concept art, never as shipped client work. Generate at 2x target size (e.g. 2880×1800), PNG, no text baked in (render text in HTML for a11y/SEO). [Nano Banana mockup workflow](https://aireiter.com/templates/ai-driven-product-mockup-creation-with-nano-banana-pro)

**Step 1 — `scripts/optimize-images.mjs` (sharp, runs locally / `prebuild`), input `assets/raw/**`, output `public/images/**` + `lib/images/manifest.json`:**
```js
// pnpm add -D sharp fast-glob
import sharp from 'sharp'; import fg from 'fast-glob'; import { mkdir, writeFile } from 'node:fs/promises'; import path from 'node:path';
const WIDTHS = [640, 960, 1280, 1920, 2400];          // cap sources at 2400px; keeps repo + Vercel source size sane
const manifest = {};
for (const file of await fg('assets/raw/**/*.{png,jpg,jpeg}')) {
  const id = path.basename(file, path.extname(file));
  const img = sharp(file).rotate();
  const meta = await img.metadata();
  const outDir = `public/images/${id}`; await mkdir(outDir, { recursive: true });
  // 1. master (static-import source): resized, lossless-ish WebP or high-q JPEG
  await img.clone().resize({ width: Math.min(meta.width, 2400), withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 }).toFile(`${outDir}/master.webp`);
  // 2. optional pre-rendered variants for <picture>/unoptimized or static export
  for (const w of WIDTHS.filter(w => w <= meta.width)) {
    await img.clone().resize({ width: w }).avif({ quality: 55, effort: 6 }).toFile(`${outDir}/${w}.avif`);
    await img.clone().resize({ width: w }).webp({ quality: 78 }).toFile(`${outDir}/${w}.webp`);
  }
  // 3. blur placeholder (≤10px wide, as the docs recommend) + dominant color
  const tiny = await img.clone().resize({ width: 10 }).webp({ quality: 40 }).toBuffer();
  const { dominant } = await img.clone().stats();
  manifest[id] = { width: Math.min(meta.width, 2400), height: Math.round(meta.height * Math.min(meta.width, 2400) / meta.width),
    aspect: meta.width / meta.height, blurDataURL: `data:image/webp;base64,${tiny.toString('base64')}`,
    color: `rgb(${dominant.r},${dominant.g},${dominant.b})`, widths: WIDTHS.filter(w => w <= meta.width) };
}
await writeFile('lib/images/manifest.json', JSON.stringify(manifest, null, 2));
```
Add `"images": "node scripts/optimize-images.mjs"` and optionally `"prebuild": "pnpm images"`. Commit the outputs (deterministic) or run in CI; keep `assets/raw/` out of git if large.

**Step 2 — choose the serving mode per image class:**
| Image class | Serve with | Why |
|---|---|---|
| Hero/LCP, case-study covers (known at build) | `next/image` with **static import** of `master.webp`, `preload`, `sizes`, `placeholder="blur"` (auto) | auto blur + dimensions, 1-year immutable cache, Vercel handles srcset; far below 5K/mo for a portfolio |
| Images referenced from MDX frontmatter (string paths) | `next/image` with `src="/images/<id>/master.webp"`, `width/height/blurDataURL` from `manifest.json`; `images.localPatterns: [{ pathname: '/images/**', search: '' }]` | keeps blur + CLS-free without static import |
| Large galleries, or if you ever go `output: 'export'` / hit the quota | `<picture>` with the pre-rendered AVIF/WebP `srcset` + `unoptimized`, or a custom `loader` that maps width → nearest pre-rendered file | zero transformations; AVIF without doubling Vercel cache |
| SVG logos, tiny icons, GIFs | `unoptimized` | Vercel's own recommendation |

**Step 3 — `next.config.ts`:**
```ts
images: {
  formats: ['image/webp'],            // add 'image/avif' only after measuring; it doubles transformations
  qualities: [75],                    // Next 16 default; add 60 for thumbnails if needed
  deviceSizes: [640, 828, 1080, 1280, 1920],  // trimmed to your breakpoints
  imageSizes: [96, 256, 384],
  minimumCacheTTL: 2678400,           // 31 days (static imports are already 1y immutable)
  localPatterns: [{ pathname: '/images/**', search: '' }],
}
```

**LCP rules for the hero:** one `preload` image per route; explicit `sizes` matching the CSS (`sizes="(max-width: 768px) 100vw, 60vw"`); set `width/height` or `fill` + aspect-ratio container to avoid CLS; use `fetchPriority="high"` instead of `preload` if multiple candidates exist across viewports; fonts via `next/font` with `display: swap`-safe fallback metrics so text LCP doesn't shift. Verify with `pnpm build && pnpm start` + Lighthouse mobile, and make that a listed verification step in CLAUDE.md.

**Plaiceholder** (joe-bell/plaiceholder, 2.3k stars, Apache-2.0) is archived/read-only; the sharp snippet above replaces it. [source](https://github.com/joe-bell/plaiceholder)

---

## Suggested project-local skills (to write in `.claude/skills/`)
- `design-review/` — wraps Vercel `web-design-guidelines` (WebFetch `command.md`) + your anti-pattern list from DESIGN_CONCEPT; `argument-hint: <glob>`.
- `motion/` — distilled GSAP/Motion rules (reduced motion, one orchestrated moment, transforms only, cleanup in `useGSAP`), `paths: components/motion/**`.
- `images/` — `disable-model-invocation: true`; runs `pnpm images`, updates manifest, checks LCP image has `preload`.
- `case-study/` — interviews you (Spec Kit/superpowers brainstorming style) then writes `content/work/<slug>.mdx` using the PRD template; forbids invented metrics.
- `ship/` — typecheck, lint, test, build, Lighthouse, then `vercel deploy`; `context: fork`.

---

## Sources
- https://github.com/anthropics/skills · https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md
- https://github.com/obra/superpowers · https://github.com/nextlevelbuilder/ui-ux-pro-max-skill · https://github.com/EveryInc/compound-engineering-plugin
- https://github.com/vercel-labs/agent-skills · https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md · https://github.com/vercel-labs/web-interface-guidelines
- https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/SKILL.md · https://github.com/google-labs-code/design.md
- https://github.com/greensock/gsap-skills · https://github.com/freshtechbro/claudedesignskills · https://github.com/devmartinese/awwwards-animations-skill · https://www.vibeindex.ai/skills/lucking7/motiondev-skills/motion
- https://github.com/ComposioHQ/awesome-claude-skills · https://github.com/hesreallyhim/awesome-claude-code · https://snyk.io/articles/top-claude-skills-ui-ux-engineers/
- https://code.claude.com/docs/en/memory · https://code.claude.com/docs/en/best-practices · https://code.claude.com/docs/en/skills
- https://raw.githubusercontent.com/vercel/next.js/canary/AGENTS.md · https://raw.githubusercontent.com/calcom/cal.com/main/AGENTS.md
- https://raw.githubusercontent.com/github/spec-kit/main/templates/spec-template.md · https://ssojet.com/blog/prd-spec-templates-ai-agents · https://www.industrialempathy.com/posts/design-docs-at-google/ · https://raw.githubusercontent.com/adr/madr/develop/template/adr-template.md · https://www.designtokens.org/TR/drafts/format/ · https://dev.to/raxxostudios/tailwind-v4-theme-design-tokens-that-actually-scale-ip9
- https://templifica.com/blog/7-sections-every-developer-portfolio-needs-to-convert-in-2026 · https://dev.to/__be2942592/how-to-build-a-developer-portfolio-that-actually-gets-you-hired-2026-6kn · https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired
- https://github.com/morluto/rea · https://raw.githubusercontent.com/morluto/rea/main/README.md · https://github.com/morluto/rea/blob/main/docs/installation.md · https://skills.sh/morluto/rea/reverse-engineer-anything · https://raw.githubusercontent.com/morluto/rea/main/.agents/skills/reverse-engineer-anything/SKILL.md · https://raw.githubusercontent.com/morluto/rea/main/.claude-plugin/plugin.json
- https://nextjs.org/blog/next-16 · https://nextjs.org/docs/app/api-reference/components/image · https://vercel.com/docs/image-optimization/limits-and-pricing · https://vercel.com/docs/image-optimization/managing-image-optimization-costs · https://github.com/joe-bell/plaiceholder · https://aireiter.com/templates/ai-driven-product-mockup-creation-with-nano-banana-pro
