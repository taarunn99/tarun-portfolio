# 0001 — CSS Modules + design tokens instead of Tailwind

Status: accepted · Date: 2026-11-04

## Context and problem

Most copy-paste animation libraries (Aceternity, Magic UI, Motion Primitives, Cult, shadcn registry) ship Tailwind-class JSX. Adopting Tailwind would make them drop-in. It would also add a build layer, a second styling vocabulary, and import those libraries' SaaS aesthetic.

## Decision drivers

Lighthouse 100 on every route; a bespoke editorial look; small CSS; one source of truth for tokens; the foundation already ships CSS Modules at 100×4.

## Considered options

1. CSS Modules + `tokens.css` (chosen)
2. Tailwind v4 + shadcn registry
3. Vanilla-extract / Panda

## Decision

Option 1. Tokens live in `src/styles/tokens.css` (OKLCH + hex fallback); components use CSS Modules. Libraries are read as reference implementations and ported by hand when a pattern is worth it (React Bits has CSS variants).

## Consequences

+ CSS stays < 20 KB; no runtime; design is ours.
− No `npx shadcn add`; porting costs time. Accepted.
