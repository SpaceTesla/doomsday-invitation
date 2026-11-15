/**
 * Full certificate verification for database connections.
 *
 * Neon's connection strings carry `sslmode=require`. Today `pg` treats that as
 * `verify-full` (encrypt, check the certificate chain and the host name), but it has
 * said the next major version will follow libpq, where `require` only encrypts. Asking
 * for `verify-full` by name keeps the full check whatever `pg` does next.
 *
 * Only the weaker TLS modes are raised. A string with no `sslmode` (the local Docker
 * database, which has no TLS) or with `disable` is left as it is.
 */
const RAISED = new Set(["prefer", "require", "verify-ca"]);

export function withFullVerification(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return connectionString;
  }
  const mode = url.searchParams.get("sslmode");
  if (!mode || !RAISED.has(mode)) return connectionString;
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
