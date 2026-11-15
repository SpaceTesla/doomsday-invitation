"use client";

import { useRef, type ReactNode } from "react";
import { copy } from "@/copy";
import { EASE, gsap, isUpright, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { markOpeningPlayed } from "./opening-played";

// The reveal, as one GSAP timeline with five labels (design/DESIGN.md, sections 6.2 to 6.4):
//
//   0.0 s  dark     concealment: rubble closed, one gap of fog light, the hand in it
//   1.4 s  lift     revelation: rubble to parting; shoulders and hand against the light
//   4.2 s  clear    recognition: rubble open; the slab clears the hood
//   6.0 s  lit      the lit figure fades in over the silhouette
//   7.6 s  summons  scrim, then the name, the line, the runes and both actions
//
// Doom never moves: only the rubble, the light, the ash and the camera do. Any key or
// tap skips to the end. With reduced motion the final frame fades in over 0.2 s.

const AT = { dark: 0, lift: 1.4, clear: 4.2, lit: 6.0, summons: 7.6 } as const;

type State = [number, number, number];
type RockStates = Record<"d" | "p", { closed: State; parting: State }>;

export function OpeningMotion({ token, children }: { token: string; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const scope = root.current;
      if (!scope) return;
      const q = gsap.utils.selector(scope);
      const frame = q(".op-frame");
      const copyLines = q(".op-name, .op-line, .op-sig, .op-act");

      // The lit figure is held back until the first scene has loaded (see Opening.tsx).
      const arm = () => {
        scope.dataset.lit = "";
      };
      const finish = () => {
        arm();
        scope.dataset.motion = "done";
        markOpeningPlayed(token);
      };

      if (prefersReducedMotion()) {
        // The final frame is already drawn by the server and faded in by CSS over 0.2 s
        // (the CSS first beat applies only to full motion). Nothing moves; no ash.
        scope.dataset.motion = "still";
        finish();
        return;
      }

      if (document.readyState === "complete") arm();
      else window.addEventListener("load", arm, { once: true });

      const set = isUpright() ? "p" : "d";
      const rocks = q(".op-rock");
      const stateOf = (el: Element, state: "closed" | "parting") =>
        (JSON.parse((el as HTMLElement).dataset.states ?? "{}") as RockStates)[set][state];
      // x and y are zeroed: GSAP would otherwise read the CSS first beat's translate()
      // back as pixel offsets and keep them on top of the percentages.
      const place = (el: Element, [xPercent, yPercent, rotation]: State) => ({
        x: 0,
        y: 0,
        xPercent,
        yPercent,
        rotation,
      });

      // Concealment, set before the first frame is shown.
      gsap.set(rocks, { transformOrigin: "50% 50%" });
      rocks.forEach((rock) => gsap.set(rock, place(rock, stateOf(rock, "closed"))));
      gsap.set([q(".op-sky"), q(".op-fig")], { scale: 1.045, transformOrigin: "50% 40%" });
      gsap.set(q(".op-fig--lit"), { autoAlpha: 0 });
      gsap.set(q(".op-glow"), { opacity: 0.3 });
      gsap.set([q(".op-scrim"), q(".op-title")], { autoAlpha: 0 });
      // Lines are revealed in place, left to right; they stay in the page for screen readers.
      gsap.set(copyLines, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set([frame, q(".op-copy")], { autoAlpha: 1 });
      scope.dataset.motion = "playing";

      const tl = gsap.timeline({ onComplete: finish });
      tl.addLabel("dark", AT.dark)
        .addLabel("lift", AT.lift)
        .addLabel("clear", AT.clear)
        .addLabel("lit", AT.lit)
        .addLabel("summons", AT.summons);

      // The camera settles and the light behind the hand grows, from the first moment.
      tl.to([q(".op-sky"), q(".op-fig")], { scale: 1, duration: 7, ease: EASE.settle }, "dark");
      tl.to(q(".op-glow"), { opacity: 0.55, duration: 3, ease: EASE.light }, "dark");
      // The title, while the rubble is still closed; gone before the hood is revealed.
      tl.to(q(".op-title"), { autoAlpha: 1, duration: 0.9, ease: EASE.light }, 0.3);
      tl.to(q(".op-title"), { autoAlpha: 0, duration: 0.8, ease: EASE.light }, AT.clear - 0.9);

      rocks.forEach((rock) => {
        const slow = (rock as HTMLElement).dataset.side === "top";
        const duration = slow ? 3.2 : 2.8;
        tl.to(
          rock,
          { ...place(rock, stateOf(rock, "parting")), duration, ease: EASE.rubble },
          "lift",
        );
        tl.to(
          rock,
          { xPercent: 0, yPercent: 0, rotation: 0, duration, ease: EASE.rubble },
          "clear",
        );
      });

      tl.to(q(".op-fig--lit"), { autoAlpha: 1, duration: 1.7, ease: "power1.inOut" }, "lit");

      tl.to(q(".op-scrim"), { autoAlpha: 1, duration: 1.2, ease: EASE.light }, "summons");
      const reveal = { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power2.out" };
      tl.to(q(".op-name"), reveal, "summons");
      tl.to(q(".op-line"), reveal, "summons+=0.9");
      tl.to(q(".op-sig"), reveal, "summons+=1.3");
      tl.to(q(".op-act"), reveal, "summons+=1.8");

      // The ash drifts, then fades to stillness three seconds after the actions appear.
      const dust = q(".op-dust");
      // One tile is 53.33% of the frame's width (131.3% upright) and square. Two tiles down
      // and one to the left loop seamlessly, down and to the left as approved.
      const tile = (frame[0] as HTMLElement).offsetWidth * (set === "p" ? 1.313 : 0.5333);
      const drift = gsap.fromTo(
        dust,
        { backgroundPosition: "0px 0px" },
        {
          backgroundPosition: `${-tile}px ${2 * tile}px`,
          duration: 32,
          ease: "none",
          repeat: -1,
        },
      );
      gsap.to(dust, {
        opacity: 0,
        duration: 1,
        delay: AT.summons + 1.8 + 3,
        ease: EASE.light,
        onComplete: () => {
          drift.kill();
        },
      });

      // Any key or tap skips to the final frame. Actions still work at once: the buttons
      // are in the page from the start, and skipping never swallows the press.
      const skip = contextSafe!(() => {
        arm();
        if (tl.progress() < 1) tl.progress(1);
        gsap.set(dust, { opacity: 0 });
        drift.kill();
      });
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);

      // A slight drift with the pointer, on screens that have one: rubble about 12 px,
      // Doom about 4 px, the fog not at all.
      let parallax: ((event: PointerEvent) => void) | null = null;
      if (window.matchMedia("(pointer: fine)").matches) {
        const near = rocks.map((rock) => ({
          x: gsap.quickTo(rock, "x", { duration: 0.8, ease: "power3.out" }),
          y: gsap.quickTo(rock, "y", { duration: 0.8, ease: "power3.out" }),
        }));
        const far = q(".op-fig").map((fig) => ({
          x: gsap.quickTo(fig, "x", { duration: 0.8, ease: "power3.out" }),
          y: gsap.quickTo(fig, "y", { duration: 0.8, ease: "power3.out" }),
        }));
        parallax = contextSafe!((event: PointerEvent) => {
          const dx = event.clientX / window.innerWidth - 0.5;
          const dy = event.clientY / window.innerHeight - 0.5;
          near.forEach((m) => (m.x(dx * -24), m.y(dy * -24)));
          far.forEach((m) => (m.x(dx * -8), m.y(dy * -8)));
        });
        window.addEventListener("pointermove", parallax);
      }

      return () => {
        window.removeEventListener("load", arm);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
        if (parallax) window.removeEventListener("pointermove", parallax);
      };
    },
    { scope: root, dependencies: [token] },
  );

  return (
    <main ref={root} className="op" data-motion="pending">
      {children}
      <p className="sr-only" aria-live="off">
        {copy["2.8"]}
      </p>
    </main>
  );
}
