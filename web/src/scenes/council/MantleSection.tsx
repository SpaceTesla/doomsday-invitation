"use client";

import { useEffect, useId, useRef, useState } from "react";
import { copy, fill } from "@/copy";
import { CornerBolts } from "@/components/CornerBolts";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { CuirassTile, SuitRune } from "@/components/Mark";
import { RuneBand } from "@/components/Runes";
import { SearchMark } from "@/components/SearchMark";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";
import { byFaction, factionName } from "@/domain/factions";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/motion";
import { useHall } from "./HallScene";
import type { CouncilData } from "./types";

/** Case and accents do not matter: "loki" finds Loki, "nunez" finds Nuñez. */
const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

/** A claim the server has confirmed, being shown to the guest (design/DESIGN.md, 8.15). */
export type Claim = { id: string; name: string };

/** The claim beat: about 3.8 s, then the council. A tap or a key ends it sooner. */
const BEAT = { turn: 0.3, rise: 0.6, respond: 0.95, band: 0.85, end: 3.8 };

/**
 * The mantles, one plate each, grouped under their factions. Choosing is optional and
 * gates nothing; a guest may claim a free mantle whenever they wish, and change it until
 * the decree. Taken mantles stay in place, marked, with who holds them. The guest's own
 * mantle is shown large at the top of the step, with the mantle's inscription lit.
 */
