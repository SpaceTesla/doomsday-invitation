import { CLIP_WAKE_PATH } from "@/marks/clipWake";
import { sealActive } from "@/marks/sealActive";
import { sealDormant } from "@/marks/sealDormant";
import { sealWaking } from "@/marks/sealWaking";
import type { MarkData } from "@/marks/types";
import { classes } from "./Mark";

// The three-band seal: gold for sovereignty, steel for science, emerald for sorcery.
// Its drawing is large (about 20 KB a state), so it is used only where the page is
// rendered on the server; the iris between scenes shows the same seal from its SVG file.

export type SealState = "dormant" | "waking" | "active";

const seals: Record<SealState, MarkData> = {
  dormant: sealDormant,
  waking: sealWaking,
  active: sealActive,
};

export function Seal({ state = "active", className }: { state?: SealState; className?: string }) {
  const data = seals[state];
  const defs =
    state === "waking"
      ? `<defs><clipPath id="clip-wake"><path d="${CLIP_WAKE_PATH}"/></clipPath></defs>`
      : "";
  return (
    <svg
      className={classes("seal-svg", className)}
      viewBox={data.viewBox}
      aria-hidden="true"
      focusable="false"
      // Trusted, build-time markup exported from the approved generator. Never user input.
      dangerouslySetInnerHTML={{ __html: defs + data.body }}
    />
  );
}
