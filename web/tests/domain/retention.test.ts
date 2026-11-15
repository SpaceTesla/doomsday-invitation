import { describe, expect, it } from "vitest";
import { addCharacter, claimCharacter } from "@/domain/characters";
import { expiresAt, getEvent } from "@/domain/event";
import { findByToken } from "@/domain/guests";
import { proposeAlternative, setProposal } from "@/domain/proposal";
import { runRetention } from "@/domain/retention";
import { ist, setupDomain } from "../helpers/domain";

const t = setupDomain();
const { domain } = t;

async function counts() {
  const { rows } = await t.pool().query(`
    select (select count(*) from event)::int as event, (select count(*) from guest)::int as guest,
           (select count(*) from character)::int as character, (select count(*) from alternative)::int as alternative`);
  return rows[0];
}

describe("retention", () => {
  it("does nothing while nothing is proposed", async () => {
    await t.seatedGuest("Anish");
    t.setNow(ist("2030-01-01 00:00"));
    expect((await runRetention(domain)).deleted).toBe(false);
  });

  it("deletes everything thirty days after the day, not a moment before, and is safe to run twice", async () => {
    await setProposal(domain, ist("2026-12-18 19:30"), "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const thor = await addCharacter(domain, "Thor");
    if (!thor.ok) throw new Error();
    await claimCharacter(domain, anish.id, thor.id);
    await proposeAlternative(domain, anish.id, ist("2026-12-19 18:00"));

    // The day ends at midnight on the 18th, India time; thirty days later is the 17th of January.
    expect(expiresAt((await getEvent(domain))!)).toEqual(ist("2027-01-18 00:00"));

    t.setNow(ist("2027-01-17 23:59"));
    expect((await runRetention(domain)).deleted).toBe(false);
    expect(await findByToken(domain, anish.token)).not.toBeNull();

    t.setNow(ist("2027-01-18 00:00"));
    // The link stops working from that moment, whether or not the job has run.
    expect(await findByToken(domain, anish.token)).toBeNull();
    expect((await runRetention(domain)).deleted).toBe(true);
    expect(await counts()).toEqual({ event: 0, guest: 0, character: 0, alternative: 0 });

    expect((await runRetention(domain)).deleted).toBe(false);
  });
});
