# The Iron Throne: design specification

**Doom Proposes, Council Approves.**

This is the visual and interaction specification for the Doctor Doom / Latveria invitation. It consolidates the approved creative work so that an engineer or coding agent can build the experience without reading the research history. What the product does is in [`PRODUCT_SPEC.md`](../docs/PRODUCT_SPEC.md); the words it uses are in [`COPY.md`](../docs/COPY.md); this document says how it looks, moves and sounds.

Nothing here has been implemented. No application code exists in the project.

## How to read this document

Every statement carries one of these standings. Where none is given, the item is **Approved**.

| Standing | Meaning |
|---|---|
| **Approved** | Shown on the approved concept board, or stated by you in a brief. Build it as written. |
| **Carried over** | Approved on an earlier Iron Throne board and never revisited. Still in force. |
| **Decided** | A recommendation you accepted on 15 November 2026. Build it as written. Logged in section 11.1. |
| **Planned** | Described on the approved board but never built or seen in motion. Build it, and expect to tune it. |
| **Derived** | No approved mock exists. Specified here from approved components so the build has a starting point. Needs a visual pass and your approval. |
| **Open** | Still needs your input. Listed in section 11.2. |

### Source of truth

| Rank | Source | Use |
|---|---|---|
| 1 | `design/explorations/direction-4-the-iron-throne-v4.html` | The latest Iron Throne board. Final for the figure, the opening, the hall, the mask, the suit rune, the summons, Doomscript, materials. |
| 2 | `design/FINAL_ART_DIRECTION.md` | Character measurements and the typography comparison. |
| 3 | `design/VISUAL_REFINEMENT.md` | The reveal, the hall, the mask master, the suit rune. |
| 4 | `design/explorations/direction-4-the-iron-throne.html` and `design/CREATIVE_DIRECTION_V2.md` | Controls, panels, palette, Doomscript rules, the summons wording, scene transitions, sound. Its opening, hall and figure are superseded. |
| 5 | `research/` | Background only. |
| 1, for type and the council | `design/explorations/direction-4-the-iron-throne-v5.html` | The typography review board, approved. Final for type sizes, weights and hierarchy, the body treatment, long-name handling, and the layout of the council. Its council wording marked as placeholder is provisional. Its artwork is revision 4's. |

Revision 4 is the approved board (**Decided**). The earlier Iron Throne boards stay in the project for the record.

Two boards share rank 1. Revision 4 is final for artwork, composition and approved wording; its frames still show earlier typefaces. Revision 5 is final for typography and for the council layout, and shows the type in place on revision 4's artwork. Where they differ on type, revision 5 governs. Both are kept as they are.

Superseded material is listed in section 12.

---

## 1. Creative identity

### 1.1 Name and tagline

- **Name:** The Iron Throne.
- **Tagline:** Doom Proposes, Council Approves.
- **Where the name appears (Approved):** in the opening experience only, in Pirata One. It is not added to the summons or to the council screens for branding. Exactly where in the opening it sits has not been drawn (section 11.3).

### 1.2 Core concept

A guest opens a personal link and is collected by Doctor Doom. He names them, tells them why he has come, and issues a royal summons to the Council of Doom. The council is where a group of friends plan a trip to see *Avengers: Doomsday*: Doom proposes a date, a time and a venue, the council approves or suggests another, and Doom decides.

The fiction is played straight. The guest is a recruit, the invitation is a state document, and the planning screens are a council chamber.

### 1.3 Latverian atmosphere

- **Concealment.** Latveria looks medieval and hides its machinery until it moves. Mechanisms are still until used.
- **Restraint.** About half of every scene stays near black. Colour arrives as light.
- **A real place.** The hall follows one supplied reference of the film's throne room. It is not a generic fantasy palace.

### 1.4 Doom's personality and presence

- He is a sovereign, a scientist and a sorcerer, and every screen should feel issued by him.
- He is still. The camera, the light and the rubble move; he does not.
- He speaks rarely, briefly and with authority. In formal text he refers to himself in the third person ("Doom has weighed the defenders of this world").
- He is seen in two places only: the opening, and seated in the hall.

### 1.5 Science, sorcery, sovereignty

Each has one colour and one job. This mapping is the backbone of the palette and must hold everywhere.

| Idea | Colour | Where it appears |
|---|---|---|
| Sovereignty | Antique gold | Doom's name, the outer band of the seal, dotted borders, bolts, window light |
| Science | Steel and silver | Plates, the measured scale on the seal, guest names, all reading text |
| Sorcery | Emerald | Runes and mechanisms that are active. Never a general accent |

The three-band seal (section 4.3) is this idea as one object.

### 1.6 Intended emotional experience

1. **Unease, then recognition.** Darkness, a hand, a body, then the mask.
2. **Being singled out.** The guest's own name is the largest thing on screen.
3. **Ceremony.** The summons reads as a real decree.
4. **Belonging.** The council shows who else was chosen.
5. **Dry amusement.** The humour comes from how seriously Doom takes a cinema trip. Nothing winks.

---

## 2. Visual language

### 2.1 Colour

#### Interface colours (Carried over; contrast computed on Plate)

| Token | Hex | Job | Contrast on Plate |
|---|---|---|---|
| Night | `#0A0D12` | The guest's world, before the hall | |
| Olive black | `#10130C` | Inside the hall | |
| Plate | `#1A2020` | Every issued object: summons, panels, buttons | |
| Gunmetal | `#252C2C` | Raised steel | |
| Dark steel | `#5A6462` | Rules and borders | |
| Steel | `#96A19E` | Secondary text | 6.2:1 |
| Silver | `#D9DEDC` | Text | 12.1:1 (14.3:1 on Night) |
| Emerald deep | `#0E5A40` | Cloth, unlit glass | |
| Emerald | `#1F8F63` | Lines of an active mechanism | 4.1:1, lines only |
| Emerald light | `#4FC395` | Lit runes, active marks | 7.5:1 |
| Bronze | `#7D5F2C` | Gold in shadow | |
| Antique gold | `#C6A75E` | Doom's name, dots, bolts | 7.2:1 |
| Gold light | `#E4CB8C` | Window light, large gold type | 10.4:1 |
| Signal | `#E0806F` | Errors only | 5.9:1 |

#### Scene colours (Approved; artwork only, never text or controls)

| Token | Hex | Where |
|---|---|---|
| Glass | `#E2D874` | The hall's windows |
| Amber | `#EE9A2E` | The hall's ornament strips and the slit behind the throne |
| Fog | `#A9B192` | The light of the opening |
| Emerald fire | `#3FE07F` | The floor circle in the hall |

#### Rules

- No pure black and no pure white in any text pair.
- Emerald (`#1F8F63`) fails contrast for text. Use it for lines; use Emerald light for anything read.
- Gold is never a surface that carries text.
- State is never shown by red against green alone. Pair colour with a word or a shape.
- Signal is for errors and nothing else.

### 2.2 Typography

Four families, chosen by you on 15 November 2026: the combination the board's typography section calls "Two: Doomsday". You chose it for its personality, knowing its four drawbacks, and asked that they be handled by usage, sizing and hierarchy. The rules below do that. They are part of the decision and are not optional.

| Role | Face | Weight | Use |
|---|---|---|---|
| Display | Pirata One | 400 (its only weight) | Titles and headings in Doom's voice: "Council of Doom", "Doom proposes", "The council is seated.", and "The Iron Throne" in the opening only |
| Supporting serif | Cinzel | 500 | Guest names, Doom's name, character names, figures, and any single word in a heading that the display face cannot set |
| Technical | Orbitron | 600 | Buttons, quiet controls, labels and status words, in capitals |
| Body | Cormorant Garamond | 500; italic 500; 700 for emphasis | The summons, the line Doom speaks, and everything read at length |
| Inscription | Doomscript (section 4.1) | one weight | Inscriptions only |

No other typeface, and no monospace.

#### Pirata One: the display face

Drawback: its capital V reads as a U and its lowercase v as an o, so "Victor von Doom" reads as "Uictor oon Doom" and "Latveria" as "Latoeria".

- **Never set a word containing the letter V, in either case.** The rule applies to the individual word. A heading that contains such a word stays a Pirata One heading, with its size, colour and place in the hierarchy unchanged; only the affected word is set in Cinzel 500, at the pairing of 26 px beside 34 px. The heading is not switched to Cinzel as a whole. Headings are written to avoid the letter, so this is a guard and should never be seen.
- **"Victor von Doom" is always set in Cinzel.**
- Mixed case only. Never all capitals.
- 24 px and larger.
- Never a guest's name, a character's name, or anything a guest typed.
- Check every new display string by eye before it ships. The letters k, w, x and z are also unusual in this face. These strings were checked and read correctly: "The Iron Throne", "Council of Doom", "Doom proposes", "Doom decrees", "Doctor Doom", "The council is seated.", "The plan is decreed".
- Use it for a few headings per screen at most. It is a blackletter, a style the research advised using sparingly because of its association with Nazi-era printing, and the first board had ruled blackletter out. Keeping it to short titles is the limit.

#### Cinzel: the supporting serif

Drawback: it has no lowercase. Lowercase letters are drawn as small capitals, so "Mr. Anish." appears as a capital M and A with the rest in small capitals.

- Names are stored exactly as typed and displayed in this capital-and-small-capital form. The typed capitals still show as the larger letters.
- Never use it for running text or for a full sentence.
- Letter-spacing 0.02 em at display sizes, 0.04 em at 18 px and below.
- It is about a quarter wider than the face it replaces, so long names are handled by rule (**Approved**):
  - A name wraps at spaces and hyphens first, onto as many lines as it needs. Three lines are accepted in the opening.
  - It steps down to 80% of its size only when a single word is still too wide. It never goes smaller.
  - On the summons, when a name takes two lines: on the wide plate the name is set at 85% and the body at 2.0%; on the phone the name is set at 27 px.
  - If the summons still does not fit one screen, the page scrolls. Readability takes priority over avoiding scrolling.
- It has accented letters, so names such as José Nuñez display correctly.
- **All figures are set in Cinzel**: counts such as "3 of 7", and any date or time shown in numerals. Its figures are plain and all one height.

