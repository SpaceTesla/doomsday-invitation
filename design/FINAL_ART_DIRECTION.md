# The Iron Throne: final art direction

Board: `design/explorations/direction-4-the-iron-throne-v3.html`

This pass does two things. It corrects Doctor Doom's proportions and his raised hand against the character references, and it compares typefaces and recommends one set. Everything else on the refined board is carried over unchanged.

Nothing here is application code. The final design system has not been started. Both wait for your approval.

## How the two briefs were reconciled

The two briefs for this pass disagree in two places. This is what was done, and why.

| Point | First brief | Second brief (marked mandatory) | What was done |
|---|---|---|---|
| Where the new board goes | Update `direction-4-the-iron-throne-v2.html` and preserve the previous version | Preserve the existing board and create a new revision | The new revision is a new file, `direction-4-the-iron-throne-v3.html`. The v2 board and everything in `assets/v2/` are untouched, so the two can be opened side by side. |
| Typography | Explore fonts, build specimens, recommend a combination | The existing typography direction and approved decisions must not be redesigned | The exploration and recommendation are on the board as a comparison. The approved frames (hero, summons, controls) still use the approved faces. The recommended set is shown applied in two extra frames so you can decide. |

If you would rather the new board replaced the v2 file, or the recommended faces were applied throughout, either is a small change.

## 1. Character refinement

### Sources

- `references/character/doom-1.png` to `doom-4.jpg`: head, hood, shoulders, clasps, cuirass, forearm.
- `references/inspiration/doom-lifting-hand-mirrored.jpg`: hand, wrist, cuff and forearm. This is a collectable figure in the comic costume, with the arm raised on the opposite side from ours and the hand seen from the back.

All measurements are in mask widths. They were read from gridded enlargements of the references and are accurate to about a twentieth of a mask width.

### Head, hood and mask

| Measure | References | Before (v2) | After (v3) |
|---|---|---|---|
| Hood across, at eye level | 1.85 to 1.9 | 2.16 | 1.87 |
| Hood above the top of the mask | 0.31 to 0.54 | 0.74 | 0.42 |
| Cloth beside the mask, each side | about 0.4 | 0.52 | 0.39 |
| Mask as a share of the hood's width | 53 to 54 percent | 46 percent | 53 percent |
| Chin to the centre of the clasps | 0.48 to 0.88 | 1.12 | 0.78 |
| Clasps apart, centre to centre | 1.8 to 2.06 | 2.64 | 2.0 |
| Shoulders across | 4.0 to 4.5 | 5.0 | 4.2 |

What changed:

- The crown of the hood came down by nearly half and its point is rounder.
- The sides of the hood are thinner beside the face and widen below the cheek, so the cloth falls onto the shoulders. Before, it pinched in at a neck.
- The clasps and chain moved up to the foot of the hood and closer together. The cuirass starts higher to meet them.
- The shoulders are narrower and slope from the neck.
- The whole figure is drawn about 7 percent larger. The slimmer hood and shoulders leave it the same space in the frame, so the mask gains the difference.

The references do not fully agree: the hood in doom-3 has a taller peak (0.54) than in doom-2 and doom-4 (0.31 to 0.38). The figure sits between them.

### Hand and arm

| Measure | Reference and anatomy | Before (v2) | After (v3) |
|---|---|---|---|
| Middle finger as a share of the hand's length | about 43 percent | 57 percent | 42 percent |
| Palm across, with the base of the thumb | 0.7 to 0.9 | 0.75 | 0.88 |
| Palm, wrist to knuckles | 0.8 to 1.0 | 0.78 | 1.0 |
| Finger thickness | 0.17 to 0.19 | 0.135 to 0.19 | 0.17 to 0.205 |
| Wrist across | 0.55 | none drawn | 0.56 |
| Cuff | A bell, 0.55 at the wrist to about 1.1 at its rim | A short taper towards the hand | A bell 0.62 long, 0.62 to 0.88, with two bands and a riveted rim |
| Hand against forearm | In line | 9 degrees apart and set to one side | 3 degrees apart, on one axis |

What changed:

- **Fingers.** Three joints each. Each segment tapers, each knuckle is slightly fuller, and each finger turns a little in towards the middle of the hand. Lengths follow a hand: middle longest, ring and index close, little finger a quarter shorter. The fingers meet at their bases.
- **Palm.** Wider and longer, fuller at the base of the thumb and along its outer edge, hollow in the middle, with its two main creases.
- **Thumb.** Starts low on the palm and has two joints.
- **Wrist and cuff.** A wrist narrower than the palm, two bands, then a cuff that flares away from the hand and overlaps the forearm plate, as on the reference.
- **Arm.** The forearm rises from an elbow under the shoulder. The cloak lies over the upper arm and hangs behind the forearm. Forearm, cuff and wrist are shaded as round forms.

