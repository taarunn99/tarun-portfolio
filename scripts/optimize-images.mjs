#!/usr/bin/env node
/**
 * assets/src/<group>/<id>.{png,jpg,webp} → public/images/<group>/<id>-<w>.<hash>.{avif,webp}
 * + src/lib/images/manifest.json (src, width, height, blurDataURL (thumbhash), variants).
 *
 *   npm run images            # only changed sources (content hash)
 *   npm run images -- --clean # everything
 *
 * Profiles are chosen by group folder: screens (UI screenshots), covers (renders),
 * scenes (large backdrops), layers (transparent PNG layers), og (1200x630 JPEG).
 */
import sharp from "sharp";
import fg from "fast-glob";
import { rgbaToThumbHash } from "thumbhash";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "assets", "src");
const OUT = path.join(root, "public", "images");
const MANIFEST = path.join(root, "src", "lib", "images", "manifest.json");
const clean = process.argv.includes("--clean");

const PROFILES = {
  screens: { widths: [640, 960, 1440, 2048], aspect: 16 / 10, avif: { quality: 58, effort: 6, chromaSubsampling: "4:4:4" }, webp: { quality: 78, effort: 6, smartSubsample: true }, budgetKB: 220 },
  covers: { widths: [640, 960, 1440, 2048], aspect: 16 / 10, avif: { quality: 52, effort: 6 }, webp: { quality: 72, effort: 6 }, budgetKB: 90 },
  scenes: { widths: [960, 1440, 2048, 2560], aspect: null, avif: { quality: 54, effort: 6 }, webp: { quality: 74, effort: 6 }, budgetKB: 220 },
  layers: { widths: [1024, 2048], aspect: null, avif: null, webp: { quality: 80, effort: 6, alphaQuality: 90 }, png: true, budgetKB: 250 },
  og: { widths: [1200], fixed: [1200, 630], jpeg: { quality: 80, mozjpeg: true }, budgetKB: 200 },
};

/** ≤ ~400 B placeholder: a 16-px WebP (thumbhash kept for the record in `thumbhash`). */
async function placeholder(img) {
  const tiny = await img.clone().resize(16, 16, { fit: "inside" }).webp({ quality: 40, alphaQuality: 40 }).toBuffer();
  const { data, info } = await img.clone().resize(100, 100, { fit: "inside" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const hash = rgbaToThumbHash(info.width, info.height, data);
  return { blurDataURL: `data:image/webp;base64,${tiny.toString("base64")}`, thumbhash: Buffer.from(hash).toString("base64") };
}

async function processOne(file, manifest) {
  const group = path.basename(path.dirname(file));
  const profile = PROFILES[group] ?? PROFILES.covers;
  const id = path.basename(file, path.extname(file));
  const buf = await readFile(file);
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 8);
  if (!clean && manifest[id]?.hash === hash) return "skip";

  let img = sharp(buf).rotate();
  const meta = await img.metadata();
  let width = meta.width ?? 0;
  let height = meta.height ?? 0;

  if (profile.fixed) {
    img = img.resize(profile.fixed[0], profile.fixed[1], { fit: "cover", position: "top" });
    [width, height] = profile.fixed;
  } else if (profile.aspect) {
    const targetH = Math.round(width / profile.aspect);
    if (targetH <= height) {
      img = img.extract({ left: 0, top: 0, width, height: targetH });
      height = targetH;
    }
  }
  const maxW = Math.min(width, 2560);
  if (maxW < width) {
    img = img.resize({ width: maxW, withoutEnlargement: true });
    height = Math.round((height * maxW) / width);
    width = maxW;
  }

  const outDir = path.join(OUT, group);
  await mkdir(outDir, { recursive: true });
  const entry = { hash, width, height, src: "", ...(await placeholder(img)), variants: {} };
  const warnings = [];

  for (const w of profile.widths.filter((w) => w <= width || w === profile.widths[0])) {
    const resized = img.clone().resize({ width: Math.min(w, width), withoutEnlargement: true });
    const formats = profile.jpeg
      ? [["jpeg", profile.jpeg]]
      : [profile.avif ? ["avif", profile.avif] : null, ["webp", profile.webp], profile.png ? ["png", { compressionLevel: 9, palette: false }] : null].filter(Boolean);
    for (const [fmt, opts] of formats) {
      const { data, info } = await resized.clone()[fmt](opts).toBuffer({ resolveWithObject: true });
      const name = `${id}-${info.width}.${hash}.${fmt}`;
      await writeFile(path.join(outDir, name), data);
      const src = `/images/${group}/${name}`;
      (entry.variants[fmt] ??= []).push({ w: info.width, src });
      const kb = data.length / 1024;
      if (info.width === Math.max(...profile.widths.filter((x) => x <= width)) && kb > profile.budgetKB && fmt !== "png") {
        warnings.push(`${id} ${fmt}@${info.width} = ${kb.toFixed(0)} KB > ${profile.budgetKB} KB`);
      }
    }
  }
  // Primary src: largest webp (universally decodable; next/image negotiates avif anyway), or jpeg/png.
  const primary = entry.variants.webp?.at(-1) ?? entry.variants.jpeg?.at(-1) ?? entry.variants.png?.at(-1);
  entry.src = primary.src;
  manifest[id] = entry;
  return warnings.length ? `warn: ${warnings.join("; ")}` : "ok";
}

async function main() {
  const manifest = clean ? {} : JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "{}"));
  if (clean) await rm(OUT, { recursive: true, force: true });
  const files = await fg(["**/*.{png,jpg,jpeg,webp}"], { cwd: SRC, absolute: true });
  let warned = false;
  for (const f of files) {
    const r = await processOne(f, manifest);
    if (r.startsWith("warn")) warned = true;
    if (r !== "skip") console.log(`${r.padEnd(4)} ${path.relative(root, f)}`);
  }
  // drop manifest entries whose source vanished
  const ids = new Set(files.map((f) => path.basename(f, path.extname(f))));
  for (const id of Object.keys(manifest)) if (!ids.has(id)) delete manifest[id];
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`✓ ${files.length} sources → public/images, manifest ${Object.keys(manifest).length} entries${warned ? " (budget warnings above)" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
