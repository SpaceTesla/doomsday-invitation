// The administrator's passphrase. It is generated, never chosen, and only its scrypt
// hash is stored (as ADMIN_PASSPHRASE_HASH). Format: scrypt:N:r:p:salt:hash, with salt
// and hash in base64url. No "$", because Next.js expands "$" in .env files.
import crypto from "node:crypto";

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(
  passphrase: string,
  salt: Buffer,
  n: number,
  r: number,
  p: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      passphrase.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      { N: n, r, p, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

/** Six groups of four letters and digits: easy to type, about 124 bits. */
export function generatePassphrase(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const groups: string[] = [];
  for (let g = 0; g < 6; g += 1) {
    let group = "";
    for (let i = 0; i < 4; i += 1) group += alphabet[crypto.randomInt(alphabet.length)];
    groups.push(group);
  }
  return groups.join("-");
}

export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await derive(passphrase, salt, N, R, P);
  return `scrypt:${N}:${R}:${P}:${salt.toString("base64url")}:${key.toString("base64url")}`;
}

/** Constant-time comparison. A malformed stored hash never matches. */
export async function verifyPassphrase(passphrase: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [n, r, p] = parts.slice(1, 4).map(Number);
  if (![n, r, p].every(Number.isInteger)) return false;
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await derive(passphrase, salt, n, r, p);
  return crypto.timingSafeEqual(actual, expected);
}
