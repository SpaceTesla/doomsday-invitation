"use client";

import { useRef, useState } from "react";
import { REDUCED, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { play } from "@/lib/sound";

// The summons revealed (design/DESIGN.md, 6.6, as refined on 17 November 2026):
//
// 1. Heavier outer doors stand before the summons, locked by the raised suit rune. The lock
//    presses in and releases first (a detent), then the doors part fully, coming slightly
//    forward and casting their shadow, and stay open (plate-part). Light enters the gap.
// 2. A band of light passes across the plate behind them, and the words appear in its wake.
// 3. The seal wakes: its three bands turn to register, each at its own speed, a detent as
//    each locks; then its runes light in reading order, one tick each.
//
// The doors are server-rendered, closed, so the plate never flashes before the reveal; they
// are removed when it ends. The full reveal plays on the first arrival in a browser session;
// later arrivals get the light alone. Any key or tap skips to the end; the actions work at
// once. Reduced motion: a 0.2 s cross-fade, the seal shown awake.

const BAND_TURN = [38, -24, 61]; // where each band rests while dormant (the board's mechanism tile)
const BAND_TIME = [0.7, 0.9, 1.1];
const DORMANT = { gold: "#7a6e52", emerald: "#4a5552" };
const TICK = 0.075;

const seenKey = (token: string) => `iron-throne:summons:${token}`;

function firstArrival(token: string): boolean {
  try {
    const first = window.sessionStorage.getItem(seenKey(token)) !== "1";
    window.sessionStorage.setItem(seenKey(token), "1");
    return first;
  } catch {
    return false;
  }
}

export function SummonsMotion({ token }: { token: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);

  useGSAP(
    (_context, contextSafe) => {
      const doors = root.current;
      const plate = doors?.parentElement?.querySelector<HTMLElement>(".sm-plate");
      if (!doors || !plate) return;
      const words = plate.querySelectorAll(".sm-copy, .sm-caption");
      const done = () => {
        plate.dataset.motion = "done";
        setPlaying(false);
      };

      if (prefersReducedMotion()) {
        // "settling" already takes the plate out of the waiting styles; "still" says the
        // words are fully shown, so nothing (a contrast check, say) reads them mid-fade.
        plate.dataset.motion = "settling";
        gsap.fromTo(
          words,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: REDUCED,
            ease: "none",
            onComplete: () => {
              plate.dataset.motion = "still";
            },
          },
        );
        setPlaying(false);
        return;
      }

      const svg = plate.querySelector(".sm-seal svg");
      const seal = svg?.querySelector("g.seal");
      const bands = svg
        ? Array.from(svg.querySelectorAll(":scope > g > g[transform^='rotate']"))
        : [];
      const goldRunes = svg ? Array.from(svg.querySelectorAll(".seal-gold-fill path")) : [];
      const emeraldRunes = svg ? Array.from(svg.querySelectorAll(".seal-em-fill path")) : [];
      const full = firstArrival(token);
      const q = gsap.utils.selector(doors);

      // The seal starts dormant: bands out of register, runes unlit.
      if (seal) seal.setAttribute("class", "seal seal--dormant");
      bands.forEach((band, i) => gsap.set(band, { rotation: BAND_TURN[i] ?? 0, svgOrigin: "0 0" }));
      gsap.set(goldRunes, { fill: DORMANT.gold });
      gsap.set(emeraldRunes, { fill: DORMANT.emerald });
      gsap.set(plate, { "--r": -8 });
      plate.dataset.motion = "playing";

      const tl = gsap.timeline({ onComplete: done });
      if (full) {
        tl.addLabel("press", 0.3).addLabel("release", 0.6).addLabel("open", 0.95);
        tl.addLabel("write", 1.75).addLabel("wake", 3.3);
        // The lock presses in, then releases: a detent, light along the seam.
        tl.to(q(".sm-lock"), { scale: 0.97, duration: 0.25, ease: "power2.in" }, "press");
        tl.call(() => play("detent"), [], "release");
        tl.to(q(".sm-lock"), { scale: 1, duration: 0.3, ease: "power3.out" }, "release");
        tl.to(
          q(".sm-door--left .sm-lock"),
          { x: -7, duration: 0.3, ease: "power3.out" },
          "release",
        );
        tl.to(
          q(".sm-door--right .sm-lock"),
          { x: 7, duration: 0.3, ease: "power3.out" },
          "release",
        );
        tl.fromTo(
          q(".sm-seam-light"),
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" },
          "release",
        );
        tl.to(q(".sm-seam-light"), { opacity: 0, duration: 0.5, ease: "power1.in" }, "open+=0.2");
        // The doors part fully, coming slightly forward, and stay open.
        tl.call(() => play("plate-part"), [], "open");
        const open = { duration: 1.45, ease: "power3.inOut" };
        tl.to(q(".sm-door--left"), { xPercent: -112, scale: 1.04, ...open }, "open");
        tl.to(q(".sm-door--right"), { xPercent: 112, scale: 1.04, ...open }, "open");
        tl.fromTo(
          q(".sm-gap"),
          { opacity: 0, scaleX: 0.02 },
          { opacity: 1, scaleX: 1, duration: 0.6, ease: "power2.out" },
          "open",
        );
        tl.to(
          q(".sm-gap"),
          { opacity: 0, scaleX: 2.2, duration: 1.1, ease: "power1.in" },
          "open+=0.6",
        );
        tl.to(
          plate.querySelector(".sm-dim"),
          { opacity: 0, duration: 0.9, ease: "power2.out" },
          "open+=0.55",
        );
      } else {
        // A later arrival this session: the doors already stand open; the light alone.
        gsap.set(q(".sm-door, .sm-gap, .sm-seam-light"), { autoAlpha: 0 });
        gsap.set(plate.querySelector(".sm-dim"), { opacity: 0 });
        tl.addLabel("write", 0.1).addLabel("wake", 1.05);
      }

      // The band of light writes the plate, left to right.
      const sweep = full ? 1.5 : 0.9;
      tl.fromTo(
        plate.querySelector(".sm-sweep"),
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: "none" },
        "write",
      );
      tl.to(plate, { "--r": 112, duration: sweep, ease: "power1.inOut" }, "write");
      tl.to(
        plate.querySelector(".sm-sweep"),
        { opacity: 0, duration: 0.25, ease: "none" },
        `write+=${sweep - 0.2}`,
      );

      // The seal wakes: bands turn and lock, then the runes light one by one.
      bands.forEach((band, i) => {
        const turn = BAND_TIME[i] ?? 0.9;
        tl.call(() => play("detent", { rate: 1 + i * 0.06 }), [], `wake+=${turn - 0.05}`);
        tl.to(band, { rotation: 0, duration: turn, ease: "power3.out", svgOrigin: "0 0" }, "wake");
      });
      // A number, not a label string: "wake+=1.1+=0.075" is not a position GSAP can read.
      const locked = tl.labels.wake + Math.max(...BAND_TIME);
      tl.call(() => seal?.setAttribute("class", "seal seal--active"), [], locked);
      tl.call(
        () =>
          emeraldRunes.forEach((_, i) =>
            play("rune-tick", { rate: 0.94 + (i % 5) * 0.03, delay: i * TICK }),
          ),
        [],
        locked,
      );
      tl.fromTo(
        goldRunes,
        { fill: DORMANT.gold },
        { fill: "#c9a85e", duration: 0.25, stagger: TICK, ease: "none" },
        locked,
      );
      tl.fromTo(
        emeraldRunes,
        { fill: DORMANT.emerald },
        { fill: "#4fc395", duration: 0.25, stagger: TICK, ease: "none" },
        locked,
      );

      // Any key or tap skips to the end. Nothing is lost: the actions are live throughout.
      const skip = contextSafe!(() => {
        if (tl.progress() < 1) tl.progress(1);
      });
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      return () => {
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
      };
    },
    { scope: root, dependencies: [token] },
  );

  if (!playing) return null;
  return (
    <div ref={root} className="sm-doors" aria-hidden="true">
      <div className="sm-gap" />
      <div className="sm-door sm-door--left">
        <span className="sm-strap sm-strap--a" />
        <span className="sm-strap sm-strap--b" />
        <span className="sm-lock" />
      </div>
      <div className="sm-door sm-door--right">
        <span className="sm-strap sm-strap--a" />
        <span className="sm-strap sm-strap--b" />
        <span className="sm-lock" />
      </div>
      <span className="sm-seam-light" />
    </div>
  );
}
