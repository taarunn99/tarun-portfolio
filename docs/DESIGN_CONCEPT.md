# Design concept — "Signal"

Status: approved 2026-11-04 · Normative for `src/styles/tokens.css` and every component · Evidence: `research/06-palette-and-typography.md`, `research/01-animation-ui-libraries.md`, `research/05-phantom-land-teardown.md`, `research/07-journey-animation-patterns.md`

## 1. Concept

A near-black editorial canvas where everything is quiet except the evidence — oversized numbers, real screenshots, one accent. Motion exists to **reveal proof**, never to decorate. The vocabulary is Gen-Z modern (huge type, hairline grid, marquee, sticky sections, a cursor label on desktop, magnetic buttons) executed with restraint: monochrome, high contrast, one orchestrated entrance per page.

The subject the design is grounded in: *a control room at night* — dark surfaces, instrument readouts in mono, one status light. Not a nightclub, not a terminal emulator.

## 2. Goals / non-goals

Goals: premium, fast, original, credible to a GM and to an engineer at the same time; readable on a 390 px phone in sunlight (paper theme available); every interaction has a keyboard and reduced-motion equivalent.
Non-goals: glassmorphism everywhere, rainbow gradients, 3D for its own sake, SaaS-landing-page card grids, "AI look" defaults.

## 3. Tokens (normative)

Colour tokens are defined in OKLCH with hex fallbacks. Dark is the default theme; **paper** is used on case-study pages and as the user-selectable light theme.

| Token | Dark | Paper | Notes |
|---|---|---|---|
| `--bg` | `#0a0a0a` | `#f5f5f0` | warm-tinted neutrals (OKLCH hue ≈ 106) |
| `--bg-elevated` | `#141414` | `#ffffff` | elevation = tone step + hairline, never drop shadow in dark |
| `--fg` | `#f2f2f0` | `#0f0f0f` | 17.7:1 / 17.5:1 |
| `--muted` | `#9a9a94` | `#5f5f5a` | 7.0:1 / 5.9:1 — body-safe |
| `--line` | `#262626` | `#e0e0d8` | decorative hairlines only (~1.3:1 by design); state-bearing borders use `--muted` |
| `--accent` | `#c9f55a` | `#3f6e00` | 15.7:1 / 5.6:1. In paper, lime is allowed only as a fill/marker with `#0f0f0f` ink |
| `--accent-ink` | `#0a0a0a` | `#f5f5f0` | text on accent fills |
| `--success` | `#5ee6a8` | `#0f7a4a` | |
| `--danger` | `#ff6b6b` | `#c0262d` | |

Derived states: `--accent-hover: oklch(from var(--accent) calc(l - 0.06) c h)`; focus ring = `--accent` 2 px, offset 3 px. Selection = accent fill + accent-ink.

**Why lime stays:** 15.7:1 contrast, already shipping at Lighthouse 100, and the most Gen-Z-coded option. The "near-black + acid-green = AI default" risk is neutralised by warm neutrals, an italic serif accent word, mono tabular numerals, real screenshots and editorial layout — not by changing the hue.

### Type

- **Display + body:** Geist Sans (variable, OFL, via `next/font/google`, latin subset). Display 500–600 tight; body 400.
- **Numbers, eyebrows, meta:** Geist Mono, `font-variant-numeric: tabular-nums`, eyebrows uppercase +0.08em.
- **Accent word:** Instrument Serif *Italic* — one word per headline, never a whole sentence.

| Token | Size | lh | tracking | weight |
|---|---|---|---|---|
| `--fs-display` | `clamp(2.75rem, 1.5rem + 6vw, 7rem)` | 0.95 | −0.04em | 500–600 |
| `--fs-h1` | `clamp(2.25rem, 1.4rem + 4vw, 5rem)` | 1.0 | −0.03em | 500 |
| `--fs-h2` | `clamp(1.75rem, 1.2rem + 2.2vw, 3rem)` | 1.05 | −0.02em | 500 |
| `--fs-h3` | `clamp(1.375rem, 1.1rem + 1.1vw, 2rem)` | 1.15 | −0.01em | 500 |
| `--fs-lead` | `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)` | 1.45 | −0.005em | 400 |
| `--fs-body` | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | 1.6 | 0 | 400 |
| `--fs-small` | `0.875rem` | 1.5 | 0 | 400 |
| `--fs-caption` | `0.75rem` (mono) | 1.4 | +0.08em, uppercase | 500 |
| `--fs-numeral` | `clamp(4rem, 2rem + 10vw, 12rem)` (mono) | 0.9 | −0.05em | 500 |

`text-wrap: balance` on headings, `pretty` on paragraphs; measure ≤ 65ch; `font-feature-settings: "ss01"` only on display.

