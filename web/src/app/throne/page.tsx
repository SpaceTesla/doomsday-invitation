import { redirect } from "next/navigation";
import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { MaskInsignia } from "@/components/MaskInsignia";
import { Panel } from "@/components/Panel";
import { SignInForm } from "@/components/throne/SignInForm";
import { isSignedIn } from "@/lib/admin";

// Doom's sign-in. Reachable only by typing its address; no guest screen links here.
export default async function ThroneSignIn() {
  if (await isSignedIn()) redirect("/throne/guests");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Panel labelledBy="throne-sign-in">
        <div className="mb-6 flex items-center gap-4">
          <MaskInsignia plain tone="gold" className="!h-14 !w-auto" />
          <Heading as="h1" id="throne-sign-in">
            {copy["10.3"]}
          </Heading>
        </div>
        <SignInForm />
      </Panel>
    </main>
  );
}
