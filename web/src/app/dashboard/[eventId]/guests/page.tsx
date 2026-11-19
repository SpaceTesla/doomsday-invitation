import { GuestsPanel } from "@/components/throne/GuestsPanel";
import { councilForAdmin } from "@/domain/council";
import { canSummon } from "@/domain/event";
import { requirePageEvent } from "@/lib/admin";

export default async function ThroneGuests(props: PageProps<"/dashboard/[eventId]/guests">) {
  const { domain, event } = await requirePageEvent(props.params);
  const council = await councilForAdmin(domain);
  return (
    <GuestsPanel
      canSummon={canSummon(event)}
      guests={council.guests.map((guest) => ({
        id: guest.id,
        title: guest.title as "" | "Mr." | "Ms." | "Dr.",
        name: guest.name,
        token: guest.token,
        status: guest.status,
        character: guest.character,
      }))}
    />
  );
}
