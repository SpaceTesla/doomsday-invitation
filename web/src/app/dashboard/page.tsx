import Link from "next/link";
import { redirect } from "next/navigation";
import { copy, fill } from "@/copy";
import { Figure } from "@/components/Figure";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { MaskInsignia } from "@/components/MaskInsignia";
import { Panel, Well } from "@/components/Panel";
import { CreateEventForm } from "@/components/platform/CreateEventForm";
import { listEvents, type EventSummary } from "@/domain/event";
import { dateTimeInWords } from "@/domain/words";
import { currentOrganizer, serverDomain } from "@/lib/admin";
import { timeZoneChoices } from "@/lib/zones";

const stateLabel = (event: EventSummary) =>
  event.decreed
    ? copy["13.35.decreed"]
    : event.proposalAt
      ? copy["13.35.proposed"]
      : copy["13.35.none"];

/** An event has no name: it is told apart by its day and venue, once proposed. */
const whenOf = (event: EventSummary) =>
  event.proposalAt ? dateTimeInWords(event.proposalAt, event.timeZone) : null;

// The organizer's events, and a form for a new one. Only their own events are listed:
// the query is by owner, so nothing here can name another organizer's event.
export default async function Dashboard() {
  const organizer = await currentOrganizer();
  if (!organizer) redirect("/sign-in");
  const events = await listEvents(serverDomain(), organizer.id);
  const zones = timeZoneChoices();

  return (
    <main className="grid gap-7">
      <div className="flex items-center gap-4">
        <MaskInsignia plain tone="gold" className="!h-12 !w-auto" />
        <Heading as="h1" size="title">
          {copy["13.25"]}
        </Heading>
      </div>

      <Panel>
        <Well className="mt-0">
          {events.length === 0 ? (
            <p className="m-0">{copy["13.26"]}</p>
          ) : (
            <ul className="row-list" aria-label={copy["13.25"]}>
              {events.map((event) => (
                <li key={event.id} className="event-row">
                  <div className="min-w-0">
                    {whenOf(event) ? (
                      <>
                        <p className="event-when">{whenOf(event)}</p>
                        <p className="event-venue">{event.proposalVenue}</p>
                      </>
                    ) : null}
                    <p className="event-facts">
                      {/* Figures in Cinzel, words in the body face (design/DESIGN.md, 2.2). */}
                      {fill(copy["13.34"], { "[n]": event.summoned, "[seated]": event.seated })
                        .split(/(\d+)/)
                        .map((part, index) =>
                          /^\d+$/.test(part) ? <Figure key={index}>{part}</Figure> : part,
                        )}
                    </p>
                    <Label block className="mt-1">
                      {stateLabel(event)}
                    </Label>
                  </div>
                  <Link
                    href={`/dashboard/${event.id}`}
                    className="link-quiet"
                    aria-label={`${copy["13.36"]}: ${whenOf(event) ?? stateLabel(event)}`}
                  >
                    <Label>{copy["13.36"]}</Label>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Well>
      </Panel>

      <CreateEventForm zones={zones} defaultZone="UTC" hostName={organizer.name} />
    </main>
  );
}
