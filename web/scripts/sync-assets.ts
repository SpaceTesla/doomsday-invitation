// Copy the approved assets and fonts into the application. Usage: npm run assets:sync
// Each copy is checked against its source by SHA-256. See scripts/asset-manifest.ts.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { assets, fonts } from "./asset-manifest";

const webDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(webDir, "..");

const sha256 = (file: string) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function copy(fromBase: string, from: string, to: string): "copied" | "unchanged" {
  const source = path.resolve(fromBase, from);
  const target = path.resolve(webDir, to);
  const normalised = path.relative(rootDir, source).split(path.sep).join("/");
  if (normalised.startsWith("references/")) {
    throw new Error(`Refusing to copy from references/: ${from}`);
  }
  if (!fs.existsSync(source)) {
    throw new Error(`Missing source: ${from}`);
  }
  if (fs.existsSync(target) && sha256(target) === sha256(source)) {
    return "unchanged";
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  if (sha256(target) !== sha256(source)) {
    throw new Error(`Copy does not match its source: ${to}`);
  }
  return "copied";
}

let copied = 0;
let unchanged = 0;
for (const entry of assets) {
  if (copy(rootDir, entry.from, entry.to) === "copied") copied += 1;
  else unchanged += 1;
}
for (const entry of fonts) {
  if (copy(webDir, entry.from, entry.to) === "copied") copied += 1;
  else unchanged += 1;
}
console.log(`assets and fonts: ${copied} copied, ${unchanged} already up to date`);
