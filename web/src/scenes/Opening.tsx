import type { CSSProperties } from "react";
import { copy, fill } from "@/copy";
import { Runes } from "@/components/Runes";
import desktopLayout from "@/data/hero-d-layout.json";
import phoneLayout from "@/data/hero-p-layout.json";
import { OpeningActions } from "./OpeningActions";

// The opening, as its final frame: Doom revealed, the rubble open, the two lines and
// the two actions. In milestone 3 nothing moves; the reveal is milestone 4. The layers,
// their order and positions are the approved ones (design/DESIGN.md, section 6.2), and
// the layer set follows the shape of the screen: the phone composition when upright.

type Layout = {
  _frame: { w: number; h: number; hand: [number, number] };
} & Record<"top" | "left" | "right" | "bottom", { box: [number, number, number, number] }>;

const D = desktopLayout as unknown as Layout;
const P = phoneLayout as unknown as Layout;

const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;

/** One layer of the frame: the phone file when the screen is upright, the desktop file otherwise. */
function Layer({ name, className }: { name: string; className: string }) {
  return (
    <picture className={`op-l ${className}`}>
      <source media="(orientation: portrait)" srcSet={`/art/hero-p-${name}`} />
      <img src={`/art/hero-d-${name}`} alt="" decoding="async" />
    </picture>
  );
}

function Rock({ side }: { side: "top" | "left" | "right" | "bottom" }) {
  const [dx, dy, dw] = D[side].box;
  const [px, py, pw] = P[side].box;
  const style = {
    "--dl": pct(dx, D._frame.w),
    "--dt": pct(dy, D._frame.h),
    "--dw": pct(dw, D._frame.w),
    "--pl": pct(px, P._frame.w),
    "--pt": pct(py, P._frame.h),
    "--pw": pct(pw, P._frame.w),
  } as CSSProperties;
  return (
    <picture className="op-rock" style={style}>
      <source media="(orientation: portrait)" srcSet={`/art/hero-p-rock-${side}.webp`} />
      <img src={`/art/hero-d-rock-${side}.webp`} alt="" decoding="async" />
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
    <main className="op">
      <div className="op-frame" role="img" aria-label={copy["2.7"]}>
        <Layer name="sky.jpg" className="op-sky" />
        <div className="op-glow" style={glow} />
        <Layer name="figure-dark.webp" className="op-fig" />
        <Layer name="figure-lit.webp" className="op-fig" />
        <Layer name="haze.webp" className="op-haze" />
        <div className="op-l op-dust" style={{ backgroundImage: "url(/art/hero-dust.webp)" }} />
        <Layer name="bokeh.webp" className="op-bokeh" />
        <Rock side="right" />
        <Rock side="left" />
        <Rock side="bottom" />
        <Rock side="top" />
        <div className="op-l op-vignette" />
      </div>
      <div className="op-scrim" />
      <div className="op-copy">
        <h1 className="op-name">{fill(copy["2.2"], { "[Title] [Name]": address })}</h1>
        <p className="op-line">{copy["2.3"]}</p>
        <div className="op-sig">
          <Runes inscription="viktor von doom" />
        </div>
        <OpeningActions token={token} />
      </div>
    </main>
  );
}
