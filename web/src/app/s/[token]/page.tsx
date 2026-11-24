import { notFound } from "next/navigation";
import { forEvent } from "@/domain/context";
import { councilForGuest } from "@/domain/council";
import { addressOf, stageOf } from "@/domain/guests";
import { datingClause } from "@/domain/words";
import { serverDomain } from "@/lib/admin";
import { guestForLink, pageAddress } from "@/lib/guest";
import { Closing, DayPassed } from "@/scenes/Closing";
import { Council, councilData } from "@/scenes/council/Council";
import { Opening } from "@/scenes/Opening";
import { StageFrame } from "@/scenes/StageFrame";
import { Summons } from "@/scenes/Summons";

// A guest's link. It renders the guest's stage and nothing else; any link that is not
// a valid summons gets the one invalid-link screen, with status 404
// (docs/ARCHITECTURE.md, section 5). Nothing here is cached.
export default async function GuestPage(props: PageProps<"/s/[token]">) {
  const { token } = await props.params;
  const domain = serverDomain();
  const found = await guestForLink(domain, token, await pageAddress());
  if (!found) notFound();

  const now = new Date();
  const address = addressOf(found.guest);
  const stage = stageOf(found.guest, found.event, now);
  return (
    <StageFrame stage={stage}>
      <Scene stage={stage} token={token} found={found} address={address} now={now} />
    </StageFrame>
  );
}

async function Scene({
  stage,
  token,
  found,
  address,
  now,
}: {
  stage: ReturnType<typeof stageOf>;
  token: string;
  found: NonNullable<Awaited<ReturnType<typeof guestForLink>>>;
  address: string;
  now: Date;
}) {
  const { guest, event } = found;
  switch (stage) {
    case "opening":
      return <Opening token={token} address={address} />;
    case "summons":
      return (
        <Summons
          token={token}
          address={address}
          dating={datingClause(guest.invitedAt, event.timezone)}
        />
      );
    case "closing":
      return <Closing token={token} />;
    case "day_passed":
      return <DayPassed />;
    case "council": {
      const council = await councilForGuest(forEvent(serverDomain(), event.id), guest.id);
      if (!council) notFound();
      return <Council data={councilData(token, council, now)} />;
    }
  }
}
