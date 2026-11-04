#!/usr/bin/env node
/**
 * Captures real screenshots of the live sites for case-study covers.
 * Uses the locally installed Google Chrome (no browser download).
 *
 *   npm run shots            # all targets → assets/src/screens/<id>.png
 *   npm run shots -- lapizblue-home 60newton-home
 */
import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "assets", "src", "screens");

/** id → url (+ optional selector to hide / scroll behaviour) */
const TARGETS = {
  "lapizblue-home": { url: "https://lapizblue.com" },
  "lapizblue-brands": { url: "https://lapizblue.com/brands" },
  "lapizblue-category": { url: "https://lapizblue.com/brands/mapei/waterproofing" },
  "60newton-home": { url: "https://60newton.com" },
  "60newton-disciplines": { url: "https://60newton.com/disciplines" },
  "60newton-location": { url: "https://60newton.com/disciplines/waterproofing/palm-jumeirah" },
  "gcbuae-home": { url: "https://gcbuae.com" },
  "gcbuae-quartz": { url: "https://gcbuae.com/kalingastone/quartz" },
  "gcbuae-sku": { url: "https://gcbuae.com/jaquar/faucets/aria" },
  "castedluxe-home": { url: "https://castedluxe.com" },
  "castedluxe-gallery": { url: "https://castedluxe.com/gallery" },
  "halfyearly-report": { url: "https://halfyearly-report.vercel.app" },
  "mapei-quiz": { url: "https://mapei-quiz.vercel.app" },
};

const HIDE = [
  "[class*='cookie']",
  "[id*='cookie']",
  "[class*='whatsapp-widget']",
  "[class*='WhatsAppWidget']",
  "iframe[src*='googletagmanager']",
].join(",");

async function capture(browser, id, target, { mobile = false } = {}) {
  const context = await browser.newContext({
    ...(mobile ? devices["iPhone 15"] : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }),
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "en-AE",
  });
  const page = await context.newPage();
  await page.addStyleTag({ content: `${HIDE}{display:none!important}` }).catch(() => {});
  await page.goto(target.url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: `${HIDE}{display:none!important}` });
  // Dismiss cookie banners (prefer the privacy-preserving option)
  for (const label of [/essentials only/i, /decline|reject|necessary/i, /i agree|accept/i]) {
    const btn = page.getByRole("button", { name: label }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
  }
  await page.evaluate(() => document.fonts.ready);
  // trigger lazy content, then return to the top
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 2);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  const file = path.join(OUT, `${id}${mobile ? "-mobile" : ""}.png`);
  await page.screenshot({ path: file, type: "png", fullPage: false, animations: "disabled", caret: "hide" });
  await context.close();
  return file;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const wanted = process.argv.slice(2);
  const ids = wanted.length ? wanted : Object.keys(TARGETS);
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const failures = [];
  try {
    for (const id of ids) {
      const target = TARGETS[id];
      if (!target) {
        console.warn(`unknown target ${id}`);
        continue;
      }
      try {
        const f = await capture(browser, id, target);
        console.log(`ok   ${path.relative(root, f)}`);
      } catch (e) {
        failures.push(id);
        console.warn(`FAIL ${id}: ${e.message.split("\n")[0]}`);
      }
    }
  } finally {
    await browser.close();
  }
  if (failures.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
