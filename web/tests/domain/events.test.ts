import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { addCharacter, claimCharacter, holderOf, removeCharacter } from "@/domain/characters";
import { forEvent } from "@/domain/context";
import {
  approvalCount,
  approve,
  proposeAlternative,
  setProposal,
  withdrawAlternative,
} from "@/domain/proposal";
import { councilForAdmin, councilForGuest } from "@/domain/council";
import {
  claimUnownedEvents,
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  ownedEvent,
  updateEvent,
} from "@/domain/event";
import {
  accept,
  addGuest,
  cancelLink,
  decline,
  editGuest,
  findByToken,
  leave,
  markSeen,
  removeGuest,
  replaceLink,
} from "@/domain/guests";
import { runRetention } from "@/domain/retention";
import { DEFAULT_ROSTER } from "@/domain/roster";
import { insertEvent, ist, setupDomain, TIME_ZONE } from "../helpers/domain";

// Events as separate worlds (docs/ARCHITECTURE.md, section 4.4): each organizer sees only
// their own events, and no id from one event reaches into another, whichever function is
// handed it. The test's own event (`domain`) is "A"; each test makes a "B" beside it.

const t = setupDomain();
const { domain } = t;

async function organizer(id: string, email: string) {
  await t
    .pool()
    .query("insert into organizer (id, name, email) values ($1, $2, $3)", [id, id, email]);
  return id;
}

/** A second event, B, with one seated guest holding Thor of B's own roster. */
async function eventB() {
  const id = await insertEvent(t.pool());
  const b = forEvent(domain, id);
  const thor = await addCharacter(b, "Thor");
  if (!thor.ok) throw new Error();
  const guest = await addGuest(b, { name: "Bea", title: "" });
  if (!guest.ok) throw new Error();
  await accept(b, guest.id);
  await claimCharacter(b, guest.id, thor.id);
  return { b, id, thorId: thor.id, guest };
}

async function guestRow(id: string) {
  const { rows } = await t.pool().query("select * from guest where id = $1", [id]);
  return rows[0];
}

describe("events and their owners", () => {
  it("creates an event with the default roster, the same one migration 0002 seeded", async () => {
    const owner = await organizer("o1", "one@example.test");
    const created = await createEvent(domain, owner, {
      timeZone: "Europe/London",
      hostName: "  ",
    });
    if (!created.ok) throw new Error(created.reason);
    const row = await getEvent(forEvent(domain, created.id));
    expect(row).toMatchObject({ hostName: null, timezone: "Europe/London" });
    const { rows } = await t
      .pool()
      .query<{ name: string; faction: string; position: number }>(
        "select name, faction, position from character where event_id = $1 order by faction, position",
        [created.id],
      );
    expect(rows).toHaveLength(38);

    // The TypeScript roster and the migration's are the same list, entry for entry.
    const migration = fs.readFileSync(
      path.resolve(__dirname, "..", "..", "drizzle", "0002_doomsday_roster.sql"),
      "utf8",
    );
    const seeded = [
      ...migration.matchAll(/\('((?:[^']|'')+)', '(?:[^']|'')+', '([a-z-]+)', (\d+)\)/g),
    ].map(([, name, faction, position]) => ({
      name: name.replaceAll("''", "'"),
      faction,
      position: Number(position),
    }));
    expect(seeded).toHaveLength(38);
    expect([...DEFAULT_ROSTER]).toEqual(seeded);
  });

  it("refuses an unknown zone", async () => {
    const owner = await organizer("o1", "one@example.test");
    expect(await createEvent(domain, owner, { timeZone: "Mars/Olympus", hostName: "" })).toEqual({
      ok: false,
      reason: "bad_time_zone",
    });
  });

  it("lists and opens only an organizer's own events", async () => {
    const one = await organizer("o1", "one@example.test");
    const two = await organizer("o2", "two@example.test");
    const a = await createEvent(domain, one, { timeZone: "UTC", hostName: "" });
    const b = await createEvent(domain, two, { timeZone: "UTC", hostName: "" });
    if (!a.ok || !b.ok) throw new Error();
    expect((await listEvents(domain, one)).map((e) => e.id)).toEqual([a.id]);
    expect((await listEvents(domain, two)).map((e) => e.id)).toEqual([b.id]);
    expect(await ownedEvent(domain, one, a.id)).not.toBeNull();
    expect(await ownedEvent(domain, one, b.id)).toBeNull();
    expect(await ownedEvent(domain, two, a.id)).toBeNull();
    // The test's own event has no owner: nobody owns it.
    expect(await ownedEvent(domain, one, t.eventId())).toBeNull();
    expect(await ownedEvent(domain, one, 0)).toBeNull();
    expect(await ownedEvent(domain, one, Number.NaN)).toBeNull();
  });

  it("counts summoned and seated guests per event", async () => {
    const one = await organizer("o1", "one@example.test");
    await t.pool().query("update event set organizer_id = $1 where id = $2", [one, t.eventId()]);
    await t.seatedGuest("Anish");
    await t.summonedGuest("Ravi");
    await eventB();
    const [summary] = await listEvents(domain, one);
    expect(summary).toMatchObject({ summoned: 2, seated: 1, decreed: false, proposalAt: null });
  });

  it("changes the zone only while nothing is proposed", async () => {
    expect(await updateEvent(domain, { timeZone: "Europe/London", hostName: "Arjun" })).toEqual({
      ok: true,
    });
    expect(await getEvent(domain)).toMatchObject({
      hostName: "Arjun",
      timezone: "Europe/London",
    });
    await updateEvent(domain, { timeZone: TIME_ZONE, hostName: "Arjun" });
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    expect(await updateEvent(domain, { timeZone: "Europe/London", hostName: "" })).toEqual({
      ok: false,
      reason: "zone_fixed",
    });
  });

  it("deletes an event with everything in it, and nothing of any other event", async () => {
    const anish = await t.seatedGuest("Anish");
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    await proposeAlternative(domain, anish.id, ist("2026-12-19 18:00"));
    const { b, guest } = await eventB();
    await deleteEvent(domain);
    expect(await findByToken(domain, anish.token)).toBeNull();
    expect(await findByToken(domain, guest.token)).not.toBeNull();
    const { rows } = await t.pool().query(`
      select (select count(*) from event)::int as events, (select count(*) from guest)::int as guests,
             (select count(*) from character)::int as characters, (select count(*) from alternative)::int as alternatives`);
    expect(rows[0]).toEqual({ events: 1, guests: 1, characters: 1, alternatives: 0 });
    expect(await getEvent(b)).toBeDefined();
  });
});

