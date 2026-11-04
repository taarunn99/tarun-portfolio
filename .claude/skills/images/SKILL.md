---
name: images
description: Run the image pipeline for this portfolio — capture screenshots of the live sites with Playwright, generate placeholder art with the Higgsfield MCP, optimise everything to AVIF/WebP + thumbhash with sharp, and wire the manifest. Use when adding or replacing any image, cover, OG background or scene texture.
disable-model-invocation: true
---

# Images

Evidence and prompt library: `docs/research/10-image-pipeline-and-higgsfield.md`. Budgets: hero < 150 KB, cards < 60 KB, OG < 200 KB, blurDataURL ≤ 300 B.

## Sources

1. **Screenshots (preferred for public sites):** `npm run shots` → `scripts/screenshots.mjs` (Playwright, 1440×900 @2x, iPhone 15 @3x, `animations: 'disabled'`, waits for `document.fonts.ready` and network idle, scrolls once to trigger lazy content). Targets are listed in the script; add new ones there.
2. **Generated art (private apps, dioramas, skylines):** Higgsfield MCP. Check cost with `models_explore` before a batch; prefer `flux_2 pro 2k` / `seedream_v4_5` for abstract renders, `recraft_v4_1` with `colors: ["#0a0a0a","#f2f2f0","#c9f55a"]` for palette-locked vector, `ideogram_vector` for SVG. Prepend the style anchor from the research doc; **no text in images**. Outputs are deleted after 7 days — download into `assets/src/<group>/` immediately.

## Pipeline

`npm run images` → `scripts/optimize-images.mjs`: normalise ≤ 2560 px, strip metadata, AVIF (q52–58, effort 6) + WebP width variants per profile (hero/cover/screen/tile/og), thumbhash `blurDataURL`, OG JPEG 1200×630, writes `src/lib/images/manifest.json`. Commit `public/images/**` and the manifest. Never bake film grain (CSS/SVG overlay instead).

## Wiring

Reference images by manifest id via `getImage(id)` in `src/lib/images`. Screenshots go inside `<BrowserFrame>`. Only an LCP image gets `preload` + `fetchPriority="high"`; everything else lazy with `sizes`.

## Verification

Budget warnings from the script are blockers. Re-run `LH_RUNS=3 npm run lighthouse` on affected routes; LCP must remain text on `/`.
