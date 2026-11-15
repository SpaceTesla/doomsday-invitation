"use client";

import { useRef, useState } from "react";
import { REDUCED, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { play } from "@/lib/sound";

// The summons revealed (design/DESIGN.md, section 6.6), then the seal waking:
//
// 1. The plate parts on a centre seam like a vault door, light in the gap: 1.2 s.
// 2. It closes as one plate bearing the guest's name: 0.8 s.
// 3. The seal's three bands turn to register, each at its own speed, with no bounce
//    (0.7, 0.9 and 1.1 s); once they lock, its runes light in reading order, about
//    75 ms each.
//
// The doors are the plate's own artwork, cut at the seam; they exist only while the
// reveal plays, so without script the plate is simply there. Reduced motion: a 0.2 s
// cross-fade, and the seal is shown awake.

const BAND_TURN = [38, -24, 61]; // where each band rests while dormant (the board's mechanism tile)
const BAND_TIME = [0.7, 0.9, 1.1];
const DORMANT = { gold: "#7a6e52", emerald: "#4a5552" };

export function SummonsMotion() {
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);

  useGSAP(
    () => {
      const doors = root.current;
      const plate = doors?.parentElement;
      if (!doors || !plate) return;
      const content = plate.querySelectorAll(".sm-copy, .sm-caption, .sm-seal");
      const done = () => {
        plate.dataset.motion = "done";
        setPlaying(false);
      };

      if (prefersReducedMotion()) {
        gsap.fromTo(content, { autoAlpha: 0 }, { autoAlpha: 1, duration: REDUCED, ease: "none" });
        plate.dataset.motion = "still";
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

      // The seal starts dormant: bands out of register, runes unlit.
      if (seal) seal.setAttribute("class", "seal seal--dormant");
      bands.forEach((band, i) => gsap.set(band, { rotation: BAND_TURN[i] ?? 0, svgOrigin: "0 0" }));
      gsap.set(goldRunes, { fill: DORMANT.gold });
      gsap.set(emeraldRunes, { fill: DORMANT.emerald });

      gsap.set(content, { autoAlpha: 0 });
      gsap.set(".sm-door--left", { xPercent: 0 });
      gsap.set(".sm-door--right", { xPercent: 0 });
      plate.dataset.motion = "playing";

      const tl = gsap.timeline({ onComplete: done });
      tl.addLabel("part", 0).addLabel("close", 1.2).addLabel("wake", 2.15);

      tl.call(() => play("plate-part"), [], "part");
      tl.to(".sm-door--left", { xPercent: -34, duration: 1.2, ease: "power3.inOut" }, "part");
      tl.to(".sm-door--right", { xPercent: 34, duration: 1.2, ease: "power3.inOut" }, "part");
      tl.fromTo(
        ".sm-light",
        { autoAlpha: 0, scaleX: 0.2 },
        { autoAlpha: 1, scaleX: 1, duration: 1.0, ease: "power2.out" },
        "part+=0.1",
      );
      tl.call(() => play("plate-close"), [], "close");
      tl.to(".sm-door--left", { xPercent: 0, duration: 0.8, ease: "power3.in" }, "close");
      tl.to(".sm-door--right", { xPercent: 0, duration: 0.8, ease: "power3.in" }, "close");
      tl.to(".sm-light", { autoAlpha: 0, duration: 0.6, ease: "power1.in" }, "close+=0.2");
      // As the halves meet, the plate bears the name.
      tl.set(content, { autoAlpha: 1 }, "close+=0.8");
      tl.to(".sm-door", { autoAlpha: 0, duration: 0.15, ease: "none" }, "close+=0.8");

      tl.call(() => play("hum"), [], "wake");
      bands.forEach((band, i) => {
        tl.call(
          () => play("detent", { rate: 1 + i * 0.06 }),
          [],
          `wake+=${(BAND_TIME[i] ?? 0.9) - 0.05}`,
        );
        tl.to(
          band,
          { rotation: 0, duration: BAND_TIME[i] ?? 0.9, ease: "power3.out", svgOrigin: "0 0" },
          "wake",
        );
      });
      const locked = `wake+=${Math.max(...BAND_TIME)}`;
      tl.call(() => seal?.setAttribute("class", "seal seal--active"), [], locked);
      tl.fromTo(
        goldRunes,
        { fill: DORMANT.gold },
        { fill: "#c9a85e", duration: 0.25, stagger: 0.075, ease: "none" },
        locked,
      );
      emeraldRunes.forEach((_, i) =>
        tl.call(
          () => play("rune-tick", { rate: 0.94 + (i % 5) * 0.03 }),
          [],
          `${locked}+=${i * 0.075}`,
        ),
      );
      tl.fromTo(
        emeraldRunes,
        { fill: DORMANT.emerald },
        { fill: "#4fc395", duration: 0.25, stagger: 0.075, ease: "none" },
        locked,
      );
    },
    { scope: root },
  );

  if (!playing) return null;
  return (
    <div ref={root} className="sm-doors" aria-hidden="true">
      <div className="sm-light" />
      <div className="sm-door sm-door--left" />
      <div className="sm-door sm-door--right" />
    </div>
  );
}
