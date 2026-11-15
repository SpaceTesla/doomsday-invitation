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
