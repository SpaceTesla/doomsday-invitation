// The guest's choice of sound, kept for the visit (docs/PRODUCT_SPEC.md, section 5.6).
// Session storage can be unavailable (private windows, some in-app browsers); then the
// choice simply is not remembered, and silence is the default.
const KEY = "throne.sound";

export function rememberSound(on: boolean): void {
  try {
    sessionStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Not remembered; nothing else depends on it.
  }
}

export function soundChosen(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}
