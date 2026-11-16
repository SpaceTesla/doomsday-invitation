import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { addressOf } from "@/domain/guests";
import type { GuestCouncil } from "@/domain/council";
import { localParts } from "@/domain/time";
import { dateTimeInWords } from "@/domain/words";
import { CouncilScreen } from "./CouncilScreen";
import type { CouncilData } from "./types";

const two = (n: number) => String(n).padStart(2, "0");

/** Turn the domain's view of the council into what the screen shows, in words. */
export function councilData(token: string, council: GuestCouncil, now: Date): CouncilData {
  const tz = council.timeZone;
  const today = localParts(now, tz);
  return {
    token,
    today: `${today.year}-${two(today.month)}-${two(today.day)}`,
    proposal: council.proposal
      ? { when: dateTimeInWords(council.proposal.at, tz), venue: council.proposal.venue }
      : null,
    decreed: council.decreed,
    count: council.count,
    notices: council.notices,
    you: {
      approves: council.you.approves,
      hasAlternative: council.you.alternativeAt !== null,
      characterId: council.you.characterId,
      removedCharacter: council.you.removedCharacter,
    },
    alternatives: council.alternatives.map((alternative) => ({
      when: dateTimeInWords(alternative.at, tz),
      who: addressOf(alternative),
      isYours: alternative.isYours,
    })),
    mantles: council.mantles.map((mantle) => ({
      id: mantle.id,
      name: mantle.name,
      faction: mantle.faction,
      holder: mantle.holder ? addressOf(mantle.holder) : null,
      isYours: mantle.isYours,
    })),
    // On the guest list a guest appears by name, without the title (design/DESIGN.md, 8.5).
    guests: council.guests.map((guest) => ({
      name: guest.name,
      status: guest.status,
      character: guest.character,
      isYou: guest.isYou,
    })),
  };
}

/** The council: the hall, then the proposal, the mantles and everyone summoned. */
export function Council({ data }: { data: CouncilData }) {
  return (
    <div className="cn">
      <header className="cn-hall">
        {/* The council mock crops the wide hall on every screen (board revision 5, section C). */}
        {/* eslint-disable-next-line @next/next/no-img-element -- the approved render, served as it is */}
        <img src="/art/hall-d-plate.jpg" alt="" decoding="async" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/hall-d-doom.webp" alt="" decoding="async" />
        <div className="cn-title">
          <Heading as="h1" size="title">
            {copy["6.1"]}
          </Heading>
        </div>
      </header>
      <CouncilScreen data={data} />
    </div>
  );
}
