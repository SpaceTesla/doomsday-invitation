import { describe, expect, it } from "vitest";
import { claimCharacter, addCharacter } from "@/domain/characters";
import { getEvent } from "@/domain/event";
import {
  accept,
  addGuest,
  addressOf,
  cancelLink,
  decline,
  editGuest,
  findByToken,
  leave,
  recordOpened,
  recordOpeningPlayed,
  removeGuest,
  replaceLink,
  stageOf,
} from "@/domain/guests";
import { approve, finalise, proposeAlternative, setProposal } from "@/domain/proposal";
import { looksLikeGuestToken } from "@/domain/tokens";
import { ist, setupDomain } from "../helpers/domain";

const t = setupDomain();
const { domain } = t;

async function guestRow(id: string) {
  const { rows } = await t.pool().query("select * from guest where id = $1", [id]);
  return rows[0];
}

describe("guests and their links", () => {
  it("adds a guest with a title and a 256-bit link", async () => {
    const added = await addGuest(domain, { name: "  Anish ", title: "Mr." });
    expect(added.ok).toBe(true);
    if (!added.ok) return;
    expect(added.token).toHaveLength(43);
    expect(looksLikeGuestToken(added.token)).toBe(true);
    const row = await guestRow(added.id);
    expect(row).toMatchObject({ name: "Anish", title: "Mr.", status: "summoned" });
    expect(addressOf(row)).toBe("Mr. Anish");
    expect(addressOf({ title: "", name: "Anish" })).toBe("Anish");
  });

  it("stores the name exactly as typed, accents included", async () => {
    const added = await addGuest(domain, { name: "José Nuñez-de la Vega", title: "" });
    if (!added.ok) throw new Error();
    expect((await guestRow(added.id)).name).toBe("José Nuñez-de la Vega");
  });

  it("refuses a guest with no name or an unknown title", async () => {
    expect(await addGuest(domain, { name: "   ", title: "" })).toEqual({
      ok: false,
      reason: "no_name",
    });
    // @ts-expect-error: a title the panel never offers
    expect(await addGuest(domain, { name: "Anish", title: "Sir" })).toEqual({
      ok: false,
      reason: "bad_title",
    });
  });

  it("gives every guest a different link", async () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 12; i += 1) {
      const added = await addGuest(domain, { name: `Guest ${i}`, title: "" });
      if (added.ok) tokens.add(added.token);
    }
    expect(tokens.size).toBe(12);
  });

  it("corrects a name and title", async () => {
    const added = await t.summonedGuest("Anish");
    expect(await editGuest(domain, added.id, { name: "Anisha", title: "Ms." })).toEqual({
      ok: true,
    });
    expect(await guestRow(added.id)).toMatchObject({ name: "Anisha", title: "Ms." });
  });

  it("finds a guest by link, and nobody by a link that is malformed, unknown, replaced or cancelled", async () => {
    const added = await t.summonedGuest("Anish");
    expect((await findByToken(domain, added.token))?.guest.id).toBe(added.id);
    expect(await findByToken(domain, "short")).toBeNull();
    expect(await findByToken(domain, "x".repeat(43))).toBeNull();

    const replaced = await replaceLink(domain, added.id);
    if (!replaced.ok) throw new Error();
    expect(await findByToken(domain, added.token)).toBeNull();
    expect((await findByToken(domain, replaced.token))?.guest.id).toBe(added.id);

    await cancelLink(domain, added.id);
    expect(await findByToken(domain, replaced.token)).toBeNull();
  });

  it("removes a guest who has answered: their character, approval and alternative go with them", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const tara = await t.seatedGuest("Tara");
    const thor = await addCharacter(domain, "Thor");
    if (!thor.ok) throw new Error();
    await claimCharacter(domain, anish.id, thor.id);
    await approve(domain, anish.id);
    await proposeAlternative(domain, anish.id, ist("2026-12-19 18:00"));

    await removeGuest(domain, anish.id);
    expect(await findByToken(domain, anish.token)).toBeNull();
    const { rows } = await t.pool().query("select count(*)::int as n from alternative");
    expect(rows[0].n).toBe(0);
    // The character is free again.
    expect(await claimCharacter(domain, tara.id, thor.id)).toEqual({ ok: true });
  });
});

