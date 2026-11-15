import { expect, test, type Page } from "@playwright/test";
import { seed } from "./seed";

// The opening and the transitions (milestone 4): the reveal ends on the approved final
// frame, any key skips to it, reduced motion shows it at once, the opening plays once,
// and the scene changes always settle with nothing left covering the page.

const finalFrame = (page: Page) =>
  page.evaluate(() => {
    const q = (s: string) => document.querySelector(s) as HTMLElement;
    return {
      motion: q(".op").dataset.motion,
      rubble: getComputedStyle(q(".op-rock--top")).transform,
      lit: getComputedStyle(q(".op-fig--lit")).opacity,
      actions: getComputedStyle(q(".op-act")).clipPath,
    };
  });

const identity = (transform: string) =>
  transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";

test("with reduced motion the opening shows its final frame at once", async ({ page }) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(links.Anish);
  await expect.poll(async () => (await finalFrame(page)).motion, { timeout: 2000 }).toBe("done");
  const state = await finalFrame(page);
  expect(identity(state.rubble)).toBe(true);
  expect(state.lit).toBe("1");
  await expect(page.getByRole("button", { name: "GO WITH HIM" })).toBeVisible();
});

test("the reveal plays, and any key skips to the final frame", async ({ page }) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  await page.goto(links.Anish);
  await expect.poll(async () => (await finalFrame(page)).motion).toBe("playing");
  const playing = await finalFrame(page);
  expect(identity(playing.rubble)).toBe(false);
  expect(playing.lit).toBe("0");

  await page.keyboard.press("Space");
  await expect.poll(async () => (await finalFrame(page)).motion).toBe("done");
  const skipped = await finalFrame(page);
  expect(identity(skipped.rubble)).toBe(true);
  expect(skipped.lit).toBe("1");
  expect(skipped.actions).toMatch(/^inset\(0(%|px)?\)$/);
});

test("the opening plays once: after it, the link opens on the summons", async ({ page }) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(links.Anish);
  await expect.poll(async () => (await finalFrame(page)).motion).toBe("done");
  // The record is sent when the opening ends; give it a moment to land.
  await expect
    .poll(async () => {
      await page.reload();
      return page.locator(".sm-name").count();
    })
    .toBe(1);
});

test("the summons settles, and changing scene leaves nothing covering the page", async ({
  page,
}) => {
  const links = await seed([{ name: "Ravi", title: "Dr.", state: "summons" }]);
  await page.goto(links.Ravi);
  // The vault door opens and closes, then the seal wakes.
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "done", { timeout: 8000 });
  await expect(page.locator(".sm-doors")).toHaveCount(0);
  await expect(page.locator(".sm-seal svg g.seal")).toHaveAttribute("class", "seal seal--active");

  await page.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
  await expect
    .poll(() => page.locator(".iris").evaluate((el) => getComputedStyle(el).visibility))
    .toBe("hidden");
});

test("with reduced motion the summons and the scene change are plain fades", async ({ page }) => {
  const links = await seed([{ name: "Ravi", title: "Dr.", state: "summons" }]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(links.Ravi);
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "still");
  await expect(page.locator(".sm-doors")).toHaveCount(0);
  await expect(page.locator(".sm-seal svg g.seal")).toHaveAttribute("class", "seal seal--active");
  await page.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
  await expect
    .poll(() => page.locator(".iris").evaluate((el) => getComputedStyle(el).visibility))
    .toBe("hidden");
});
