# The Iron Throne: project handoff

Written on 15 November 2026 for a new Claude session taking over this project. Read this first, then the four source-of-truth documents it names. Planning is finished. The next work is building.

## 1. Project overview

**What it is.** A personalised, shared movie invitation website. Doctor Doom is "recruiting" a small group of friends ahead of *Avengers: Doomsday*. Each guest opens a private link, is collected by Doom in a cinematic opening, receives a royal summons from Latveria, and may accept or decline. Those who accept choose a character ("mantle") no one else may hold, see the rest of the council, and approve Doom's proposed date, time and venue or suggest another. Doom then decrees the plan.

**Name and tagline.** The Iron Throne. *Doom Proposes, Council Approves.*

**Users.** About ten guests, each with one personal link, and one administrator, the project owner, who plays Doom. There is no public visitor.

**Purpose.** A private invitation among friends. It is not a product, not public, and not commercial.

**Core experience.** Played completely straight: the guest is a recruit, the invitation is a state document, the planning screen is a council chamber. The humour is dry and comes from how seriously Doom takes a cinema trip.

## 2. Current state

| Area | State |
|---|---|
| Research | Complete. Background only |
| Creative direction | Complete and approved: Direction IV, "The Iron Throne" |
| Design boards and artwork | Complete and approved (section 5) |
| Product specification | Complete and approved |
| Design specification | Complete and approved |
| Copy deck | Complete and approved |
| Technical architecture | Complete and final: Next.js on Vercel with Neon PostgreSQL |
| Application code | Milestone 0A is built: `web/` holds the Next.js application with the design tokens, fonts, base components, approved assets, local database, migration runner and security headers. No product screen exists yet |
| Version control | A Git repository on `main`. The specifications live in `docs/`; `AGENTS.md` and `CLAUDE.md` at the root point to them |
| Accounts | The GitHub repository (private), the Vercel account (Hobby) and the Neon project (PostgreSQL 18) exist. No Vercel project has been created yet; that is milestone 0B |

The only code in the project is the Python that generated the concept boards, under `design/explorations/assets/board-4-*-source/`. It is drawing code, not application code.

## 3. Source of truth

Four documents are authoritative for version 1, together with the approved boards and artwork.

| Document | Authority |
|---|---|
| `docs/PRODUCT_SPEC.md` | What the product does: roles, the six-stage guest journey, invitation management, requirements, every product decision and its log (section 7) |
| `design/DESIGN.md` | How it looks, moves and sounds: palette, typography and its usage rules, the figure, mask, suit rune, Doomscript, the hall, motion timings, components, asset inventory, constraints, decision log (section 11) |
| `docs/COPY.md` | Every word shown to guests and to the administrator, numbered line by line, with the typeface each line is set in. All of it is approved and final |
| `docs/ARCHITECTURE.md` | How it is built: stack, schema, integrity strategy, API, security, deployment, costs, tests, milestones |

Approved boards, in `design/explorations/`:

| File | Authority |
|---|---|
| `direction-4-the-iron-throne-v4.html` | Final for artwork, composition and the opening. Its frames show superseded typefaces |
| `direction-4-the-iron-throne-v5.html` | Final for typography (sizes in its section D), the body treatment, long-name handling, and the layout of the council. Its council wording is superseded by `COPY.md` |
| `index.html` | A navigation page for all boards |

Background and history, not to be built from where they differ from the four documents:

- `design/FINAL_ART_DIRECTION.md`, `design/VISUAL_REFINEMENT.md`, `design/CREATIVE_DIRECTION_V2.md`: reasoning and measurements behind the design. Their typography recommendations are superseded.
- `design/CREATIVE_DIRECTIONS.md`, `design/COMPARISON.md`, boards I to III, and Iron Throne boards v1 to v3: earlier explorations.
- `research/`: desk research. Never verified in a browser.
- `references/`: studio-owned reference images, a fan-made rune decoder and one product photograph. Reference only.

**If documents conflict:** `PRODUCT_SPEC.md` governs behaviour, `COPY.md` governs wording, `design/DESIGN.md` governs appearance, `ARCHITECTURE.md` governs implementation. A later-dated decision in a document's own decision log beats older text elsewhere in the same document. The four documents beat any board, and any board beats the history documents. Report a conflict when you find one; do not silently pick.

## 4. Product decisions

