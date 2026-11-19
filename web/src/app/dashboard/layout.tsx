import Link from "next/link";
import { redirect } from "next/navigation";
import { copy, fill } from "@/copy";
import { Label } from "@/components/Label";
import { SignOut } from "@/components/platform/SignOut";
import { currentOrganizer } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Every dashboard page checks the session here, on the server, before anything renders.
// Each API handler checks it again for itself, with the event's owner.
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const organizer = await currentOrganizer();
  if (!organizer) redirect("/sign-in");
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 wide:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <Link href="/dashboard" className="link-quiet">
          <Label>{copy["13.37"]}</Label>
        </Link>
        <div className="flex flex-wrap items-center gap-x-5">
          <p className="field-help m-0">{fill(copy["13.24"], { "[Name]": organizer.name })}</p>
          <SignOut />
        </div>
      </div>
      {children}
      <footer className="mt-12 grid gap-3">
        <p className="field-help">{copy["10.44"]}</p>
        <p className="platform-note">{copy["13.9"]}</p>
      </footer>
    </div>
  );
}
