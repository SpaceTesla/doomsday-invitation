"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Where one event's panel and API live: /dashboard/[id] and /api/events/[id]. */
export type EventPaths = { page: string; api: string };

const Context = createContext<EventPaths | null>(null);

/** Given by the event's layout once the server has checked the organizer owns it. */
export function EventPathsProvider({
  eventId,
  children,
}: {
  eventId: number;
  children: ReactNode;
}) {
  return (
    <Context.Provider value={{ page: `/dashboard/${eventId}`, api: `/api/events/${eventId}` }}>
      {children}
    </Context.Provider>
  );
}

export function useEventPaths(): EventPaths {
  const paths = useContext(Context);
  if (!paths) throw new Error("useEventPaths needs an EventPathsProvider.");
  return paths;
}