All final. Detail is in `PRODUCT_SPEC.md`.

**Roles**
- One administrator (Doom) and guests. Doom is not a guest, takes no character, and is never offered as one.
- Guests have no accounts. The link is the credential.

**Journey**
- Order: opening, then summons, then the hall as the council.
- Opening lines: "[Title] [Name]." and "Doctor Doom is here to collect you." Actions: "Go with him" and "Go without sound". "Go with him" is not acceptance.
- Each guest has a title set by Doom (Mr., Ms., Dr. or none). The name is stored as typed.
- The opening plays once per guest and can be skipped by any key or tap. Guests resume where they left off, tracked on the server against the link.
- Accept is "Take your seat". Declining is a quiet control with a confirmation and a closing screen.
- A declined or unanswered guest may accept until the end of the day of the screening. A seated guest may leave until the decree. After the day, they see "The day has passed."

**Characters**
- One guest per character, enforced by the database. Taken characters stay visible, marked unavailable, showing who holds them.
- Guests choose for themselves; Doom cannot assign. Doom adds and removes characters in the panel.
- A guest may change character until the decree; the old one is freed only if the new claim succeeds.
- Removing a held character warns Doom, then returns that guest to selection.
- Characters are shown by name only. Guest-facing word: "mantle".

**The proposal**
- Doom proposes date, time and venue. One current proposal.
- Guests may approve and may withdraw approval. Approval is advisory; Doom alone finalises, whatever the count.
- The count is shown against seated guests, as a number. Names of approvers are visible to Doom only.
- Changing the proposal resets all approvals.
- Guests may suggest an alternative date or time, not a venue. One per guest, replaceable, withdrawable, visible to all with the proposer's name. Doom adopts one by changing the proposal.
- After the decree: no approving, suggesting, changing character or leaving. Doom may amend the decree.
- The council updates on reload only. Guests learn of changes from a notice on their next load. Nothing is ever sent to guests.
- The approval rules are expected to change after version 1 and must stay easy to change.

**Administration and lifecycle**
- Doom sends the links himself. He can copy, replace or cancel a link, edit a guest, and remove a guest.
- An invalid, cancelled or expired link shows one screen that reveals nothing.
- Thirty days after the screening, links stop working and all data is deleted.
- The site is private: no indexing, no third-party requests, identical link previews.
- Accessibility target: WCAG 2.2 AA. Reduced motion and silent mode are honoured everywhere.

**Out of scope:** ticketing or payment, sending messages, guest accounts, public sign-up, chat, multiple events, guests inviting guests, studio imagery or audio, imitating Doom's voice, analytics.

## 5. Design direction

All final. Detail is in `design/DESIGN.md`.

- **Idea.** Science, sorcery and sovereignty, each with one colour: steel and silver, emerald, antique gold. Emerald means active; gold means Doom. Neither is a general accent.
- **Palette.** Fourteen interface colours and four scene-only colours, with exact values and contrast figures in `DESIGN.md` section 2.1.
- **Typography ("Two: Doomsday").** Pirata One 400 for short display headings; Cinzel 500 for names, titles and all figures; Orbitron 600 for short labels in capitals; Cormorant Garamond 500 for body, italic for Doom's formal lines, 700 for emphasis. Usage rules are part of the decision:
  - No word containing V or v in Pirata One. "Victor von Doom" is always Cinzel.
  - No numerals and no names in Orbitron.
  - No readable body text under 17 px. Readability beats avoiding scrolling.
  - Long names wrap first, step to 80% at most, then the page scrolls.
- **Artwork.** The concept renders of the figure and the hall are the approved artwork for version 1. No replacement is planned. The mask geometry, the suit rune and the Doomscript glyphs are final and must not be redrawn.
- **Assets to use.** Listed with paths in `DESIGN.md` section 9. Figure layers come from `design/explorations/assets/v4/`; fog, rubble, hall, mask and rune files from `assets/v2/`. Folders `v2/` and `v3/` also contain older figure layers with the same file names: do not use those.
- **Opening.** A reveal through rubble in four beats with fixed timings, built from eleven flat layers. Doom himself never moves. "The Iron Throne" appears as a title in the opening only.
- **Council layout.** As drawn in section C of the v5 board.
- **Doomscript** is traced from a fan-made decoder and is decoration only. It never carries information, and no letter the script lacks may be rendered.
- **Never ship anything from `references/`.** The artwork follows studio-owned designs closely by request, which is acceptable only because the site is private.

