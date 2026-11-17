// Server-side settings, each read and checked where it is used, so a missing one only
// stops what needs it. Values are never logged; messages name the variable only.
import { isTimeZone } from "@/domain/time";

export function eventTimeZone(): string {
  const value = process.env.EVENT_TIMEZONE ?? "";
  if (!isTimeZone(value)) throw new Error("EVENT_TIMEZONE must be an IANA time zone.");
  return value;
}

export function sessionKey(): string {
  const value = process.env.SESSION_KEY ?? "";
  if (value.length < 32) throw new Error("SESSION_KEY must be at least 32 characters.");
  return value;
}

/** Null until the owner has set it: sign-in then always fails, and nothing else breaks. */
export function passphraseHash(): string | null {
  const value = process.env.ADMIN_PASSPHRASE_HASH ?? "";
  return value.startsWith("scrypt:") ? value : null;
}

/**
 * The name of the person who summons the guests as Doom, shown beneath Doctor Doom on the
 * council's list (design/DESIGN.md, 8.9). Kept out of the repository; null when unset, and
 * the list then shows Doom alone.
 */
export function doomName(): string | null {
  const value = (process.env.DOOM_NAME ?? "").trim().replace(/\s+/g, " ");
  return value ? value.slice(0, 60) : null;
}
