// Generate the administrator's passphrase and its scrypt hash.
//
//   npm run admin:passphrase
//     Prints a new passphrase and its hash, once, to your own terminal. Keep the
//     passphrase; put the hash in Vercel as ADMIN_PASSPHRASE_HASH. Run it yourself:
//     never in a shared session or a CI log.
//
//   npm run admin:passphrase -- --local <file>
//     For development: writes the hash into web/.env.local and the passphrase into
//     <file>, and prints neither.
import fs from "node:fs";
import path from "node:path";
import { generatePassphrase, hashPassphrase } from "../src/lib/passphrase";

async function main() {
  const passphrase = generatePassphrase();
  const hash = await hashPassphrase(passphrase);

  const localIndex = process.argv.indexOf("--local");
  if (localIndex === -1) {
    console.log(`Passphrase (keep it; it is shown once):  ${passphrase}`);
    console.log(`ADMIN_PASSPHRASE_HASH=${hash}`);
    return;
  }

  const out = process.argv[localIndex + 1];
  if (!out) throw new Error("--local needs a file to write the passphrase to.");
  const envPath = path.resolve(__dirname, "..", ".env.local");
  const lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split(/\r?\n/) : [];
  const kept = lines.filter((line) => line && !line.startsWith("ADMIN_PASSPHRASE_HASH="));
  kept.push(`ADMIN_PASSPHRASE_HASH=${hash}`);
  fs.writeFileSync(envPath, `${kept.join("\n")}\n`, { mode: 0o600 });
  fs.writeFileSync(path.resolve(out), `${passphrase}\n`, { mode: 0o600 });
  console.log("ADMIN_PASSPHRASE_HASH written to .env.local; passphrase written to the file given.");
}

main().catch((failure: unknown) => {
  console.error(failure instanceof Error ? failure.message : "failed");
  process.exit(1);
});
