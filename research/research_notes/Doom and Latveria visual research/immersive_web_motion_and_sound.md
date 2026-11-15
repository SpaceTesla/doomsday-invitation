# Immersive web motion, scroll storytelling, atmosphere and sound — precedents and evaluation for a gothic "royal summons" (as of 15 November 2026)

**How to read the verification tags used throughout.** No site was opened in a real browser in this session, so nothing below is a first-hand observation of motion, sound or phone behaviour. The tags mean:

- **[LIVE-TEXT]** — the live URL was fetched and the server-returned text/markup was read (confirms the site is up and shows gate/prompt wording; it does *not* show rendering, animation, audio or mobile layout).
- **[CASE]** — a written case study or award article was read.
- **[LISTING]** — only the award listing page (scores, tags, credits) was read.
- **[PRESS]** — only third-party press coverage was read.
- **[OFFLINE]** — the URL failed to resolve when fetched.
- **[SNIPPET]** — the page itself blocked fetching (HTTP 403); only a search-engine summary of it was seen.

Codrops (tympanus.net) and Art of the Title both returned HTTP 403 to direct fetches, so everything attributed to them is [SNIPPET]-grade unless another source is linked.

---

## 1. Which award-recognized immersive sites are the best precedents?

### Takeaway
The strongest verified precedents for a dark, ceremonial, sound-led experience are studio-built WebGL pieces (Immersive Garden's Aten7, Cartier and Audemars Piguet work; Dogstudio's Wakanda site; Robert Borghesi's Dracarys; The Pendragon Cycle; The Spark), and nearly all of them open with a deliberate gate ("click to enter", "hold to start", "enable sound") rather than autoplaying. The official sites of the big dark-fantasy properties that were fetched (Baldur's Gate 3, Diablo IV, The Witcher, Hades II, Nosferatu) are conventional marketing pages, not immersive experiences, so they are weak motion precedents.

### Cited Findings

**A. Dark / fantasy / film-toned immersive experiences**

