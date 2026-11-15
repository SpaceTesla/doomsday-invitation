# The Iron Throne: visual refinement (v2.1)

Supporting analysis for `design/explorations/direction-4-the-iron-throne-v2.html`.

This is a targeted second pass on the approved fourth direction. It changes four things: the opening, the way Doom is drawn, the throne hall, and the mask iconography. It adds the suit rune. Everything else on the first Direction IV board is carried over.

Nothing here is application code, and the final design language has not been started. Both wait for your approval.

## Status in one paragraph

The opening is now a reveal through rubble, storyboarded in four beats and playable as a rough motion sketch. Doom and the hall are rendered with light and shadow from original drawings made from your references, which is a clear step up from the flat vector of version one. The work is still concept artwork: no image generator was available, so nothing on the board is a painting or a film-quality render, and the board says where each piece falls short. The mask iconography is the most finished part: one measured master, three levels cut from it, and vector files ready to reuse.

## 1. What was inspected

Every file in the three reference folders was opened and looked at individually.

| File | What it is | Used for |
|---|---|---|
| `character/doom-1.png` | Full figure on a poster, low angle, cloak spread, green fog | Proportions of shoulders and cloak |
| `character/doom-2.png` | Head and chest close-up under green light | Hood, cowl, clasps, chain, cuirass tiles, mask in context |
| `character/doom-3.png` | Full standing figure, arms crossed | Belt, greaves, boots, overall silhouette |
| `character/doom-4.jpg` | Three-quarter close-up, arms crossed | Vambrace, cuff, mail, belt buckle, tile detail |
| `environment/doom-throme-wide.png` | Wide shot of the throne hall | The plan of the hall (primary) |
| `environment/doom-throme.jpg` | Upright view of the throne and its two bays | Phone composition of the hall, the upper glass |
| `environment/doom-castle.webp` | An ante-hall with lamps and a tapestry | The bowl lamps |
| `inspiration/doom-mask.png` | The mask alone, from the front | The mask master (primary) |
| `inspiration/doom-reveal-1.png` to `-3.png` | Three consecutive stills of the reveal | The opening sequence (primary) |
| `inspiration/rune-view-1.png`, `rune-view-2.png` | A mark raised on an armour plate, two views | The suit rune |
| `inspiration/doom-logo.png`, `doom-logo-text.png` | A horned mark, alone and under blackletter lettering | The horned mark in the library |
| `inspiration/doomscript-decoder.png` | The fan-made rune decoder | Unchanged from the first board |

Two notes on the brief against the folder:

- **The mask image is not in `references/character/`.** It is `references/inspiration/doom-mask.png`. It was identified by looking, as the brief asked.
- **The hall reference is named `doom-throme-wide.png`**, as the brief spells it.

## 2. Workstream A: the reveal

### What the three frames do

Read as a sequence, the frames disclose one thing at a time.

1. **Frame 1.** Almost the whole frame is dark, soft rock. One small bright gap, left of centre, holds the silhouette of a raised hand. Nothing else can be identified.
2. **Frame 2.** The gap has opened to about half the frame. A cloaked torso and the raised hand are clear. A slab still crosses the top and hides the head completely.
3. **Frame 3.** The slab has gone. The hood stands in silhouette against pale fog. Rock remains at the left edge and the upper right as a soft frame.

The technique, as distinct from the picture:

- **Order.** Hand, body, head. The most identifying part comes last.
- **Foreground.** The rock is close to the lens and far out of focus. It hides and frames, and carries no detail of its own.
- **Light.** One source, behind the figure, brightest behind the hand. The figure is a silhouette throughout; there is no light on his front.
- **Air.** Sparse streaks of ash or snow, and large soft discs low in the frame from flecks on the lens.
- **Camera.** Low, looking up. The viewer is under the rock.
- **Pace.** The three frames are close together in time: the rock moves steadily and the figure does not move at all.

### What the invitation does with it

The guest takes the place of the person under the rubble. "Doctor Doom is here to collect you" then describes what is happening on screen.

| Beat | Time | What happens | State of the layers |
|---|---|---|---|
| 1. Concealment | 0 to 1.4 s | Near black. One gap of fog light with fingers in it. Ash drifts. | Rubble closed. Figure as silhouette. |
| 2. Revelation | 1.4 to 4.2 s | The slab rises and the side masses draw back. Shoulders and hand stand against the light; the head is still hidden. The rune on his forearm lights. | Rubble half open. Figure as silhouette. |
| 3. Recognition | 4.2 to 7.6 s | The slab clears the hood. From 6.0 s the costume comes up out of silhouette: hood edge, near half of the mask, clasps and chain. | Rubble open. Lit figure fades in over the silhouette. |
| 4. The summons | from 7.6 s | "Mr. Anish." then, after a pause, "Doctor Doom is here to collect you." then both actions. | Scrim and text fade in at the foot. |

