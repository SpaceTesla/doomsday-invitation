# Creative refinement 1: review material (PROPOSED)

Review material for the creative refinements proposed in `design/EXPERIENCE_AUDIT.md` and the owner's decisions of 17 November 2026. **Nothing here is approved or implemented.** It changes nothing in `web/`, the approved boards or the source-of-truth documents.

## What to open

| File | What it is |
|---|---|
| `board.html` | The review board: current against proposed, for the council, the mantle, the decree, the summons doors, Doomscript and the closed screens |
| `audition.html` | The sound audition: the existing sounds one by one, the seal waking now and proposed, draft claim and decree sounds, and the two score directions as journeys, closing fades and a layered player |
| `stages/*.html` | The playable sketches the board's frames come from. Add `?v=phone` or `?v=desktop`; the council takes `&s=` (`arrival`, `step1`, `approve`, `step2`, `claim`, `yours`, `step3`, `decree`) and `&y=` (scroll offset). Reload to replay |

Open them straight from disk in Chrome or Edge; no server is needed. Audio is WebM/Opus.

## Labels

- **Current** (`current/`): captured from the running app on 16 November 2026, unretouched; chosen from the audit's 139 captures.
- **Proposed** (`frames/`): frozen frames of the playable sketches, which are built from existing artwork only: the hall plates, the summons plates, the seals, the marks, `suit-rune-level-3.png`, the bolt, and the approved Doomscript glyphs.
- **Placeholder**: the face of the summons' outer doors (`frames/source/door-steel.jpg` with straps, bolts and a seam), assembled from the summons plate's blank steel. A final door would be baked once from the same parts.

## How it was made

From the repository root unless stated:

| Step | Command |
|---|---|
| Sketch data (glyphs and marks, copied unchanged) | `python design/explorations/creative-refinement-1/source/build_data.py` |
| Current captures | `python design/explorations/creative-refinement-1/source/curate.py <audit capture folder>` |
| Proposed frames (from `web/`) | `node ../design/explorations/creative-refinement-1/source/render.mjs` |
| Score and sound prototypes | `python design/explorations/creative-refinement-1/source/make_score.py <wav folder>`, then `bash design/explorations/creative-refinement-1/source/encode.sh <wav folder>` |

The sounds are synthesised, like `web/scripts/make-sounds.py`, whose one-shots `make_score.py` imports unchanged. There are no recordings or film music, so there is nothing to license.
