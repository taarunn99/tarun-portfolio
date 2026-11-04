# 0002 — GSAP (+ ScrollTrigger/SplitText/MotionPath) over Motion

Status: accepted · Date: 2026-11-04 · Evidence: `research/01`, `research/07`

## Context

Scroll-choreographed, agency-style motion (pinning, scrubbing, split-text reveals, path following) is the core of the design. GSAP became fully free (all plugins) on 2025-04-30 under Webflow. Motion (framer) has no timeline/scrub primitive and sells split text in Motion+.

## Decision

GSAP 3.15 + `@gsap/react` is the only tween engine. Lenis is driven from `gsap.ticker`. React 19.3 `<ViewTransition>` handles route transitions (0 KB). CSS scroll-driven animations behind `@supports` for cheap parallax. Motion is not installed.

## Consequences

+ One engine (~45–50 KB gz incl. ScrollTrigger + SplitText), every reference site uses this exact pattern, free licence.
− GSAP core isn't tree-shaken; plugins must be imported individually; must register in a client module only.
