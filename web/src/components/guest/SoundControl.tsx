"use client";

import { useSyncExternalStore } from "react";
import { copy } from "@/copy";
import { QuietControl } from "@/components/QuietControl";
import { onSoundChange, setSound, soundOn } from "@/lib/sound";

/**
 * The sound control, reachable on every screen after the opening (design/DESIGN.md,
 * section 6.9). A quiet control whose label states the current state (COPY.md 2.6).
 */
export function SoundControl() {
  const on = useSyncExternalStore(onSoundChange, soundOn, () => false);

  return (
    <div className="sound-control">
      <QuietControl aria-pressed={on} onClick={() => setSound(!on)}>
        {on ? copy["2.6.on"] : copy["2.6.off"]}
      </QuietControl>
    </div>
  );
}
