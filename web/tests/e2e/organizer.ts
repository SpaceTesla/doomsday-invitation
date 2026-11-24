import type { Page } from "@playwright/test";
import { E2E_ORGANIZER } from "./constants";
import { seededEventId } from "./seed";

/** Sign in through the real form as the seeded organizer (or another), landing on the dashboard. */
export async function signIn(
  page: Page,
  who: { email: string; password: string } = E2E_ORGANIZER,
): Promise<void> {
  await page.goto("/sign-in");
  await page.getByRole("textbox", { name: "EMAIL" }).fill(who.email);
  await page.getByLabel("PASSWORD").fill(who.password);
  await page.getByRole("button", { name: "SIGN IN" }).click();
  await page.waitForURL("**/dashboard");
}

/** The seeded event's panel section, e.g. panel("guests"). */
export const panel = (section: string) => `/dashboard/${seededEventId()}/${section}`;