What was kept:

- **The gesture.** An open palm towards the guest, fingers up, thumb out, on the same side as before. The reference shows a clawed hand from the back on the opposite arm; its orientation was not copied and nothing was mirrored.
- **The position.** The hand, the clasps and the message sit where they did in the frame, to within a few pixels, so the rubble still opens on the hand first.

### What was not touched

- The mask: the same measured master at the same detail, only shown larger.
- Lighting and materials: the same lamps, wool, steel and shadow under the hood. The one adjustment is that the gauntlet shows slightly more of its form, because it now has form to show.
- The fog, haze, ash, lens discs and four pieces of rubble: these are the v2 files, loaded from `assets/v2/`.
- The hall, the suit rune, Doomscript, the seal, the summons, the palette.

### Where it still falls short

- It is a procedural render. The cloth has few folds and no visible weave.
- The palm side of a gauntlet is mostly leather, so the finger plates of the reference do not show from this view. The hand reads as a gloved, armoured hand without showing plate detail.
- A painted or modelled figure would still be better. These layers fix its size, position, proportions and light.

## 2. Typography

### The two models

- **The Doom lettering**, from `references/inspiration/doom-logo-text.png`: a narrow lowercase blackletter with a diamond set in each o.
- **The Doomsday line.** No file of the Avengers: Doomsday logo is in the reference library. The one sample available was the date line at the foot of `doom-1.png`: wide, evenly spaced geometric capitals. The technical faces were judged against that.

### What was tested

Seventeen faces are set on the board in the five test lines. Five more were rendered and set aside. Licence, weights and axes were read from each family's entry in the Google Fonts source repository.

| Face | Direction | Licence | Available | Verdict |
|---|---|---|---|---|
| Grenze Gotisch | B, display | OFL | Variable 100 to 900 | Recommended for display |
| Texturina | B | OFL | Variable 100 to 900, optical size, italics | Runner-up |
| Pirata One | B | OFL | 400 only | Capital V reads as U |
| UnifrakturCook | B | OFL | 700 only, no extended Latin | Rejected: capitals unreadable |
| Almendra Display | B | OFL | 400 only | Rejected: open-face strokes break up |
| Cinzel | B and C | OFL | Variable 400 to 900, capitals only | No gothic character, no lowercase |
| Bodoni Moda | C, serif | OFL | Variable 400 to 900, optical size, italics | Keep: approved |
| Cormorant Garamond | C | OFL | Variable 300 to 700, italics | Runner-up; softer and lighter |
| EB Garamond | C | OFL | Variable 400 to 800, italics | Sound, plain |
| Marcellus | C | OFL | 400 only, no italic | Too limited |
| Spectral | C, body | OFL | 200 to 800, italics | Keep: approved |
| Orbitron | A, technical | OFL | Variable 400 to 900, no extended Latin | Capital labels only; unusual 7 and 0 |
| Michroma | A | OFL | 400 only | Runner-up for labels; wide |
| Oxanium | A | OFL | Variable 200 to 800 | Recommended for technical text |
| Syncopate | A | Apache 2.0 | 400 and 700, no lowercase | Headline only |
| Rajdhani | A | OFL | 300 to 700 | Generic |
| IBM Plex Sans | A | OFL | Variable 100 to 700, italics | Approved; replaced only if you agree |

Set aside after rendering: UnifrakturMaguntia, Jacquard 24, New Rocker, Metamorphous, Chakra Petch.

The finding that decides most of it: blackletter capitals were never meant to be set together. Every true blackletter tested fails on "THE IRON THRONE" in capitals and passes in mixed case. The display face is therefore used in mixed case only.

### Three combinations

| | Display | Supporting serif | Technical | Body | Verdict |
|---|---|---|---|---|---|
| One: Crown and machine | Grenze Gotisch 500 | Bodoni Moda 500, italic 400 | Oxanium 600 and 500 | Spectral | Recommended |
| Two: Doomsday | Pirata One 400 | Cinzel 500 | Orbitron 600 | Cormorant Garamond 500 | Not recommended |
| Three: Chancery | Texturina 600 | Cormorant Garamond 600 | Michroma 400 | EB Garamond | Workable |
| As approved | Bodoni Moda 500 | Bodoni Moda 500, italic 400 | IBM Plex Sans | Spectral | Current |

