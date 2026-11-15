"use client";

import { copy } from "@/copy";
import { Button } from "@/components/Button";

/**
 * What a guest or Doom sees if a page fails while rendering: one line and a reload
 * (docs/COPY.md, 9.9 and 9.7). Nothing about the failure itself is shown: in production
 * the error carries only an opaque digest, and the details stay in the server log.
 * Reloading the whole page, rather than re-rendering one segment, is what the words say.
 */
export function FailedToLoad() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="t-expl">{copy["9.9"]}</p>
      <Button onClick={() => window.location.reload()}>{copy["9.7"]}</Button>
    </main>
  );
}
