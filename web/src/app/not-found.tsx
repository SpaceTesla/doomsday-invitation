import { copy } from "@/copy";
import { Heading } from "@/components/Heading";

// The one screen for every address that is not a valid summons. It says the link is
// not valid and nothing else: nothing about the event, and not whether the link ever
// worked (docs/PRODUCT_SPEC.md, section 3.5).
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Heading as="h1">{copy["9.1"]}</Heading>
      <p className="t-expl">{copy["9.2"]}</p>
    </main>
  );
}
