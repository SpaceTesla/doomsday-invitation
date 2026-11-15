# Local reference image analysis: Doctor Doom / Latveria invitation experience

Scope: all seven images under `C:\Users\shiva\Desktop\Projects\doomsday-invitation\references\`, each opened and viewed individually on 2026-11-15, plus a cross-image synthesis. Research only; nothing in `references\` was modified.

Evidence labels used throughout:
- **Observed** = seen directly in the image (or an enlarged crop of it).
- **Measured** = computed from the file (dimensions, bytes, colour bins). Colour method: each image decoded read-only, downsampled to 96 x 96, pixels binned at 3 bits per channel, mean colour per bin reported. Shares are approximate and describe area, not importance.
- **By eye** = hex value estimated visually for a small accent the binning did not isolate. Treat as plus or minus a few percent per channel.
- **Inferred** = my interpretation; lives in the Inferences subsection.

Source convention: for the per-image sections every bullet is sourced to the named local file unless a web link is given.

---

## Library inventory, technical specifications and viewability

### Takeaway
All seven images were viewable (the `.webp` decoded natively, no conversion needed). The library is small, low-resolution and almost entirely film-derived: only one file (`doom-throme-wide.png`, 2880 x 1220) is large enough to study at detail, and `references\inspiration\` exists on disk but is empty.

### Cited Findings

| File | Pixels | Aspect (w:h) | Size | Orientation | Mean luma (0-255) | Pixels darker than luma 40 |
|---|---|---|---|---|---|---|
| `references\character\doom-1.png` | 388 x 515 | 0.753:1 (about 3:4) | 187.8 KB | Portrait | 53.1 | 50% |
| `references\character\doom-2.png` | 463 x 662 | 0.699:1 (about 7:10) | 421.1 KB | Portrait | 91.7 | 24% |
| `references\character\doom-3.png` | 454 x 676 | 0.672:1 (about 2:3) | 179.5 KB | Portrait | 25.3 | 82% |
| `references\character\doom-4.jpg` | 872 x 1699 | 0.513:1 (about 1:1.95) | 165.4 KB | Tall portrait banner | 36.5 | 73% |
| `references\environment\doom-castle.webp` | 1600 x 670 | 2.388:1 (scope) | 32.7 KB | Ultrawide landscape | 44.5 | 67% |
| `references\environment\doom-throme.jpg` | 736 x 1308 | 0.563:1 (9:16) | 186.8 KB | Phone portrait | 69.3 | 48% |
| `references\environment\doom-throme-wide.png` | 2880 x 1220 | 2.361:1 (144:61) | 2,301.8 KB (2.25 MB) | Ultrawide landscape | 46.4 | 62% |

- Measured: all values above come from a read-only decode of each file with the Windows imaging codecs.
- Observed: `references\inspiration\` **exists as a directory but contains zero files**. The brief said it does not exist; the practical result is the same (no inspiration references), but the folder is present and empty.
- Observed: the `references\` tree contains exactly three subfolders (`character`, `environment`, `inspiration`) and exactly the seven files listed. No sidecar text, credits or licence files.
- Observed: two filenames are misleading. `doom-castle.webp` is an interior hall with a tapestry, not a castle exterior. `doom-throme*.` is a misspelling of "throne".
- Measured: `doom-throme-wide.png` is stored at 192 dpi in BGRA with a thin black strip along its top edge (roughly 1% of height, judged visually).
- Measured: `doom-castle.webp` stores 1.07 megapixels in 32.7 KB, which is very heavy compression.
- Tooling: Python 3.13 is installed but Pillow is not; ffmpeg and ImageMagick are not on PATH. Measurement and crops were done with built-in PowerShell/.NET imaging. Nothing was installed.

### Inferences
- The 192 dpi PNG is almost certainly a HiDPI screen capture of a video player, so its true detail is that of the underlying video frame, lower than 2880 px suggests. Edges look soft at 100%, consistent with this.
- Four of seven files have widths of 388 to 463 px. They look like search-result or social-media thumbnails saved as-is. None of the character images is usable as final art at any modern viewport size.
- The 736 x 1308 size of `doom-throme.jpg` matches a common Pinterest export size, suggesting it was saved from a wallpaper pin.

### Gaps
- No provenance metadata was found for any file, so origins below rest on visible content and limited web corroboration.
- I did not attempt reverse image search; exact sources for `doom-1`, `doom-2` and `doom-3` remain unidentified.

---

## Image 1: `references\character\doom-1.png` (theatrical-style poster, figure in green smoke)

### Takeaway
A low-resolution film poster showing the hooded, armoured figure as a near-silhouette rising out of olive-green smoke with the cape flared into a wide triangle. Its value is atmosphere and silhouette, not detail: it is the best single reference for "imposing figure emerging from haze".

### Cited Findings
1. **What is depicted (Observed).**
   - Frontal standing figure seen from a slightly low camera angle, arms hanging at the sides with gauntleted fists, legs disappearing into smoke around the shins.
   - Deep hood in very dark green. The face is almost entirely in shadow: only a faint metallic highlight down the nose and cheek reads as a mask. No eyes are visible.
   - Two round disc clasps at the collarbones joined by a chain across the upper chest.
   - Cuirass or tunic front built from a grid of small square tiles with engraved geometric centres.
   - Layered, segmented dark pauldron on the viewer's right shoulder; an olive-yellow cloth band wrapped around that upper arm; ridged dark gunmetal forearm guards on both arms.
   - A broad multi-strap belt; split tunic skirt; armoured legs with small pale rectangular highlights on the viewer's left shin.
   - Cape billows outward on both sides, forming a broad dark triangle that fills the lower half of the frame.
   - Text and marks: a white "glamsham" watermark top-left; a small red-and-white Marvel Studios logo bottom-centre; tagline "12.18.26 IS DOOMSDAY" in a wide-tracked, squared, extended sans, with "12.18.26 IS" in pale white-green, "DOOMSDAY" in green, and the Avengers "A" emblem standing in for the letter A.
   - Interpretation resembled: film/MCU-style. The disc clasps, chain and tile cuirass match the design in `doom-2.png` and `doom-4.jpg`.
2. **Colour (Measured unless noted).**
   - `#081010` near-black teal, 36.7% of area.
   - `#13261B` and `#192E24` deep forest green, about 17% combined.
   - `#344930` and `#283828` muted mid green, about 18% combined.
   - `#707946` and `#8F8E53` olive to khaki smoke, about 10% combined.
   - `#A39958` brightest smoke highlight (0.4%).
   - By eye: tagline green about `#3DAA4E`; Marvel red about `#C8102E`; gold rim light about `#B89A4A`.
   - Green here is yellow-leaning and desaturated (the most saturated bins sit at only 41 to 46% saturation). There is no pure emerald anywhere except the tagline.
   - Balance: warm olive-yellow on the left third, cooler teal-black on the right and upper right. Metal reads as dark gunmetal with a thin brass-gold edge light.
