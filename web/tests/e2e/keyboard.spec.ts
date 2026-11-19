import { expect, test, type Page } from "@playwright/test";
import { E2E_ORGANIZER } from "./constants";
import { seed, YEAR } from "./seed";

// The whole journey by keyboard alone, with focus always visible (docs/PRODUCT_SPEC.md,
// 5.4; design/DESIGN.md, 10, item 19). No mouse, no programmatic clicks.

test.use({ reducedMotion: "reduce", locale: "en-US" });

/**
 * Press Tab (or Shift+Tab, going back) until the focused element has this accessible
 * name; check its focus is visible.
 */
async function tabTo(page: Page, name: string | RegExp, { limit = 80, back = false } = {}) {
  for (let i = 0; i < limit; i += 1) {
    await page.keyboard.press(back ? "Shift+Tab" : "Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const label =
        el.getAttribute("aria-label") ??
        (el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent : null) ??
        el.textContent ??
        "";
      const style = getComputedStyle(el);
      return {
        label: label.replace(/\s+/g, " ").trim(),
        outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0,
      };
    });
    if (focused && (typeof name === "string" ? focused.label === name : name.test(focused.label))) {
      expect(focused.outline, `focus on "${focused.label}" is visible`).toBe(true);
      return;
    }
  }
  throw new Error(`Could not reach "${name}" with Tab`);
}

test("a guest goes from the opening to the council and takes part, by keyboard", async ({
  page,
}) => {
  const links = await seed([
    { name: "Anish", title: "Mr." },
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor" },
  ]);
  await page.goto(links.Anish);
  await expect(page.locator(".op")).toHaveAttribute("data-motion", "done");

  await tabTo(page, "GO WITHOUT SOUND");
  await page.keyboard.press("Enter");
  await expect(page.locator(".sm-name")).toBeVisible();

  await tabTo(page, "TAKE YOUR SEAT");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();

  // Step one: approving moves the guest on to the mantles.
  await tabTo(page, "APPROVE");
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Choose your mantle" })).toBeVisible();

  // A finished step reopens from the step header.
  await tabTo(page, /^1\s*PROPOSAL/, { back: true });
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "APPROVED" })).toBeVisible();

  await tabTo(page, "PROPOSE ANOTHER");
  await page.keyboard.press("Enter");
  // The entry opens with its first field focused.
  await expect(page.getByRole("textbox", { name: "DAY" })).toBeFocused();
  await page.keyboard.type(`0109${YEAR}`);
  // The date field has segments of its own; Tab on until the hour field has focus.
  await tabTo(page, "HOUR");
  await expect(page.getByRole("textbox", { name: "DAY" })).toHaveValue(`${YEAR}-01-09`);
  for (let i = 0; i < 73; i += 1) await page.keyboard.press("ArrowDown"); // 18:00
  await expect(page.getByRole("combobox", { name: "HOUR" })).toHaveValue("18:00");
  await tabTo(page, "SET IT BEFORE DOOM");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Your alternative is before Doom.")).toBeVisible();
  await tabTo(page, "CONTINUE");
  await page.keyboard.press("Enter");

  // Step two: the search narrows the mantles; claiming one moves on to the council.
  await tabTo(page, "FIND A MANTLE");
  await page.keyboard.type("lok");
  await tabTo(page, "Choose Loki");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();

  // A dialog takes focus, Escape closes it, and nothing happened.
  await tabTo(page, "LEAVE THE COUNCIL");
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "ABANDON SEAT" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".cn-guest.is-you")).toContainText("Loki");
});

test("Doom runs the panel by keyboard", async ({ page }) => {
  await seed([{ name: "Tara Menon", title: "Ms.", state: "seated" }]);
  await page.goto("/sign-in");
  await tabTo(page, "EMAIL");
  await page.keyboard.type(E2E_ORGANIZER.email);
  await tabTo(page, "PASSWORD");
  await page.keyboard.type(E2E_ORGANIZER.password);
  await page.keyboard.press("Enter");
  await page.waitForURL("**/dashboard");
  await tabTo(page, /^OPEN/);
  await page.keyboard.press("Enter");
  // An event opens on its proposal; the seeded one has a proposal, so guests can be added.
  await page.waitForURL("**/proposal");
  await tabTo(page, "GUESTS");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/guests");

  await tabTo(page, "NAME");
  await page.keyboard.type("Ravi");
  await tabTo(page, "ADD GUEST");
  await page.keyboard.press("Enter");
  await expect(page.locator(".row-list")).toContainText("Ravi");

  await tabTo(page, "CHARACTERS");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/characters");
  await tabTo(page, "CHARACTER");
  await page.keyboard.type("Hulk");
  // The faction is a native select: End picks the last, Doom's Rumoured Team.
  await tabTo(page, "FACTION");
  await page.keyboard.press("End");
  await tabTo(page, "ADD CHARACTER");
  await page.keyboard.press("Enter");
  const team = page.getByRole("heading", { name: "Doom's Rumoured Team" }).locator("xpath=..");
  await expect(team).toContainText("Hulk");
});
