"use client";

import { useRef, useState } from "react";
import { copy } from "@/copy";
import { Label } from "@/components/Label";
import { CuirassTile, Mask, SealMark, SuitRune } from "@/components/Mark";
import { Panel, Well } from "@/components/Panel";
import { morph } from "@/lib/morph";
import { MantleCard } from "./MantleCard";
import type { CouncilData } from "./types";

const statusWord = {
  summoned: copy["6.5"],
  seated: copy["6.6"],
  declined: copy["6.7"],
} as const;

const CARD_ID = "mantle-card";

function StatusMark({ status }: { status: CouncilData["guests"][number]["status"] }) {
  if (status === "seated") return <SuitRune tone="emerald" />;
  if (status === "declined") return <CuirassTile tone="dim" />;
  return <SealMark />;
}

/**
 * Everyone summoned, with their status and mantle; Doom heads the list as its
 * sovereign and is not counted. design/DESIGN.md, section 8.9. No row carries a link,
 * an id or whether the guest has opened their summons.
 *
 * A held mantle can be opened in full (8.18): pressing it raises its card above the list,
 * moving out of the row, and closing it returns the card into the row.
 */
export function GuestList({
  guests,
  doomName,
}: {
  guests: CouncilData["guests"];
  doomName: CouncilData["doomName"];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const summoned = guests.length;
  const seated = guests.filter((guest) => guest.status === "seated").length;
  const [first, second] = copy["6.11"].split("[n]").slice(0, 2);
  const listName = `${first}${summoned}${second}${seated}${copy["6.11"].split("[n]")[2] ?? ""}`;
  const youAlone = seated === 1 && guests.some((guest) => guest.isYou && guest.status === "seated");

  const row = (index: number) =>
    list.current?.querySelector<HTMLElement>(`[data-mantle="${index}"]`) ?? null;
  const card = () => document.getElementById(CARD_ID);

  function show(index: number) {
    if (open === index) return hide();
    morph(
      row(index),
      () => setOpen(index),
      () => {
        const shown = card();
        shown?.scrollIntoView({ block: "nearest" });
        return shown;
      },
    );
  }

  function hide() {
    const index = open;
    if (index === null) return;
    morph(
      card(),
      () => setOpen(null),
      () => row(index),
    );
    row(index)?.focus({ preventScroll: true });
  }

  const opened = open !== null ? guests[open] : null;

  return (
    <>
      {opened?.character ? (
        <MantleCard
          id={CARD_ID}
          character={opened.character}
          holder={opened.name}
          yours={opened.isYou}
          onClose={hide}
        />
      ) : null}
      <Panel>
        <Well className="mt-0">
          <ul className="row-list" aria-label={listName} ref={list}>
            <li className="cn-guest">
              <Mask tone="gold" className="!h-[22px] !w-auto" />
              <span className="cn-guest-head">
                <span className="cn-guest-name">{copy["6.4.name"]}</span>
                <span className="cn-guest-tags">
                  <Label>{copy["6.4.tag"]}</Label>
                </span>
              </span>
              {doomName ? <p className="cn-guest-mantle cn-guest-doom">{doomName}</p> : null}
            </li>
            {guests.map((guest, index) => (
              <li
                key={`${guest.name}-${index}`}
                className={[
                  "cn-guest",
                  guest.isYou ? "is-you" : "",
                  guest.status === "declined" ? "is-declined" : "",
                ].join(" ")}
              >
                <StatusMark status={guest.status} />
                <span className="cn-guest-head">
                  <span className="cn-guest-name">{guest.name}</span>
                  <span className="cn-guest-tags">
                    {guest.isYou ? <Label className="text-gold-light">{copy["6.8"]}</Label> : null}
                    <Label>{statusWord[guest.status]}</Label>
                  </span>
                </span>
                {guest.status === "seated" ? (
                  guest.character ? (
                    <button
                      type="button"
                      className="cn-guest-mantle"
                      data-mantle={index}
                      aria-expanded={open === index}
                      aria-controls={open === index ? CARD_ID : undefined}
                      onClick={() => show(index)}
                    >
                      {guest.character}
                    </button>
                  ) : (
                    <p className="cn-guest-mantle is-none">{copy["6.9"]}</p>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        </Well>
        {youAlone ? <p className="notice">{copy["6.10"]}</p> : null}
      </Panel>
    </>
  );
}
