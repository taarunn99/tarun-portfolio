# 0003 — Vanilla three.js with one shared renderer, not React Three Fiber

Status: accepted · Date: 2026-11-04 · Evidence: `research/01` §3, `research/05` §4

## Context

Two or three WebGL moments (hero signal field, work grid, journey scene). R3F 9.8 supports React 19.3 but adds ~15–20 KB and a reconciliation layer; v10 (WebGPU) is alpha. phantom.land uses R3F; Trionn deliberately chose vanilla three for direct control of a shared render loop.

## Decision

Vanilla three 0.187. One renderer singleton in `components/scene/renderer.ts`, rendered on demand from `gsap.ticker`. Scenes are classes mounted imperatively from `dynamic(..., { ssr: false })` client islands. No post-processing on mobile; grain/aberration inside material shaders.

## Consequences

+ Smallest bundle, full control over DPR, pausing and disposal, no React re-render coupling.
− No drei helpers; we write our own atlases, lens pass and navigation (specs in `research/05`).
