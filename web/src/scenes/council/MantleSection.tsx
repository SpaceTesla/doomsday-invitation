"use client";

import { useState } from "react";
import { copy, fill } from "@/copy";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { CuirassTile, SuitRune } from "@/components/Mark";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";
import type { CouncilData } from "./types";

/**
 * The mantles, one plate each. Choosing is optional and gates nothing; a guest may
 * claim a free mantle whenever they wish, and change it until the decree. Taken
 * mantles stay in place, marked, with who holds them.
 */
export function MantleSection({ data }: { data: CouncilData }) {
  const action = useGuestAction(data.token);
  const [chosen, setChosen] = useState<string | null>(null);
  const { mantles, decreed } = data;
  const mine = data.you.characterId;
  // After the decree a guest who holds a mantle keeps it; one who holds none may still choose.
  const locked = decreed && mine !== null;
  const allTaken = mantles.length > 0 && !mine && mantles.every((m) => m.holder !== null);

  async function claim(id: string, name: string) {
    setChosen(null);
    const result = await action.run("PUT", "character", { characterId: id });
    if (result.ok) {
      setChosen(name);
      return;
    }
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
    <section aria-labelledby="mantle-heading">
      <Heading as="h2" id="mantle-heading">
        {copy["5.1"]}
      </Heading>
      <p className="t-expl mt-2">{copy["5.2"]}</p>

      {data.you.removedCharacter && !mine ? (
        <p className="notice">{fill(copy["5.10"], { "[Character]": data.you.removedCharacter })}</p>
      ) : null}
      {mantles.length === 0 ? <p className="notice">{copy["5.12"]}</p> : null}
      {allTaken ? <p className="notice">{copy["5.11"]}</p> : null}
      {locked ? <p className="notice">{copy["5.13"]}</p> : null}

      {mantles.length > 0 ? (
        <ul className="cn-chars">
          {mantles.map((mantle) => {
            const taken = mantle.holder !== null && !mantle.isYours;
            const content = (
              <>
                {mantle.isYours ? (
                  <SuitRune tone="emerald" />
                ) : (
                  <CuirassTile tone={taken ? "dim" : "steel"} />
                )}
                <span className="cn-cname">{mantle.name}</span>
                {mantle.isYours ? (
                  <Label>{copy["5.4"]}</Label>
                ) : taken ? (
                  <Label>{copy["5.5"]}</Label>
                ) : (
                  <span />
                )}
                {taken ? <span className="cn-holder">{mantle.holder}</span> : null}
              </>
            );
            const state = mantle.isYours ? "is-yours" : taken ? "is-taken" : "";
            // A free mantle is a button, unless choosing is closed. Taken and held mantles
            // are announced, not offered.
            if (!taken && !mantle.isYours && !locked) {
              return (
                <li key={mantle.id}>
                  <button
                    type="button"
                    className={`cn-char ${state}`}
                    aria-label={fill(copy["5.6"], { "[Character]": mantle.name })}
                    disabled={action.busy}
                    onClick={() => claim(mantle.id, mantle.name)}
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
          })}
        </ul>
      ) : null}

      {chosen ? (
        <p className="t-procl mt-4" role="status">
          {fill(copy["5.8"], { "[Character]": chosen })}
        </p>
      ) : null}
      <GuestMessageLine message={action.message} busy={action.busy} />
    </section>
  );
}
