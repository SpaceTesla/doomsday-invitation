"""Export the marks that exist only inside the board generators.

The geometry comes from the approved generator in
design/explorations/assets/board-4-v5-source and is not redrawn here. This script
calls the generator's own functions and writes their output as:

  web/public/icons/*.svg        standalone files
  web/src/marks/<mark>.ts       the same markup, one module per mark, for inline use

Run it from anywhere:  python web/scripts/export-marks.py
It is a one-off tool, not part of the build. Its outputs are committed.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.normpath(os.path.join(HERE, ".."))
SRC = os.path.normpath(os.path.join(WEB, "..", "design", "explorations", "assets", "board-4-v5-source"))
ICONS = os.path.join(WEB, "public", "icons")
MARKS = os.path.join(WEB, "src", "marks")

sys.path.insert(0, SRC)
os.chdir(SRC)
import art  # noqa: E402
import icons as IC  # noqa: E402
import scenes5 as S  # noqa: E402

# Colours of the approved palette, used only as defaults in the standalone files.
STEEL = "#96a19e"
SILVER = "#d9dedc"
GOLD = "#c6a75e"
EMERALD_LIGHT = "#4fc395"

SEAL_CSS = (
    ".seal-base{fill:#0c100f}.seal-gold{stroke:#b8964e}.seal-gold-fill{fill:#c9a85e}"
    ".seal-steel{stroke:#7f8a88}.seal-steel-fill{fill:#9ba6a3}"
    ".seal-em{stroke:#1f8f63}.seal-em-fill{fill:#4fc395}.seal-em-dim{fill:#1d4a3a}"
    ".seal--dormant .seal-em{stroke:#39423f}.seal--dormant .seal-em-fill{fill:#4a5552}"
    ".seal--dormant .seal-gold{stroke:#6b6048}.seal--dormant .seal-gold-fill{fill:#7a6e52}"
    ".seal--waking .seal-core{stroke:#2b6e55}.seal--waking .seal-core .seal-em-fill{fill:#2b6e55}"
)
GOLD_GRADIENT = (
    '<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a6c30"/>'
    '<stop offset=".45" stop-color="#d9bd78"/><stop offset="1" stop-color="#8f7034"/></linearGradient>'
)
CLIP_WAKE = '<clipPath id="clip-wake"><path d="M0,0 L0,-200 A200,200 0 0 1 190,62 Z"/></clipPath>'

USE = re.compile(r'<use href="#ds-(\w+)" transform="([^"]+)"/>')


def inline_runes(markup):
    """Replace each <use href="#ds-x"> with the glyph's own path, so the markup stands alone."""
    return USE.sub(lambda m: '<path fill-rule="evenodd" d="%s" transform="%s"/>' % (art.G[m.group(1)]["d"], m.group(2)), markup)


def inner(svg):
    """The contents of a generator <svg ...>...</svg> string."""
    return re.match(r"<svg[^>]*>(.*)</svg>$", svg, re.S).group(1)


def strip_class(markup, cls):
    return markup.replace(' class="%s"' % cls, "")