describe("the stage a link opens on", () => {
  it("plays the opening once, then the summons, then the council", async () => {
    const added = await t.summonedGuest("Anish");
    const stage = async () => {
      const found = await findByToken(domain, added.token);
      if (!found) throw new Error();
      return stageOf(found.guest, found.event, t.domain.now!());
    };
    expect(await stage()).toBe("opening");
    await recordOpened(domain, added.id);
    expect(await stage()).toBe("opening");
    await recordOpeningPlayed(domain, added.id);
    expect(await stage()).toBe("summons");
    await accept(domain, added.id);
    expect(await stage()).toBe("council");
  });

  it("shows a declined guest the closing screen, and after the day the day has passed", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const declined = await t.summonedGuest("Tara");
    await decline(domain, declined.id);
    const never = await t.summonedGuest("Ravi");
    const seated = await t.seatedGuest("Anish");

    const stage = async (token: string) => {
      const found = await findByToken(domain, token);
      if (!found) throw new Error();
      return stageOf(found.guest, found.event, t.domain.now!());
    };
    expect(await stage(declined.token)).toBe("closing");

    t.setNow(ist("2026-12-19 00:00"));
    expect(await stage(declined.token)).toBe("day_passed");
    expect(await stage(never.token)).toBe("day_passed");
    expect(await stage(seated.token)).toBe("council");
  });
});

describe("answering the summons", () => {
  it("accepting twice leaves the guest seated once", async () => {
    const added = await t.summonedGuest("Anish");
    expect(await accept(domain, added.id)).toEqual({ ok: true });
    expect(await accept(domain, added.id)).toEqual({ ok: true });
    expect((await guestRow(added.id)).status).toBe("seated");
  });

  it("lets a declined guest return and accept until the end of the day, and not after", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const tara = await t.summonedGuest("Tara");
    const ravi = await t.summonedGuest("Ravi");
    expect(await decline(domain, tara.id)).toEqual({ ok: true });
    expect(await decline(domain, tara.id)).toEqual({ ok: true });

    t.setNow(ist("2026-12-18 23:59"));
    expect(await accept(domain, tara.id)).toEqual({ ok: true });

    t.setNow(ist("2026-12-19 00:00"));
    expect(await accept(domain, ravi.id)).toEqual({ ok: false, reason: "after_day" });
  });

  it("measures the day from the decree, which an amendment can move", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    await finalise(domain);
    const ravi = await t.summonedGuest("Ravi");
    t.setNow(ist("2026-12-19 10:00"));
    expect(await accept(domain, ravi.id)).toEqual({ ok: false, reason: "after_day" });
  });

  it("has no cut-off while nothing is proposed", async () => {
    const ravi = await t.summonedGuest("Ravi");
    t.setNow(ist("2027-06-01 10:00"));
    expect(await accept(domain, ravi.id)).toEqual({ ok: true });
  });

  it("does not let a seated guest decline: they leave the council instead", async () => {
    const anish = await t.seatedGuest("Anish");
    expect(await decline(domain, anish.id)).toEqual({ ok: false, reason: "seated" });
  });
});

describe("leaving the council", () => {
  it("frees the character and strikes out the approval and the alternative, together", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const thor = await addCharacter(domain, "Thor");
    if (!thor.ok) throw new Error();
    await claimCharacter(domain, anish.id, thor.id);
    await approve(domain, anish.id);
    await proposeAlternative(domain, anish.id, ist("2026-12-19 18:00"));

    expect(await leave(domain, anish.id)).toEqual({ ok: true });
    const row = await guestRow(anish.id);
    expect(row).toMatchObject({ status: "declined", character_id: null, approved_version: null });
    const { rows } = await t.pool().query("select count(*)::int as n from alternative");
    expect(rows[0].n).toBe(0);
    // Leaving twice has no further effect.
    expect(await leave(domain, anish.id)).toEqual({ ok: true });
  });

  it("is refused after the decree, and nothing is freed", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const thor = await addCharacter(domain, "Thor");
    if (!thor.ok) throw new Error();
    await claimCharacter(domain, anish.id, thor.id);
    await finalise(domain);

    expect(await leave(domain, anish.id)).toEqual({ ok: false, reason: "after_decree" });
    expect(await guestRow(anish.id)).toMatchObject({ status: "seated", character_id: thor.id });
  });
});

describe("the event", () => {
  // There is no longer one event per database: the domain reads the event it is scoped to.
  it("is the domain's own event, in its time zone, with nothing proposed", async () => {
    const row = await getEvent(domain);
    expect(row).toMatchObject({ id: t.eventId(), timezone: "Asia/Kolkata", proposalVersion: 0 });
  });
});