Provisional or never drawn, to be built from `DESIGN.md` and the council mock during implementation: the guest list, the alternative entry controls, confirmation, decline and closing screens, the invalid-link screen, the administrator panel, tablet layouts, the exact position of the opening title, and all sound.

## 6. Technical architecture

Final. Detail is in `ARCHITECTURE.md`.

- **Stack.** Next.js (App Router), React, TypeScript strict, Tailwind CSS v4 over CSS custom-property tokens, GSAP, Howler, Zod, Drizzle ORM with `pg`, Vitest, Playwright, Prettier, ESLint, GitHub Actions.
- **Hosting.** One Next.js application deployed natively on Vercel. Only `web/` is deployed. One daily Vercel Cron job for retention.
- **Database.** Neon PostgreSQL through its pooled connection string; the direct string for migrations. Six tables.
- **Integrity.** `guest.character_id` is unique. Claiming or changing a character is one `UPDATE`; a unique violation (23505) is returned as a 409 naming the holder. Multi-step changes use Drizzle transactions. Approvals carry a proposal version, so changing the proposal resets them without touching rows.
- **Structure.** Pages read; Route Handlers validate and call one domain function; the domain module holds every rule with no framework imports; all copy lives in `src/copy/` keyed by `COPY.md` line numbers.
- **Security.** Generated passphrase stored as a scrypt hash; signed session cookie backed by a session row; 256-bit guest tokens; server-side checks on every administrator route; rate limits counted in the database; strict headers; no middleware; no third parties.
- **Tests.** Real PostgreSQL in a throwaway container, never mocked, including a twenty-way concurrent claim test. Playwright for the journey, reduced motion, accessibility and headers.
- **Cost.** Expected to be free on Vercel Hobby and Neon Free.

A Cloudflare Workers and D1 variant was drafted and then rejected by the owner. Do not revive it.

## 7. Unresolved matters

**Blocking the first milestone:** nothing. The accounts exist and the event's time zone is `Asia/Kolkata`.

**Needed from the owner before milestone 0B:**