#### Orbitron: the technical face

Drawbacks: its 7 and 0 are unusual shapes, its lowercase is hard to read small, and it has no accented letters.

- **Capitals only**, letter-spacing 0.1 em.
- **Never set a numeral in Orbitron.** A figure inside a label is set in Cinzel.
- **Never set a name in Orbitron**, of a guest or of a character.
- Short labels: four words at most.
- 11 px is the floor, and 13 px or more wherever space allows.
- It appears on controls, labels and status words only. It never sets a heading or a sentence, so the experience stays regal.

#### Cormorant Garamond: the body face

Drawback: it is light and small on the line, and thin on a dark ground at small sizes.

- Weight 500 for all reading text. Never lighter.
- **17 px is the floor for anything read**, and 18 px or more wherever space allows. This is about 15% larger than the face it replaces.
- Line-height 1.4.
- Text colour Silver on Plate or Night. Do not set body text in Steel below 19 px.
- **Upright and italic (Approved).** Upright 500 for the body of the summons and for all ordinary explanatory text. Italic 500 for Doom's formal and dramatic lines: the opening's second line, the summons' titling line, "greeting.", sanction and dating clause, the hall caption line, and Doom's proposal.
- Emphasis is weight 700, used once: the summons' sanction line, in italic.
- Its figures are old-style, with parts that drop below the line. That suits a sentence. Counts and anything shown as a number use Cinzel.

#### What this changes on approved frames

Every piece of text changes face. Nothing changes position, colour or wording.

- Guest names appear in capitals and small capitals.
- "Victor von Doom" on the summons is in Cinzel, in Gold light.
- The line Doom speaks, and the whole summons, are in Cormorant Garamond.
- Button and control labels are in Orbitron capitals.
- Dates stay written in words, which keeps numerals out of the summons and the proposal.

Name fonts by role in the build (display, serif, technical, body), so a later change is a change of four values.

#### Licence and hosting

All four families are free under the SIL Open Font License 1.1 and may be served from our own site. The boards load them from Google Fonts for convenience. The build hosts the files itself.

| Family | Available | Needed | Notes |
|---|---|---|---|
| Pirata One | One weight, 400 | 400 | Has accented letters. Measured in the research at 8.9 KB |
| Cinzel | Variable, 400 to 900. Capitals and small capitals only | 500 | Has accented letters. Measured at 25.9 KB |
| Orbitron | Variable, 400 to 900 | 600 | No accented letters |
| Cormorant Garamond | Variable, 300 to 700, with italics | 500, 700, italic 500 | Has accented letters. Measured at 37.6 KB |

The sizes are the research's measurements of the Latin files and were not re-measured. Subset each family to Latin.

#### Scale

Sizes on the boards are set as a share of the frame's width. The table gives that share and the pixel size at a 1440 px desktop frame and a 390 px phone frame.

| Element | Face | Desktop | Phone |
|---|---|---|---|
| Opening: guest name | Cinzel 500, tracking 0.02em, line-height 1.08 | 4.2% (60 px) | 11.4% (44 px) |
| Opening: second line | Cormorant Garamond italic 500, line-height 1.3, colour `#C9CFCD` | 2.05% (30 px) | 5.6% (22 px) |
| Opening: rune signature | Doomscript, colour `#6F9C8B` | 0.8% tall (12 px) | 2.3% tall (9 px) |
| Opening: primary action | Orbitron 600, capitals, tracking 0.1em | 1.0% (14 px) | 3.6% (14 px) |
| Opening: quiet control | Orbitron 600, capitals, tracking 0.08em, 0.82 of the button | 12 px | 11.5 px |
| Summons: Doom's name | Cinzel 500, tracking 0.03em, Gold light | 3.9% of sheet | 7.0% (27 px) |
| Summons: titling line and "greeting." | Cormorant Garamond italic 500, Steel | 2.15% | 4.4% (17 px) |
| Summons: guest name | Cinzel 500, Silver, 1 px Emerald rule beneath | 4.6% | 8.8% (34 px) |
| Summons: body | Cormorant Garamond 500, upright, line-height 1.4 (1.32 on phone) | 2.12% | 4.5% (18 px) |
| Summons: sanction line | Cormorant Garamond italic 700 | as body | as body |
| Summons: dating clause | Cormorant Garamond italic 500, Steel | 19 px on the 1200-wide plate | in the body, as body |
| Summons: action | Orbitron 600, capitals | 1.55% of sheet | 3.6% (14 px) |
| Hall caption heading (phone) | Pirata One 400 | | 9.4% (37 px) |
| Hall caption line (phone) | Cormorant Garamond italic 500 | | 5.0% (20 px) |
| Council title | Pirata One 400, Gold light | 52 px | 40 px |
| Panel and screen headings | Pirata One 400, Gold light. A single word containing a V is set in Cinzel 500 at 26 px beside 34 px; the rest of the heading is unchanged | 34 px | 30 px |
| Doom's proposal | Cormorant Garamond italic 500 | 22 px | 20 px |
| Explanatory text | Cormorant Garamond 500 | 19 px | 18 px |
| Well and counts | Cormorant Garamond 500 in Steel; figures in Cinzel 500, Silver | 18 px | 18 px |
| Character names | Cinzel 500, tracking 0.03em | 22 px | 22 px |
| Holder and proposer names | Cinzel 500, tracking 0.04em | 15 px | 15 px |
| Labels and status words | Orbitron 600, capitals | 11.5 px | 11.5 px |

**Standing of these sizes: Approved** on 15 November 2026, as drawn on the typography review board, `design/explorations/direction-4-the-iron-throne-v5.html`, and listed in its section D.

Approved with them:

- **Phone summons spacing.** Line-height 1.32 and the tighter paragraph spacing of the board's proposed fit, for every guest. It makes room for the decline control.
- **Small Cinzel.** 15 px is allowed for holder and proposer names only.
- **No readable body text below 17 px**, ever, to make a screen fit. The summons scrolls instead.
- **Tap areas.** Orbitron quiet controls are 11.5 px; each gets a tap area at least 44 px high.
- **Two lines of capitals.** On the summons the guest's name stays at least 1.25 times the size of Doom's.

What the board established: with a short name the phone summons fits one screen; with a long name and the decline control it is about one line over, and scrolls.

The summons sheet is a 4:3 plate; its percentages are of the plate's width.

Rules:

- Guest names are always in Latin letters. They are never written in runes (section 4.1).
- Body text lines stay under about 80 characters.
- Floors: 17 px for anything read (Cormorant Garamond), 24 px for Pirata One, 11 px for an Orbitron label. Do not go below them to make a layout fit; reflow instead.
- The opening's first line is the guest's title and name, or the name alone when no title is set (`PRODUCT_SPEC.md`, Stage 1). Test it with long names; the boards used a five-letter placeholder.

### 2.3 Spacing and layout

- **Full-bleed scenes, centred text.** The opening and the hall fill the viewport. Text sits in the lowest third, centred, over a dark scrim. Nothing sits in a left-hand column.
- **Plates for everything issued.** The summons, panels and buttons are steel plates. Content sits inside the plate's inner dotted line.
- **One primary action per screen**, with at most one quiet alternative beside or under it.
- **Scrims.** Opening: a vertical gradient over the lower 50% of the frame (48% on phone), from clear to `rgba(4,7,6,0.96)`. Hall on phone: lower 22%, to `rgba(4,7,6,0.88)`.
- **Text block position.** Opening: bottom edge 5% from the foot of the frame on desktop, 4.6% on phone; side padding 6% and 8%.

Spacing inside plates (from the summons, as shares of a 1200 by 900 plate):

| Measure | Value |
|---|---|
| Plate margin from the frame | 36 px (3%) |
| Corner chamfer | 30 px |
| Dotted line, inset from plate edge | 20 px |
| Rune band, height | 20 px, starting 33 px in |
| Inner rule, inset | 66 px |
| Corner bolts, radius | 10 px |

### 2.4 Borders and ornament

| Device | Specification |
|---|---|
| Dotted line | Antique gold round dots: stroke 2.4, dash `0 8.5`, round caps, 85% opacity. On buttons and panels it is a 1 px dotted CSS border at 50 to 55% opacity |
| Inner rule | 1 px, Dark steel |
| Rune band | Engraved Doomscript between the dotted line and the rule. Runs along an edge and turns the corner at a bolt |
| Corner bolt | A gold disc with an inner ring and a small square on its corner |
| Chamfer | Plates have cut corners. Buttons and panels have a 2 px radius and no chamfer |
| Bevel | A 1.6 px edge highlight on plates, light above and dark below |

The mask's rivets, the dotted borders and the ticks on the seal are the same device at three sizes. Keep them visually related.

### 2.5 Materials

| Material | Where | Reference crop |
|---|---|---|
| Brushed steel | Plates, panels, buttons. Vertical gradient `#283030` to `#1A2020` to `#101515`, fine horizontal grain, a faint diagonal sheen | drawn in code on the board |
| Engraving | Runes cut into steel: fill `#060808` with a thin light line on the lower edge | drawn in code on the board |
| Antique gold | Bolts, dots, fine lines. Gradient `#8A6C30` to `#D9BD78` to `#8F7034` | drawn in code on the board |
| Forged steel | The mask. Dark, satin, scratched, grime at the foot of each plate | `design/explorations/assets/v2/mat-steel.jpg` |
| Green wool | Hood and cloak only. Green shows only where light strikes it | `design/explorations/assets/v4/mat-wool.jpg` |
| Tiled cuirass | Dark bronze-green metal, read by its edges | `design/explorations/assets/v3/mat-cuirass.jpg` |
| Leaded glass | Pale yellow-green, streaked, behind heavy dark leading | `design/explorations/assets/v2/mat-glass.jpg` |
| Amber strip | The only warm orange in the hall | `design/explorations/assets/v2/mat-amber.jpg` |
| Dais stone and gilt edge | Warm dark stone, a line of gold on each step | `design/explorations/assets/v2/mat-steps.jpg` |
| Polished floor | A dark mirror with emerald inlay | `design/explorations/assets/v2/mat-floor.jpg` |

The crops are samples for reference. They are not tiles to be used as textures.

