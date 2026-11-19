"use client";

import Link from "next/link";
import { useState } from "react";
import { copy, fill } from "@/copy";
import { Button } from "@/components/Button";
import { Figure } from "@/components/Figure";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { Panel, Well } from "@/components/Panel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useEventPaths } from "./EventPaths";
import { ActionMessage, useAdminAction } from "./useAdminAction";

export type CouncilView = {
  proposal: { when: string; venue: string } | null;
  decreed: boolean;
  count: { approved: number; total: number };
  approvers: string[];
  alternatives: { when: string; who: string }[];
};

/** "[n] of [total] seated guests approve", with each figure in Cinzel. */
function ApprovalLine({ approved, total }: { approved: number; total: number }) {
  const [before, rest] = copy["10.32"].split("[n]");
  const [middle, after] = rest.split("[total]");
  return (
    <p className="m-0">
      {before}
      <Figure>{approved}</Figure>
      {middle}
      <Figure>{total}</Figure>
      {after}
    </p>
  );
}

export function CouncilPanel({ view }: { view: CouncilView }) {
  const paths = useEventPaths();
  const action = useAdminAction();
  const [confirming, setConfirming] = useState(false);

  async function finalise() {
    setConfirming(false);
    const result = await action.run("POST", `${paths.api}/finalise`);
    if (!result.ok && result.status === 409)
      action.setMessage({ text: copy["10.39"], error: true });
  }

  return (
    <>
      <Panel labelledBy="council-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <Heading as="h1" id="council-heading">
            {view.decreed ? copy["8.1"] : copy["7.1"]}
          </Heading>
          {view.proposal ? <Label>{view.decreed ? copy["8.5"] : copy["8.6"]}</Label> : null}
        </div>
        {view.proposal ? (
          <>
            <p className="t-procl">{view.proposal.when}</p>
            <p className="t-procl">{fill(copy["7.3"], { "[venue]": view.proposal.venue })}</p>
          </>
        ) : (
          <p className="t-expl">{copy["10.39"]}</p>
        )}

        {view.decreed ? null : (
          <Well>
            {view.count.approved === 0 ? (
              <p className="m-0">{copy["10.33"]}</p>
            ) : (
              <>
                <ApprovalLine {...view.count} />
                <ul className="m-0 mt-2 grid list-none gap-1 p-0">
                  {view.approvers.map((who) => (
                    <li key={who} className="t-holder">
                      {who}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Well>
        )}

        <div className="mt-6">
          {view.decreed ? (
            <Link href={`${paths.page}/proposal`} className="btn-plate no-underline">
              <span className="lbl">{copy["10.40"]}</span>
            </Link>
          ) : (
            <Button
              onClick={() => (view.proposal ? setConfirming(true) : finalise())}
              disabled={action.busy}
            >
              {copy["10.37"]}
            </Button>
          )}
          <ActionMessage message={action.message} />
        </div>
      </Panel>

      {view.decreed ? null : (
        <Panel labelledBy="alternatives-label">
          <span id="alternatives-label">
            <Label block>{copy["10.34"]}</Label>
          </span>
          <Well>
            {view.alternatives.length === 0 ? (
              <p className="m-0">{copy["10.35"]}</p>
            ) : (
              <ul className="row-list">
                {view.alternatives.map((alternative) => (
                  <li key={`${alternative.who}:${alternative.when}`}>
                    <p className="m-0 text-silver">{alternative.when}</p>
                    <p className="t-holder m-0">{alternative.who}</p>
                  </li>
                ))}
              </ul>
            )}
          </Well>
          <p className="t-expl mt-4">{copy["10.36"]}</p>
        </Panel>
      )}

      <div>
        <a href={`${paths.api}/export`} className="link-quiet" download>
          <span className="lbl">{copy["10.48"]}</span>
        </a>
      </div>

      <ConfirmDialog
        open={confirming}
        text={copy["10.38"]}
        confirmLabel={copy["10.38.confirm"]}
        cancelLabel={copy["10.38.cancel"]}
        busy={action.busy}
        onConfirm={finalise}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
