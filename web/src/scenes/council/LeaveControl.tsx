"use client";

import { useState } from "react";
import { copy } from "@/copy";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { QuietControl } from "@/components/QuietControl";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";

/** Leaving the council, until the decree: a quiet control, confirmed first. */
export function LeaveControl({ token }: { token: string }) {
  const action = useGuestAction(token);
  const [confirming, setConfirming] = useState(false);

  async function leave() {
    await action.run("POST", "leave");
    setConfirming(false);
  }

  return (
    <div className="text-center">
      <QuietControl onClick={() => setConfirming(true)}>{copy["4.8"]}</QuietControl>
      <GuestMessageLine message={action.message} />
      <ConfirmDialog
        open={confirming}
        heading={copy["4.9"]}
        text={copy["4.10"]}
        confirmLabel={copy["4.11"]}
        cancelLabel={copy["4.12"]}
        busy={action.busy}
        onConfirm={leave}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
