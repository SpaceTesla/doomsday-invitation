"use client";

// Shared motion settings. design/DESIGN.md, section 6: machines turn and lock, light
// switches on and off; no bounce, no elastic easing; text is revealed in place; every
// sequence becomes a 0.2 s cross-fade when the guest asks for reduced motion.
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, CustomEase);

/** The board's cubic-bezier curves, by name. */
export const EASE = {
  /** Rubble sliding: cubic-bezier(.3, .05, .16, 1). */
  rubble: CustomEase.create("throne-rubble", "M0,0 C0.3,0.05 0.16,1 1,1"),
  /** The camera settling: cubic-bezier(.2, .6, .2, 1). */
  settle: CustomEase.create("throne-settle", "M0,0 C0.2,0.6 0.2,1 1,1"),
  /** Light and fades. */
  light: "power1.inOut",
  /** Mechanisms locking: decelerate, no overshoot. */
  lock: "power3.out",
} as const;

/** The duration every sequence collapses to under reduced motion. */
export const REDUCED = 0.2;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Which composition a screen gets. The phone layers below this ratio of width to
 * height, the desktop layers above it. Set by eye in milestone 4: the desktop frame,
 * cropped away from the hand (scenes.css), keeps both the hand and the mask on screen
 * down to about 5:6; below that the upright composition takes over, and there the
 * lines sit below the mask. The same query is used in CSS and in <picture> sources.
 */
export const UPRIGHT_QUERY = "(max-aspect-ratio: 5/6)";

export function isUpright(): boolean {
  return typeof window !== "undefined" && window.matchMedia(UPRIGHT_QUERY).matches;
}

export { gsap, useGSAP };
