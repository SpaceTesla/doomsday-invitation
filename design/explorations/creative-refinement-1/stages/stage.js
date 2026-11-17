// PROPOSED creative refinements: helpers for the review sketches. Not application code.
// Marks and runes come from data.js, which copies the approved geometry unchanged.
(function () {
  const ART = "../../../../web/public/art/";
  const ICONS = "../../../../web/public/icons/";
  const params = new URLSearchParams(location.search);
  const view = params.get("v") === "desktop" ? "desktop" : "phone";
  document.documentElement.classList.add(view);

  /** A mark as inline SVG, painted like the app's InlineMark. */
  function mark(name, cls = "", paint = "stroke") {
    const m = window.MARKS[name];
    const p = paint === "own" ? "" : ` mk--${paint}`;
    return `<svg class="mk${p} ${cls}" viewBox="${m.viewBox}" aria-hidden="true">${m.body}</svg>`;
  }

  /** A line of Doomscript: one <path> per rune, so the runes can light in reading order. */
  function runes(text, cls = "", stagger = 0, delay = 0) {
    const r = window.RUNES[text];
    const glyphs = r.g
      .map(([x, d], i) => {
        const style = stagger ? ` style="--i:${i};animation-delay:${(delay + i * stagger).toFixed(3)}s"` : "";
        return `<path d="${d}" fill-rule="evenodd" transform="translate(${x},0)"${style}/>`;
      })
      .join("");
    const dots = r.dots.map(([cx, cy, rr]) => `<circle cx="${cx}" cy="${cy}" r="${rr}"/>`).join("");
    return `<svg class="runes ${cls}" viewBox="0 0 ${r.w} ${r.h}" aria-hidden="true">${glyphs}${dots}</svg>`;
  }

  function runeBand(text, cls = "", stagger = 0, delay = 0) {
    return `<div class="rune-band ${cls}"><div class="dots"></div>${runes(text, cls.includes("lit-seq") ? "seq" : "", stagger, delay)}<div class="rule"></div></div>`;
  }

  function bolts() {
    const b = `<img class="bolt" src="${ICONS}bolt.svg" alt="">`;
    return ["tl", "tr", "bl", "br"].map((c) => b.replace('class="bolt"', `class="bolt ${c}"`)).join("");
  }

  /** Freeze every animation on the page at t seconds after it was started (for frames). */
  window.freezeAt = function (t) {
    document.getAnimations().forEach((a) => {
      a.pause();
      a.currentTime = t * 1000;
    });
  };
  /** Play: restart every animation from zero. */
  window.replay = function () {
    document.getAnimations().forEach((a) => {
      a.currentTime = 0;
      a.play();
    });
  };

  window.S = { ART, ICONS, params, view, mark, runes, runeBand, bolts };
})();