3. **Lighting and shadow (Observed).**
   - The smoke itself is the light source: brightest behind and to the left of the figure, so the figure is effectively backlit.
   - A narrow warm gold rim light traces the viewer's left edge (shoulder, upper arm, forearm, thigh).
   - The face is deliberately underexposed under the hood.
   - Soft, diffuse shadows; no hard cast shadows. Heavy volumetric smoke covers the whole frame and swallows the feet.
   - Measured: mean luma 53/255, 50% of pixels below luma 40, 0% above 180. A low-key image with no true highlights.
4. **Materials and textures (Observed, limited by resolution).** Matte heavy cloth for hood and cape; dark satin-finish plate; tile cuirass with slightly raised relief; cloth arm wrap. Fine texture (weave, rivets, engraving) is not resolvable at 388 px.
5. **Architecture and ornament (Observed).** No architecture. Ornament is limited to the two disc clasps, the chain and the tile grid.
6. **Composition and framing (Observed).**
   - Single centred vertical figure occupying roughly the middle 60% of the width, from about 5% to 90% of the height.
   - Low angle makes the figure loom.
   - Negative space: both upper corners (smoke) and the bottom 15% band, already occupied by the tagline.
   - Portrait-native. A landscape use would need the smoke extended sideways, which is visually easy because the background has no structure.
7. **Emotional atmosphere.** Menace, arrival, inevitability. The hidden face makes it read as an apparition rather than a person.
8. **Potential applications and limitations.**
   - Mood reference for a "figure emerges from fog" reveal moment.
   - Silhouette reference: hood peak, broad shoulders, triangular cape.
   - Source for the olive-smoke end of the palette.
   - Reference for how the film's marketing letter-spaces its date line.
   - Limitations: 388 x 515 px; third-party watermark; Marvel Studios and Avengers marks; real release date text. Depicts Marvel/Disney-owned character design. Reference only.