The fourth step is ours. The film frames stop at a silhouette. The brief asks for the mask, hood and armour to emerge without everything being exposed at once, so the lit pass keeps one side of him dark and never lights the cloak evenly.

### Layout

- **Wide screens.** The scene fills the viewport. Doom is centred and occupies the upper two thirds. Name, line, signature runes and both actions are centred in the lowest third, on a dark scrim over the rubble. Nothing sits in a left-hand column.
- **Phones.** A separate render at 390 by 844. The hand is raised beside the head so both fit an upright frame, the figure is set slightly right of centre to make room for it, and the rubble closes from above and below. The message and actions sit under the figure.
- **Sizes between.** The figure keeps its height. The side rubble slides inwards as the frame narrows, so no empty band appears at either side.

### How it is layered

Eleven flat layers and a vignette over them, back to front:

| Layer | File (desktop) | Moves? |
|---|---|---|
| Fog, lit from behind | `hero-d-sky.jpg` | Eases from 104.5% scale to 100% |
| Glow behind the hand | CSS gradient | Brightens |
| Figure, silhouette | `hero-d-figure-dark.webp` | Eases with the fog |
| Figure, lit | `hero-d-figure-lit.webp` | Opacity 0 to 1 |
| Low haze | `hero-d-haze.webp` | No |
| Ash | `hero-dust.webp`, tiled | Loops down and left, 16 s |
| Lens discs | `hero-d-bokeh.webp` | No |
| Rubble: right, left, bottom, top | `hero-d-rock-*.webp` | Each slides, the slab also turns 1.5 degrees |
| Vignette | CSS gradient | No |

The positions of the rubble in each state are in `hero-d-layout.json` and `hero-p-layout.json`, which the board reads.

No 3D, no physics, no animated filter. Movement is translation and a small scale; light is a cross-fade. The motion sketch on the board uses CSS transitions and five timers. In the build this would be one GSAP timeline with labels for the five states, pointer parallax on the rubble (about 12 px) and figure (about 4 px), and each line of text revealed by a clip.

### Reduced motion

With reduced motion on, the final frame fades in over 0.2 s with the text already set. No drift, no ash loop, no parallax. The motion sketch on the board honours the setting.

Also planned and described on the board: any key or tap skips to the final frame; the sequence plays once per guest; the two actions are in the page from the start for assistive technology.

### A rule from the first board that this changes

The first board said that nothing drifts and that there are no particles. The reveal has drifting ash and moving rubble, because the reference sequence depends on both. Doom himself still does not move. This is a deliberate change and needs your agreement.

## 3. Workstream B: Doom

### What the references show

**Mask.** Forged steel with a satin, scratched surface. Two heavy brow plates whose lower edges fall towards the nose. Wide, low eye openings. A wedge nose with a flat ridge. A slotted mouth with a bar across it, under a lip plate whose ends turn down. Riveted cheek and jaw plates. Measured in section 5.

**Hood and cloak.** Heavy green wool. The hood is deep enough to put the upper third of the mask in shadow, and comes to a soft point. It runs into thick turns of cloth across the collar bones. In low light it reads as near black; the green shows only where light strikes it.

**Armour.** Two steel discs on the collar bones joined by a chain: one with a rayed star and a red stone, the other with an interlaced square. A cuirass of square tiles, each a raised frame, an inner square and a diamond. Fine mail at the neck and elbow. A long forearm plate with a raised rib and a row of small rivets, ending in a banded cuff. A broad ribbed belt with a square buckle. Segmented greaves and boots.

### What the new figure is

A relief built from drawn outlines and lit by calculation: each part is an outline, the outlines are raised into a height map, and the map is lit with a rim light from behind and a weak fill from below. The mask is the measured master at full detail. Two passes are rendered, a silhouette and a lit version, so the page can cross-fade between them.

| Part | In the figure? |
|---|---|
| Mask | Yes, from the master |
| Hood, with shadow over the brow | Yes |
| Cowl | Yes, simplified to two turns |
| Clasps (rayed star, squared knot) and chain | Yes, without the red stone |
| Tiled cuirass | Yes |
| Vambrace with rivet row and cuff | Yes |
| Suit rune on the vambrace | Yes; its position is our choice |
| Gauntlet hand | As an outline only |
| Mail | No |
| Belt, greaves, boots | Out of frame in the opening; indicated on the small seated figure |

