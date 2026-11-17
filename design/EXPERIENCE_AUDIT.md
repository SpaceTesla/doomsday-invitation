# The Iron Throne: experience and creative-direction audit

Written 16 November 2026 on the `creative-refinement` branch. **This is an audit only.** No code, asset, specification or production data was changed to make it. It is a new file, and nothing in it is approved or scheduled.

## How this was done

- **Read the implementation:** every guest scene, the motion timelines, the sound module, the styles and the copy.
- **Ran the production build locally** against the sample event and walked it with Playwright at 1440×900 and 390×844, with full motion and sound chosen. I captured 139 frames, including timed sequences of the opening, both scene changes and the summons reveal.
- **Logged every sound that actually started**, with its time, by instrumenting the browser's audio. The findings about sound below are measured, not read from the code alone.
- **Moved the sample event through every state:** proposal changed, decreed, decree amended, day passed, declined, invalid link.
- **Opened the artwork itself:** every raster layer in `web/public/art/` and the unshipped renders in `design/explorations/assets/`.

A naming note. The screen with the TAKE YOUR SEAT button is called **the summons** in the code and the specs. I use that name, and I take "the Take Your Seat transition" in your brief to mean the plate parting when the summons arrives. That is the only place where the screen "splits in half".

---

## 1. Executive assessment

**The experience is front-loaded.** Atmosphere falls in steps as the guest moves through the story, while the stakes rise:

| Stage | What carries it | Richness |
|---|---|---|
| Opening | 12 artwork layers, a 10-second timeline, drifting ash, pointer parallax, a title | Cinematic |
| Summons | A baked steel plate, a live seal that turns and lights, a door mechanism, six sounds | Mechanical, strong |
| Council | One cropped strip of the hall, then flat panels on a flat ground | Functional |
| Decree | The proposal panel with two words changed | The plainest state in the journey |
| Closing, day passed, invalid link | One panel, or two lines of text, on black | Bare |

The decree is the story's climax and is its quietest moment. The council is where guests spend most of their time and make every choice, and it has almost no motion, no Doomscript and one strip of artwork.

**The foundation is strong, and nothing needs redesigning.** The palette, the four typefaces, the plate-and-well component language, the seal, and the rule that machines turn and lock while Doom stays still are all coherent. What is missing is carrying that language past the summons.

**Five findings matter most:**

1. **The hall is barely seen.** On a phone the council shows a 250-pixel strip of the wide hall. The upright hall painted for phones (`hall-p-plate.jpg`, `hall-p-doom.webp`) ships with the site and is never used. The emerald floor circle, which is the hall's Doomscript and its only emerald light, is cropped out. After the first step change the page scrolls past the hall, and it is gone.
2. **Doomscript all but disappears after the summons.** Six inscriptions exist. One is drawn live, once, 9 pixels tall on a phone. The others are baked into the summons plate and the seal. From the council onwards there is none.
3. **Claiming a mantle has no moment.** A tap fades straight to the guest list. The line written for it, "You stand before the council as [Character].", only flashes: the screen that holds it is replaced as soon as the server confirms the claim. I measured it on screen for 9 to 24 ms locally.
4. **The summons reveal shows nothing.** The two halves are the plate's own picture, and behind them is the same plate, blank, with a painted glow. Your reading of it is exact.
5. **Two sound faults.** The first scene change is silent even with sound chosen, because the files are still loading. And every rune tick on the seal fires in the same instant, as one burst, instead of one tick per rune. With the rising hum, that burst is most likely what reads as "gimmicky music".

---

## 2. The guest journey as built

A guest's link, `/s/<token>`, shows exactly one of five stages. The server decides which.

```
link opened
   │
   ▼
OPENING ──(GO WITH HIM / GO WITHOUT SOUND)──► SUMMONS ──(TAKE YOUR SEAT)──► COUNCIL
   ▲ returns here until a                        │                            │ step 1  Proposal
   │ button is pressed                        (DECLINE,                       │ step 2  Mantle
                                              confirmed)                      │ step 3  Those summoned
                                                 │                            │
                                                 ▼                     (LEAVE THE COUNCIL,
                                              CLOSING ◄──────────────── confirmed, until the decree)
                                           "So be it."
                                        (TAKE YOUR SEAT again ──► COUNCIL)

After the day:  unanswered or declined guests ──► DAY PASSED.   Seated guests still see the council and its decree.
Any link that is not a live summons ──► NO SUMMONS HERE (status 404).   A server fault ──► "The hall will not open."
```

- **Every change of stage** uses one transition: the seal iris.
- **Inside the council** the three steps change with a 0.2-second fade.
- **Overlays:** two confirmation dialogs (decline, leave) and the alternative-entry panel.
- **On every screen after the opening:** a SOUND ON / SOUND OFF control, fixed at the top right.

---

## 3. Screen by screen: the current experience

### 3.1 The opening

**What the guest sees.** A full-screen painted scene, seen from under rubble, looking up.

- **Doom** stands over the guest: a deep green wool hood, a steel mask with dark eye openings, a cuirass of square tiles, and two steel clasp discs joined by a chain. His left gauntlet is raised, and a small emerald rune glows on the forearm.
- **Behind him** is cold, pale fog with one bright bloom of light directly behind the raised hand.
- **In front of the lens** are four dark, soft-edged pieces of rubble (a slab above, a mass each side, a mound below), a few out-of-focus discs of light, falling ash, and a dark vignette.
- **The words** sit centred in the lower part, over a dark gradient:
  - the guest's name in Cinzel, large, silver: "MR. ANISH.";
  - one italic line in Cormorant Garamond: "Doctor Doom is here to collect you.";
  - a line of Doomscript ("viktor von doom") as a signature, in a muted grey-green, very small;
  - the primary button GO WITH HIM (a small steel plate with the seal mark) and the quiet text control GO WITHOUT SOUND.
- **Desktop:** a 16:9 composition, with Doom right of centre and the hand at the left.
- **Phone:** a separate upright painting. Doom fills the frame, with the hand at the upper left and the mask above centre; the words take the lower half.

**What happens.** One timeline, about ten seconds:

| Time | Beat |
|---|---|
| 0.0 s | Darkness. The rubble is closed except one gap of fog light with the hand's silhouette in it. The camera is pushed in 4.5% and begins a slow 7-second settle. The light behind the hand grows |
| 0.3 s | The title "The Iron Throne" fades in at the top, in Pirata One, pale gold |
| 1.4 s | The rubble slides apart to a half-open position over about 3 seconds. Shoulders, clasps and hand appear as a silhouette |
| 3.3 s | The title fades out |
| 4.2 s | The rubble slides fully open. The top slab clears the hood |
| 6.0 s | The lit figure fades in over the silhouette (1.7 s): mask, cloth and cuirass gain detail and colour |
| 7.6 s | The lower gradient darkens and the name wipes in from left to right |
| 8.5 to 9.4 s | The line, then the runes, then the two actions wipe in |
| 12.4 s | The ash, which has drifted down and to the left throughout, fades to stillness |