### Inferences
- The watermark indicates the file was saved from Glamsham, an entertainment news outlet, not from a studio source.
- Whether this is an official one-sheet or a fan-made poster is **unknown**. The official teaser poster described by the press shows a different composition: Doom "with his back to the camera, looking at an ornate tapestry on a wall" — [Nerdist, 20 July 2026](https://nerdist.com/article/new-avengers-doomsday-poster-hints-at-doctor-doom-tragic-history/). This image is therefore not that poster.
- The 18 December 2026 date on the poster matches the film's reported release date — [Den of Geek, 20 July 2026](https://www.denofgeek.com/movies/avengers-doomsday-trailer-breakdown-doctor-doom-x-men-captain-america-returns/).
- Nothing I can see proves or rules out AI generation. The softness could equally come from heavy downscaling and recompression.

### Gaps
- Origin and authorship unconfirmed. Mask design unreadable. Leg and boot design unreadable.

---

## Image 2: `references\character\doom-2.png` (close-up of mask, hood and medallions under green light)

### Takeaway
The only close-up in the library, and the best source for mask construction, medallion motifs, chain and tile-cuirass detail. Its colour is unreliable: everything is washed in saturated green display light against a multicoloured backdrop that conflicts with the cinematic palette.

### Cited Findings
1. **What is depicted (Observed).**
   - Bust-length close-up, three-quarter view turned slightly to the viewer's right, camera slightly below eye level.
   - **Mask:** polished silver-steel faceplate built from separate plates. A forehead plate with a centre seam; angular brow ridges; rectangular eye openings that are completely dark; a sharply ridged nose plate; separate cheek plates with visible seam lines; a horizontal rectangular mouth slot set in a downturned grimace. Rows of small rivets follow the brow line, the cheek edges and the jaw.
   - **Hood:** thick green cloth with a visibly coarse weave and a heavy rolled edge, deep enough to shadow the sides of the mask. A matching cowl wraps the neck in heavy folds.
   - Dark chainmail is visible at the throat under the chin.
   - **Clasps:** two large round medallions at the collarbones. Viewer's left: a many-pointed radiating star or sunburst, apparently with a small reddish centre point (uncertain at this resolution). Viewer's right: a geometric square-and-cross motif inside a beaded or rope border. The two motifs are deliberately different.
   - A heavy oval-link chain hangs between the medallions.
   - **Cuirass:** a grid of square tiles, each embossed with a concentric square-in-rotated-square (diamond) motif, separated by narrow bands with fine hatching. About eight columns and four rows are visible.
   - Background: flat backlit colour panels in blue, orange-yellow and lime green, divided by dark bars.
   - Interpretation resembled: film/MCU-style costume.
2. **Colour (Measured unless noted).**
   - `#0E1211` near-black, 16.3%.
   - `#293328` and `#18261B` dark green shadow, about 13%.
   - `#2F4E34`, `#4C714E`, `#508C56`, `#388B50` mid emerald greens, about 20% combined. These are the most saturated cloth greens in the whole library.
   - Background accents: `#91CC0A` lime (95% saturation), `#C48C12` amber (91% saturation). By eye: backdrop blue about `#3A4FB0`.
   - By eye: mask highlights about `#C9D6C6`, with a faint lilac reflection on the lower cheek.
   - Balance: overwhelmingly green, with warm and blue accents confined to the backdrop. Metal reads as bright silver tinted green by the light.
   - Measured: mean luma 91.7/255, the brightest image in the set; only 24% of pixels below luma 40.
3. **Lighting and shadow (Observed).** Frontal and overhead display-style lighting with a strong green cast. Crisp specular highlights on forehead, nose bridge and cheek plates. Deep shadow inside the hood and eye openings. No haze, no rim light, no volumetrics.
4. **Materials and textures (Observed).**
   - Mask: polished, lightly brushed metal; rivets are regular and proud of the surface.
   - Hood and cowl: heavy woollen weave, matte.
   - Medallions: cast metal with an aged pewter-silver finish and darkened recesses.
   - Chain: thick oval links, same aged finish.
   - Cuirass tiles: crisp embossed relief; could be stamped metal or tooled leather, impossible to tell under this light.
5. **Architecture and ornament (Observed).** No architecture. The ornamental vocabulary is fully legible here: rivet lines, concentric squares, diamonds, a radiating star, a beaded border.
6. **Composition and framing (Observed).** Tight crop; mask in the upper-centre third; medallions and chain form a strong horizontal across the lower third. No negative space and no room for text. Portrait only.
7. **Emotional atmosphere.** Cold, severe, confrontational. The empty eye openings read as lifeless rather than mysterious, and the bright backdrop removes any sense of dread.
8. **Potential applications and limitations.**
   - Detail reference for redrawing original ornament: tile pattern, medallion construction, chain scale, rivet spacing.
   - Reference for how thick the hood fabric should feel.
   - Limitations: 463 x 662 px; colour not trustworthy as a palette source; backdrop is off-direction. Depicts Marvel/Disney-owned costume design. Reference only.

### Inferences
- This looks like a photograph of a **physical costume or life-size figure on display** rather than a film still or painted art: the eye openings are empty, the lighting is flat and coloured like an exhibition stand, and the backdrop is a graphic panel. Confidence: moderate.
- I see no typical AI artefacts: rivets are evenly spaced, chain links are consistent, tile motifs repeat correctly. That supports a real photograph. Confidence: moderate.
- The differing left and right medallions suggest the two discs carry distinct symbols in the film design. Their meaning is unknown.

### Gaps
- Origin (event, photographer) unknown. True surface colours of the tiles and medallions cannot be determined under the green light.

---

## Image 3: `references\character\doom-3.png` (full-body, arms crossed, dark hall)

### Takeaway
The only full-body, head-to-toe view, useful for proportions and the complete silhouette. It is also the weakest image stylistically: near-monochrome, airbrushed, with a generic background, and it appears to be a derivative rendering rather than studio art.

### Cited Findings
1. **What is depicted (Observed).**
   - Full-length frontal figure standing with feet apart and arms crossed high on the chest.
   - Dark green hood and a floor-length cloak hanging straight to the ankles.
   - Steel mask with rivets across the forehead, a rectangular mouth slot and a frown. **Human eyes are visible** in the eye openings.
   - Two disc clasps: viewer's left shows a star in a circle; viewer's right shows a square-cross motif. The chain is hidden by the arms.
   - Oversized smooth plate forearm guards with a row of small perforations and layered segments; chainmail sleeves at the elbows; articulated finger plates on the visible hand.
   - Tile cuirass with diamond motifs visible below the arms.
   - A plain, wide black belt with a round ring-shaped buckle.
   - Knee-length dark green tunic with a centre split; polished dark steel greaves with knee plates; segmented armoured boots.
   - Setting: a nearly black hall with faint column shapes at both edges and a floor of large rectangular flagstones with a slight wet sheen.
   - Interpretation resembled: film/MCU-style costume, rendered as a smooth digital painting.
2. **Colour (Measured).**
   - `#0B1010` near-black, 74.2% of area.
   - `#2B302F` charcoal, 14.1%.
   - `#1C2423` and `#17211D` barely-green black, about 5%. These are the cloak; maximum channel spread is only about 10 levels.
   - `#494E4D`, `#6C7070`, `#8F9394`, `#ABB1B1` cool steel greys, about 4% combined.
   - Green is present in name only. This is the most desaturated image in the library. Balance is cool-neutral with no warm tones at all. Metal is cold blue-grey steel.
3. **Lighting and shadow (Observed).** A soft key from above and in front lights the mask, forearms and boot tops, then falls off quickly to black. Faint reflection on the floor under the boots. Heavy vignette. No rim light, no coloured light, no visible haze. Measured: mean luma 25.3/255, 82% of pixels below luma 40.
4. **Materials and textures (Observed).** Smooth, airbrushed metal with soft gradients; chainmail rendered as fine uniform texture; cloth with almost no visible weave; stone floor with simple joint lines. Little wear or patina anywhere.
5. **Architecture and ornament (Observed).** Plain flagstone floor and indistinct columns. No carving, glass or decoration.
6. **Composition and framing (Observed).**
   - Perfectly centred and symmetrical. The figure reads as a tall dark slab.
   - Roughly a quarter of the width on each side is empty darkness, plus clear space above the hood.
   - Text could sit to either side or above. Because the background is near-black, the image could be floated on a black landscape canvas without visible seams.
7. **Emotional atmosphere.** Stern, judgemental, static. The crossed arms read as refusal or appraisal rather than welcome.
8. **Potential applications and limitations.**
   - Proportion and full-silhouette reference (cloak length, boot design, stance).
   - Reference for a "figure in the void" layout with side text.
   - Limitations: 454 x 676 px; generic environment; palette offers nothing. Derived from Marvel/Disney-owned design; authorship unknown. Reference only.

### Inferences
- The pose, mask, gauntlets and clasps closely match the upper body of `doom-4.jpg`, but the belt differs (plain belt with ring buckle here; wide ribbed belt with rectangular lattice buckle there). This suggests a **fan-made or AI-assisted re-rendering and full-body extension of the promotional art**, not an official piece. Confidence: moderate.
- Supporting signs: uniform airbrushed smoothness, simplified accessories, a featureless background, and thumbnail resolution.
- The visible eyes make the figure more human and less mysterious, which works against the stated "mysterious" direction.

### Gaps
- Artist and origin unknown. Cannot confirm whether AI tools were used.

---

## Image 4: `references\character\doom-4.jpg` (tall promotional banner, arms crossed, green glass behind)

### Takeaway
The most detailed and most "official-looking" character image, and the only one that links the costume to the architectural setting (green leaded glass behind the figure). It appears to be a photograph of a printed or backlit banner, so colour and sharpness are compromised.

### Cited Findings
1. **What is depicted (Observed).**
   - Low-angle three-quarter view cropped from the top of the hood to the upper thighs, arms crossed.
   - **Mask:** forehead plate with a central vertical seam and angled brow panels; dotted rivet lines along the brow and down the cheeks; inset vertical cheek guards; rectangular mouth slot. Human eyes and a little surrounding skin are visible in the openings.
   - Dark green hood and cowl with a soft, velvety fall.
   - One disc clasp is visible, bearing a squared geometric relief (similar to the square-cross medallion in `doom-2.png`).
   - A very large forearm guard crosses the frame, with rows of small rivets or perforations and stepped plate edges.
   - Chainmail sleeve at the elbow, finished with a metal band engraved with a zigzag or triangular pattern.
   - Tile cuirass with diamond-in-square motifs.
   - A wide belt of horizontal ribs with a rectangular silver buckle that has lattice-like crossed corners.
   - Dark green tunic below; a faint embossed tile panel is visible low on the skirt.
   - Background: lime-to-yellow-green textured glass panels separated by dark curving bars.
   - A monochrome white "MARVEL STUDIOS" logo fills the bottom of the frame.
   - The picture content occupies only the middle of the file: there are black bars of roughly 14% of the width on each side and a black band behind the logo.
   - Interpretation resembled: film/MCU-style.
2. **Colour (Measured unless noted).**
   - `#0A0808` warm black, 65.8% (includes the black bars).
   - `#322C2C`, `#534B4F`, `#71696F` warm charcoal to mauve-grey, about 13%.
   - `#948A91`, `#B5ACB2`, `#D3CBD0` pale mauve-silver metal highlights, about 3.5%.
   - `#F4F0F3` logo white, about 1%.
   - `#485511` dark lime (80% saturation); by eye the brightest glass is about `#9DBA28`.
   - By eye: cloak about `#1A2416`.
   - Metal carries a pinkish-mauve cast, unlike the neutral or green-tinted steel in the other images.
   - Balance: neutral-warm metal against a sharp yellow-green background. Green appears as glowing glass, not as cloth.
3. **Lighting and shadow (Observed).** Strong key from the upper left and front creates hard, bright speculars along the forearm guard and mask. Blacks are crushed. The glass behind acts as a backlight and separates the hood from the background. No haze. Measured: mean luma 36.5/255, 73% below luma 40.
4. **Materials and textures (Observed).** Highly polished plate with crisp edge highlights; clearly resolved interlocking chainmail rings; engraved band; ribbed belt (leather or stacked metal bands); velvet-like hood; granular, mottled glass. A fine print or screen texture is visible across the whole image.
5. **Architecture and ornament (Observed).** The background panels have curved dark dividers and mottled green-yellow glass, the same character as the throne-room windows in `doom-throme-wide.png`. Costume ornament: diamonds in squares, zigzag band, lattice buckle, rivet lines.
6. **Composition and framing (Observed).** Tall, narrow, low-angle crop that makes the figure tower. The crossed forearms form a heavy horizontal bar across the middle. The mask sits in the top quarter. No negative space; the only clear area is the logo band. Strictly portrait.
7. **Emotional atmosphere.** Authority, contempt, power held in reserve. The low angle puts the viewer physically beneath the figure.
8. **Potential applications and limitations.**
   - Best costume-detail reference for gauntlet, chainmail, belt and mask plating.
   - Demonstrates how the figure can be staged against glowing green glass.
   - Limitations: usable picture area is roughly 630 px wide; print texture and colour cast; prominent Marvel Studios logo. Almost certainly studio-owned promotional art. Reference only.

### Inferences
- The print texture, pink colour fringing and black surround suggest a **photo of a printed or backlit display banner**, later cropped. Confidence: moderate.
- This is consistent with press reports that promotional artwork showing the costume was "revealed at a Disney marketing expo in China", described as "a gleaming silver mask, heavy armor, and a flowing green cloak, combined with scarred facial details" — [The Express Tribune, 12 September 2025](https://tribune.com.pk/story/2566374/robert-downey-jr-doctor-doom-first-look-revealed-in-full-promo-art-at-disney-expo). I cannot confirm this file is that exact artwork, and that article does not state Marvel confirmed the art as official.
- The mauve metal tone is probably a capture artefact, not a design intent, since no other image shows it.

### Gaps
- Exact source and capture conditions unknown. True colour of the metal and glass cannot be recovered from this file.

---

## Image 5: `references\environment\doom-castle.webp` (hall with giant tapestry and distant sunlit chamber)

### Takeaway
A wide cinematic interior, not a castle exterior: a tiny cloaked figure touches an enormous tapestry lit by a single warm pool of light, while a sunlit, glass-walled hall glows through an opening on the left. It is the best reference for scale, melancholy and warm practical lighting, but the file is too compressed for anything beyond mood.

### Cited Findings
1. **What is depicted (Observed).**
   - **Right half:** a tapestry several times taller than the figure. It shows a woman in a head covering embracing a child, standing above a large sphere wrapped in golden clouds, with dark foliage or tree forms around it and a decorative border.
   - A small hooded, cloaked figure stands at the foot of the tapestry, seen from behind and to the side, one armoured hand raised to touch the fabric. The figure is about one fifth of the frame height.
   - **Left third:** a tall dark opening leads up a broad flight of steps to a bright hall with floor-to-ceiling windows. The window leading runs in curved, organic lines. A very large tiered chandelier or lantern, built of rows of small glowing elements, hangs in that hall. The far floor is polished and reflects the windows.
   - Three tall floor lamps: dark columns topped with shallow, translucent bowl shades held in dark metal leaf-like mounts, glowing warm cream.
   - Foreground: a dark curved rail or furniture edge at the bottom, and a faint circular floor pattern bottom-left.
   - Interpretation resembled: film/MCU-style, photoreal.
2. **Colour (Measured unless noted).**
   - `#10110D` warm near-black, 53.6%.
   - `#2B281B` and `#221E15` dark umber, about 12%.
   - `#2D3324` and `#1C231C` dark olive green, about 13%.
   - `#4E4B2D` and `#6B5430` olive-bronze and brown, about 6%.
   - `#8F6B34`, `#B08D50`, `#CBB373` amber to pale gold, about 1.6%.
   - `#B0AD73` and `#CEC891` pale yellow-green window light, about 2%.
   - By eye: a small patch of blue glass about `#3A6FA8` near the window arch.
   - Balance: the warmest image in the set. Gold and amber on the right, yellow-green haze on the left. Green is present only as tinted light and haze, at low saturation (about 30 to 35%). The only metal visible is a glint on the figure's arm.
3. **Lighting and shadow (Observed).**
   - Three motivated sources: daylight through the far windows, the bowl lamps, and a tight warm spot on the centre of the tapestry and the figure.
   - Broad volumetric shafts fall diagonally from the upper left through the opening.
   - The spot creates a pale pool on the floor and a short, soft-edged shadow behind the figure.
   - Everything outside these pools falls to near-black. Measured: mean luma 44.5/255, 67% below luma 40, 4% above 180.
4. **Materials and textures (Observed, limited by compression).** Woven tapestry with a matte, slightly faded surface; translucent stone-like or frosted-glass lamp bowls; dark smooth stone walls and piers; polished reflective floor in the far hall; pale carpet or stone under the figure.
5. **Architecture and ornament (Observed).**
   - Monumental scale: wall surfaces are plain and massive, without carved decoration.
   - Windows with flowing, curved leading rather than pointed Gothic tracery.
   - Lamp design repeated identically three times here and again in `doom-throme-wide.png`.
   - The tapestry is the single large ornamental object and carries narrative imagery.
6. **Composition and framing (Observed).**
   - Asymmetric two-part layout: bright deep space on the left, flat lit tapestry on the right.
   - The figure sits at roughly 58% across and 80% down, very small.
   - Dark, text-safe areas: the left 12% of the width, the right 20%, and the lower-left corner.
   - A portrait crop of the tapestry and figure (about 45% to 85% of the width) would work compositionally but yields only about 640 x 670 px.
7. **Emotional atmosphere.** Grief, memory, solitude, reverence. This is the only image in the library that is tender rather than threatening.
8. **Potential applications and limitations.**
   - Mood reference for a quiet, intimate scene or a transition between spaces.
   - Reference for warm practical lighting, for lamp design, and for using a tapestry as a storytelling surface.
   - Reference for scale contrast (tiny figure, vast wall).
   - Limitations: 32.7 KB for 1600 x 670 px, so fine detail is destroyed; ultrawide only. Film frame, studio-owned. Reference only.

### Inferences
- This is very likely a **frame from the official *Avengers: Doomsday* trailer**. Press coverage describes exactly this beat:
  - Doom "despondently looking up at a tapestry in his throne room depicting what appears to be a mother and son", an image that also "comprises the official teaser poster" — [SYFY Wire, 17 August 2026](https://www.syfy.com/syfy-wire/new-avengers-doomsday-footage-hints-at-doctor-doom-motivation).
  - A "medieval-looking" tapestry showing "what looks like a mother and her child, hovering above the Earth, surrounded by angels", which "also shows a cracked world" — [Nerdist, 20 July 2026](https://nerdist.com/article/new-avengers-doomsday-poster-hints-at-doctor-doom-tragic-history/).
  - "The film then cuts to Doom studying a woven hanging depicting a woman and a child" — [eGamers, 15 August 2026](https://egamers.io/avengers-doomsday-7-things-the-new-d23-trailer-reveals-about-doctor-doom/).
- The sphere in the tapestry is therefore most likely Earth. I could not make out angels or a crack with confidence at this file's quality.
- The 2.39:1 ratio and the matching lamps tie this hall to the same building as the throne room.
- The architecture reads as Art Nouveau glazing inside a severe, monumental shell. It is not conventionally Gothic.

### Gaps
- Who the tapestry depicts is unconfirmed; Nerdist reports only that "early reports suggest" Doom's wife and son — [Nerdist](https://nerdist.com/article/new-avengers-doomsday-poster-hints-at-doctor-doom-tragic-history/).
- Sources differ on which trailer the scene comes from. Den of Geek covered "the first trailer" on 20 July 2026 — [Den of Geek](https://www.denofgeek.com/movies/avengers-doomsday-trailer-breakdown-doctor-doom-x-men-captain-america-returns/); SYFY says the footage first appeared at "Comic-Con's Hall H last month" and played at D23 on 14 August before going online — [SYFY Wire](https://www.syfy.com/syfy-wire/new-avengers-doomsday-footage-hints-at-doctor-doom-motivation).
- I could not verify that the file is an unaltered frame.

---

## Image 6: `references\environment\doom-throme.jpg` (throne room, 9:16 portrait)

### Takeaway
A phone-format view of the throne room with the figure seated, head bowed, beneath a throne back that rises out of frame like a spire. It is the best template for a mobile hero composition, but its colour is pushed much more yellow and contrasty than the wide version of the same scene.

### Cited Findings
1. **What is depicted (Observed).**
   - Strictly symmetrical view up a flight of shallow steps to a throne.
   - **Throne:** a monolithic seat whose back tapers upward and continues beyond the top of the frame. Stepped, angular shoulders flank the seat. A thin vertical slit of amber glass runs up the centre of the back. Directly above the sitter's head is a gold-bordered panel containing dark filigree in a cross or diamond arrangement, with tiny marks down its side borders. Long, flat armrests extend horizontally to both sides like blades.
   - **Figure:** seated, leaning slightly forward, forearms on thighs and hands together in the lap, head bowed, hood up. The face is completely dark. Light catches the shin armour, boots and a medallion.
   - **Windows:** two very tall windows flank the throne, with leading that runs in long asymmetric curves. The glass is pale cream-yellow, streaked and mottled with green as if weathered.
   - **Steps:** about seven or eight broad steps, each with a bright gold-lit edge.
   - **Floor:** dark and polished, with bright green sparks and glowing lines along inlaid seams.
   - Interpretation resembled: film/MCU-style scene with a stylised, heightened grade.
2. **Colour (Measured unless noted).**
   - `#0D1008` green-black, 32.9%.
   - `#2D2B13` dark olive-brown, 15.8%.
   - `#182814` and `#314826` deep green, about 8%.
   - `#505228`, `#4E4919`, `#726A2C` olive to bronze, about 8%.
   - `#B19232` and `#CBA838` saturated gold (72% saturation), about 1.7%.
   - `#E9D375`, `#E9DA8D`, `#F4E9AE` pale yellow glass, about 6.6%.
   - By eye: floor energy about `#5FD92E`.
   - Balance: strongly warm. Yellow and gold dominate; green lives in the shadows, the glass streaks and the floor. Measured: 12% of pixels are brighter than luma 180, the highest share in the set, and mean luma is 69.3/255.
3. **Lighting and shadow (Observed).** The windows are the key light, placed directly behind the subject, so throne and figure are silhouettes with thin edge highlights. Soft golden rays enter from both upper corners. Step edges catch light as bright horizontal lines. The floor glow is a separate, self-lit green source. Very high contrast.
4. **Materials and textures (Observed).** Dark bronze or aged-metal throne with sharp machined edges; streaked, textured glass; polished stone steps with metallic edging; glossy dark floor. Textures look smeared and painterly at full size.
5. **Architecture and ornament (Observed).**
   - Extreme verticality: throne back and windows all run past the top of the frame.
   - Window leading in sweeping Art Nouveau curves.
   - Throne geometry is angular and stepped, closer to Art Deco.
   - Ornament is concentrated in one place: the gold filigree panel above the head.
6. **Composition and framing (Observed).**
   - One-point symmetry with the figure at the exact horizontal centre, about 60% down the frame.
   - The steps act as leading lines and as a dark base.
   - Text-safe areas: the bottom 25% (steps and floor) is dark and orderly; the upper centre (throne back) is a dark vertical band about 20% wide. The window areas are too bright and busy for text.
   - Native 9:16, so it maps directly to a phone screen. Not usable for landscape.
7. **Emotional atmosphere.** Solemn, sacred, weary. The bowed head suggests brooding or mourning rather than command; the setting reads like a cathedral.
8. **Potential applications and limitations.**
   - Layout template for a portrait hero: figure centred, steps as a base, title over the lower dark band.
   - Reference for the throne's design and for step-edge lighting.
   - Limitations: 736 x 1308 px; heavily regraded and sharpened; colour disagrees with `doom-throme-wide.png`. Derived from studio-owned footage. Reference only.

### Inferences
- This is the same scene as `doom-throme-wide.png`, but it shows roughly half as much again in vertical extent for the same width. It therefore comes either from a taller official version of the shot (for example a vertical social-media cut) or from a fan edit that extended the frame. I cannot tell which.
- The much yellower, higher-contrast grade and painterly texture suggest a **fan-made wallpaper edit**, possibly AI-upscaled. Confidence: moderate.
- Treat the wide PNG, not this file, as the authority on colour.

### Gaps
- Source of the vertical framing is unknown. Fine ornament on the throne panel is not legible.

---

## Image 7: `references\environment\doom-throme-wide.png` (throne room, ultrawide film frame)

### Takeaway
The strongest image in the library: the highest resolution, the only one showing the whole throne room, and the clearest statement of the film's environment language (Art Nouveau glass, monumental piers, crossing light shafts, a glowing green floor glyph). It should be the primary anchor for setting, palette and lighting.

### Cited Findings
1. **What is depicted (Observed).**
   - A wide, symmetrical view of a throne room.
   - **Centre:** the throne on a stepped platform of about eight steps, with the same seated, bowed, hooded figure as in `doom-throme.jpg`. The gold-bordered filigree panel sits above the head and the amber glass slit runs up the throne back.
   - **Flanking:** massive square piers on plinths; behind them, tall windows with curving organic leading and pale green-yellow glass.
   - **Outer bays:** narrow, tall windows of stained glass in teal and turquoise with stacked amber-orange geometric motifs, like stylised flowers or torches.
   - Large dark diagonal masses sweep down from the upper centre to each side (drapery or angled structure; not clear which).
   - Two floor lamps with glowing bowl shades at the far left and far right, identical in design to those in `doom-castle.webp`.
   - **Floor:** dark polished stone inlaid with a large circular geometric design of intersecting straight lines and radial segments, with polygonal plaques bearing emblem-like marks in the left and right foreground. The inlay lines glow bright green and throw up sparks.
   - Interpretation resembled: film/MCU-style, photoreal film frame.
2. **Colour (Measured unless noted).**
   - `#0D0F0A` near-black, 46.6%.
   - `#292B19` dark olive, 11.5%.
   - `#192618` and `#1B2E24` deep green to teal-green, about 12%.
   - `#2C3526`, `#324A2E`, `#526C4A` muted mid greens, about 9%.
   - `#95A772`, `#AEB78D`, `#CDC890` pale sage to cream window light, about 3%.
   - `#695329` and `#6F6A36` amber-brown and bronze, about 2%.
   - By eye: stained-glass teal about `#3E8C8A`; stained-glass amber about `#E0A030`; floor energy about `#5ED12F`; warm light shaft about `#C9A24A`.
   - Balance: cool green-teal haze through the centre and left, a warm gold shaft from the upper right, amber accents in the side windows. Greens are muted (roughly 30 to 40% saturation) everywhere except the floor energy, which is the only saturated green and covers a very small area.
   - Compared with `doom-throme.jpg`, this version is cooler, greener and far less yellow.
3. **Lighting and shadow (Observed).**
   - Backlit: the windows are the main source and the throne and figure are silhouetted.
   - Two visible sets of volumetric shafts: a cool pale-green set from the upper centre-left and a warm golden set from the upper right. They cross in front of the throne.
   - Step fronts in the central strip catch a warm gold light; the outer steps stay dark.
   - Lamps add small warm points at the edges.
   - The floor glyph is self-luminous and reflects in the polished stone.
   - Measured: mean luma 46.4/255, 62% below luma 40, 3% above 180. Nearly half the frame is essentially black.
4. **Materials and textures (Observed).** Streaked, weathered glass; smooth dark stone piers with soft edges; polished reflective floor; dark aged metal throne; translucent lamp bowls with dark metal mounts. Dust and haze in the air make the light shafts visible.
5. **Architecture and ornament (Observed).**
   - Monumental, plain structure (piers, plinths, steps) with ornament confined to glass, throne panel and floor.
   - Two glass styles in one room: flowing organic leading in the main windows and rigid, stacked geometric motifs in the side windows.
   - A circular floor inlay that functions as a seal or glyph.
   - No pointed arches, rib vaults, gargoyles, banners or heraldry are visible.
6. **Composition and framing (Observed).**
   - One-point symmetry; the figure is small and exactly centred, about 45% down the frame.
   - The steps form a pyramid that leads the eye up to the throne.
   - Text-safe areas: the far left and far right (about the outer 25% each) are dark, broken only by narrow glass strips and the lamps; the bottom 25% is dark floor with the glyph in the centre. The upper centre is bright and busy.
   - A centred 9:16 crop would be only about 686 x 1220 px and would hold the throne, steps and inner windows. Landscape and ultrawide uses are native.
7. **Emotional atmosphere.** Awe, stillness, sovereignty, with an undercurrent of sorrow. It feels like a cathedral that has become a seat of power.
8. **Potential applications and limitations.**
   - Primary mood and layout reference for a hero or arrival scene.
   - Primary palette source (near-black, olive, sage, amber, one acid-green accent).
   - Reference for light-shaft direction and layering, for floor-glyph treatment, and for window design.
   - Limitations: a screen capture of video, so softer than its pixel count; thin black strip at the top edge; ultrawide only. Film frame, studio-owned. Reference only.

### Inferences
- This is very likely the opening shot of the official trailer: "We open on Downey's Doom on a throne, in all likelihood within Castle Doomstadt in Latveria... Lines carved into the ground glow with green mystical energy, sketching out what looks like a sizable glyph" — [eGamers, 15 August 2026](https://egamers.io/avengers-doomsday-7-things-the-new-d23-trailer-reveals-about-doctor-doom/). The file matches that description closely.
- The "Castle Doomstadt" identification is that outlet's guess ("in all likelihood"), not a confirmed fact.
- The room mixes Art Nouveau (main windows) and Art Deco (side windows, throne geometry) inside a Gothic-scale volume. That mix, not pure Gothic, is the film's actual architectural language.
- The saturated green is reserved for supernatural energy. That restraint is what keeps the palette from looking like a comic book.

### Gaps
- The floor glyph's full design is not readable from this angle. The meaning of the plaque emblems is unknown.
- I could not verify the frame is unaltered or identify the capture source.

---

## What visual patterns recur across the images?

### Takeaway
The set is highly consistent because six of the seven images depict one film design. The shared language is: a near-black base, green used as atmosphere rather than surface colour, gold as light, cold steel as the neutral, a small vocabulary of square, diamond and circle ornament, and compositions built on symmetry, verticality and a hidden face.

### Cited Findings
- **Darkness as the base.** Measured: the darkest colour bin is the largest in every image, from 16.3% (`doom-2.png`) to 74.2% (`doom-3.png`), and above 32% in six of seven. Mean luma is below 70/255 in six of seven.
- **Green as light and air.** Observed: in `doom-1.png`, `doom-castle.webp`, `doom-throme.jpg` and `doom-throme-wide.png`, green is carried by smoke, haze, glass and glow. The cloak itself measures close to black-green (`#13261B` to `#1C2423`).
- **Muted greens dominate; saturated green is rare.** Measured: atmospheric greens sit at roughly 30 to 46% saturation. Saturated green appears only in the floor energy, the poster tagline and the `doom-2.png` display lighting.
- **Gold and amber as the light colour.** Observed: rim light in `doom-1.png`, lamps and spotlight in `doom-castle.webp`, step edges and glass in both throne images.
- **Steel as the neutral.** Observed: the mask and armour are silver to gunmetal in every character image, with rivet lines as the signature detail.
- **A fixed costume kit.** Observed in all four character images: deep hood, riveted plate mask, two disc clasps with a chain, tile cuirass with square or diamond motifs, chainmail, oversized forearm guards.
- **Asymmetric twin medallions.** Observed in `doom-2.png` and `doom-3.png`: a star or sunburst on one side, a square-cross on the other.
- **Repeating geometric ornament.** Observed: concentric squares and diamonds (cuirass), circles (medallions, lamp bowls, floor glyph, tapestry sphere), long vertical lines (throne back, windows, cloak).
- **Backlighting and silhouettes.** Observed: `doom-1.png` and both throne images place the light behind the figure.
- **Volumetric atmosphere.** Observed: smoke in `doom-1.png`; light shafts in all three environment images.
- **The hidden face.** Observed: the face is unreadable in `doom-1.png` and all three environment images.
- **Central, symmetrical staging.** Observed: `doom-1.png`, `doom-3.png`, `doom-throme.jpg`, `doom-throme-wide.png`.
- **Small figure, vast space.** Observed: all three environment images.
- **Repeated props tie the spaces together.** Observed: the same bowl lamps appear in `doom-castle.webp` and `doom-throme-wide.png`; the same curved glass appears in `doom-4.jpg`, `doom-castle.webp` and both throne images.

### Inferences
- A workable palette skeleton drawn from the measurements:
  - Base black: `#0B0F0C` to `#10110D`.
  - Shadow green: `#13261B` to `#192E24`.
  - Haze green: `#324A2E` to `#526C4A`.
  - Sage light: `#95A772` to `#CDC890`.
  - Amber and gold: `#8F6B34` to `#CBA838`.
  - Steel: `#6C7070` to `#ABB1B1`.
  - Energy green (accent only): about `#5ED12F`.
- The recurring rule appears to be "one saturated accent, tiny area". Following it is probably what will make original artwork feel related to the references.
- The square, diamond and circle motifs are simple enough to be redrawn as original ornament without copying any specific film asset.

### Gaps
- Every pattern here is derived from one film's design. The library gives no independent check against comic-book or other interpretations.

---

## What visual directions conflict, and how can each be reconciled?

### Takeaway
The conflicts are mostly about grade and register rather than subject matter: three different greens, warm versus cool light, Art Nouveau/Deco architecture versus the brief's word "gothic", menace versus mourning, and a mix of image types. Each can be resolved by giving colours and styles fixed roles and by treating the wide film frame as the reference grade.

### Cited Findings
- **Three different greens.**
  - Observed and measured: muted olive and teal haze in `doom-1.png` and `doom-throme-wide.png` (about 30 to 46% saturation); saturated emerald with lime, amber and blue in `doom-2.png` (up to 95% saturation); almost no green in `doom-3.png` (channel spread of about 10 levels).
- **Warm versus cool.**
  - Measured: `doom-throme.jpg` is dominated by yellows and golds (`#E9D375`, `#CBA838`); `doom-throme-wide.png` shows the same room in cool sage and teal (`#95A772`, `#192618`); `doom-castle.webp` is amber-warm; `doom-3.png` is cold neutral grey.
- **Architectural style.**
  - Observed: the environments show curved Art Nouveau leading, Art Deco stepped geometry and plain monumental piers. No pointed arches, rib vaults or carved Gothic detail appear in any image.
- **Rendering style.**
  - Observed: photoreal film frames (`doom-castle.webp`, `doom-throme-wide.png`); a painterly, sharpened regrade (`doom-throme.jpg`); airbrushed digital painting (`doom-3.png`); a photograph of a physical costume (`doom-2.png`); a photograph of printed art (`doom-4.jpg`); a compressed poster (`doom-1.png`).
- **Medieval craft versus technological detail.**
  - Observed: chainmail, tapestry, woven wool and stone-bowl lamps sit alongside machined forearm guards with perforations, a glowing energy glyph, and the poster's extended technical sans-serif.
- **Emotional register.**
  - Observed: confrontation and threat in `doom-1.png`, `doom-3.png` and `doom-4.jpg`; grief and stillness in `doom-castle.webp` and both throne images.
- **Face visible versus hidden.**
  - Observed: human eyes are visible in `doom-3.png` and `doom-4.jpg`; the face is hidden in `doom-1.png` and the environments; the eye openings are empty in `doom-2.png`.
- **Format.**
  - Measured: five portrait files and two ultrawide files. The only high-resolution environment is ultrawide (2.36:1); the only portrait environment is 736 px wide.

### Inferences
How each conflict could be reconciled:
- **Greens: assign three roles and never swap them.**
  - Cloth green: almost black (`#13261B` range), large areas, no glow.
  - Atmosphere green: muted olive-sage, used for haze and glass.
  - Energy green: saturated, used only for small self-lit elements such as a seal or cursor glow, kept to a very small share of the screen.
  - Discard the `doom-2.png` emerald and its multicoloured backdrop as a colour source; keep that image for detail only.
- **Warm and cool: make temperature mean something.**
  - Warm gold for light that comes from windows, lamps and anything the guest is invited toward.
  - Cool green-teal for shadow, depth and the supernatural.
  - Use the wide frame's ratio (mostly cool-dark, with one warm shaft) as the default, and reserve the fully warm look of the tapestry hall for one deliberate moment.
- **Gothic versus Nouveau/Deco: take Gothic for proportion and mood, Nouveau/Deco for line.**
  - Keep extreme verticality, narrow tall windows, cathedral symmetry and darkness.
  - Draw ornament with the flowing leading and stepped geometry seen in the film frames.
  - Avoid adding stock Gothic elements (gargoyles, bats, blackletter everywhere) that none of the references support, or the result will read as a generic haunted castle.
- **Rendering style: pick one baseline.**
  - Use the photoreal film-frame look of `doom-throme-wide.png` as the grade and texture standard for environments.
  - Use the other images only for the information they hold (detail, proportion, layout) and unify any new artwork with one shared grade, grain and haze treatment.
- **Craft versus technology: let technology show only as light.**
  - Keep visible surfaces hand-made (metal, cloth, stone, glass).
  - Express anything futuristic as glow, not as panels, circuitry or interface chrome.
  - Do not adopt the poster's technical sans as the main voice; if echoed at all, limit it to numerals or dates.
- **Menace versus mourning: sequence them instead of blending them.**
  - An invitation is a summons, so the imposing register should lead.
  - The quiet, sorrowful register can be used for pacing between moments, where it adds depth without softening the host.
- **Face: keep it hidden.** The "mysterious" brief is best served by the shadowed-hood treatment of `doom-1.png` and the throne images, not the visible eyes of `doom-3.png` and `doom-4.jpg`.
- **Format: design two compositions, not one crop.** The wide frame suits landscape; the `doom-throme.jpg` layout suits portrait. Original artwork will be needed for both because neither reference has the resolution or rights to be used directly.

### Gaps
- These reconciliations are design reasoning, not tested outcomes. No reference in the library demonstrates the reconciled result.

---

## What is missing from the library that a design team would need?

### Takeaway
The library covers one costume and one building interior. It has nothing on the exterior world of Latveria, nothing on heraldry or typography, nothing at production resolution, no invitation or interface precedents, and no non-film interpretations to triangulate against.

### Cited Findings
- Observed: `references\inspiration\` is empty, so there are **no references for invitation design, interaction, motion, typography or layout**.
- Observed: there is **no exterior image** of a castle, town, landscape, sky or weather in any file, despite one file being named `doom-castle`.
- Observed: there is **no heraldry**: no crest, flag, banner, seal or coat of arms is legible in any image. The medallion motifs and floor plaques are the nearest thing and are too small to read.
- Observed: the **only typography** in the set is the poster tagline in `doom-1.png` and two Marvel Studios logos.
- Observed: there are **no texture or material close-ups** apart from `doom-2.png`, which is 463 px wide and colour-distorted.
- Measured: **no character image exceeds 872 px in width**, and only one environment image exceeds 1600 px.
- Observed: there are **no side or back views** of the costume and no clear view of the hands, cape lining or boots except in the derivative `doom-3.png`.
- Observed: every image except possibly `doom-3.png` is film-design material. There are **no classic or modern comic-book references**.
- Observed: there are **no thresholds or approach imagery** (gates, doors, corridors, bridges), which an "arrival" or "entry" sequence would normally draw on.
- Observed: there are **no people other than the single figure**: no guards, court, guests or crowd.
- Observed: no source, credit or licence information accompanies any file.

### Inferences
Additional references a design team would likely want before the design phase:
- Latverian exteriors: castle silhouette, mountain setting, village, night and storm conditions.
- A heraldic system: crest, monogram, seal, banner shapes.
- Typography: display and text faces suited to a royal summons.
- Physical invitation artefacts: wax seals, parchment, engraved cards, envelope and ribbon details.
- Clean, high-resolution material studies: brushed steel, verdigris bronze, wool weave, leaded glass, polished dark stone.
- Motion references: haze drift, light-shaft flicker, cape movement, ember and spark behaviour.
- Immersive web precedents for full-screen scroll or scene-based experiences.
- At least a few comic-era images, so that "recognisable Doom-inspired elements" can be defined by what persists across interpretations, not by one film's costume.
- A rights position for every reference.

### Gaps
- I did not source any of these missing references; that is outside this task's scope.

---

## Which images are the strongest anchors and which are weakest or off-direction?

### Takeaway
`doom-throme-wide.png` is the clear primary anchor, supported by `doom-castle.webp` for mood and `doom-4.jpg` for costume detail. `doom-3.png` is the weakest, and `doom-2.png` is off-direction in colour though valuable for detail.

### Cited Findings
Ranked against the stated direction (Latveria; royal, gothic, mysterious, imposing, cinematic; immersive; hybrid artwork):

1. **`doom-throme-wide.png`: primary anchor.**
   - Measured: the largest file by far (2880 x 1220).
   - Observed: shows the full setting, the lighting scheme, the palette with its single saturated accent, and a hidden-face figure. It satisfies royal, mysterious, imposing and cinematic at once.
2. **`doom-castle.webp`: secondary anchor for mood and scale.**
   - Observed: the only image with warmth, narrative and intimacy, and the best example of scale contrast.
   - Measured: weakened by extreme compression (32.7 KB).
3. **`doom-4.jpg`: anchor for costume detail and character-in-setting.**
   - Observed: the sharpest view of mask, gauntlet, mail and belt, staged against the same green glass as the throne room.
   - Limits: logo, print texture, colour cast, visible eyes.
4. **`doom-1.png`: anchor for atmosphere and silhouette only.**
   - Observed: the strongest "imposing apparition" image, with the face hidden.
   - Measured: only 388 x 515 px, and it carries a watermark and film branding.
5. **`doom-throme.jpg`: useful layout template, unreliable colour.**
   - Measured: exact 9:16, the only phone-shaped environment.
   - Observed: much yellower and more contrasty than the wide frame of the same scene.
6. **`doom-2.png`: detail reference, off-direction in colour and mood.**
   - Observed: the best view of medallions, chain, tiles and mask plating.
   - Measured: contains the most saturated colours in the library (lime at 95% saturation) and is the brightest image.
7. **`doom-3.png`: weakest.**
   - Measured: 74% near-black, effectively no colour.
   - Observed: generic background, airbrushed finish, visible eyes; it adds only full-body proportions.

### Inferences
- None of the seven is a strong reference for "gothic" in the architectural sense or for "Latveria" as a place beyond one building's interior. The direction's first word (Latveria) is the least supported by the library.
- The two strongest anchors are both film frames. A hybrid approach that uses them directly would lean heavily on studio-owned imagery; their safest use is as lighting, palette and composition guides for original environments.
- If the library is expanded, priority should go to what the anchors cannot supply: exteriors, heraldry, typography and high-resolution textures.

### Gaps
- Rankings reflect my judgement against the brief as given; no stakeholder preference was available to test them against.
- Official status is corroborated by press descriptions only for the tapestry and throne scenes. The status of `doom-1.png`, `doom-2.png` and `doom-3.png` is unverified, and `doom-4.jpg` is only plausibly matched to reported promotional art.
- Web corroboration was limited: the Empire article returned HTTP 402 and the TechRadar page was truncated, so neither could be read. Several search results were on suspicious mirror domains and were not used.
