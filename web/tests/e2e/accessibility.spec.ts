import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { E2E_PASSPHRASE } from "./constants";
import { seed } from "./seed";

// Every screen, scanned with axe against WCAG 2.2 A and AA (docs/PRODUCT_SPEC.md, 5.4).
// Reduced motion is on, so each screen is scanned in its settled state.

test.use({ reducedMotion: "reduce" });

async function scan(page: Page, label: string) {
  // Measure the screen at rest: let any finite animation (a step fading in) finish first.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => null)),
    ),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const problems = results.violations.map(
    (v) =>
      `${label}: ${v.id} (${v.impact}) ${v.help} — ${v.nodes
        .map((n) => n.target.join(" "))
        .slice(0, 3)
        .join(", ")}`,
  );
  expect(problems, problems.join("\n")).toEqual([]);
}

test("guest screens", async ({ page }) => {
  const links = await seed([
    { name: "Anish", title: "Mr." },
    { name: "Ravi", title: "Dr.", state: "summons" },
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true },
    { name: "José Nuñez", state: "seated" },
    { name: "Priya", title: "Ms.", state: "declined" },
  ]);

  await page.goto(links.Anish);
  await expect(page.locator(".op")).toHaveAttribute("data-motion", "done");
  await scan(page, "opening");

  await page.goto(links.Ravi);
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", "still");
  await scan(page, "summons");
  await page.getByRole("button", { name: "DECLINE" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await scan(page, "decline dialog");
  await page.getByRole("button", { name: "GO BACK" }).click();

  await page.goto(links["José Nuñez"]);
  await scan(page, "council, step one");
  await page.getByRole("button", { name: "PROPOSE ANOTHER" }).click();
  await scan(page, "council, alternative entry open");
  await page.getByRole("button", { name: "CANCEL" }).click();
  await page.getByRole("button", { name: "APPROVE", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose your mantle" })).toBeVisible();
  await scan(page, "council, step two");
  await page.getByRole("searchbox", { name: "FIND A MANTLE" }).fill("nobody");
  await scan(page, "council, step two, nothing found");
  await page.getByRole("button", { name: "CHOOSE LATER" }).click();
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();
  await scan(page, "council, step three, no mantle");
  await page.getByRole("button", { name: "LEAVE THE COUNCIL" }).click();
  await scan(page, "leave dialog");
  await page.getByRole("button", { name: "REMAIN" }).click();

  await page.goto(links["Tara Menon"]);
  await scan(page, "council, holding a mantle and approving");

  await page.goto(links.Priya);
  await scan(page, "closing screen");

  await page.goto(`/s/${"x".repeat(43)}`);
  await scan(page, "invalid link");
});

test("the decree and the day passed", async ({ page }) => {
  const decreed = await seed(
    [{ name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor" }],
    undefined,
    { decreed: true },
  );
  await page.goto(decreed["Tara Menon"]);
  await expect(page.getByRole("heading", { name: "Doom decrees" })).toBeVisible();
  await scan(page, "council, decreed");

  const passed = await seed([{ name: "Ravi", title: "Dr.", state: "summons" }], undefined, {
    dayPassed: true,
  });
  await page.goto(passed.Ravi);
  await expect(page.getByRole("heading", { name: "The day has passed." })).toBeVisible();
  await scan(page, "day passed");
});

test("the administrator panel", async ({ page }) => {
  await seed([
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true },
    { name: "Anish", title: "Mr." },
  ]);
  await page.goto("/throne");
  await scan(page, "sign-in");
  await page.getByRole("textbox", { name: "PASSPHRASE" }).fill("wrong");
  await page.getByRole("button", { name: "ENTER" }).click();
  await expect(page.getByText("That is not the passphrase.")).toBeVisible();
  await scan(page, "sign-in, wrong passphrase");
  await page.getByRole("textbox", { name: "PASSPHRASE" }).fill(E2E_PASSPHRASE);
  await page.getByRole("button", { name: "ENTER" }).click();
  await page.waitForURL("**/throne/guests");
  for (const section of ["guests", "characters", "proposal", "council"]) {
    await page.goto(`/throne/${section}`);
    await scan(page, `panel, ${section}`);
  }
  await page.goto("/throne/guests");
  await page.getByRole("button", { name: "REMOVE GUEST" }).first().click();
  await scan(page, "panel, confirmation dialog");
});