### 2.6 Lighting and atmosphere

| Scene | Light |
|---|---|
| The opening | One lamp behind Doom and to the left: fog lit from behind, brightest behind the raised hand. It draws a thin line along edges that face it. A much weaker light from below and in front gives the mask its form. The far side of him stays dark |
| The hall | The glass is the source. Structure in front of it is silhouette picked out by spill. Shafts fall from high on the right. Three colours of light: yellow-green from glass, amber from the strips, emerald from the floor |
| Emerald | Comes only from Doom's own marks: the floor circle and the rune on his forearm. It never lights a whole scene |
| Plates | Even studio light from above |

Atmosphere in the opening: low haze in front of the figure, sparse streaks of ash falling down and to the left, large soft discs low in the frame, and a vignette.

---

## 3. Character and artwork

### 3.1 Standing of the artwork

The figure, the hall and the rubble are **concept renders**. They are original drawings made in code from the reference images, raised into relief and lit by calculation. They fix proportion, pose, layering, position and light. They are short of film quality: the cloth is smoother than wool, the hand shows no individual finger plates, and the hall has no carved detail.

**Decided, 15 November 2026:** these renders are the approved artwork for the first version. No painted or modelled replacement is needed at this stage. Custom artwork may be revisited later as an enhancement, and does not block the build. Any future replacement must keep the size, position, layering and light given here.

### 3.2 Canonical references

Reference images are studio-owned and for reference only. They must not be shipped (section 10).

| File | Used for |
|---|---|
| `references/character/doom-1.png` | Shoulders and cloak; the date line used to judge technical typefaces |
| `references/character/doom-2.png` | Hood, mail at the neck, cowl, clasps, chain, cuirass tiles |
| `references/character/doom-3.png` | Whole silhouette, belt, greaves |
| `references/character/doom-4.jpg` | Hood against mask, vambrace, cuff, mail |
| `references/inspiration/doom-mask.png` | The mask master |
| `references/inspiration/doom-lifting-hand-mirrored.jpg` | Hand, wrist, cuff and forearm construction. Mirrored, and seen from the back |
| `references/inspiration/doom-reveal-1.png` to `doom-reveal-3.png` | The opening sequence, and the position and gesture of the hand |
| `references/inspiration/rune-view-1.png`, `rune-view-2.png` | The suit rune |

### 3.3 The figure

All measurements are in mask widths (the mask is 1.0 wide and 1.5 tall).

| Part | Specification |
|---|---|
| Hood | One thin layer of cloth over the head with a narrow turned hem. 1.70 across at eye level. Its crown stands 0.38 above the mask. 0.28 of cloth shows each side of the mask |
| Mask in the hood | 58% of the hood's width. The hood overhangs the brow and shades the upper third of the mask |
| Neck | The hood opens for 0.42 below the chin onto dark mail in shadow. The whole jaw of the mask stands clear against it |
| Cowl | A shallow fold of cloth hung between the clasps, about 0.34 deep |
| Clasps and chain | Two steel discs 2.0 apart, centred 0.78 below the chin, joined by a chain. A rayed disc on his right, a squared knot on his left. No red stone |
| Shoulders | 4.2 across, sloping from the neck |
| Cloak | Gathers at each clasp and falls from each shoulder in ridges and hollows |
| Cuirass | Rows of square tiles: a raised frame, an inner square, a diamond |
| Mail | At the neck only |
| Belt, greaves, boots | Out of frame in the opening. Indicated on the seated figure only |

### 3.4 The mask

One measured master is the source for every mask in the project. It lives as points in `design/explorations/assets/board-4-v4-source/maskgeo.py`, with the right half written down and the left mirrored. **Its geometry is final. Do not redraw it.**

Measurements, in hundredths of the mask's width (x from the centre line, y from the crown):

| Feature | Measurement |
|---|---|
| Proportion | 100 wide, 150 tall. Widest at y 75 |
| Outline | Half-widths 23 at y 7.5, 34 at 15, 44 at 30, 47.5 at 45, 49 at 60, 49.6 at 75, 48 at 90. A step in of about 2 at y 96 where the jaw plates begin. Then 42.5 at y 120, 37 at 135, and a flat chin about 24 wide |
| Crown | A hasp 10 wide on the centre line. A linked edging from temple to temple with a tab at each end |
| Brow | Two plates, each x 2 to 40 and y 35 to 74. Inner edges sweep down and stop 4 apart at y 61. A lid plate riveted over the lower third, 10 rivets a side. A V of 5 rivets a side on the forehead |
| Eyes | About 27 wide and 16 tall. The top edge falls 7 towards the nose; the bottom edge is level. Inner corners 15 apart |
| Nose | A wedge 5.6 wide at y 74 widening to 21 at y 97, with a flat ridge about 4 wide. Ends at y 103 |
| Cheeks | A plate under each eye, 12 rivets on its upper edge. A crease from the flank of the nose to the jaw |
| Mouth | A slot 33 wide with splayed ends, crossed by a bar with a centre block. A lip bar beneath with ends that turn down |
| Jaw and chin | Side plates with a double strap line, 7 rivets inboard, 11 along the edge. A rounded boss 29 wide on the chin |

The master has 90 rivets.

Three levels of detail, all generated from the master:

| Level | File | What it is | Use |
|---|---|---|---|
| Master | `design/explorations/assets/v2/mask-master.svg` | Construction sheet with landmark levels | Reference |
| 1, icon | `design/explorations/assets/v2/mask-level-1.svg` | One filled shape: outline, eye openings, mouth, two cheek creases | Navigation, status, list markers. 16 to 32 px |
| 2, insignia | `design/explorations/assets/v2/mask-level-2.svg` | Line drawing, rivets as dots | Seals, the summons, panels. Below 80 px leave out the rivets and make lines 1.7 times heavier |
| 3, full fidelity | `design/explorations/assets/v2/mask-level-3.png` (980 by 1430) | Rendered relief in dark worked steel | Hero scenes and large artwork. Over 200 px, dark grounds only |

Four features must survive at every level: the outline with its step at the jaw, the falling top edge of the eyes, the splayed mouth, and the two cheek creases.

Known departures from the reference: the crown edging is drawn with 13 links a side (the count could not be read exactly), the mouth grille is simplified, and the base of the nose is rounder.

### 3.5 The raised hand

The gesture is a raised, relaxed hand held beside the shoulder, turned side-on. It is the first thing the guest sees.

| Measure | Value |
|---|---|
| Palm | Turned 42 degrees away from the viewer, towards the body |
| Gap between hand and shoulder | About 0.4 mask widths |
| Forearm | 30 degrees from upright, rising up and out from an elbow under the shoulder |
| Wrist | Bent 15 degrees. 0.54 across |
| Cloak | Lies over the lower third of the forearm, with a hem curving round it |
| Fingers | Three joints each, bent at every joint, increasingly from index to little finger: index 9, 16, 10 degrees; middle 14, 22, 12; ring 19, 27, 14; little 24, 32, 16 |
| Thumb | In front of the palm, its tip turning in towards the fingers |
| Proportions | Hand about 1.55 long; palm 0.88 across before foreshortening; fingers 0.17 to 0.2 thick |
| Gauntlet | A narrow wrist, two bands, then a cuff that flares away from the hand (0.62 long, 0.62 to 0.88 across) with a riveted rim. Dark steel |

### 3.6 The suit rune on the figure

The suit rune (section 4.4) sits on a small plate on the forearm and lights emerald during the opening. Its placement on the forearm is our choice; the references do not show where it sits on the suit.

### 3.7 Position and composition

| | Desktop art, 1920 by 1080 | Phone art, 780 by 1688 |
|---|---|---|
| Mask width | 208 px (10.8% of frame width) | 190 px (24.4%) |
| Mask centre line | x 1010 (52.6%) | x 452 (57.9%) |
| Crown of the mask | y 137 (12.7%) | y 287 (17.0%) |
| Centre of the palm | x 401, y 530 | x 176, y 418 |
| Figure occupies | Centre and upper two thirds | Upper 60% |

The phone figure is a separate render, not a crop: the hand is raised beside the head so that both fit an upright frame.

### 3.8 The seated figure

In the hall Doom sits small on the throne, leaning forward with his forearms on his thighs. This layer is a stand-in with little detail (`design/explorations/assets/v2/hall-d-doom.webp`, `hall-p-doom.webp`) and is listed for future production in section 9.

---

## 4. Iconography and Doomscript

### 4.1 Doomscript

**Standing of the source.** Every rune is traced from `references/inspiration/doomscript-decoder.png`. That decoder is a fan's reading. Marvel has published no key, and no letter value is confirmed. "Doomscript" is the decoder's name for the script, not Marvel's.

**Files (final):**

- `design/explorations/assets/doomscript-glyphs.svg`: the 22 runes as a sheet.
- `design/explorations/assets/doomscript-glyphs.json`: the same outlines as path data. Each glyph has a reading, an advance width and a path; the height is 100 units; fill rule is even-odd.

**Mappings.** One rune per letter. Twenty runes are read and two are not.

| Rune key | Reads as | Rune key | Reads as |
|---|---|---|---|
| `a` | A, and soft O | `l` | L |
| `c` | Soft C | `m` | M |
| `k` | Hard C, K, Q | `n` | N |
| `d` | D | `o` | O, OU |
| `e` | E | `p` | P |
| `i` | I, EE | `r` | R |
| `f` | F | `s` | S |
| `v` | V, FF | `t` | T |
| `g` | G | `u` | U |
| `h` | H | `x1`, `x2` | Unread. Used nowhere |
| `j` | J | | |

There is **no rune for B, W, X, Y or Z**.

**Inscriptions in use.**

| Inscription | Reads | Standing | Used on |
|---|---|---|---|
| `there is no promise of tomorro` | There is no promise of tomorro[w] | Read by fans on the lapel of a jacket worn at Comic-Con. The missing W is the script's own | Floor circle in the hall; top edge of the summons plate |
| `to the viktor go the spoils` | To the victor go the spoils | Read by fans on the cuffs of the same jacket | Inner band of the seal; bottom edge of the plate |
| `justice`, `revenge` | Justice, Revenge | Read by fans on the pockets of the same jacket | Left and right edges of the plate |
| `viktor von doom`, `latveria` | Victor von Doom, Latveria | Ours. Spelled letter for letter; hard C takes the K rune | Outer band of the seal; signature under the opening line; caption under the seal on the summons |

