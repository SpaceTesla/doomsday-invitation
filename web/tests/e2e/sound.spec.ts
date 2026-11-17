import { expect, test, type Page } from "@playwright/test";
import { seed } from "./seed";

// Sound (milestone 5): nothing loads or plays before the guest's first action; silent
// mode loads nothing at all; the control after the opening says what state it is in.

function audioRequests(page: Page) {
  const seen: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/audio/")) seen.push(path);
  });
  return seen;
}

test("nothing loads before the first action, and 'Go with him' turns sound on", async ({
  page,
}) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  const audio = audioRequests(page);
  await page.goto(links.Anish);
  await page.waitForTimeout(1500);
  expect(audio).toEqual([]);
  // No sound control during the opening.
  await expect(page.getByRole("button", { name: /^SOUND (ON|OFF)$/ })).toHaveCount(0);

  await page.getByRole("button", { name: "GO WITH HIM" }).click();
  await expect(page.locator(".sm-name")).toBeAttached();
  await expect.poll(() => audio.length).toBeGreaterThan(0);
  expect(audio.every((path) => /\/audio\/[a-z-]+\.(webm|mp3)$/.test(path))).toBe(true);
  const control = page.getByRole("button", { name: "SOUND ON" });
  await expect(control).toBeVisible();
  await expect(control).toHaveAttribute("aria-pressed", "true");

  await control.click();
  await expect(page.getByRole("button", { name: "SOUND OFF" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

/** Record every sound the page starts: when, which buffer length, and at what audio time. */
async function recordSounds(page: Page) {
  await page.addInitScript(() => {
    const log: { at: number; length: number; when: number }[] = [];
    (window as unknown as { __sounds: typeof log }).__sounds = log;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (when?: number, ...rest: number[]) {
      log.push({ at: performance.now(), length: this.buffer?.duration ?? 0, when: when ?? 0 });
      return start.call(this, when, ...rest);
    };
  });
  return () =>
    page.evaluate(
      () =>
        (window as unknown as { __sounds: { at: number; length: number; when: number }[] })
          .__sounds,
    );
}

test("the first scene change is heard, the runes tick in turn, and SOUND OFF stops everything", async ({
  page,
}) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  const sounds = await recordSounds(page);
  await page.goto(links.Anish);
  await expect(page.locator(".op")).toHaveAttribute("data-motion", /done|still/, {
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "GO WITH HIM" }).click();
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "done", {
    timeout: 15_000,
  });
  const heard = (await sounds()).filter((s) => s.length > 0.01);
  // The iris's ratchet (0.9 s) is heard on the very first scene change.
  expect(heard.some((s) => Math.abs(s.length - 0.9) < 0.05)).toBe(true);
  // The rune ticks (0.08 s) are spaced on the audio clock, not all at one instant.
  const ticks = heard.filter((s) => Math.abs(s.length - 0.08) < 0.01).map((s) => s.when);
  expect(ticks.length).toBeGreaterThan(10);
  const gaps = ticks.slice(1).map((t, i) => t - ticks[i]);
  expect(Math.min(...gaps)).toBeGreaterThan(0.05);
  // The rising hum (2.2 s) is gone.
  expect(heard.some((s) => Math.abs(s.length - 2.2) < 0.05)).toBe(false);
  // The score's drone (64 s) has begun under the summons.
  await expect
    .poll(async () => (await sounds()).some((s) => Math.abs(s.length - 64) < 0.5), {
      timeout: 15_000,
    })
    .toBe(true);

  await page.getByRole("button", { name: "SOUND ON" }).click();
  await page.waitForTimeout(600);
  const before = (await sounds()).length;
  await page.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
  await page.waitForTimeout(1500);
  expect((await sounds()).length).toBe(before);
});

test("'Go without sound' loads no audio at all, and silence loses nothing", async ({ page }) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  const audio = audioRequests(page);
  await page.goto(links.Anish);
  await page.getByRole("button", { name: "GO WITHOUT SOUND" }).click();
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", /done|still/, {
    timeout: 8000,
  });
  await page.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
  await page.waitForTimeout(1000);
  expect(audio).toEqual([]);
  await expect(page.getByRole("button", { name: "SOUND OFF" })).toBeVisible();
});