- **Doom never moves.** Only the rubble, the light, the ash and the camera do.
- **Pointer parallax:** with a mouse, the rubble shifts up to about 12 px against the pointer and Doom about 4 px.
- **Skipping:** any key or tap jumps to the final frame.
- **Reduced motion:** the final frame fades in over 0.2 s.
- **Sound:** none, by rule. Nothing may play before the guest's first action.
- **Returning:** the opening comes back on every visit until a button is pressed.
- **Leaving:** either button records the choice of sound and closes the iris.

**What makes it distinctive.** Dread, then recognition. The guest is small, buried and found. It is the only scene with a real light source and a sense of depth, and the only one that addresses the guest by name before asking anything of them. It works.

### 3.2 The scene change: the seal iris

**What the guest sees and what happens.** The current scene is closed off by a dark circle shrinking to the centre (0.45 s) while the three-band seal fades up in the middle. The next scene is rendered behind it. The circle then opens from the centre (0.45 s) as the seal swells slightly and fades.

- **Sound:** a ratchet-and-stop, "seal-turn" (0.9 s).
- **Reduced motion:** a 0.2-second cross-fade.
- **Used for:** opening to summons, summons to council, decline, leave, and taking a seat again.

**Two observations:**

- **It always runs the same way.** The design spec says going back should run it in reverse; that was not built.
- **The first one is silent** (measured). On GO WITH HIM the sound files have only just begun loading, so the request to play is dropped.

**Role.** It is the one piece of shared transition language, and it puts the state seal at every threshold. It is quick and correct, and should stay.

### 3.3 The summons

**What the guest sees.** A dark steel plate on a near-black ground.

*Desktop (a 4:3 plate, two columns):*

- **The plate itself is baked artwork:** brushed dark steel with cut corners, a dotted gold border, a gold bolt in each corner and a fine inner rule.
- **Doomscript is engraved along all four edges:**
  - top: "there is no promise of tomorro";
  - bottom: "to the viktor go the spoils";
  - left: "justice";
  - right: "revenge".
- **Left column:** the mask as a gold line insignia; below it the three-band seal, drawn live, over a soft emerald glow; then "latveria" in runes and an italic dating line ("Given at Castle Doom, in Doomstadt, the sixteenth day of November, MMXXVI.").
- **Right column, past a dotted divider:**
  - "VICTOR VON DOOM" in Cinzel, pale gold;
  - an italic line, "by his own hand and will Sovereign of Latveria, to";
  - the guest's name in large Cinzel over a thin emerald rule;
  - "greeting.";
  - three paragraphs in Cormorant Garamond, the last in bold italic ("Let none who is called fail to answer. The absent forfeit their voice.");
  - the button TAKE YOUR SEAT and the quiet control DECLINE.

*Phone (an upright plate filling the screen):*

- The seal sits alone at the top centre over an emerald glow, with a dotted rule beneath and the same text in one column.
- **The phone plate has no mask insignia.**
- **Its edge runes are so faint and small they are effectively invisible.**

**What happens,** about five seconds after the iris opens:

1. **The plate parts** (1.2 s). Two halves slide outwards by a third of their width. Each half is a copy of the plate's own artwork. In the gap is a tall oval glow, gold at the core and emerald at the edge, over the same plate, blank. Sound: steel sliding, a draw of air.
2. **The plate closes** (0.8 s). The halves slide back. Sound: a short slide and a heavy close.
3. **The words appear,** all at once, the instant the halves meet.
4. **The seal wakes.** Its three bands start out of register and dull. They turn to alignment, each at its own speed (0.7, 0.9 and 1.1 s), with a click as each locks. A low hum swells underneath for 2.2 s.
5. **The runes light.** Once the bands lock, the seal's runes turn from dull to gold and emerald one after another, 75 ms apart.

- **Reduced motion:** a 0.2-second cross-fade, with the seal already awake.
- **Revisits:** the whole sequence replays every time the summons is opened.

**Leaving:**

- **TAKE YOUR SEAT** closes the iris onto the council.
- **DECLINE** opens a confirmation dialog: a small plate over a dark scrim, headed "Refuse the summons?" in Pirata One, with REFUSE and GO BACK. Confirming closes the iris onto the closing screen.

**What makes it distinctive.** Authority. It is a state document, issued by a machine, and the guest's name is the largest thing on it. The seal waking is the best piece of motion in the product after the opening. The door mechanism is the weak part (section 6.2).

### 3.4 The council: arrival and frame

**What the guest sees.**

- **The hall banner.** A strip of the throne hall runs across the top:
  - tall windows of pale yellow-green glass with leading that bends like stems;
  - amber lamp strips on the pillars;
  - the dark throne on a stepped dais with a line of gold along each step;
  - a gold panel bearing the suit rune above the throne;
  - Doom seated, small, hooded, hands on the arms.
- **The banner's size and crop:**
  - desktop: a third of the screen's width in height, capped at 46% of the screen's height (414 px at 1440×900), showing the throne, both window bays and the side lamps;
  - phone: 250 px at 390 wide, a tight crop of the same wide painting.
- **The title.** The strip fades into the page's olive-black ground, and "Council of Doom" sits over the fade in Pirata One, pale gold.
- **The step header.** Three tabs: **1 PROPOSAL · 2 MANTLE · 3 COUNCIL**. Each has a small mark, a Cinzel numeral, an Orbitron label and a 2 px rule beneath. The current step is gold with the seal mark; a finished step is emerald with the suit rune; one not yet reachable is dim with an empty square, and cannot be pressed.
- **The body.** One step at a time, in a single column 46 rem wide. On desktop that leaves wide empty margins either side.

**What happens.**

- **On arrival** the iris opens and everything is simply there. Nothing moves. Doom's figure, a separate image, can pop in a fraction of a second after the hall.
- **Sound:** if sound is on, a quiet room tone fades in over 1.2 s: low filtered noise with slow gusts of wind, in a 60-second loop.
- **The page opens on the first step the guest has not answered.**
- **Changing step:** the body fades in over 0.2 s, a click sounds, and the page jumps so the step header is at the top. That jump scrolls the hall off screen, so from the first step change onwards Doom is not in view.