**Rules.**

1. **Inscription only.** Runes never carry anything the guest must read. Wherever a rune inscription appears, it is decoration and is hidden from assistive technology.
2. **Fixed phrases only.** Use the inscriptions in the table. Guest names are never written in runes: many names need letters the script lacks.
3. **Never invent a rune.** Text containing B, W, X, Y or Z must be refused by the build, as the board generator does.
4. **Light means active.** A rune is plain engraving until a mechanism turns it on, and it lights emerald only then.
5. **No other symbol sets.** No Norse runes, alchemical signs or circuit traces.
6. **The word divider is ours.** The dot between words on rings is our addition.

**Still guesses:** whether one rune per letter is right (fans describe the script as partly phonetic), and whether the script has word dividers.

### 4.2 Three sources, kept apart

| Group | Items | Standing |
|---|---|---|
| Drawn from the supplied character references | Mask levels 1 to 3, suit rune levels 1 to 3, cuirass tile, the two clasps, the horned mark | Follow studio-owned designs. Redrawn for a private invitation |
| Community interpretation | Doomscript: rune lines, rune rings, single runes | Traced from a fan-made decoder. Unconfirmed |
| Original to this project | The three-band seal, the seal mark, the nested square, the dotted line and rule, the corner bolt | Ours |

### 4.3 The three-band seal (original)

File: `design/explorations/assets/iron-throne-seal.svg`. Drawn in a 420-unit box.

| Band | Colour | Carries | Meaning |
|---|---|---|---|
| Outer | Gold | `viktor von doom . latveria .` in runes | Sovereignty |
| Middle | Steel | A scale of 120 ticks with 12 long ticks, and four dots | Science |
| Inner | Emerald | `to the viktor go the spoils .` in runes | Sorcery |
| Centre | Emerald | Four nested squares, alternately on their corners | From the cuirass tile |

States: **dormant** (bands out of register, emerald greyed), **waking** (bands turning, runes part lit), **active** (bands aligned, runes lit, a soft glow).

The **seal mark** is the seal reduced to an icon: a ring, a dotted ring, and the nested square. It is the icon on every primary button.

The seal belongs to the summons and to the change between scenes. It is no longer part of the hall's architecture.

### 4.4 The suit rune (from references)

A mark raised on the armour in two supplied views. Both are small and angled, so this is a reading.

- A hexagon with a doubled outline, standing on a point.
- Three lines through the centre joining opposite corners, and a fourth joining the middles of the two upright sides.
- A square on its corner at the centre, half the radius across each way.
- Brackets outside the hexagon at the left, right and bottom: two strokes that leave at 45 degrees and turn back towards each other.

A fourth bracket at the top appears in one view only. The master draws it dashed; levels 1 and 2 include it. It is kept (**Decided**): you declared the rune work final as drawn.

| Level | File | Use |
|---|---|---|
| Master | `design/explorations/assets/v2/suit-rune-master.svg` | Reference |
| 1, icon | `design/explorations/assets/v2/suit-rune-level-1.svg` | Hexagon, centre square and brackets. The roster; a seat taken |
| 2, insignia | `design/explorations/assets/v2/suit-rune-level-2.svg` | The full lattice. Throne panel, floor lattice, vambrace |
| 3, relief | `design/explorations/assets/v2/suit-rune-level-3.png` (640 by 640) | Raised bars on a chamfered steel plate |

Its meaning is unknown. It is a mark and never a letter, and it is unrelated to Doomscript.

### 4.5 Latverian heraldic motifs

| Motif | Standing | Use |
|---|---|---|
| The mask | From references | The principal mark. Doom as presence (level 1) and as issuer (level 2) |
| The three-band seal | Original | The state seal |
| The nested square | Original, taken from the cuirass tile | Centre of the seal; the seal mark |
| Cuirass tile | From references | An item, a seat |
| Rayed clasp, knot clasp | From references | Ornament; fastenings |
| The horned mark | From references. Traced from `references/inspiration/doom-logo.png` into `design/explorations/assets/v2/horned-mark.svg` | **Not used in the first version** (Decided). Where the source image comes from could not be checked |

The eagle arms and wax seal of an earlier direction were discarded and must not return.

### 4.6 Icon rules

- Straight strokes and one circle. The mask is the only form with curves, which keeps it the most important mark.
- Two weights: a heavy outline and a light inner line.
- Colour by role: gold when Doom issues something, emerald when something is active, steel otherwise.
- Icons shown in use on the board: mask level 1 for the council, suit rune level 1 for the roster, the seal mark for the summons and for primary actions.

---

## 5. Environment

### 5.1 The throne hall

Rebuilt on the plan of `references/environment/doom-throme-wide.png`, with `references/environment/doom-throme.jpg` for the upright version and `references/environment/doom-castle.webp` for the lamps.

Files: `design/explorations/assets/v2/hall-d-plate.jpg` (1920 by 1080, throne empty), `hall-p-plate.jpg` (780 by 1688), and the seated figure as a separate layer over each.

| Element | Specification |
|---|---|
| Axis | One axis of symmetry. Throne, pier and slit are on it |
| Pier | A tall dark mass behind the throne running out of the top of the frame, with a narrow slit of amber light down its centre |
| Panel above the throne | Gold, carrying the suit rune (ours) |
| Windows | A bay each side of the pier. Leading that bends and parts like stems, tied by short level bars. Glass pale yellow at mid height, greener and dirtier towards the floor |
| Pillars | Beside each bay, with a narrow amber ornament strip and pale blue-green glass at its foot |
| Fins | Beyond the pillars, dark slanted masses that widen as they climb, with more glass behind |
| Dais | Nine shallow steps, canted at the sides, a line of gold along the middle of each edge |
| Throne | A broad block with long low arms |
| Floor | Dark and polished, mirroring the wall. A large inlaid circle that burns green along parts of its length. It carries `there is no promise of tomorro` in runes, and the suit rune's hexagon and square as its lattice (both ours) |
| Lamps | Pale bowls on dark posts at the side walls |
| Light | Sun high on the right, in shafts |

The Gothic lancets, clustered columns and rose window of the first Iron Throne board are superseded.

### 5.2 The opening environment

The guest is under rubble, looking up. Behind Doom is cold fog lit from behind, graded towards the gold-green of the hall's glass so the two scenes belong together. In front of the lens are four pieces of dark rubble, close and out of focus: a slab above, a mass each side, a mound below.

Layer files are listed in section 9.

### 5.3 Indoors and outdoors

| Place | Base colour | Character |
|---|---|---|
| The opening: outside, the guest's own world | Night `#0A0D12`, fog light | Cold, broken, exposed |
| The hall: inside, Doom's world | Olive black `#10130C`, light through glass | Warm, ordered, ceremonial |
| Issued objects: the summons, panels | Plate `#1A2020` | Neither place. An object on a dark ground |

There is no exterior of the castle in the approved work, and none should be added. The link between outside and inside is the change of scene itself (section 6.6).

### 5.4 Limits of the environment artwork

The hall is a shaded elevation. It has no carved detail, the fins have no thickness, and the floor reflection is approximate. See section 9 for its production status.

---

## 6. Motion and sound

### 6.1 Principles

- **Doom does not move.** Rubble, light, ash and camera move around him.
- **Machines turn and lock. Light switches on and off.** No bounce, no elastic easing, nothing that floats.
- **Ash drifts in the opening.** This is the one place particles are allowed. It replaced an earlier rule against any drifting particles.
- **One orchestrated moment per scene.** No entrance animation on every element.
- **Text never moves.** Lines are revealed in place.

### 6.2 The cinematic opening (Approved; timings from the playable sketch on the board)

Layers, back to front. In file names here, `*` stands for `d` (desktop) or `p` (phone); the full paths are in section 9.2.

| # | Layer | Behaviour |
|---|---|---|
| 1 | Fog (`hero-*-sky.jpg`) | Scales from 104.5% to 100% over 7 s, origin 50% 40%, easing `cubic-bezier(.2,.6,.2,1)` |
| 2 | Glow behind the hand | A radial gradient, `rgba(250,244,210,0.5)` at centre, screen-blended. Opacity 0.3 to 0.55 over 3 s. Width 44% of frame (96% on phone), centred on the palm |
| 3 | Figure, silhouette (`hero-*-figure-dark.webp`) | Scales with the fog |
| 4 | Figure, lit (`hero-*-figure-lit.webp`) | Opacity 0 to 1 over 1.7 s, ease-in-out |
| 5 | Low haze (`hero-*-haze.webp`) | Static |
| 6 | Ash (`hero-dust.webp`, tiled) | Screen-blended at 36%. Tile width 53.33% of frame (131.3% on phone). Loops down and left over 16 s, linear |
| 7 | Lens discs (`hero-*-bokeh.webp`) | Static, 70% opacity |
| 8 to 11 | Rubble: right, left, bottom, top (`hero-*-rock-*.webp`) | Each slides between three positions. 2.8 s (3.2 s for the top slab), easing `cubic-bezier(.3,.05,.16,1)` |
| 12 | Vignette | Static |
| 13 | Scrim and text | Section 6.4 |

Rubble positions are in `design/explorations/assets/v4/hero-d-layout.json` and `hero-p-layout.json`: each piece has its box in frame pixels and an offset and rotation for the closed, parting and open states. The top slab turns by up to 1.5 degrees (1 degree on phone).

Timeline:

| Time | Beat | What happens |
|---|---|---|
| 0 s | 1. Concealment | Rubble closed. One gap of fog light with fingers in it. Ash drifts |
| 1.4 s | 2. Revelation | Rubble moves to parting. Shoulders and hand against the light. The head stays behind the slab. The rune on the forearm lights |
| 4.2 s | 3. Recognition | Rubble moves to open. The slab clears the hood |
| 6.0 s | | The lit figure fades in over the silhouette: hood edge, near half of the mask, clasps, chain |
| 7.6 s | 4. The summons | Scrim and text begin |

