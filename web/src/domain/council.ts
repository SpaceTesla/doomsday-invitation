// What the council looks like: for a guest, and for Doom.
//
// A guest's view never contains another guest's token, id or opened status, or who
// approved (docs/ARCHITECTURE.md, section 7.3). Doom's view contains everything.
import { asc, eq } from "drizzle-orm";
import { alternative, character, guest, type GuestStatus } from "@/db/schema";
import { type Domain } from "./context";
import { getEvent, type EventRow } from "./event";
import { approvalCount, approvers } from "./proposal";

export type Proposal = { at: Date; venue: string };

function proposalOf(row: EventRow | undefined): Proposal | null {
  return row?.proposalAt && row.proposalVenue
    ? { at: row.proposalAt, venue: row.proposalVenue }
    : null;
}

export type GuestCouncil = {
  timeZone: string;
  proposal: Proposal | null;
  decreed: boolean;
  count: { approved: number; total: number };
  you: {
    title: string;
    name: string;
    status: GuestStatus;
    characterId: string | null;
    approves: boolean;
    alternativeAt: Date | null;
    characterRemoved: boolean;
    /** The name of the character Doom removed from this guest, while the message stands. */
    removedCharacter: string | null;
  };
  notices: { proposalChanged: boolean; decreeAmended: boolean };
  guests: {
    title: string;
    name: string;
    status: GuestStatus;
    character: string | null;
    isYou: boolean;
  }[];
  mantles: {
    id: string;
    name: string;
    faction: string | null;
    holder: { title: string; name: string } | null;
    isYours: boolean;
  }[];
  alternatives: { at: Date; title: string; name: string; isYours: boolean }[];
};

/** The council as one guest sees it. Null if the guest no longer exists. */
export async function councilForGuest(
  domain: Domain,
  guestId: string,
): Promise<GuestCouncil | null> {
  const eventRow = await getEvent(domain);
  if (!eventRow) return null;

  const guestRows = await domain.db
    .select({
      id: guest.id,
      title: guest.title,
      name: guest.name,
      status: guest.status,
      characterId: guest.characterId,
      characterName: character.name,
      approvedVersion: guest.approvedVersion,
      seenProposal: guest.seenProposal,
      seenPlan: guest.seenPlan,
      characterRemoved: guest.characterRemoved,
      removedCharacterName: guest.removedCharacterName,
    })
    .from(guest)
    .leftJoin(character, eq(character.id, guest.characterId))
    .orderBy(asc(guest.invitedAt), asc(guest.name));
  const me = guestRows.find((row) => row.id === guestId);
  if (!me) return null;

  const roster = await domain.db
    .select({
      id: character.id,
      name: character.name,
      faction: character.faction,
      holderId: guest.id,
      holderTitle: guest.title,
      holderName: guest.name,
    })
    .from(character)
    .leftJoin(guest, eq(guest.characterId, character.id))
    .orderBy(asc(character.position), asc(character.createdAt), asc(character.name));

  const alternativeRows = await domain.db
    .select({
      guestId: alternative.guestId,
      at: alternative.at,
      title: guest.title,
      name: guest.name,
    })
    .from(alternative)
    .innerJoin(guest, eq(guest.id, alternative.guestId))
    .where(eq(guest.status, "seated"))
    .orderBy(asc(alternative.createdAt));

  const decreed = eventRow.finalisedAt !== null;
  const myAlternative = alternativeRows.find((row) => row.guestId === guestId);

  return {
    timeZone: eventRow.timezone,
    proposal: proposalOf(eventRow),
    decreed,
    count: await approvalCount(domain),
    you: {
      title: me.title,
      name: me.name,
      status: me.status,
      characterId: me.characterId,
      approves:
        me.status === "seated" &&
        eventRow.proposalAt !== null &&
        me.approvedVersion === eventRow.proposalVersion,
      alternativeAt: myAlternative?.at ?? null,
      characterRemoved: me.characterRemoved,
      removedCharacter: me.characterRemoved ? me.removedCharacterName : null,
    },
    notices: {
      // Shown once, to a guest who saw an earlier proposal or decree.
      proposalChanged:
        !decreed && me.seenProposal > 0 && me.seenProposal < eventRow.proposalVersion,
      decreeAmended: decreed && me.seenPlan > 0 && me.seenPlan < eventRow.planVersion + 1,
    },
    guests: guestRows.map((row) => ({
      title: row.title,
      name: row.name,
      status: row.status,
      character: row.characterName,
      isYou: row.id === guestId,
    })),
    mantles: roster.map((row) => ({
      id: row.id,
      name: row.name,
      faction: row.faction,
      holder:
        row.holderId && row.holderName !== null
          ? { title: row.holderTitle ?? "", name: row.holderName }
          : null,
      isYours: row.holderId === guestId,
    })),
    alternatives: alternativeRows.map((row) => ({
      at: row.at,
      title: row.title,
      name: row.name,
      isYours: row.guestId === guestId,
    })),
  };
}

