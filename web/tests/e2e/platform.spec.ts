import { expect, test, type Page } from "@playwright/test";
import { E2E_ORGANIZER } from "./constants";
import { panel, signIn } from "./organizer";
import { linkOf, seed, seededEventId, seedRival, YEAR } from "./seed";

// The organizer platform (docs/PRODUCT_SPEC.md, section 8): the landing page, accounts,
// the dashboard, and events kept apart. The guest journey itself is covered, unchanged,
// by the other specs.

async function signUp(page: Page, name: string, email: string, password: string) {
  await page.goto("/sign-up");
  await page.getByRole("textbox", { name: "NAME" }).fill(name);
  await page.getByRole("textbox", { name: "EMAIL" }).fill(email);
  await page.getByLabel("PASSWORD").fill(password);
  await page.getByRole("button", { name: "CREATE ACCOUNT" }).click();
  await page.waitForURL("**/dashboard");
}

/** A new event opens on its proposal, the first thing to set. */
async function createEvent(page: Page, zone: string) {
  await page.getByRole("combobox", { name: "TIME ZONE" }).selectOption(zone);
  await page.getByRole("button", { name: "CREATE EVENT" }).click();
  await page.waitForURL(/\/dashboard\/\d+\/proposal$/);
  return Number(new URL(page.url()).pathname.split("/")[2]);
}

