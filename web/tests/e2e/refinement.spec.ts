import { expect, test } from "@playwright/test";
import { amendDecree, seed } from "./seed";

// The creative refinements of 17 November 2026 (design/DESIGN.md, 6.6 and 8.13 to 8.17):
// the hall's arrival, the claim beat, the decree ceremony, the outer doors, the closed seal.

test("the hall's arrival plays once a session, then settles; later loads take the short way", async ({
  page,
}) => {
  const links = await seed([
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true },
  ]);
  await page.goto(links["Tara Menon"]);
  const council = page.locator(".cn");
  await expect(council).toHaveAttribute("data-arrival", "playing");
  // The full arrival leaves the camera pushed in at first; it settles with nothing moving.
  await expect(council).toHaveAttribute("data-arrival", "done", { timeout: 6000 });
  const settled = await page.locator(".cn-cam").evaluate((el) => getComputedStyle(el).transform);
  expect(settled === "none" || settled === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);

  // A reload in the same session: the short fade, done well inside a second.
  await page.reload();
  await expect(council).toHaveAttribute("data-arrival", "done", { timeout: 1500 });
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();
});

test("a confirmed claim is shown, its line held, then the council; a key ends it sooner", async ({
  page,
}) => {
  const links = await seed([{ name: "Ravi", title: "Dr.", state: "seated", approves: true }]);
  await page.goto(links.Ravi);
  await expect(page.locator(".cn")).toHaveAttribute("data-arrival", "done", { timeout: 6000 });
  await page.getByRole("button", { name: "Choose Loki" }).click();

  // The beat: still on the mantle step, the guest's mantle large, the line on screen.
  const line = page.getByText("You stand before the council as Loki.");
  await expect(line).toBeVisible();
  await expect(page.locator(".cn-mantle.is-claiming")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Choose your mantle" })).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(line).toBeVisible();
  // Then the council, by itself.
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible({
    timeout: 4000,
  });
  await expect(page.locator(".cn-guest.is-you")).toContainText("Loki");

  // Changing mantle plays the beat again; a key ends it at once.
  const steps = page.getByRole("navigation", { name: "Your answers to Doom" });
  await steps.getByRole("button", { name: /MANTLE/ }).click();
  await page.getByRole("button", { name: "Choose Thor" }).click();
  await expect(page.locator(".cn-mantle.is-claiming")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible({
    timeout: 1000,
  });
});

test("a claim that loses the race shows no ceremony", async ({ page }) => {
  const links = await seed([
    { name: "Ravi", title: "Dr.", state: "seated", approves: true },
    { name: "Tara Menon", title: "Ms.", state: "seated", approves: true },
  ]);
  await page.goto(links.Ravi);
  await expect(page.locator(".cn")).toHaveAttribute("data-arrival", "done", { timeout: 6000 });
  // Tara takes Loki while Ravi's page is open.
  const other = await page.context().newPage();
  await other.goto(links["Tara Menon"]);
  await other.getByRole("button", { name: "Choose Loki" }).click();
  await expect(other.locator(".cn-mantle.is-claiming")).toHaveCount(1);
  await other.close();

  await page.getByRole("button", { name: "Choose Loki" }).click();
  await expect(page.getByText(/Loki was claimed a moment ago/)).toBeVisible();
  await expect(page.locator(".cn-mantle.is-claiming")).toHaveCount(0);
  await expect(page.getByText("You stand before the council as Loki.")).toHaveCount(0);
});

test("the decree's ceremony plays once for each revision, and again after an amendment", async ({
  page,
}) => {
  const links = await seed(
    [{ name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true }],
    undefined,
    { decreed: true },
  );
  await page.goto(links["Tara Menon"]);
  const decree = page.locator(".cn-decree");
  await expect(page.locator(".cn-decree.is-issuing")).toHaveCount(1, { timeout: 6000 });
  await expect(decree).not.toHaveClass(/is-issuing/, { timeout: 6000 });
  // A reload shows it settled.
  await page.reload();
  await expect(page.locator(".cn")).toHaveAttribute("data-arrival", "done", { timeout: 3000 });
  await page.waitForTimeout(500);
  await expect(page.locator(".cn-decree.is-issuing")).toHaveCount(0);
  // An amendment is a new revision: the ceremony again, with the amended notice.
  await amendDecree();
  await page.reload();
  await expect(page.locator(".cn-decree.is-issuing")).toHaveCount(1, { timeout: 4000 });
  await expect(page.getByText("Doom has amended the decree. Mark the new day.")).toBeVisible();
});

test("the outer doors open once a session; later arrivals get the light alone", async ({
  page,
}) => {
  const links = await seed([{ name: "Ravi", title: "Dr.", state: "summons" }]);
  await page.goto(links.Ravi);
  await expect(page.locator(".sm-door")).toHaveCount(2);
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "done", {
    timeout: 15_000,
  });
  await expect(page.locator(".sm-doors")).toHaveCount(0);
  await expect(page.locator(".sm-seal svg g.seal")).toHaveAttribute("class", "seal seal--active");

  await page.reload();
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "playing");
  // The doors stand open: hidden from the start of the short version.
  await expect
    .poll(() =>
      page
        .locator(".sm-door")
        .first()
        .evaluate((el) => getComputedStyle(el).visibility)
        .catch(() => "gone"),
    )
    .toMatch(/hidden|gone/);
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "done", { timeout: 6000 });
});

test("the closed screens carry the dormant seal and nothing else of the guest", async ({
  page,
}) => {
  const links = await seed([{ name: "Priya", title: "Ms.", state: "declined" }]);
  await page.goto(links.Priya);
  await expect(page.getByRole("heading", { name: "So be it." })).toBeVisible();
  await expect(page.locator(".closed-seal .seal--dormant")).toHaveCount(1);
  await page.goto(`/s/${"x".repeat(43)}`);
  await expect(page.locator(".closed-seal .seal--dormant")).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText("Priya");
});

test("a mantle in the guest list opens in full above the list, and closes back into its row", async ({
  page,
}) => {
  const links = await seed([
    { name: "Ravi", title: "Dr.", state: "seated", holds: "Loki", approves: true },
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true },
  ]);
  await page.goto(links.Ravi);
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();
  const card = page.locator(".cn-mantle-card");
  await expect(card).toHaveCount(0);
  // Doom's row carries the name of the one who summons as Doom (the setting DOOM_NAME).
  await expect(page.locator(".cn-guest-doom")).toHaveText("Arjun Rao");

  // Another guest's mantle: the character and whose it is.
  const thor = page.getByRole("button", { name: "Thor" });
  await thor.click();
  await expect(thor).toHaveAttribute("aria-expanded", "true");
  await expect(card).toContainText("Thor");
  await expect(card).toContainText("Tara Menon");
  await expect(card.locator(".rune-line--lit")).toHaveCount(1);

  // The guest's own: "You stand before the council as …".
  await page.getByRole("button", { name: "Loki" }).click();
  await expect(card).toContainText("You stand before the council as Loki.");

  // Closing returns it to the row, and focus with it.
  await card.getByRole("button", { name: "Close" }).click();
  await expect(card).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Loki" })).toBeFocused();
});
