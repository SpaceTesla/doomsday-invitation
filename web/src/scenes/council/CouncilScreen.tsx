"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { GuestList } from "./GuestList";
import { LeaveControl } from "./LeaveControl";
import { MantleSection } from "./MantleSection";
import { ProposalSection } from "./ProposalSection";
import type { CouncilData } from "./types";

/**
 * One council screen for every seated guest, with or without a mantle. The proposal and
 * its alternatives on one side, the mantles on the other, everyone summoned below.
 * It shows the council as it stood when the page loaded; a reload shows the latest.
 */
export function CouncilScreen({ data }: { data: CouncilData }) {
  const marked = useRef(false);

  // The notices on this load have been seen: they will not show again.
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void fetch(`/api/g/${data.token}/seen`, { method: "POST" }).catch(() => null);
  }, [data.token]);

  return (
    <div className="cn-body">
      {data.proposal ? null : (
        <div className="cn-intro">
          <Heading as="h2">{copy["6.2"]}</Heading>
          <p className="t-procl mx-auto mt-2 max-w-[46ch]">{copy["6.3"]}</p>
        </div>
      )}
      <div className="cn-col">
        <ProposalSection data={data} />
      </div>
      <div className="cn-col">
        <MantleSection data={data} />
      </div>
      <div className="cn-full">
        <GuestList guests={data.guests} />
      </div>
      {data.decreed ? null : (
        <div className="cn-full">
          <LeaveControl token={data.token} />
        </div>
      )}
    </div>
  );
}
