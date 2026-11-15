"use client";

import { useState } from "react";
import { copy, fill } from "@/copy";
import { Button } from "@/components/Button";
import { Figure } from "@/components/Figure";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { Panel, PanelActions, Well } from "@/components/Panel";
import { QuietControl } from "@/components/QuietControl";
import { GuestMessageLine, useGuestAction } from "@/components/guest/useGuestAction";
import { AlternativeEntry } from "./AlternativeEntry";
import type { CouncilData } from "./types";

/** "3 of 7 seats have approved", each figure in Cinzel; 7.5 and 7.6 for one and none. */
function Count({ approved, total }: { approved: number; total: number }) {
  if (approved === 0) return <>{copy["7.6"]}</>;
  const line = approved === 1 ? copy["7.5"] : copy["7.4"];
  const parts = line.split(/(\[n\]|\[total\]|^1(?= of))/).filter(Boolean);
  return (
    <>
      {parts.map((part, index) =>
        part === "[n]" || part === "1" ? (
          <Figure key={index}>{approved}</Figure>
        ) : part === "[total]" ? (
          <Figure key={index}>{total}</Figure>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * Doom's proposal and the council's answer to it, or the decree. Approving, suggesting
 * an alternative and withdrawing either are open to every seated guest, mantle or not.
 */
export function ProposalSection({ data }: { data: CouncilData }) {
  const approval = useGuestAction(data.token);
  const withdrawal = useGuestAction(data.token);
  const [entering, setEntering] = useState(false);
  const [received, setReceived] = useState(false);
  const { proposal, decreed } = data;

  const notice = decreed
    ? data.notices.decreeAmended
      ? copy["8.7"]
      : null
    : data.notices.proposalChanged
      ? copy["7.13"]
      : null;

  return (
    <>
      <Panel labelledBy="proposal-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <Heading as="h2" id="proposal-heading">
            {decreed ? copy["8.1"] : copy["7.1"]}
          </Heading>
          {proposal ? <Label>{decreed ? copy["8.5"] : copy["8.6"]}</Label> : null}
        </div>
        {notice ? <p className="notice mt-0 mb-3">{notice}</p> : null}

        {proposal ? (
          <>
            <p className="t-procl">{proposal.when}</p>
            <p className="t-procl">{fill(copy["7.3"], { "[venue]": proposal.venue })}</p>
          </>
        ) : (
          <p className="t-procl">{copy["7.12"]}</p>
        )}

        {decreed ? (
          <p className="t-procl mt-4 font-bold">{copy["8.4"]}</p>
        ) : proposal ? (
          <>
            <Well>
              <Count {...data.count} />
            </Well>
            <PanelActions>
              {data.you.approves ? (
                <div className="cn-state">
                  <Button
                    done
                    disabled={approval.busy}
                    onClick={() => approval.run("PUT", "approval")}
                  >
                    {copy["7.10"]}
                  </Button>
                  <QuietControl
                    onClick={() => approval.run("DELETE", "approval")}
                    disabled={approval.busy}
                  >
                    {copy["7.11"]}
                  </QuietControl>
                </div>
              ) : (
                <Button onClick={() => approval.run("PUT", "approval")} disabled={approval.busy}>
                  {copy["7.7"]}
                </Button>
              )}
              {data.you.approves ? null : (
                <QuietControl
                  onClick={() => {
                    setReceived(false);
                    setEntering(true);
                  }}
                  aria-expanded={entering}
                >
                  {copy["7.8"]}
                </QuietControl>
              )}
            </PanelActions>
            <GuestMessageLine message={approval.message} />
            <p className="t-expl mt-4">{copy["7.9"]}</p>
            {data.you.approves ? (
              <div className="mt-2">
                <QuietControl
                  onClick={() => {
                    setReceived(false);
                    setEntering(true);
                  }}
                  aria-expanded={entering}
                >
                  {copy["7.8"]}
                </QuietControl>
              </div>
            ) : null}
          </>
        ) : null}

        {decreed || !proposal ? null : (
          <Well>
            <Label block>{copy["7.14"]}</Label>
            {data.alternatives.length === 0 ? (
              <p className="m-0">{copy["7.16"]}</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {data.alternatives.map((alternative) => (
                  <li key={`${alternative.who}-${alternative.when}`} className="cn-alt">
                    <p>{alternative.when}</p>
                    <span className="flex items-center gap-4">
                      <span className="t-holder">{alternative.who}</span>
                      {alternative.isYours ? (
                        <QuietControl
                          onClick={() => withdrawal.run("DELETE", "alternative")}
                          disabled={withdrawal.busy}
                        >
                          {copy["7.24"]}
                        </QuietControl>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <GuestMessageLine message={withdrawal.message} />
          </Well>
        )}
        {received ? <p className="notice">{copy["7.23"]}</p> : null}
      </Panel>

      {entering && proposal && !decreed ? (
        <AlternativeEntry
          token={data.token}
          today={data.today}
          replacing={data.you.hasAlternative}
          onDone={() => {
            setEntering(false);
            setReceived(true);
          }}
          onCancel={() => setEntering(false)}
        />
      ) : null}
    </>
  );
}
