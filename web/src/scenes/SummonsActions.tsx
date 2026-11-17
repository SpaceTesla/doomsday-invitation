"use client";

import { useState } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { QuietControl } from "@/components/QuietControl";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";

/** "Take your seat", and the quiet control to decline, confirmed first. */
export function SummonsActions({ token }: { token: string }) {
  const action = useGuestAction(token, { changesStage: true });
  // Declining is a step back: the iris runs in reverse.
  const refusal = useGuestAction(token, { changesStage: true, back: true });
  const busy = action.busy || refusal.busy;
  const [confirming, setConfirming] = useState(false);

  async function decline() {
    // Close the dialog first: it sits in the top layer, above the iris that follows.
    setConfirming(false);
    await refusal.run("POST", "decline");
  }

  return (
    <>
      <div className="sm-act">
        <Button onClick={() => action.run("POST", "accept")} disabled={busy}>
          {copy["3.10"]}
        </Button>
        <QuietControl onClick={() => setConfirming(true)} disabled={busy}>
          {copy["3.11"]}
        </QuietControl>
      </div>
      <GuestMessageLine message={action.message ?? refusal.message} busy={busy && !confirming} />
      <ConfirmDialog
        open={confirming}
        heading={copy["4.1"]}
        text={copy["4.2"]}
        confirmLabel={copy["4.3"]}
        cancelLabel={copy["4.4"]}
        busy={busy}
        onConfirm={decline}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