- **Dracarys (Robert Borghesi)** — [LIVE-TEXT] + [LISTING]. House-of-the-Dragon-flavoured WebGL experiment. Awwwards Site of the Day 30 July 2024, score 7.52; Dev Award sub-scores: Animations/Transitions 8.20, Accessibility 6.00, Responsive 7.40. Listed techniques: GPGPU simulations, particles, post-processing, shaders, water, ice, flames, frost, audio, lightning — [Awwwards](https://www.awwwards.com/sites/dracarys). First seconds (from markup text): a "Hold to start the experience" gate, a "please enable audio" prompt and a running timer; the page text describes bloom, colour correction, LUT and frost post-processing — [live site](https://dracarys.robertborghesi.is/). Pacing, actual sound and mobile behaviour: not observed.
- **The Pendragon Cycle: Rise of the Merlin (Format-3 + MerlinStudio)** — [LIVE-TEXT] + [LISTING]. Promotional site for a fantasy series; Awwwards Site of the Day 3 January 2026, score 7.23; tags Film & TV, Promotional, Storytelling, Transitions, WebGL, React, Next.js; palette #262626 and #9C8E7D (near-black and muted bronze); Dev sub-scores: Accessibility 7.20, Responsive 7.00 — [Awwwards](https://www.awwwards.com/sites/the-pendragon-cycle). First seconds (markup text): "Enable sound / Click anywhere to enable sound", with persistent Menu and Mute controls; chapters are Story, Map, Episodes, People, Lineages — [live site](https://pendragoncycle.com/). Motion and mobile behaviour not observed.
- **Aten7 — "Toom Archives" (Immersive Garden)** — [LIVE-TEXT] + [CASE] + [LISTING]. Promotional world-building site for a game. Site of the Day 3 July 2023 (7.92; Animations 9.20, Accessibility 7.00, Responsive 7.80) — [Awwwards listing](https://www.awwwards.com/sites/aten7); Site of the Month July 2023 — [Awwwards article](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html). First seconds (markup text): an in-fiction boot sequence — "initializing / operating system / loading.. please wait" — then "Click to enter" — [live site](https://www.aten7.com/). Key devices: "a simple drag-and-release mechanism propels visitors through seasons and years" (not scroll); real-time 3D that evolves along a timeline; a custom coded alphabet; music and effects by composer Ben Lukas Boysen, each piece "tailored to accompany the transitions between the website's four seasons". Stack: Vue/Nuxt, Three.js, Blender, GSAP, Lenis, Pizzicato (audio) — [Awwwards article](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html). Mobile behaviour: not described.
- **The Hall of Zero Limits (Dogstudio for Sprite × Marvel Studios' Black Panther: Wakanda Forever)** — [CASE] + [LISTING]; live URL not fetched. Film tie-in 360° 3D environment. Site of the Day 3 January 2023 (7.88; Animations 9.60, Accessibility 6.00); live URL listed as a studio dev subdomain — [Awwwards listing](https://www.awwwards.com/sites/the-hall-of-zero-limits). Site of the Month January 2023. Camera follows two curves (one for position, one for focus point), smoothed per device/resolution, with custom timelines for a cinematic feel; real-time reflections were faked by blending pre-rendered 360° environment maps by camera position ("gave us the illusion of real-time reflections"); meshes merged, Draco-compressed, textures manually reduced; custom WebGL stack on OGL + Vue. Sound not mentioned — [Awwwards article](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html).
- **Huxley Saga (Studio Freight)** — [LIVE-TEXT] + [LISTING]. Site for a post-apocalyptic sci-fi graphic-novel universe; Awwwards Nominee dated 23 October 2026 (not a Site of the Day). Highlighted elements: "Home Title Sequence", "Cinematic Product Cards", "Story Timeline", "Parallax Desert", "Footer Reveal"; tags WebGL, GSAP, Vue.js, Typography, Filters and Effects — [Awwwards](https://www.awwwards.com/sites/huxley-saga). Live text shows "Scroll to explore" and no sound gate — [live site](https://www.huxleysaga.com/).
- **Amazon "New World" (Immersive Garden)** — [CASE]. Map-driven lore site with "hover-activated 3D effects", built with WebGL, credited with motion design, 3D and sound design; lists Awwwards Site of the Day and FWA Site of the Day. No live URL or mobile notes on the page — [Immersive Garden](https://immersive-g.com/projects/amazon-new-world).
- **The Birthday Murders (Neon, for Longlegs, 2024)** — [OFFLINE] + [PRESS]. An in-fiction true-crime site launched via a cryptic newspaper ad; press described it as looking like an old Geocities page with victim case files — a diegetic, deliberately lo-fi approach rather than WebGL spectacle — [Bloody Disgusting](https://bloody-disgusting.com/movie/3816385/the-birthday-murders-viral-marketing-website-launches-for-longlegs/), [GamesRadar](https://gamesradar.com/entertainment/horror-movies/nicolas-cage-longlegs-horror-movie-viral-website-murder-victims). `thebirthdaymurders.net` did not resolve (DNS failure) when fetched on 15 Nov 2026.

**B. Official dark-fantasy game and film sites (fetched; conventional, not immersive)**

- **Baldur's Gate 3** — [LIVE-TEXT]. Standard product page: hero with a looping background `<video>`, a "Scroll down" prompt, hover image swaps, decorative SVG corner ornaments on buttons; no intro gate, no sound prompt — [baldursgate3.game](https://baldursgate3.game/).
- **Diablo IV** — [LIVE-TEXT]. Standard Blizzard product page ("Welcome to Hell", classes, editions); no embedded audio, intro gate or sound prompt visible in the text — [diablo4.blizzard.com](https://diablo4.blizzard.com/en-us/). No Awwwards/FWA award for a Diablo IV site was found in search.
- **The Witcher** — [LIVE-TEXT]. Franchise hub (Next.js markup), hero + trailer link + news; no intro or sound gate — [thewitcher.com](https://www.thewitcher.com/).
- **Hades II** — [LIVE-TEXT]. Static studio page; the markup even carries the text "Parallax hover is not yet ready" — [Supergiant Games](https://www.supergiantgames.com/games/hades-ii/).
- **Nosferatu (2024)** — [LIVE-TEXT]. Static Focus Features film page (watch-at-home links, merch); no microsite linked — [Focus Features](https://www.focusfeatures.com/nosferatu). The campaign's immersive component was physical (a prop exhibition and a Hollywood Forever Cemetery event), not a website — [DesignRush](https://news.designrush.com/focus-features-launches-nosferatu-the-immersive-experience-ahead-of-film-release).

**C. Luxury brand storytelling**

- **Cartier — Watches & Wonders 2025 (Immersive Garden, 60fps, Mooders)** — [CASE] + [LISTING]; live URL (a 60fps staging subdomain) not fetched. Site of the Day 18 August 2025 (7.64; Animations 9.00, Accessibility 6.80) — [Awwwards listing](https://www.awwwards.com/sites/cartier-watches-wonders-2025). A scroll-driven journey through "six unique 3D scenes", structured as "a succession of immersive alcoves" with "hidden gestures that reward curiosity"; "Sound was treated not as background but as a narrative layer that enhances immersion", delivered through the Web Audio API; Three.js, GSAP, Lenis — [Awwwards article](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html).
- **GQ × Audemars Piguet — "The Extraordinary Lab" (Immersive Garden)** — [CASE] + [LISTING]; live URL could not be fetched by the tool. Site of the Day 26 March 2026 (7.74; Animations 8.60, Accessibility 6.00, Responsive 7.00) — [Awwwards listing](https://www.awwwards.com/sites/gq-ap-the-extraordinary-lab). "The entire experience was designed around a continuous cinematic track" navigated like a media player; scroll or drag drives camera, scene progression, dialogue sync, atmosphere and sound from one timeline; when users scrub fast "the audio could not simply accelerate unnaturally alongside the animation", so fades, pauses and sync states are managed; Three.js, Theatre.js, GSAP; target "an extremely fluid 60 FPS experience" including iPhone 11/12-class devices; ~3.5 months, ~10 people — [Awwwards article](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html). (The article calls it Site of the Month; the listing page fetched shows only the Site of the Day.)
- **Cartier — "Love Is All" (Immersive Garden + 60fps)** — [LISTING]. Webby 2022 nominee, Best Use of Video or Moving Image — [Webby Awards](https://winners.webbyawards.com/2022/websites-and-mobile-sites/features-design/best-use-of-video-or-moving-image/215832/cartier-love-is-all). Live status not checked.
- **David Whyte Experience (Immersive Garden)** — [CASE]. Watercolour paintings with a fluid-simulation "dynamic watercolor effect" under the cursor and a long-press reveal; noise patterns were baked in advance "reducing the need for heavy real-time computation"; Three.js, GSAP, Lenis — [Awwwards case study](https://www.awwwards.com/case-study-david-whyte-experience-by-immersive-garden.html).

**D. Story-first and studio work**

- **The Spark (Digital Panda)** — [LIVE-TEXT] + [LISTING] + [SNIPPET]. Site of the Day 8 December 2025 (7.29; Usability 6.58; Accessibility 6.20; Responsive 6.60); tags include Sound-Audio, Webflow, Cables, Blender — [Awwwards](https://www.awwwards.com/sites/the-spark). First seconds (markup text): a sound On/Off toggle, "we recommend a minimum of a laptop and headphones", "Press & Hold to Start", a "Progress: 0%" loader, numbered chapters — and a hard block for small windows: "This browser window is too small for such a fun experience. Please move to a larger screen" — [live site](https://spark.thedigitalpanda.com/). Codrops case study (per search summary) describes footsteps whose volume scales with scroll *speed* and fades when the user pauses — [Codrops](https://tympanus.net/codrops/2026/01/09/the-spark-engineering-an-immersive-story-first-web-experience/).
- **Lusion v3 (Lusion)** — [LIVE-TEXT] + [LISTING]. Site of the Day 2 October 2023 (8.25; Animations 10.00, WPO 9.00, Accessibility 7.40) — [Awwwards](https://www.awwwards.com/sites/lusion-v3). Markup shows "scroll to explore", "CONTINUE TO SCROLL" and explicit PLAY / MUTE controls — [lusion.co](https://lusion.co/).
- **Igloo Inc (abeto + Bureaux)** — [LIVE-TEXT] + [LISTING]. Site of the Day 23 July 2024 (7.92; Animations 9.60, Responsive 8.40, Accessibility 6.60) — [Awwwards](https://www.awwwards.com/sites/igloo-inc). The live URL returns essentially only its title as text (everything is rendered in WebGL/JS) — [igloo.inc](https://www.igloo.inc/).
- **Persepolis Reimagined (Monks for Getty)** — [LISTING]. Virtual reconstruction of the ancient city; Site of the Day 1 June 2022 (7.96; Animations 9.60, Accessibility 7.40); WebGL, GSAP, Vue.js; palette of ochres and gold (#987654, #D14836, #ECD06F) — [Awwwards](https://www.awwwards.com/sites/persepolis-reimagined).
- **Trionn** — [SNIPPET]. July 2026 Codrops architecture article on coordinating GSAP, Three.js, Lenis and Web Audio — [Codrops](https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/).
- **Where Worlds Take Shape** — [LISTING]. A portfolio as a "playable WebGL world"; Site of the Day 3 May 2026 (7.25; Usability 6.81) — [Awwwards](https://www.awwwards.com/sites/where-worlds-take-shape). Low relevance to a summons; included as a current example of game-like navigation.

**E. Invitation / envelope / seal interactions**

- **Envelope Reveal (Framer marketplace component)** — [LISTING]. A closed envelope whose flap "folds back in 3D" and whose letter slides up and out; triggers: On Click, On Page Load, On Scroll Into View; optional badge/logo on the flap — [Framer](https://www.framer.com/marketplace/components/envelope-reveal/).
- Framer's marketplace also lists wedding templates built around an envelope opening (e.g. "The Knot", described in search results as a 3D envelope and letter-opening animation with an optional wax seal; "Blossom Love" as a "cinematic envelope reveal") — [The Knot template](https://www.framer.com/community/marketplace/templates/the-knot/), [Blossom Love template](https://www.framer.com/community/marketplace/templates/blossom-love/). [SNIPPET]-grade.
- Greenvelope sells "animated envelope" digital invitations as a product feature — [Greenvelope](https://card.greenvelope.com/resources/animated-envelope-invitations). [SNIPPET]-grade.

**F. Pattern across the award listings**

- In the Awwwards Dev Award sub-scores read here, Animations/Transitions scored 7.2–10.0 while Accessibility scored 6.0–7.4 on every immersive entry (Dracarys 6.00, Hall of Zero Limits 6.00, Extraordinary Lab 6.00, The Spark 6.20, Igloo 6.60, Cartier 6.80, Aten7 7.00, Pendragon 7.20, Lusion 7.40, Persepolis 7.40) — see each listing linked above, e.g. [Dracarys](https://www.awwwards.com/sites/dracarys), [Lusion v3](https://www.awwwards.com/sites/lusion-v3).
- Awwwards' Film & TV category page (fetched 15 Nov 2026) is dominated by production-company and filmmaker portfolio sites, not film campaign microsites — [Awwwards Film & TV](https://www.awwwards.com/websites/film-tv/).

### Inferences
- The recurring opening grammar in the verified examples is: (1) in-fiction loader, (2) an explicit user gesture that doubles as audio unlock ("Click to enter", "Hold to start", "Click anywhere to enable sound"), (3) a persistent mute control. This maps directly onto "break the seal to enter".
- Award-winning does not mean phone-friendly: one Site of the Day (The Spark) refuses small screens outright. For an invitation opened mostly on phones from a chat link, desktop-first award sites are precedents for *mood*, not for *delivery*.
- The Longlegs site and the Pendragon palette suggest that in-fiction framing and a restrained near-black/bronze palette carry tone at least as much as heavy WebGL.
- The low accessibility scores on every immersive winner indicate that accessible immersion has to be planned in; it is not what the precedent set does by default.

### Gaps
- No site was rendered in a browser; "first five seconds" above is reconstructed from gate text in markup, and pacing, real audio and mobile behaviour were not observed for any example.
- Not verified this session (no page fetched, so no claims made): official sites or award pages for Elden Ring, House of the Dragon, Dune, The Rings of Power; A24 film microsites; and specific projects by Active Theory, Resn, Locomotive, Unseen Studio, Merci-Michel, Hello Monday, makemepulse, Aristide Benoist, Obys, Watson Design Group and Jam3/Media.Monks film teams. Searches for FWA/Awwwards entries for those film/TV titles returned nothing usable.
- CSS Design Awards and FWA case pages were not successfully retrieved for any example.
- No award-recognized wedding/event invitation with a cinematic intro was found; envelope precedents are template/marketplace-grade only. No verified precedent for a wax-seal *break* interaction specifically.

---

## 2. Cinematic scene transitions

### Takeaway
Verified precedents favour camera continuity and timeline-driven transitions tied to sound over flashy wipes; the browser now offers same-document view transitions as Baseline, which makes simple cross-dissolves and masked reveals cheap. Film-title practice (Game of Thrones) argues for physically plausible moves and no "impossible camera".

### Cited Findings
- Game of Thrones titles (Elastic/Angus Wall): the governing rule was that the camera could only do what a real camera could — "we didn't have any impossible camera moves"; hard cuts between focal lengths "felt a little jarring", so a turret-lens (Bolex-style) change was used to move between locations; the aim was to avoid "the usual tropes you'd see on a fantasy show" — [fxguide](https://www.fxguide.com/?p=23772).
- Dogstudio's Wakanda site drove its camera along two separate curves (position and focus point) with custom timelines to feel cinematic — [Awwwards](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html).
- Immersive Garden's Extraordinary Lab ties camera, interface and "cinematic transitions" to a single scrubbed timeline — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html); Aten7 pairs each season transition with its own composed sound — [Awwwards](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html).
- Same-document View Transitions became Baseline Newly available on 14 October 2025 when Firefox 144 shipped; Firefox's first implementation lacked view-transition types — [web.dev](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available).
- Cross-document view transitions: Chrome/Edge 126+, Safari and iOS Safari 18.2+, Firefox "partial" from 144, Samsung Internet listed as unsupported; 87.73% global full support — [caniuse](https://caniuse.com/cross-document-view-transitions).
- Shader-based transitions are an active tutorial genre: a January 2025 Codrops tutorial on WebGL shader image transitions (SDFs, noise), a February 2026 one on shader-revealed galleries with GSAP/Three.js/Barba.js, and a June 2026 one on persistent page transitions using WebGPU — [Codrops author page](https://tympanus.net/codrops/author/arlindaliu), [Codrops Feb 2026](https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/), [Codrops June 2026 index](https://tympanus.net/codrops/2026/06/). [SNIPPET]
- WCAG's definition of "motion animation" excludes changes of colour, blur and opacity — [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

### Inferences
- Filmic (in descending confidence): slow cross-dissolve / fade through black; an iris or soft-edged mask opening from a meaningful object (the seal, a keyhole, a door seam); a doors/gate parting reveal for "entering the council"; a single slow push-in. These mirror editing grammar and the Game of Thrones "real camera" rule.
- Gimmicky for this tone: fast multi-directional wipes, page-curl/flip, liquid displacement used on every navigation, glitch cuts, whip-pans. Displacement/noise dissolves read as "tech demo" unless tied to a material idea (smoke, ink, molten metal) and used once or twice.
- Because opacity and blur changes fall outside WCAG's "motion animation", dissolves are also the safest transition family for motion-sensitive users; door/zoom/camera moves are the ones needing a reduced-motion substitute.
- The View Transitions API covers dissolves and clip-path/mask reveals without WebGL; where unsupported the state change simply happens without animation, which is an acceptable fallback for a scene change.

### Gaps
- No verified live example of a curtain/gate/door reveal or iris transition was found; these are assessed by analogy to film grammar.
- Art of the Title's own Game of Thrones article could not be fetched (403); fxguide's interview with the same designer is used instead.
- Firefox's exact cross-document status is "partial" on caniuse; what is missing was not determined.

---

## 3. Dramatic typography reveals

### Takeaway
Title-design evidence points to type that looks *made* (etched, cast, carved) and arrives slowly; on the web the regal options are line/letter mask reveals, slow tracking and blur/opacity resolves, which are cheap and largely vestibular-safe. Typewriter and scramble effects belong to terminal/HUD language rather than a royal one.

### Cited Findings
- Game of Thrones: the world is "hand-made" from "wood and steel and glass and leather and cloth"; the world's history is "told in the relief sculptures on a band of the astrolabe"; the designers wanted it to look like it had "an unlimited budget and countless amazing craftsmen" with "not a lot of cheats" — [fxguide](https://www.fxguide.com/?p=23772).
- Se7en (Kyle Cooper): lettering was hand-etched into scratchboard and manipulated during film transfer, assembled largely by hand rather than CG; analysts describe small, jittery, scratched type reinforcing chaos — [The Fincher Analyst](https://thefincheranalyst.com/tag/kyle-cooper-designer/) (secondary; via search summary).
- Black Sails (2014) titles are documented on Art of the Title with an interview on the "Allegory" concept — baroque sculpture and European art staged as ornate vignettes, with a score deliberately built to feel slightly out of tune — [Art of the Title](https://www.artofthetitle.com/title/black-sails/). [SNIPPET]
- Art of the Title hosts the Game of Thrones entry and a 2016 summary entry for The Crown — [Art of the Title: Game of Thrones](https://www.artofthetitle.com/title/game-of-thrones/), [Art of the Title: Patrick Clair](https://www.artofthetitle.com/designer/patrick-clair). [SNIPPET]
- Tooling: GSAP's SplitText has a `mask` option that wraps lines, words or characters in clipping elements for reveal effects — [GSAP docs](https://gsap.com/docs/v3/Plugins/SplitText/); SplitText was rewritten and is free for everyone — [Webflow blog](https://webflow.com/blog/gsap-splittext-rewrite).
- Huxley Saga's listing highlights a "Home Title Sequence" as a featured element; Aten7's highlights include "Big Typography" — [Awwwards: Huxley Saga](https://www.awwwards.com/sites/huxley-saga), [Awwwards: Aten7](https://www.awwwards.com/sites/aten7).
- Colour, blur and opacity changes are excluded from WCAG's "motion animation" definition — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- NN/g: the worst usability in their study came from altered scroll rate/direction combined with text the user must read as it animates — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/).

### Inferences
- Regal and deliberate: line-by-line mask reveals (text rising from behind a baseline), slow letter-spacing settle (wide → set) on a title or name, blur-to-sharp/opacity resolve, a single metallic sheen sweep across engraved capitals once the type has landed, and stroke-drawn handwriting for one signature. All work with long durations (roughly 0.8–2 s) and generous stagger.
- Cheap or off-tone: bouncy/elastic per-letter drops, random per-character scramble, fast typewriter on body text, rotating 3D letters, looping shimmer that never stops. Typewriter is defensible only for a deliberately "machine" voice (e.g. a Doom-tech terminal aside) and should not carry long passages.
- The Se7en/Game of Thrones lesson for this project: let the *material* do the work (etched, cast, carved) and keep the motion slow and physical; jitter and scratch communicate derangement, not sovereignty.
- The guest's name is the natural place for the single most elaborate type reveal; summons body text should appear quickly and then hold still so it can be read (per NN/g's finding on animated reading text).

### Gaps
- Art of the Title pages (403) could not be read directly; no verified quotes on The Crown's molten-gold titles or any gothic film title (e.g. Dracula, Crimson Peak) were obtained.
- No source was found that empirically compares perceived "premium-ness" of type animation styles; the regal/cheap split is design judgment.
- Handwriting/stroke-drawing precedents were not verified against a specific live site.

---

## 4. Parallax environments

### Takeaway
Parallax is the effect category most explicitly named as a vestibular trigger, and on phones its two drivers are weak (no hover pointer) or gated (iOS motion permission). Full 3D scenes are achievable on phones but at studio-scale cost.

### Cited Findings
- WCAG 2.3.3 uses parallax scrolling as its example of non-essential motion that users should be able to disable — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- Val Head: "Exaggerated parallax and scrolljacking animations are highly likely to be triggering"; triggers are relative size of movement, mismatched directions/speeds, and large perceived distance — [A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/).
- web.dev names parallax scrolling as a cause of vestibular reactions (dizziness, nausea, migraine) — [web.dev](https://web.dev/articles/prefers-reduced-motion).
- WebKit's guide: "larger, wider field-of-vision animations often simulate movement in three-dimensional space" and can cause discomfort; wrap in a reduced-motion check when in doubt — [WebKit](https://www.webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/).
- `DeviceOrientationEvent.requestPermission()` "requires transient activation, meaning that it must be triggered by a UI event such as a button click", resolves to "granted" or "denied", is HTTPS-only and is "not Baseline" — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static).
- WCAG 2.5.4 Motion Actuation (Level A): anything operated by device motion must also be operable by UI components, and motion response must be disable-able — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html).
- Full 3D cost evidence: Extraordinary Lab took ~3.5 months and ~10 people and had to constrain "rendering complexity, texture management, loading strategies" for iPhone 11/12-class phones — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html); Dogstudio merged meshes, used Draco compression and faked reflections with pre-rendered maps — [Awwwards](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html).
- Gaussian splats: the Spark renderer for Three.js targets WebGL2 and mobile, but its docs note that rendering millions of splats at 60+ fps is demanding "especially for mobile-class GPUs", and recommend disabling antialiasing — [Spark docs](https://sparkjs.dev/docs/performance/), [Spark GitHub](https://github.com/sparkjsdev/spark). [SNIPPET]
- Huxley Saga lists a "Parallax Desert" element; Hades II's page ships the note "Parallax hover is not yet ready" — [Awwwards](https://www.awwwards.com/sites/huxley-saga), [Supergiant](https://www.supergiantgames.com/games/hades-ii/).

### Inferences
- Cost/benefit ladder: (a) a still painting with a slow scale/drift ("Ken Burns") — near-zero cost, low risk; (b) 2.5D from a painting split into 3–5 depth layers moved a few pixels — low cost, real depth, the best value tier; (c) depth-map displacement of a single image — moderate (needs WebGL), artefacts at edges; (d) full 3D or splats — high cost, heaviest on phones, hardest to make accessible.
- On phones, pointer-parallax does nothing (no hover), and gyroscope parallax on iOS requires a tap-triggered system permission dialog. A permission prompt in the middle of a royal summons breaks the fiction; if tilt is used at all, the request needs to ride on an existing in-fiction tap, must degrade silently on "denied", and (per 2.5.4) can never be the only way to do something.
- For this project, parallax is the least necessary depth cue: light, fog and a slow push-in convey scale with less vestibular risk.

### Gaps
- No verified live precedent for depth-map parallax or gyroscope parallax was examined; no measured frame-rate or battery data for 2.5D vs. 3D on phones was found.
- Whether Android Chrome currently requires any permission for device orientation was not verified.
- A search snippet reported that Three.js r186 ships a native Gaussian splat renderer; this was not confirmed against Three.js release notes.

---

## 5. Atmospheric particles, fog and lighting

### Takeaway
Atmosphere in the precedents comes from baked or pre-rendered assets wherever possible; real-time simulation is reserved for hero moments. On phones, video loops and requestAnimationFrame-driven effects both have known failure modes (autoplay blocking, 30 fps throttling), so every atmospheric layer needs a still fallback.

### Cited Findings
- Game of Thrones titles used haze at the Wall and "drifting dust motes" catching light from a single central sun, with colour temperature shifting by region (warm at King's Landing, "cooler and greener" toward Winterfell) — [fxguide](https://www.fxguide.com/?p=23772).
- Immersive Garden pre-baked noise patterns "reducing the need for heavy real-time computation" and restricted fluid simulation to visible regions via a stencil-buffer atlas — [Awwwards](https://www.awwwards.com/case-study-david-whyte-experience-by-immersive-garden.html).
- Dogstudio blended pre-rendered 360° maps instead of computing reflections in real time — [Awwwards](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html).
- Dracarys demonstrates the expensive end: GPGPU particle and water simulation, custom render pipeline, bloom, LUT, frost — [live site text](https://dracarys.robertborghesi.is/), [Awwwards](https://www.awwwards.com/sites/dracarys).
- Baldur's Gate 3's official site uses a looping background video in its hero — [baldursgate3.game](https://baldursgate3.game/).
- Muted video autoplay: Chrome — "Muted autoplay is always allowed" — [Chrome for Developers](https://developer.chrome.com/blog/autoplay); iOS — `<video muted>` may autoplay without a gesture, needs `playsinline` to stay inline on iPhone, and autoplaying videos "will pause if they become non-visible" — [WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/); MDN recommends `autoplay playsinline muted` and handling `NotAllowedError` from `play()` by showing a fallback — [MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- Alpha video: Safari supports HEVC with alpha but not VP9 alpha; Chrome and Firefox support VP9 alpha in WebM; Chrome Android "gets the alpha channel wrong" and Firefox Android stalls; AV1 has no native alpha; animated AVIF is unreliable. Example sizes: native VP9 1.1 MB, native HEVC 3.4 MB, versus 460 kB for a "stacked alpha" AV1 video composited with a small WebGL shader — [Jake Archibald](https://jakearchibald.com/2024/video-with-transparency/).
- iOS Low Power Mode throttles requestAnimationFrame to 30 fps intentionally ("This is intentional… Running rAF with 30fps is a little bit rough but it is okay") — [WebKit bug 215745](https://bugs.webkit.org/show_bug.cgi?id=215745); WebKit also throttles CSS animations in that mode — [Motion magazine](https://motion.dev/magazine/when-browsers-throttle-requestanimationframe).
- WCAG 2.2.2 (Level A): moving content that starts automatically, lasts more than five seconds and is shown alongside other content needs a pause/stop/hide mechanism unless essential — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- WCAG 2.3.1 (Level A): nothing may flash more than three times in any one second unless below the general/red flash thresholds; a general flash is a pair of opposing relative-luminance changes of 10% or more; small areas (about 341×256 CSS px at the reference viewing condition) are exempt — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html).

### Inferences
- Cheap, convincing alternatives ranked by value for a throne-room mood: (1) one or two very slow drifting fog layers (large blurred textures or a short seamless muted video, blended over the scene); (2) a slow, low-amplitude light "breathing" on a vignette/gradient to suggest torchlight; (3) a sparse dust-mote layer (a few dozen particles on a 2D canvas, or pre-rendered) — motes read as "old stone hall", embers read as "action game key art"; (4) static painted god rays with a faint opacity drift.
- Torch flicker must be slow and low-contrast: rapid luminance oscillation over a large area is exactly what 2.3.1 regulates, and a flickering full-screen layer on a phone can exceed the small-area exemption.
- A cursor-following "lantern" reveal is a desktop-only idea; on touch there is no hover, so it either becomes drag-to-reveal (awkward over scrolling) or is dropped. Low value for a phone-first audience.
- Alpha video is the fiddliest "cheap" option (two encodes, Android bugs); for fog over a dark scene, an ordinary opaque video with a screen/lighten blend avoids alpha entirely.
- Any ambient loop running beside readable content longer than five seconds implies a pause control or a reduced-motion-off state to satisfy 2.2.2; the reduced-motion version should simply be the still frame.

### Gaps
- Low Power Mode blocking muted autoplay video on iOS is widely reported by developers but was not confirmed in Apple/WebKit primary documentation this session; the WebKit video policy post dates from 2016 and its currency for iOS 26/27 was not verified.
- No measured GPU/battery/thermal figures for particle or fog shaders on phones were found.
- A 2026 blog (via search summary) says WebM alpha is arriving in a Safari 27 beta; not verified.
- AVIF/WebP support levels were not re-verified this session. The October 2026 web.dev roundup notes JPEG XL enabled by default in Chrome 155 and Firefox 158 — [web.dev](https://web.dev/blog/web-platform-10-2026).

---

## 6. Animated heraldic symbols and metallic transitions

### Takeaway
There is solid title-design precedent for heraldry and history rendered as crafted metal relief, and solid web evidence that convincing metal is usually *faked* with pre-rendered maps rather than computed live. Envelope/seal interactions exist only as template-grade components, so a seal-break would be a distinctive moment rather than a cliché.

### Cited Findings
- Game of Thrones: relief sculptures on the bands of a central astrolabe tell the world's history; models are "real working models with interlocking gears and lots of moving parts"; buildings "reveal themselves in mechanical ways" — [fxguide](https://www.fxguide.com/?p=23772).
- Black Sails: baroque sculpture as the title language — [Art of the Title](https://www.artofthetitle.com/title/black-sails/). [SNIPPET]
- Reflections faked by blending 360° environment maps by camera position — [Awwwards (Dogstudio)](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html); Extraordinary Lab used PBR workflows, HDR lighting, billboard/planar reflections and parallax mapping for a watch — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html).
- Envelope Reveal component: flap folds in 3D, letter slides out, optional badge on the flap, click/load/scroll triggers — [Framer](https://www.framer.com/marketplace/components/envelope-reveal/).
- A live demo titled "Pokémon Cards CSS Holographic Effect" exists as a reference for foil/holographic sheen done in CSS — [poke-holo.simey.me](https://poke-holo.simey.me/) (only the page title was retrievable).
- Rive vs. Lottie (vendor source): Rive keeps interaction logic (state machines) in the file and claims files "often 10 to 15 times smaller than equivalent Lottie JSON"; Lottie players vary by platform, with newer dotLottie players sharing one rendering core (ThorVG) — [Rive](https://rive.app/blog/rive-as-a-lottie-alternative). LottieFiles' counterpoint: Rive requires bundling its runtime — [LottieFiles](https://lottiefiles.com/blog/working-with-lottie-animations/lottiefiles-or-rive). [SNIPPET]
- GSAP's formerly paid plugins (including MorphSVG and SplitText) are covered by the no-charge licence — [GSAP standard licence](https://gsap.com/community/standard-license/).
- Tilt-driven effects need the iOS permission call from a tap — [MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static).

### Inferences
- Practicality ladder for a crest: SVG path "drawing" (stroke-dashoffset) of the line-work → fill fade → one specular sweep (a moving gradient mask) is cheap, resolution-independent and phone-safe. A pre-rendered image sequence or short video of a physically lit metal crest gives real specular behaviour at fixed cost. Environment-mapped real-time metal or a liquid-metal shader is the costly tier and needs WebGL fallbacks.
- The wax seal is the natural signature interaction: press-and-hold (as Dracarys and The Spark use to start) → crack → seal halves part → the summons unfolds, with the same gesture unlocking audio. It can be built from pre-rendered frames plus one sound, without real-time physics.
- Pointer/tilt-driven foil sheen is a delight on desktop hover; on phones it depends on the motion-permission prompt, so an automatic one-shot sheen on reveal is the dependable form.
- Heraldry should move once (assemble/draw/strike) and then sit still; a crest that loops or rotates continuously becomes a logo sting.

### Gaps
- No verified award-level site with a wax-seal press/break interaction or an "embossing" effect was found.
- Technique details of the holographic-card demo (pointer/gyroscope handling) could not be read from the fetched page.
- Rive/Lottie size and performance claims are vendor-sourced and unbenchmarked.
- No verified liquid-metal shader precedent was collected.

---

## 7. Scroll-driven storytelling: conventions, tooling, browser support, criticisms

### Takeaway
As of late 2026 the tooling is mature and largely free: GSAP (all plugins) is free under Webflow's licence, and native CSS scroll-driven animations became Baseline in October 2026 with Firefox 159. The usability evidence, though, is against long hijacked or pinned scroll on phones, and several precedents use press-and-hold, drag or click gates instead of scroll for their key beats.

### Cited Findings

**Tooling and licensing**
- GSAP: "100% free" including formerly paid Club plugins — [Webflow blog](https://webflow.com/blog/gsap-becomes-free), [GSAP pricing](https://gsap.com/pricing/). The standard "no charge" licence is effective 30 April 2025 (last modified 30 May 2025); permitted use is "the implementation and/or use of GSAP Products on any website, web application, or digital interface"; "Commercial usage is covered under the standard license". The restriction is on using GSAP in visual, no-code animation-building tools that compete with Webflow, and Webflow may terminate the licence for non-compliance — [GSAP standard licence](https://gsap.com/community/standard-license/). No 2026 change to these terms was found.
- Lenis (darkroom.engineering): MIT-licensed smooth-scroll library wrapping native scroll (so `position: sticky` and anchors still work). Documented caveats: Safari is "capped to 60fps" and "30fps on low power mode"; smoothing stops over iframes; CSS scroll-snap is unsupported. By default it respects `prefers-reduced-motion` (smoothing off, programmatic scrolls jump) — [Lenis GitHub](https://github.com/darkroomengineering/lenis).
- Motion: "Previously Framer Motion"; "Free and open source"; for React, Vue and vanilla JS; "uses the browser's ScrollTimeline when possible"; a paid Motion+ tier exists — [motion.dev](https://motion.dev/).
- Theatre.js: "a javascript animation library with a professional motion design toolset" with a sequence editor, for "cinematic scenes in THREE.js" through to UI — [theatrejs.com](https://www.theatrejs.com/); used alongside GSAP on Extraordinary Lab — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html).
- Stacks seen in the precedents: Three.js + GSAP + Lenis (Aten7, Cartier, David Whyte); OGL-based custom stack + Vue (Dogstudio); Webflow + Cables + Blender (The Spark) — [Aten7](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html), [Cartier](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html), [Dogstudio](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html), [The Spark](https://www.awwwards.com/sites/the-spark).

**Browser support (verified November 2026)**
- CSS scroll-driven animations (`animation-timeline: scroll()` / `view()`): Chrome 115, Edge 115, Safari 26, and "Firefox 159 enables scroll-driven animations by default… scroll-driven animations are Baseline Newly available" (post dated 29 October 2026) — [web.dev](https://web.dev/blog/web-platform-10-2026). `scroll()` ties progress to scroll position; `view()` activates as an element enters the viewport — [WebKit](https://www.webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/).
- View Transitions: same-document Baseline since 14 Oct 2025 — [web.dev](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available); cross-document Chrome/Edge 126+, Safari 18.2+, Firefox partial — [caniuse](https://caniuse.com/cross-document-view-transitions).
- WebGPU: Chrome/Edge 113+ on Windows/macOS/ChromeOS; Chrome 121+ on Android 12+ (Qualcomm and ARM GPUs only); Firefox 141 on Windows and 145 on Apple-silicon macOS 26; Safari on macOS/iOS/iPadOS/visionOS 26. Linux, Firefox for Android and Intel Macs "in progress" (post dated 25 November 2025) — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers).

**Conventions and criticisms**
- NN/g study (Sara Paul, Aug 2023): "The majority of our study participants were at least mildly disoriented by scrolljacking"; long scrolljacks made users think the page was broken; "scrolljacking leads to more user pain than benefits"; it was best tolerated when short and when it "progressively disclose[d] relevant information"; "Most usability issues observed on desktop were exacerbated on mobile"; advice: keep important text out of scrolljacks, never change scroll direction, keep an escape route (sticky nav) — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/).
- The Pudding (Russell Samora, 2017): keep scroll-driven steps only when "the transitions are truly meaningful, and not just something to make it pop"; "don't use vh for scrollytelling" because mobile browser bars resize the viewport; the author also argues against steppers and swipe/tap for data stories because they hide content behind clicks or override scrolling — [The Pudding](https://pudding.cool/process/responsive-scrollytelling/).
- Val Head lists scrolljacking with exaggerated parallax as "highly likely to be triggering" — [A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/).
- Non-scroll navigation in precedents: Aten7's "drag-and-release" through seasons — [Awwwards](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html); "Hold to start" on Dracarys — [live](https://dracarys.robertborghesi.is/); "Press & Hold to Start" on The Spark — [live](https://spark.thedigitalpanda.com/); a media-player-style timeline on Extraordinary Lab — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html).
- The Spark, a heavily scroll-driven story, scored 6.58 for usability and blocks small screens — [Awwwards](https://www.awwwards.com/sites/the-spark), [live](https://spark.thedigitalpanda.com/).

### Inferences
- A summons is a short, linear, ceremonial sequence with a handful of beats and very little text. NN/g's tolerance conditions (short, progressively disclosing) and its mobile warning point toward tap/hold-advanced discrete scenes for the summons itself: the guest performs a few deliberate acts (break seal, read, accept, enter) rather than scrubbing a long pinned timeline with a thumb.
- The Pudding's objection to steppers concerns information-dense articles where hiding content behind taps costs readers; an invitation with 4–6 beats and intentional reveals is a different case, but the caution stands: each tap must reveal something, and the full text must exist for assistive technology.
- The council (browsing proposed films, approving) is a task interface; NN/g found task-oriented users least tolerant of scroll manipulation, so it should scroll natively with, at most, light entrance reveals.
- If scroll-scrubbed moments are wanted, native CSS scroll-driven animations are now viable in all three engines as progressive enhancement; pinned sections should be short and sized from measured pixel heights rather than `vh` on phones.
- Smooth-scroll libraries add risk on phones for little benefit; Lenis's own notes (Safari caps, Low Power Mode) show the feel cannot be guaranteed.

### Gaps
- Webflow's GSAP announcement page itself could not be fetched (tool error); the licence terms were read directly from gsap.com and the announcement via search summary. The acquisition date and the latest GSAP version number were not verified from a primary page.
- Motion's exact licence name and Theatre.js's licence were not shown on the pages read.
- No usability research specific to tap-advanced "scene" invitations was found; the recommendation is inference from general scrolljacking research.
- Three.js / React Three Fiber documentation was not consulted this session.

---

## 8. Sound design

### Takeaway
Every major browser blocks sound until a user gesture, so the "click/hold to enter" gate is a technical necessity that the best sites turn into fiction; the precedents treat sound as a composed narrative layer tied to transitions, with a persistent mute control. For licensing, Sonniss GDC bundles and CC0 Freesound clips are the cleanest free sources; subscription libraries carry "published during subscription" conditions.

### Cited Findings

**Autoplay policy**
- General rule: media autoplays only if muted, or the user has interacted with the site, or the site is allow-listed; "playback of any media that includes audio is generally blocked if the playback is programmatically initiated in a tab which has not yet had any user interaction". `play()` returns a promise that rejects with `NotAllowedError` when blocked. `Navigator.getAutoplayPolicy()` can report "allowed", "allowed-muted" or "disallowed". Web Audio playback outside a user input handler is subject to the same rules — [MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- Chrome: autoplay with sound is allowed after the user "has interacted with the domain (click, tap, etc.)", or via the desktop-only Media Engagement Index, or if the site is installed to the home screen; an AudioContext created before a gesture starts "suspended" and must be `resume()`d after one — [Chrome for Developers](https://developer.chrome.com/blog/autoplay).
- iOS: audio requires a gesture; "If a `<video>` element gains an audio track or becomes un-muted without a user gesture, playback will pause"; qualifying events are click, doubleclick, touchend and keydown — [WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/).
- iOS quirks (developer reports, not Apple documentation): the hardware silent switch can mute Web Audio output while HTML media elements still play, with workarounds that play a silent media element on the first gesture; `touchend` rather than `touchstart` is the reliable unlock event; audio contexts are interrupted on app switch and need re-resume — [unmute-ios-audio](https://www.github.com/feross/unmute-ios-audio), [WebKit bug 149367](https://bugs.webkit.org/show_bug.cgi?id=149367), [Babylon.js forum](https://forum.babylonjs.com/t/audio-is-not-resuming-to-play-after-visibilitychange-in-iphone-browsers-works-on-android-and-desktop/54164). [SNIPPET]

**Gate and mute patterns in precedents**
- "Click anywhere to enable sound" + persistent Mute (Pendragon) — [live](https://pendragoncycle.com/); "Hold to start the experience" + "please enable audio" (Dracarys) — [live](https://dracarys.robertborghesi.is/); sound On/Off toggle + headphones recommendation + "Press & Hold to Start" (The Spark) — [live](https://spark.thedigitalpanda.com/); PLAY/MUTE controls (Lusion) — [live](https://lusion.co/); "Click to enter" after an in-fiction loader (Aten7) — [live](https://www.aten7.com/).

**How sound is used**
- Cartier: "Sound was treated not as background but as a narrative layer"; dedicated sound studio (Mooders); Web Audio API — [Awwwards](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html).
- Aten7: commissioned composer; each piece accompanies a specific transition — [Awwwards](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html).
- Extraordinary Lab: audio does not speed up when the user scrubs; fades, pauses and sync states preserve "rhythm, pacing, and continuity" — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html).
- Immersive Garden's ACME project (per search summary of a Mooders post): several sound layers are stacked or deactivated depending on where the user is — [Mooders](https://mooders.beaucoup.studio/?p=1768). [SNIPPET]
- The Spark: footstep sound scales with scroll speed and fades when the user stops — [Codrops](https://tympanus.net/codrops/2026/01/09/the-spark-engineering-an-immersive-story-first-web-experience/). [SNIPPET]
- UX guidance (via search summaries): the more often a sound plays, the subtler, shorter and warmer it should be; make mute easy — [Toptal](https://www.toptal.com/designers/ux/ux-sounds-guide); extra sound can overload users in already noisy environments — [Readymag](https://blog.readymag.com/sound-on-the-web/). [SNIPPET]

**Libraries**
- Howler.js: MIT; "defaults to Web Audio API and falls back to HTML5 Audio"; "As light as 7kb gzipped"; sound sprites; auto-unlock by playing an empty buffer on the first `touchend`; recommends "default to `webm` and fallback to `mp3`" — [Howler.js GitHub](https://github.com/goldfire/howler.js).
- Tone.js: "a Web Audio framework for creating interactive music in the browser"; "Browsers will not play any audio until a user clicks something"; call `Tone.start()` from a user event — [Tone.js](https://tonejs.github.io/).
- Pizzicato was Aten7's audio library; Cartier and Trionn used the Web Audio API directly — [Aten7](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html), [Cartier](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html).

**Licensing sources (terms as read on 15 Nov 2026)**
- Freesound: per-sound licences — CC0 ("you can do pretty much what you want"), CC BY (credit required, commercial allowed), CC BY-NC (credit required, no earning money), and legacy Sampling+ on old uploads; attribution = sound name, uploader, link, licence — [Freesound FAQ](https://freesound.org/help/faq/).
- Pixabay Content License summary: free use, no attribution required, modification allowed; no selling/distributing on a standalone basis; content covers "images, video, audio and other media"; users are responsible for any third-party rights — [Pixabay](https://pixabay.com/service/license-summary/).
- Sonniss #GameAudioGDC bundle licence v2.0 (effective 27 August 2026): "worldwide, non-exclusive, royalty-free", "an unlimited number of projects", personal and commercial use "without attribution"; no redistribution of the sounds as sounds; use for AI training prohibited without written permission — [Sonniss](https://sonniss.com/gdc-bundle-license/).
- Epidemic Sound: requires an active subscription or a single-track licence; content published during an active subscription stays cleared, but new content published after it ends is not — [Epidemic Sound help](https://help.epidemicsound.com/hc/en-us/articles/26254650213266-What-happens-when-a-subscription-is-canceled). [SNIPPET]
- Artlist: licence scope depends on plan; the Pro licence lists websites among covered uses; projects published during an active subscription remain cleared — [Artlist licence](https://artlist.io/help-center/privacy-terms/artlist-license), [Artlist pricing](https://artlist.io/page/pricing). [SNIPPET]

**Accessibility of audio**
- WCAG 1.4.2 Audio Control (Level A): audio that plays automatically for more than 3 seconds needs a pause/stop mechanism or a volume control independent of system volume; auto-started sound can prevent screen-reader users from hearing speech output — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html).

### Inferences
- The seal-break is the ideal audio gate: it is a deliberate tap/hold (satisfying every autoplay policy and the iOS `touchend` requirement), it is in-fiction, and the first sound the guest hears (wax crack, then the room's air) is caused by their own action. A discreet "enter in silence" alternative and an always-visible mute keep it honest; sound should default to whatever the guest chose and never restart on its own.
- What makes sound cinematic rather than annoying, per the precedents: few layers, composed for specific transitions; long seamless ambience at low level; interaction foley that is short and rare; no sound attached to routine hover/scroll; audio that never pitch-shifts or stutters with scroll; graceful fade on tab hide.
- A fitting gothic throne-room palette (judgment, no source found): a sub-bass/low string drone with slow movement; large stone-hall room tone and distant wind; a sparse, far-off bell or a single choir pad swell reserved for the name reveal; foley for wax crack, heavy parchment, an iron latch and a slow heavy door; one metallic "seal strike" for approvals in the council. Reverb should be long and dark; high-frequency sparkle and whooshes push toward trailer/gaming cliché.
- File-size logic: one ambience loop of 60–90 s at modest bitrate plus a small sprite of one-shots keeps audio to a couple of megabytes at most and should load *after* the first screen is interactive; many phone users will be in public with sound off, so the experience must be complete in silence.
- For a private, non-commercial invitation, CC0 Freesound clips and the Sonniss bundle impose the least obligation (no attribution, no subscription); CC BY needs a credits line somewhere; subscription libraries raise the question of whether a site that stays online counts as "published during the subscription" — worth reading the plan's text before relying on it.

### Gaps
- No authoritative article specifically on the "enter with / without sound" gate pattern was found; it is documented here from the live gate text of five sites.
- No source on gothic/throne-room sonic palettes for the web was found; that section is judgment.
- iOS silent-switch behaviour with Web Audio rests on community reports that partly conflict; current iOS 26/27 behaviour was not verified against Apple documentation.
- Epidemic Sound and Artlist terms were read via search summaries of their help pages, not the full licence text. Captions/transcript requirements for any spoken narration (WCAG 1.2.x) were not looked up this session.

---

## 9. Performance and mobile compatibility

### Takeaway
Core Web Vitals "good" thresholds are unchanged (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile). The phone-specific hazards for an invitation link are in-app browsers with no reliable iOS escape, Low Power Mode halving frame rate, autoplay rules, and immersive sites that simply do not adapt to small screens.

### Cited Findings
- Core Web Vitals: "LCP should occur within 2.5 seconds", "INP of 200 milliseconds or less", "CLS of 0.1 or less", assessed at "the 75th percentile of page loads, segmented across mobile and desktop devices" (page last updated 31 October 2024) — [web.dev](https://web.dev/articles/vitals).
- In-app browsers: "web browsers embedded directly within native mobile apps"; they "tend to be running outdated browser internals" (Android WebView updates via Chrome; iOS apps use system WebKit); the host app can inject scripts; history/bookmarks/logins are not shared; Android can escape via an `intent:` link, but "there's currently no reliable way of handling iOS in-app browsers in terms of a proper escape hatch" — [Master.dev blog, July 2024](https://blog.master.dev/the-pitfalls-of-in-app-browsers/).
- Link previews: WhatsApp previews are generated on the sender's device and silently drop the image if it is too large; sources conflict on the limit (300 KB in older developer reports, "under 600KB" in a quote of WhatsApp's documentation) — [Wikimedia Phabricator](https://phabricator.wikimedia.org/T295521), [andrewbaker.ninja](https://andrewbaker.ninja/?p=3965). [SNIPPET]
- Low Power Mode: rAF intentionally throttled to 30 fps — [WebKit bug 215745](https://bugs.webkit.org/show_bug.cgi?id=215745); CSS animations also throttled — [Motion magazine](https://motion.dev/magazine/when-browsers-throttle-requestanimationframe); Lenis documents "30fps on low power mode" and a 60 fps Safari cap — [Lenis](https://github.com/darkroomengineering/lenis). Safari also throttles rAF in cross-origin iframes until the user taps inside — [Motion magazine](https://motion.dev/magazine/when-browsers-throttle-requestanimationframe).
- Video: muted + `playsinline` + `autoplay`, with a `play()`-rejection fallback — [MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay); iOS pauses autoplaying video when off-screen — [WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/); alpha video needs two encodes (HEVC-alpha for Safari, VP9-alpha WebM elsewhere) and is buggy on Android — [Jake Archibald](https://jakearchibald.com/2024/video-with-transparency/).
- Adaptive quality in the wild: camera smoothing tuned "based on device and screen resolution", merged meshes, Draco, reduced textures (Dogstudio) — [Awwwards](https://www.awwwards.com/the-hall-of-zero-limits-by-dogstudio-wins-site-of-the-month-january-2023.html); baked noise and visibility-limited simulation (Immersive Garden) — [Awwwards](https://www.awwwards.com/case-study-david-whyte-experience-by-immersive-garden.html); 60 fps target on iPhone 11/12-class devices shaping "rendering complexity, texture management, loading strategies and asset optimization" — [Awwwards](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html).
- Loading as fiction: Aten7's loader reads "initializing / operating system / loading.. please wait" — [aten7.com](https://www.aten7.com/); The Spark shows "Progress: 0%" — [live](https://spark.thedigitalpanda.com/). WCAG notes a preload animation that is the only content on screen is not "presented in parallel with other content", so 2.2.2's pause requirement does not apply — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- Small-screen failure mode: The Spark tells small windows to "move to a larger screen" and recommends "a minimum of a laptop and headphones" — [live](https://spark.thedigitalpanda.com/).
- WebGPU on phones is partial: Chrome Android 121+ only on Android 12+ with Qualcomm/ARM GPUs; iOS only from iOS 26; Firefox Android not yet — [web.dev](https://web.dev/blog/webgpu-supported-major-browsers).
- Mobile viewport units shift as browser bars show/hide, breaking scroll triggers sized in `vh` — [The Pudding](https://pudding.cool/process/responsive-scrollytelling/).

### Inferences
- The realistic worst-case guest: an older iPhone in Low Power Mode, inside WhatsApp's or Instagram's in-app browser, sound off, on mobile data. The experience has to be complete there: 30 fps, possibly no autoplay video, no way to bounce to Safari, storage not shared with the system browser (so a guest who later opens the link in Safari may look "new").
- This argues for a tiering principle (not an architecture): a still-image-and-type baseline that is already atmospheric; a mid tier adding video/2D layers; a top tier with WebGL only where the device proves capable — with the baseline, not the top tier, treated as the design target.
- The heaviest LCP risk is a full-bleed hero image or video poster; an in-fiction loader helps perceived speed but does not change LCP, and a long loader on a chat-opened link invites abandonment. Preload only what the first scene needs; fetch audio and later scenes after first interaction.
- Motion should be timed by elapsed time, not frame count, and effects should tolerate 30 fps; slow fades and drifts survive throttling far better than fast particle systems.
- The share preview (title, description, small compressed image) is effectively the first frame of the summons in a chat thread and deserves the same art direction, with the image kept well under the lower reported WhatsApp limit.

### Gaps
- Core Web Vitals "poor" thresholds were not present in the fetched text and are not restated here.
- No primary Meta/WhatsApp/Apple documentation on in-app browser capabilities (WebGL, Web Audio, device orientation, autoplay) or on iMessage link-preview rules was found; vendor sources on WhatsApp's webview reliability conflict.
- Low Power Mode blocking of autoplay video: developer-reported only.
- No quantitative GPU/battery/thermal benchmarks for phones were found.
- AVIF/WebP and AV1 decode support levels were not re-verified against caniuse/MDN this session.

---

## 10. Accessibility

### Takeaway
The relevant WCAG 2.2 criteria are specific and mostly Level A: pause/stop/hide for ambient motion (2.2.2), the three-flashes limit (2.3.1), audio control (1.4.2) and non-motion alternatives for tilt (2.5.4), with motion-from-interaction (2.3.3) at AAA. A reduced-motion version should keep the atmosphere through stills, light, type and optional sound while removing parallax, camera travel and large-area movement.

### Cited Findings
- `prefers-reduced-motion: reduce` asks for removal of "all non-essential movement"; supported since Chrome 74, Edge 79, Firefox 63, Safari 10.1; the query can be used to "design a motion-reduced variant of your site", from skipping autoplaying video to a redesigned page; vestibular reactions "include dizziness, nausea, and migraine headaches" — [web.dev](https://web.dev/articles/prefers-reduced-motion).
- 2.3.3 Animation from Interactions (AAA): "Motion animation triggered by interaction can be disabled, unless the animation is essential"; motion animation excludes colour, blur and opacity changes; parallax is the worked example; non-essential motion added to scrolling should be optional; honouring `prefers-reduced-motion` is a sufficient technique (C39, SCR40) — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- 2.2.2 Pause, Stop, Hide (A): applies to automatically starting moving content lasting more than five seconds in parallel with other content; a loader that is the only content is outside it — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- 2.3.1 Three Flashes or Below Threshold (A): flashing "cannot be allowed even for a second"; blinking at three or more times per second counts as flashing — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html), [W3C 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- 2.5.4 Motion Actuation (A): device-motion features need UI-control equivalents and an off switch — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html).
- 1.4.2 Audio Control (A): control for any audio auto-playing over 3 seconds — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html).
- Val Head: triggers are large relative movement, mismatched speed/direction (parallax, scrolljacking) and large perceived distance; small contained motion is less risky; warn before heavy motion and "Consider offering an option to turn off, or reduce, motion" — [A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/).
- Lenis disables smoothing under reduced motion while staying active so WebGL/DOM sync is preserved, and exposes the preference to developers — [Lenis](https://github.com/darkroomengineering/lenis).
- NN/g: content should not depend on scroll-animated text; keep an escape route — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/).
- Immersive award winners score low on accessibility (6.0–7.4 in the listings read) — e.g. [Dracarys](https://www.awwwards.com/sites/dracarys), [Extraordinary Lab](https://www.awwwards.com/sites/gq-ap-the-extraordinary-lab).

### Inferences
- What a reduced-motion summons should preserve: the darkness and palette, the painted environment as a still, the full ceremony of beats (seal → summons → name → council) as cross-fades, the type hierarchy, static lighting/vignette, and opt-in sound. What it should drop: parallax and tilt, camera pushes/zooms, door/gate travel across the screen, particle and fog drift, scroll-scrubbed motion, any flicker.
- Because opacity/blur/colour changes are outside WCAG's "motion animation", a fade-only version can still feel staged and cinematic.
- An in-experience motion/sound control (beyond the OS setting) follows Val Head's advice and covers guests who never set the OS preference; a persistent "skip to the council" route covers repeat visitors and anyone who cannot or will not sit through the ceremony.
- Story content (the summons text, the guest's name, Doom's proposals) should exist as real text in reading order, reachable by keyboard and screen reader regardless of what the canvas shows; the seal and "enter" acts need to be actual buttons with names, operable by Enter/Space, not only by press-and-hold or drag.
- Torchlight flicker and lightning are the only plausible routes to a 2.3.1 problem; keeping luminance swings slow and small avoids it entirely.
- Any sound cue that carries meaning (e.g. an approval "strike") needs a visible equivalent; spoken narration, if used, needs on-screen text.

### Gaps
- WCAG criteria on captions/transcripts for audio (1.2.x), keyboard access (2.1.1), focus visibility and 2.3.2 (Three Flashes, AAA) were not fetched this session and are not quoted.
- The A11y Project's guidance was not retrieved; no statistics on prevalence of vestibular disorders were found in the pages read.
- No verified example of an award-level immersive site with a well-documented reduced-motion mode was found.

---

## 11. Evaluation: which effects enhance a gothic royal summons, and which are noise?

### Takeaway
The evidence supports concentrating motion and sound into a few ceremonial beats (opening, seal, name, entering the council) built from cheap, slow, physically plausible techniques, and holding everything else nearly still. Parallax, heavy particles, long scroll-scrubbed sequences and real-time 3D add the most cost and risk for the least gain on phones.

### Cited Findings
- Angus Wall's stated goals for Game of Thrones: no impossible camera moves, hand-made materials, and avoiding "the usual tropes you'd see on a fantasy show" — [fxguide](https://www.fxguide.com/?p=23772).
- Scrolljacking "leads to more user pain than benefits", worse on mobile — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/).
- Parallax and scrolljacking are the named vestibular triggers; fades (opacity/blur) are outside "motion animation" — [A List Apart](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/), [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).
- Gates built on a press/hold/click that also unlock sound are the common opening in verified precedents — [Dracarys](https://dracarys.robertborghesi.is/), [Pendragon](https://pendragoncycle.com/), [Aten7](https://www.aten7.com/), [The Spark](https://spark.thedigitalpanda.com/).
- Sound is treated as a narrative layer tied to transitions — [Cartier](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html), [Aten7](https://awwwards.com/aten7-by-immersive-garden-wins-sotm-july-2023.html).
- Real-time 3D on phones required months of team effort and aggressive optimisation — [Extraordinary Lab](https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html).
- Low Power Mode halves frame rate; in-app browsers on iOS cannot be escaped reliably — [WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=215745), [Master.dev](https://blog.master.dev/the-pitfalls-of-in-app-browsers/).
- A diegetic lo-fi site (Longlegs) and a near-black/bronze palette (Pendragon) show tone carried without spectacle — [Bloody Disgusting](https://bloody-disgusting.com/movie/3816385/the-birthday-murders-viral-marketing-website-launches-for-longlegs/), [Awwwards](https://www.awwwards.com/sites/the-pendragon-cycle).

### Inferences

**Ranked assessment (all ratings are this researcher's judgment from the evidence above; "cost" combines build effort and runtime load)**

| Rank | Effect category | Atmospheric value for a gothic royal summons | Implementation / performance cost | Mobile risk | Accessibility risk | Verdict | Reasoning |
|---|---|---|---|---|---|---|---|
| 1 | Dramatic typography reveals | High — the summons is words; the guest's name is the emotional peak | Low (DOM/CSS; free SplitText-class tooling) | Low | Low if fade/mask/blur based; medium if large travel | **High value** | Cheapest route to "regal and deliberate"; mostly outside WCAG "motion animation"; survives 30 fps |
| 2 | Sound (opt-in ambience + rare foley) | High — a drone and room tone do more for "throne room" than any visual layer | Medium (sourcing/mixing; iOS unlock quirks) | Medium (silent switch, in-app browsers, public settings) | Medium (needs control, visual equivalents) | **High value** (opt-in, must work in silence) | Precedents treat it as narrative; the seal gesture doubles as the audio gate |
| 3 | Cinematic scene transitions (dissolve, fade through black, iris/mask, one door reveal) | High at 3–4 beats | Low for opacity/clip-path/View Transitions; high for shader displacement | Low (simple) / medium (shader) | Low for dissolves; medium for doors/zoom | **High value** in simple forms; shader dissolves **use sparingly** | Film grammar; dissolves are the vestibular-safe family |
| 4 | Animated heraldry and the wax seal | High at one signature moment | Low–medium (SVG draw, pre-rendered frames) | Low | Low (contained motion) if it is a real button | **High value** (once) | Distinctive; no strong web precedent, so it will not read as a cliché |
| 5 | Fog and lighting | High as a quiet constant | Low (gradients, one blended loop) to high (volumetric shaders) | Medium (autoplay/Low Power Mode, battery) | Medium (2.2.2 pause; flicker vs 2.3.1) | **Use sparingly** — one slow layer, still fallback | Title-sequence precedent for haze and a single light source; cheap forms are enough |
| 6 | Metallic transitions and sheen | Medium–high (Doom's mask, crest, gold type) | Low for a one-shot gradient sweep / pre-rendered metal; high for real-time env-mapped or liquid metal | Low (sweep) / high (WebGL, tilt permission) | Low | **Use sparingly** | One sweep after an element lands reads as light on metal; continuous shimmer reads as a loading skeleton |
| 7 | Atmospheric particles | Medium (dust motes); low–negative (embers, sparks, snow storms) | Low if sparse 2D; high if GPGPU | Medium | Medium (constant large-area motion) | **Use sparingly** (motes only) | Motes say "old hall"; embers say "game key art"; constant motion cheapens stillness |
| 8 | Scroll-driven storytelling | Medium–low for a short ceremonial sequence | Medium–high | High (NN/g: worse on mobile; `vh` instability; pinned sections) | Medium–high | **Use sparingly**; tap/hold-advanced scenes for the summons, native scroll for the council | The summons is a handful of deliberate acts; the council is a task UI |
| 9 | Parallax environments (pointer/gyro, depth-map, full 3D, splats) | Medium for subtle 2.5D; low marginal gain for 3D | Low (2–4 layers) to very high (3D) | High (no hover; iOS permission prompt; GPU/thermal) | High (named vestibular trigger; 2.5.4 for tilt) | **Likely noise** beyond a barely-perceptible 2.5D drift; full 3D likely noise for this scope | Highest risk category for the least narrative gain on a phone |

**Signature moments where motion earns its place**
1. **The opening (first 3–5 seconds):** darkness, then the sealed summons emerging from black with a slow light bloom. One element, no UI chrome.
2. **Breaking the seal:** the single tactile interaction (press/hold), with the crack sound; the gesture that unlocks audio and starts the ceremony.
3. **The reveal of the guest's name:** the most elaborate type treatment in the whole experience (slow mask reveal, tracking settle, one sheen pass), preceded by a held beat of stillness and, if sound is on, the one musical swell.
4. **Entering the council:** one transition with physical weight (doors parting or a slow push through an archway), cross-fade in the reduced-motion version.
5. **Doom's decree / approval:** a short, contained "strike" (seal or stamp) when a proposal is approved — small, repeatable, never long.

**Where stillness and restraint are more imposing**
- While the summons text is being read: text arrives, then nothing moves except perhaps a faint light drift.
- Doom himself: a near-static figure or mask with minimal change (a slow light shift) is more authoritative than an animated character; authority reads as not needing to move.
- The council interface: stable layout, native scroll, immediate response; ceremony belongs to arrival and decisions, not to browsing.
- Waiting, loading and empty states: an in-fiction line of text and a slow pulse rather than a spinner or particle show.
- Between beats: fades through black and silence; the pause before the name is itself an effect.

**Effects that push toward a "generic gaming website" look**
- Glitch/RGB-split transitions, neon scanlines, CRT noise, HUD brackets and corner chrome, angular sci-fi panels, progress bars with percentages and "INITIALIZING" in monospace (appropriate for Aten7's AI fiction, wrong for a medieval-monarch register unless used as a deliberate, brief Doom-technology accent).
- Constant motion everywhere: ember storms, drifting sparks, lens flares, looping shimmer on every heading, ever-rotating emblems.
- Cursor trails, magnetic buttons, custom cursors with lag, hover-triggered sound on every element.
- Scramble/decode text effects and fast typewriter on body copy.
- Aggressive scroll-jacking with snap-pinned "feature" sections, and a looping trailer-style hero video behind text.
- Saturated accent colours on black (toxic green, electric cyan, hot red) instead of a restrained metal-and-stone palette.

### Gaps
- The ranking is a reasoned judgment; no user testing or comparative study of these effects in an invitation context exists in the sources found.
- No directly comparable precedent (a personalised, character-voiced invitation leading into a shared decision interface) was found, so the "signature moments" are extrapolated from film-title practice and the gate patterns of the verified sites.
- The "generic gaming look" list is design judgment informed by one title designer's stated avoidance of fantasy tropes; no published critique specifically cataloguing gaming-site clichés was located.
- Because no site was rendered in a browser this session, a hands-on review on real phones (including in-app browsers and Low Power Mode) of at least Pendragon Cycle, Aten7, Dracarys and Huxley Saga would be the highest-value follow-up before design begins.
