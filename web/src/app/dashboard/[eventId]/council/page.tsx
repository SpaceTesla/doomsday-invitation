import { CouncilPanel } from "@/components/throne/CouncilPanel";
import { councilForAdmin } from "@/domain/council";
import { dateTimeInWords } from "@/domain/words";
import { requirePageEvent } from "@/lib/admin";

const address = (g: { title: string; name: string }) => (g.title ? `${g.title} ${g.name}` : g.name);

export default async function ThroneCouncil(props: PageProps<"/dashboard/[eventId]/council">) {
  const { domain } = await requirePageEvent(props.params);
  const council = await councilForAdmin(domain);
  const timeZone = council.timeZone ?? "Asia/Kolkata";
  return (
    <CouncilPanel
      view={{
        proposal: council.proposal
          ? { when: dateTimeInWords(council.proposal.at, timeZone), venue: council.proposal.venue }
          : null,
        decreed: council.decreed,
        count: council.count,
        approvers: council.approvers.map(address),
        alternatives: council.guests
          .filter((guest) => guest.alternativeAt)
          .map((guest) => ({
            when: dateTimeInWords(guest.alternativeAt as Date, timeZone),
            who: address(guest),
          })),
      }}
    />
  );
}
