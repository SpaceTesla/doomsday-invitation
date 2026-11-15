import { GuestsPanel } from "@/components/throne/GuestsPanel";
import { councilForAdmin } from "@/domain/council";
import { serverDomain } from "@/lib/admin";

export default async function ThroneGuests() {
  const council = await councilForAdmin(serverDomain());
  return (
    <GuestsPanel
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
