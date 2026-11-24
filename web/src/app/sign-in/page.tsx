import { redirect } from "next/navigation";
import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { MaskInsignia } from "@/components/MaskInsignia";
import { Panel } from "@/components/Panel";
import { AccountForm } from "@/components/platform/AccountForm";
import { currentOrganizer } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function SignIn() {
  if (await currentOrganizer()) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      <Panel labelledBy="sign-in-heading">
        <div className="mb-6 flex items-center gap-4">
          <MaskInsignia plain tone="gold" className="!h-14 !w-auto" />
          <Heading as="h1" id="sign-in-heading">
            {copy["13.11"]}
          </Heading>
        </div>
        <AccountForm mode="sign-in" />
      </Panel>
    </main>
  );
}
