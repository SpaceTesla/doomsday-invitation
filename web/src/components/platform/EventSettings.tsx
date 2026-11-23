"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Heading } from "@/components/Heading";
import { Panel } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";
import { useEventPaths } from "@/components/throne/EventPaths";
import { ActionMessage, useAdminAction } from "@/components/throne/useAdminAction";
import { EventFields, type EventFieldValues } from "./EventFields";

/** An event's settings, and deleting it after a confirmation. */
export function EventSettings({
  initial,
  zones,
  zoneLocked,
}: {
  initial: EventFieldValues;
  zones: string[];
  zoneLocked: boolean;
}) {
  const router = useRouter();
  const paths = useEventPaths();
  const save = useAdminAction();
  const remove = useAdminAction();
  const [values, setValues] = useState(initial);
  const [confirming, setConfirming] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await save.run("PATCH", paths.api, values);
    if (!result.ok && result.status === 409) save.setMessage({ text: copy["13.40"], error: true });
  }

  async function deleteEvent() {
    const result = await remove.run("DELETE", paths.api, undefined, { refresh: false });
    setConfirming(false);
    // Gone already (deleted in another tab) is as good as deleted.
    if (result.ok || result.status === 404) {
      router.replace("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <Panel labelledBy="settings-heading">
        <h1 id="settings-heading" className="sr-only">
          {copy["13.38"]}
        </h1>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <EventFields values={values} onChange={setValues} zones={zones} zoneLocked={zoneLocked} />
          <div>
            <Button type="submit" disabled={save.busy}>
              {copy["13.39"]}
            </Button>
            <ActionMessage message={save.message} />
          </div>
        </form>
      </Panel>

      <Panel labelledBy="delete-heading">
        <Heading as="h2" id="delete-heading">
          {copy["13.41"]}
        </Heading>
        <p className="t-expl mt-3">{copy["13.42"]}</p>
        <QuietControl onClick={() => setConfirming(true)} disabled={remove.busy}>
          {copy["13.43"]}
        </QuietControl>
        <ActionMessage message={remove.message} />
      </Panel>

      <ConfirmDialog
        open={confirming}
        text={copy["13.44"]}
        confirmLabel={copy["13.44.confirm"]}
        cancelLabel={copy["13.44.cancel"]}
        busy={remove.busy}
        onConfirm={deleteEvent}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