describe("claiming the first event", () => {
  it("gives every unowned event to the organizer with that email, and never an owned one", async () => {
    const owner = await organizer("owner", "Owner@Example.test");
    const other = await organizer("other", "other@example.test");
    const owned = await createEvent(domain, other, {
      timeZone: "UTC",
      hostName: "",
    });
    if (!owned.ok) throw new Error();
    const anish = await t.seatedGuest("Anish");

    expect(await claimUnownedEvents(domain, "nobody@example.test")).toBeNull();
    expect(await claimUnownedEvents(domain, " owner@example.TEST ", "Shivansh")).toEqual([
      t.eventId(),
    ]);
    expect(await getEvent(domain)).toMatchObject({ organizerId: owner, hostName: "Shivansh" });
    expect((await ownedEvent(domain, other, owned.id))?.organizerId).toBe(other);
    // Claiming again changes nothing.
    expect(await claimUnownedEvents(domain, "other@example.test")).toEqual([]);
    // The guest's link is the same link and still opens the same event.
    expect((await findByToken(domain, anish.token))?.event.id).toBe(t.eventId());
  });
});

describe("no id from one event reaches into another", () => {
  it("a link opens its own guest and its own event, nothing else", async () => {
    const anish = await t.seatedGuest("Anish");
    const { id, guest } = await eventB();
    expect((await findByToken(domain, anish.token))?.event.id).toBe(t.eventId());
    const found = await findByToken(domain, guest.token);
    expect(found?.event.id).toBe(id);
    expect(found?.guest.name).toBe("Bea");
  });

  it("the organizer's guest actions refuse a guest of another event", async () => {
    const { guest } = await eventB();
    const before = await guestRow(guest.id);
    expect(await editGuest(domain, guest.id, { name: "Hijacked", title: "" })).toEqual({
      ok: false,
      reason: "unknown_guest",
    });
    expect(await replaceLink(domain, guest.id)).toEqual({ ok: false, reason: "unknown_guest" });
    expect(await cancelLink(domain, guest.id)).toEqual({ ok: false, reason: "unknown_guest" });
    await removeGuest(domain, guest.id);
    expect(await guestRow(guest.id)).toEqual(before);
  });

  it("the guest's actions refuse a guest of another event", async () => {
    const { guest } = await eventB();
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const before = await guestRow(guest.id);
    expect(await accept(domain, guest.id)).toEqual({ ok: false, reason: "unknown_guest" });
    expect(await decline(domain, guest.id)).toEqual({ ok: false, reason: "unknown_guest" });
    expect(await leave(domain, guest.id)).toEqual({ ok: false, reason: "unknown_guest" });
    expect(await approve(domain, guest.id)).toEqual({ ok: false, reason: "not_seated" });
    expect(await proposeAlternative(domain, guest.id, ist("2026-12-19 18:00"))).toEqual({
      ok: false,
      reason: "not_seated",
    });
    await markSeen(domain, guest.id);
    expect(await guestRow(guest.id)).toEqual(before);
  });

  it("an alternative of another event's guest cannot be withdrawn from this one", async () => {
    const { b, guest } = await eventB();
    await setProposal(b, ist("2026-12-18 19:30"), "the Grand Cinema");
    await proposeAlternative(b, guest.id, ist("2026-12-19 18:00"));
    await withdrawAlternative(domain, guest.id);
    const { rows } = await t
      .pool()
      .query("select 1 from alternative where guest_id = $1", [guest.id]);
    expect(rows).toHaveLength(1);
  });

  it("a guest cannot claim, and the organizer cannot remove, a character of another event", async () => {
    const anish = await t.seatedGuest("Anish");
    const { thorId, guest } = await eventB();
    expect(await claimCharacter(domain, anish.id, thorId)).toEqual({
      ok: false,
      reason: "unknown_character",
    });
    expect((await guestRow(anish.id)).character_id).toBeNull();
    // Another event's holder is never named, and its character is never removed.
    expect(await holderOf(domain, thorId)).toBeNull();
    expect(await removeCharacter(domain, thorId, { confirm: true })).toEqual({ ok: true });
    expect((await guestRow(guest.id)).character_id).toBe(thorId);
    expect((await guestRow(guest.id)).character_removed).toBe(false);
  });

  it("each event has its own roster: the same name may be on both", async () => {
    const { b } = await eventB();
    expect((await addCharacter(domain, "Thor")).ok).toBe(true);
    expect(await addCharacter(b, "thor")).toEqual({ ok: false, reason: "duplicate" });
  });

  it("counts, councils and exports hold only their own event", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    await approve(domain, anish.id);
    const { b, guest } = await eventB();
    await setProposal(b, ist("2026-12-20 19:30"), "the Rival Hall");
    await approve(b, guest.id);
    await proposeAlternative(b, guest.id, ist("2026-12-21 18:00"));

    expect(await approvalCount(domain)).toEqual({ approved: 1, total: 1 });
    expect(await approvalCount(b)).toEqual({ approved: 1, total: 1 });

    const council = await councilForGuest(domain, anish.id);
    expect(council?.guests.map((g) => g.name)).toEqual(["Anish"]);
    expect(council?.mantles).toEqual([]);
    expect(council?.alternatives).toEqual([]);
    expect(council?.proposal?.venue).toBe("the Grand Cinema");
    // Another event's guest is not in this council at all.
    expect(await councilForGuest(domain, guest.id)).toBeNull();

    const admin = await councilForAdmin(domain);
    expect(admin.guests.map((g) => g.name)).toEqual(["Anish"]);
    expect(admin.characters).toEqual([]);
    expect(admin.approvers).toEqual([{ title: "", name: "Anish" }]);
  });

  it("the decree of one event does not freeze another", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const { b, guest } = await eventB();
    await setProposal(b, ist("2026-12-20 19:30"), "the Rival Hall");
    const { finalise } = await import("@/domain/proposal");
    await finalise(b);
    // A decreed: B's guest cannot leave; this event's guest still can.
    expect(await leave(b, guest.id)).toEqual({ ok: false, reason: "after_decree" });
    expect(await leave(domain, anish.id)).toEqual({ ok: true });
  });

  it("retention deletes only the event whose time has come", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const { b, guest } = await eventB();
    await setProposal(b, ist("2027-03-01 19:30"), "the Rival Hall");
    t.setNow(ist("2027-01-18 00:00"));
    const result = await runRetention(domain);
    expect(result).toEqual({ deleted: true, events: [t.eventId()] });
    expect(await findByToken(domain, anish.token)).toBeNull();
    expect(await findByToken(domain, guest.token)).not.toBeNull();
    expect(await getEvent(b)).toBeDefined();
  });
});