- **Two** is the closest to both logos and has four faults: "Victor" reads as "Uictor", Cinzel has no lowercase so "Mr. Anish." becomes small capitals, Orbitron's numerals make dates and seat counts harder to read, and Cormorant is thin for body text on a dark ground.
- **Three** is readable throughout and loses most of the character of both logos. Michroma has one weight and runs wide on phone buttons.

### Recommendation: combination one

- It adds the two things asked for, a Doom-inspired display face and a technical face, and removes nothing approved. Guest names stay in Bodoni Moda and the summons stays in Spectral.
- Grenze Gotisch is the one gothic face tested that stays readable. It has the faceted o and broken strokes of the Doom lettering on letterforms a guest reads at once.
- Oxanium gives the technical note without turning the page into a science-fiction interface. It is squared like Orbitron, but compact, with ordinary numerals and a usable lowercase.
- By area the page is still almost all serif, so it stays regal.

Where each face goes:

| Face | Use | Rules |
|---|---|---|
| Grenze Gotisch 500 (600 below 28 px) | "The Iron Throne", "Council of Doom", Doom's own name where he issues something | Mixed case only. 22 px and up. Never a guest's name. |
| Bodoni Moda 500, italic 400 | Guest names; the lines Doom speaks | As approved. |
| Oxanium 600, capitals, spaced about 0.11 em | Buttons, labels, council status | Oxanium 500 in mixed case for small interface text. |
| Spectral 400, 500, 600, italic 400 | The summons and everything read at length | As approved. |

What it would change if adopted:

- IBM Plex Sans is replaced by Oxanium on controls and labels.
- "Victor von Doom" on the summons moves from Bodoni Moda to Grenze Gotisch. This is the one visible change to an approved frame.
- Orbitron is not used. Its numerals and its width cost more than its character gives.

### Licence and files

| Family | Licence | Weights needed | To host |
|---|---|---|---|
| Grenze Gotisch | SIL Open Font License 1.1 | 500, 600 | One variable file |
| Bodoni Moda | SIL Open Font License 1.1 | 500 and italic 400 | Two variable files (upright, italic) |
| Oxanium | SIL Open Font License 1.1 | 500, 600 | One variable file |
| Spectral | SIL Open Font License 1.1 | 400, 500, 600 and italic 400 | Four static files |

All four are free and may be served from our own site. The board loads them from Google Fonts for convenience; the build should host them itself. File sizes were not measured.

One caution carried from the first board: "Mr." needs a per-guest title, and a guest's name with an accented letter must be checked in Bodoni Moda, which has extended Latin.

## 3. What was preserved

Unchanged from the refined board, and marked as such on the new one: the reveal and its storyboard, the throne hall, the canonical mask and its three levels, the suit rune, the icon library, Doomscript, the seal, the steel summons with its dotted borders, the emerald and antique-gold palette, the materials and lighting, and the composition of every frame.

## 4. Checks

The new board was opened in headless Chrome.

| Check | Result |
|---|---|
| Hero at 1600 by 900 | Renders. The message clears the clasps and chain as before. |
| Hero at a simulated 390 by 844 | Renders. Hand, hood and mask all fit above the message. |
| Storyboard with the new figure | The closed frame still shows the hand first, and the half-open frame still hides the head. |
| Type specimens | All seventeen families load and render. |
| The two proposed-type frames | Render. Grenze Gotisch and Oxanium appear only there and in the comparison cards. |
| The v2 board and `assets/v2/` | File dates unchanged. |

The playable reveal was also run in a real Chrome session on the new board: it ends on the open, lit frame with the message shown, and the page reported no errors.

Not checked: a real phone.

## 5. Files

Created:

- `design/explorations/direction-4-the-iron-throne-v3.html`
- `design/FINAL_ART_DIRECTION.md`
- `design/explorations/assets/v3/`: the two figure layers for desktop and phone, their layout files, and the before, after and study crops
- `design/explorations/assets/board-4-v3-source/`: the generator for this revision
- `design/explorations/previews/direction-4-v3-*.png`

Updated:

- `design/explorations/index.html`: links to the new board above the refined board
- `design/explorations/assets/README.txt`

Not touched: the v2 board and its assets and source, the first Direction IV board, the three original boards, the research documents, the earlier design documents, and the reference library.

## 6. Decisions needed

