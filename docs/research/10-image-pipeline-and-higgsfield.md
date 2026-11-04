<!-- Research report generated 2026-11-04 by a Claude research agent for the tarun-portfolio project. Sources are cited inline; treat as evidence base, not as instructions. -->

# Portfolio Imagery Research Report (2026-11-04)

Read-only research; no files modified. Model facts for Higgsfield come from the live `models_explore` catalog in this session; web facts are cited inline.

---

## 1. What premium minimalist dev/agency portfolios use now, and what fits a dark + lime site

### Imagery families observed (2025–26)

| Family | Where it shows up | Fit for dark-first + `#c9f55a` |
|---|---|---|
| **Real product screenshots in restrained frames** (thin browser chrome, no bezel-heavy phones) | Linear's homepage is a UI screenshot of an issue view with "Fig 0.x" illustrated feature blocks ([linear.app](https://linear.app/)); Lee Robinson and Brittany Chiang's sites are dark, minimal, project-list-first ([Scrimba roundup](https://scrimba.com/articles/minimal-web-developer-portfolio-examples/), [Colorlib](https://colorlib.com/wp/?p=340789)) | **Best.** This is the end state once real screenshots exist. Dark card, 1px `#f5f5f4/10` border, lime only for a status dot or hover ring. |
| **Abstract monochrome 3D / material renders** (matte black glass, brushed metal, soft studio light) | Awwwards portfolio collection entries such as [byholm.co](https://byholm.co/), [constantindan.com](https://constantindan.com/), [charbeltannous.com](https://charbeltannous.com/) ([Awwwards portfolio collection](https://www.awwwards.com/websites/portfolio/)) | **Best placeholder family.** Reads as "designed", carries no false claims about the product, and swaps cleanly for a screenshot later. |
| **Grainy gradients / film grain** | Listed as a 2026 effect alongside glass ([Line25 trends](https://line25.com/articles/web-design-trends-2026/)); shots.so ships a "noise" filter ([shots.so](https://shots.so/)) | Good as a *hero backdrop*, but apply grain in CSS/SVG, not baked into the bitmap (see section 4; grain kills AVIF compression). Keep gradient monochrome (`#0a0a0a` → `#1a1a1a`) with one lime bloom, never multicolour mesh (lime fights with it). |
| **Glassmorphism "2.0"** | Translucent panels + blur, cited as replacing flat UI ([Liquid Web](https://www.liquidweb.com/blog/website-aesthetics/), [Clay](https://clay.global/blog/web-design-guide/web-design-trends)) | Use sparingly: one glass card over the hero render at most. Full-glass UI reads 2022 and hurts contrast on `#0a0a0a`. |
| **Isometric UI tiles / bento grids** | Trend lists ([ekolsoft](https://ekolsoft.com/en/b/top-10-web-design-trends-2026)) | OK for 1:1 "capability" tiles (Chrome extension, PWA). Avoid for case-study covers; they look templated. |
| **Monochrome photography** | Craft/interaction-designer sites (e.g. [rauno.me](https://rauno.me/) is text-led: "Make it fast. Make it beautiful. Make it consistent.") | Only for the about/journey sections; desaturate and tint toward `#f5f5f4`. |
| **Playful 3D/WebGL** | Bruno Simon-style ([AdminLTE roundup](https://adminlte.io/?p=4294)) | Skip. Conflicts with "premium minimal" and with the LCP budget. |

Note: godly.website now 301-redirects to [recent.design](https://recent.design/?ref=godly), a general design feed; Awwwards' portfolio collection is the better live reference list.

### Recommendation
One system, two phases:
1. **Now:** monochrome abstract material renders (one lime accent element per image) for the 8 covers + a near-black grainy gradient hero rendered mostly in CSS.
2. **Later:** real screenshots at 2x in a CSS-drawn browser frame, same dark card. Because the frame is DOM, the swap is a file replacement with no re-composition.

---

## 2. Prompt library (Higgsfield)

### Model routing (verified from the live catalog this session)

| Job | Model id | Why | Key params |
|---|---|---|---|
| Abstract 3D / material renders (covers, about, hero) | `flux_2` (variant `pro`, resolution `2k`) or `seedream_v4_5` (`quality: high`, up to ~6K) | Strongest prompt adherence for abstract geometry; both `supports_unlim` | 16:9 / 1:1 / 21:9 |
| **Palette-locked** flat/vector art (skylines, OG backgrounds, tiles) | `recraft_v4_1` | Only model with `colors: ["#0a0a0a","#f5f5f4","#c9f55a"]` and `background_color` params; `model_type: "vector"` for line art, `"utility"` for flat mockup-style | 1:1, 16:9, 3:2 (no 16:10) |
| SVG output for skylines | `ideogram_vector` (`operation: generate`) | Real SVG, offers **16:10** and 2:1 | Export SVG, tint in CSS |
| Photoreal fallbacks / typography-free hero at 4K | `gpt_image_2_5` (default model; `quality: high`, `resolution: 2k/4k`, `background: transparent` available) or `nano_banana_pro` (default `2k`, up to `4k`) | 4K ceiling, transparent background for cut-outs | 16:9, 21:9, 2:1 not offered on gpt; nano has 21:9 |
| Seeded repeatability | `nano_banana_2_1` (`seed`), `ideogram_4_5` (`seed`, `batch_size` 1–4) | The only text-to-image models exposing `seed` | |
| Upscale | `topaz_image` (`variant: "CGI"` for renders, `output_width/height` required) or `bytedance_image_upscale` (`2k`/`4k`) | | |
| Reframe to 16:10 / 1200x630 | `flux_2_pro_outpaint` (per-side pixel expansion; negative values crop, all-crop is free) | Lets you generate 16:9 and extend to 16:10 or crop to 1.905:1 | |
| Cut-outs | `image_background_remover` | | |

Catalog facts that shape the prompts:
- **No model exposes a `negative_prompt` parameter.** Write exclusions as positive constraints inside the prompt ("no text, no letters, no logos, no people, no watermark"). Recraft's `colors` array is the only hard palette lock.
- **16:10 is not a native ratio** on flux/seedream/gpt/nano. Generate 16:9 at 2k (e.g. 2048x1152) and either crop width to 16:10 (1843x1152) or outpaint +115 px top/bottom. `ideogram_vector` and `recraft_v4_styles` (14:10) are the exceptions.
- **1200x630 OG (1.905:1):** generate 2:1 on `ideogram_4_5`/`flux_3_image`/`grok_image_2_0`, or 16:9 and crop 1200x630 from the center in sharp.
- `generate_image_batch` is for 2–12 independent prompts; `count` 1–4 is for variants of one prompt. `ms_image` has `batch_size` up to 20 but needs a Marketing Studio style and is ad-oriented; skip it.

### Style anchor (prepend to every prompt)

```
STYLE ANCHOR: ultra-minimal dark studio render. Background pure near-black #0a0a0a with
very subtle vignette. Materials: matte black glass, anodized charcoal metal, frosted
smoke. Palette strictly #0a0a0a, #f5f5f4 (soft off-white highlights), one small accent
in lime #c9f55a (a single edge-light, dot, or thin line). Soft diffused studio light from
top-left, long gentle falloff, faint reflections. Fine film grain. Shallow depth of field.
Lots of negative space. Centered composition, product-photography framing.
Absolutely no text, no letters, no numbers, no logos, no UI labels, no people, no hands,
no watermark, no gradient rainbow, no neon except the lime accent, no blue/purple tints.
```

Shorthand used below: `[ANCHOR]`.

### Hero / backdrop (16:9 → crop to 21:9 or use as full-bleed)

**P1. Hero gradient field** — `flux_2 pro 2k`, 21:9
`[ANCHOR] An abstract horizon of smoke-black fog over a flat obsidian plane; a single thin lime #c9f55a light line glows faintly along the horizon far right, 5% of frame width. Everything else is tonal black and charcoal. Extremely subtle, nearly monochrome, cinematic haze, no objects.`

**P2. Hero texture tile (seamless-ish)** — `recraft_v4_1 standard`, 1:1, `colors:["#0a0a0a","#141414","#f5f5f4"]`, `background_color:"#0a0a0a"`
`[ANCHOR] Macro close-up of brushed black metal surface, fine anisotropic micro-scratches, soft specular sweep from top-left, uniform, no edges, no objects, tileable texture.`

### 8 project covers (generate 16:9 @2k, crop/outpaint to 16:10)

**P3. ERP automation** — `flux_2 pro 2k`
`[ANCHOR] Eight identical matte-black cubes arranged in a precise 2x4 grid on a dark reflective floor, connected by hairline lime #c9f55a light channels running between them like circuit traces; one cube slightly lifted. Order, synchronization, systems.`

**P4. Google Ads / attribution dashboards** — `seedream_v4_5 high`
`[ANCHOR] Abstract bar chart made of frosted smoke-glass slabs rising from a black plane, heights ascending left to right; the tallest slab has a thin lime #c9f55a edge light. No axis labels, no numbers, purely sculptural data.`

**P5. SEO consolidation** — `flux_2 pro 2k`
`[ANCHOR] Many scattered thin charcoal glass shards converging and merging into one solid polished obsidian monolith at center; one lime #c9f55a hairline marks the seam where they fuse. Consolidation, many into one.`

**P6. PWA product catalogue** — `flux_2 pro 2k`
`[ANCHOR] A stack of thin rounded matte-black cards fanned out in perspective like a hand of cards, each card blank; the top card has a tiny lime #c9f55a dot in its corner. Soft shadows, catalogue of objects.`

**P7. Quiz platform** — `seedream_v4_5 high`
`[ANCHOR] Four identical smooth black spheres on a dark plane in a row; the third sphere is lit with a soft lime #c9f55a rim light, the others are unlit. A choice, a correct answer. Minimal, quiet.`

**P8. Chrome extension** — `flux_2 pro 2k`
`[ANCHOR] A small matte-black puzzle-piece-shaped block docking into a notch on the edge of a larger charcoal glass slab, thin lime #c9f55a light along the contact seam. Modular, snap-in, plug-in.`

**P9. AI cost estimator** — `flux_2 pro 2k`
`[ANCHOR] A polished obsidian balance scale abstracted to two floating discs connected by a hairline beam, one disc holding a single lime #c9f55a glowing pellet; gentle equilibrium, no text.`

**P10. WebWeaver** — `seedream_v4_5 high`
`[ANCHOR] A loose three-dimensional lattice of thin dark-grey filaments woven into a soft net floating in black space, one filament is lime #c9f55a and threads through the whole structure. Weaving, connecting, network.`

### About portrait placeholder (1:1, abstract, no face)

**P11.** — `flux_2 pro 2k`, 1:1
`[ANCHOR] A single tall matte-black rounded slab standing upright like a stele, half in shadow, one thin lime #c9f55a vertical edge light on its left side, faint off-white reflection on the floor. Portrait orientation feel within a square. No figure, no face, no silhouette.`

**P12. Alt:** `gpt_image_2_5 quality high, background: transparent`, 1:1
`[ANCHOR] A smooth charcoal sphere with a soft lime #c9f55a crescent rim light, isolated object on transparent background, product shot.` (then `image_background_remover` if edges are soft)

### Journey milestones: India / Singapore / Dubai (minimal line art)

Use `recraft_v4_1`, `model_type:"vector"`, `colors:["#f5f5f4","#c9f55a"]`, `background_color:"#0a0a0a"`, 3:2 (or `ideogram_vector` at 16:10 for true SVG).

**P13. India**
`Minimal single-weight line-art skyline, continuous thin off-white #f5f5f4 stroke on flat #0a0a0a background: Mumbai silhouette with Gateway of India arch, Bandra-Worli Sea Link cables, a few high-rises; one tiny lime #c9f55a dot marking a location pin. No text, no labels, no fill, no shading, no gradients, flat vector.`

**P14. Singapore**
`Minimal single-weight line-art skyline, thin off-white stroke on flat #0a0a0a: Marina Bay Sands three towers with skypark, ArtScience Museum lotus, Supertree Grove silhouettes; one lime #c9f55a dot location pin. No text, no fill, flat vector.`

**P15. Dubai**
`Minimal single-weight line-art skyline, thin off-white stroke on flat #0a0a0a: Burj Khalifa spire, Burj Al Arab sail, Museum of the Future torus, Dubai Frame; one lime #c9f55a dot location pin. No text, no fill, flat vector.`

### OG image backgrounds (text overlaid later via `next/og` / satori)

**P16. OG default** — `recraft_v4_1 utility`, 2:1 not available → use 16:9 then crop 1200x630; `colors:["#0a0a0a","#1a1a1a","#c9f55a"]`, `background_color:"#0a0a0a"`
`Flat near-black #0a0a0a background with an extremely soft large charcoal radial glow in the lower-right quadrant and a single thin lime #c9f55a horizontal rule in the lower-left third, 2px thick, 20% of width. Empty left two-thirds reserved for headline. No text, no objects.`

**P17. OG project variant** — `flux_2 pro 2k`, 16:9 → crop
`[ANCHOR] Right third of frame: a small matte-black geometric object (cube or sphere) with lime rim light; left two-thirds: empty black gradient for headline space. Strong left-to-right negative space.`

**P18. 1:1 capability tiles (icon-like)** — `recraft_v4_1 utility_vector`, 1:1, `colors:["#f5f5f4","#c9f55a"]`, `background_color:"#0a0a0a"`
`Single flat pictogram, two-tone off-white with one lime accent, centered, 60% of canvas, 2px stroke: {a browser window | a cloud with sync arrows | a bar chart | a puzzle piece | a calculator | a woven knot}. No text, flat vector, no shadow.`

### Consistency controls
- Run P3–P10 in one `generate_image_batch` call so they share model + `[ANCHOR]` wording; review as a contact sheet before upscaling.
- Prefer `seed` on `nano_banana_2_1` or `ideogram_4_5` if you need to re-roll one cover without drifting.
- After selection: `topaz_image variant "CGI"` to 2560x1600 (16:10) → sharp pipeline (section 4). Do not ask the model for "film grain" if you plan CSS grain; delete that clause from the anchor in that case.

---

## 3. Capturing real screenshots later

### Playwright recipe (verified option names/defaults)
- Context: `browser.newContext({ viewport: {width: 1440, height: 900}, deviceScaleFactor: 2, colorScheme: 'dark', reducedMotion: 'reduce' })`. Mobile: `devices['iPhone 15']` (393x852 @3x).
- `page.screenshot({ type: 'png', scale: 'device', fullPage: false, animations: 'disabled', caret: 'hide', mask: [dynamicLocators], style: '.cookie-banner,[data-nosnippet]{display:none!important}' })`. `scale` defaults to `"device"` (one pixel per device pixel), `fullPage` defaults to `false`, `type` supports `png|jpeg|webp`, `animations` defaults to `"allow"`, `caret` to `"hide"` ([Playwright Page API](https://playwright.dev/docs/api/class-page#page-screenshot), [Screenshots guide](https://playwright.dev/docs/screenshots)).
- Wait for `networkidle` **and** `await page.evaluate(() => document.fonts.ready)`; scroll once to trigger lazy content, then scroll back to top before capture.
- Standardise: covers = 1440x900 @2x (2880x1800, exactly 16:10); long case-study = `fullPage: true` at same viewport; mobile = iPhone 15 @3x. Keep a `shots.config.json` with URL, route, selectors to mask, and auth cookies.
- Output PNG (lossless source) into `/assets/src/screens/`; the sharp script handles compression.

### Framing options
1. **CSS/DOM frame in the site (recommended):** raw screenshot is the asset; a `BrowserFrame` component draws the chrome (3 dots, address pill, 1px `#f5f5f4/10` border, 12px radius, dark shadow). Smaller files, theme-aware, and the real screenshot swap is a drop-in. Off-the-shelf: `css-device-frames` (MIT, CSS custom props) or `react-device-frameset` (wraps Devices.css) ([npm css-device-frames](https://npmjs.com/package/css-device-frames), [react-device-frameset](https://github.com/cyclic-components/react-device-frameset), [picturepan2/devices.css](https://docsearch.algolia.com/mcp/docs/repo/picturepan2/devices.css)).
2. **Baked frame via sharp composite:** SVG rounded-rect chrome + drop shadow composited in the same script (deterministic, batchable, needed for OG images where there is no DOM).
3. **One-off tools:** shots.so (frames, "noise" filter, exports shown as 1x PNG, no API mentioned) ([shots.so](https://shots.so/)); Mockuuups Studio (5,200+ mockups, Figma plugin, **Mockup Generator API**) ([mockuuups.studio](https://mockuuups.studio/)). Fine for social posts, not for a reproducible pipeline.

---

## 4. Optimisation pipeline and Vercel decision

### Current Vercel facts (official docs, fetched today)
- Hobby included: **5K image transformations/month, 300K cache reads, 100K cache writes**; Fast Data Transfer 100 GB; CDN requests 1M ([Hobby plan](https://vercel.com/docs/plans/hobby-plan), [Image Optimization limits](https://vercel.com/docs/image-optimization/limits-and-pricing)). Raised from 3K/180K/60K on 7 Mar 2025 ([changelog](https://vercel.com/changelog/increased-hobby-usage-limits-for-image-optimization)). The "1,000 source images" figure is the **legacy** model ([legacy pricing](https://vercel.com/docs/image-optimization/legacy-pricing)).
- Over the limit on Hobby: new optimisations return **402**, `alt` text shows; already-cached images keep working; no charge. Hobby is non-commercial only.
- A transformation is billed per cache MISS/STALE; the key is project + `q` + `w` + content hash (local) or URL (remote) + normalised `Accept` ([reduce costs guide](https://vercel.com/kb/guide/reduce-image-optimization-costs-on-vercel)). Example from that guide: 2 formats x 2 qualities x 8 widths = up to 32 entries per image.
- Next.js 16 defaults: `qualities: [75]` (now required/locked), `formats: ['image/webp']`, `minimumCacheTTL: 14400` (4 h, up from 60 s), `deviceSizes [640,750,828,1080,1200,1920,2048,3840]`, `imageSizes [32,48,64,96,128,256,384]`; `priority` deprecated in favour of `preload`; `blurDataURL` auto-populated for static imports of jpg/png/webp/avif ([Next.js Image docs](https://nextjs.org/docs/app/api-reference/components/image)).

### Decision
A portfolio with ~20 images x 5 widths x 2 formats ≈ 200 transformations per content change, and local images are keyed by content hash so redeploys don't re-transform. **5K/month is not a constraint.** So:

- **Deliver with `next/image` + static imports** (free, CDN-cached, responsive srcset, auto blur). Config:
  ```ts
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1200, 1920, 2560],
    imageSizes: [256, 384, 512],
    qualities: [60, 75],
    minimumCacheTTL: 2678400, // 31 days
  }
  ```
- **Still run `scripts/optimize-images.mjs`**, but for what Vercel does not do: normalise sources to a 2560px max edge and strip metadata (keeps the 8192px/10MB limits far away and the repo small), emit **ThumbHash + tiny blurDataURL** into a manifest, write **OG PNG/JPEG at exactly 1200x630** (social crawlers do not negotiate AVIF; serve OG `unoptimized`), and produce the static AVIF/WebP variants so you can flip to `unoptimized`/`<picture>` or a custom `loaderFile` if you ever leave Vercel or hit the 402. Mark SVGs, icons and <10 KB assets `unoptimized` (per Vercel's guide).

### Encoding settings (sharp defaults verified: avif q50/effort4/4:4:4; webp q80/effort4; jpeg q80; png compressionLevel 6) ([sharp output API](https://sharp.pixelplumbing.com/api-output/))
- Photos/renders: AVIF `quality 50–58, effort 6, chromaSubsampling '4:2:0'`; WebP `quality 72–78, effort 6, smartSubsample true`. AVIF ≈ 50% smaller than JPEG at matched DSSIM vs ≈ 31% for WebP ([ctrl.blog](https://www.ctrl.blog/entry/webp-avif-comparison/)); a common equivalence is AVIF 50 ≈ WebP 65 ≈ JPEG 60 ([industrialempathy](https://www.industrialempathy.com/posts/avif-webp-quality-settings/)). Higher `effort` is not guaranteed smaller ([dev.to on sharp #3418](https://dev.to/serhii_kalyna_730b636889c/avif-encoding-speed-the-numbers-nobody-talks-about-a2h)); fix quality, measure bytes.
- UI screenshots (flat colour, sharp text): WebP `nearLossless: true` or `quality 85`; AVIF `quality 60, chromaSubsampling '4:4:4'` to keep text edges crisp. Use lossless (`png` palette or `webp lossless`) only for line-art skylines; or ship those as SVG from `ideogram_vector`.
- **Grain:** do not bake it. AVIF/WebP smooth noise and spend bytes fighting it. Overlay `<svg><filter><feTurbulence>` or a 256px tiled noise PNG (~2 KB) at 4–6% opacity via CSS `mix-blend-mode: overlay`. This alone is the difference between a 300 KB and a 110 KB hero.

### Budgets
- Hero (1920w AVIF): **< 150 KB**; target 90–120 KB with CSS grain.
- Project covers (card renders at 828w/1200w): **< 60 KB** each; abstract renders at AVIF q52 usually land 25–45 KB.
- OG JPEG 1200x630: < 200 KB (q 80, mozjpeg).
- blurDataURL: ≤ 300 bytes (ThumbHash ≈ 20–25 bytes raw, ~1 KB as PNG data URL; Next docs warn large blurDataURLs hurt). ThumbHash encodes aspect ratio, alpha and better colour than BlurHash; BlurHash's Base83 is not a valid `blurDataURL` without decoding ([ThumbHash](https://github.com/evanw/thumbhash), [LogRocket](https://blog.logrocket.com/improving-nextjs-app-performance-blurhash/), [basehub](https://basehub.com/changelog/all-about-images)).

### LCP under 1.2 s
web.dev's sub-part guidance: TTFB ~40%, resource load delay <10%, load duration ~40%, render delay <10% ([web.dev optimize-lcp](https://web.dev/articles/optimize-lcp)). At 1.2 s that leaves ~480 ms to download the LCP resource, which on Lighthouse's mobile throttle (~1.6 Mbps) is ~100 KB. Hence:
- **Prefer text-LCP.** Make the hero headline the LCP: `next/font` (self-hosted, `display: 'swap'`, preloaded, subset), hero background = CSS gradient + SVG noise, and the AI/screenshot hero image placed *below* or sized smaller than the headline block, with `fetchPriority="high"` but not `preload`. The image then never gates LCP.
- If an image must be LCP: `<Image preload sizes="100vw" fetchPriority="high" placeholder="blur">`, never `loading="lazy"`, keep it in initial HTML (no client-only mount), ≤ 100–150 KB at the served width. Only one `fetchpriority="high"` image per page ([Addy Osmani](https://addyosmani.com/blog/fetch-priority/)).
- Target thresholds: "good" LCP is ≤ 2.5 s; 1.2 s is an internal stretch goal, achievable on Vercel's CDN for static pages with text-LCP.

### `scripts/optimize-images.mjs` outline

```js
// scripts/optimize-images.mjs  — run: node scripts/optimize-images.mjs [--clean]
import sharp from 'sharp';
import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash';
import { globby } from 'globby';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const SRC = 'assets/src';            // originals: covers/, hero/, journey/, og/, screens/
const OUT = 'public/images';
const MANIFEST = 'lib/image-manifest.json';

const PROFILES = {
  hero:    { widths: [1280, 1920, 2560], avif: { quality: 54, effort: 6, chromaSubsampling: '4:2:0' }, webp: { quality: 74, effort: 6, smartSubsample: true }, budgetKB: 150 },
  cover:   { widths: [640, 828, 1200, 1600], avif: { quality: 52, effort: 6 }, webp: { quality: 72, effort: 6 }, budgetKB: 60, aspect: 16 / 10 },
  screen:  { widths: [828, 1200, 1600, 2400], avif: { quality: 60, effort: 6, chromaSubsampling: '4:4:4' }, webp: { nearLossless: true, quality: 85 }, budgetKB: 120 },
  tile:    { widths: [256, 512], avif: { quality: 55 }, webp: { quality: 78 }, budgetKB: 25, aspect: 1 },
  og:      { widths: [1200], jpeg: { quality: 80, mozjpeg: true }, fixed: [1200, 630], budgetKB: 200 },
};

const profileFor = (file) => PROFILES[path.basename(path.dirname(file)).replace(/s$/, '')] ?? PROFILES.cover;

async function placeholder(img) {
  const { data, info } = await img.clone().resize(100, 100, { fit: 'inside' })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });   // thumbhash needs ≤100x100 RGBA
  const hash = rgbaToThumbHash(info.width, info.height, data);
  return { thumbhash: Buffer.from(hash).toString('base64'), blurDataURL: thumbHashToDataURL(hash) };
}

async function processOne(file, manifest) {
  const buf = await readFile(file);
  const hash = createHash('sha1').update(buf).digest('hex').slice(0, 8);   // content hash → cache-busting + skip-if-unchanged
  const id = path.basename(file, path.extname(file));
  if (manifest[id]?.hash === hash && !process.argv.includes('--clean')) return;

  const p = profileFor(file);
  let img = sharp(buf).rotate();                                          // honour EXIF, then strip (default)
  const meta = await img.metadata();
  if (p.aspect) img = img.resize({ width: meta.width, height: Math.round(meta.width / p.aspect), fit: 'cover', position: 'attention' });
  if (p.fixed)  img = img.resize(p.fixed[0], p.fixed[1], { fit: 'cover', position: 'attention' });
  img = img.resize({ width: Math.min(meta.width, 2560), withoutEnlargement: true });   // normalise max edge

  const outDir = path.join(OUT, path.basename(path.dirname(file)));
  await mkdir(outDir, { recursive: true });
  const entry = { hash, width: 0, height: 0, variants: {}, ...(await placeholder(img)) };

  for (const w of p.widths) {
    const base = `${id}-${w}.${hash}`;
    const r = img.clone().resize({ width: w, withoutEnlargement: true });
    const formats = p.jpeg ? [['jpeg', p.jpeg]] : [['avif', p.avif], ['webp', p.webp]];
    for (const [fmt, opts] of formats) {
      const { data, info } = await r.clone()[fmt](opts).toBuffer({ resolveWithObject: true });
      await writeFile(path.join(outDir, `${base}.${fmt}`), data);
      (entry.variants[fmt] ??= []).push({ w: info.width, h: info.height, src: `/images/${path.basename(outDir)}/${base}.${fmt}`, kb: +(data.length / 1024).toFixed(1) });
      if (w === Math.max(...p.widths) && data.length / 1024 > p.budgetKB)
        console.warn(`! ${id} ${fmt}@${w} = ${(data.length/1024).toFixed(0)}KB > ${p.budgetKB}KB budget`);
      entry.width = Math.max(entry.width, info.width); entry.height = info.height;
    }
  }
  manifest[id] = entry;
}

const manifest = JSON.parse(await readFile(MANIFEST, 'utf8').catch(() => '{}'));
const files = await globby([`${SRC}/**/*.{png,jpg,jpeg,webp,avif,tif}`]);
for (const f of files) await processOne(f, manifest);               // sequential: AVIF effort 6 is CPU-heavy
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`✓ ${files.length} sources → ${OUT}; manifest ${MANIFEST}`);
```

Wiring notes:
- `package.json`: `"images": "node scripts/optimize-images.mjs"`, `"prebuild": "npm run images"`; commit `public/images` and the manifest so Vercel builds don't re-encode. Add `sharp`, `thumbhash`, `globby` as devDependencies.
- Component: `<Image src={m.variants.avif.at(-1).src} width={m.width} height={m.height} placeholder="blur" blurDataURL={m.blurDataURL} sizes="(min-width:1024px) 50vw, 100vw" />` — Vercel still generates the responsive set (within quota), and your pre-emitted widths are the self-hosted fallback via `<picture>` or a `loaderFile` that snaps `width` to the nearest manifest width.
- OG: `app/opengraph-image.tsx` reads `/images/og/*.jpeg` as the background layer and overlays text with `next/og`; set `unoptimized` on any direct OG `<img>`.

---

## 5. Higgsfield-specific tips

- **Models to use (from the live catalog):** `flux_2` (pro/flex/max, 1k/2k, `supports_unlim`), `seedream_v4_5` (basic ≤4K, high ≈6K, unlim), `seedream_v5_pro` (2K, has `remove_bg`), `gpt_image_2_5` (variants flare/sunburst, quality low→max, 1k/2k/4k, `background: transparent`), `nano_banana_pro` (default 2k, up to 4k, unlim), `nano_banana_2_1` (seed, 4:1/8:1 ultrawide ratios—useful for section dividers), `recraft_v4_1` (`colors` hex palette, `background_color`, vector/utility modes), `ideogram_vector` (true SVG, 16:10), `topaz_image`/`topaz_image_generative` (explicit output px, "CGI" variant), `bytedance_image_upscale` (2k/4k), `flux_2_pro_outpaint` (per-side px), `image_background_remover`, `image_decompose` (layer separation; handy to pull the lime accent onto its own layer).
- **Resolution ceilings:** 4K on gpt/nano pro/seedream 4.5/flux 3/cinema studio 2.5; 2K on flux_2, recraft, soul_2, kling, grok, ideogram. For 2560x1600 covers, generate 2k and Topaz-upscale rather than paying for 4K renders you downscale anyway.
- **Batch limits (MCP layer):** `generate_image_batch` = 2–12 independent prompts; `count` = 1–4 variants per prompt (capped to 1 under unlim). `flux_3_image`/`ideogram_4_5` add `batch_size` 1–4 per job.
- **Platform API behaviour (official docs):** limits are per account + per model and shown only in the console; over-concurrency requests are **queued**, a full queue returns **429 + Retry-After** (nothing charged); failed/nsfw jobs are not charged; **outputs are deleted after 7 days** — download immediately into `/assets/src` ([rate limits](https://docs.higgsfield.ai/docs/concepts/rate-limits.md), [billing and retention](https://docs.higgsfield.ai/docs/concepts/billing-and-retention.md), [images guide](https://docs.higgsfield.ai/docs/guides/images.md)). Use an `Idempotency-Key` on retries.
- **Unlim status this session:** `unlim.available: false`; several models are flagged `supports_unlim` but the allowance is not active right now, so the "unlimited credits" assumption should be checked with `show_plans_and_credits` before a 4K batch.
- **No negative prompts or style references on text-only routes:** rely on the `[ANCHOR]` block, Recraft's `colors`, and seeds (`nano_banana_2_1`, `ideogram_4_5`). For a reusable look, generate one approved cover, then feed it as `image_references` to `flux_2`/`seedream_v4_5` for the remaining seven to lock material and lighting.
- **Soul models** (`soul_2`, `soul_cinematic`) are tuned for people/fashion/UGC; skip them for this project except possibly the about section if you later want a stylised real portrait.

---

### Sources
- Vercel: [Image Optimization limits & pricing](https://vercel.com/docs/image-optimization/limits-and-pricing), [Hobby plan](https://vercel.com/docs/plans/hobby-plan), [Hobby image limits changelog](https://vercel.com/changelog/increased-hobby-usage-limits-for-image-optimization), [Reduce image optimization costs](https://vercel.com/kb/guide/reduce-image-optimization-costs-on-vercel), [Legacy pricing](https://vercel.com/docs/image-optimization/legacy-pricing)
- Next.js: [Image component (v16)](https://nextjs.org/docs/app/api-reference/components/image)
- Playwright: [Page API](https://playwright.dev/docs/api/class-page#page-screenshot), [Screenshots](https://playwright.dev/docs/screenshots)
- sharp: [Output options](https://sharp.pixelplumbing.com/api-output/)
- Formats: [ctrl.blog AVIF vs WebP DSSIM](https://www.ctrl.blog/entry/webp-avif-comparison/), [industrialempathy quality settings](https://www.industrialempathy.com/posts/avif-webp-quality-settings/), [AVIF encoding speed / effort](https://dev.to/serhii_kalyna_730b636889c/avif-encoding-speed-the-numbers-nobody-talks-about-a2h)
- Placeholders: [ThumbHash](https://github.com/evanw/thumbhash), [thumbhash demo/npm](https://evanw.github.io/thumbhash/), [LogRocket BlurHash + Next](https://blog.logrocket.com/improving-nextjs-app-performance-blurhash/), [basehub on image placeholders](https://basehub.com/changelog/all-about-images)
- LCP: [web.dev Optimize LCP](https://web.dev/articles/optimize-lcp), [Addy Osmani fetchpriority](https://addyosmani.com/blog/fetch-priority/)
- Device frames: [css-device-frames](https://npmjs.com/package/css-device-frames), [react-device-frameset](https://github.com/cyclic-components/react-device-frameset), [devices.css](https://docsearch.algolia.com/mcp/docs/repo/picturepan2/devices.css), [shots.so](https://shots.so/), [Mockuuups Studio](https://mockuuups.studio/)
- Design references: [Awwwards portfolio collection](https://www.awwwards.com/websites/portfolio/), [linear.app](https://linear.app/), [rauno.me](https://rauno.me/), [Scrimba minimal portfolios](https://scrimba.com/articles/minimal-web-developer-portfolio-examples/), [Colorlib developer portfolios](https://colorlib.com/wp/?p=340789), [Line25 2026 trends](https://line25.com/articles/web-design-trends-2026/), [Liquid Web aesthetics 2026](https://www.liquidweb.com/blog/website-aesthetics/), [Clay trends](https://clay.global/blog/web-design-guide/web-design-trends), [recent.design (godly redirect)](https://recent.design/?ref=godly)
- Higgsfield: [Rate limits](https://docs.higgsfield.ai/docs/concepts/rate-limits.md), [Billing & retention](https://docs.higgsfield.ai/docs/concepts/billing-and-retention.md), [Images guide](https://docs.higgsfield.ai/docs/guides/images.md), [Help center: Nano Banana](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-nano-banana); model parameters from `models_explore` in this session
