"use client";

import { UPRIGHT_QUERY } from "./motion";

// The next scene's art, fetched and decoded while the guest is still on the current one,
// so the seal's iris opens onto a scene that is ready rather than one still painting
// (design/DESIGN.md, 6.6). Only the application's own files; nothing else is requested.

const SUMMONS_PORTRAIT = "(orientation: portrait), (max-width: 760px)";

/** The art each scene needs on its first frame, for the guest's screen. */
function artFor(stage: string): string[] {
  if (stage === "summons") {
    const portrait = window.matchMedia(SUMMONS_PORTRAIT).matches;
    return [
      portrait ? "/art/summons-p-plate.webp" : "/art/summons-d-plate.webp",
      "/art/steel.webp",
      "/art/door-lock.webp",
      "/icons/bolt.svg",
    ];
  }
  if (stage === "council") {
    const upright = window.matchMedia(UPRIGHT_QUERY).matches;
    return upright
      ? ["/art/hall-p-plate.jpg", "/art/hall-p-doom.webp"]
      : ["/art/hall-d-plate.jpg", "/art/hall-d-doom.webp"];
  }
  return [];
}

/** Where a guest can go from each scene by going forwards. */
const NEXT: Record<string, string> = { opening: "summons", summons: "council" };

const kept: HTMLImageElement[] = [];

/** Fetch and decode the art of the scene after `stage`. Failures are ignored. */
export function warmNext(stage: string) {
  const next = NEXT[stage];
  if (!next) return;
  for (const src of artFor(next)) {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    // Held, so the decoded picture stays in memory until the scene uses it.
    kept.push(image);
    image.decode().catch(() => {});
  }
}

/**
 * Resolves when the scene now on screen is ready to be seen: laid out, and its pictures
 * decoded. Never waits longer than `cap` milliseconds.
 */
export function sceneReady(cap = 700): Promise<void> {
  const frames = new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
  const pictures = frames.then(() =>
    Promise.all(
      Array.from(document.images)
        .filter((image) => !image.complete && !image.closest(".iris"))
        .map((image) => image.decode().catch(() => {})),
    ),
  );
  const limit = new Promise<void>((resolve) => setTimeout(resolve, cap));
  return Promise.race([pictures.then(() => undefined), limit]);
}
