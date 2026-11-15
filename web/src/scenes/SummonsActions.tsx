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
  const [confirming, setConfirming] = useState(false);

  async function decline() {
    // Close the dialog first: it sits in the top layer, above the iris that follows.
    setConfirming(false);
    await action.run("POST", "decline");
  }

  return (
    <>
      <div className="sm-act">
        <Button onClick={() => action.run("POST", "accept")} disabled={action.busy}>
          {copy["3.10"]}
        </Button>
        <QuietControl onClick={() => setConfirming(true)} disabled={action.busy}>
          {copy["3.11"]}
        </QuietControl>
      </div>
      <GuestMessageLine message={action.message} busy={action.busy && !confirming} />
      <ConfirmDialog
        open={confirming}
        heading={copy["4.1"]}
        text={copy["4.2"]}
        confirmLabel={copy["4.3"]}
        cancelLabel={copy["4.4"]}
        busy={action.busy}
        onConfirm={decline}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