/** Guests can be summoned only once a day is proposed; then on to the guests. */
async function propose(page: Page, venue: string) {
  await page.getByRole("link", { name: "GUESTS" }).click();
  await expect(page.getByText("Set a proposal first.")).toBeVisible();
  await expect(page.getByRole("button", { name: "ADD GUEST" })).toHaveCount(0);
  await page.getByRole("link", { name: "SET PROPOSAL" }).click();
  await page.getByRole("textbox", { name: "DAY" }).fill(`${YEAR}-01-08`);
  await page.getByRole("combobox", { name: "HOUR" }).selectOption("19:30");
  await page.getByRole("textbox", { name: "VENUE" }).fill(venue);
  await page.getByRole("button", { name: "SET PROPOSAL" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.getByRole("link", { name: "GUESTS" }).click();
  await expect(page.getByRole("button", { name: "ADD GUEST" })).toBeVisible();
}

async function summon(page: Page, name: string): Promise<string> {
  await page.getByRole("textbox", { name: "NAME" }).fill(name);
  await page.getByRole("button", { name: "ADD GUEST" }).click();
  const row = page.locator(".row-list > li", { hasText: name });
  await expect(row).toBeVisible();
  return linkOf(name);
}

test("the landing page explains the invitation and leads organizers in", async ({ page }) => {
  await seed([]);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The Iron Throne", level: 1 })).toBeVisible();
  await expect(page.getByText("A private summons to a night at the cinema.")).toBeVisible();
  await expect(page.getByText("not licensed or endorsed")).toBeVisible();
  await page.getByRole("link", { name: "CREATE AN ACCOUNT" }).click();
  await expect(page).toHaveURL(/\/sign-up$/);
  await page.goto("/");
  await page.getByRole("link", { name: "SIGN IN" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  // Signed out, the dashboard and an event's panel lead to sign-in.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto(panel("guests"));
  await expect(page).toHaveURL(/\/sign-in$/);
});

test("two organizers create and run their own events, apart", async ({ browser }) => {
  test.slow();
  await seed([]);
  const one = await browser.newContext();
  const two = await browser.newContext();
  const a = await one.newPage();
  const b = await two.newPage();

  // A simple six-character password is enough.
  await signUp(a, "Ada Organizer", "ada@throne.test", "ada123");
  await expect(a.getByText("You have no events yet.")).toBeVisible();
  const adaEvent = await createEvent(a, "Europe/London");
  await propose(a, "the Ada Hall");
  const adaLink = await summon(a, "Grace");

  await signUp(b, "Brook Organizer", "brook@throne.test", "brook1");
  const brookEvent = await createEvent(b, "Asia/Kolkata");
  await propose(b, "the Brook Cinema");
  const brookLink = await summon(b, "Linus");
  expect(brookEvent).not.toBe(adaEvent);

  // Each dashboard lists only its own event, by its day and venue (events have no names).
  await a.goto("/dashboard");
  await expect(a.getByText("the Ada Hall")).toBeVisible();
  await expect(a.getByText("the Brook Cinema")).toHaveCount(0);
  await b.goto("/dashboard");
  await expect(b.getByText("the Brook Cinema")).toBeVisible();
  await expect(b.getByText("the Ada Hall")).toHaveCount(0);

  // Typing the other's address shows not-found, and the API answers 404.
  for (const section of ["guests", "characters", "proposal", "council", "settings"]) {
    const response = await b.goto(`/dashboard/${adaEvent}/${section}`);
    expect(response?.status(), section).toBe(404);
    await expect(b.getByText("Grace")).toHaveCount(0);
  }
  const exported = await b.request.get(`/api/events/${adaEvent}/export`);
  expect(exported.status()).toBe(404);

  // Each event has its own roster and its own name beneath Doom.
  await a.goto(`/dashboard/${adaEvent}/settings`);
  await a.getByRole("textbox", { name: "NAME BENEATH DOOM" }).fill("Ada the Summoner");
  await a.getByRole("button", { name: "SAVE" }).click();
  await expect(a.getByText("Saved.")).toBeVisible();
  // Saved on Ada's event only. (refinement.spec.ts shows the name in Doom's row.)
  const adaData = await (await a.request.get(`/api/events/${adaEvent}/export`)).json();
  expect(adaData.event.hostName).toBe("Ada the Summoner");
  const brookData = await (await b.request.get(`/api/events/${brookEvent}/export`)).json();
  expect(brookData.event.hostName).toBe("Brook Organizer");
  expect(JSON.stringify(brookData)).not.toContain("Grace");

  // Each guest's link opens their own summons; accepting there touches only that event.
  const guest = await browser.newPage();
  await guest.goto(adaLink);
  await expect(guest.locator(".op")).toHaveAttribute("data-motion", /done|still/, {
    timeout: 15_000,
  });
  await guest.getByRole("button", { name: "GO WITHOUT SOUND" }).click();
  await expect(guest.locator(".sm-plate")).toHaveAttribute("data-motion", /done|still/, {
    timeout: 15_000,
  });
  await guest.getByRole("button", { name: "TAKE YOUR SEAT" }).click();
  await expect(guest.getByRole("heading", { name: "Council of Doom" })).toBeVisible({
    timeout: 15_000,
  });
  // Nothing of Brook's event reaches Ada's guest.
  await expect(guest.getByText("Linus")).toHaveCount(0);
  await guest.goto(brookLink);
  await expect(guest.getByRole("button", { name: "GO WITH HIM" })).toBeVisible();
  await guest.close();

  await a.goto("/dashboard");
  await expect(a.locator(".event-row", { hasText: "the Ada Hall" })).toContainText(
    "1 summoned, 1 seated",
  );
  await b.goto("/dashboard");
  await expect(b.locator(".event-row", { hasText: "the Brook Cinema" })).toContainText(
    "1 summoned, 0 seated",
  );

  // Deleting an event asks first, then takes its links with it; the other is untouched.
  await a.goto(`/dashboard/${adaEvent}/settings`);
  await a.getByRole("button", { name: "DELETE EVENT" }).click();
  const dialog = a.getByRole("dialog");
  await expect(dialog).toContainText("This event and everything in it will be deleted.");
  await dialog.getByRole("button", { name: "CANCEL" }).click();
  await expect(a.getByRole("dialog")).toHaveCount(0);
  await a.getByRole("button", { name: "DELETE EVENT" }).click();
  await a.getByRole("dialog").getByRole("button", { name: "DELETE EVENT" }).click();
  await a.waitForURL("**/dashboard");
  await expect(a.getByText("You have no events yet.")).toBeVisible();
  expect((await a.request.get(adaLink)).status()).toBe(404);
  expect((await b.request.get(brookLink)).status()).toBe(200);

  await one.close();
  await two.close();
});

test("an organizer signs out, and the panel is closed to them until they sign in", async ({
  page,
}) => {
  await seed([{ name: "Tara Menon", title: "Ms.", state: "seated" }]);
  await signIn(page);
  await expect(page.getByText(`Signed in as ${E2E_ORGANIZER.name}.`)).toBeVisible();
  await page.getByRole("button", { name: "SIGN OUT" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await page.goto(panel("guests"));
  await expect(page).toHaveURL(/\/sign-in$/);
  expect((await page.request.get(`/api/events/${seededEventId()}/export`)).status()).toBe(401);
});

test("another organizer's guest link and event stay out of reach", async ({ page }) => {
  const links = await seed([{ name: "Tara Menon", title: "Ms.", state: "seated" }]);
  const rival = await seedRival();
  await signIn(page);
  // The rival's event is not on this dashboard, and its panel is not-found.
  await expect(page.getByText("the Rival Hall")).toHaveCount(0);
  expect((await page.goto(`/dashboard/${rival.eventId}/guests`))?.status()).toBe(404);
  // A change aimed at the rival's guest through one's own event is refused.
  const response = await page.request.patch(
    `/api/events/${seededEventId()}/guests/${rival.guestId}`,
    { data: { name: "Hijacked", title: "" }, headers: { origin: new URL(page.url()).origin } },
  );
  expect(response.status()).toBe(404);
  // Both guests' links still open their own summons.
  expect((await page.request.get(links["Tara Menon"])).status()).toBe(200);
  expect((await page.request.get(rival.link)).status()).toBe(200);
});
