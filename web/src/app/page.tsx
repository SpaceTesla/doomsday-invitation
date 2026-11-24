import Link from "next/link";
import { copy } from "@/copy";
import { Heading } from "@/components/Heading";
import { Label } from "@/components/Label";
import { SealMark } from "@/components/Mark";
import { MaskInsignia } from "@/components/MaskInsignia";
import { currentOrganizer } from "@/lib/admin";
import { signupOpen } from "@/lib/env";

export const dynamic = "force-dynamic";

// The landing page: what this is, and the way in for organizers (docs/PRODUCT_SPEC.md,
// section 8.2). Guests arrive by their own link and never pass through here. The site
// stays unindexed (see layout.tsx), and the theme is presented as a private demonstration.
export default async function Landing() {
  const organizer = await currentOrganizer();
  const open = signupOpen();
  return (
    <main className="landing">
      <header className="landing-head">
        <MaskInsignia plain tone="gold" className="!h-16 !w-auto" />
        <Heading as="h1" size="title">
          {copy["13.1"]}
        </Heading>
        <p className="landing-lead">{copy["13.2"]}</p>
      </header>

      <section aria-labelledby="landing-steps">
        <Heading as="h2" id="landing-steps">
          {copy["13.3"]}
        </Heading>
        <ol className="landing-steps">
          <li>{copy["13.4"]}</li>
          <li>{copy["13.5"]}</li>
          <li>{copy["13.6"]}</li>
        </ol>
      </section>

      <div className="landing-actions">
        {organizer ? (
          <Link href="/dashboard" className="btn-plate no-underline">
            <SealMark />
            <Label>{copy["13.37"]}</Label>
          </Link>
        ) : (
          <>
            {open ? (
              <Link href="/sign-up" className="btn-plate no-underline">
                <SealMark />
                <Label>{copy["13.7"]}</Label>
              </Link>
            ) : null}
            <Link href="/sign-in" className="link-quiet">
              <Label>{copy["13.8"]}</Label>
            </Link>
          </>
        )}
      </div>
      {!organizer && !open ? <p className="platform-note">{copy["13.10"]}</p> : null}

      <footer>
        <p className="platform-note">{copy["13.9"]}</p>
      </footer>
    </main>
  );
}
