"use client";

import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { PanelActions } from "@/components/Panel";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";

/** "Take your seat" again: the same label as on the summons, because it does the same thing. */
export function ClosingActions({ token }: { token: string }) {
  const action = useGuestAction(token, { changesStage: true });
  return (
    <>
      <PanelActions>
        <Button onClick={() => action.run("POST", "accept")} disabled={action.busy}>
          {copy["4.7"]}
        </Button>
      </PanelActions>
      <GuestMessageLine message={action.message} busy={action.busy} />
    </>
  );
}
