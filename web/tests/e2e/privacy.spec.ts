import { expect, test } from "@playwright/test";
import { panel, signIn } from "./organizer";
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
    ["/", "GET", 200, true],
    ["/sign-in", "GET", 200, true],
    ["/sign-up", "GET", 200, true],
    ["/dashboard", "GET", 307, true], // signed out: to sign-in
    ["/throne", "GET", 307, true], // the old panel address: to the dashboard
    ["/api/health", "GET", 200, true],
    [`/api/g/${"x".repeat(43)}/accept`, "POST", 403, true], // no Origin header: refused first
    ["/api/events/1/export", "GET", 401, true],
    ["/api/events", "POST", 403, true], // no Origin header: refused first
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
  await page.goto("/");
  await page.goto("/sign-up");
  await signIn(page);
  for (const section of ["guests", "characters", "proposal", "council", "settings"])
    await page.goto(panel(section));
  await page.goto(`/s/${"x".repeat(43)}`);
  expect([...foreign]).toEqual([]);
});

test("the organizer's session cookie is HttpOnly and SameSite=Strict", async ({ page }) => {
  await seed([]);
  await signIn(page);
  const cookie = (await page.context().cookies()).find((c) =>
    c.name.endsWith("throne.session_token"),
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Strict");
  // Script on the page cannot read it.
  expect(await page.evaluate(() => document.cookie)).not.toContain("session_token");
});
