"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/copy";
import { useEventPaths } from "./EventPaths";

// In the order an organizer works: the proposal first, since guests are summoned to it.
const sections = [
  { path: "proposal", label: copy["10.2.proposal"] },
  { path: "characters", label: copy["10.2.characters"] },
  { path: "guests", label: copy["10.2.guests"] },
  { path: "council", label: copy["10.2.council"] },
  { path: "settings", label: copy["13.38"] },
] as const;

/** One event's sections. Signing out and the way back to every event sit above, on the dashboard. */
export function ThroneNav() {
  const pathname = usePathname();
  const paths = useEventPaths();
  return (
    <nav aria-label={copy["10.1"]}>
      <ul className="throne-nav m-0 list-none p-0">
        {sections.map((section) => {
          const href = `${paths.page}/${section.path}`;
          return (
            <li key={section.path}>
              <Link href={href} aria-current={pathname === href ? "page" : undefined}>
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
