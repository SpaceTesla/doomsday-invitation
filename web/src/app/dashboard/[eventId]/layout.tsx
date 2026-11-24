import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { MaskInsignia } from "@/components/MaskInsignia";
import { EventPathsProvider } from "@/components/throne/EventPaths";
import { ThroneNav } from "@/components/throne/ThroneNav";
import { dateTimeInWords } from "@/domain/words";
import { requirePageEvent } from "@/lib/admin";

// One event's panel. The server checks, before anything renders, that the signed-in
// organizer owns this event; anyone else's event, or one that does not exist, is a plain
// not-found. Each API handler checks ownership again for itself.
export default async function EventLayout({
  children,
  params,
}: LayoutProps<"/dashboard/[eventId]">) {
  const found = await requirePageEvent(params);

  return (
    <EventPathsProvider eventId={found.event.id}>
      <header className="mb-8 grid gap-4">
        <div className="flex items-center gap-4">
          <MaskInsignia plain tone="gold" className="!h-12 !w-auto" />
          <div className="min-w-0">
            <Heading as="p" size="title">
              {copy["10.1"]}
            </Heading>
            {/* The event has no name; once proposed, its day says which one this is. */}
            {found.event.proposalAt ? (
              <p className="field-help m-0">
                {dateTimeInWords(found.event.proposalAt, found.event.timezone)}
              </p>
            ) : null}
          </div>
        </div>
        <ThroneNav />
      </header>
      <main className="grid gap-7">{children}</main>
    </EventPathsProvider>
  );
}
