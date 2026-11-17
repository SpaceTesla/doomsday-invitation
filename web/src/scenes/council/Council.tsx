import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { Runes } from "@/components/Runes";
import { addressOf } from "@/domain/guests";
import type { GuestCouncil } from "@/domain/council";
import { localParts } from "@/domain/time";
import { dateTimeInWords } from "@/domain/words";
import { CouncilScreen } from "./CouncilScreen";
import { HallScene } from "./HallScene";
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

/**
 * The council: the throne hall as the room (fixed behind every step), its title, then the
 * proposal, the mantles and everyone summoned (design/DESIGN.md, 8.12 and 8.13).
 */
export function Council({ data }: { data: CouncilData }) {
  return (
    <HallScene token={data.token}>
      <header className="cn-head">
        {/* "justice" and "revenge" frame the title on wide screens, as they flank the
            summons plate. Engraved, never lit. Hidden on narrow screens. */}
        <span className="cn-flank" aria-hidden="true">
          <Runes inscription="justice" />
        </span>
        <Heading as="h1" size="title">
          {copy["6.1"]}
        </Heading>
        <span className="cn-flank" aria-hidden="true">
          <Runes inscription="revenge" />
        </span>
      </header>
      <CouncilScreen data={data} />
    </HallScene>
  );
}
