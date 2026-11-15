"use client";

import { FailedToLoad } from "@/components/FailedToLoad";

// A page that fails while rendering, below the root layout.
export default function ErrorScreen() {
  return <FailedToLoad />;
}