No 3D, no physics, no animated filter. Movement is translation with a small scale; light is a cross-fade.

Described on the board and not yet built or tested (**Planned**):

- One GSAP timeline with five labels (dark, lift, clear, lit, summons) in place of the sketch's CSS transitions and timers. **Built in milestone 4** (`web/src/scenes/OpeningMotion.tsx`), with the approved timings and curves.
- Pointer parallax: rubble about 12 px, figure about 4 px, fog none. Off on touch screens. **Built in milestone 4**, on screens with a fine pointer only.

Not built: the rune on the forearm lighting at 1.4 s. The approved figure has no separate layer for it, and drawing one would mean changing the approved artwork.

### 6.3 Doom's appearance

He is revealed, never animated: hand, then body, then head, then costume out of silhouette. The lit pass keeps one side of him dark. Do not light the cloak evenly and do not show every detail at once.

### 6.4 Text entrance

| Time after the summons beat | Element |
|---|---|
| 0 s | Scrim fades in over 1.2 s. "Mr. [Name]." appears |
| 0.9 s | "Doctor Doom is here to collect you." |
| 1.3 s | The rune signature |
| 1.8 s | Both actions, together |

Each appears in place. The sketch uses a 0.7 s fade. The intended treatment (**Planned**) is a clip that opens left to right in about 0.6 s per line.

The two actions must exist in the page from the start for assistive technology, whatever the visual timing.

### 6.5 Buttons and interaction feedback

| State | Appearance |
|---|---|
| Rest | Steel plate; seal icon in Steel |
| Hover or keyboard focus | Border turns Antique gold; seal icon turns Emerald light. Focus also shows a 2 px Gold light outline, 3 px off the edge |
| Pressed | Border Emerald; the plate fills with emerald from the left |
| Unavailable | Text `#6C7674`, border `#333B3A`, no shadow. A taken character's name is the exception: see the note below the table |

A taken character's name is set in `#7F8A88` (the holder's colour), not `#6C7674`. On the plate `#6C7674` measures 4.0:1, below the 4.5:1 that WCAG AA requires for text, and the product specification's accessibility requirement governs; `#7F8A88` measures 5.3:1 and the plate still reads as unavailable through its border, its lost shadow and its "Taken" tag. Changed in milestone 6 (16 November 2026), after the axe pass; overrule if the darker grey matters more than the contrast.

The board draws the pressed state as a partial fill ("Held: the plate fills"). A button acts on an ordinary press, and the fill is feedback only (**Decided**). No action requires holding.

Feedback is immediate. Do not delay an action to finish an animation.

### 6.6 Doomscript and mechanism animation (Carried over; storyboarded as stills only)

| Beat | What happens | Timing |
|---|---|---|
| Doomscript wakes | The seal's three bands turn to register, each at its own speed, with no bounce. Once they lock, the runes go from engraved to lit in reading order | Bands 0.7 to 1.1 s; runes 60 to 90 ms each |
| The summons is revealed | The plate parts on a centre seam like a vault door, light in the gap, and closes as one plate bearing the guest's name | 1.2 s open, 0.8 s close |
| Between stages | The centre of the seal opens like an iris onto the next scene. Going back runs it in reverse. Every change of scene uses this one transition | 0.9 s |

These three have never been built or seen in motion. Treat the timings as starting values.

### 6.7 Ambient movement

- **Opening:** the ash loop only.
- **Hall:** none in the first version (**Decided**). The hall is a still image.
- No flicker anywhere.
- **The ash stops.** It fades to stillness after the text has appeared: begin about three seconds after the two actions are on screen, and fade over about one second (**Decided**; the two durations are starting values). As sketched on the board it runs for as long as the opening is on screen, and accessibility guidance (WCAG 2.2.2) asks that movement which starts by itself and lasts more than five seconds can be stopped. A motion control for the guest is a could-have (`PRODUCT_SPEC.md`, section 4.3).

### 6.8 Sound (Carried over; proposals written for the first board's opening)

**Built in milestone 5 (16 November 2026), awaiting the owner's approval by ear.** The sounds are synthesised from noise and sine waves by `web/scripts/make-sounds.py`: no recordings and no sample libraries, so there is no licence to track. Encoded as WebM/Opus with an MP3 fallback, about 350 KB in all, loaded only once the guest has chosen sound. They can be heard one by one on the development specimen page (`/dev/specimen`).

| Sound | Length | Where it plays |
|---|---|---|
| `seal-turn` | 0.9 s | The iris between scenes: bands turning, slowing ratchet clicks, a soft stop |
| `plate-part` | 1.2 s | The summons plate parting: steel sliding on steel, a low draw of air |
| `plate-close` | 0.8 s | The halves meeting: a short slide and a heavy close |
| `detent` | 0.35 s | Each band of the seal locking into register, one after another |
| `rune-tick` | 0.08 s | Each rune lighting, in reading order |
| `hum` | 2.2 s | The low electrical hum rising as the seal wakes |
| `hall-room` | 60 s, looped | The council: a large quiet room, distant wind |

The opening has no sound, by the rule below: it plays before the guest's first action, and "Go with him" is that action.

Below is the description the sounds were made from.

| Moment | Sound |
|---|---|
| The seal and runes | A low electrical hum that rises as runes light. A dry metal tick per rune. A heavier detent as each band locks |
| The plate | Steel parting on a seam |
| The hall | A large quiet room: long reverb, distant wind |

The first board also specified sounds for its own opening (room tone stopping dead, stone on stone for a door). That opening was replaced by the rubble reveal, and **no sound has been specified for the new opening**: the rubble lifting, the ash, the moment of recognition. Designing it is outstanding work (section 11.3).

Limits, all in force:

- Nothing plays before the guest's first action.
- No music bed.
- No voice. Doom's lines appear as type. No actor is imitated.
- Every sound is under two seconds except the hum and the room.

### 6.9 Audio controls and silent mode

- The opening offers two actions: "Go with him" and "Go without sound". The second continues in silence.
- A sound on/off control must stay reachable on every later screen. Its design is **Derived**: a quiet control using a sound icon in Steel. The first board drew one such icon; no placement is approved. **Built in milestone 5** as the quiet control alone, labelled with the current state (COPY.md 2.6), fixed at the top right of every screen after the opening, above the scene and below the iris.
- **Silent mode** means every sound is off and nothing else changes. No animation depends on audio, and no information is given by sound alone.
- The guest's choice should be remembered for the rest of their visit, and sound must never restart by itself.
- Sound fades out when the tab is hidden.
- No sound on hover or on scroll.

### 6.10 Reduced motion

When the guest's device asks for reduced motion:

- **Opening:** the final frame fades in over 0.2 s with the text already in place. No rubble movement, no camera settle, no ash loop, no parallax. The board's sketch already does this.
- **Mechanisms and transitions:** each becomes a 0.2 s cross-fade to its end state.
- **Sound** is unaffected by this setting; it follows the guest's sound choice.

Also required (**Decided**; described on the board, not yet built):

- Any key or tap during the opening skips to the final frame.
- The opening plays once per guest. On later visits the guest lands where they left off (`PRODUCT_SPEC.md`, Stage 1).
- Fog and silhouette load first and are enough for the first two beats; the lit figure can arrive during the second.

### 6.11 Guidance carried from the research

From `research/research_notes/Doom and Latveria visual research/immersive_web_motion_and_sound.md`. The research was desk research: no site was opened in a real browser, so none of this was observed first-hand. It is guidance, and none of it overrides sections 6.1 to 6.10.

Motion:

- Time animation by elapsed time, not by frame count. iPhones in Low Power Mode run at 30 frames a second.
- The opening should advance by tap, in discrete scenes. The council should scroll natively with at most light reveals. Do not take over scrolling, and do not use a smooth-scroll library on phones.
- Pointer effects do not exist on touch screens. Anything that depends on hover must work without it.
- Parallax beyond a barely visible drift across three to five layers was judged likely noise.
- Marks should "move once and then sit still". Avoid looping shimmer, glitch effects, scanlines, cursor trails, magnetic buttons and lens flares.
- Type reveals: line masks, with long durations (about 0.8 to 2 s) for display lines. Body text should appear quickly and hold still.
- GSAP and all its plugins are free to use, including commercially.

Sound:

- Browsers block audio until the guest acts. The opening's primary action is that act, which is why it doubles as the sound choice.
- Keep to a few layers: one low ambience and short, rare one-shots.
- Budget: one ambience loop of 60 to 90 seconds plus the one-shots, "a couple of megabytes at most", fetched after the first screen is usable.
- Format: WebM with an MP3 fallback.
- Sources with the least obligation for a private invitation: CC0 sounds and the Sonniss game-audio bundles. Licence terms of subscription libraries were not verified.
- Any sound that plays by itself for more than three seconds needs a visible way to stop it (WCAG 1.4.2).

Loading:

- Design for the worst case: an older iPhone in Low Power Mode, inside a messaging app's built-in browser, on mobile data, with sound off.
- Preload only what the first scene needs. A long loader loses guests.
- Targets: largest paint within 2.5 s, response to input within 200 ms, layout shift under 0.1.
- Grain and noise should be pre-rendered images, not live filters. The boards draw brushed steel with live SVG filters; the build should bake these.
- The link preview image should be well under 300 KB, or messaging apps may drop it.

---

## 7. Responsive design

Approved compositions exist for two shapes only: a 16:9 desktop frame and a 390 by 844 phone frame. Nothing has been checked on a real device.

### 7.1 Desktop (Approved)

- **Opening:** the 1920 by 1080 layer set. Doom centred, upper two thirds. Text centred in the lowest third.
- **Hall:** the wide plate. The board shows no text over it on desktop.
- **Summons:** a 4:3 plate. Left third: mask level 2, the seal, `latveria` in runes, the dating clause. A vertical dotted line. Right two thirds: the text and the action.

### 7.2 Phone (Approved)

