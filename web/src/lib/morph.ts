"use client";

import { flushSync } from "react-dom";
import { prefersReducedMotion } from "./motion";

// A shared-element move between two states of a screen (design/DESIGN.md, 8.15 and 8.18):
// the element that stands for a mantle in the old state (the guest's mantle card, a row of
// the guest list) moves and changes shape into the element that stands for it in the new
// state. Built on the browser's View Transitions. Where they are not supported, or the
// guest asks for reduced motion, the state simply changes.

const NAME = "mantle";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function mark(element: Element | null, on: boolean) {
  if (element instanceof HTMLElement) {
    if (on) element.style.setProperty("view-transition-name", NAME);
    else element.style.removeProperty("view-transition-name");
  }
}

/**
 * Change state with `update`, moving `from` (in the old state) into what `to()` returns
 * (in the new state). `update` runs synchronously, so `to()` can find the new element.
 */
export function morph(from: Element | null, update: () => void, to: () => Element | null) {
  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    flushSync(update);
    return;
  }
  mark(from, true);
  const transition = doc.startViewTransition(() => {
    mark(from, false);
    flushSync(update);
    mark(to(), true);
  });
  void transition.finished.finally(() => mark(to(), false));
}