1. A Vercel access token, stored by the owner as the GitHub secret `VERCEL_TOKEN` (`gh secret set VERCEL_TOKEN`, run in the owner's own terminal). No secret is ever pasted into a conversation.
2. A Neon branch named `preview`, with its two connection strings added to the root `.env` as `PREVIEW_DATABASE_URL` and `PREVIEW_DATABASE_URL_DIRECT`.

**To confirm during milestone 0, not blocking:**

3. Vercel Hobby's terms of use. The usage restriction could not be verified from the plan pages. A free private invitation should qualify; Pro at 20 US dollars a month is the fallback.
4. That Vercel sends `Authorization: Bearer <CRON_SECRET>` to cron endpoints.

**To be decided by the implementer, without asking:**

- Exact library versions, component boundaries and file names.
- The date and time entry control, and the position of the opening title.
- Tablet layouts and the ratio at which the desktop and phone layer sets switch.
- Any wording for a state `COPY.md` did not foresee: follow its section 1 and reuse the nearest line.

**Needing the owner later:**

- Approval by ear of the sounds, in milestone 5. No audio exists.
- The content he enters himself: guests and titles, the character roster, the first proposal.

Three implementation decisions already made that touch behaviour, recorded in `ARCHITECTURE.md` so the owner can overrule them: "the day" for cut-offs is the date of the decree, or of the current proposal while there is none; the administrator's time control offers quarter hours; the panel has an Export button.

## 8. Implementation plan

Follow the milestones in `ARCHITECTURE.md` section 12, in order. Each ends with something that runs.

| # | Milestone | Done when |
|---|---|---|
| 0A | Local foundation (done) | A styled specimen page runs locally and reads the local database |
| 0B | Deployment foundation (done) | A styled page that reads the database deploys from `main`, with migrations finished before traffic moves |
| 1 | Schema and domain (done) | Domain and concurrency tests pass against PostgreSQL |
| 2 | Administrator panel (done locally) | Doom can run an event end to end with no guest screens |
| 3 | Guest journey, without motion (done locally) | The journey passes end to end on phone and desktop |
| 4 | Opening and motion | The reveal matches the storyboard; reduced motion works |
| 5 | Sound | Plays only after a choice; silent mode loses nothing |
| 6 | Hardening | Headers, rate limits, cron, accessibility, performance |
| 7 | Devices and launch | Real-phone checklist passes; links sent |

**Immediate next steps**

Milestone 0A is done (15 November 2026). Next:

1. Milestone 1, schema and domain, is done (15 November 2026): the first migration, the domain module in `web/src/domain/` and its tests against PostgreSQL. Milestone 2, the administrator panel, is done and verified locally (16 November 2026). Milestone 3, the guest journey without motion, is done and verified locally (16 November 2026). Milestone 4, the opening and motion, is next.
2. Milestone 0B, the deployment foundation, once the owner has added the Vercel token and the `preview` branch. Its first step is a manual trial of a staged production deploy and promotion on the Hobby plan, which decides how the workflow is built (`ARCHITECTURE.md`, section 8.4).
3. Two pieces of the foundation were left for milestone 3, where they are used and can be checked in place: the summons plate (the board's `_plate` drawing, exported as artwork) and the baked brushed-steel texture it carries. Panels and buttons use plain gradients on the boards and need neither.

Decisions taken since this handoff was first written, all recorded in the documents that own them:

- Choosing a mantle is optional and never gates the council (`PRODUCT_SPEC.md`, Stage 3 and section 7.6).
- Pirata One never renders an individual word containing a V; only that word goes to Cinzel (`DESIGN.md`, section 2.2).
- Invitation tokens stay in the address; the reasoning is in `ARCHITECTURE.md`, section 7.3.
- The Content Security Policy is static and allows inline scripts and styles (`ARCHITECTURE.md`, section 7.4).

## 9. Working instructions for the next session

**How to work**

- Do not restart discovery, design exploration or architecture planning. They are finished.
- Treat the four documents and the approved boards as authoritative. Do not casually change approved design, copy, behaviour or architecture.
- Make reasonable technical decisions yourself. The owner has said plainly that he does not want minor design, copy or technical questions sent back to him.
- Ask only when a missing decision materially changes product behaviour or creates real architectural risk. Put such questions in a short, separate list.
- Prefer working software to more documents. Build in small, verifiable milestones, never one large change.
- Test what you build, and say plainly what was and was not verified.
- Keep the documents in step with the implementation. When behaviour, wording or structure changes, update the document that owns it.
- Inspect the repository before changing anything, and follow the conventions already there.
- When revising approved design work, save a new revision beside the old one. The owner compares revisions and has repeatedly asked that approved work be preserved.
- Commit or push only when the owner asks.

**Things that are easy to get wrong**

- Use figure layers from `assets/v4/` only.
- The v4 and v5 boards disagree on typefaces by design: v5 governs type, v4 governs artwork.
- The v5 board's council wording ("Choose your name") is superseded by `COPY.md` ("Choose your mantle").
- `design/FINAL_ART_DIRECTION.md` recommends a different font set. It was overruled.
- Dates are always written in words with the part of day. Numerals appear only in counts, in Cinzel.
- Nothing under `references/` may be copied into `web/`.

**Environment notes from the previous session (Windows 11)**

- The shell is Git Bash. Inline scripts containing apostrophes fail in heredocs: write the script to a file and run it.
- Node 22, Git, Python 3.13 with Pillow, NumPy and SciPy, and `playwright-cli` are installed. Chrome is at its default path.
- `playwright-cli` refuses `file:` URLs. Serve the folder over HTTP locally to open a board.
- A design-check hook ("impeccable") scans edited HTML and CSS. On the board templates it reports a flat type hierarchy; that is a false reading, because those templates have no styles until built. Saving an ignore rule for it was blocked by the permission system and was left alone.
- The boards are rebuilt with the `build*.py` script in each `board-4-*-source/` folder. There should be no need to rebuild them.

## 10. Inconsistencies found while preparing this handoff

None that changes a decision. Three are worth knowing:

1. The v5 board still labels its sizes "under review" and carries placeholder council wording. The board was deliberately preserved as approved; `DESIGN.md` and `COPY.md` record the outcome.
2. The v2 to v4 boards show the earlier typefaces in their frames, also deliberately preserved.
3. `ARCHITECTURE.md` could not verify Vercel Hobby's usage terms. It says so, and schedules the check for milestone 0.