### Where it falls short

- The hood is too smooth. Real cloth would break into folds and have a visible weave at this size.
- The cloak has little weight or drape.
- The hand is a silhouette with rounded fingers. It works against the light and would not survive being lit.
- The seated figure in the hall is a small stand-in with little detail.

It is recognisably Doom and no longer a flat cartoon, and it fixes pose, lighting and layering. It is short of film quality. Final artwork would be painted or modelled over these layers, keeping their size, position and lighting.

## 4. Workstream C: the throne hall

### What the reference shows

- **Symmetry.** One axis. Throne, pier and slit are on it and everything else mirrors about it.
- **The pier.** A tall dark mass behind the throne running out of the top of the frame, with a narrow slit of amber light down its centre and a gold panel above the head.
- **The glass.** A bay each side of the pier. The leading is organic: uprights that bend and part like stems, tied by short level bars. The glass is pale yellow at mid height, greener and dirtier towards the floor, streaked throughout.
- **Pillars.** Beside each bay, a pillar carrying a narrow strip of amber ornament with pale blue-green glass at its foot.
- **Fins.** Beyond the pillars, dark slanted masses that widen as they climb, with more glass behind them.
- **The dais.** Nine shallow steps, canted at the sides, each with a line of gold along the middle of its edge.
- **The throne.** A broad block with long low arms that rise slightly outwards.
- **The floor.** Dark and polished. A large inlaid circle with a star of lines inside it, burning green along parts of its length.
- **Lamps.** Pale bowls on dark posts at the side walls.
- **Light.** Sun high on the right, in shafts. Three colours: yellow-green from the glass, amber from the strips, emerald from the floor. Shadows are teal-black.

### What changed

Version one drew a Gothic hall: lancet windows, clustered columns and the three-band seal as a rose window. The reference has none of these, so they are gone. The new hall keeps every item in the list above.

Ours, within that plan:

- The floor circle carries Doomscript: "there is no promise of tomorro", the phrase the first board used for its floor ring.
- The lattice inside the circle is the hexagon and centre square of the suit rune, in place of the reference's star.
- The panel above the throne carries the suit rune in gold. The reference has an ornament there that cannot be read at its size.

One consequence: **the three-band seal is no longer part of the room.** It stays on the summons and as the scene-change device. The first board's idea that the room's window and the seal are the same object does not survive the move to the reference's architecture.

The phone version is drawn again at a closer distance so that the pier and its two bays fill the width, as in the supplied upright image.

### Where it falls short

It is a shaded elevation. The structure has no carved detail, the fins have no thickness, and the glass is one flat plane. The floor reflection is an approximation. Doom on the throne is a separate layer and a small stand-in.

## 5. Workstream D: the canonical mask

### Measurements

Taken from `inspiration/doom-mask.png` on a grid of tenths of the mask's width. Units are hundredths of the width; x is measured from the centre line, y from the crown.

| Feature | Measurement |
|---|---|
| Proportion | 100 wide, 150 tall. Widest at y 75, exactly half way down. |
| Outline | Half-widths: 23 at y 7.5, 34 at y 15, 44 at y 30, 47.5 at y 45, 49 at y 60, 49.6 at y 75, 48 at y 90. A step in of about 2 units at y 96 where the jaw plates begin. Then 42.5 at y 120, 37 at y 135, and a flat chin about 24 wide. |
| Crown | A hasp 10 wide on the centre line, carrying the horned mark. A linked edging from temple to temple with a tab at each end. |
| Brow | Two plates, each spanning x 2 to 40 and y 35 to 74. Inner edges sweep down in a concave curve and stop 4 units apart at y 61. A lid plate riveted over the lower third, 10 rivets each side. A V of 5 rivets each side on the forehead. |
| Eyes | Each about 27 wide and 16 tall. Top edge falls 7 units towards the nose; bottom edge level. Inner corners 15 apart. |
| Nose | A wedge 5.6 wide at y 74 widening to 21 at y 97, with a flat ridge about 4 wide. Ends at y 103. |
| Cheeks | A plate under each eye with 12 rivets along its upper edge. A crease from the flank of the nose (x 10, y 88) to the jaw (x 27, y 102). |
| Mouth | A slot 33 wide at y 115.6 with ends splayed to 41 at y 122, crossed by a bar with a centre block. A lip bar under it whose ends turn down, repeated by the line of the chin plate. |
| Jaw and chin | Side plates with a double strap line, 7 rivets inboard, 11 along the edge. A rounded boss 29 wide on the chin. |
| Surface | Dark forged steel, satin, scratched. |

