// The proposal, the council's approval, alternatives, and the decree.
// docs/PRODUCT_SPEC.md, Stages 5 and 6; docs/ARCHITECTURE.md, section 4.2.
//
// Approvals carry the proposal version they approved. Changing the proposal raises the
// version, so every earlier approval stops counting without a row being touched.
//
// Nothing here asks whether the guest holds a character: choosing a mantle is optional
// and never gates the council (PRODUCT_SPEC.md, Stage 3).
import { and, eq, sql } from "drizzle-orm";
import { alternative, event, guest } from "@/db/schema";
import { approvalRules } from "./approval";
import { nowOf, refuse, type Domain, type Refused } from "./context";
import { EVENT_ID, getEvent } from "./event";
import { isQuarterHour } from "./time";

const notDecreed = sql`(select ${event.finalisedAt} from ${event} where ${event.id} = 1) is null`;

// ---------------------------------------------------------------- Doom's proposal

export type ProposalRefusal = Refused<
  "no_event" | "after_decree" | "not_decreed" | "past" | "not_quarter_hour" | "no_venue"
>;

function checkWhenAndWhere(
  at: Date,
  venue: string,
  timeZone: string,
  now: Date,
): ProposalRefusal | null {
  if (!venue.trim()) return refuse("no_venue");
  if (!isQuarterHour(at, timeZone)) return refuse("not_quarter_hour");
  if (at.getTime() <= now.getTime()) return refuse("past");
  return null;
}

/**
 * Set or change the proposal, before the decree. A real change raises the version and
 * so clears every approval (unless the rules say approvals survive a change). Setting
 * the same date, time and venue again changes nothing.
 */
export async function setProposal(
  domain: Domain,
  at: Date,
  rawVenue: string,
): Promise<{ ok: true; changed: boolean } | ProposalRefusal> {
  const venue = rawVenue.trim();
  const row = await getEvent(domain);
  if (!row) return refuse("no_event");
  if (row.finalisedAt) return refuse("after_decree");
  const problem = checkWhenAndWhere(at, venue, row.timezone, nowOf(domain));
  if (problem) return problem;
  if (row.proposalAt?.getTime() === at.getTime() && row.proposalVenue === venue) {
    return { ok: true, changed: false };
  }

  const changed = await domain.db.transaction(async (tx) => {
    const rows = await tx
      .update(event)
      .set({
        proposalAt: at,
        proposalVenue: venue,
        proposalVersion: sql`${event.proposalVersion} + 1`,
      })
      .where(and(eq(event.id, EVENT_ID), sql`${event.finalisedAt} is null`))
      .returning({ version: event.proposalVersion });
    if (!rows.length) return false;
    if (!approvalRules.resetOnProposalChange) {
      await tx
        .update(guest)
        .set({ approvedVersion: rows[0].version })
        .where(eq(guest.approvedVersion, rows[0].version - 1));
    }
    return true;
  });
  return changed ? { ok: true, changed: true } : refuse("after_decree");
}

/** Decree the current proposal. Approval is advisory: any count will do. */
export async function finalise(
  domain: Domain,
): Promise<{ ok: true } | Refused<"no_event" | "no_proposal" | "not_enough_approvals">> {
  const row = await getEvent(domain);
  if (!row) return refuse("no_event");
  if (!row.proposalAt) return refuse("no_proposal");
  if (row.finalisedAt) return { ok: true };
  if (!approvalRules.advisory) {
    const { approved } = await approvalCount(domain);
    if (approved < approvalRules.approvalsNeeded) return refuse("not_enough_approvals");
  }
  await domain.db
    .update(event)
    .set({ finalisedAt: nowOf(domain) })
    .where(
      and(
        eq(event.id, EVENT_ID),
        sql`${event.finalisedAt} is null`,
        sql`${event.proposalAt} is not null`,
      ),
    );
  return { ok: true };
}

/** Change the decree after the fact. Guests are shown that it changed. */
export async function amendPlan(
  domain: Domain,
  at: Date,
  rawVenue: string,
): Promise<{ ok: true; changed: boolean } | ProposalRefusal> {
  const venue = rawVenue.trim();
  const row = await getEvent(domain);
  if (!row) return refuse("no_event");
  if (!row.finalisedAt) return refuse("not_decreed");
  const problem = checkWhenAndWhere(at, venue, row.timezone, nowOf(domain));
  if (problem) return problem;
  if (row.proposalAt?.getTime() === at.getTime() && row.proposalVenue === venue) {
    return { ok: true, changed: false };
  }
  await domain.db
    .update(event)
    .set({ proposalAt: at, proposalVenue: venue, planVersion: sql`${event.planVersion} + 1` })
    .where(and(eq(event.id, EVENT_ID), sql`${event.finalisedAt} is not null`));
  return { ok: true, changed: true };
}

