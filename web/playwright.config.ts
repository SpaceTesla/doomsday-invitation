import crypto from "node:crypto";
import { defineConfig } from "@playwright/test";

import { E2E_PASSPHRASE } from "./tests/e2e/constants";

/** The end-to-end passphrase, hashed the way the app expects. */
function e2ePassphraseHash(): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(E2E_PASSPHRASE.normalize("NFKC"), salt, 32, {
    N: 2 ** 15,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt:32768:8:1:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

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
      DOOM_NAME: "Arjun Rao",
      SESSION_KEY: "e2e-session-key-that-is-long-enough-000000",
      ADMIN_PASSPHRASE_HASH: e2ePassphraseHash(),
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
