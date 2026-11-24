"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { copy } from "@/copy";
import { Button } from "@/components/Button";
import { Heading } from "@/components/Heading";
import { Panel } from "@/components/Panel";
import { ActionMessage, useAdminAction } from "@/components/throne/useAdminAction";
import { currentZoneName } from "@/lib/zones";
import { EventFields } from "./EventFields";

const noSubscription = () => () => {};
const browserZone = () => currentZoneName(Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");

/**
 * Create an event. It opens on its proposal, the first thing to set, with the default
 * roster ready; guests are summoned once a day is proposed.
 */
export function CreateEventForm({
  zones,
  defaultZone,
  hostName,
}: {
  zones: string[];
  defaultZone: string;
  hostName: string;
}) {
  const router = useRouter();
  const action = useAdminAction();
  const [host, setHost] = useState(hostName);
  // The zone starts as the organizer's own, once the browser can say what it is (the
  // server renders the default), until they choose another.
  const local = useSyncExternalStore(noSubscription, browserZone, () => "");
  const [chosenZone, setChosenZone] = useState<string | null>(null);
  const timeZone = chosenZone ?? (zones.includes(local) ? local : defaultZone);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = await action.run(
      "POST",
      "/api/events",
      { timeZone, hostName: host },
      { refresh: false },
    );
    const id = result.ok ? (result.data as { id?: number } | null)?.id : undefined;
    if (id) router.push(`/dashboard/${id}/proposal`);
  }

  return (
    <Panel labelledBy="new-event-heading">
      <Heading as="h2" id="new-event-heading">
        {copy["13.27"]}
      </Heading>
      <form onSubmit={submit} className="mt-4 grid gap-5" noValidate>
        <EventFields
          values={{ timeZone, hostName: host }}
          onChange={(next) => {
            if (next.timeZone !== timeZone) setChosenZone(next.timeZone);
            setHost(next.hostName);
          }}
          zones={zones}
        />
        <div>
          <Button type="submit" disabled={action.busy}>
            {copy["13.32"]}
          </Button>
          <ActionMessage message={action.message} />
        </div>
      </form>
    </Panel>
  );
}
