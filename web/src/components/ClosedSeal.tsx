import { Runes } from "./Runes";
import { Seal } from "./Seal";

/**
 * The closed screens' mark (design/DESIGN.md, 8.17): the seal, dormant, with "latveria"
 * engraved beneath it, never lit. It says the hall is shut and reveals nothing about any
 * guest. Decoration: hidden from assistive technology. It never moves.
 */
export function ClosedSeal() {
  return (
    <div className="closed-seal" aria-hidden="true">
      <Seal state="dormant" />
      <Runes inscription="latveria" className="closed-seal-runes" />
    </div>
  );
}
