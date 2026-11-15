"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { copy } from "@/copy";
import { QuietControl } from "@/components/QuietControl";

const sections = [
  { href: "/throne/guests", label: copy["10.2.guests"] },
  { href: "/throne/characters", label: copy["10.2.characters"] },
  { href: "/throne/proposal", label: copy["10.2.proposal"] },
  { href: "/throne/council", label: copy["10.2.council"] },
] as const;

export function ThroneNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    router.replace("/throne");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
      <nav aria-label={copy["10.1"]}>
        <ul className="throne-nav m-0 list-none p-0">
          {sections.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={pathname === section.href ? "page" : undefined}
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <QuietControl onClick={signOut}>{copy["10.3e"]}</QuietControl>
    </div>
  );
}
