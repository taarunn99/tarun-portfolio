#!/usr/bin/env node
/**
 * Runs Lighthouse (mobile + desktop) against the production build and fails
 * if any category drops below the threshold.
 *
 *   npm run build && npm run lighthouse
 *
 * Env:
 *   LH_URL   audit an already-running URL instead of starting `next start`
 *   LH_PORT  port for the local server (default 3100)
 *   LH_MIN   minimum acceptable score per category (default 100)
 *   LH_RUNS  runs per form factor; the median performance run is kept (default 1)
 *
 * Reports land in ./reports/{mobile,desktop}.report.{html,json}
 */
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.LH_PORT ?? 3100);
const URL = (process.env.LH_URL ?? `http://localhost:${PORT}`).replace(/\/$/, "");
const PATHS = (process.env.LH_PATHS ?? "/").split(",").map((p) => p.trim()).filter(Boolean);
const MIN = Number(process.env.LH_MIN ?? 100);
const RUNS = Math.max(1, Number(process.env.LH_RUNS ?? 1));
/**
 * CPU throttling. Lighthouse's default 4× is the standard every report you will
 * be compared against uses (PageSpeed Insights, DevTools), so leave it alone for
 * gating. `LH_CPU=auto` applies the Lighthouse team's calculator formula
 * (lighthouse-cpu-throttling-calculator.vercel.app) to the machine's
 * BenchmarkIndex to emulate a Moto G4-class device instead; `LH_CPU=2.5` sets
 * it directly. Caveat: BenchmarkIndex is a tight loop and overstates shared
 * CI vCPUs, which evaluate real bundles far slower than their index suggests.
 */
const CPU = process.env.LH_CPU ?? "";
const OUT = path.join(root, "reports");
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const lighthouseBin = path.join(root, "node_modules", "lighthouse", "cli", "index.js");

/** Runs a node script; in quiet mode its output is buffered and surfaced only on failure. */
function run(args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: quiet ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let tail = "";
    const collect = (chunk) => {
      tail = (tail + chunk.toString()).slice(-4000);
    };
    child.stdout?.on("data", collect);
    child.stderr?.on("data", collect);
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${path.basename(args[0])} exited with ${code}\n${tail.trim()}`)),
    );
  });
}

/**
 * Lighthouse lab runs occasionally die before producing a score — on CI runners
 * typically "NO_NAVSTART" (headless Chrome's trace missed navigationStart under
 * load). Retrying keeps the gate honest without being flaky; a real regression
 * fails every attempt.
 */
async function runWithRetry(args, options, attempts = 3) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await run(args, options);
    } catch (error) {
      lastError = error;
      if (i < attempts) console.warn(`Lighthouse attempt ${i} failed, retrying…\n${error.message}`);
    }
  }
  throw lastError;
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not become reachable at ${url}`);
}

let cpuMultiplier = null;

/** The Lighthouse team's calculator: multiplier that makes this machine emulate a mid-tier (Moto G4-class) phone. */
function officialMultiplier(index) {
  if (index >= 1300) return 3 + (index - 1300) / 233;
  if (index >= 800) return 2 + (index - 800) / 500;
  if (index >= 150) return 1 + (index - 150) / 650;
  return 1;
}

/** Reads BenchmarkIndex from a minimal Lighthouse run and derives the multiplier. */
async function calibrateCpu() {
  if (!CPU) return null;
  if (CPU !== "auto") return Number(CPU);
  const probe = path.join(OUT, "_probe");
  await run([lighthouseBin, `${URL}${PATHS[0]}`, "--only-audits=viewport", "--output=json", `--output-path=${probe}.report.json`,
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage", "--quiet"], { quiet: true });
  const lhr = JSON.parse(await readFile(`${probe}.report.json`, "utf8"));
  const index = lhr.environment?.benchmarkIndex ?? 1500;
  const multiplier = +officialMultiplier(index).toFixed(2);
  console.log(`CPU calibration: benchmarkIndex ${Math.round(index)} → cpuSlowdownMultiplier ${multiplier}`);
  return multiplier;
}

function slugify(pathname) {
  return pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-");
}

async function audit(pathname, formFactor, runIndex) {
  const name = `${slugify(pathname)}-${formFactor}${RUNS > 1 ? `-${runIndex}` : ""}`;
  const base = path.join(OUT, name);
  const args = [
    lighthouseBin,
    `${URL}${pathname}`,
    "--output=html",
    "--output=json",
    `--output-path=${base}`,
    `--only-categories=${CATEGORIES.join(",")}`,
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
  ];
  if (formFactor === "desktop") args.push("--preset=desktop");
  if (cpuMultiplier && formFactor === "mobile") args.push(`--throttling.cpuSlowdownMultiplier=${cpuMultiplier}`);
  await runWithRetry(args, { quiet: true });

  const lhr = JSON.parse(await readFile(`${base}.report.json`, "utf8"));
  const scores = Object.fromEntries(
    CATEGORIES.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)]),
  );
  const metrics = {
    LCP: lhr.audits["largest-contentful-paint"]?.displayValue,
    FCP: lhr.audits["first-contentful-paint"]?.displayValue,
    TBT: lhr.audits["total-blocking-time"]?.displayValue,
    CLS: lhr.audits["cumulative-layout-shift"]?.displayValue,
    SI: lhr.audits["speed-index"]?.displayValue,
  };
  return { pathname, formFactor, scores, metrics, report: `${base}.report.html` };
}

function median(results) {
  const sorted = [...results].sort((a, b) => a.scores.performance - b.scores.performance);
  return sorted[Math.floor(sorted.length / 2)];
}

async function main() {
  await mkdir(OUT, { recursive: true });

  let server;
  if (!process.env.LH_URL) {
    server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
      cwd: root,
      stdio: "ignore",
      detached: process.platform !== "win32",
    });
    await waitForServer(URL);
  }

  const results = [];
  let failed = false;

  try {
    cpuMultiplier = await calibrateCpu();
    for (const pathname of PATHS) {
      for (const formFactor of ["mobile", "desktop"]) {
        const runs = [];
        for (let i = 1; i <= RUNS; i++) runs.push(await audit(pathname, formFactor, i));
        results.push(median(runs));
      }
    }
  } finally {
    if (server) {
      try {
        if (process.platform === "win32") server.kill();
        else process.kill(-server.pid, "SIGTERM");
      } catch {
        /* already gone */
      }
    }
  }

  console.log(`\nLighthouse — ${URL}\n`);
  for (const { pathname, formFactor, scores, metrics, report } of results) {
    const line = CATEGORIES.map((c) => `${c.slice(0, 4)} ${scores[c]}`).join("  ·  ");
    const ok = CATEGORIES.every((c) => scores[c] >= MIN);
    if (!ok) failed = true;
    console.log(`${ok ? "PASS" : "FAIL"}  ${formFactor.padEnd(8)} ${pathname.padEnd(36)} ${line}`);
    console.log(
      `      ${Object.entries(metrics)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k} ${v}`)
        .join("  ·  ")}`,
    );
    console.log(`      ${path.relative(root, report)}\n`);
  }

  if (failed) {
    console.error(`One or more categories scored below ${MIN}.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
