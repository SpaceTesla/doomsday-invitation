import { expect, test, type Page } from "@playwright/test";
import { seed } from "./seed";

// Performance under phone-like conditions (docs/PRODUCT_SPEC.md, 5.3; design/DESIGN.md,
// 6.11): a slow 4G connection and a CPU four times slower. Budgets: first scene within
// 2.5 s (largest contentful paint), layout shift under 0.1, a tap answered within 200 ms,
// and only the first scene's files before the guest's first action.

const SLOW_4G = {
  offline: false,
  latency: 150,
  downloadThroughput: 200_000,
  uploadThroughput: 94_000,
};

async function throttle(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", SLOW_4G);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}

async function vitals(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ lcp: number; cls: number }>((resolve) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) lcp = Math.max(lcp, entry.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve({ lcp, cls }), 1500);
      }),
  );
}

function bytesByKind(page: Page) {
  const seen: { url: string; bytes: number; type: string }[] = [];
  page.on("response", async (response) => {
    const url = new URL(response.url());
    const length = Number(response.headers()["content-length"] ?? 0);
    let bytes = length;
    if (!bytes) bytes = (await response.body().catch(() => Buffer.alloc(0))).length;
    seen.push({ url: url.pathname, bytes, type: response.request().resourceType() });
  });
  return seen;
}

test("the opening, on a slow phone connection", async ({ page }, info) => {
  test.slow();
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  const files = bytesByKind(page);
  await throttle(page);
  await page.goto(links.Anish, { waitUntil: "load" });
  const { lcp, cls } = await vitals(page);

  const total = files.reduce((sum, f) => sum + f.bytes, 0);
  const kinds = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + f.bytes;
    return acc;
  }, {});
  const report = `${info.project.name}: LCP ${Math.round(lcp)} ms, CLS ${cls.toFixed(3)}, ${Math.round(total / 1024)} KB before the first action ${JSON.stringify(
    Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, Math.round(v / 1024)])),
  )}`;
  console.log(report);
  await info.attach("vitals", { body: report });

  expect(lcp).toBeLessThan(2500);
  expect(cls).toBeLessThan(0.1);
  // Nothing beyond the first scene: no audio, no hall, no summons plate.
  expect(files.filter((f) => /\/audio\/|hall-|summons-/.test(f.url))).toEqual([]);
  // Only one of the two compositions is fetched.
  const sets = new Set(
    files.filter((f) => /hero-[dp]-/.test(f.url)).map((f) => f.url.match(/hero-([dp])-/)![1]),
  );
  expect(sets.size).toBe(1);
});

test("a tap is answered within 200 ms, even while the reveal plays", async ({ page }) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  await page.goto(links.Anish);
  await expect(page.locator(".op")).toHaveAttribute("data-motion", "playing");
  await throttle(page);
  // Measure how long the main thread takes to handle a key press during the reveal.
  const delay = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const start = performance.now();
        window.addEventListener(
          "keydown",
          () => requestAnimationFrame(() => resolve(performance.now() - start)),
          {
            once: true,
            capture: true,
          },
        );
        window.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      }),
  );
  expect(delay).toBeLessThan(200);
  await expect(page.locator(".op")).toHaveAttribute("data-motion", "done");
});
