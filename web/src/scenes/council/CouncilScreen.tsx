"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { copy } from "@/copy";
import { play, scoreDecree } from "@/lib/sound";
import { Button } from "@/components/Button";
import { Figure } from "@/components/Figure";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { CuirassTile, SealMark, SuitRune } from "@/components/Mark";
import { QuietControl } from "@/components/QuietControl";
import { GuestList } from "./GuestList";
import { LeaveControl } from "./LeaveControl";
import { MantleSection, type Claim } from "./MantleSection";
import { ProposalSection } from "./ProposalSection";
import type { CouncilData } from "./types";

type Step = 1 | 2 | 3;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: copy["6.12.proposal"] },
  { n: 2, label: copy["6.12.mantle"] },
  { n: 3, label: copy["6.12.council"] },
];

// "Choose later" lasts for this visit only (docs/PRODUCT_SPEC.md, Stage 3): it is kept in
// session storage, so a reload keeps it and the next visit from the link asks again.
const laterKey = (token: string) => `iron-throne:mantle-later:${token}`;
const laterListeners = new Set<() => void>();
function readLater(token: string): boolean {
  try {
    return window.sessionStorage.getItem(laterKey(token)) === "1";
  } catch {
    return false;
  }
}
function writeLater(token: string): void {
  try {
    window.sessionStorage.setItem(laterKey(token), "1");
  } catch {
    // Storage refused (a private window): the choice lasts until the page is left.
  }
  laterListeners.forEach((listener) => listener());
}
const subscribeLater = (listener: () => void) => {
  laterListeners.add(listener);
  return () => laterListeners.delete(listener);
};

/**
 * The council as three steps (docs/PRODUCT_SPEC.md, Stage 3; design/DESIGN.md, 8.12):
 * the proposal, the mantle, then everyone summoned. The page opens on the first step
 * the guest has not answered. Answering it moves them on; a finished step can be
 * reopened from the step header. It shows the council as it stood when the page
 * loaded; a reload shows the latest.
 */
export function CouncilScreen({ data }: { data: CouncilData }) {
  const marked = useRef(false);
  const stepPanel = useRef<HTMLDivElement>(null);
  const later = useSyncExternalStore(
    subscribeLater,
    () => readLater(data.token),
    () => false,
  );
  const [picked, setPicked] = useState<Step | null>(null);
  // A claim the server has confirmed, while its beat plays on step two.
  const [claim, setClaim] = useState<Claim | null>(null);
  const claimShown = useCallback(() => {
    setClaim(null);
    setPicked(null);
  }, []);

  // Once Doom has decreed, the council's score gains its crown.
  useEffect(() => {
    scoreDecree(data.decreed);
    return () => scoreDecree(false);
  }, [data.decreed]);

  // The notices on this load have been seen: they will not show again.
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void fetch(`/api/g/${data.token}/seen`, { method: "POST" }).catch(() => null);
  }, [data.token]);

  // Step one is answered by approving or by putting forward an alternative; there is
  // nothing to answer before Doom proposes, or after he decrees.
  const proposalDone =
    data.decreed || !data.proposal || data.you.approves || data.you.hasAlternative;
  // Step two is answered by holding a mantle, by "Choose later" on this visit, or when
  // no mantle is free to take.
  const noneFree = !data.mantles.some((m) => m.holder === null || m.isYours);
  const mantleDone = data.you.characterId !== null || later || noneFree;
  const done: Record<Step, boolean> = { 1: proposalDone, 2: mantleDone, 3: true };
  const reachable = (n: Step) => n === 1 || (n === 2 ? proposalDone : proposalDone && mantleDone);

  // After the decree the page opens on it; otherwise on the first unanswered step.
  const first: Step = data.decreed || !proposalDone ? 1 : !mantleDone ? 2 : 3;
  const step: Step = claim ? 2 : picked !== null && reachable(picked) ? picked : first;

  // A new step: bring it into view, give it focus, and turn the detent.
  const shown = useRef(step);
  useEffect(() => {
    if (shown.current === step) return;
    shown.current = step;
    play("detent");
    // Back to the top of the room: the hall, the title and the steps, then the new step.
    window.scrollTo({ top: 0, behavior: "auto" });
    stepPanel.current?.focus({ preventScroll: true });
  }, [step]);

  const go = useCallback((n: Step) => setPicked(n), []);

  return (
    <div className="cn-body">
      <nav className="cn-steps" aria-label={copy["6.13"]}>
        <ol>
          {STEPS.map(({ n, label }) => {
            const current = n === step;
            const finished = done[n] && n !== 3;
            return (
              <li key={n}>
                <button
                  type="button"
                  className={["cn-step-tab", current && "is-current", finished && "is-done"]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={current ? "step" : undefined}
                  disabled={!reachable(n)}
                  onClick={() => go(n)}
                >
                  <span className="cn-step-head">
                    {finished ? (
                      <SuitRune tone="emerald" />
                    ) : current ? (
                      <SealMark tone="gold" />
                    ) : (
                      <CuirassTile tone="dim" />
                    )}
                    <span className="cn-step-n">
                      <Figure>{n}</Figure>
                    </span>
                  </span>
                  <Label>{label}</Label>
                  {finished ? <span className="sr-only">, {copy["6.14"]}</span> : null}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div key={step} ref={stepPanel} tabIndex={-1} className="cn-step">
        {step === 1 ? (
          <>
            {data.proposal ? null : (
              <div className="cn-intro">
                <Heading as="h2">{copy["6.2"]}</Heading>
                <p className="t-procl mx-auto mt-2 max-w-[46ch]">{copy["6.3"]}</p>
              </div>
            )}
            <ProposalSection data={data} />
          </>
        ) : step === 2 ? (
          <MantleSection data={data} claim={claim} onClaimed={setClaim} onClaimShown={claimShown} />
        ) : (
          <>
            <Heading as="h2">{copy["6.16"]}</Heading>
            <GuestList guests={data.guests} />
            {data.decreed ? null : <LeaveControl token={data.token} />}
          </>
        )}

        {claim ? null : step === 2 && !mantleDone ? (
          <div className="cn-step-next">
            <QuietControl
              onClick={() => {
                writeLater(data.token);
                go(3);
              }}
            >
              {copy["5.18"]}
            </QuietControl>
          </div>
        ) : step < 3 && done[step] ? (
          <div className="cn-step-next">
            <Button onClick={() => go((step + 1) as Step)}>{copy["6.15"]}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
