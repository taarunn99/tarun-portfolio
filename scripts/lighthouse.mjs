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
const URL = process.env.LH_URL ?? `http://localhost:${PORT}`;
const MIN = Number(process.env.LH_MIN ?? 100);
const RUNS = Math.max(1, Number(process.env.LH_RUNS ?? 1));
const OUT = path.join(root, "reports");
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const lighthouseBin = path.join(root, "node_modules", "lighthouse", "cli", "index.js");

function run(args, { quiet = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: quiet ? "ignore" : "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${args[0]} exited with ${code}`)),
    );
  });
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

async function audit(formFactor, runIndex) {
  const base = path.join(OUT, RUNS > 1 ? `${formFactor}-${runIndex}` : formFactor);
  const args = [
    lighthouseBin,
    URL,
    "--output=html",
    "--output=json",
    `--output-path=${base}`,
    `--only-categories=${CATEGORIES.join(",")}`,
    "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
    "--quiet",
  ];
  if (formFactor === "desktop") args.push("--preset=desktop");
  await run(args, { quiet: true });

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
  return { formFactor, scores, metrics, report: `${base}.report.html` };
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
    for (const formFactor of ["mobile", "desktop"]) {
      const runs = [];
      for (let i = 1; i <= RUNS; i++) runs.push(await audit(formFactor, i));
      results.push(median(runs));
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
  for (const { formFactor, scores, metrics, report } of results) {
    const line = CATEGORIES.map((c) => `${c} ${scores[c]}`).join("  ·  ");
    const ok = CATEGORIES.every((c) => scores[c] >= MIN);
    if (!ok) failed = true;
    console.log(`${ok ? "PASS" : "FAIL"}  ${formFactor.padEnd(8)} ${line}`);
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