// ---------------------------------------------------------------- approval

export type ApprovalRefusal = Refused<"not_seated" | "after_decree" | "no_proposal">;

async function explainApproval(domain: Domain, guestId: string): Promise<ApprovalRefusal> {
  const [row] = await domain.db
    .select({ status: guest.status })
    .from(guest)
    .where(eq(guest.id, guestId));
  if (!row || row.status !== "seated") return refuse("not_seated");
  const eventRow = await getEvent(domain);
  if (!eventRow?.proposalAt) return refuse("no_proposal");
  return refuse("after_decree");
}

/** Approve the current proposal. Approving twice counts once. */
export async function approve(
  domain: Domain,
  guestId: string,
): Promise<{ ok: true } | ApprovalRefusal> {
  const rows = await domain.db.execute(sql`
    update ${guest} set approved_version = e.proposal_version
    from ${event} e
    where ${guest.id} = ${guestId} and ${guest.status} = 'seated'
      and e.id = 1 and e.finalised_at is null and e.proposal_at is not null
    returning ${guest.id}
  `);
  return rows.rows.length ? { ok: true } : explainApproval(domain, guestId);
}

/** Withdraw an approval. Withdrawing one already withdrawn has no effect. */
export async function withdrawApproval(
  domain: Domain,
  guestId: string,
): Promise<{ ok: true } | ApprovalRefusal> {
  const rows = await domain.db
    .update(guest)
    .set({ approvedVersion: null })
    .where(and(eq(guest.id, guestId), eq(guest.status, "seated"), notDecreed))
    .returning({ id: guest.id });
  return rows.length ? { ok: true } : explainApproval(domain, guestId);
}

/**
 * How many seats approve the current proposal, against how many there are. Approvals of
 * an earlier proposal, and of declined or removed guests, never count.
 */
export async function approvalCount(domain: Domain): Promise<{ approved: number; total: number }> {
  const totalStatus =
    approvalRules.countAgainst === "seated"
      ? sql`g.status = 'seated'`
      : sql`g.status <> 'declined'`;
  const result = await domain.db.execute<{ approved: number; total: number }>(sql`
    select
      count(*) filter (where g.status = 'seated' and g.approved_version = e.proposal_version and e.proposal_at is not null)::int as approved,
      count(*) filter (where ${totalStatus})::int as total
    from ${guest} g cross join ${event} e
    where e.id = 1
  `);
  return result.rows[0] ?? { approved: 0, total: 0 };
}

/** Who approves the current proposal. For Doom's eyes only. */
export async function approvers(domain: Domain): Promise<{ title: string; name: string }[]> {
  const result = await domain.db.execute<{ title: string; name: string }>(sql`
    select g.title, g.name from ${guest} g cross join ${event} e
    where e.id = 1 and g.status = 'seated' and g.approved_version = e.proposal_version
      and e.proposal_at is not null
    order by g.invited_at, g.name
  `);
  return result.rows;
}

// ---------------------------------------------------------------- alternatives

export type AlternativeRefusal = Refused<
  "not_seated" | "after_decree" | "past" | "not_quarter_hour" | "same_as_proposal"
>;

/**
 * Put forward another date or time, never another venue. One per guest: a new one
 * replaces the old. A guest may approve and suggest at once.
 */
export async function proposeAlternative(
  domain: Domain,
  guestId: string,
  at: Date,
): Promise<{ ok: true; replaced: boolean } | AlternativeRefusal> {
  const eventRow = await getEvent(domain);
  const [row] = await domain.db
    .select({ status: guest.status })
    .from(guest)
    .where(eq(guest.id, guestId));
  if (!row || row.status !== "seated") return refuse("not_seated");
  if (!eventRow || eventRow.finalisedAt) return refuse("after_decree");
  if (!isQuarterHour(at, eventRow.timezone)) return refuse("not_quarter_hour");
  if (at.getTime() <= nowOf(domain).getTime()) return refuse("past");
  if (eventRow.proposalAt?.getTime() === at.getTime()) return refuse("same_as_proposal");

  const existing = await domain.db
    .select({ at: alternative.at })
    .from(alternative)
    .where(eq(alternative.guestId, guestId));
  await domain.db
    .insert(alternative)
    .values({ guestId, at, createdAt: nowOf(domain) })
    .onConflictDoUpdate({
      target: alternative.guestId,
      set: { at, createdAt: nowOf(domain) },
    });
  return { ok: true, replaced: existing.length > 0 };
}

export async function withdrawAlternative(
  domain: Domain,
  guestId: string,
): Promise<{ ok: true } | Refused<"after_decree">> {
  const eventRow = await getEvent(domain);
  if (eventRow?.finalisedAt) return refuse("after_decree");
  await domain.db.delete(alternative).where(eq(alternative.guestId, guestId));
  return { ok: true };
}