export function MantleSection({
  data,
  claim,
  onClaimed,
  onClaimShown,
}: {
  data: CouncilData;
  /** A confirmed claim whose beat is playing, or null. */
  claim: Claim | null;
  /** Called once the server has confirmed a claim. */
  onClaimed: (claim: Claim) => void;
  /** Called when the claim beat has ended (or was skipped). */
  onClaimShown: () => void;
}) {
  const action = useGuestAction(data.token);
  const { respond } = useHall();
  const [query, setQuery] = useState("");
  const searchId = useId();
  const { mantles, decreed } = data;
  // During the beat the claimed mantle is the guest's, whatever the page has refreshed to.
  const mine = claim?.id ?? data.you.characterId;
  const mineName = claim?.name ?? mantles.find((m) => m.id === mine)?.name ?? null;
  // After the decree a guest who holds a mantle keeps it; one who holds none may still choose.
  const locked = decreed && mine !== null;
  const sought = fold(query);
  const shown = sought ? mantles.filter((m) => fold(m.name).includes(sought)) : mantles;
  const groups = byFaction(shown);
  const allTaken = mantles.length > 0 && !mine && mantles.every((m) => m.holder !== null);
  const yoursRef = useRef<HTMLDivElement>(null);

  // The beat, once the claim is confirmed: the plate takes the mantle, the guest's mantle
  // rises at the top, the floor answers, the inscription lights; then the council.
  useEffect(() => {
    if (!claim) return;
    const still = prefersReducedMotion();
    const timers = [
      window.setTimeout(() => play("claim"), BEAT.turn * 1000),
      window.setTimeout(() => {
        yoursRef.current?.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
      }, BEAT.rise * 1000),
      window.setTimeout(respond, BEAT.respond * 1000),
      window.setTimeout(onClaimShown, BEAT.end * 1000),
    ];
    // A tap or a key ends the beat. The beat begins only once the server has answered, so
    // the press that made the claim is already over and cannot end it.
    const skip = () => onClaimShown();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [claim, respond, onClaimShown]);

  function plate(mantle: CouncilData["mantles"][number]) {
    const yours = mantle.id === mine;
    const claiming = yours && claim !== null;
    const taken = mantle.holder !== null && !yours;
    const content = (
      <>
        {claiming ? <span className="cn-char-fill" /> : null}
        {yours ? <SuitRune tone="emerald" /> : <CuirassTile tone={taken ? "dim" : "steel"} />}
        <span className="cn-cname">{mantle.name}</span>
        {yours ? <Label>{copy["5.4"]}</Label> : taken ? <Label>{copy["5.5"]}</Label> : <span />}
        {taken ? <span className="cn-holder">{mantle.holder}</span> : null}
      </>
    );
    const state = [yours && "is-yours", claiming && "is-claiming", taken && "is-taken"]
      .filter(Boolean)
      .join(" ");
    // A free mantle is a button, unless choosing is closed or a claim is being shown.
    // Taken and held mantles are announced, not offered.
    if (!taken && !yours && !locked && !claim) {
      return (
        <li key={mantle.id}>
          <button
            type="button"
            className={`cn-char ${state}`}
            aria-label={fill(copy["5.6"], { "[Character]": mantle.name })}
            disabled={action.busy}
            onClick={() => choose(mantle.id, mantle.name)}
          >
            {content}
          </button>
        </li>
      );
    }
    return (
      <li
        key={mantle.id}
        className={`cn-char ${state}`}
        aria-label={
          taken && mantle.holder
            ? fill(copy["5.7"], {
                "[Character]": mantle.name,
                "[Title] [Name]": mantle.holder,
              })
            : undefined
        }
      >
        {content}
      </li>
    );
  }

  async function choose(id: string, name: string) {
    // Only a claim the server has confirmed is ever celebrated; the beat starts in the same
    // update as the refreshed council, so the page never flashes on to the next step.
    const result = await action.run("PUT", "character", { characterId: id }, () =>
      onClaimed({ id, name }),
    );
    if (result.ok) return;
    const holder = (result.data as { holder?: { title: string; name: string } } | null)?.holder;
    if (result.error === "taken" && holder) {
      const who = holder.title ? `${holder.title} ${holder.name}` : holder.name;
      action.setMessage({
        text: fill(copy["5.9"], { "[Character]": name, "[Title] [Name]": who }),
        kind: "neutral",
        reload: true,
      });
    }
  }

  return (
    <section
      aria-labelledby="mantle-heading"
      className={claim ? "cn-mantle is-claiming" : "cn-mantle"}
    >
      <section className="panel-plate panel-plate--principal cn-chooser">
        <CornerBolts />
        <RuneBand
          inscription="to the viktor go the spoils"
          state={mine ? "lit" : "engraved"}
          sequence={claim !== null}
          delay={BEAT.band}
        />
        <Heading as="h2" id="mantle-heading">
          {copy["5.1"]}
        </Heading>

        {mine && mineName ? (
          <div className="cn-yours-wrap" ref={yoursRef}>
            <div className="cn-yours-clip">
              <div className="cn-yours">
                <SuitRune level={2} className="cn-yours-mark" />
                <div>
                  <Label>{copy["5.4"]}</Label>
                  <p className="cn-yours-name">{mineName}</p>
                </div>
                <p className="t-procl cn-yours-line" role={claim ? "status" : undefined}>
                  {fill(copy["5.8"], { "[Character]": mineName })}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <p className="t-expl mt-3">{copy["5.2"]}</p>

        {data.you.removedCharacter && !mine ? (
          <p className="notice">
            {fill(copy["5.10"], { "[Character]": data.you.removedCharacter })}
          </p>
        ) : null}
        {mantles.length === 0 ? <p className="notice">{copy["5.12"]}</p> : null}
        {allTaken ? <p className="notice">{copy["5.11"]}</p> : null}
        {locked ? <p className="notice">{copy["5.13"]}</p> : null}

        {mantles.length > 0 ? (
          <div className="cn-search">
            <label htmlFor={searchId}>
              <Label>{copy["5.15"]}</Label>
            </label>
            <div className="cn-search-field">
              <SearchMark />
              <input
                id={searchId}
                type="search"
                className="field field--serif"
                value={query}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {sought ? fill(copy["5.17"], { "[n]": String(shown.length) }) : ""}
            </p>
            {sought && shown.length === 0 ? <p className="notice">{copy["5.16"]}</p> : null}
          </div>
        ) : null}
        <GuestMessageLine message={action.message} busy={action.busy} />
      </section>

      {groups.map((group) => (
        <div key={group.faction ?? "none"} className="cn-faction">
          {group.faction ? (
            <h3 className="cn-faction-name t-faction">{factionName(group.faction)}</h3>
          ) : null}
          <ul className="cn-chars">{group.rows.map(plate)}</ul>
        </div>
      ))}
    </section>
  );
}
