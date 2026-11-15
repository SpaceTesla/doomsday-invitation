"""Export the summons plate as artwork, from the approved board generator.

The plate (brushed steel, bevel, dotted gold line, rule, engraved rune bands, bolts,
and on the wide plate the mask insignia and the dividing line) is drawn by
design/explorations/assets/board-4-v5-source/scenes5.py. This script calls that code
and writes two standalone SVGs. The parts that move or carry words stay out: the seal
(a live component, because it wakes in milestone 4) and the dating clause (real text).

The SVGs use live filters (brushed steel, engraving). They are then baked to WebP by
rendering them in a browser (see web/scripts/README.md), because live SVG filters are
too slow for a phone.

Usage: python web/scripts/export-plates.py <output folder>
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "design", "explorations", "assets", "board-4-v5-source"))
sys.path.insert(0, SRC)
os.chdir(SRC)
import art  # noqa: E402
import scenes5 as S  # noqa: E402

# build5.py builds the board when imported, so its gradient definitions are read as text.
_build = open(os.path.join(SRC, "build5.py"), encoding="utf-8").read()
EXTRA_DEFS = re.search(r"EXTRA_DEFS = '''(.*?)'''", _build, re.S).group(1)

STYLE = """
.pl-dots{fill:none;stroke:#C6A75E;stroke-width:2.4;stroke-dasharray:0 8.5;stroke-linecap:round;opacity:.85}
.pl-rule{fill:none;stroke:#5A6462;stroke-width:1}
.pl-runes{fill:#060808}
.pl-bolt{fill:url(#g-gold)}
.pl-bolt-ring{fill:none;stroke:#3d2f14;stroke-width:1.2}
.pl-sigil{stroke:#C6A75E;color:#C6A75E}
.pl-cap{fill:#96A19E}
"""


def inner(svg):
    return re.match(r"<svg[^>]*>(.*)</svg>$", svg, re.S).group(1)


def strip_live_parts(body):
    # The seal is drawn live by the application; the caption is real text.
    body = re.sub(r'<g transform="translate\([^)]*\) scale\([^)]*\)" filter="url\(#lit\)"><use href="#seal-active"/></g>', "", body)
    body = re.sub(r"<text [^>]*>.*?</text>", "", body)
    return body


def document(view_w, view_h, body):
    defs = open("defs.svg", encoding="utf-8").read() + EXTRA_DEFS + art.rune_defs() + S.sprite()
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">'
        "<style>%s</style><defs>%s</defs>%s</svg>\n" % (view_w, view_h, view_w, view_h, STYLE, defs, body)
    )


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    desktop = strip_live_parts(inner(S.summons_desktop("sd")))
    phone = strip_live_parts(inner(S.summons_phone("sp")))
    for name, w, h, body in (("summons-d-plate.svg", 1200, 900, desktop), ("summons-p-plate.svg", 780, 1688, phone)):
        with open(os.path.join(out, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(document(w, h, body))
        print("wrote", name)


if __name__ == "__main__":
    main()
