"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { Seal } from "@/components/Mark";
import { SoundControl } from "@/components/guest/SoundControl";
import { REDUCED, gsap, prefersReducedMotion } from "@/lib/motion";
import { initSound, play } from "@/lib/sound";

// The change between scenes (design/DESIGN.md, section 6.6): the centre of the seal opens
// like an iris onto the next scene, 0.9 s in all, half closing and half opening. Every
// change of stage uses it. Under reduced motion it is a 0.2 s cross-fade.
//
// The action itself is never delayed: the request has already been answered when the
// iris closes, and the new scene is rendered while it is closed.

const HALF = 0.45;
const OPEN = "150vmax";

type StageTransition = { cover: () => Promise<void> };
const Context = createContext<StageTransition>({ cover: async () => {} });

export const useStageTransition = () => useContext(Context);

export function StageFrame({ stage, children }: { stage: string; children: ReactNode }) {
  const iris = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const shown = useRef(stage);
  const covered = useRef(false);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback(() => {
    const el = iris.current;
    if (!el || !covered.current) return;
    covered.current = false;
    if (fallback.current) clearTimeout(fallback.current);
    if (prefersReducedMotion()) {
      gsap.to(el, { autoAlpha: 0, duration: REDUCED, ease: "none" });
      return;
    }
    gsap
      .timeline()
      .to(seal.current, { scale: 1.12, autoAlpha: 0, duration: HALF, ease: "power2.in" }, 0)
      .fromTo(
        el,
        { "--iris": "0vmax" },
        { "--iris": OPEN, duration: HALF, ease: "power2.out" },
        0.05,
      )
      .set(el, { autoAlpha: 0 });
  }, []);

  const cover = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const el = iris.current;
        if (!el) return resolve();
        covered.current = true;
        play("seal-turn");
        // If the scene does not change (the request ended on the same stage), open again.
        fallback.current = setTimeout(reveal, 5000);
        if (prefersReducedMotion()) {
          gsap.fromTo(
            el,
            { autoAlpha: 0, "--iris": "0vmax" },
            { autoAlpha: 1, duration: REDUCED, ease: "none", onComplete: resolve },
          );
          gsap.set(seal.current, { autoAlpha: 1, scale: 1 });
          return;
        }
        gsap
          .timeline({ onComplete: () => resolve() })
          .set(el, { autoAlpha: 1, "--iris": OPEN })
          .set(seal.current, { autoAlpha: 0, scale: 0.88 })
          .to(el, { "--iris": "0vmax", duration: HALF, ease: "power2.in" }, 0)
          .to(
            seal.current,
            { autoAlpha: 1, scale: 1, duration: HALF * 0.8, ease: "power2.out" },
            HALF * 0.3,
          );
      }),
    [reveal],
  );

  // A new stage has rendered behind the closed iris: open it.
  useEffect(() => {
    if (shown.current === stage) return;
    shown.current = stage;
    reveal();
  }, [stage, reveal]);

  // The guest's choice of sound for this visit. Nothing loads unless it is on.
  useEffect(() => initSound(), []);

  useEffect(
    () => () => {
      if (fallback.current) clearTimeout(fallback.current);
    },
    [],
  );

  return (
    <Context.Provider value={{ cover }}>
      {children}
      {stage === "opening" ? null : <SoundControl />}
      <div ref={iris} className="iris" aria-hidden="true">
        <div ref={seal} className="iris-seal">
          <Seal state="active" />
        </div>
      </div>
    </Context.Provider>
  );
}
