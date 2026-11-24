import { EventSettings } from "@/components/platform/EventSettings";
import { requirePageEvent } from "@/lib/admin";
import { timeZoneChoices } from "@/lib/zones";

export default async function EventSettingsPage(props: PageProps<"/dashboard/[eventId]/settings">) {
  const { event } = await requirePageEvent(props.params);
  return (
    <EventSettings
      initial={{ timeZone: event.timezone, hostName: event.hostName ?? "" }}
      zones={timeZoneChoices(event.timezone)}
      zoneLocked={event.proposalAt !== null}
    />
  );
}
