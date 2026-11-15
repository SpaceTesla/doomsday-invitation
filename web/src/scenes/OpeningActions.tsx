"use client";

import { useEffect } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { QuietControl } from "@/components/QuietControl";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";
import { setSound } from "@/lib/sound";

/**
 * "Go with him" and "Go without sound". Neither is acceptance: both lead to the
 * summons, and record that the opening has been seen so it plays once. The choice of
 * sound is kept for the visit; nothing plays yet (sound is milestone 5).
 */
export function OpeningActions({ token }: { token: string }) {
  const action = useGuestAction(token, { changesStage: true });

  // Doom sees that the link was opened. A link-preview robot runs no script, so it
  // never counts as opening.
  useEffect(() => {
    void fetch(`/api/g/${token}/opened`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }).catch(() => null);
  }, [token]);

  async function go(sound: boolean) {
    setSound(sound);
    await action.run("POST", "opened", { played: true });
  }

  return (
    <>
      <div className="op-act">
        <Button onClick={() => go(true)} disabled={action.busy}>
          {copy["2.4"]}
        </Button>
        <QuietControl onClick={() => go(false)} disabled={action.busy}>
          {copy["2.5"]}
        </QuietControl>
      </div>
      <GuestMessageLine message={action.message} />
    </>
  );
}