1. **The figure.** Approve the corrected proportions and hand, or say what still looks wrong.
2. **The typefaces.** Adopt combination one, choose another, or keep the approved set.
3. **Doom's name on the summons.** If combination one is adopted, should "Victor von Doom" move to Grenze Gotisch, or stay in Bodoni Moda with the gothic face kept for titles only?
4. **Which file is the board of record.** The new revision is `-v3.html`. Say if it should replace `-v2.html` instead.

Still open from earlier passes: the form of address, the wording of the second line, the suit rune's fourth bracket, the horned mark, and whether final artwork is commissioned.

## Addendum: final character pass (revision 4)

Board: `design/explorations/direction-4-the-iron-throne-v4.html`. The revision 3 board above is kept unchanged for comparison.

This pass changed the two figure layers of the opening and nothing else. Typography, mask geometry, runes, hall, summons, reveal, light and palette are as they were. "Before" below is revision 3.

### Hood, cowl and cloak

Guided by `references/character/doom-2.png` and `doom-4.jpg`, which show one thin layer of cloth close to the head, dark mail under the chin, and a soft fold between the clasps.

| Measure, in mask widths | References | Before | After |
|---|---|---|---|
| Hood across, at eye level | 1.85 to 1.9, including its far side in shadow | 1.87 | 1.70 |
| Hood above the top of the mask | 0.31 to 0.54 | 0.42 | 0.38 |
| Cloth beside the mask, each side | about 0.3 on the lit side | 0.39 | 0.28 |
| Mask as a share of the hood's width | 53 to 54 percent | 53 percent | 58 percent |
| Opening below the chin | Open to the mail collar | Closed 0.16 below | Open for 0.42 |
| Green cloth under the chin | One soft fold, about 0.35 | 0.74, unbroken | 0.34, below 0.39 of mail |
| Folds in the cloak | Gathered at the clasps, falling from the shoulders | 7 | 17, with hollows between ridges |

- The hood is modelled as one layer of cloth over a head, with a narrow turned hem. Before, it was a rolled tube round the face. This is a change of construction and distribution; the overall height barely moved.
- The opening now runs below the chin and shows a mail collar in shadow. The whole jaw of the mask stands clear against it.
- The cowl is a shallow swag hung between the clasps, about half its former depth.
- The cloak gathers at each clasp and falls from each shoulder in ridges and hollows.
- At 1.70 the hood is a little narrower than the references' 1.85 to 1.9. That was deliberate, to meet the request for a more prominent mask; it can be widened again.

### Raised hand

Guided by `references/inspiration/doom-reveal-3.png` for position and gesture.

| Measure | Reference | Before | After |
|---|---|---|---|
| Gap between hand and shoulder | about one hand's width | 0.80 mask widths | about 0.4 |
| Palm, turned away from the viewer | Side-on | 0 degrees | 42 degrees, towards the body |
| Forearm, from upright | about 40 degrees | 11 degrees | 30 degrees |
| Elbow | Inside the cloak | 0.84 widths outside the shoulder | Under the shoulder, covered by the cloak |
| Wrist | Bent | 3 degrees | 15 degrees |
| Bend at knuckle, middle and end joints | Increasing from index to little finger | None | Index 9, 16, 10; middle 14, 22, 12; ring 19, 27, 14; little 24, 32, 16 degrees |
| Thumb | Forward of the palm, turned towards the fingers | Straight out, in the plane of the palm | In front of the palm, tip turning in |

- The arm was re-posed as a whole: the upper arm hangs under the cloak, the forearm rises up and out, and the cloak lies over its lower third with a hem curving round it.
- The fingers now overlap, each standing a little in front of the one behind it.
- The reference hand is more strongly cupped and lower than ours. Ours keeps the approved raised gesture and takes the reference's closeness, turn and curl.

### Side effects

- The hand sits about 90 pixels nearer the centre of the desktop frame. In the storyboard it is still the first thing seen through the gap, and the head is still hidden in the second beat.
- Less of the forearm shows, so the plate carrying the suit rune is slightly smaller. The rune is the same drawing.

### Checks

Desktop (1600 by 900) and simulated phone (390 by 844) hero frames, the four before-and-after comparisons and the storyboard were inspected in headless Chrome. Both pages validate with no missing files. The playable reveal was not re-run in a live browser for this revision; its code is unchanged from revision 3, where it was. Not checked on a real phone.

### Still short

It remains a procedural render. The cloth is smoother than wool, and the hand reads as a gloved, armoured hand without individual finger plates.

