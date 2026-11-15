# The Iron Throne

A private, personalised movie invitation website for about ten friends. Doctor Doom "summons" each guest through a personal link; guests accept, choose a character, and approve a date, time and venue that Doom proposes. Planning is finished. The work now is building version 1.

**Read [`docs/HANDOFF.md`](docs/HANDOFF.md) first.** It summarises every decision and says what to do next.

## Source of truth

| Document | Governs |
|---|---|
| [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md) | What the product does |
| [`design/DESIGN.md`](design/DESIGN.md) | How it looks, moves and sounds |
| [`docs/COPY.md`](docs/COPY.md) | Every word shown to guests and the administrator |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How it is built, and the milestones |

Approved boards: `design/explorations/direction-4-the-iron-throne-v4.html` (artwork and composition) and `-v5.html` (typography and the council layout).

If documents conflict, the product spec governs behaviour, the copy deck wording, the design spec appearance, and the architecture implementation. Report the conflict; do not silently pick.

## Repository

| Path | Contents |
|---|---|
| `docs/` | Specifications and the handoff |
| `design/` | Design specification, concept boards, approved artwork, board generators |
| `references/` | Studio-owned reference images. **Never copy anything from here into the application** |
| `research/` | Background research |
| `web/` | The application. Does not exist yet; created in milestone 0. The only folder that is deployed |

## Stack

Next.js (App Router), React, TypeScript strict, Tailwind CSS v4, GSAP, Howler, Zod, Drizzle ORM with `pg`, Neon PostgreSQL, Vercel, Vitest, Playwright. Details and reasons are in the architecture document. Do not change the stack.

## How to work

- Do not restart product discovery, design exploration or architecture planning.
- Do not change approved design, copy, product behaviour or architecture without the owner asking.
- Make reasonable technical decisions yourself. Ask only when a missing decision changes product behaviour or creates real architectural risk.
- Build in small, verifiable milestones, in the order given in the architecture document. Prefer working software to more documents.
- Test what you build, and say plainly what was and was not verified.
- Keep the documents in step with the code. Update the document that owns a behaviour, a wording or a structure when it changes.
- When revising approved design work, save a new revision beside the old one.
- Inspect the repository and follow its existing conventions before changing anything.

## Rules that are easy to break

- Use figure artwork from `design/explorations/assets/v4/` only. Folders `v2/` and `v3/` hold older figures with the same file names.
- Typography: no word containing V or v in Pirata One; no numerals or names in Orbitron; all figures in Cinzel; no readable body text under 17 px.
- All user-facing text comes from `docs/COPY.md`. Do not write new wording inline in components.
- Dates are written in words, with the part of day.
- The site is private: no third-party requests, no indexing, no analytics.
- The mask, the suit rune, the seal and the Doomscript glyphs are final. Do not redraw them.

## Commits

Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`, `perf:`, `ci:`. Imperative subject, under about 70 characters. Commit or push only when the owner asks.

## Commands

None yet. Once `web/` exists, its commands are listed in `docs/ARCHITECTURE.md`, section 8.3; add them here when they are real.
