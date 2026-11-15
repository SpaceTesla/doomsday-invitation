import type { CSSProperties } from "react";
import { copy, fill } from "@/copy";
import { Runes } from "@/components/Runes";
import desktopLayout from "@/data/hero-d-layout.json";
import phoneLayout from "@/data/hero-p-layout.json";
import { OpeningActions } from "./OpeningActions";
import { OpeningMotion } from "./OpeningMotion";
import { FitName } from "./FitName";

// The opening (design/DESIGN.md, sections 6.2 to 6.4). The server renders the final
// frame: Doom revealed, the rubble open, the lines and both actions in place. That is
// what a guest sees without script, and what the reveal ends on. OpeningMotion plays
// the reveal over these same layers.

type Side = "top" | "left" | "right" | "bottom";
type State = [number, number, number];
type Layout = {
  _frame: { w: number; h: number; hand: [number, number] };
} & Record<Side, { box: [number, number, number, number]; states: Record<string, State> }>;

const D = desktopLayout as unknown as Layout;
const P = phoneLayout as unknown as Layout;
const UPRIGHT = "(max-aspect-ratio: 5/6)"; // keep in step with UPRIGHT_QUERY in src/lib/motion.ts

const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;

/**
 * A rubble state as a transform relative to the piece's own size, so it holds at any
 * frame size: [xPercent, yPercent, rotation].
 */
function relative(layout: Layout, side: Side, state: "closed" | "parting"): State {
  const [, , w, h] = layout[side].box;
  const [dx, dy, rotation] = layout[side].states[state];
  return [(dx / w) * 100, (dy / h) * 100, rotation];
}

/**
 * One layer. The lit figure is not seen until six seconds into the reveal, so it loads
 * lazily: with script, the page holds it back (display: none) until the first scene has
 * loaded, so it never competes with the first beat's files. Without script it loads at
 * once, as part of the final frame. The haze and the lens discs are faint overlays; they
 * load at low priority, after the sky, the silhouette and the rubble.
 */
function Layer({
  name,
  className,
  later = false,
  quiet = false,
}: {
  name: string;
  className: string;
  later?: boolean;
  quiet?: boolean;
}) {
  return (
    <picture className={`op-l ${className}`}>
      <source media={UPRIGHT} srcSet={`/art/hero-p-${name}`} />
      <img
        src={`/art/hero-d-${name}`}
        alt=""
        decoding="async"
        loading={later ? "lazy" : "eager"}
        fetchPriority={later || quiet ? "low" : "high"}
      />
    </picture>
  );
}

function Rock({ side }: { side: Side }) {
  const [dx, dy, dw] = D[side].box;
  const [px, py, pw] = P[side].box;
  const [dcx, dcy, dcr] = relative(D, side, "closed");
  const [pcx, pcy, pcr] = relative(P, side, "closed");
  const style = {
    "--dcx": `${dcx.toFixed(3)}%`,
    "--dcy": `${dcy.toFixed(3)}%`,
    "--dcr": `${dcr}deg`,
    "--pcx": `${pcx.toFixed(3)}%`,
    "--pcy": `${pcy.toFixed(3)}%`,
    "--pcr": `${pcr}deg`,
    "--dl": pct(dx, D._frame.w),
    "--dt": pct(dy, D._frame.h),
    "--dw": pct(dw, D._frame.w),
    "--pl": pct(px, P._frame.w),
    "--pt": pct(py, P._frame.h),
    "--pw": pct(pw, P._frame.w),
  } as CSSProperties;
  const states = {
    d: { closed: relative(D, side, "closed"), parting: relative(D, side, "parting") },
    p: { closed: relative(P, side, "closed"), parting: relative(P, side, "parting") },
  };
  return (
    <picture
      className={`op-rock op-rock--${side}`}
      style={style}
      data-side={side}
      data-states={JSON.stringify(states)}
    >
      <source media={UPRIGHT} srcSet={`/art/hero-p-rock-${side}.webp`} />
      <img src={`/art/hero-d-rock-${side}.webp`} alt="" decoding="async" fetchPriority="high" />
    </picture>
  );
}

export function Opening({ token, address }: { token: string; address: string }) {
  const glow = {
    "--dhx": pct(D._frame.hand[0], D._frame.w),
    "--dhy": pct(D._frame.hand[1], D._frame.h),
    "--phx": pct(P._frame.hand[0], P._frame.w),
    "--phy": pct(P._frame.hand[1], P._frame.h),
  } as CSSProperties;

  return (
    <OpeningMotion token={token}>
      <div className="op-frame" role="img" aria-label={copy["2.7"]}>
        <Layer name="sky.jpg" className="op-sky" />
        <div className="op-glow" style={glow} />
        <Layer name="figure-dark.webp" className="op-fig op-fig--dark" />
        <Layer name="figure-lit.webp" className="op-fig op-fig--lit" later />
        <Layer name="haze.webp" className="op-haze" quiet />
        <div className="op-l op-dust" style={{ backgroundImage: "url(/art/hero-dust.webp)" }} />
        <Layer name="bokeh.webp" className="op-bokeh" quiet />
        <Rock side="right" />
        <Rock side="left" />
        <Rock side="bottom" />
        <Rock side="top" />
        <div className="op-l op-vignette" />
      </div>
      {/* The name of the experience, shown in the opening only, while the rubble is still closed. */}
      <p className="op-title" aria-hidden="true">
        {copy["2.1"]}
      </p>
      <div className="op-scrim" />
      <FitName className="op-copy" nameSelector=".op-name" steps={["step"]}>
        <h1 className="op-name">{fill(copy["2.2"], { "[Title] [Name]": address })}</h1>
        <p className="op-line">{copy["2.3"]}</p>
        <div className="op-sig">
          <Runes inscription="viktor von doom" />
        </div>
        <OpeningActions token={token} />
      </FitName>
    </OpeningMotion>
  );
}
