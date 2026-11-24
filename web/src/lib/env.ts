// Server-side settings, each read and checked where it is used, so a missing one only
// stops what needs it. Values are never logged; messages name the variable only.
export function sessionKey(): string {
  const value = process.env.SESSION_KEY ?? "";
  if (value.length < 32) throw new Error("SESSION_KEY must be at least 32 characters.");
  return value;
}

/**
 * Whether new organizers may create accounts. ORGANIZER_SIGNUP=open opens it, =closed
 * closes it; unset, it is open in development and closed in production, so a deployment
 * opens registration only on purpose.
 */
export function signupOpen(): boolean {
  const value = (process.env.ORGANIZER_SIGNUP ?? "").trim().toLowerCase();
  if (value === "open") return true;
  if (value === "closed") return false;
  return process.env.NODE_ENV !== "production";
}
