import Link from "next/link";
import { copy } from "@/copy";
import { ClosedSeal } from "@/components/ClosedSeal";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";

// An event address that is missing, malformed or someone else's, seen by a signed-in
// organizer inside the dashboard. One answer for all three, so it says nothing about
// other organizers' events; unlike the guests' not-found, it offers the way back.
export default function EventNotFound() {
  return (
    <main className="grid justify-items-center gap-4 py-12 text-center">
      <ClosedSeal />
      <Heading as="h1">{copy["13.45"]}</Heading>
      <p className="t-expl m-0">{copy["13.46"]}</p>
      <Link href="/dashboard" className="link-quiet">
        <Label>{copy["13.37"]}</Label>
      </Link>
    </main>
  );
}