- **Opening:** the 780 by 1688 layer set, a separate composition. Figure in the upper 60%, hand beside the head, text and actions below on the rubble. Actions stack, primary first, within thumb reach.
- **Hall:** the upright plate, drawn closer so the pier and its two bays fill the width. A caption sits at the foot over a scrim ("The council is seated." / "Doom will set the day, the hour and the place before you.").
- **Summons:** the plate upright. The seal sits at the top, the mask is omitted, the dating clause moves into the text, and the side rune bands are omitted. With a short name the whole summons fits without scrolling at 390 by 844. With a rare long name it may scroll; the body is never set below 17 px to prevent that.

### 7.3 Tablet and everything between (Derived)

No composition was drawn. The board gives one rule: between the two layouts, the figure keeps its height and the side rubble slides inwards, so no empty band appears at either side.

Starting point for the build, to be checked by eye:

- Choose the layer set by the shape of the viewport, not its width: the phone set for upright viewports, the desktop set for wide ones. The exact ratio at which to switch is to be set by eye during the build and shown to you with the tablet composition (section 11.3).
- Fill the viewport and crop from the edges, keeping the mask and the hand in view. The anchor points are in section 3.7.
- Text stays centred in the lowest third at every size.
- The summons plate keeps 4:3 until the viewport is too narrow to hold its two columns, then becomes the upright plate.

### 7.4 What must not be done

- Do not scale the desktop opening down to a phone, and do not crop it to an upright frame.
- Do not let text sit over the mask or the hand.
- Do not shrink text below the sizes in section 2.2 to make a layout fit. Reflow instead.

### 7.5 Not covered by any board

Landscape phones, very wide screens beyond 16:9, and very small phones. All need a check during the build.

---

## 8. Components and interaction styling

Approved components are documented from the boards. The council's layout is **approved as the design direction for the first version**, as drawn in section C of `design/explorations/direction-4-the-iron-throne-v5.html`: the title over the hall, the proposal panel with its count and alternatives, and the list of character plates with their three states. That mock is the reference for all further council design. **Its wording is provisional** until the copy review, except the lines carried over from earlier boards ("Doom proposes", the date sentence, the count, "Approve", "Propose another"). Components the mock does not show (the guest list, the alternative entry, confirmation, dialogs) remain **Derived**. What each one does is in `PRODUCT_SPEC.md`.

### 8.1 Primary button (Carried over)

- A small steel plate: vertical gradient `#2A3232` to `#171C1C`, 1 px Dark steel border, 2 px radius, a top inner highlight and a soft drop shadow.
- A 1 px dotted gold line 3 px inside the edge.
- The seal mark at the left, 1.7 em, then the label in Orbitron 600: capitals, letter-spacing 0.1 em. No numerals in a label.
- Padding 0.82 em top and bottom, 1 em left, 1.5 em right.
- States as in section 6.5.
- Labels say what happens: "Go with him", "Take your seat", "Approve".

### 8.2 Quiet control (Carried over)

An underlined label in Orbitron 600, capitals, letter-spacing 0.08 em, at 0.8 of the button's size, Steel, underline at 50% opacity and 0.3 em below the text. Silver on hover. Used for the alternative to a primary action: "Go without sound", "Propose another".

### 8.3 Panel (Carried over)

- A plate: gradient `#232A2A` to `#151A1A`, 1 px border `#3A4341`, 2 px radius.
- A 1 px dotted gold line 6 px inside the edge.
- Padding 26 px top, 28 px sides, 24 px bottom.
- Heading in Pirata One, 34 px, Gold light. A single word containing a V is set in Cinzel 500 at 26 px; the heading itself stays as it is (section 2.2). Text in Cormorant Garamond 500, at the sizes of the scale in section 2.2.
- **Well:** a recessed strip for counts and lists inside a panel. Background `#0C100F`, a black top edge, a `#333C3A` bottom edge, padding 14 px by 16 px, Cormorant Garamond 500 at 18 px in Steel, with figures in Cinzel 500 in Silver.
- Actions in a row at the foot: one primary button, one quiet control.

Do not nest a panel inside a panel. Use a well.

### 8.4 The summons plate (Approved)

The invitation itself. Layout in section 7; measures in section 2.3; wording in `PRODUCT_SPEC.md`, section 2. Its four edges carry the four inscriptions (section 4.1). Its action is "Take your seat".

### 8.5 Guest identity (partly Approved)

- **Approved:** the guest's name is set in Silver as the largest text on the opening and on the summons. On the summons it sits over a 1 px Emerald rule. It is set in Cinzel 500, so it appears in capitals and small capitals.
- **Approved:** names are in Latin letters and are never abbreviated, restyled or written in runes.
- **Derived:** in lists and headers, a guest is shown as name in Cinzel, with a small mark before it. A character's name, once chosen, follows in Cinzel in Steel. Names are never set in Orbitron or Pirata One.
- **Decided:** a guest's title (Mr., Ms., Dr.) precedes the name on the opening and the summons when one is set, in the same face and size as the name. With no title the name stands alone. On the guest list the name appears without its title (**Derived**).

### 8.6 Character selection (Approved layout; wording provisional)

The rules are confirmed (`PRODUCT_SPEC.md`, Stage 3) and the layout is approved as drawn on the review board: a screen heading in Pirata One, a line of explanatory text, then one plate per character in a single column. Each plate carries a mark, the character's name in Cinzel at 22 px, a status tag in Orbitron at the right, and for a taken character the holder's name beneath in Cinzel at 15 px. No character artwork and no roster exist in the project. Constraints:

- Each choice is a plate (section 8.3), not an illustrated card. No character artwork has been approved or sourced, and studio images must not be used.
- A character is shown by name in Cinzel 500, and by name only in the first version (**Decided**). Marks or artwork for characters are a could-have and would need an agreed source.
- The list shows every character on the roster. It can be any length, since the administrator sets it, so it must reflow and scroll natively; it is not a fixed grid.
- **Factions (added 16 November 2026).** The plates are grouped under their factions (`PRODUCT_SPEC.md`, section 3.9), each group headed by its name in Cinzel 500 at the explanatory size (18 px, 19 px wide), Antique gold, tracking 0.04em; Cinzel because the names carry figures. 24 px above a heading, 12 px between it and its plates. The panel's roster uses the same headings.

Three states, each told apart by more than colour:

| State | Appearance | Word shown |
|---|---|---|
| Available | The plate at rest. Hover, focus and pressed as in section 6.5 | none |
| Chosen by this guest | Emerald border, the mark in Emerald light | "Yours" |
| Taken by another guest | The unavailable state of section 6.5: text `#6C7674`, border `#333B3A`, no shadow. It stays in place in the list. It cannot be focused as a choice but is still announced to assistive technology as unavailable | "Taken" in Orbitron capitals, followed by the name of the guest who holds it in Cinzel (**Decided**) |

Behaviour that needs a visible response:

- **Choosing** is immediate. The plate takes the chosen state at once.
- **Changing** moves the chosen state to the new plate, and the old one returns to available.
- **Losing a race.** If another guest took the character a moment earlier, the plate turns to taken and a short message says so, in plain words, with the list still open. Use Signal only if it is treated as an error; a neutral message in Steel is the better fit, since nothing went wrong. Wording is not written.
- **Staleness.** The council does not update while it is open in the first version (**Decided**), so the list can be out of date. A guest learns that a character has gone either on reloading or by losing the race above. Never move the list under the guest.
- **Removed by Doom.** A guest whose character was removed from the roster is returned to this screen with a message saying so. Wording is not written.
- **After the plan is final** a guest's choice can no longer be changed: the list is shown without actions.

The words "Yours" and "Taken" are placeholders and need your approval with the rest of the copy.

- Doom is never offered as a choice.

### 8.7 Status indicators (Derived)

| Status | Mark | Colour | Always with the word |
|---|---|---|---|
| Summoned, no answer yet | Seal, dormant | Steel | "Summoned" |
| Accepted | Suit rune level 1 | Emerald light | "Seated" |
| Declined | Cuirass tile, empty | Steel, dimmed | "Declined" |
| Plan proposed | Seal, waking | Antique gold | "Proposed" |
| Plan final | Seal, active | Emerald light | "Decreed" |

The marks and colours follow section 4.6. The words are placeholders in Doom's register and need your approval with the rest of the copy.

### 8.8 The proposal and the approval count (Approved layout; wording provisional)

The mechanism is confirmed (`PRODUCT_SPEC.md`, Stage 5): Doom proposes a date, a time and a venue; guests may approve it or suggest another date or time; the council shows the approval count; approval is advisory.

The layout is approved as drawn on the review board: heading, the proposal in italic on two lines (date and time, then venue), the count in a well, "Approve" with "Propose another" beside it, a line of explanatory text, the alternatives in a second well under an Orbitron label, and after approving the button in Emerald with a quiet control to withdraw.

It grew from one sample panel on the first board:

> **Doom proposes** / Friday the eighteenth of December, at half past seven. / *3 of 7 seats have approved* / [Approve] Propose another

It was labelled a styling placeholder when it was drawn. Its structure now matches the confirmed mechanism, and it is the visual precedent for this component:

| Part | Specification | Standing |
|---|---|---|
| Panel | The plate of section 8.3 | Carried over |
| Heading | "Doom proposes", Pirata One, 34 px, Gold light | Wording carried over; face decided |
| Date and time | One sentence in Cormorant Garamond 500, 20 px, written out in words | Carried over; face decided |
| Venue | A second line in Cormorant Garamond 500, 20 px, under the date and time. The sample panel has no venue line | Derived |
| Approval count | In a well: the figures in Cinzel 500 in Silver, the rest in Cormorant Garamond in Steel ("**3 of 7** seats have approved"). Counted against seated guests. Guests see the number only | Carried over; the basis of the count is Decided |
| Primary action | "Approve", with the seal mark | Carried over |
| Quiet control | "Propose another", opening the entry for an alternative date or time | Carried over |

States and behaviour (**Derived**):

