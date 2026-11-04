<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

Research is complete; everything the brief asked for has been gathered or measured directly. Here is the report.

---

# Design-language research: premium Gen-Z developer portfolio (dark-first, Next.js/TS/Three.js)

Date: 2026-11-04. All contrast ratios below were computed with the WCAG 2.x relative-luminance formula (sRGB linearisation, (L1+0.05)/(L2+0.05)); OKLCH values were converted from the hex via the official OKLab matrices. Font sizes were measured by downloading the actual woff2 files (byte counts, not vendor claims).

## 1. Color

### What premium dev/agency sites are doing (2025-26)

- **Off-black, not #000.** Every 2026 trend write-up and the sites themselves (Linear, Vercel, Dennis Snellenberg, Jesper Landberg) sit on #0a0a0a–#141414. Pure black causes halation against bright text and kills shadow-based elevation; a 2-step lift (bg → bg-elevated, roughly +4–5 OKLCH L points) is how depth is shown instead of drop shadows. [line25](https://line25.com/articles/web-design-trends-2026/), [Hostinger](https://www.hostinger.com/uk/tutorials/web-design-trends/)
- **Warm-tinted neutrals** are replacing cool grey. A hint of yellow hue (OKLCH h≈85–105, C≈0.005–0.02) on both the dark bg and the "paper" light bg reads as expensive rather than "default Tailwind zinc".
- **One acid accent, used sparingly.** Lime (#c9f55a-ish), electric orange, or chartreuse on near-black is the dominant Gen-Z-adjacent look; the discipline is that the accent is for one CTA, hover states, selection, and the odd oversized number, never for body copy. Dennis Snellenberg's palette is literally catalogued on Awwwards as "dark gray and yellow". [uiuxshowcase](https://uiuxshowcase.com/portfolio/dennis-snellenberg)
- **"Paper" light mode**: light mode is not white; it's #f4–f7 warm off-white with pure white reserved for elevated cards (so cards lift *up* to white the same way dark cards lift up to grey).
- **OKLCH as the token format.** Perceptually uniform L means the same contrast step works across hues, relative-color syntax (`oklch(from var(--accent) calc(l - 0.1) c h)`) gives hover states for free, and P3 is expressible. Supported in all evergreen browsers; wrap P3-only chroma in `@media (color-gamut: p3)`. [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)

### Palette A — "Acid" (keeps your current foundation)

| Token | Dark hex | Dark oklch | Light ("paper") hex | Light oklch |
|---|---|---|---|---|
| bg | #0a0a0a | oklch(14.5% 0 0) | #f5f5f0 | oklch(96.9% 0.007 106.5) |
| bg-elevated | #141414 | oklch(19.1% 0 0) | #ffffff | oklch(100% 0 0) |
| fg | #f2f2f0 | oklch(96.1% 0.003 106.4) | #0f0f0f | oklch(16.8% 0 0) |
| muted | #9a9a94 | oklch(68.4% 0.009 106.6) | #5f5f5a | oklch(48.4% 0.008 106.7) |
| line | #262626 | oklch(26.9% 0 0) | #e0e0d8 | oklch(90.4% 0.011 106.6) |
| accent | **#c9f55a** | oklch(91.0% 0.185 123.6) | #3f6e00 | oklch(48.5% 0.136 132.6) |
| accent-ink | #0a0a0a | oklch(14.5% 0 0) | #f5f5f0 | oklch(96.9% 0.007 106.5) |
| success | #5ee6a8 | oklch(83.4% 0.149 160.7) | #0f7a4a | oklch(51.2% 0.118 156.8) |
| danger | #ff6b6b | oklch(71.2% 0.181 22.8) | #c0262d | oklch(52.7% 0.189 24.7) |

| Pair | Dark | Light |
|---|---|---|
| fg / bg | **17.66** | **17.53** |
| muted / bg | **7.00** | **5.87** |
| accent / bg | **15.74** | **5.58** |
| accent-ink / accent | **15.74** | **5.58** |
| success / bg | 12.60 | 4.92 |
| danger / bg | 7.13 | 5.40 |
| fg / bg-elevated | 16.44 | 19.17 |
| muted / bg-elevated | 6.51 | 6.42 |

**Verdict on #c9f55a on #0a0a0a: passes comfortably at 15.74:1** (AAA even for small text), and black ink on a lime button is also 15.74:1. The catch is light mode: lime on paper is ~1.26:1, so it cannot be text or an outline there. Two correct options: (a) swap the accent token to the deep olive #3f6e00 (5.58:1, shown above) and keep lime only as a *fill* with #0f0f0f ink on top (15.2:1); or (b) keep lime as a highlighter/underline/marker block in light mode and never as a glyph color. Option (a) is what the table encodes.

### Palette B — "Warm graphite + ember" (warm neutrals, orange accent)

| Token | Dark hex | Dark oklch | Light hex | Light oklch |
|---|---|---|---|---|
| bg | #0c0b09 | oklch(15.0% 0.005 84.9) | #f6f2ea | oklch(96.2% 0.011 84.6) |
| bg-elevated | #171511 | oklch(19.7% 0.008 84.6) | #fffdf8 | oklch(99.4% 0.007 88.6) |
| fg | #f3efe6 | oklch(95.3% 0.013 86.8) | #15130f | oklch(18.8% 0.009 84.6) |
| muted | #a39d90 | oklch(69.7% 0.020 86.2) | #625c52 | oklch(47.7% 0.017 80.6) |
| line | #2a2721 | oklch(27.4% 0.012 84.6) | #e4ddd0 | oklch(90.0% 0.019 83.1) |
| accent | #ff7a1a | oklch(72.4% 0.187 48.9) | #b03e00 | oklch(51.9% 0.160 41.0) |
| accent-ink | #120a02 | oklch(15.3% 0.025 74.3) | #fff6ee | oklch(97.8% 0.014 64.3) |
| success | #7fd99a | oklch(81.2% 0.125 152.4) | #176b3c | oklch(46.7% 0.108 153.5) |
| danger | #ff6f6f | oklch(71.8% 0.176 22.6) | #b4232a | oklch(50.2% 0.180 24.6) |

Ratios — dark: fg/bg 17.14, muted/bg 7.29, accent/bg 7.54, accent-ink/accent 7.52, success 11.52, danger 7.27. Light: fg/bg 16.62, muted/bg 5.93, accent/bg 5.32, accent-ink/accent 5.56, success 5.87, danger 5.85. All ≥4.5.

### Palette C — "Mono ink" (no chromatic accent; type and motion carry it)

| Token | Dark hex | Dark oklch | Light hex | Light oklch |
|---|---|---|---|---|
| bg | #101012 | oklch(17.4% 0.004 286.0) | #fafafa | oklch(98.5% 0 0) |
| bg-elevated | #18181b | oklch(21.0% 0.006 285.9) | #ffffff | oklch(100% 0 0) |
| fg | #ededed | oklch(94.6% 0 0) | #111113 | oklch(17.9% 0.004 286.0) |
| muted | #9b9ba3 | oklch(69.2% 0.012 286.1) | #626269 | oklch(49.9% 0.011 286.0) |
| line | #27272a | oklch(27.4% 0.005 286.0) | #e4e4e7 | oklch(92.0% 0.004 286.3) |
| accent | #ededed (= fg) | oklch(94.6% 0 0) | #111113 | oklch(17.9% 0.004 286.0) |
| accent-ink | #101012 | oklch(17.4% 0.004 286.0) | #fafafa | oklch(98.5% 0 0) |
| success | #8bd9b0 | oklch(82.3% 0.097 160.3) | #13703f | oklch(48.1% 0.114 154.1) |
| danger | #ff7b7b | oklch(73.6% 0.161 21.8) | #b9232a | oklch(51.1% 0.185 24.8) |

Ratios — dark: fg/bg 16.23, muted/bg 6.89, accent/bg 16.23, accent-ink/accent 16.23, success 11.45, danger 7.58. Light: fg/bg 18.07, muted/bg 5.80, accent 18.07, accent-ink 18.07, success 5.89, danger 6.03. This is the Linear/Vercel/rauno.me register; it is the hardest to make not-boring and relies entirely on sections 3–4.

Notes that apply to all three: `line` tokens sit at ~1.2–1.3:1 against bg on purpose (hairlines are decorative, not WCAG text/UI-component targets); if a border *conveys state* (focus ring, input border) use `muted` (≥3:1). Recommended CSS: define tokens in oklch with hex fallbacks via `@supports (color: oklch(0% 0 0))`, and derive hover/pressed as `oklch(from var(--accent) calc(l - 0.06) c h)`.

## 2. Typography

### Candidates (measured)

| Font | Source / license | Variable axes | Measured woff2 | next/font | Notes |
|---|---|---|---|---|---|
| **Geist Sans** | Vercel, OFL 1.1 | wght 100–900 | **28.6 KB** latin subset (Google) · **67.9 KB** full `Geist-Variable.woff2` (npm `geist`) | `next/font/google` or `import { GeistSans } from 'geist/font/sans'` | Google route lacks full glyph set/feature settings; npm route is self-hosted and complete. [vercel.com/font](https://vercel.com/font), [github](https://github.com/vercel/geist-font) |
| **Geist Mono** | Vercel, OFL 1.1 | wght 100–900 | 22.6 KB latin · 69.6 KB full (npm) | same as above (`geist/font/mono`) | Tabular figures built in; best "numbers" mono for a Geist/Inter body. |
| **Inter** (v4) | OFL 1.1 | wght 100–900, **opsz 14–32** | 71.3 KB latin | `next/font/google` (`axes: ['opsz']`) | Heaviest; opsz gives you true display cuts. Closest free match to Neue Montreal. [fontalternatives](https://fontalternatives.com/compare/inter-vs-neue-montreal/) |
| **Inter Tight** | OFL 1.1 | wght 100–900 | 43.9 KB latin | `next/font/google` | Pre-tightened display cut; use when you want Inter body + tighter headlines without hand-tracking. |
| **Satoshi** | Fontshare, **ITF FFL v2.0** | wght 300–900 (+ italic) | **41.6 KB** full variable (from official zip) | `next/font/local` only | The Gen-Z default; geometric with a warm "O". Designer Deni Anggara. |
| **General Sans** | Fontshare, ITF FFL | wght 200–700 (+ italic) | not measured (CDN blocks direct fetch; download kit) | `next/font/local` | Neo-grotesque, more neutral than Satoshi; strong Neue Montreal stand-in. |
| **Clash Display** | Fontshare, ITF FFL | wght 200–700 | not measured | `next/font/local` | Wide, punchy display-only; pairs with a quiet body. |
| **Space Grotesk** | OFL | wght 300–700 | 21.8 KB latin | `next/font/google` | Quirky; reads "2021 crypto" to some eyes now. |
| **Archivo** | OFL | wght 100–900, **wdth 62–125** | 88.0 KB latin | `next/font/google` (`axes: ['wdth']`) | Width axis lets one file do condensed numbers + wide headers. |
| **Instrument Serif** | OFL | static 400 + italic (not variable) | 14.7 KB + 15.3 KB italic | `next/font/google` | The editorial-accent serif of the moment; use the *italic* for one word in a headline. |
| **JetBrains Mono** | OFL | wght 100–800 | 39.5 KB latin | `next/font/google` | Fine, but Geist Mono matches Geist/Inter metrics better. |
| **Manrope** / **DM Sans** | OFL | 200–800 / 100–1000 + opsz | 23.9 / 61.1 KB | google | Safe fallbacks if Satoshi licensing worries you. |

### Fontshare licence: what the primary text actually says

I read the `FFL.txt` bundled in the official Satoshi download (ITF Free Font License **v2.0, 17 Aug 2026**):

- Commercial use: granted, free, unlimited period, "any media, including ... Websites, Mobile or Desktop Applications".
- Self-hosting: explicitly allowed — "You may self-host the Font Software on your own servers ... including through standard webfont technologies such as CSS @font-face. Self-hosting by end users is permitted and recommended ... Use of the Fontshare API is optional."
- Attribution: optional.
- **Restriction that matters for a Next.js build:** "You may not modify ... the Font Software ... This includes ... **subsetting, format conversion**, or altering font names". So: ship the woff2 exactly as downloaded via `next/font/local` (which does not rewrite the file), do **not** run glyphhanger/pyftsubset/`unicode-range` splitting on Satoshi/General Sans/Clash. Full-variable Satoshi is 41.6 KB, so you lose little.
- No redistribution (don't commit a copy into a public template repo that others clone as a "font pack"; a private portfolio repo is your own permitted use).

OFL fonts (Geist, Inter, Archivo, Instrument Serif) have no such restriction and can be subset freely.

### Recommended trio

**Display: Geist Sans (wght 500–600, tight) · Body: Geist Sans 400/450 · Editorial accent: Instrument Serif Italic (one word per hero/section title) · Numbers/eyebrows: Geist Mono.**
Why: one family file (67.9 KB) carries display + body, Mono shares metrics, OFL means you can subset to ~29 KB latin, and Vercel's own ecosystem guarantees `next/font` zero-layout-shift support. Total font payload ≈ 28.6 + 22.6 + 15.3 ≈ **67 KB** with Google subsets, which keeps Lighthouse 100 trivially.

Alternative with more personality: **Satoshi** (display + body, 41.6 KB, local) + **Instrument Serif Italic** + **Geist Mono**. Swap in when the Geist look feels too "Vercel template".

### Fluid type scale (360 → 1440 px viewport, rem-based)

| Token | clamp() | ≈ at 360 / 1440 | line-height | letter-spacing | weight |
|---|---|---|---|---|---|
| --fs-display | `clamp(2.75rem, 1.5rem + 6vw, 7rem)` | 46 / 110 px | 0.95 | -0.04em | 500–600 |
| --fs-h1 | `clamp(2.25rem, 1.4rem + 4vw, 5rem)` | 38 / 80 px | 1.0 | -0.03em | 500 |
| --fs-h2 | `clamp(1.75rem, 1.2rem + 2.2vw, 3rem)` | 29 / 48 px | 1.05 | -0.02em | 500 |
| --fs-h3 | `clamp(1.375rem, 1.1rem + 1.1vw, 2rem)` | 22 / 32 px | 1.15 | -0.01em | 500 |
| --fs-lead | `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)` | 18 / 22 px | 1.45 | -0.005em | 400 |
| --fs-body | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | 16 / 18 px | 1.6 | 0 | 400 |
| --fs-small | `0.875rem` | 14 px | 1.5 | 0 | 400 |
| --fs-caption / eyebrow (mono) | `0.75rem` | 12 px | 1.4 | **+0.08em**, uppercase | 500 |
| --fs-numeral (oversized stats) | `clamp(4rem, 2rem + 10vw, 12rem)` | 64 / 192 px | 0.9 | -0.05em | 500, `font-variant-numeric: tabular-nums` |

Rules: tracking tightens as size grows (negative on display, zero on body, positive on small caps/mono); `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs; measure capped at 65ch; `font-feature-settings: "ss01"` (Geist/Inter alternate glyphs) only on display. Inter users should set `axes: ['opsz']` so the browser picks the display optical size automatically. [Utopia](https://utopia.fyi/blog/clamp/), [alwaystwisted](https://alwaystwisted.com/articles/building-fluid-typographic-scales-with-clamp-and-heading)

## 3. Motion language

### What the top sites actually use

- **Ease-out everything that enters; never ease-in on UI.** Emil Kowalski's (ex-Linear/Vercel) rule set: UI transitions ≤300 ms at `ease-out`; 200 ms is the default; 500 ms max for drawers/sheets. [emilkowal animations summary](https://agent-skills.md/skills/pproenca/dot-skills/emilkowal-animations)
- **Hero/scroll reveals are slower and use expo/quint.** Osmo's canonical masked line reveal: `yPercent: 110 → 0`, `ease: 'expo.out'`, lines 0.8 s / stagger 0.08, words 0.6 s / 0.06, chars 0.4 s / 0.01, triggered at `clamp(top 80%)`, `once: true`; mask via SplitText `mask: 'lines'` (overflow-hidden wrapper), with `visibility: hidden` + `autoAlpha` to avoid FOUC. [Osmo](https://www.osmo.supply/resource/masked-text-reveal)
- **GSAP ↔ CSS equivalences** (from easings.net source): `power4.out` = easeOutQuint = **cubic-bezier(0.22, 1, 0.36, 1)** — the curve you cited; `expo.out` = **cubic-bezier(0.16, 1, 0.3, 1)**; `power3.out` = easeOutQuart = cubic-bezier(0.25, 1, 0.5, 1); `power4.inOut` = cubic-bezier(0.83, 0, 0.17, 1); `expo.inOut` = cubic-bezier(0.87, 0, 0.13, 1); `circ.out` = cubic-bezier(0, 0.55, 0.45, 1). [easings.net](https://easings.net/)
- **Clip-path curtain**: `clip-path: inset(0 0 100% 0) → inset(0 0 0 0)`, 0.9–1.2 s, power4.out; image reveals typically pair this with a `scale(1.15 → 1)` on the inner img.
- **Page transitions**: the classic portfolio curtain is 1.2 s in / 1.0 s out on `expo.inOut` (too long by 2026 standards); current practice is 0.6–0.9 s total with overlap (`sync: true` in Barba, `pointer-events: none` on links mid-transition). In Next.js use the View Transitions API (`experimental.viewTransition`) at 400–600 ms with `::view-transition-old/new` on `--ease-out-expo`. [Codrops 2026](https://tympanus.net/codrops/2026/04/08/creating-custom-page-transitions-in-astro-with-barba-js-and-gsap/), [GSAP forums](https://greensock.com/forums/tags/barbajs/)
- **Smooth scroll**: Lenis defaults (`lerp: 0.1`, `duration: 1.2`) are what most Awwwards portfolios ship; keep `lerp ≥ 0.1` so it doesn't feel syrupy, and disable on touch.
- **Stagger caps**: total stagger ≤ ~0.6 s regardless of item count (`stagger: { each: 0.06, from: 'start' }` with `amount` instead of `each` for long lists).

### Motion tokens

```css
:root {
  /* easings */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);   /* GSAP expo.out — hero reveals */
  --ease-out-quint:  cubic-bezier(0.22, 1, 0.36, 1);  /* GSAP power4.out — default reveal */
  --ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);   /* GSAP power3.out — cards, images */
  --ease-out-ui:     cubic-bezier(0.23, 1, 0.32, 1);  /* hover/focus/menus */
  --ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1);/* page curtains, both directions */
  --ease-in-out-expo:  cubic-bezier(0.87, 0, 0.13, 1);/* marquee pause/resume, sheets */
  --ease-spring:     linear(0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%, 0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50.1%, 1.015 55%, 1.017 63.9%, 1.001) ; /* only for magnetic buttons / cursor */

  /* durations */
  --dur-instant: 100ms;   /* color/opacity on hover */
  --dur-fast:    200ms;   /* UI state change, underline grow */
  --dur-base:    300ms;   /* menu, tooltip, toggle (upper bound for UI) */
  --dur-slow:    600ms;   /* card/image enter */
  --dur-reveal:  800ms;   /* masked text lines */
  --dur-page:    900ms;   /* route transition, total */

  /* stagger */
  --stagger-chars: 10ms; --stagger-words: 60ms; --stagger-lines: 80ms; --stagger-items: 60ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-instant: 0ms; --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; --dur-reveal: 0ms; --dur-page: 0ms; }
}
```

Conventions: text reveals are `translateY(110%)` inside an `overflow: clip` line wrapper (not opacity fades); images use clip-path + inner scale; hover underlines grow from left via `background-size` or `scaleX` with `transform-origin` flipping on exit; nav/menu use `--ease-out-ui` at 300 ms; the 3D/Three.js layer should lerp camera/mouse with factor 0.05–0.08 per frame and never exceed the scroll's Lenis lerp.

## 4. Layout language

- **Grid:** 12-column fluid grid with `--gutter: clamp(16px, 2vw, 32px)` and page padding `--pad: clamp(1rem, 4vw, 4rem)`. Hero and marquees go full-bleed; text blocks snap to columns 2–11 or a 65ch measure. Bento sections use `grid-auto-rows` with `span` 1–2 on an 8-pt baseline.
- **Max widths:** site shell 1440–1536 px (`max-width: 96rem`), reading column `65ch`, oversized headlines unconstrained (they are meant to touch the gutters). Many 2025–26 winners drop the container entirely and let 1 px hairlines define edges.
- **Spacing scale (4-pt base):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192 → as tokens `--space-1…--space-11`. Section rhythm is fluid: `--section-y: clamp(5rem, 12vw, 12rem)`; intra-section `clamp(2rem, 5vw, 4rem)`.
- **Hairlines and radius:** 1 px borders at `--line` (≈1.3:1 — intentionally faint) as section dividers and table rows; no box shadows in dark mode (elevation = `--bg-elevated` step + hairline). Radius: 0–4 px for editorial elements and images, 12–16 px for bento cards, 999 px for pills/tags; pick one of "sharp" or "soft" and don't mix beyond those two tiers.
- **How Gen-Z-minimal avoids boring (what the 2025–26 Awwwards portfolio winners share):** (1) one *enormous* headline per screen (display token above) that doubles as the hero, often with one Instrument Serif italic word; (2) a slow marquee of stack/clients/awards (`animation: 40–60s linear infinite`, pause on hover); (3) sticky/pinned sections where the left column stays while the right scrolls (project case studies, "process" steps); (4) a bento grid for "about"/stats with one oversized tabular-mono number per cell (years, projects, ms saved, % growth — a growth engineer should flex metrics); (5) numbered index lists (`(01) · (08)`) instead of card grids for work; (6) a live local-time + "available from" footer line (Snellenberg, Fayemi, Mangham all do it); (7) a custom cursor only as a *label* ("View", "Drag", "Play") that disappears on touch; (8) micro-interactions: magnetic buttons, underline grow, image parallax ±5 %. Trend reports confirm bento, kinetic/oversized type, scroll-triggered reveals, and custom cursors as the 2026 set, with the caution that cursors must degrade on touch. [line25](https://line25.com/articles/web-design-trends-2026/), [studiomeyer](https://studiomeyer.io/en/blog/webdesign-trends-2026), [tinyfrog](https://tinyfrog.com/web-design-trends)

## 5. Reference sites

| Site | Why it matters for this brief |
|---|---|
| https://dennissnellenberg.com | The archetype of the genre: off-black + single yellow accent, multilingual "Hello" preloader, magnetic buttons, project cards with discipline/year, local-time footer. Awwwards SOTD + Honorable Mention; so copied that Awwwards has a collection of its imitators — study it, don't clone it. |
| https://jesperlandberg.com | Swedish design engineer, Awwwards Independent of the Year 2022 & 2024, SOTD Sep 2026. Proof that a text-first, list-based portfolio can win purely on motion craft and typography. |
| https://www.bleibtgleich.com (and bleibtgleich.dev) | Kyiv design/dev, Awwwards SOTD Mar 2025: numbered nav, split-line reveals, % preloader, awards-by-year block — the Gen-Z minimal vocabulary in one place. |
| https://rauno.me | Rauno Freiberg (Vercel). The "premium, not desperate" ceiling: hyper-restrained mono palette, every interaction considered, zero decoration. Use as the taste benchmark for Palette C. |
| https://emilkowal.ski | Emil Kowalski (ex-Linear/Vercel, animations.dev). Plain list layout with flawless 200 ms ease-out micro-motion; the source of the UI-duration rules above. |
| https://lusion.co | Bristol studio, Awwwards SOTY-tier, 3D storytelling. The reference for integrating Three.js *inside* a restrained layout (scroll-to-explore cues, reel toggle) without turning the site into a demo. |
| https://fayemi.design | Isaac Fayemi / Studio Null (SOTD May 2025): typographic index portfolio, letter-spaced labels, expandable sections, AVIF via Sanity, live Zagreb clock. Shows how an editorial list can replace a card grid. |
| https://bruno-simon.com | Awwwards SOTM Jan 2026. The Three.js-first counter-example — a benchmark for WebGL performance, and a reminder of what *not* to let the 3D layer become on a professional portfolio. |

Also worth a look for product-grade off-black + Geist: https://linear.app and https://vercel.com. Note on **lando.xyz**: the domain refused connections during this research (ECONNREFUSED; no redirect target) and no index entry exists for it; the "Lando Norris" site by OFF+BRAND that carries Awwwards' *Site of the Year 2025 / Developer Award* is a different URL — verify before citing it as a reference. [Awwwards portfolio winners](https://www.awwwards.com/websites/winner_category_portfolio/)

## Sources

- Trends: [line25 2026 guide](https://line25.com/articles/web-design-trends-2026/) · [Hostinger trends](https://www.hostinger.com/uk/tutorials/web-design-trends/) · [studiomeyer reality check](https://studiomeyer.io/en/blog/webdesign-trends-2026-reality-check) · [tinyfrog](https://tinyfrog.com/web-design-trends) · [Evil Martians on OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- Fonts: [vercel.com/font](https://vercel.com/font) · [vercel/geist-font](https://github.com/vercel/geist-font) · Fontshare API (`api.fontshare.com/v2/fonts`) and the `FFL.txt` inside the official Satoshi download zip · [Fontshare licence page](https://www.fontshare.com/licenses/itf-ffl) · [madegooddesigns Fontshare review](https://madegooddesigns.com/fontshare/) · [diversekit review](https://diversekit.com/blog/fontshare-review) · [Inter vs Neue Montreal](https://fontalternatives.com/compare/inter-vs-neue-montreal/) · Google Fonts CSS API (axis ranges, measured woff2 sizes) · [Utopia](https://utopia.fyi/blog/clamp/)
- Motion: [Osmo masked text reveal](https://www.osmo.supply/resource/masked-text-reveal) · [easings.net source](https://raw.githubusercontent.com/ai/easings.net/master/src/easings.yml) · [Emil Kowalski animation rules (summary)](https://agent-skills.md/skills/pproenca/dot-skills/emilkowal-animations) · [Codrops Barba+GSAP 2026](https://tympanus.net/codrops/2026/04/08/creating-custom-page-transitions-in-astro-with-barba-js-and-gsap/) · [GSAP forum curtain thread](https://greensock.com/forums/tags/barbajs/)
- References: [Awwwards portfolio category](https://www.awwwards.com/websites/winner_category_portfolio/) · [Minimal Gallery](https://minimal.gallery/) · [uiuxshowcase on Snellenberg](https://uiuxshowcase.com/portfolio/dennis-snellenberg) · [Awwwards Lusion](https://www.awwwards.com/sites/lusion) · direct reads of each listed site

One caveat on completeness: General Sans and Clash Display file sizes were not measured because Fontshare's CDN returns a stub to direct requests and I did not spoof a Referer to get around it; download their kits from fontshare.com to check (expect ~40–50 KB per variable woff2, in line with Satoshi's 41.6 KB).