**Role.** This should be the guest's arrival in Doom's own room, the warm, ordered inside after the cold outside. At present the room is a header image.

### 3.5 Council step 1: the proposal, and the decree

**What the guest sees.** One steel panel: a dark gradient plate with a dotted gold line just inside its edge.

- **The heading** "Doom proposes" in Pirata One, with the tag PROPOSED at the right.
- **The day and hour,** in words, in italic Cormorant Garamond: "Friday the eighteenth of December, at half past seven in the evening." Then "At the Grand Cinema, in the fourth hall."
- **A recessed well** with the count: "1 of 3 seats has approved", figures in Cinzel.
- **The actions:** the button APPROVE and the quiet control PROPOSE ANOTHER.
- **A line of explanation:** "Your approval is counsel. Doom alone decides, and may change the proposal at any time."
- **A second well** headed ALTERNATIVES, listing each alternative day with its proposer's name in small Cinzel, or "No alternative has been put forward."

**What happens.**

- **APPROVE:** the button turns emerald and reads APPROVED, a WITHDRAW control appears, and the page moves on to step 2. If the guest returns to step 1, a CONTINUE button sits under the panel.
- **PROPOSE ANOTHER:** a second panel opens beneath, headed "Propose another", with a DAY field (the device's own date picker), an HOUR list in words ("six o'clock in the evening"), the button SET IT BEFORE DOOM and CANCEL. Sending it shows "Your alternative is before Doom." and adds the alternative to the list, with a WITHDRAW control on the guest's own.
- **If Doom has proposed nothing:** a centred heading "The council is seated." and "Doom has not yet named the day."
- **If Doom changes the proposal:** a line at the top of the panel says "Doom has changed the proposal. Earlier approvals no longer stand." The count resets and the guest is brought back to this step.

**The decree.** When Doom finalises:

- the heading becomes "Doom decrees" and the tag DECREED;
- the count, the actions and the alternatives are removed;
- one bold italic line is added: "Be there. The absent forfeit their voice.";
- if the decree is later amended, a line says "Doom has amended the decree. Mark the new day."

Nothing else changes: the same panel, the same size of type, the same hall strip, no motion and no sound.

**Role.** The proposal is deliberation, and plain is right for it. The decree is the verdict the whole product leads to, and it currently has no weight of its own.

### 3.6 Council step 2: the mantle

**What the guest sees.**

- **The heading** "Choose your mantle" in Pirata One, with a line of explanation.
- **A search field** labelled FIND A MANTLE, with a square magnifier mark.
- **Thirty-eight plates in one column,** grouped under seven faction names in gold Cinzel ("The Avengers (Earth-616)", "Doom's Rumoured Team" and so on).
- **Each plate** is the button plate enlarged: a steel gradient, a dotted gold inner line, a small empty-square mark, and the character's name in Cinzel at 22 px.

The plate's states:

| State | Appearance |
|---|---|
| Free | As above |
| Hover or focus | The border turns gold and the square mark turns emerald |
| Yours | An emerald border, the suit rune in emerald in place of the square, and the tag YOURS |
| Taken | Flat, with no gradient, a dim border and name, the tag TAKEN, and the holder's name beneath |

- **Below the list:** the quiet control CHOOSE LATER, while the guest holds no mantle.
- **After the decree:** a line says "The day is decreed. Mantles can no longer change." and a guest's own mantle is locked.

**What happens.**

- **Searching:** typing narrows the list at once, ignoring capitals and accents. Factions with no match disappear. With nothing found: "No mantle answers to that name."
- **Claiming:** tapping a free plate claims it. The step fades (0.2 s) to step 3, with a click.
- **The claim line only flashes.** "You stand before the council as [Character]." is written to appear on this step after a claim, but the step is replaced as soon as the refreshed council arrives.
  - Measured locally over three runs: on screen for 9 to 24 ms, one or two frames.
  - On the live site it would last as long as the server takes to answer, still a fraction of a second.
  - A guest changing an existing mantle never sees it at all.
- **Losing a race:** if another guest took the mantle a moment earlier, a message says who, with a RELOAD button.

**Role.** This is the guest's one act of identity in Doom's world. As built it is a well-made list. It is usable and clear, and it feels like choosing a row.

### 3.7 Council step 3: those summoned

**What the guest sees.**

- **The heading** "Those summoned" in Pirata One.
- **A panel holding a dark well with one row per person.**
- **The first row** is "DOCTOR DOOM" with the small gold mask and the tag SOVEREIGN.
- **Each guest's row** has a status mark, the name in Cinzel, the status word in Orbitron, and beneath a seated guest either their mantle or "No mantle yet":

| Status | Mark | Word |
|---|---|---|
| Seated | Emerald suit rune | SEATED |
| Not yet answered | Steel seal mark | SUMMONED |
| Declined | Dim empty square | DECLINED |

- **The guest's own row** carries a gold rule at its left edge and the tag YOU.
- **Below the panel:** the quiet control LEAVE THE COUNCIL, until the decree.

**What happens.** The list is still, and shows the council as it stood when the page loaded. LEAVE THE COUNCIL opens a dialog, "Abandon your seat?", with ABANDON SEAT and REMAIN. Confirming closes the iris onto the closing screen.

**Role.** Belonging: who else answered, and as whom. It is quiet and should stay quiet, but Doom's row is the same size and weight as a guest's.

### 3.8 The endings

| Screen | When | What the guest sees |
|---|---|---|
| **Closing** | After declining or leaving | A black ground and one small panel: "So be it." in Pirata One, then "Doom does not ask twice. The seat stands empty until the day; return before then, and it is yours.", and the button TAKE YOUR SEAT |
| **Day passed** | After the day, for a guest who declined or never answered | A black ground and one panel: "The day has passed." and "The council sat without you." No action |
| **No summons here** | Any invalid, cancelled, replaced or expired link | No panel. On black, the heading "No summons here." and "This link opens nothing. If Doom summoned you, ask him for your link again." |
| **The hall will not open** | A server fault | One line and a RELOAD button |

None of the four has artwork, a mark, Doomscript, motion or sound of its own.

**Role.** These are refusals and endings. Stillness suits them. But at present their restraint reads as emptiness: nothing on them belongs to Latveria except the typeface.

### 3.9 The administrator panel, in brief

- **Sign-in:** a black ground and one panel, with the gold line mask beside "Doom's Council" in Pirata One, a PASSPHRASE field and the button ENTER.
- **Inside:** the same header, four Orbitron tabs (GUESTS, CHARACTERS, PROPOSAL, COUNCIL) and SIGN OUT.
- **Each page** is built from the same panels, wells, fields and buttons as the council:
  - a form to summon a guest, with title chips;
  - guest rows with COPY LINK, REPLACE LINK, CANCEL LINK, EDIT NAME and REMOVE GUEST;
  - the roster grouped by faction;
  - the proposal form;
  - the council view, with FINALISE THE PLAN or AMEND THE PLAN, and EXPORT.

It is consistent with the guest side and correctly plainer. I would leave it alone, with one possible exception: it is the only place the level 2 mask insignia appears live, and that would also suit the guest side's decree.

---

## 4. Effects, animation and audio inventory

### 4.1 Motion

| Where | What moves | Trigger | Length | Reduced motion |
|---|---|---|---|---|
| Opening | Rubble (two moves), camera settle, light growing, title in and out, lit figure fading in, four text wipes, ash loop | Page load | About 10 s; the ash stops at 13.4 s | 0.2 s fade of the final frame |
| Opening | Parallax of rubble and figure | Mouse movement | Continuous while the mouse moves | Off |
| Scene change | Iris closing, seal fading up; iris opening, seal fading out | Any action that changes stage | 0.9 s | 0.2 s cross-fade |
| Summons | Plate halves part and close; gap light; words appear; seal bands turn; runes light | Arrival on the summons, every time | About 5 s | 0.2 s cross-fade |
| Buttons | Border and mark colour on hover; an emerald fill from the left while pressed | Hover, press | 0.1 to 0.16 s | Off |
| Council | The step body fades in | Step change | 0.2 s | Same |
| Dialogs | Fade in | Open | 0.2 s | Same |
| Council hall, proposal, decree, mantle plates, guest list, endings | **Nothing** | | | |

### 4.2 Sound

Seven sounds, all synthesised from noise and sine waves by `web/scripts/make-sounds.py`. They load only after the guest chooses sound.

| Sound | Length | What it is | When it plays (measured) |
|---|---|---|---|
| `seal-turn` | 0.9 s | A low grinding bed, eleven ratchet clicks that slow, a soft thud | Each iris. **Silent on the first one** (GO WITH HIM), because the files are still loading |
| `plate-part` | 1.2 s | Steel sliding on steel with a low draw of air | The summons plate parting |
| `plate-close` | 0.8 s | A short slide, then a heavy low impact with a metallic ring | The plate closing |
| `hum` | 2.2 s | A tone at 55 Hz with harmonics at 110, 165, 275 and 385 Hz, swelling and brightening, plus a faint buzz | The seal waking |
| `detent` | 0.35 s | A click, a mid thunk, a brief ring | Each seal band locking (three, each pitched 6% higher); and every council step change |
| `rune-tick` | 0.08 s | A dry, high metal tick | Meant to play once per rune, 75 ms apart. **All of them fire in the same instant**, as one burst, when the bands lock |
| `hall-room` | 60 s loop | Low filtered noise with slow wind gusts and a faint rumble | The council, fading in over 1.2 s and out over 0.6 s. Fades out when the tab is hidden |

- **No sound at all on:** approving, proposing, claiming a mantle, the decree, the dialogs, and the endings (beyond the iris that leads to them).
- **No sound in the opening,** by rule.
- **The tick burst:** each tick is scheduled with a malformed timeline position, so the stagger is ignored. It is a one-line fix when work starts.
- **The first silent scene change** needs a decision about loading two small files slightly earlier (recommendation C3).

---

## 5. Creative asset-usage matrix

### 5.1 Artwork and imagery

| Asset | What it is | Current use | Class | Opportunity |
|---|---|---|---|---|
| Opening layers (`hero-d-*`, `hero-p-*`: sky, dark figure, lit figure, haze, bokeh, four rocks, dust) | The reveal, desktop and phone | All used, in the opening only | **Well utilized** | None needed. The ash tile could serve as dust in the hall's light shafts |
| `hall-d-plate.jpg`, `hall-d-doom.webp` | The wide throne hall and the seated Doom as his own layer | The council banner: a cropped strip. The lower third, with the floor circle, is cut off or under a gradient | **Underutilized** | Show more of it and keep it present through the steps (A4, B2) |
| `hall-p-plate.jpg`, `hall-p-doom.webp` | The upright hall for phones: windows, throne, dais, and the whole emerald floor circle in the foreground | **Shipped, never referenced** | **Currently unused** | The phone council's backdrop. It is the composition the phone was painted for (A4) |
| The emerald floor circle (inside both hall plates) | A ring of Doomscript ("there is no promise of tomorro") with a geometric lattice, burning green | Effectively invisible | **Underutilized** | The hall's active element: it can light on arrival and answer the guest's actions (B2) |
| `summons-d-plate.webp`, `summons-p-plate.webp` | The steel plates | The summons, and both halves of its door | **Well utilized** as the document; **weak** as doors | The phone plate lacks the mask insignia and legible edge runes (D3) |
| Three-band seal (dormant, waking, active) | The state seal | Active: the summons and the iris. Dormant and waking: nowhere except as the starting point of the wake | **Underutilized** | The dormant seal for endings and dead links; the waking seal for a proposal awaiting a decree; the active seal, large, for the decree (A3, A6) |
| Seal mark | The seal as an icon | Every primary button; the current step; a summoned guest | **Well utilized** | None |
| Mask level 1 (filled icon) | Doom as presence | Doom's row in the guest list | **Underutilized** | Acceptable; it is meant to be rare |
| Mask level 2 (gold line insignia) | Doom as issuer | Baked into the desktop summons plate; the admin header | **Underutilized** | Head the decree with it: the decree is the one thing Doom issues after the summons (A3) |
| `mask-level-3.png` (1.75 MB) | The mask as a lit steel relief with rivets. The most finished single object in the project | **Never shipped** | **Currently unused** | The decree's emblem, or the closing screens' only image. Re-encoded it would be about 60 to 90 KB (A3, A6) |
| `suit-rune-level-3.png` | The suit rune raised on a chamfered steel plate | **Never shipped** | **Currently unused** | The lock on the summons doors, split down the seam (B1) |
| Suit rune level 1 | The mark of a seat taken | Finished steps, seated guests, the guest's own mantle | **Well utilized** | None |
| Suit rune level 2 (full lattice) | The insignia form | Nowhere on the guest side | **Currently unused** | The large mark on a "your mantle" plate (A2) |
| Cuirass tile, empty tile | A seat, an item | Mantle plates, locked steps, declined guests | **Well utilized** | None |
| Corner bolt | A gold disc with an inner ring | Only baked into the summons plate | **Underutilized** | The corners of the one principal panel per step (B5) |
| Rayed clasp, knot clasp | Doom's cloak fastenings | Only on the figure | **Not appropriate for reuse** | The press reads them as other characters' emblems (existing research). Leave them on the figure |
| Nested square | The seal's centre | Inside the seal, the seal mark and the favicon | **Well utilized** | None |
| Horned mark | Traced from a logo of unverified origin | Not used, by decision | **Not appropriate for reuse** | Leave |
| `mat-*.jpg`, `study-*.jpg`, `after-*.jpg`, `before-*.jpg` | Small crops of the renders, made for the boards | Never shipped | **Not appropriate for reuse** | They are crops of images we already ship |
| Brushed-steel texture | On the summons plate only, baked in | Council panels are plain gradients | **Underutilized** | DESIGN.md lists "brushed-steel textures baked to images" as outstanding work. Baking one small tile would make every panel the same material as the summons (B5) |

### 5.2 Doomscript

**What exists.**

- **Glyphs:** 22 traced runes. Twenty have readings; two (`x1`, `x2`) are unread and correctly used nowhere. There is no rune for B, W, X, Y or Z.
- **Inscriptions:** six fixed ones are allowed (DESIGN.md 4.1).
- **Code:** a component, `Runes`, already draws any of the six as live vector text at any size and colour, hidden from screen readers.

**Where each inscription appears today:**

| Inscription | Live | Baked into artwork | From the council onwards |
|---|---|---|---|
| "viktor von doom" | Under the opening line: 9 px tall on a phone, muted | The seal's outer band | None |
| "latveria" | None | The seal's outer band; under the seal on the desktop plate | None |
| "to the viktor go the spoils" | None | The seal's inner band; the plate's bottom edge | None |
| "there is no promise of tomorro" | None | The plate's top edge; the hall's floor circle (cropped out) | None |
| "justice", "revenge" | None | The plate's left and right edges | None |

**Assessment.** You are right that it is underused.

- The live drawing component is called once in the whole guest journey.
- Every other appearance is frozen into two pieces of artwork, so the script can never light, respond or mark a state. Yet the design's own rule is that "a rune is plain engraving until a mechanism turns it on".
- On phones, where most guests will be, the plate's edge inscriptions cannot be made out. The only Doomscript a phone guest can actually see is on the seal.

**How it could become part of the identity without hurting legibility.** A system, not decoration:

1. **Each inscription gets one job, like a motto carved over one door.** Doomscript never replaces a readable heading. It sits with one, as an engraved band.

   | Inscription | Its place | Lights (emerald) when |
   |---|---|---|
   | "viktor von doom" | Doom's signature: under the opening line (as now), and under "Doom proposes" / "Doom decrees" | The decree is issued |
   | "there is no promise of tomorro" | The proposal: a rune band along the top of the proposal panel. It is the hall floor's own inscription, and it is about the day | The guest has approved; fully, at the decree |
   | "to the viktor go the spoils" | The mantle: a rune band over the mantle step | The guest holds a mantle |
   | "latveria" | The state: under the dormant seal on the closing, day-passed and invalid-link screens | Never. Those screens are closed |
   | "justice", "revenge" | The left and right ends of the council's step header, as they flank the summons plate | Never. Engraved only |

2. **Use the rune band the design already defines.** DESIGN.md 2.4 specifies it: engraved Doomscript between a dotted line and a rule, turning the corner at a bolt. It exists only baked into the summons plate. Drawn live, it is the natural frame for the one principal panel on each council step.
3. **Light means active.** Engraved runes are dark steel on steel. They turn emerald one by one, in reading order, when the thing they belong to is done. That gives the council what the summons already has: a machine that visibly responds.
4. **Limits:**
   - one lit inscription per screen at most;
   - none on wells, fields, lists or dialogs;
   - no new phrases without your approval.

   On the last point: I checked whether each heading could carry its own rune "echo". It cannot be done consistently. "Choose your mantle", "Those summoned", "So be it." and "The day has passed." all need letters the script lacks. Fixed mottos by place are the coherent option.

### 5.3 Typography and graphic language

| Role | Face | Where it is used now | Assessment |
|---|---|---|---|
| Display | Pirata One | The opening title; the council title (40 to 52 px); every panel and screen heading (30 to 34 px); dialog headings | Used consistently, but at one modest size throughout the council. Nothing after the opening title is larger than 52 px. The decree's heading is the same size as "Propose another" |
| Supporting serif | Cinzel | Names (the opening, the summons, mantles, the guest list); "Victor von Doom"; faction headings; all figures | The strongest face in use. Names feel engraved |
| Technical | Orbitron | Buttons, quiet controls, status tags, step labels, field labels | Correctly small and rare |
| Body | Cormorant Garamond | The summons text; explanatory lines; Doom's proclamations in italic | The day, hour and venue are the most important facts in the product, and they are set at 20 to 22 px italic, the same weight as a line of explanation |
| Doomscript | Traced runes | See 5.2 | Nearly absent |

**Opportunities,** all within the approved faces:

- **Give the proclamation display scale at the decree:** the day on its own line, larger. This changes an approved size, so it needs your sign-off.
- **Let the council title grow on desktop,** where it sits over a much larger hall.
- **Pair each step's heading with its rune band** (5.2), so that display type, serif names and Doomscript appear together on every step, as they do on the summons.

### 5.4 Lighting, depth and atmosphere

| Screen | Light and depth today | Verdict |
|---|---|---|
| Opening | A real light source behind the hand; fog, haze, out-of-focus discs, ash; a vignette; foreground rubble out of focus; a camera settle; parallax | Deep. Nothing to add |
| Summons | Brushed steel with a baked sheen; an emerald glow under the seal; lit runes; the plate on a black ground | Good. It is an object, and it reads as one |
| Council hall strip | Painted window light and shafts, amber lamps, gold step edges; a gradient into the page | Good artwork, shown small and never changing |
| Council body | A flat olive-black ground. Panels are a two-stop gradient with a one-pixel highlight and no shadow. Nothing from the hall's light reaches the interface | **Flat** |
| Decree | As the council body | **Flat** |
| Endings | A flat black ground and one panel | **Flat** |

Where atmosphere would help, in order:

1. **The hall as a lit room behind the council,** not a picture above it (A4).
2. **A response of light when the guest acts** (B2).
3. **The same steel on the panels as on the summons** (B5).

Where it would hurt: behind body text, inside wells and lists, or as anything that loops. The design's rules against glow without a source, against flicker, and against emerald lighting a whole scene are right and should hold.

---

## 6. Critique, screen by screen

### 6.1 Opening

- **Works exceptionally well:** the concealment and recognition, the single light source, the restraint (Doom never moves), and the name appearing before any request.
- **Underdeveloped:** only the rune signature, which is too small to register as writing.
- **Improve:** let the signature be a little larger (D5). Otherwise leave it alone.
- **Biggest lever:** none. This is the benchmark for the rest.

### 6.2 The summons reveal ("Take Your Seat")

I agree with your reading. The causes are specific:

1. **Nothing is behind the doors.** The halves are the plate's picture, and under them is the same picture, blank. Opening them reveals what was already there.
2. **There is no depth.** The halves slide in the plane of the screen, with a soft shadow at the seam. Nothing overlaps, recedes or catches light.
3. **The payoff is instant.** The words switch on in a single frame as the halves meet. The mechanism takes two seconds and its result takes none.
4. **The order is backwards.** The doors move first and the seal wakes afterwards, as an unrelated second act. A lock should release before a door moves.
5. **On a phone the plate is the whole screen,** so the move reads as "the screen splits".
6. **It replays in full on every return visit.**

**Recommended direction: outer doors, inner plate** (B1).

- **Make the two halves a different object from what is behind them:** plain, heavier outer doors, with the raised suit rune (the unused level 3 relief) across the seam as their lock.
- **The lock releases first.** The seal-turn ratchet belongs here.
- **The doors then part fully and stay open.** They carry the rune's two halves with them, come slightly towards the viewer as they go, and cast a shadow on what is behind.
- **Behind them, set back and already inscribed, is the summons plate.** A band of light crosses it as the gap widens, and the words are revealed in place by that light, as the opening's lines are.
- **The seal on the plate then wakes, as now.**

The guest sees a door open onto a document with their name on it, which is what the scene is about. It reuses two existing assets and the opening's own reveal language.

**A lighter alternative: no doors.** The iris opens on the blank plate. The seal wakes first, and the words are then written in place line by line as the edge runes light around the border. It is cheaper and physically honest, but it is not the mechanical reveal you asked for.

**Either way:** play the full reveal once per visit, and a short version on later arrivals (D4).

### 6.3 Council arrival and the hall

- **Works well:** the hall painting itself. Its warm glass against the opening's cold fog is exactly the inside-and-outside contrast the design intends.
- **Underdeveloped:**
  - how little of it is shown;
  - the arrival, where nothing happens;
  - the hall leaving the screen at the first step change;
  - on desktop, a narrow column in a wide empty field.
- **On animating the throne artwork:** I agree with the aim and would be careful with the means.
  - **Doom himself should stay still.** That is a design rule, and it is why he is imposing.
  - **What can move is the room: its light and its air.**
  - **The movement should happen once and then rest.** The design decided against ambient movement in the hall, and accessibility guidance requires that anything moving by itself for more than five seconds can be stopped. That is why the ash stops.
  - **So: an arrival sequence, not a loop.** The camera settles, as in the opening. The floor circle's runes come alight around the ring. The light in the shafts rises to its level. Then stillness.
- **After that, the hall answers the guest.** A single pulse of the floor circle when they approve, claim a mantle, or when the decree stands. Light means something was done.
- **Integrating the interface:** use the upright hall on phones, taller on arrival, with the panels rising over the lower part of the image where the floor is. Keep the hall dimly present behind the steps, not scrolled away.
- **Biggest lever:** A4, then B2.

### 6.4 The proposal and the decree

- **Works well:** dates in words, the count in a well, and the clear split between approving and proposing another.
- **Underdeveloped:** the decree. It deserves one ceremonial beat, the first time a guest sees it and again if it is amended:
  - the active seal, or the mask insignia, as issuer;
  - the proclamation revealed in place, at a larger size;
  - Doom's rune signature lighting;
  - one sound.
  
  After that it is still.
- **Also:** the proposal panel is the natural home for a live rune band (5.2).
- **Biggest lever:** A3. It is the highest-value single addition in the audit, because it lands on the story's climax and every guest sees it.

### 6.5 The mantle

I agree that this has the most room. The specific gaps:

1. **The claim has no moment.** No sound, no change of light, and the confirming line flashes for a frame or two.
2. **The plates' mark says nothing.** Thirty-eight empty squares.
3. **The guest's mantle is not carried forward.** After choosing, it appears only as a small grey line under their name in the guest list.
4. **Factions are labels, not groups.** There is a gold line of text and then more identical plates.

Character emblems are frozen for version 1, and none of the following needs them:

- **A claim ceremony.**
  - On the tap, the plate takes: the square becomes the suit rune, emerald fills the plate (the button's own pressed language, held), and the seal detent sounds.
  - The line "You stand before the council as Loki." is then shown as its own beat for a moment before the page moves on.
  - The floor circle answers.
- **Your mantle as a plate of its own.** While the guest holds one, the top of step 2 shows it large: the full suit rune (the unused level 2), the name in big Cinzel, and YOURS. The list below is then for changing it.
- **The mantle carried forward:** under MANTLE in the step header, and given more weight in the guest's own row.
- **The rune band** "to the viktor go the spoils" over the step, lighting when a mantle is held.
- **Factions framed as groups,** each with a dotted rule and corner bolts, so the list reads as seven rolls of names.

All product behaviour stays as it is: search, taken plates, choose later, changing until the decree, and the race message.

- **Biggest lever:** A2.

### 6.6 Those summoned

- **Works well:** the status marks, the YOU rule, and the long-name handling.
- **Underdeveloped:** Doom's row. A sovereign's row could be set apart, slightly larger or divided from the rest. This is small.
- **Biggest lever:** none of its own. It benefits from A2 and A4.

### 6.7 The endings

- **Works well:** the writing. "So be it." needs nothing added to it.
- **Underdeveloped:** these screens have no object. One still image each would be enough: the dormant seal, with "latveria" engraved beneath. A dormant seal is what the design says a closed thing looks like, and it reveals nothing about any guest on the invalid-link screen.
- **Keep them silent and motionless.** Stillness is right here.
- **Biggest lever:** A6, which is cheap.

### 6.8 Motion consistency and rhythm

- **Abrupt:** the council's step change. A 0.2-second fade and an instant jump of the page is the only place the product behaves like an ordinary web form.
- **Static against their neighbours:** the council arrival, the decree and the endings.
- **Movement with no purpose:** none. Everything that moves is justified, which is a strength to protect.
- **A shared language already exists** in four gestures. The refinements should use only these:
  1. **The camera settles** (the opening): reuse on council arrival.
  2. **A mechanism turns and locks** (the seal): reuse when a step is answered and when a mantle is claimed.
  3. **Text is revealed in place by light** (the opening's lines): reuse for the summons text and the decree.
  4. **Runes light in reading order** (the seal): reuse for the rune bands.
- **Physical connection between scenes:** the iris is the seal's centre, and the seal is on the summons. The council could complete the chain by having the iris open onto the hall's floor circle, which is the same geometry.
- **Rhythm to aim for:** long and cinematic (opening) → a mechanism (summons) → an arrival that breathes for two or three seconds (council) → quick, tactile steps → one ceremonial beat (decree) → stillness (endings).

---

## 7. Audio and musical direction

### 7.1 What exists, and what to keep

| Sound | Verdict |
|---|---|
| `seal-turn` | **Keep.** It is the sound heard when pressing TAKE YOUR SEAT and the other scene-changing buttons, and I believe it is the "button-press sound" you like. Please confirm it is this and not the step-change click |
| `detent` | **Keep.** The step-change click; a good, dry mechanical sound |
| `plate-part`, `plate-close` | **Keep the material, re-time** to whichever summons reveal is chosen |
| `rune-tick` | **Keep, and fix.** Played one per rune as intended, quietly, it will be a ripple instead of a burst |
| `hum` | **Replace.** A pure 55 Hz tone with stacked harmonics swelling over two seconds is a synthesiser "power-up". With the tick burst on top, it is the most tune-like and most artificial thing in the product. I believe this is the "Take Your Seat music" you find gimmicky. Please confirm |
| `hall-room` | **Fold into the score.** It is competent room noise with no character. It is wind, and says nothing of Doom |

### 7.2 Should there be a score?

Yes, with one condition. The design spec currently says "No music bed". I would change that rule deliberately to: **one continuous drone bed, no melody.**

A melody would fight the dry humour and would loop audibly. A drone gives the journey one continuous sound world, which is what the isolated effects lack.

**Character.** Low, slow and nearly still:

- a sustained low fundamental with an open fifth above it;
- a single dark colour note close to the root (a flattened second), which gives the severity without sounding like fantasy adventure music;
- the texture of bowed metal and low brass, not strings and choir;
- no percussion pattern, no arpeggios, no voice.

Regal comes from the weight and slowness of the swells. Ominous comes from the interval. Restrained comes from how little happens.

**Structure: layers, not tracks.** Three stems of the same length, in the same key, started together and looped together. Intensity changes by fading layers in and out, never by starting a new piece, so nothing restarts between scenes.

| Stage | Foundation (low drone) | Hall (air, high glass tones) | Crown (brass-like swells) | One-shots |
|---|---|---|---|---|
| Opening | Silent, by rule | | | None |
| GO WITH HIM, the iris | Fades in over about 2 s | | | Seal-turn |
| Summons | Plays, low | | | The door and seal sounds, as the scene's solo |
| Council | Plays | Fades in | | Detent on steps; a claim tone |
| Decree | Plays | Plays | Fades in, once the decree stands | A single decree sound on first sight |
| Closing, day passed | Fades to silence over about 4 s | | | None. "So be it." in silence |

**Tuning.** The existing one-shots have pitches: the hum sits at 55 Hz, and the impacts at about 62, 96 and 118 Hz. The stems and the remade one-shots should share one key, so that a detent landing over the drone sounds like part of it.

### 7.3 Preventing restarts, gaps, clipping and overlap

- **No restarts.** Scene changes inside the site do not reload the page, and the sound engine already lives outside the scenes, so a bed can play through every iris.
- **No loop gaps.** MP3 files carry silent padding that makes a click at each loop, and older iPhones fall back to MP3. Loop by overlapping two copies with a cross-fade of a few seconds in code, so the file format stops mattering.
- **No clipping.** Give the stems fixed headroom, and lower the bed by a few decibels under the loud one-shots (the plate close, the decree).
- **No overlap pile-ups.** Limit each one-shot to one playing copy, with the rune ticks as the exception.
- **Tab hidden:** fade out, as now. Fade back in on return.

### 7.4 Respecting the guest's choice

Nothing in this changes the rules already built:

- **Nothing plays or loads before the guest chooses sound.** GO WITHOUT SOUND stays completely silent.
- **The SOUND ON / SOUND OFF control stays on every screen** after the opening, and stops everything at once. That meets the requirement that any sound lasting more than three seconds can be stopped.
- **The choice lasts for the visit,** and sound never turns itself on.
- **Reduced motion does not affect sound,** as the design already states.
- **Budget:** three 60 to 90 second stems come to roughly 1 to 1.5 MB, fetched only after the guest opts in and only when each is first needed.

### 7.5 Where the audio should come from

1. **First choice: synthesise it,** as the current sounds are. A drone is exactly what the existing generator can do well: sustained tones, slow filters, noise shaped into air, and a generated reverb. There is no licence to track, and it can be retuned in minutes. Realistic orchestral writing is beyond it, which is one more reason to choose a drone.
2. **If it is not good enough by ear:** a CC0 or properly licensed dark-ambient recording, edited into the same three stems, with its licence recorded in the repository.
3. **Never:** a film score, or anything "in the style of" one closely enough to be mistaken for it.

**Before anything is made, I need from you:** agreement to the rule change (a drone bed, no melody), confirmation of which sound you like and which you find gimmicky, and whether silence on the closing screens suits you.

---

## 8. Prioritized recommendations

Complexity: **S** is hours, **M** is a day or two, **L** is several days. Every item collapses to a 0.2-second cross-fade under reduced motion, and none changes product behaviour.

### A. High-impact refinements

| # | Screen | Problem | Proposed improvement | Reuses | New assets or tooling | Complexity | Risks | Impact |
|---|---|---|---|---|---|---|---|---|
| A1 | Summons, first scene change | Rune ticks fire as one burst; the first iris is silent | Play one tick per rune as designed; make the first seal-turn audible (see C3) | Existing sounds | None | S | None | High for anyone with sound on |
| A2 | Mantle | Claiming has no moment; the claim line only flashes; the mantle is not carried forward | A claim beat (rune, emerald fill, detent, the line shown); a "your mantle" plate; the mantle in the step header and the guest's row | Suit rune levels 1 and 2, the button's fill, copy 5.8, detent | None | M | The beat must be skippable by a tap and must not delay the claim itself | High |
| A3 | Decree | The climax is the plainest state | A one-time decree beat: the issuer's mark, the proclamation revealed in place at a larger size, the rune signature lighting, one sound. Again when amended | Active seal or mask level 2 or 3, the opening's text reveal, `Runes` | Re-encode the mask relief if used; a decree sound (C4) | M | The larger type changes an approved size: your sign-off | Very high |
| A4 | Council | The hall is a small strip, cropped, and gone after one step | The upright hall on phones; a taller arrival; panels rising over the floor; the hall dimly present behind every step | `hall-p-plate.jpg`, `hall-p-doom.webp` (shipped, unused), the wide plate on desktop | None | M | Legibility over the image (panels are opaque, so low); 180 KB more on phones; needs a real-phone check | High |
| A5 | Council panels | No Doomscript after the summons | Live rune bands with one job each (5.2), lighting in reading order when their step is answered | `Runes`, the six inscriptions, the corner bolt | None | M | Overuse: one lit inscription per screen | High for identity |
| A6 | Closing, day passed, invalid link | Bare screens with no object | The dormant seal above the text, "latveria" engraved beneath. No motion, no sound | Dormant seal (exists, unused), `Runes` | None | S | The invalid-link screen must still reveal nothing (a seal reveals nothing) | Medium |

### B. Deeper cinematic enhancements

| # | Screen | Problem | Proposed improvement | Reuses | New assets or tooling | Complexity | Risks | Impact |
|---|---|---|---|---|---|---|---|---|
| B1 | Summons reveal | Doors reveal the same plate; no depth; an instant payoff; the lock comes after the door | Outer doors with the suit-rune lock; the lock releases, the doors part fully onto the inscribed plate, light writes the words, the seal wakes | Summons plates, `suit-rune-level-3.png`, the opening's reveal, existing sounds re-timed | Door faces made from the existing plate texture and rune relief (a baking step, no new painting) | M to L | Phone layout, where the plate fills the screen; needs testing on a slow phone | High |
| B2 | Council arrival | Nothing happens; the hall never changes | A one-time arrival (camera settle, the floor circle lighting, the shafts rising, the title revealed), then one pulse of the circle on approve, claim and decree | Hall plates, the ash tile, CSS light overlays | None | M | Touches the "no ambient movement in the hall" decision. This is a one-time sequence, not a loop, but it needs your agreement | High |
| B3 | Council steps | The step change is a plain fade and a jump | The answered step's mark turns and locks into the suit rune; the next panel is revealed in place; the hall stays in view (with A4) | Seal mark, suit rune, detent | None | S to M | Must stay fast: under 0.5 s | Medium |
| B4 | Scene change | The iris always runs one way | Run it in reverse for decline and leave, as the design specifies | The iris | None | S | None | Low to medium |
| B5 | Panels | Panels are flat gradients beside a textured summons | A small baked brushed-steel tile on panels; corner bolts on the principal panel of each step | The plate's texture, the bolt mark | One baked tile (listed as outstanding in DESIGN.md) | S to M | Contrast behind text: the tile must be very low in contrast | Medium |

### C. Audio

| # | Problem | Proposed improvement | New assets | Complexity | Risks | Impact |
|---|---|---|---|---|---|---|
| C1 | No continuous sound world; the hall tone has no character | A three-stem drone score, layered by stage (7.2), with cross-fade looping | Three stems, synthesised first | M to L | Needs rounds of approval by ear; the "no music bed" rule must change | High with sound on |
| C2 | The hum sounds artificial | Remove it; let the seal waking sit on the drone with the detents and a proper tick ripple; retune the impacts to the score's key | Remade one-shots | S | None | Medium |
| C3 | The first sounds are not ready when first needed | Fetch the two small files for the first scene change (about 22 KB) once the opening has finished drawing, still playing nothing until the guest chooses | None | S | A small relaxation of "nothing loads before the choice". Playing stays forbidden | Medium |
| C4 | Silent milestones | One sound for a mantle claimed and one for the decree | Two one-shots | S | Under two seconds each, by the existing rule | Medium |

### D. Optional polish

| # | What | Complexity |
|---|---|---|
| D1 | Mantle plates in two columns on desktop, to halve the scroll (changes an approved single-column layout) | S |
| D2 | A larger council title on desktop | S |
| D3 | Re-bake the phone summons plate with the mask insignia and legible edge runes, or draw its edge runes live | M |
| D4 | Play the full summons reveal once per visit; a short version afterwards | S |
| D5 | A slightly larger rune signature in the opening | S |
| D6 | Set Doom's row apart in the guest list | S |
| D7 | "justice" and "revenge" engraved at the ends of the step header | S |

### Ranking by impact against effort

1. **A1** — sound defects: tiny effort, immediate gain.
2. **A3** — the decree beat.
3. **A2** — the mantle claim.
4. **A4** — the hall on phones.
5. **A6** — the endings.
6. **A5** — the rune bands.
7. **B2** — the council arrival and response light.
8. **B1** — the summons reveal.
9. **C1 with C2** — the score.
10. **B3, B5, C3, C4, B4** — supporting work.
11. **D1 to D7.**

---

## 9. Proposed implementation sequence

Each phase stands alone, ships to a preview deployment from the `creative-refinement` branch, and is reviewed on a real phone before the next begins. Nothing reaches `main` until you approve it.

| Phase | Contents | Why here |
|---|---|---|
| 0 | A1, C3: the sound defects | A fix, not a design change. It makes the existing sound fair to judge |
| 1 | A4, then B2: the hall as the council's room, its arrival and its response light | Everything else in the council sits on this |
| 2 | A2, B3: the mantle claim and the step change | The most-used interactions |
| 3 | A3, A6, C4: the decree beat, the endings, their two sounds | The climax and the exits |
| 4 | A5, B5: rune bands and panel material | Best done once the panels' final places are known |
| 5 | B1, B4, D4: the summons reveal and the iris direction | Self-contained; the largest single piece of motion |
| 6 | C1, C2: the score | Can start in parallel from phase 1, since approval by ear takes several rounds |
| Last | D items you want | |

### Decisions needed from you before any of this starts

1. **Which recommendations to pursue.** That is the point of reviewing this together.
2. **The hall.** A one-time arrival sequence and a response light, against the standing decision of "no ambient movement in the hall".
3. **Sound.** Changing "no music bed" to "one drone bed, no melody"; which sound you like and which you find gimmicky; silence on the closing screens.
4. **Doomscript.** The one-job-per-inscription scheme in 5.2, which puts the approved inscriptions in new places.
5. **Type.** A larger proclamation at the decree.
6. **The summons reveal.** Outer doors (B1), or the lighter no-door version.

### What stays untouched under every recommendation

- The palette, the four typefaces, the artwork, the mask, the suit rune, the seal and the Doomscript glyphs.
- The opening.
- Every product behaviour and every word of approved copy.
- Name-only characters: no character emblems.
- Doom never moves, never speaks and never has lit eyes.
- No third-party requests.
- Reduced motion and silent mode lose nothing.
