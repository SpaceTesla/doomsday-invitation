import crypto from "node:crypto";

/** 32 random bytes as 43 URL-safe characters: a guest's link, and their only credential. */
export function newGuestToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** The shape every token has. Anything else is answered as an unknown link, unqueried. */
export function looksLikeGuestToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}
