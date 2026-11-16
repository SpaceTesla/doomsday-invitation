import { copy } from "@/copy";
import { Label } from "@/components/Label";
import { CuirassTile, Mask, SealMark, SuitRune } from "@/components/Mark";
import { Panel, Well } from "@/components/Panel";
import type { CouncilData } from "./types";

const statusWord = {
  summoned: copy["6.5"],
  seated: copy["6.6"],
  declined: copy["6.7"],
} as const;

function StatusMark({ status }: { status: CouncilData["guests"][number]["status"] }) {
  if (status === "seated") return <SuitRune tone="emerald" />;
  if (status === "declined") return <CuirassTile tone="dim" />;
  return <SealMark />;
}

/**
 * Everyone summoned, with their status and mantle; Doom heads the list as its
 * sovereign and is not counted. design/DESIGN.md, section 8.9. No row carries a link,
 * an id or whether the guest has opened their summons.
 */
export function GuestList({ guests }: { guests: CouncilData["guests"] }) {
  const summoned = guests.length;
  const seated = guests.filter((guest) => guest.status === "seated").length;
  const [first, second] = copy["6.11"].split("[n]").slice(0, 2);
  const listName = `${first}${summoned}${second}${seated}${copy["6.11"].split("[n]")[2] ?? ""}`;
  const youAlone = seated === 1 && guests.some((guest) => guest.isYou && guest.status === "seated");

  return (
    <Panel>
      <Well className="mt-0">
        <ul className="row-list" aria-label={listName}>
          <li className="cn-guest">
            <Mask tone="gold" className="!h-[22px] !w-auto" />
            <span className="cn-guest-head">
              <span className="cn-guest-name">{copy["6.4.name"]}</span>
              <span className="cn-guest-tags">
                <Label>{copy["6.4.tag"]}</Label>
              </span>
            </span>
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
                  <p className="cn-guest-mantle">{guest.character}</p>
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
  );
}
