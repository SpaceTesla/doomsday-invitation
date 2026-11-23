// Organizer accounts: Better Auth, with email and password, sessions in PostgreSQL through
// Drizzle (docs/ARCHITECTURE.md, section 7.6). Better Auth hashes passwords (scrypt), signs
// the session cookie, stores each session so signing out ends it, checks the Origin of
// every change, and limits sign-in and sign-up attempts. Nothing here is hand-made
// cryptography. Guests never have accounts.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { getDb } from "@/db/client";
import {
  authRateLimit,
  organizer,
  organizerAccount,
  organizerSession,
  organizerVerification,
} from "@/db/schema";
import { sessionKey, signupOpen } from "@/lib/env";

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 128;
export const SESSION_DAYS = 7;
export const ORGANIZER_NAME_MAX = 60;

/**
 * An organizer's name as stored: spaces collapsed, trimmed, at most 60 characters. Better
 * Auth takes any string, so the form's limits are enforced here too; a blank name is refused.
 */
function organizerName(raw: unknown): string {
  const name = String(raw ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, ORGANIZER_NAME_MAX)
    .trim();
  if (!name) throw new APIError("BAD_REQUEST", { code: "NAME_REQUIRED", message: "Name required" });
  return name;
}

/** The hosts this deployment answers on: the configured address and Vercel's own. */
function allowedHosts(): string[] {
  const hosts = new Set<string>();
  const configured = process.env.BETTER_AUTH_URL;
  if (configured) {
    try {
      hosts.add(new URL(configured).host);
    } catch {
      // A malformed address is ignored; the others still apply.
    }
  }
  for (const name of ["VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    const value = process.env[name];
    if (value) hosts.add(value);
  }
  return [...hosts];
}

function createAuth() {
  return betterAuth({
    appName: "The Iron Throne",
    secret: sessionKey(),
    baseURL: { allowedHosts: allowedHosts(), fallback: process.env.BETTER_AUTH_URL },
    basePath: "/api/auth",
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        organizer,
        organizerSession,
        organizerAccount,
        organizerVerification,
        authRateLimit,
      },
    }),
    user: { modelName: "organizer" },
    databaseHooks: {
      user: {
        create: { before: async (user) => ({ data: { ...user, name: organizerName(user.name) } }) },
        update: {
          before: async (user) =>
            "name" in user ? { data: { ...user, name: organizerName(user.name) } } : undefined,
        },
      },
    },
    session: {
      modelName: "organizerSession",
      expiresIn: SESSION_DAYS * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
    },
    account: { modelName: "organizerAccount" },
    verification: { modelName: "organizerVerification" },
    emailAndPassword: {
      enabled: true,
      // Closed unless the deployment opens it (ORGANIZER_SIGNUP; see src/lib/env.ts).
      disableSignUp: !signupOpen(),
      minPasswordLength: PASSWORD_MIN,
      maxPasswordLength: PASSWORD_MAX,
      autoSignIn: true,
      // There is no email provider: no verification mail and no reset mail.
      requireEmailVerification: false,
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "authRateLimit",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 15 * 60, max: 10 },
        "/sign-up/email": { window: 60 * 60, max: 5 },
      },
    },
    advanced: {
      cookiePrefix: "throne",
      defaultCookieAttributes: { sameSite: "strict", httpOnly: true },
      useSecureCookies: process.env.NODE_ENV === "production",
      // Better Auth skips its Origin and CSRF checks in test runs unless told otherwise.
      // Always on, so the tests exercise exactly what production does.
      disableOriginCheck: false,
      disableCSRFCheck: false,
    },
    // The site makes no third-party requests.
    telemetry: { enabled: false },
  });
}

type Auth = ReturnType<typeof createAuth>;

const holder = globalThis as typeof globalThis & { __ironThroneAuth?: Auth };

/** Created on first use, so importing this module (during `next build`) reads no settings. */
export function getAuth(): Auth {
  return (holder.__ironThroneAuth ??= createAuth());
}
