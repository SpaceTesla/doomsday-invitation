import { describe, expect, it } from "vitest";
import { addCharacter, claimCharacter, removeCharacter } from "@/domain/characters";
import { councilForGuest } from "@/domain/council";
import { finalise, setProposal } from "@/domain/proposal";
import { ist, setupDomain } from "../helpers/domain";

const t = setupDomain();
const { domain } = t;

async function character(name: string) {
  const added = await addCharacter(domain, name);
  if (!added.ok) throw new Error(added.reason);
  return added.id;
}

async function holdings() {
  const { rows } = await t
    .pool()
    .query(
      "select g.name as guest, c.name as character from guest g join character c on c.id = g.character_id order by g.name",
    );
  return rows as { guest: string; character: string }[];
}

describe("the roster", () => {
  it("refuses two entries with the same name, whatever the case or spacing", async () => {
    await character("Scarlet Witch");
    expect(await addCharacter(domain, "  scarlet witch ")).toEqual({
      ok: false,
      reason: "duplicate",
    });
    expect(await addCharacter(domain, "   ")).toEqual({ ok: false, reason: "no_name" });
  });

  it("removes a free character at once", async () => {
    const loki = await character("Loki");
    expect(await removeCharacter(domain, loki)).toEqual({ ok: true });
  });

  it("warns before removing a held character, naming the holder; confirmed, it sends them back to choose", async () => {
    const anish = await t.seatedGuest("Anish", "Mr.");
    const thor = await character("Thor");
    await claimCharacter(domain, anish.id, thor);

    expect(await removeCharacter(domain, thor)).toEqual({
      ok: false,
      reason: "held",
      holder: { title: "Mr.", name: "Anish" },
    });
    expect(await holdings()).toHaveLength(1);

    expect(await removeCharacter(domain, thor, { confirm: true })).toEqual({ ok: true });
    expect(await holdings()).toEqual([]);
    const council = await councilForGuest(domain, anish.id);
    expect(council?.you).toMatchObject({
      characterId: null,
      characterRemoved: true,
      removedCharacter: "Thor",
    });

    // Choosing again clears the message.
    const loki = await character("Loki");
    await claimCharacter(domain, anish.id, loki);
    expect((await councilForGuest(domain, anish.id))?.you.characterRemoved).toBe(false);
  });
});

describe("claiming a character", () => {
  it("gives a free character to a seated guest, and refuses a guest who is not seated", async () => {
    const thor = await character("Thor");
    const summoned = await t.summonedGuest("Ravi");
    expect(await claimCharacter(domain, summoned.id, thor)).toEqual({
      ok: false,
      reason: "not_seated",
    });
    const anish = await t.seatedGuest("Anish");
    expect(await claimCharacter(domain, anish.id, thor)).toEqual({ ok: true });
    // Claiming it again changes nothing.
    expect(await claimCharacter(domain, anish.id, thor)).toEqual({ ok: true });
    expect(await holdings()).toEqual([{ guest: "Anish", character: "Thor" }]);
  });

  it("refuses a character someone else holds, and names them", async () => {
    const thor = await character("Thor");
    const anish = await t.seatedGuest("Anish", "Mr.");
    const tara = await t.seatedGuest("Tara", "Ms.");
    await claimCharacter(domain, anish.id, thor);
    expect(await claimCharacter(domain, tara.id, thor)).toEqual({
      ok: false,
      reason: "taken",
      holder: { title: "Mr.", name: "Anish" },
    });
  });

  it("refuses a character that no longer exists", async () => {
    const anish = await t.seatedGuest("Anish");
    expect(await claimCharacter(domain, anish.id, "00000000-0000-4000-8000-000000000000")).toEqual({
      ok: false,
      reason: "unknown_character",
    });
  });

  it("changing frees the old character and takes the new one in a single step", async () => {
    const thor = await character("Thor");
    const loki = await character("Loki");
    const anish = await t.seatedGuest("Anish");
    const tara = await t.seatedGuest("Tara");
    await claimCharacter(domain, anish.id, thor);
    expect(await claimCharacter(domain, anish.id, loki)).toEqual({ ok: true });
    expect(await holdings()).toEqual([{ guest: "Anish", character: "Loki" }]);
    expect(await claimCharacter(domain, tara.id, thor)).toEqual({ ok: true });
  });

  it("keeps the old character when the new one is taken", async () => {
    const thor = await character("Thor");
    const loki = await character("Loki");
    const anish = await t.seatedGuest("Anish");
    const tara = await t.seatedGuest("Tara");
    await claimCharacter(domain, anish.id, thor);
    await claimCharacter(domain, tara.id, loki);
    expect((await claimCharacter(domain, anish.id, loki)).ok).toBe(false);
    expect(await holdings()).toEqual([
      { guest: "Anish", character: "Thor" },
      { guest: "Tara", character: "Loki" },
    ]);
  });

  it("after the decree allows a first choice but no change", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const thor = await character("Thor");
    const loki = await character("Loki");
    const anish = await t.seatedGuest("Anish");
    const late = await t.seatedGuest("Ravi");
    await claimCharacter(domain, anish.id, thor);
    await finalise(domain);

    expect(await claimCharacter(domain, anish.id, loki)).toEqual({
      ok: false,
      reason: "after_decree",
    });
    expect(await claimCharacter(domain, late.id, loki)).toEqual({ ok: true });
  });
});

describe("simultaneous choices", () => {
  it("twenty guests claiming one character at once: exactly one holds it, nineteen are told who", async () => {
    const thor = await character("Thor");
    const guests = [];
    for (let i = 0; i < 20; i += 1)
      guests.push(await t.seatedGuest(`Guest ${String(i).padStart(2, "0")}`));

    const results = await Promise.all(guests.map((g) => claimCharacter(domain, g.id, thor)));

    const winners = results.filter((r) => r.ok);
    const losers = results.filter((r) => !r.ok);
    expect(winners).toHaveLength(1);
    expect(losers).toHaveLength(19);
    const held = await holdings();
    expect(held).toHaveLength(1);
    for (const lost of losers) {
      // Every loser is told plainly who holds it now.
      expect(lost).toEqual({
        ok: false,
        reason: "taken",
        holder: { title: "", name: held[0].guest },
      });
    }
  });

  it("a change racing a claim never leaves anyone with two characters, or none by accident", async () => {
    for (let round = 0; round < 15; round += 1) {
      await t.pool().query("truncate alternative, guest, character restart identity cascade");
      const thor = await character("Thor");
      const loki = await character("Loki");
      const anish = await t.seatedGuest("Anish");
      const tara = await t.seatedGuest("Tara");
      const ravi = await t.seatedGuest("Ravi");
      await claimCharacter(domain, anish.id, thor);

      // Anish moves to Loki while Tara grabs Thor and Ravi grabs Loki.
      const [move] = await Promise.all([
        claimCharacter(domain, anish.id, loki),
        claimCharacter(domain, tara.id, thor),
        claimCharacter(domain, ravi.id, loki),
      ]);

      const held = await holdings();
      const characters = held.map((h) => h.character);
      expect(new Set(characters).size).toBe(characters.length);
      const anishHolds = held.find((h) => h.guest === "Anish")?.character;
      // Anish holds exactly one: the new one if the move won, the old one if it lost.
      expect(anishHolds).toBe(move.ok ? "Loki" : "Thor");
    }
  });
});
