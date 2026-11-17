"use client";

import { useEffect, useState } from "react";
import { copy, fill } from "@/copy";
import { CornerBolts } from "@/components/CornerBolts";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { MaskInsignia } from "@/components/MaskInsignia";
import { Runes } from "@/components/Runes";
import { prefersReducedMotion } from "@/lib/motion";
import { play } from "@/lib/sound";
import { useHall } from "./HallScene";

// The decree (design/DESIGN.md, 8.16): Doom's mask as issuer, the day as a proclamation
// written in place by a passing light, the sanction, then his signature in runes lighting
// one by one. The ceremony plays once for each revision of the decree (the first decree,
// and each amendment); a reload, or a later visit, shows it settled. A tap or a key settles
// it at once; reduced motion shows it settled.

const SIGNATURE_AT = 3.05; // seconds: the signature begins to light
const RESPOND_AT = 3.4;
const SETTLED_AT = 4.4;

const seenKey = (token: string) => `iron-throne:decree:${token}`;

/** Has this revision of the decree been shown to this guest in this browser? Mark it shown. */
function firstSight(token: string, revision: string): boolean {
  try {
    const first = window.localStorage.getItem(seenKey(token)) !== revision;
    window.localStorage.setItem(seenKey(token), revision);
    return first;
  } catch {
    return false;
  }
}

export function DecreePanel({
  token,
  when,
  venue,
  amended,
}: {
  token: string;
  /** The decreed day and hour, in words. */
  when: string;
  venue: string;
  /** Doom has amended the decree since the guest last saw it. */
  amended: boolean;
}) {
  const { respond, settled } = useHall();
  const revision = `${when}|${venue}`;
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    // Only once the hall has settled, so the ceremony is seen; then once per revision.
    if (!settled || prefersReducedMotion() || !firstSight(token, revision)) return;
    // Starting the ceremony in an effect is deliberate: it depends on what this browser has
    // already been shown, which the server cannot know.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIssuing(true);
    const settle = () => setIssuing(false);
    const timers = [
      window.setTimeout(() => play("decree"), 200),
      window.setTimeout(respond, RESPOND_AT * 1000),
      window.setTimeout(settle, SETTLED_AT * 1000),
    ];
    const arm = window.setTimeout(() => {
      window.addEventListener("pointerdown", settle, { once: true });
      window.addEventListener("keydown", settle, { once: true });
    }, 50);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(arm);
      window.removeEventListener("pointerdown", settle);
      window.removeEventListener("keydown", settle);
    };
  }, [token, revision, respond, settled]);

  return (
    <section
      className={
        issuing
          ? "panel-plate panel-plate--principal cn-decree is-issuing"
          : "panel-plate panel-plate--principal cn-decree"
      }
      aria-labelledby="decree-heading"
    >
      <CornerBolts />
      <span className="cn-decree-light" aria-hidden="true" />
      <MaskInsignia plain tone="gold" className="cn-decree-issuer" />
      <Label className="cn-decree-tag">{copy["8.5"]}</Label>
      {amended ? <p className="notice cn-decree-notice">{copy["8.7"]}</p> : null}
      <Heading as="h2" id="decree-heading" size="title">
        {copy["8.1"]}
      </Heading>
      <p className="cn-decree-day">{when}</p>
      <p className="cn-decree-venue">{fill(copy["7.3"], { "[venue]": venue })}</p>
      <p className="cn-decree-sanction">{copy["8.4"]}</p>
      <div className="cn-decree-sig">
        <Runes inscription="viktor von doom" state="lit" sequence={issuing} delay={SIGNATURE_AT} />
      </div>
    </section>
  );
}