def standalone(name, view_box, size, title, body, style="", defs=""):
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" width="%d" height="%d"><title>%s</title>%s%s%s</svg>\n' % (
        view_box, size[0], size[1], title,
        "<style>%s</style>" % style if style else "",
        "<defs>%s</defs>" % defs if defs else "",
        body,
    )
    with open(os.path.join(ICONS, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(svg)


def main():
    os.makedirs(ICONS, exist_ok=True)
    os.makedirs(MARKS, exist_ok=True)

    seal_mark = art.seal_mark(7)
    nested = art.insignia(88, 5)
    bolt = S.bolt(0, 0, 26)
    tile_full = strip_class(inner(S.lib("tile")), "lib-steel").replace(' transform="translate(50,50)"', "", 1)
    tile_empty = inner(S.status_mark("declined"))
    clasp_rayed = strip_class(inner(S.lib("clasp-star")), "lib-steel").replace(' transform="translate(50,50)"', "", 1)
    clasp_knot = strip_class(inner(S.lib("clasp-knot")), "lib-steel").replace(' transform="translate(50,50)"', "", 1)
    seals = {state: inline_runes(art.seal(state)) for state in ("active", "waking", "dormant")}

    # ---- standalone files
    standalone("seal-mark.svg", "-50 -50 100 100", (200, 200), "The seal mark",
               '<g stroke="%s">%s</g>' % (STEEL, seal_mark))
    standalone("nested-square.svg", "-100 -100 200 200", (200, 200), "The nested square",
               '<g stroke="%s">%s</g>' % (EMERALD_LIGHT, nested))
    standalone("bolt.svg", "-30 -30 60 60", (120, 120), "Corner bolt",
               bolt, style=".pl-bolt{fill:url(#g-gold)}.pl-bolt-ring{fill:none;stroke:#3d2f14;stroke-width:1.2}", defs=GOLD_GRADIENT)
    standalone("cuirass-tile.svg", "-50 -50 100 100", (200, 200), "Cuirass tile",
               '<g stroke="%s">%s</g>' % (STEEL, tile_full))
    standalone("cuirass-tile-empty.svg", "-50 -50 100 100", (200, 200), "Cuirass tile, empty",
               '<g stroke="%s">%s</g>' % (STEEL, tile_empty))
    standalone("clasp-rayed.svg", "-50 -50 100 100", (200, 200), "Rayed clasp",
               '<g stroke="%s">%s</g>' % (STEEL, clasp_rayed))
    standalone("clasp-knot.svg", "-50 -50 100 100", (200, 200), "Knot clasp",
               '<g stroke="%s">%s</g>' % (STEEL, clasp_knot))
    for state, body in seals.items():
        standalone("seal-%s.svg" % state, "-210 -210 420 420", (840, 840), "The seal of the Iron Throne, %s" % state,
                   body, style=SEAL_CSS, defs=CLIP_WAKE if state == "waking" else "")

    # ---- inline markup for components
    marks = {
        "sealMark": {"viewBox": "-50 -50 100 100", "body": seal_mark},
        "nestedSquare": {"viewBox": "-100 -100 200 200", "body": nested},
        "bolt": {"viewBox": "-30 -30 60 60", "body": bolt},
        "cuirassTile": {"viewBox": "-50 -50 100 100", "body": tile_full},
        "cuirassTileEmpty": {"viewBox": "-50 -50 100 100", "body": tile_empty},
        "claspRayed": {"viewBox": "-50 -50 100 100", "body": clasp_rayed},
        "claspKnot": {"viewBox": "-50 -50 100 100", "body": clasp_knot},
        "maskLevel1": {"viewBox": "-56 -6 112 162", "body": IC.mask_l1()},
        "maskLevel2": {"viewBox": "-56 -6 112 162", "body": IC.mask_l2()},
        "maskLevel2Plain": {"viewBox": "-56 -6 112 162", "body": IC.mask_l2(1.7, rivets=False)},
        "suitRuneLevel1": {"viewBox": "-1.8 -1.8 3.6 3.6", "body": IC.rune_l1()},
        "suitRuneLevel2": {"viewBox": "-1.8 -1.8 3.6 3.6", "body": IC.rune_l2()},
        "sealActive": {"viewBox": "-210 -210 420 420", "body": seals["active"]},
        "sealWaking": {"viewBox": "-210 -210 420 420", "body": seals["waking"]},
        "sealDormant": {"viewBox": "-210 -210 420 420", "body": seals["dormant"]},
    }
    # One module per mark, so a page bundles only the marks it uses (the seals alone are
    # about 20 KB each and must never reach the browser's script for no reason).
    header = (
        "// Generated by scripts/export-marks.py from the approved board generator\n"
        "// (design/explorations/assets/board-4-v5-source). Do not edit by hand, and do not redraw:\n"
        "// the mask, the suit rune, the seal and the Doomscript glyphs are final.\n"
    )
    for old in os.listdir(MARKS):
        if old.endswith(".ts"):
            os.remove(os.path.join(MARKS, old))

    def write(name, text):
        with open(os.path.join(MARKS, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(header + "\n" + text)

    write("types.ts", "export type MarkData = { readonly viewBox: string; readonly body: string };\n")
    write("clipWake.ts", "export const CLIP_WAKE_PATH = %s;\n" % json.dumps("M0,0 L0,-200 A200,200 0 0 1 190,62 Z"))
    for key, data in marks.items():
        write(
            "%s.ts" % key,
            'import type { MarkData } from "./types";\n\nexport const %s: MarkData = %s;\n'
            % (key, json.dumps(data, ensure_ascii=False)),
        )

    print("icons:", sorted(os.listdir(ICONS)))
    print("marks:", ", ".join(marks))


if __name__ == "__main__":
    main()