export type AdminStatus = GuestStatus | "opened";

export type AdminCouncil = {
  timeZone: string | null;
  proposal: Proposal | null;
  decreed: boolean;
  count: { approved: number; total: number };
  approvers: { title: string; name: string }[];
  guests: {
    id: string;
    title: string;
    name: string;
    token: string | null;
    status: AdminStatus;
    character: string | null;
    approves: boolean;
    alternativeAt: Date | null;
  }[];
  characters: {
    id: string;
    name: string;
    faction: string | null;
    holder: { title: string; name: string } | null;
  }[];
};

/** The whole event as Doom sees it. */
export async function councilForAdmin(domain: Domain): Promise<AdminCouncil> {
  const eventRow = await getEvent(domain);
  const guestRows = await domain.db
    .select({
      id: guest.id,
      title: guest.title,
      name: guest.name,
      token: guest.token,
      status: guest.status,
      openedAt: guest.openedAt,
      characterName: character.name,
      approvedVersion: guest.approvedVersion,
      alternativeAt: alternative.at,
    })
    .from(guest)
    .leftJoin(character, eq(character.id, guest.characterId))
    .leftJoin(alternative, eq(alternative.guestId, guest.id))
    .orderBy(asc(guest.invitedAt), asc(guest.name));

  const roster = await domain.db
    .select({
      id: character.id,
      name: character.name,
      faction: character.faction,
      holderTitle: guest.title,
      holderName: guest.name,
    })
    .from(character)
    .leftJoin(guest, eq(guest.characterId, character.id))
    .orderBy(asc(character.position), asc(character.createdAt), asc(character.name));

  return {
    timeZone: eventRow?.timezone ?? null,
    proposal: proposalOf(eventRow),
    decreed: eventRow?.finalisedAt != null,
    count: await approvalCount(domain),
    approvers: await approvers(domain),
    guests: guestRows.map((row) => ({
      id: row.id,
      title: row.title,
      name: row.name,
      token: row.token,
      status: row.status === "summoned" && row.openedAt ? "opened" : row.status,
      character: row.characterName,
      approves:
        row.status === "seated" &&
        !!eventRow?.proposalAt &&
        row.approvedVersion === eventRow.proposalVersion,
      alternativeAt: row.status === "seated" ? row.alternativeAt : null,
    })),
    characters: roster.map((row) => ({
      id: row.id,
      name: row.name,
      faction: row.faction,
      holder:
        row.holderName !== null ? { title: row.holderTitle ?? "", name: row.holderName } : null,
    })),
  };
}

/** Everything in the event, for the panel's Export. */
export async function exportEvent(domain: Domain) {
  const eventRow = await getEvent(domain);
  const council = await councilForAdmin(domain);
  return {
    exportedAt: new Date().toISOString(),
    event: eventRow ?? null,
    ...council,
  };
}
