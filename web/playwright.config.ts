import { defineConfig } from "@playwright/test";

// End-to-end tests: the production build, served locally against its own database in
// the Docker PostgreSQL. Run with `npm run e2e` (it builds first).
const PORT = 3311;
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "postgres://throne:throne@localhost:54329/iron_throne_e2e";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    {
      name: "phone",
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
  webServer: {
    command: `npx tsx scripts/e2e-db.ts && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      DATABASE_URL_DIRECT: E2E_DATABASE_URL,
      EVENT_TIMEZONE: "Asia/Kolkata",
      SESSION_KEY: "e2e-session-key-that-is-long-enough-000000",
      ADMIN_PASSPHRASE_HASH:
        "scrypt:32768:8:1:AAAAAAAAAAAAAAAAAAAAAA:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