In total the master has 90 rivets.

### One master, three levels

The outlines are held as points in `board-4-v2-source/maskgeo.py`. Only the right half is written down; the left is its mirror. Every level is generated from that file.

| Level | What it is | Keeps | Drops or adds | Use |
|---|---|---|---|---|
| 1, icon | One filled shape with cut-outs | Outline with the jaw step, eye openings, mouth, the two cheek creases | Drops plates, rivets, nose and chin. Eye openings use the frame line, 1.7 units larger, so they hold at 16 px. | Navigation, status, list markers. 16 to 32 px. |
| 2, insignia | Line drawing in one colour | Everything in level 1 | Adds brow and lid plates, nose and ridge, lip and chin lines, jaw straps, all rivets as dots. Below 80 px the rivets are left out and lines are 1.7 times heavier. | Seals, the summons, panels. |
| 3, full fidelity | Rendered relief | Everything in level 2 | Adds height, the wrap of the face, a worked-steel surface, grime in the recesses, cast shadows. | Hero scenes and large artwork, over 200 px, dark grounds. |

Four features are in every level and are what make it this mask: the outline with its step at the jaw, the falling top edge of the eyes, the splayed mouth, and the two cheek creases.

The linked edging on the crown becomes a dotted line at level 2. That is the same device as the dotted border on the steel plates, which ties the mask to the existing ornament.

### Where the master departs from the reference

- The crown edging is drawn with 13 links a side. The reference count could not be read exactly.
- The mouth grille is reduced to a bar, a centre block and two posts.
- The base of the nose is rounder than the reference, which has a crisper lower edge.
- The reference is lit from the upper left, so parts of the right edge are inferred by mirroring.

### The suit rune

The two rune views show the same mark raised on an armour plate. Both are small, at an angle and partly in shadow, so the master is a reading.

Read with confidence, because both views agree:

- A hexagon with a doubled outline, standing on a point.
- Three lines through the centre joining opposite corners, and a fourth joining the middles of the two upright sides.
- A square on its corner at the centre, about half the radius across each way.
- Brackets outside the hexagon: two strokes that leave at 45 degrees and turn back towards each other without meeting.

Uncertain:

- **The fourth bracket.** View 2 shows brackets at the left, right and bottom, and the plate edge leaves no room for one at the top. View 1, which is turned about 45 degrees, appears to show four. The master draws the fourth dashed. Levels 1 and 2 include it.
- **Small strokes near the centre.** View 2 has what may be a second, smaller square. It is left out.
- **Where the mark sits on the suit.** Neither view shows enough armour to tell. The figure carries it on the forearm plate; that is our choice.
- **What it means.** Unknown. It is used as a mark and never as a letter. It is unrelated to the Doomscript decoder.

Levels: level 1 is the hexagon, centre square and brackets with the inner lattice left out; level 2 is the full lattice in line; level 3 is the bars raised on a chamfered steel plate.

### The library, by source

The board keeps three groups apart.

1. **Drawn from the supplied character references.** Mask levels 1 to 3, suit rune levels 1 to 3, the cuirass tile, the two clasps, the horned mark. These follow designs owned by the studio and are redrawn for a private invitation.
2. **Doomscript, as read by fans.** The rune line, the rune ring, single runes. Traced from the fan-made decoder. Marvel has published no key and no letter value is confirmed.
3. **Made for this project.** The three-band seal, the seal mark, the nested square, the dotted line and rule, the corner bolt.

The horned mark is traced from `doom-logo.png` and also appears, very small, on the hasp of the mask reference. Where the image comes from could not be checked. It is shown in the library and held back from use.

Retired from version one: the six-sided mask sketch, the seat icon and the plain clasp icon.

## 6. What was deliberately preserved

Unchanged, and rebuilt on the new board from the same drawing code as before:

- Doomscript: the 22 traced runes, the decoder sheet, the inscription table with its standing column, the rules for use.
- The three-band seal and its dormant, waking and locked states.
- The steel summons: chamfered plate, brushed surface, dotted gold border, four engraved phrases, corner bolts, the wording, the layout on wide screens and phones.
- Typography: Bodoni Moda, Spectral, IBM Plex Sans.
- The emerald and antique-gold language and all fourteen interface colours.
- Controls and panels with their states.
- The two lines of the opening, the rune signature under them and the two actions.

One change inside a preserved piece: the mask above the seal on the wide summons is now the canonical mask at level 2. The six-sided sketch it replaces was not accurate.

