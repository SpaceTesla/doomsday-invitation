import { expect, test } from "@playwright/test";
import { E2E_PASSPHRASE } from "./constants";
import { seed } from "./seed";

// Headers and privacy on every kind of route (docs/ARCHITECTURE.md, 7.4): the security
// headers everywhere, nothing cached that is private, nothing indexed, and no request
// to any other origin from any screen.

const SECURITY = {
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow",
};

test("every kind of route carries the security headers; private ones are never cached", async ({
  request,
}) => {
  const links = await seed([{ name: "Anish", title: "Mr." }]);
  const token = links.Anish.split("/").pop()!;
  const routes: [string, string, number, boolean][] = [
    // path, method, expected status, private (no-store)
    [links.Anish, "GET", 200, true],
    [`/s/${"x".repeat(43)}`, "GET", 404, true],
    ["/", "GET", 404, false],
    ["/throne", "GET", 200, true],
    ["/api/health", "GET", 200, true],
    [`/api/g/${"x".repeat(43)}/accept`, "POST", 403, true], // no Origin header: refused first
    ["/api/admin/export", "GET", 401, true],
    ["/api/cron/retention", "GET", 401, true],
    ["/robots.txt", "GET", 200, false],
    ["/art/hero-dust.webp", "GET", 200, false],
    ["/dev/specimen", "GET", 404, false],
  ];
  for (const [path, method, status, isPrivate] of routes) {
    const response = await request.fetch(path, { method, maxRedirects: 0 });
    expect(response.status(), `${method} ${path}`).toBe(status);
    const headers = response.headers();
    for (const [name, value] of Object.entries(SECURITY)) {
      expect(headers[name], `${name} on ${path}`).toBe(value);
    }
    const csp = headers["content-security-policy"] ?? "";
    expect(csp, `CSP on ${path}`).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toMatch(/https?:\/\//);
    if (isPrivate) expect(headers["cache-control"], `cache on ${path}`).toContain("no-store");
  }
  // The token never appears in a response other than the guest's own page.
  const invalid = await (await request.get(`/s/${"x".repeat(43)}`)).text();
  expect(invalid).not.toContain(token);
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
});

test("no screen asks anything of another origin", async ({ page, baseURL }) => {
  const links = await seed([
    { name: "Anish", title: "Mr." },
    { name: "Tara Menon", title: "Ms.", state: "seated", holds: "Thor" },
  ]);
  const foreign = new Set<string>();
  page.on("request", (r) => {
    const origin = new URL(r.url()).origin;
    if (origin !== new URL(baseURL!).origin && !r.url().startsWith("data:")) foreign.add(r.url());
  });
  await page.goto(links.Anish);
  await page.getByRole("button", { name: "GO WITH HIM" }).click();
  await expect(page.locator(".sm-name")).toBeAttached();
  await page.goto(links["Tara Menon"]);
  await expect(page.getByRole("heading", { name: "Council of Doom" })).toBeVisible();
  await page.goto("/throne");
  await page.getByRole("textbox", { name: "PASSPHRASE" }).fill(E2E_PASSPHRASE);
  await page.getByRole("button", { name: "ENTER" }).click();
  await page.waitForURL("**/throne/guests");
  for (const section of ["characters", "proposal", "council"])
    await page.goto(`/throne/${section}`);
  await page.goto(`/s/${"x".repeat(43)}`);
  expect([...foreign]).toEqual([]);
});

test("the administrator's session cookie is HttpOnly and SameSite=Strict", async ({ page }) => {
  await seed([]);
  await page.goto("/throne");
  await page.getByRole("textbox", { name: "PASSPHRASE" }).fill(E2E_PASSPHRASE);
  await page.getByRole("button", { name: "ENTER" }).click();
  await page.waitForURL("**/throne/guests");
  const cookie = (await page.context().cookies()).find((c) => c.name === "throne_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Strict");
  // Script on the page cannot read it.
  expect(await page.evaluate(() => document.cookie)).not.toContain("throne_session");
});