### Space, grid, shape

4-pt scale `--space-1…11` = 4 8 12 16 24 32 48 64 96 128 192. Section rhythm `--section-y: clamp(5rem, 12vw, 12rem)`. 12-column fluid grid, gutter `clamp(16px, 2vw, 32px)`, page padding `clamp(1rem, 4vw, 4rem)`, shell `max-width: 96rem`, reading column 65ch, display headlines may touch the gutters. Radii: 0–4 px editorial / images, 12–16 px bento cards, 999 px pills. Hairlines at `--line` for dividers and table rows. No box shadows in dark.

### Motion tokens

```
--ease-out-expo:     cubic-bezier(0.16, 1, 0.3, 1)    hero reveals (GSAP expo.out)
--ease-out-quint:    cubic-bezier(0.22, 1, 0.36, 1)   default reveal (power4.out)
--ease-out-quart:    cubic-bezier(0.25, 1, 0.5, 1)    cards, images (power3.out)
--ease-out-ui:       cubic-bezier(0.23, 1, 0.32, 1)   hover, menus, camera zoom
--ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1)   page curtains
--dur-instant 100ms · --dur-fast 200ms · --dur-base 300ms (UI upper bound) · --dur-slow 600ms · --dur-reveal 800ms · --dur-page 900ms
stagger: chars 10ms · words 60ms · lines 80ms · items 60ms · total ≤ 600ms
```
All durations collapse to 0 under `prefers-reduced-motion: reduce`. Text reveals: `yPercent 110 → 0` inside an `overflow: clip` line wrapper (SplitText `mask: 'lines'`), `expo.out`, 0.8 s, stagger 0.08, once. Images: `clip-path: inset(0 0 100% 0 → 0)` + inner `scale(1.15 → 1)`, `power4.out`, 1 s. Hover: colour/opacity/underline-grow only — never layout. Page transitions: React `<ViewTransition>` 400–600 ms on `--ease-out-expo`; shared-element morph thumbnail → case-study hero. Lenis `lerp 0.1`, desktop only. Three.js camera/mouse lerp 0.05–0.08 per frame.

## 4. Signature moments

1. **Hero.** Name + positioning line as painted HTML (the LCP). Behind it, gated behind the first gesture: a WebGL "signal field" — a point cloud that resolves from noise into a wireframe Dubai skyline / monogram. Mobile: fewer points, DPR ≤ 1.5. Reduced motion: static gradient.
2. **Proof strip.** Mono numerals that count up on view: 7 products · 9.2× ROAS · AED 2.27M pipeline · 776,478 units · AED 160K saved. Marquee of stack/brands below, 50 s linear, pauses on hover.
3. **Work grid.** Vanilla-three rebuild of the phantom.land mechanics (see `research/05` §4): `InstancedMesh` 11×11, infinite wrap, still atlases, hover self-glow, cursor parallax ×0.07, press-zoom, drag inertia, lens pass with low-tier bypass, keyboard pan, SSR list as the accessible twin. Touch/no-WebGL: DOM grid.
4. **Journey.** SVG route India → Singapore → Dubai; route draws on scroll; marker rides the path; camera pans/zooms; milestone cards activate. Desktop "enter the scene": camera flies into a 2.5D layered diorama where dated project cards float along the path (reel-inspired, our art).
5. **Case-study pages.** Paper theme. Giant title, mono meta row (role · stack · year · live ↗), full-bleed screenshot in a CSS browser frame, numbered sections.
6. **Cursor + magnetic buttons** on `pointer: fine`; cursor is a *label* ("View", "Drag"), hidden on touch. **Preloader** once per session, ≤ 600 ms, never covers the LCP paint.

## 5. Layout wireframes

