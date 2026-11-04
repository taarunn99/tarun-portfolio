#!/usr/bin/env node
/**
 * Audits the live site through Google's PageSpeed Insights API — the same
 * Lighthouse, run on Google's reference machines (default 4× CPU throttling),
 * which is what anyone checking the site will see. Fails if any category
 * drops below the threshold on either form factor.
 *
 *   PSI_API_KEY=… npm run lighthouse:psi
 *
 * Env:
 *   PSI_API_KEY  required — https://developers.google.com/speed/docs/insights/v5/get-started
 *   LH_URL       site origin (default https://tarun-portfolio-pearl.vercel.app)
 *   LH_PATHS     comma-separated paths (default "/")
 *   LH_MIN       minimum score per category (default 100)
 *   PSI_RETRIES  extra attempts for a run that lands below LH_MIN (default 1):
 *                lab runs are noisy by a point; a regression fails every time.
 */
const KEY = process.env.PSI_API_KEY;
if (!KEY) {
  console.error("PSI_API_KEY is not set.");
  process.exit(2);
}
const ORIGIN = (process.env.LH_URL ?? "https://tarun-portfolio-pearl.vercel.app").replace(/\/$/, "");
const PATHS = (process.env.LH_PATHS ?? "/").split(",").map((p) => p.trim()).filter(Boolean);
const MIN = Number(process.env.LH_MIN ?? 100);
const RETRIES = Math.max(0, Number(process.env.PSI_RETRIES ?? 1));
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

async function runPsi(url, strategy) {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url);
  api.searchParams.set("strategy", strategy);
  api.searchParams.set("key", KEY);
  for (const c of CATEGORIES) api.searchParams.append("category", c);
  const res = await fetch(api);
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(body.error?.message ?? `PSI ${res.status}`);
  const lhr = body.lighthouseResult;
  const scores = Object.fromEntries(
    CATEGORIES.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)]),
  );
  const a = lhr.audits;
  const metrics = {
    LCP: a["largest-contentful-paint"]?.displayValue,
    TBT: a["total-blocking-time"]?.displayValue,
    CLS: a["cumulative-layout-shift"]?.displayValue,
    SI: a["speed-index"]?.displayValue,
  };
  return { scores, metrics, benchmarkIndex: Math.round(lhr.environment?.benchmarkIndex ?? 0) };
}

let failed = false;
console.log(`PageSpeed Insights — ${ORIGIN}\n`);
for (const pathname of PATHS) {
  for (const strategy of ["mobile", "desktop"]) {
    let result;
    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      try {
        result = await runPsi(`${ORIGIN}${pathname}`, strategy);
      } catch (error) {
        console.error(`PSI request failed for ${strategy} ${pathname}: ${error.message}`);
        process.exit(2);
      }
      if (CATEGORIES.every((c) => result.scores[c] >= MIN)) break;
      if (attempt < RETRIES) console.log(`      retrying ${strategy} ${pathname} (${JSON.stringify(result.scores)})`);
    }
    const ok = CATEGORIES.every((c) => result.scores[c] >= MIN);
    if (!ok) failed = true;
    const line = CATEGORIES.map((c) => `${c.slice(0, 4)} ${result.scores[c]}`).join("  ·  ");
    console.log(`${ok ? "PASS" : "FAIL"}  ${strategy.padEnd(8)} ${pathname.padEnd(36)} ${line}`);
    console.log(
      `      ${Object.entries(result.metrics)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k} ${v}`)
        .join("  ·  ")}  ·  benchmarkIndex ${result.benchmarkIndex}\n`,
    );
  }
}
if (failed) {
  console.error(`One or more categories scored below ${MIN} on PageSpeed Insights.`);
  process.exit(1);
}
