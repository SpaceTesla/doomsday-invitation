import { expect, test, type Page } from "@playwright/test";
import { seed, YEAR } from "./seed";

// The guest journey, without motion, at desktop and phone sizes (milestone 3).

/** Fail the test if the page asks anything of another origin. */
function watchOrigins(page: Page, base: string) {
  const foreign: string[] = [];
  page.on("request", (request) => {
    const origin = new URL(request.url()).origin;
    if (origin !== new URL(base).origin) foreign.push(origin);
  });
  return foreign;
}

async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("a new guest: the opening, the summons, then the council without a mantle", async ({
  page,
  baseURL,
}) => {
  // The whole journey with every ceremony played: the opening, the doors, the hall's
  // arrival and the claim beat take about 25 s before any assertion waits.
  test.setTimeout(60_000);
  const links = await seed([
    { name: "Anish", title: "Mr." },
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true },
  ]);
  const foreign = watchOrigins(page, baseURL!);

  const response = await page.goto(links.Anish);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mr. Anish.");
  await expect(page.getByText("Doctor Doom is here to collect you.")).toBeVisible();
  await noSidewaysScroll(page);

  // Until an opening action is pressed, the link opens on the opening every time.
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mr. Anish.");

  // Press only once the opening is live: a press before hydration does nothing.
  await expect(page.locator(".op")).toHaveAttribute("data-motion", /done|still/, {
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "GO WITHOUT SOUND" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mr. Anish");
  await expect(page.getByText("Victor von Doom")).toBeVisible();
  await noSidewaysScroll(page);

  // Once one is pressed, the link opens on the summons.
  await page.reload();
  await expect(page.locator(".sm-name")).toBeVisible();
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-motion", /done|still/, {
    timeout: 15_000,
  });

  await page.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
  // Step one, the proposal: the council opens on it, and the last step is shut.
  const steps = page.getByRole("navigation", { name: "Your answers to Doom" });
  await expect(steps.getByRole("button", { name: /PROPOSAL/ })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(steps.getByRole("button", { name: /COUNCIL/ })).toBeDisabled();
  await expect(page.locator(".panel-well").first()).toHaveText("1 of 2 seats has approved");

  // Approving moves the guest on to step two; step one reopens from the header.
  await page.getByRole("button", { name: "APPROVE", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Choose your mantle" })).toBeVisible();
  await steps.getByRole("button", { name: /PROPOSAL/ }).click();
  await expect(page.locator(".panel-well").first()).toHaveText("2 of 2 seats have approved");
  await page.getByRole("button", { name: "WITHDRAW" }).first().click();
  await expect(page.locator(".panel-well").first()).toHaveText("1 of 2 seats has approved");

  // Without a mantle: put forward another day, then withdraw it.
  await page.getByRole("button", { name: "PROPOSE ANOTHER" }).click();
  await page.getByRole("button", { name: "SET IT BEFORE DOOM" }).click();
  await expect(page.getByText("Name both a day and an hour.")).toBeVisible();
  await page.getByRole("textbox", { name: "DAY" }).fill(`${YEAR}-01-09`);
  await page.getByRole("combobox", { name: "HOUR" }).selectOption("18:00");
  await page.getByRole("button", { name: "SET IT BEFORE DOOM" }).click();
  await expect(page.getByText("Your alternative is before Doom.")).toBeVisible();
  const mine = page.locator(".cn-alt", { hasText: "Mr. Anish" });
  await expect(mine).toContainText("at six o'clock in the evening.");
  await mine.getByRole("button", { name: "WITHDRAW" }).click();
  await expect(page.locator(".cn-alt", { hasText: "Mr. Anish" })).toHaveCount(0);
  // With nothing answered there is no way on; approving again opens it.
  await expect(page.getByRole("button", { name: "CONTINUE" })).toHaveCount(0);
  await page.getByRole("button", { name: "APPROVE", exact: true }).click();
  await page.getByRole("button", { name: "CONTINUE" }).click();

  // Step two: a taken mantle is not offered; the search narrows the list.
  await expect(page.getByRole("button", { name: "Choose Thor" })).toHaveCount(0);
  await expect(page.getByRole("listitem", { name: "Thor, taken by Ms. Tara Menon" })).toBeVisible();
  const search = page.getByRole("searchbox", { name: "FIND A MANTLE" });
  await search.fill("nobody");
  await expect(page.getByText("No mantle answers to that name.")).toBeVisible();
  await search.fill("LOK");
  await expect(page.getByRole("button", { name: /^Choose / })).toHaveCount(1);
  await noSidewaysScroll(page);

  // "Choose later" moves on for this visit; a reload keeps it.
  await page.getByRole("button", { name: "CHOOSE LATER" }).click();
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();
  await expect(page.locator(".cn-guest.is-you")).toContainText("No mantle yet");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();

  // Claiming a mantle from step two lands on step three, the council.
  await steps.getByRole("button", { name: /MANTLE/ }).click();
  await page.getByRole("button", { name: "Choose Loki" }).click();
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();
  await expect(page.locator(".cn-guest.is-you")).toContainText("Loki");
  await noSidewaysScroll(page);

  expect(foreign).toEqual([]);
});

test("declining is confirmed, closes quietly, and can be undone until the day", async ({
  page,
}) => {
  const links = await seed([{ name: "Ravi", title: "Dr.", state: "summons" }]);
  await page.goto(links.Ravi);
  await page.getByRole("button", { name: "DECLINE" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Refuse the summons?" })).toBeVisible();
  await dialog.getByRole("button", { name: "GO BACK" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "DECLINE" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "REFUSE" }).click();
  await expect(page.getByRole("heading", { name: "So be it." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "So be it." })).toBeVisible();

  await page.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
});

test("leaving the council frees the mantle", async ({ page }) => {
  const links = await seed([
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor", approves: true },
  ]);
  // Every step answered: the link opens on step three, the council.
  await page.goto(links["Tara Menon"]);
  await expect(page.getByRole("heading", { name: "Those summoned" })).toBeVisible();
  await expect(page.locator(".cn-guest.is-you")).toContainText("Thor");
  await page.getByRole("button", { name: "LEAVE THE COUNCIL" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Abandon your seat?" })).toBeVisible();
  await dialog.getByRole("button", { name: "ABANDON SEAT" }).click();
  await expect(page.getByRole("heading", { name: "So be it." })).toBeVisible();
});

test("a long name wraps and fits, and the summons never needs sideways scrolling", async ({
  page,
}) => {
  const links = await seed([{ name: "Bhattacharya-Okonkwo", title: "Ms.", state: "summons" }]);
  await page.goto(links["Bhattacharya-Okonkwo"]);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".sm-plate")).toHaveAttribute("data-fit", "two-lines");
  await expect(page.getByRole("button", { name: "TAKE YOUR SEAT" })).toBeVisible();
  await noSidewaysScroll(page);
});

test("an invalid link shows one screen that reveals nothing", async ({ page }) => {
  await seed([{ name: "Anish", title: "Mr." }]);
  const response = await page.goto(`/s/${"x".repeat(43)}`);
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("No summons here.");
  await expect(page.locator("body")).not.toContainText("Anish");
});

test("every link previews the same way, naming no one", async ({ request }) => {
  const links = await seed([
    { name: "Anish", title: "Mr." },
    { name: "Tara Menon", title: "Ms." },
  ]);
  const head = async (link: string) => {
    const html = await (await request.get(link)).text();
    return html.slice(0, html.indexOf("</head>"));
  };
  const [first, second] = [await head(links.Anish), await head(links["Tara Menon"])];
  for (const html of [first, second]) {
    expect(html).toContain('<meta property="og:title" content="A summons"/>');
    expect(html).not.toContain("Anish");
    expect(html).not.toContain("Tara");
  }
});