```
/  (390px)                         /  (1440px)
┌──────────────┐                    ┌───────────────────────────────────────┐
│ TS   Work About Contact │        │ TS            Work  About  Contact   ⊙ │
│                          │        │                                        │
│ HEAD OF TECHNOLOGY       │        │ HEAD OF TECHNOLOGY                     │
│ Tarun                    │        │ Tarun Shukla                 [signal   │
│ Shukla                   │        │ I build the tech, growth      field]   │
│ I build the tech, growth │        │ and operations engine…                 │
│ …engine for companies    │        │ [View work] [Get in touch]             │
│ [View work] [Contact]    │        ├──────── proof strip (mono numerals) ───┤
├──────────────┤                    │ 7 products · 9.2× ROAS · AED 2.27M … │
│ 7 · 9.2× · 2.27M · …     │        ├──────── selected work ─────────────────┤
├──────────────┤                    │ 01 lapizblue │ 02 Google Ads │ 03 60N │
│ 01 lapizblue.com         │        │ [screenshot] │ [screenshot]  │ […]    │
│ [screenshot]             │        ├──────── capabilities bento ────────────┤
│ 02 Google Ads            │        │ Web  │ Growth │ ERP  │ AI │ Brand │Ops│
│ …                        │        ├──────── journey teaser (route) ────────┤
├──────────────┤                    │ IN ───────── SG ───────── AE          │
│ capabilities (stack)     │        ├──────── services (3) ──────────────────┤
├──────────────┤                    ├──────── contact CTA ───────────────────┤
│ journey (vertical)       │        │ Let's build something fast.  hello@…  │
├──────────────┤                    └───────────────────────────────────────┘
│ services / contact       │
└──────────────┘

/work/[slug]  (paper theme)
┌───────────────────────────────────────┐
│ ← Work                       Tarun    │
│ LAPIZ BLUE                             │
│ REBUILT WITHOUT LOSING A RANKING       │   ← display, 2 lines max
│ ROLE Head of Technology · STACK Next.js… · YEAR 2025 · LIVE ↗ │
│ [full-bleed screenshot in browser frame]│
│ 1,200 → 62  │  66 → 99  │ 1,342 clicks │   ← numerals
│ 01 Context  … 02 Constraint … 03 What I did … 04 Result … 05 Stack … 06 What I'd change │
│ Related work (2)                       │
└───────────────────────────────────────┘
```

## 6. Component inventory

`ui/`: Container, Section, Eyebrow, Heading (with accent-word slot), Button (primary/ghost/link), Tag, Pill, Numeral, Marquee, BrowserFrame, Figure, Table, Divider, SkipLink, ThemeToggle.
`motion/`: GsapProvider (register + ticker), LenisProvider, Reveal, SplitLines, Counter, Magnetic, Cursor, PageTransition (ViewTransition wrappers), InView.
`scene/`: Renderer (singleton), HeroSignal, WorkGrid (+ LensPass, Navigation, atlases), JourneyRoute (SVG + MotionPath), JourneyScene (diorama).
`sections/`: Hero, ProofStrip, FeaturedWork, Capabilities, JourneyTeaser, Services, ContactCta, Footer, CaseStudyHeader, CaseStudyBody, RelatedWork, ContactForm.

States for every interactive component: default, hover (pointer: fine only), focus-visible, active, disabled, loading (buttons), error (form), empty (lists).

## 7. Anti-patterns (hard rules)

From Anthropic's `frontend-design` skill and our own: no uniform rounded cards with `rgba(0,0,0,.1)` shadows; no all-caps eyebrow on every block; no `→` on every link; no fade-up on every section; no hover transition on every card; no emoji as icons; no testimonial carousel; no "best / top / #1" copy; no cream + terracotta; no stock 3D blobs; no scale-on-hover that shifts layout; no `maximum-scale` on the viewport; no text baked into images.

## 8. Accessibility & performance floor

AA contrast for all text (muted ≥ 4.5:1); focus visible on everything; skip link; one `<main>`; unique titles; decorative canvases `aria-hidden`; meaningful media labelled; targets ≥ 24 px (44 px for primary); reduced-motion parity; fonts `display: swap` with metric fallbacks; LCP is text; images via `next/image` with `sizes` and blur placeholders; WebGL only after interaction, DPR-capped, paused offscreen, disposed on unmount; zero console errors.

## 9. Alternatives considered

- *Palette B "warm graphite + ember"* (orange accent) — more original, but weaker contrast (7.5:1) and reads "agency", not "signal". Kept as a documented fallback in `research/06`.
- *Palette C "mono ink"* — the rauno.me register; hardest to keep un-boring without heavy motion; rejected for v1.
- *Tailwind + shadcn* — would unlock copy-paste libraries, but adds a build layer, a second styling mental model, and most of those libraries' aesthetics we don't want. CSS Modules + tokens keep CSS < 20 KB.
- *React Three Fiber* — nice ergonomics, +15–20 KB and a reconciliation layer; one shared vanilla renderer is leaner for 2–3 scenes.

## 10. Review checklist (used by `/design-review`)

- [ ] Tokens only (no raw hex in components)
- [ ] One accent word max per headline; eyebrows ≤ 1 per section
- [ ] Reveals are clip/transform in reserved boxes; nothing starts at `opacity: 0` above the fold
- [ ] Hover changes colour/opacity only; cursor label on `pointer: fine` only
- [ ] 390 px: no horizontal scroll; targets ≥ 24 px; body ≥ 16 px
- [ ] Reduced motion: page reads identically
- [ ] Lighthouse 100×4 on the touched route (mobile + desktop)
- [ ] Copy: no superlatives, no desperation, numbers sourced
