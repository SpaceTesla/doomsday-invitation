import { describe, expect, it } from "vitest";
import { addCharacter, claimCharacter } from "@/domain/characters";
import { councilForAdmin, councilForGuest } from "@/domain/council";
import { leave, markSeen, removeGuest } from "@/domain/guests";
import {
  amendPlan,
  approvalCount,
  approve,
  approvers,
  finalise,
  proposeAlternative,
  setProposal,
  withdrawAlternative,
  withdrawApproval,
} from "@/domain/proposal";
import { ist, setupDomain } from "../helpers/domain";

const t = setupDomain();
const { domain } = t;

const FRIDAY = ist("2026-12-18 19:30");
const SATURDAY = ist("2026-12-19 18:00");

describe("Doom's proposal", () => {
  it("is set to a future quarter hour, with a venue", async () => {
    expect(await setProposal(domain, FRIDAY, "the Grand Cinema")).toEqual({
      ok: true,
      changed: true,
    });
    expect(await setProposal(domain, FRIDAY, "the Grand Cinema")).toEqual({
      ok: true,
      changed: false,
    });
    expect(await setProposal(domain, ist("2026-12-18 19:40"), "x")).toEqual({
      ok: false,
      reason: "not_quarter_hour",
    });
    expect(await setProposal(domain, ist("2026-11-30 19:30"), "x")).toEqual({
      ok: false,
      reason: "past",
    });
    expect(await setProposal(domain, SATURDAY, "  ")).toEqual({ ok: false, reason: "no_venue" });
  });

  it("changing the date, time or venue clears every approval", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const tara = await t.seatedGuest("Tara");
    await approve(domain, anish.id);
    await approve(domain, tara.id);
    expect(await approvalCount(domain)).toEqual({ approved: 2, total: 2 });

    await setProposal(domain, FRIDAY, "the Grand Cinema, in the fourth hall");
    expect(await approvalCount(domain)).toEqual({ approved: 0, total: 2 });
    expect((await councilForGuest(domain, anish.id))?.you.approves).toBe(false);
  });
});

describe("approving", () => {
  it("counts each seated guest once, against the seated guests", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish", "Mr.");
    await t.seatedGuest("Tara");
    await t.summonedGuest("Ravi");
    await approve(domain, anish.id);
    await approve(domain, anish.id);
    expect(await approvalCount(domain)).toEqual({ approved: 1, total: 2 });
    expect(await approvers(domain)).toEqual([{ title: "Mr.", name: "Anish" }]);
  });

  it("can be withdrawn, and withdrawing twice changes nothing", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    await approve(domain, anish.id);
    expect(await withdrawApproval(domain, anish.id)).toEqual({ ok: true });
    expect(await withdrawApproval(domain, anish.id)).toEqual({ ok: true });
    expect(await approvalCount(domain)).toEqual({ approved: 0, total: 1 });
  });

  it("never counts a guest who left or was removed", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const tara = await t.seatedGuest("Tara");
    const ravi = await t.seatedGuest("Ravi");
    for (const g of [anish, tara, ravi]) await approve(domain, g.id);
    await leave(domain, anish.id);
    await removeGuest(domain, tara.id);
    expect(await approvalCount(domain)).toEqual({ approved: 1, total: 1 });
  });

  it("is refused with nothing proposed, for a guest not seated, and after the decree", async () => {
    const anish = await t.seatedGuest("Anish");
    const ravi = await t.summonedGuest("Ravi");
    expect(await approve(domain, anish.id)).toEqual({ ok: false, reason: "no_proposal" });
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    expect(await approve(domain, ravi.id)).toEqual({ ok: false, reason: "not_seated" });
    await finalise(domain);
    expect(await approve(domain, anish.id)).toEqual({ ok: false, reason: "after_decree" });
    expect(await withdrawApproval(domain, anish.id)).toEqual({ ok: false, reason: "after_decree" });
  });
});

describe("alternatives", () => {
  it("one per guest: a new one replaces the old, and it can be withdrawn", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    expect(await proposeAlternative(domain, anish.id, SATURDAY)).toEqual({
      ok: true,
      replaced: false,
    });
    expect(await proposeAlternative(domain, anish.id, ist("2026-12-20 12:00"))).toEqual({
      ok: true,
      replaced: true,
    });
    const listed = (await councilForGuest(domain, anish.id))?.alternatives;
    expect(listed).toEqual([
      { at: ist("2026-12-20 12:00"), title: "", name: "Anish", isYours: true },
    ]);
    expect(await withdrawAlternative(domain, anish.id)).toEqual({ ok: true });
    expect(await withdrawAlternative(domain, anish.id)).toEqual({ ok: true });
    expect((await councilForGuest(domain, anish.id))?.alternatives).toEqual([]);
  });

  it("refuses a past day, a time off the quarter hour, and the proposal itself", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    expect(await proposeAlternative(domain, anish.id, ist("2026-11-30 18:00"))).toEqual({
      ok: false,
      reason: "past",
    });
    expect(await proposeAlternative(domain, anish.id, ist("2026-12-19 18:10"))).toEqual({
      ok: false,
      reason: "not_quarter_hour",
    });
    expect(await proposeAlternative(domain, anish.id, FRIDAY)).toEqual({
      ok: false,
      reason: "same_as_proposal",
    });
  });

  it("is refused after the decree", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    await finalise(domain);
    expect(await proposeAlternative(domain, anish.id, SATURDAY)).toEqual({
      ok: false,
      reason: "after_decree",
    });
  });
});

