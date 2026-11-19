import Link from "next/link";
import { redirect } from "next/navigation";
import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { MaskInsignia } from "@/components/MaskInsignia";
import { Panel } from "@/components/Panel";
import { AccountForm } from "@/components/platform/AccountForm";
import { currentOrganizer } from "@/lib/admin";
import { signupOpen } from "@/lib/env";

export const dynamic = "force-dynamic";

// Registration is for a small closed beta: it is open only where the deployment opens it
// (ORGANIZER_SIGNUP). Closed, the page says so and points to sign-in; Better Auth refuses
// the request itself too, so hiding the form is not the only gate.
export default async function SignUp() {
  if (await currentOrganizer()) redirect("/dashboard");
  const open = signupOpen();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Panel labelledBy="sign-up-heading">
        <div className="mb-6 flex items-center gap-4">
          <MaskInsignia plain tone="gold" className="!h-14 !w-auto" />
          <Heading as="h1" id="sign-up-heading">
            {copy["13.12"]}
          </Heading>
        </div>
        {open ? (
          <AccountForm mode="sign-up" />
        ) : (
          <>
            <p className="t-expl m-0">{copy["13.10"]}</p>
            <Link className="link-quiet mt-4" href="/sign-in">
              <Label>{copy["13.8"]}</Label>
            </Link>
          </>
        )}
      </Panel>
    </main>
  );
}