- **After this guest approves:** the button shows the pressed fill and then rests in Emerald, labelled as done, and the count rises by one. The state is shown by a word as well as by colour. A quiet control beside it withdraws the approval. Wording is not written.
- **When Doom changes the proposal:** all approvals are reset. The panel shows the new date, time and venue and a count of zero, and the guest's own approve button returns to rest. Guests are told the proposal changed. How that notice is shown is not designed.
- **A guest may both approve and suggest an alternative.** Neither control disables the other.
- **The count is advisory.** Nothing in the panel may suggest that a number must be reached. Do not draw a progress bar, a target or a threshold.
- **Approve feedback** is the ordinary pressed state. The research imagined a short "strike" gesture for approvals; none has been designed or approved.
- **When the plan is final:** the heading changes from a proposal to a decree, the actions and the count are removed, and the seal is shown active (section 8.7).

A guest's alternative is entered in a second panel using the same plate. It takes a date and a time only; there is no venue field. The entry controls themselves are **not designed**.

Alternatives are listed for every seated guest in a well beneath the proposal, one row each: the date and time in words, then the name of the guest who suggested it. A guest has one alternative at a time; a new one replaces it.

Dates and times are written in words. Numerals appear in the well and in the entry controls only, and are set in Cinzel.

Because the mechanism may change after the first version (`PRODUCT_SPEC.md`, section 5.9), keep the count, the approve action and the alternative entry as separate parts of the panel, so that one can change without redrawing the others.

### 8.9 Guest list (Derived)

- A panel headed "Council of Doom" in Pirata One, with one row per guest inside a well.
- Everyone summoned is listed, including guests who declined and guests who have not answered, each with their status (**Decided**).
- Each row: status mark, name in Cinzel, character in Cinzel in Steel, status word in Orbitron capitals at the right.
- Rows are separated by the well's own edges. No cards inside the panel.
- The guest's own row is marked with a Gold light rule at its left edge and the word "You".
- Doom heads the list as its sovereign, with the mask at level 1, and is not counted among the seats.

### 8.10 Dialogs (Derived)

- A dialog is a panel centred over a scrim of Night at about 80% opacity.
- It opens and closes with a 0.2 s fade. It does not slide or scale.
- One primary button and one quiet control, as everywhere.
- Declining the summons is confirmed in a dialog, in Doom's register (**Decided**). The decline control itself is a quiet control beside "Take your seat".
- In the administrator panel, removing a character that a guest holds is confirmed in a dialog that names the guest (**Decided**).
- Errors use Signal for the message text and are stated plainly: what went wrong and what to do.

### 8.11 Transitions between screens

The iris of the seal (section 6.6), 0.9 s, reversed when going back, and a 0.2 s cross-fade under reduced motion. Changes within a screen (a panel updating, a row changing status) are immediate, with at most a 0.2 s fade.

---

## 9. Asset inventory

Paths are relative to the project root. All were checked to exist when this document was written.

### 9.1 Final: use as they are

| Asset | Path | Use |
|---|---|---|
| Doomscript glyph sheet | `design/explorations/assets/doomscript-glyphs.svg` | Reference sheet |
| Doomscript glyph data | `design/explorations/assets/doomscript-glyphs.json` | Source for every rune inscription |
| Three-band seal | `design/explorations/assets/iron-throne-seal.svg` | Summons, transitions |
| Mask master | `design/explorations/assets/v2/mask-master.svg` | Reference |
| Mask level 1 | `design/explorations/assets/v2/mask-level-1.svg` | Icons |
| Mask level 2 | `design/explorations/assets/v2/mask-level-2.svg` | Insignia |
| Mask level 3 | `design/explorations/assets/v2/mask-level-3.png` | Large artwork |
| Suit rune master | `design/explorations/assets/v2/suit-rune-master.svg` | Reference |
| Suit rune level 1 | `design/explorations/assets/v2/suit-rune-level-1.svg` | Icons |
| Suit rune level 2 | `design/explorations/assets/v2/suit-rune-level-2.svg` | Insignia |
| Suit rune level 3 | `design/explorations/assets/v2/suit-rune-level-3.png` | Large artwork |

The suit rune files are final, fourth bracket included.

Not yet separate files: the seal mark, the nested square, the corner bolt, the cuirass tile, the two clasps, and the seal's dormant and waking states. They are drawn inline on the board by `design/explorations/assets/board-4-v4-source/art.py` and `scenes4.py` and need exporting for the build.

### 9.2 Concept renders: approved for the first version

These are the approved artwork for the first version. If custom artwork is commissioned later, they are its brief.

Opening, desktop (1920 by 1080):

| Layer | Path |
|---|---|
| Fog | `design/explorations/assets/v2/hero-d-sky.jpg` |
| Figure, silhouette | `design/explorations/assets/v4/hero-d-figure-dark.webp` |
| Figure, lit | `design/explorations/assets/v4/hero-d-figure-lit.webp` |
| Haze | `design/explorations/assets/v2/hero-d-haze.webp` |
| Lens discs | `design/explorations/assets/v2/hero-d-bokeh.webp` |
| Rubble | `design/explorations/assets/v2/hero-d-rock-top.webp`, `hero-d-rock-left.webp`, `hero-d-rock-right.webp`, `hero-d-rock-bottom.webp` |
| Layout data | `design/explorations/assets/v4/hero-d-layout.json` |

Opening, phone (780 by 1688):

| Layer | Path |
|---|---|
| Fog | `design/explorations/assets/v2/hero-p-sky.jpg` |
| Figure, silhouette | `design/explorations/assets/v4/hero-p-figure-dark.webp` |
| Figure, lit | `design/explorations/assets/v4/hero-p-figure-lit.webp` |
| Haze | `design/explorations/assets/v2/hero-p-haze.webp` |
| Lens discs | `design/explorations/assets/v2/hero-p-bokeh.webp` |
| Rubble | `design/explorations/assets/v2/hero-p-rock-top.webp`, `hero-p-rock-left.webp`, `hero-p-rock-right.webp`, `hero-p-rock-bottom.webp` |
| Layout data | `design/explorations/assets/v4/hero-p-layout.json` |

Shared: ash tile `design/explorations/assets/v2/hero-dust.webp` (1024 by 1024, tiles in both directions).

Rubble is stored at half size because it is out of focus. The desktop opening totals about 0.4 MB and the phone set about the same.

**Use the figure layers in `assets/v4/`.** The folders `assets/v2/` and `assets/v3/` also hold figure layers with the same file names; those are earlier revisions.

Hall:

| Layer | Path |
|---|---|
| Hall, desktop | `design/explorations/assets/v2/hall-d-plate.jpg` |
| Hall, phone | `design/explorations/assets/v2/hall-p-plate.jpg` |
| Seated Doom, desktop | `design/explorations/assets/v2/hall-d-doom.webp` |
| Seated Doom, phone | `design/explorations/assets/v2/hall-p-doom.webp` |

### 9.3 Reference only: never ship

Everything under `references/`. These are studio-owned images, a fan-made decoder, and a photograph of a collectable figure.

| Folder | Files |
|---|---|
| `references/character/` | `doom-1.png`, `doom-2.png`, `doom-3.png`, `doom-4.jpg` |
| `references/environment/` | `doom-throme-wide.png`, `doom-throme.jpg`, `doom-castle.webp` |
| `references/inspiration/` | `doom-mask.png`, `doom-reveal-1.png`, `doom-reveal-2.png`, `doom-reveal-3.png`, `doom-lifting-hand-mirrored.jpg`, `rune-view-1.png`, `rune-view-2.png`, `doom-logo.png`, `doom-logo-text.png`, `doomscript-decoder.png` |

Also reference only, and not for the build:

- The concept boards and index in `design/explorations/` and the stylesheet `design/explorations/shared/board.css`. The boards link to the reference images for comparison.
- The crops named `study-*`, `mat-*`, `before-*` and `after-*` in `design/explorations/assets/v2/`, `v3/` and `v4/`.
- `design/explorations/previews/`.
- The generators in `design/explorations/assets/board-4-source/`, `board-4-v2-source/`, `board-4-v3-source/` and `board-4-v4-source/`. They are drawing scripts, not application code. The v4 folder is the one that reproduces the approved figure.

### 9.4 Not used

`design/explorations/assets/v2/horned-mark.svg`. Not used in the first version. It may be reconsidered if the source of the image it was traced from is confirmed.

### 9.5 Requiring future production

| Needed | Why |
|---|---|
| All audio | Synthesised in milestone 5 (section 6.8); awaiting approval by ear |
| Sound design for the new opening | None needed: the opening plays before the guest's first action, when nothing may sound |
| Tablet and intermediate compositions | Not drawn (section 7.3) |
| Final figure and hall artwork | Only if the render style is not accepted |
| A detailed seated Doom | The present layer is a small stand-in |
| Council screens not yet drawn: the guest list, the alternative entry, confirmation, decline and its closing screen, the invalid link | No mocks exist. They follow the approved council mock (section 8) |
| Administrator panel: guests and links, the character roster, the proposal, approvals and alternatives, finalising | No mocks exist |
| Character marks or artwork | None exists. A could-have, not part of the first version |
| Draft copy for every unwritten screen | None exists. To be prepared for your approval |
| Exported icon files | Section 9.1 |
| Font files for self-hosting | The boards use Google Fonts |
| The mechanism and transition animations | Storyboarded as stills only (section 6.6) |

---

## 10. Implementation constraints

These must not be compromised.

**Artwork and identity**

1. Do not redraw, restyle or "improve" the mask, the suit rune, the seal or the Doomscript glyphs. Use the files.
2. Do not ship anything from `references/`. Do not use film stills, studio logos, or the Marvel or Avengers wordmarks.
3. Do not generate or source new images of Doom, the hall or any character without approval.
4. Doom is never animated, never given a voice, and never shown with visible or glowing eyes.
5. Keep the three sources of iconography apart (section 4.2). Do not describe Doomscript as official.

**Doomscript**

6. Runes are decoration. They never carry information and are hidden from assistive technology.
7. Never render a letter the script lacks. Never write a guest's name in runes.

**Colour and type**

8. Emerald means active and gold means Doom. Do not use either as a general accent.
9. No pure black or white text pairs. Keep the contrast figures in section 2.1.
10. Use only the four families of section 2.2, under its usage rules. In particular: no word containing a V in Pirata One; no numeral and no name in Orbitron; no running text in Cinzel; nothing read below 17 px in Cormorant Garamond.

**Composition**

