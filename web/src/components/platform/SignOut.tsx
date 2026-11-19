"use client";

import { useRouter } from "next/navigation";
import { copy } from "@/copy";
import { QuietControl } from "@/components/QuietControl";

/** Sign out: Better Auth deletes the session row, so the cookie is worthless even if kept. */
export function SignOut() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }).catch(() => null);
    router.replace("/");
    router.refresh();
  }
  return <QuietControl onClick={signOut}>{copy["10.3e"]}</QuietControl>;
}