describe("a guest without a mantle takes full part in the council", () => {
  it("approves, withdraws, suggests and withdraws an alternative, then claims a mantle later", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const thor = await addCharacter(domain, "Thor");
    if (!thor.ok) throw new Error();
    const anish = await t.seatedGuest("Anish");

    const before = await councilForGuest(domain, anish.id);
    expect(before?.you.characterId).toBeNull();
    expect(before?.guests.find((g) => g.isYou)?.character).toBeNull();

    expect(await approve(domain, anish.id)).toEqual({ ok: true });
    expect(await approvalCount(domain)).toEqual({ approved: 1, total: 1 });
    expect(await withdrawApproval(domain, anish.id)).toEqual({ ok: true });
    expect(await approve(domain, anish.id)).toEqual({ ok: true });
    expect(await proposeAlternative(domain, anish.id, SATURDAY)).toEqual({
      ok: true,
      replaced: false,
    });
    expect(await withdrawAlternative(domain, anish.id)).toEqual({ ok: true });
    expect(await proposeAlternative(domain, anish.id, SATURDAY)).toEqual({
      ok: true,
      replaced: false,
    });

    // Still no mantle, and nothing was asked of them.
    const during = await councilForGuest(domain, anish.id);
    expect(during?.you).toMatchObject({
      characterId: null,
      approves: true,
      alternativeAt: SATURDAY,
    });

    expect(await claimCharacter(domain, anish.id, thor.id)).toEqual({ ok: true });
    const after = await councilForGuest(domain, anish.id);
    expect(after?.you).toMatchObject({
      characterId: thor.id,
      approves: true,
      alternativeAt: SATURDAY,
    });
    expect(after?.guests.find((g) => g.isYou)?.character).toBe("Thor");
  });
});

describe("the decree", () => {
  it("needs a proposal; any count will do", async () => {
    expect(await finalise(domain)).toEqual({ ok: false, reason: "no_proposal" });
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    await t.seatedGuest("Anish");
    expect(await finalise(domain)).toEqual({ ok: true });
    expect(await finalise(domain)).toEqual({ ok: true });
    expect(await setProposal(domain, SATURDAY, "elsewhere")).toEqual({
      ok: false,
      reason: "after_decree",
    });
  });

  it("can be amended only once decreed", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    expect(await amendPlan(domain, SATURDAY, "the Grand Cinema")).toEqual({
      ok: false,
      reason: "not_decreed",
    });
    await finalise(domain);
    expect(await amendPlan(domain, SATURDAY, "the Grand Cinema")).toEqual({
      ok: true,
      changed: true,
    });
    expect((await councilForAdmin(domain)).proposal).toEqual({
      at: SATURDAY,
      venue: "the Grand Cinema",
    });
  });
});

describe("notices", () => {
  it("tell a guest once that the proposal changed since they last looked", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    const first = await councilForGuest(domain, anish.id);
    expect(first?.notices).toEqual({ proposalChanged: false, decreeAmended: false });
    await markSeen(domain, anish.id);

    await setProposal(domain, SATURDAY, "the Grand Cinema");
    expect((await councilForGuest(domain, anish.id))?.notices.proposalChanged).toBe(true);
    await markSeen(domain, anish.id);
    expect((await councilForGuest(domain, anish.id))?.notices.proposalChanged).toBe(false);
  });

  it("do not greet a newcomer with a change they never saw", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    await setProposal(domain, SATURDAY, "the Grand Cinema");
    const tara = await t.seatedGuest("Tara");
    expect((await councilForGuest(domain, tara.id))?.notices.proposalChanged).toBe(false);
  });

  it("tell a guest once that the decree was amended", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish");
    await finalise(domain);
    await markSeen(domain, anish.id);
    expect((await councilForGuest(domain, anish.id))?.notices.decreeAmended).toBe(false);

    await amendPlan(domain, SATURDAY, "the Grand Cinema");
    expect((await councilForGuest(domain, anish.id))?.notices.decreeAmended).toBe(true);
    await markSeen(domain, anish.id);
    expect((await councilForGuest(domain, anish.id))?.notices.decreeAmended).toBe(false);
  });
});

describe("what a guest can see", () => {
  it("shows everyone summoned, but no token, id, opened state or approver", async () => {
    await setProposal(domain, FRIDAY, "the Grand Cinema");
    const anish = await t.seatedGuest("Anish", "Mr.");
    const tara = await t.summonedGuest("Tara", "Ms.");
    await approve(domain, anish.id);

    const council = await councilForGuest(domain, anish.id);
    const json = JSON.stringify(council);
    expect(json).not.toContain(tara.token);
    expect(json).not.toContain(anish.token);
    expect(json).not.toContain(tara.id);
    expect(json).not.toContain("opened");
    expect(council?.guests.map((g) => [g.name, g.status])).toEqual([
      ["Anish", "seated"],
      ["Tara", "summoned"],
    ]);
    expect(council?.count).toEqual({ approved: 1, total: 1 });
  });
});
