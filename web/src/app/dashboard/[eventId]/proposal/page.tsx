import { ProposalPanel } from "@/components/throne/ProposalPanel";
import { councilForAdmin } from "@/domain/council";
import { localParts } from "@/domain/time";
import { dateTimeInWords } from "@/domain/words";
import { requirePageEvent } from "@/lib/admin";

const two = (n: number) => String(n).padStart(2, "0");

export default async function ThroneProposal(props: PageProps<"/dashboard/[eventId]/proposal">) {
  const { domain } = await requirePageEvent(props.params);
  const council = await councilForAdmin(domain);
  const timeZone = council.timeZone ?? "Asia/Kolkata";
  const now = localParts(new Date(), timeZone);
  const at = council.proposal ? localParts(council.proposal.at, timeZone) : null;

  return (
    <ProposalPanel
      view={{
        words: council.proposal
          ? { when: dateTimeInWords(council.proposal.at, timeZone), venue: council.proposal.venue }
          : null,
        fields:
          council.proposal && at
            ? {
                day: `${at.year}-${two(at.month)}-${two(at.day)}`,
                hour: `${two(at.hour)}:${two(at.minute)}`,
                venue: council.proposal.venue,
              }
            : null,
        decreed: council.decreed,
        approvals: council.count.approved,
        today: `${now.year}-${two(now.month)}-${two(now.day)}`,
      }}
    />
  );
}
