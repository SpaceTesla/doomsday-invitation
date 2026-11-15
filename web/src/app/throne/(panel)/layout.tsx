import { redirect } from "next/navigation";
import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { Mask } from "@/components/Mark";
import { ThroneNav } from "@/components/throne/ThroneNav";
import { ensureEvent } from "@/domain/event";
import { isSignedIn, serverDomain } from "@/lib/admin";
import { eventTimeZone } from "@/lib/env";

// Every section of the panel checks the session here, on the server, before anything
// renders. Each API handler checks it again for itself.
export default async function ThronePanelLayout({ children }: LayoutProps<"/throne">) {
  if (!(await isSignedIn())) redirect("/throne");
  await ensureEvent(serverDomain(), eventTimeZone());

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 wide:px-8">
      <header className="mb-8 grid gap-4">
        <div className="flex items-center gap-4">
          <Mask level={2} plain tone="gold" className="!h-12 !w-auto" />
          <Heading as="p" size="title">
            {copy["10.1"]}
          </Heading>
        </div>
        <ThroneNav />
      </header>
      <main className="grid gap-7">{children}</main>
      <footer className="mt-12">
        <p className="field-help">{copy["10.44"]}</p>
      </footer>
    </div>
  );
}