Four scene colours are added for artwork only and are never used for text or controls: Glass `#E2D874`, Amber `#EE9A2E`, Fog `#A9B192`, Emerald fire `#3FE07F`.

## 7. Quality check

The new board was opened in headless Chrome and each frame was inspected at 1600 by 900 and at a simulated 390 by 844.

| Check | Result |
|---|---|
| The hero is no longer empty | Doom fills the centre and upper two thirds; rubble frames every edge; the message sits at the foot. |
| Doom is recognisable | Yes: hood, mask, clasps, chain and tiled cuirass read at both sizes. |
| The hall against the reference | Pier and slit, both bays, pillars with amber strips, fins, nine lit steps, the floor circle and the lamps are all present. Carved detail and depth are missing. |
| The three mask levels are one family | Yes. They are generated from one set of points and shown side by side with the reference. |
| Doomscript and summons intact | Yes. Same glyph data and the same plate drawing code. |
| Reduced motion | The sketch jumps to the final frame with a 0.2 s fade. |
| Phone frames | Simulated in a desktop browser. Not checked on a device. |

## 8. What is still a placeholder

- **The figure.** A procedural render. Final artwork should replace it.
- **The hall.** A shaded elevation. Final artwork should replace it.
- **The rubble.** Soft dark shapes that work only because they are out of focus.
- **The seated figure.** A small stand-in.
- **Motion.** A CSS sketch. Parallax, masked text and the skip control are described, not built.
- **Sound.** Described on the first board only.

Finished enough to carry forward as they are: the mask master with its level 1 and level 2 vector files; the suit rune master and its vector levels, subject to the fourth bracket; the composition and timing of the reveal; the plan and colour of the hall.

On realism: the brief asks that cinematic realism is not claimed for vector artwork. These scenes are now raster renders with modelled light, which is closer than version one, and they are still not realistic. The board says so in section K.

## 9. Closeness to Marvel's designs

By request, the mask, costume and hall now follow the film's designs more closely than version one. The artwork is original drawing made from the references; no reference image is traced into a layer or copied into the assets. The reference images appear on the board only in labelled comparisons and are loaded from your reference folder.

This suits a private invitation among friends. Anything public would need a second look first.

## 10. Files

Created:

- `design/explorations/direction-4-the-iron-throne-v2.html` — the refined board
- `design/VISUAL_REFINEMENT.md` — this document
- `design/explorations/assets/v2/` — rendered layers and vector files:
  - `mask-master.svg`, `mask-level-1.svg`, `mask-level-2.svg`, `mask-level-3.png`
  - `suit-rune-master.svg`, `suit-rune-level-1.svg`, `suit-rune-level-2.svg`, `suit-rune-level-3.png`
  - `horned-mark.svg`
  - `hero-d-*` and `hero-p-*` — the reveal layers for desktop and phone, with `hero-*-layout.json`
  - `hall-d-plate.jpg`, `hall-p-plate.jpg`, `hall-d-doom.webp`, `hall-p-doom.webp`
  - `study-*.jpg`, `mat-*.jpg` — crops shown on the board
- `design/explorations/assets/board-4-v2-source/` — the generator (Python with Pillow, NumPy and SciPy, all already installed)
- `design/explorations/previews/direction-4-v2-*.png`

Updated:

- `design/explorations/index.html` — links to the refined board; the original Direction IV entry is kept below it
- `design/explorations/assets/README.txt` — describes the new folders

Not touched: the three original boards, the original fourth board and its source, `shared/board.css`, the research documents, `CREATIVE_DIRECTION_V2.md`, and the reference library.

To rebuild, from `design/explorations/assets/board-4-v2-source/`:

```
python icons.py            # vector levels
python mask_render.py      # mask level 3
python hero.py both        # reveal layers, about two and a half minutes
python hall.py both        # hall plates
python extras.py crops     # suit rune level 3 and the crops
python build2.py           # the board
```

## 11. Decisions needed

1. **The reveal.** Approve the four beats, their timing and the layout, or say what to change.
2. **Ash and moving rubble.** Agree that the opening may break the first board's rule against drifting particles.
3. **The seal leaves the hall.** Agree that the rose window goes, and that the seal stays on the summons and the scene change.
4. **The fourth bracket of the suit rune.** Keep it for symmetry, or leave it out because only one view shows it.
5. **The horned mark.** May it be used, and do you know where the image comes from?
6. **Final artwork.** Commission or generate a painted figure and hall over these layers, or accept this render style as the finished look.

Still open from the first board: the form of address ("Mr." needs a per-guest title), and the wording of the second line.
