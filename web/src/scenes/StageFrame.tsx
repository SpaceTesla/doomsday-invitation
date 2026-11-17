"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SoundControl } from "@/components/guest/SoundControl";
import { REDUCED, gsap, prefersReducedMotion } from "@/lib/motion";
import { initSound, play, scoreStage, type ScoreStage } from "@/lib/sound";
import { sceneReady, warmNext } from "@/lib/warm";

// The change between scenes (design/DESIGN.md, section 6.6): the centre of the seal opens
// like an iris onto the next scene, 0.9 s in all, half closing and half opening. Every
// change of stage uses it. Under reduced motion it is a 0.2 s cross-fade.
//
// The iris begins to close as the guest presses, while the request is on its way; if the
// request fails it opens again on the same scene. The new scene is rendered while it is
// closed, and the iris opens only once that scene is laid out and its pictures decoded
// (at most 0.7 s more). The next scene's art is fetched ahead, once a scene has settled.

const HALF = 0.45;

const SCORE: Record<string, ScoreStage> = {
  opening: "silent",
  summons: "summons",
  council: "council",
  closing: "silent",
  day_passed: "silent",
};
const OPEN = "150vmax";

/**
 * `cover`: close the iris (`back`: the guest is stepping back, declining or leaving, and
 * it runs in reverse). `uncover`: open it again on the same scene, when a request failed.
 */
type StageTransition = { cover: (back?: boolean) => Promise<void>; uncover: () => void };
const Context = createContext<StageTransition>({ cover: async () => {}, uncover: () => {} });

export const useStageTransition = () => useContext(Context);

export function StageFrame({ stage, children }: { stage: string; children: ReactNode }) {
  const iris = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);
  const shown = useRef(stage);
  const covered = useRef(false);
  const backwards = useRef(false);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The iris's seal comes from its SVG file, fetched once the first scene has loaded,
  // so it costs the first scene nothing.
  const [sealReady, setSealReady] = useState(false);
  useEffect(() => {
    const arm = () => setTimeout(() => setSealReady(true), 1500);
    if (document.readyState === "complete") {
      const timer = arm();
      return () => clearTimeout(timer);
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onLoad = () => {
      timer = arm();
    };
    window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const reveal = useCallback(() => {
    const el = iris.current;
    if (!el || !covered.current) return;
    covered.current = false;
    if (fallback.current) clearTimeout(fallback.current);
    if (prefersReducedMotion()) {
      gsap.to(el, { autoAlpha: 0, duration: REDUCED, ease: "none" });
      return;
    }
    // Forwards the centre opens onto the next scene; backwards the dark closes in from
    // the edges to the centre.
    const back = backwards.current;
    gsap
      .timeline({ onComplete: () => el.classList.remove("iris--back") })
      .to(
        seal.current,
        { scale: back ? 0.88 : 1.12, autoAlpha: 0, duration: HALF, ease: "power2.in" },
        0,
      )
      .fromTo(
        el,
        { "--iris": back ? OPEN : "0vmax" },
        {
          "--iris": back ? "0vmax" : OPEN,
          duration: HALF,
          ease: back ? "power2.in" : "power2.out",
        },
        0.05,
      )
      .set(el, { autoAlpha: 0 });
  }, []);

  const cover = useCallback(
    (back = false) =>
      new Promise<void>((resolve) => {
        const el = iris.current;
        if (!el) return resolve();
        covered.current = true;
        backwards.current = back;
        el.classList.toggle("iris--back", back);
        play("seal-turn");
        // If the scene does not change (the request ended on the same stage), open again.
        fallback.current = setTimeout(reveal, 8000);
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
          .set(el, { autoAlpha: 1, "--iris": back ? "0vmax" : OPEN })
          .set(seal.current, { autoAlpha: 0, scale: back ? 1.12 : 0.88 })
          .to(
            el,
            {
              "--iris": back ? OPEN : "0vmax",
              duration: HALF,
              ease: back ? "power2.out" : "power2.in",
            },
            0,
          )
          .to(
            seal.current,
            { autoAlpha: 1, scale: 1, duration: HALF * 0.8, ease: "power2.out" },
            HALF * 0.3,
          );
      }),
    [reveal],
  );

  // A new stage has rendered behind the closed iris: open it once the scene is ready.
  useEffect(() => {
    if (shown.current === stage) return;
    shown.current = stage;
    void sceneReady().then(reveal);
  }, [stage, reveal]);

  // Once the scene has settled, fetch the next scene's art.
  useEffect(() => {
    if (!sealReady) return;
    const timer = setTimeout(() => warmNext(stage), 1200);
    return () => clearTimeout(timer);
  }, [stage, sealReady]);

  // The guest's choice of sound for this visit. Nothing loads unless it is on.
  useEffect(() => initSound(), []);

  // The score follows the scene: silent in the opening and on the endings, the drone from
  // the summons, the hall's layer in the council (the council adds the decree's).
  useEffect(() => scoreStage(SCORE[stage] ?? "silent"), [stage]);

  useEffect(
    () => () => {
      if (fallback.current) clearTimeout(fallback.current);
    },
    [],
  );

  return (
    <Context.Provider value={{ cover, uncover: reveal }}>
      {children}
      {stage === "opening" ? null : <SoundControl />}
      <div ref={iris} className="iris" aria-hidden="true">
        <div ref={seal} className="iris-seal">
          {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG, served as it is */}
          {sealReady ? <img src="/icons/seal-active.svg" alt="" decoding="async" /> : null}
        </div>
      </div>
    </Context.Provider>
  );
}
