// Render key frames of the review sketches (stages/*.html) to frames/*.jpg.
// Each sequence is frozen at the listed times, so a frame shows exactly what the playable
// sketch shows at that moment. Run from web/ (it uses web/'s Playwright):
//   node ../design/explorations/creative-refinement-1/source/render.mjs [filter]
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const { chromium } = createRequire(join(process.cwd(), "package.json"))("@playwright/test");

const here = dirname(fileURLToPath(import.meta.url));
const stages = resolve(here, "..", "stages");
const out = resolve(here, "..", "frames");
mkdirSync(out, { recursive: true });
const filter = process.argv[2] ?? "";

const VIEW = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } };

// [file, view, query, name, times (seconds) or null for a still]
const JOBS = [];
for (const v of ["phone", "desktop"]) {
  const top = v === "phone" ? 0 : 0;
  const read = v === "phone" ? 360 : 300;
  JOBS.push(
    ["council.html", v, `s=arrival&y=${top}`, `council-arrival-${v}`, [0.05, 0.9, 1.6, 2.2, 3.2]],
    ["council.html", v, `s=step1&y=${top}`, `council-step1-top-${v}`, null],
    ["council.html", v, `s=step1&y=${read}`, `council-step1-read-${v}`, null],
    ["council.html", v, `s=approve&y=${read}`, `council-approve-${v}`, [0.2, 0.75, 1.6]],
    ["council.html", v, `s=step2&y=${read}`, `mantle-step2-${v}`, null],
    ["council.html", v, `s=claim&y=${read}`, `mantle-claim-${v}`, [0.25, 0.7, 1.35, 2.2, 3.4]],
    ["council.html", v, `s=yours&y=${read}`, `mantle-yours-${v}`, null],
    ["council.html", v, `s=step3&y=${read}`, `council-step3-${v}`, null],
    ["council.html", v, `s=decree&y=${v === "phone" ? 476 : 330}`, `decree-${v}`, [0.6, 1.2, 1.9, 2.6, 3.6, 4.8]],
    ["summons.html", v, "", `doors-${v}`, [0.1, 0.65, 1.15, 1.6, 2.1, 2.6, 3.1, 3.7, 4.6]],
    ["closing.html", v, "s=closing", `closing-${v}`, null],
    ["closing.html", v, "s=daypassed", `daypassed-${v}`, null],
    ["closing.html", v, "s=invalid", `invalid-${v}`, null],
  );
}

const browser = await chromium.launch();
for (const [file, v, query, name, times] of JOBS) {
  if (filter && !name.includes(filter)) continue;
  const page = await browser.newPage({ viewport: VIEW[v] });
  const url = pathToFileURL(join(stages, file)).href + `?v=${v}${query ? "&" + query : ""}`;
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  if (!times) {
    await page.evaluate(() => window.freezeAt && window.freezeAt(99));
    await page.screenshot({ path: join(out, `${name}.jpg`), quality: 84, type: "jpeg" });
  } else {
    for (const t of times) {
      await page.evaluate((s) => window.freezeAt(s), t);
      await page.waitForTimeout(60);
      await page.screenshot({ path: join(out, `${name}-${String(Math.round(t * 100)).padStart(3, "0")}.jpg`), quality: 84, type: "jpeg" });
    }
  }
  await page.close();
  console.log("rendered", name);
}
await browser.close();
