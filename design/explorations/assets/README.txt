Supporting assets for concept board IV (The Iron Throne)

FIRST VERSION (direction-4-the-iron-throne.html)

doomscript-glyphs.svg   The 22 runes as vector outlines, with the reading each has in the fan decoder.
doomscript-glyphs.json  The same outlines as path data, for reuse.
iron-throne-seal.svg    The three-band seal on its own.
board-4-source/         The generator the first board was assembled from. Python 3 with Pillow; nothing else.

The rune outlines are traced from references/inspiration/doomscript-decoder.png by trace.py.
That decoder is a fan's reading. Marvel has published no key.

To rebuild the first board after editing its source:
    python board-4-source/build.py
It rewrites ../direction-4-the-iron-throne.html. To retrace the runes:
    python board-4-source/trace.py <path to doomscript-decoder.png>
(run from inside board-4-source; it rewrites glyphs.json there).


REFINED VERSION (direction-4-the-iron-throne-v2.html)

v2/                     Everything the refined board loads.
  mask-master.svg         The measured outlines of the mask, with landmark levels.
  mask-level-1.svg        Icon: one filled shape.
  mask-level-2.svg        Insignia: line, rivets as dots.
  mask-level-3.png        Full fidelity: the outlines raised into relief and lit.
  suit-rune-master.svg    The suit rune as read from the two views. The dashed bracket is seen in one view only.
  suit-rune-level-1.svg, suit-rune-level-2.svg, suit-rune-level-3.png
  horned-mark.svg         Traced from references/inspiration/doom-logo.png. Shown on the board, not used.
  hero-d-*, hero-p-*      The layers of the opening reveal, desktop (1920 x 1080) and phone (780 x 1688).
  hero-*-layout.json      Where each piece of rubble sits when closed, parting and open.
  hall-*-plate.jpg        The throne hall with the throne empty.
  hall-*-doom.webp        The seated figure, as its own layer.
  study-*.jpg, mat-*.jpg  Crops of the renders shown on the board.

board-4-v2-source/      The generator. Python 3 with Pillow, NumPy and SciPy.
  maskgeo.py              The mask master: every outline as points, right half only.
  icongeo.py              The suit rune and the horned mark as geometry.
  icons.py                Vector levels of the mask and the rune.
  mask_render.py          Mask level 3.
  figure.py, hero.py      The hero figure and the layers of the reveal.
  hall.py                 The throne hall.
  extras.py               Suit rune level 3 and the crops.
  rl.py                   Shared rendering helpers.
  scenes2.py, build2.py, board4v2.html, board4v2.css, board4v2-additions.css, art.css, defs.svg
                          The board itself. art.py and glyphs.json are the first version's rune and seal code, unchanged.

The scenes are procedural renders of original drawings made from the reference images.
No reference image is traced into a layer or copied into this folder.

To rebuild, from inside board-4-v2-source:
    python icons.py
    python mask_render.py
    python hero.py both        (about two and a half minutes)
    python hall.py both
    python extras.py crops
    python build2.py           (rewrites ../../direction-4-the-iron-throne-v2.html)


FINAL ART DIRECTION (direction-4-the-iron-throne-v3.html)

A correction of the figure, and a typography comparison. The refined version above is left as it was.

v3/                     Only what changed.
  hero-d-figure-*.webp, hero-p-figure-*.webp   The corrected figure, silhouette and lit, desktop and phone.
  hero-*-layout.json                           Layout for the reveal with the new figure.
  before-*.jpg, after-figure.jpg, study-*.jpg  Crops for the before and after comparison.
  mat-wool.jpg, mat-cuirass.jpg                Material crops from the corrected figure.
  Fog, haze, ash, lens discs, rubble, hall, mask and rune files are not repeated here.
  The final board loads them from v2/.

board-4-v3-source/      The generator for this revision. Same requirements as the refined version.
  figure.py               The corrected proportions and the rebuilt hand and arm.
  hero.py                 Renders the figure layers only.
  typo.py                 The typography comparison: faces, verdicts, combinations.
  extras.py               The comparison crops.
  scenes3.py, build3.py, board4v3.html, board4v3-additions.css   The board.

To rebuild, from inside board-4-v3-source:
    python hero.py both        (about two and a half minutes)
    python extras.py
    python build3.py           (rewrites ../../direction-4-the-iron-throne-v3.html)


FINAL CHARACTER PASS (direction-4-the-iron-throne-v4.html)

A second, narrower correction of the figure: hood, cowl and cloak, and the raised hand. Revision 3 is left as it was.

v4/                     The corrected figure layers and layout, and before and after crops (before = v3).
board-4-v4-source/      The generator. figure.py holds the changes; the rest is as in v3.

To rebuild, from inside board-4-v4-source:
    python hero.py both
    python extras.py
    python build4.py           (rewrites ../../direction-4-the-iron-throne-v4.html)


TYPOGRAPHY REVIEW (direction-4-the-iron-throne-v5.html)

The approved typefaces applied to revision 4's frames, plus a first mock of the council. No new artwork:
the page loads the figure from v4/ and everything else from v2/.

board-4-v5-source/      board4v5.html, board4v5.css, findings.html, scenes5.py, build5.py, and the shared drawing code.

To rebuild, from inside board-4-v5-source:
    python build5.py           (rewrites ../../direction-4-the-iron-throne-v5.html)

Nothing here is application code.