11. The opening's order of disclosure is fixed: hand, body, head, costume, then text.
12. The guest's name and the two opening lines are exactly as written, and the name is the largest text on the screen.
13. Text and actions sit in the lowest third and never over the mask or the hand.
14. Phone layouts are their own compositions. Do not derive them by scaling or cropping.

**Motion and sound**

15. No bounce or elastic easing. No particles outside the opening. No flicker.
16. Nothing plays before the guest's first action. "Go without sound" is always offered.
17. Reduced motion and silent mode are honoured everywhere, and nothing is lost in either.
18. The opening can be skipped and plays once.

**Accessibility**

19. Every action is reachable and visible by keyboard. Focus is always shown.
20. Status is never given by colour alone.
21. Scenes are decoration and carry alternative text only where they convey something the text does not.
22. The summons, the guest's name and every proposal are real text in reading order, never images of text.
23. Nothing flashes more than three times a second. Movement that runs for more than five seconds can be stopped.

**Scope of use**

24. The artwork follows studio-owned designs closely, at your request, for a private invitation among friends. Anything public needs a second look first. The build should not invite indexing or sharing beyond the guests.
25. No rights position exists for any reference image. The research treats all of them as reference only.

---

## 11. Decisions, open questions and outstanding work

### 11.1 Decided

Recommendations you accepted on 15 November 2026. The "Was" column gives the number each had in the first draft's list of unresolved questions.

| Decision | Was |
|---|---|
| Revision 4 is the approved board | 1 |
| Typefaces: your choice of "Two: Doomsday": Pirata One for display, Cinzel 500 as supporting serif, Orbitron 600 for technical text, Cormorant Garamond 500 and italic for body, with the usage rules of section 2.2. This replaces the set I had recommended (Grenze Gotisch, Bodoni Moda, Oxanium, Spectral), which was in force for part of 15 November | 2 |
| The earlier Iron Throne boards stay in the project for the record. Revision 4 is the board of record | 3 |
| A title precedes the guest's name when one is set (`PRODUCT_SPEC.md`, Stage 1) | 4 |
| The suit rune keeps its fourth bracket | 6 |
| The horned mark is not used in the first version | 7 |
| Buttons act on an ordinary press. No action requires holding | 9 |
| No ambient movement in the hall in the first version | 10 |
| Characters are shown by name only in the first version | 12 |
| The ash in the opening fades to stillness after the text appears | 17 |
| The clasps stay as drawn: a rayed disc and a squared knot, without the stone, as on the approved figure | 18 |
| The tone is played straight, with dry humour | 19 |
| The concept renders of the figure and the hall are the approved artwork for the first version. Custom artwork is a possible future enhancement | 5 |
| Type sizes, weights and hierarchy as listed in section D of the typography review board | review |
| Body treatment: upright for ordinary text, italic for Doom's formal and dramatic lines | review |
| Long names wrap, to three lines in the opening if needed; 80% is the smallest step; the summons scrolls for rare long names | review |
| Tighter phone spacing on the summons. No readable body text below 17 px. Readability takes priority over avoiding scrolling | review |
| "The Iron Throne" appears in the opening experience only | review |
| The council layout of the typography review board is the design direction for the first version: structure, hierarchy, character states, proposal panel, approval count, alternatives. Its placeholder wording is not approved | review |
| Pirata One never renders an individual word containing V or v. Only that word is set in Cinzel; the heading is not switched to Cinzel as a whole and keeps its place in the hierarchy. Stated by you on 15 November 2026, correcting the earlier wording of sections 2.2 and 8.3 | build |

Product decisions that shaped section 8 (taken characters show their holder, approvals reset when the proposal changes, the count is against seated guests, the council updates on reload) are logged in `PRODUCT_SPEC.md`, section 7.

### 11.2 Open: needs your input

Nothing. The specification phase closed on 15 November 2026: this document, `PRODUCT_SPEC.md`, `COPY.md` and the approved boards and artwork are the source of truth for the first version. How it is built is in `ARCHITECTURE.md`.

### 11.3 Outstanding work

Not questions. Each is done during the build, from this document and the approved council mock, and is reviewed in the running product instead of on further boards.

| Work | Notes | Was |
|---|---|---|
| Sound | **Built in milestone 5**: seven synthesised sounds, wired to the iris, the plate, the seal and the hall (section 6.8). The owner approves them by ear on `/dev/specimen`; any can be remade by changing `web/scripts/make-sounds.py` | 8 |
| Council screens | Approved in layout: the proposal panel and character selection. **Built in milestone 3 (16 November 2026)** from that mock, to be reviewed in the running product: the guest list (a panel with a well, Doom first as sovereign, guests by name without their titles); the alternative entry as a second panel under the proposal, opened by "Propose another"; the decline and leave dialogs as panels with a Pirata One heading; the closing and "day has passed" screens as a single panel on Night; notices as a line at the top of the panel they concern; the invalid-link screen as a heading and one line. On the council the hall is a banner over the title on every screen, cropped from the wide plate as in the mock; the hall caption ("The council is seated." and its line) shows under the banner only while Doom has proposed nothing, which is when its line is true | 13 |
| Administrator panel | Guests and links, the character roster, the proposal, approvals and alternatives, finalising. Not designed | 13 |
| Copy | Approved in `COPY.md`. The placeholder wording on the review board is replaced by that deck; guests see "mantle" where the board says "name" | 14 |
| Tablet and intermediate layouts | **Set in milestone 4 (16 November 2026), by eye and by measurement.** The upright layer set is used below a ratio of 5:6 (width to height), the wide set above. The wide frame covers the screen and is cropped evenly unless that would cut the raised hand; then the crop is taken from the other side, keeping the hand 2vw from the left edge. The upright frame is anchored to the top, so on screens wider than a phone the lower rubble is what is cropped. On very wide screens at most 5% of the frame's height goes from the top, keeping the hood's headroom. Checked at 390×844, 768×1024, 820×1000, 900×900, 1024×768, 1440×900 and 2560×1080: the hand is always on screen and the lines always start below the mask | 11 |
| Motion never seen in motion | **Built in milestone 4** with the starting timings, to be judged in the running product. The iris closes in 0.45 s once the guest's action has been answered and opens in 0.45 s on the new scene, with the active seal at its centre. The plate's halves (its own artwork, cut at the seam) part 34% each in 1.2 s with light in the gap and close in 0.8 s, and the words appear as they meet. The seal then wakes: its bands turn from 38°, −24° and 61° to register in 0.7, 0.9 and 1.1 s, and its runes light in reading order 75 ms apart. The ash drifts down and to the left and fades out over 1 s, three seconds after the actions appear. Under reduced motion each is a 0.2 s cross-fade | 15 |
| Accessibility and performance | **Checked in milestone 6 (16 November 2026)**: axe (WCAG 2.2 A and AA) and keyboard alone on every screen; one colour changed for contrast (section 6.5). The opening's first beat is drawn by CSS before its script arrives, and under reduced motion its 0.2 s fade is CSS too (section 6.10); neither changes what the guest sees | new |
| Device checks | Nothing has been checked on a real phone or tablet. The research calls this the most valuable next step | 16 |
| Long names | **Built** (`web/src/lib/fit.ts`, measured in the browser): on the summons the two-line fit and the single 80% step; in the opening the name may take three lines and only steps down | new |
| The title in the opening | **Set in milestone 4, by eye:** centred at the top of the frame, it fades in at 0.3 s over the closed rubble and is gone before the slab clears the hood (by 4.1 s), so it never sits over Doom. It is not part of the final frame, so a guest who skips or asks for reduced motion does not see it; the page's title in the browser carries it. Overrule if it should stay | new |
| Display strings | Every new heading set in Pirata One must be checked by eye (section 2.2) | new |
| Assets to export | The seal mark, nested square, corner bolt, cuirass tile, clasps and the seal's dormant and waking states (section 9.1). Font files for self-hosting. Brushed-steel textures baked to images | section 9 |

## 12. Superseded material

Kept in the project for the record. Do not build from these where they differ from this document.

| Material | Superseded by |
|---|---|
| Directions I, II and III: `design/explorations/direction-1-winter-chancery.html`, `direction-2-the-audience.html`, `direction-3-iron-protocol.html`, `design/CREATIVE_DIRECTIONS.md` | Direction IV |
| `design/COMPARISON.md`, which recommended Direction I as the spine | Your decision to combine II and III |
| First Iron Throne board: its opening (a doorway, a floor ring, text at the left), its Gothic hall, its flat vector figure, its six-sided mask sketch, its seat and clasp icons, its motion beats 1 to 3, its rule against drifting particles | Revisions 2 to 4 |
| First Iron Throne board: the seal as the hall's rose window | The seal belongs to the summons and transitions only |
| `design/explorations/direction-4-the-iron-throne-v2.html`: its figure | Revisions 3 and 4 |
| `design/explorations/direction-4-the-iron-throne-v3.html`: its hood, cowl and hand | Revision 4 |
| Figure layers in `design/explorations/assets/v2/` and `v3/` | `design/explorations/assets/v4/` |
| Earlier sample copy using the placeholder guest "Tara Menon" and longer titling | The wording in `PRODUCT_SPEC.md`, section 2 |
| Typefaces of earlier directions: Castoro Titling, Cormorant Garamond, Crimson Pro, IM Fell, IBM Plex Mono, Hanken Grotesk, Instrument Sans | Section 2.2 |
| Bodoni Moda, Spectral and IBM Plex Sans, as drawn in the frames of every Iron Throne board | Section 2.2 |
| Grenze Gotisch and Oxanium: the recommended combination "One: Crown and machine", shown on the board under "The recommended set, applied" and in force for part of 15 November | Section 2.2 |
| The type sizes of the boards' frames | The scale in section 2.2 |
| The first Iron Throne board's rule of no blackletter | Pirata One, under the limits of section 2.2 |
| The first draft of this document's list of nineteen unresolved questions | Section 11 |

Still in force from the first Iron Throne board and `design/CREATIVE_DIRECTION_V2.md`: the interface palette, the shape and states of the controls and panels, the Doomscript rules and inscriptions, the seal, the summons plate and its wording, motion beats 4 to 6, and the sound proposals and limits.
