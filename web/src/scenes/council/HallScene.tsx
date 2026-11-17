"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE, gsap, prefersReducedMotion, UPRIGHT_QUERY, useGSAP } from "@/lib/motion";

// The throne hall as the room the council sits in (design/DESIGN.md, 8.13): the painting is
// fixed behind every step and the content scrolls over it. Doom never moves.
//
// The arrival plays in full once per browser session for a guest (about 2.9 s): the camera
// settles, light rises in the windows, the floor circle lights around its ring, the title is
// written, then the council rises. Later loads in the session get a short fade. Any key or
// tap skips it; reduced motion shows the final frame. After it, nothing moves, except the
// floor answering a meaningful action (useHall().respond()).

/** `settled`: the arrival is over (or was skipped), so a ceremony may begin in full view. */
type Hall = { respond: () => void; settled: boolean };
const HallContext = createContext<Hall>({ respond: () => {}, settled: true });
export const useHall = () => useContext(HallContext);

const seenKey = (token: string) => `iron-throne:hall:${token}`;

function firstArrival(token: string): boolean {
  try {
    const first = window.sessionStorage.getItem(seenKey(token)) !== "1";
    window.sessionStorage.setItem(seenKey(token), "1");
    return first;
  } catch {
    // Storage refused (a private window): play the short version rather than repeat the long.
    return false;
  }
}

export function HallScene({ token, children }: { token: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const respondRef = useRef<() => void>(() => {});
  const [settled, setSettled] = useState(false);

  useGSAP(
    (_context, contextSafe) => {
      const scope = root.current;
      if (!scope) return;
      const q = gsap.utils.selector(scope);

      respondRef.current = contextSafe!(() => {
        if (prefersReducedMotion()) return;
        const light = q(".cn-glow, .cn-wash");
        gsap
          .timeline()
          .fromTo(light, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: EASE.light })
          .to(light, { opacity: 0, duration: 0.8, ease: EASE.light });
      });

      if (prefersReducedMotion()) {
        scope.dataset.arrival = "still";
        setSettled(true);
        return;
      }
      const finish = () => {
        scope.dataset.arrival = "done";
        setSettled(true);
      };
      const body = q(".cn-body");
      const dark = q(".cn-dark");

      if (!firstArrival(token)) {
        gsap.set(body, { autoAlpha: 0 });
        gsap.set(dark, { opacity: 0.62 });
        scope.dataset.arrival = "playing";
        gsap
          .timeline({ onComplete: finish })
          .to(dark, { opacity: 0, duration: 0.6, ease: EASE.light }, 0)
          .to(body, { autoAlpha: 1, duration: 0.45, ease: EASE.light }, 0.15);
        return;
      }

      const cam = q(".cn-cam");
      const unlit = q(".cn-unlit");
      const title = q(".cn-head .hd");
      const flanks = q(".cn-flank");
      gsap.set(cam, { scale: 1.06 });
      gsap.set(dark, { opacity: 0.62 });
      gsap.set(unlit, { opacity: 1, "--a": "0deg" });
      gsap.set(title, { clipPath: "inset(0% 100% 0% 0%)" });
      gsap.set(flanks, { autoAlpha: 0 });
      gsap.set(body, { autoAlpha: 0, y: 36 });
      scope.dataset.arrival = "playing";

      const tl = gsap.timeline({ onComplete: finish });
      tl.to(cam, { scale: 1, duration: 2.6, ease: EASE.settle }, 0)
        .to(dark, { opacity: 0, duration: 2.2, ease: EASE.light }, 0)
        .to(unlit, { "--a": "400deg", duration: 1.5, ease: "none" }, 0.6)
        .set(unlit, { opacity: 0 }, 2.1)
        .fromTo(
          q(".cn-glow"),
          { opacity: 0 },
          { opacity: 0.9, duration: 0.55, ease: EASE.light },
          1.6,
        )
        .to(q(".cn-glow"), { opacity: 0, duration: 0.85, ease: EASE.light }, 2.15)
        .to(title, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.out" }, 1.5)
        .to(flanks, { autoAlpha: 1, duration: 0.6, ease: EASE.light }, 1.9)
        .to(body, { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE.settle }, 2.3);

      // Any key or tap skips to the settled hall. The council's controls work at once.
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

  // The hall dims as the guest reads further down, so no text ever sits on bright glass.
  useEffect(() => {
    const hall = root.current?.querySelector<HTMLElement>(".cn-hall");
    if (!hall) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const reach = window.matchMedia(UPRIGHT_QUERY).matches ? 260 : 360;
      hall.style.setProperty("--dim", String(Math.min(1, window.scrollY / reach)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const respond = useCallback(() => respondRef.current(), []);
  const hall = useMemo(() => ({ respond, settled }), [respond, settled]);

  return (
    <HallContext.Provider value={hall}>
      <div ref={root} className="cn" data-arrival="pending">
        <div className="cn-hall" aria-hidden="true">
          <div className="cn-cam">
            <picture>
              <source media={UPRIGHT_QUERY} srcSet="/art/hall-p-plate.jpg" />
              <img src="/art/hall-d-plate.jpg" alt="" decoding="async" fetchPriority="high" />
            </picture>
            <picture>
              <source media={UPRIGHT_QUERY} srcSet="/art/hall-p-doom.webp" />
              <img src="/art/hall-d-doom.webp" alt="" decoding="async" fetchPriority="high" />
            </picture>
            <div className="cn-circle cn-unlit" />
            <div className="cn-circle cn-glow" />
          </div>
          <div className="cn-wash" />
          <div className="cn-shade" />
          <div className="cn-dark" />
        </div>
        {children}
      </div>
    </HallContext.Provider>
  );
}
