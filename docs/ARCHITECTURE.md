# The Iron Throne: technical architecture and implementation plan

How version 1 is built. What it does is in [`PRODUCT_SPEC.md`](PRODUCT_SPEC.md), how it looks in [`design/DESIGN.md`](../design/DESIGN.md), and what it says in [`COPY.md`](COPY.md). Those three, with the approved boards and artwork, are the source of truth. This document changes none of them.

No code has been written. This is the final plan, set on 15 November 2026: **Next.js on Vercel with Neon PostgreSQL.** An earlier all-Cloudflare draft was dropped to avoid deployment-adapter risk.

Figures marked **(verified)** were read from Vercel's and Neon's official pages on that date.

## 1. System architecture

```
 Guest's browser                         Administrator's browser
   |  /s/{token}                            |  /throne
   |  artwork, fonts, audio, JS             |
   v                                        v
 +-----------------------------------------------------------+
 |  Vercel                                                   |
 |   CDN: web/public and built assets  (no function runs)    |
 |   Next.js application (Node.js functions)                 |
 |     Server Components   read state, render HTML           |
 |     Route Handlers      validate, call the domain         |
 |     Domain module       every rule, no framework imports  |
 |     Data module         Drizzle over node-postgres        |
 |   Vercel Cron, daily ---> /api/cron/retention             |
 +----------------------------+------------------------------+
                              |  pooled connection, TLS
                       Neon PostgreSQL
```

One application, one database, one scheduled job. Everything a guest sees move runs in their browser.

## 2. Technology stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js, App Router, current stable release | Native Vercel deployment, no adapter |
| UI | React, TypeScript in strict mode | Server Components for reads, Client Components for scenes and controls |
| Styling | Tailwind CSS v4, CSS custom properties, hand-written CSS | Section 6 |
| Motion | GSAP with its React hook; CSS for simple motion | Client only |
| Sound | Howler | Client only |
| Database | Neon PostgreSQL | |
| Data access | Drizzle ORM over `pg` (node-postgres); Drizzle Kit migrations | Section 4.4 explains the driver choice |
| Validation | Zod | |
| Tests | Vitest against a real PostgreSQL; Playwright end to end | |
| Tooling | Prettier; ESLint with the Next.js rules; GitHub Actions | |
| Runtime | Node 22, npm | |
| Database version | PostgreSQL 18 | Neon runs 18.7; the local and test container is `postgres:18` |

Versions are pinned in the lock file when the project is created.

## 3. Vercel hosting and deployment

- **One Vercel project**, root directory `web/`. Nothing outside `web/` is built or deployed, so the reference images cannot ship.
- **Rendering.** Guest and administrator pages are server-rendered on each request and never cached. Mutations are Route Handlers. All on the Node.js runtime; nothing uses the edge runtime.
- **No middleware is needed.** Security headers come from `next.config` `headers()`. Authorisation is checked in the administrator layout and in every handler.
- **Deployments.** Only the GitHub Actions workflow deploys; `web/vercel.json` switches Vercel's own Git deployments off. Every pull request gets a preview deployment; `main` deploys to production through a staged deployment that is promoted only after its migrations and a smoke test (section 8.4). Preview and production have separate environment variables and separate secrets, so previews use the `preview` database branch.
- **Cron.** One entry in `vercel.json`, daily. The Hobby plan allows cron jobs to run once a day, at a time accurate to within the hour **(verified)**, which is all retention needs.
- **Function limits.** Up to 300 seconds on Hobby **(verified)**. Our handlers take milliseconds.
- **Static assets.** Everything in `web/public/` and the built bundles is served from Vercel's CDN without running a function. No Blob or other storage is used.

## 4. Database: schema and data integrity

### 4.1 Schema

```sql
create table event (
  id                int primary key check (id = 1),       -- one event
  timezone          text not null,                        -- IANA name
  proposal_at       timestamptz,
  proposal_venue    text,
  proposal_version  int not null default 0,               -- raised on each change
  finalised_at      timestamptz,                          -- null until the decree
  plan_version      int not null default 0,               -- raised when the decree is amended
  created_at        timestamptz not null default now()
);

create table character (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_key    text not null unique,                       -- lower-cased, trimmed
  created_at  timestamptz not null default now()
);

create table guest (
  id                 uuid primary key default gen_random_uuid(),
  token              text unique,                         -- null when the link is cancelled
  title              text not null default '',
  name               text not null,
  status             text not null default 'summoned'
                       check (status in ('summoned','seated','declined')),
  character_id       uuid unique references character(id) on delete set null,
  approved_version   int,                                 -- approves when equal to event.proposal_version
  seen_proposal      int not null default 0,
  seen_plan          int not null default 0,
  character_removed  boolean not null default false,
  opened_at          timestamptz,
  opening_played_at  timestamptz,
  invited_at         timestamptz not null default now(),
  answered_at        timestamptz
);

create table alternative (
  guest_id    uuid primary key references guest(id) on delete cascade,   -- one per guest
  at          timestamptz not null,
  created_at  timestamptz not null default now()
);

create table admin_session ( id uuid primary key, expires_at timestamptz not null );
create table attempt ( key text not null, at timestamptz not null default now() );
create index attempt_key_at on attempt (key, at);
```

### 4.2 How each requirement is enforced

The database enforces the rules. The application reports the outcome.

| Requirement | Mechanism | Why it is safe |
|---|---|---|
| One guest per character | `unique (character_id)` | PostgreSQL refuses a second holder whatever the application does. Any number of guests may hold none |
| Simultaneous selection | One statement: `update guest set character_id = $1 where id = $2 and status = 'seated' and (character_id is null or (select finalised_at from event) is null)` | Two guests racing: one commits, the other receives unique-violation error 23505. The handler catches exactly that code and answers `409 taken` with the holder's name. There is no check before the write to go stale |
| Changing is atomic | The same single statement | One column changes value. If it fails, the guest still holds the old character |
| Removing a character | Transaction: `update guest set character_removed = true where character_id = $1`; `delete from character where id = $1` | The foreign key clears `character_id`. Both happen or neither |
| Leaving the council | Transaction: `update guest set status = 'declined', character_id = null, approved_version = null where id = $1 and status = 'seated' and (select finalised_at from event) is null returning id`; if a row came back, `delete from alternative where guest_id = $1` | The cut-off is inside the write. Nothing is freed unless the status really changed |
| Declining; removing a guest | The same transaction pattern; removal deletes the guest and the cascade removes the alternative | |
| Changing the proposal resets approvals | `update event set proposal_at = $1, proposal_venue = $2, proposal_version = proposal_version + 1 where finalised_at is null` | No approval row is touched: none equals the new version |
| One approval per guest | `update guest set approved_version = (select proposal_version from event) where id = $1 and status = 'seated' and (select finalised_at from event) is null` | Repeating it writes the same value |
| The count | `select count(*) from guest where status = 'seated' and approved_version = (select proposal_version from event)` | |
| One alternative per guest | `insert ... on conflict (guest_id) do update` | The primary key |
| Finalising | `update event set finalised_at = now() where finalised_at is null and proposal_at is not null` | One statement |

Multi-step operations use Drizzle's `db.transaction()`. Single-statement operations need none. After each write the handler checks the affected row count; zero means the rule in the `where` clause did not hold, and the handler reads the state to say why.

### 4.3 State, cut-offs, links, retention

```
                accept                    leave (before the decree)
  summoned ---------------> seated ----------------------------+
      | decline                ^  accept (until the end of      |
      +-----------------> declined <-------- the day) ----------+
```

- **"The day"** is the date of the decree, or of the current proposal while there is none, in the event's time zone. Cut-offs fall at its end.
- **After the decree:** no approving, no alternatives, no change of character, no leaving. A guest who accepts late still makes a first choice.
- **After the day:** no accepting. Summoned and declined guests see the closing screen.
- **Tokens:** 32 random bytes from `crypto.randomBytes`, 43 URL-safe characters. Replacing writes a new one; cancelling sets it to null.
- **Change notices:** shown when `seen_proposal` or `seen_plan` is behind the event, then recorded as seen. `seen_plan` stores the plan version plus one, so 0 always means "never saw a decree" and a guest who first arrives after an amendment is not told of a change they never saw. The same holds for `seen_proposal`, whose version 0 means no proposal.
- **Retention:** section 7.5.

Rules the domain module settled in milestone 1, each covered by a test in `web/tests/domain/`:

- Choosing a character is optional. No council action checks whether the guest holds one.
- Claiming a character also clears `character_removed`. A first choice is allowed after the decree; a change is not. A claim that loses the race is answered with the holder's name; if the holder let go in the same instant, it is answered as an unknown character and the guest simply chooses again.
- Doom's proposal and any amendment must be a future quarter hour with a venue. Setting the same date, time and venue again changes nothing and clears no approval.
- An alternative must be a future quarter hour and differ from the proposal. Withdrawing one, like suggesting one, is refused after the decree.
- Declining is for a guest who has not accepted. A seated guest leaves the council instead.
- Retention deletes the event row with everything else. With no event, every link is invalid.
- The approval rules of `PRODUCT_SPEC.md` section 5.9 are the five named settings in `src/domain/approval.ts`, read by the rest of the domain.
- Drizzle's query errors carry the query's parameters, which can include a token. No log may receive a raw error, a token or a request URL; a test scans `src/` for it.

### 4.4 Connection

- The application connects with `pg` through **Neon's pooled connection string**, with a pool of at most a few connections per function instance. Neon's pooler absorbs the many short-lived connections that serverless functions create.
- Migrations use the **direct** connection string.
- Why `pg` and not Neon's HTTP driver: the HTTP mode supports only non-interactive transactions **(verified)**, and `pg` is also the driver that talks to an ordinary local or CI PostgreSQL. One driver everywhere means the tests exercise exactly the code that runs in production.
- **The migration runner** (`src/db/migrate.ts`) serialises runs with a session-level advisory lock. The lock and Drizzle's migrator use one connection, because such a lock belongs to the connection that took it. The lock is released in a `finally` block and the connection is closed after it, so a failed run cannot leave it held. A second runner waits its turn, then gives up at a deadline without applying anything. A pooled connection string is refused: a session lock does not survive transaction pooling. `tests/db/migrate.test.ts` proves each of these against a real PostgreSQL.
- Neon's free database sleeps after five minutes idle and wakes in a few hundred milliseconds **(verified)**. The first request after a quiet spell is slightly slower; the opening covers it.

## 5. Backend and API

| Layer | Where | Rule |
|---|---|---|
| Pages | `app/` Server Components | Read through the domain. Hold no rules |
| Route Handlers | `app/api/` | Parse with Zod, identify the caller, call one domain function, return JSON |
| Domain | `src/domain/` | Every product rule. Plain TypeScript with no Next.js or Vercel imports. Takes a database handle as an argument |
| Data | `src/db/` | Drizzle schema, the client, the statements of section 4.2 |

The approval rules the product expects to change (`PRODUCT_SPEC.md`, section 5.9) sit in `domain/approval.ts` behind five named settings.

`/s/{token}` renders the guest's stage:

| Guest state | Rendered |
|---|---|
| Token unknown or cancelled, or the event deleted | Invalid-link screen, status 404 |
| Summoned, before the end of the day | Opening (once), then summons |
| Seated, with or without a character | Council. The mantle list is part of it; choosing a mantle is optional and gates nothing |
| Declined, before the end of the day | Closing screen with "Take your seat" |
| Summoned or declined, after the day | "The day has passed." |

`/throne` is the sign-in; `/throne/guests`, `/throne/characters`, `/throne/proposal`, `/throne/council` are the sections of `COPY.md`.

| Method and path | Does | Notable responses |
|---|---|---|
| `POST /api/g/{token}/opened` | Records first open and that the opening played | |
| `POST /api/g/{token}/accept` | To seated | 409 after the day |
| `POST /api/g/{token}/decline` | To declined | |
| `POST /api/g/{token}/leave` | Seated to declined, freeing everything | 409 after the decree |
| `PUT /api/g/{token}/character` | Claims or changes | 409 `taken` with the holder; 409 after the decree for a change |
| `PUT`, `DELETE /api/g/{token}/approval` | Approves, withdraws | 409 after the decree |
| `PUT`, `DELETE /api/g/{token}/alternative` | Sets, replaces, withdraws | 422 past date, missing part, same as the proposal |
| `POST /api/g/{token}/seen` | Marks notices seen | |
| `POST`, `DELETE /api/admin/session` | Sign in, sign out | 401; 429 |
| `POST /api/admin/guests`; `PATCH`, `DELETE /api/admin/guests/{id}` | Add, edit, remove | |
| `POST`, `DELETE /api/admin/guests/{id}/link` | Replace, cancel | |
| `POST /api/admin/characters`; `DELETE /api/admin/characters/{id}` | Add, remove | 409 duplicate; 409 `held` unless `confirm` is sent |
| `PUT /api/admin/proposal` | Set or change | Raises the proposal version |
| `POST /api/admin/finalise`; `PUT /api/admin/plan` | Finalise; amend | |
| `GET /api/admin/export` | The whole event as JSON | |
| `GET /api/cron/retention` | Deletes the event thirty days after the day | 401 without the cron secret |

Every mutation is idempotent.

## 6. Front end and Tailwind

Tailwind does layout. The identity stays in tokens and hand-written CSS.

| Concern | Where | How |
|---|---|---|
| Design tokens | `src/styles/tokens.css` | The palette, four font roles, scale and spacing of `DESIGN.md` as CSS custom properties. The single source |
| Tailwind theme | `src/styles/app.css` | Tailwind v4's `@theme` maps its colour, font and spacing names onto those properties, so `bg-plate` and `text-silver` are the approved values |
| Tailwind's job | In components | Flex and grid, spacing, sizing, positioning, breakpoints, hover and focus states |
| Hand-written CSS | `src/styles/surfaces.css`, `scenes.css`, `type.css` | Brushed steel, bevels, the dotted gold line, engraving, glows, scrims, vignettes, the frame-relative type scale of the opening and summons, and every keyframe |
| Typography rules | Components | `Heading` stays a Pirata One heading and sets only an individual word containing a V in Cinzel; a test keeps every approved heading free of such words. `Label` takes fixed copy only and rejects numerals. `Figure` sets numerals in Cinzel |
| Fonts | `src/fonts/` | The four families as local WOFF2, Latin subset, taken from the `@fontsource` packages with their licence texts, through `next/font/local`. `next/font` serves its own hashed copies, so nothing is kept in `public/`. No request leaves our origin |
| Doomscript | `Runes` component | Draws from `doomscript-glyphs.json`, hidden from assistive technology, fails the build on a letter with no rune |
| Copy | `src/copy/` | Every string, keyed by its line number in `COPY.md` |
| Long names | `lib/fit.ts` | The approved rule: wrap, step to 80%, then scroll |

The layer set is chosen by viewport shape, and the scenes size their type from the frame, not from Tailwind's breakpoints.

## 7. Animation, assets, security, retention

### 7.1 Animation

The approved experience is built exactly as specified. The host delivers files and takes no part in it.

| Concern | Approach |
|---|---|
| Where it runs | In the browser, in Client Components. The server sends HTML that already contains the two lines and both actions |
| Opening | One GSAP timeline with five labels (dark, lift, clear, lit, summons) over the approved layers, using the approved rubble offsets |
| Transitions | The seal iris, the plate parting and the seal waking: three small GSAP components |
| Simpler motion | CSS: fades, the ash loop, button feedback |
| Reduced motion | Every sequence becomes a 0.2 s cross-fade to its end state. The ash does not run |
| Silent mode | Sound is off until the guest chooses. No animation waits on audio |
| Skip | Any key or tap seeks the timeline to its end. "Played" is stored on the server against the link |
| Static fallback | The final frame is plain HTML and images, so a slow or failed script still shows Doom, the name and the actions. A one-line script in the page's head marks that script will run, so the opening and the summons hold their final frame back instead of flashing it; if the script never arrives, CSS shows the final frame after 2.5 s (2 s for the summons) |

### 7.2 Assets

- Artwork, icons, fonts and audio live in `web/public/` and are served from Vercel's CDN with long cache lifetimes set in `next.config`.
- The approved layers are served as they are. `next/image` optimisation is not used: each layout has its own approved render.
- Only the first scene's layers and the name font are preloaded. Later scenes load after the first action. Audio loads only if sound is chosen.
- About 0.4 MB of layers per layout. Hobby includes 100 GB of transfer a month **(verified)**.
- Smoothness on phones is a browser matter: flat layers, transforms and opacity only, timing by elapsed time. Tested on real phones inside a messaging app's browser.

### 7.3 Authentication and authorisation

| Requirement | Implementation |
|---|---|
| Passphrase | Generated at setup, not chosen. Only its scrypt hash (`node:crypto`) is stored, as an environment variable |
| Session cookie | A session id with an HMAC-SHA256 signature. `HttpOnly`, `Secure`, `SameSite=Strict`, seven days. The id must also exist, unexpired, in `admin_session`, so signing out really ends it |
| Server-side checks | The administrator layout and every administrator handler verify the session. No client-side gate |
| Cross-site requests | Administrator mutations check the `Origin` header |
| Rate limiting | Failed sign-ins are counted in `attempt`: five in fifteen minutes locks sign-in for fifteen minutes. Unknown guest tokens are counted per address the same way |
| Guest tokens | 256 bits. Stored as they are so a link can be copied again; a token can be replaced at will, and anyone able to read the database can read everything in it already |
| Tokens in the address | The token stays in the path, `/s/{token}`. Vercel's request logs record paths, keep them for a short time (under an hour on Hobby, confirmed in milestone 0B) and show them only to the account's owner, who is Doom and already holds every token. Anyone who took over the account would also hold the database credentials. Exchanging the token from a URL fragment for a cookie was evaluated and rejected: it would make the first screen wait for a script and a request, remove the server-rendered fallback, and add a guest cookie that in-app browsers often drop, while protecting none of the places a link really leaks (the message thread, browser history, screenshots). Our own logs never contain a token or a full address, error responses never echo one, and Doom can replace any link |
| Guest-specific access | A guest handler loads the guest by the token in its own path and acts only on that row. No handler accepts a guest id from the request |
| What guests see | Never another guest's token or id, the opened status, or who approved |
| Built in milestone 3 | Unknown guest links are counted per address like failed sign-ins; a locked address gets the invalid-link answer even for a valid link, so links cannot be searched for. The first open is recorded by a script on the page, not by the page request, so a messaging app's link-preview robot never marks a guest as having opened; either opening action records that the opening was seen. The summons plate is exported from the board generator (`scripts/export-plates.py`) and baked to WebP in a browser, because live SVG filters are too slow on phones; its words are real text and its seal is a live component. Long names are measured in the browser (`lib/fit.ts`) and take the approved fit. The guest list shows names without titles. A guest whose character Doom removed sees its name in the message (migration `0001` adds `guest.removed_character_name`) |
| Built in milestone 2 | `ADMIN_PASSPHRASE_HASH` is `scrypt:N:r:p:salt:hash` in base64url, with no `$`, because Next.js expands `$` in environment files. Sign-in failures are counted per address (`x-forwarded-for`), so nobody elsewhere can lock Doom out. The panel's pages sit in the route group `app/throne/(panel)`, whose layout checks the session on the server before anything renders; each handler reads the cookie from its own request and checks it again, which also lets the handler tests call them directly. The day control is the browser's date field; the hour control lists every quarter hour named in words, as guests will read it. Copy link builds the address from the page's own origin |

### 7.4 Privacy and headers

- `Referrer-Policy: no-referrer`; a Content Security Policy limited to our own origin; `X-Content-Type-Options: nosniff`; `X-Frame-Options: DENY`.
- The Content Security Policy is static, set in `next.config.ts`. A policy with nonces would need middleware, which this design does not use. Every source is limited to `'self'`; scripts and styles also allow `'unsafe-inline'`, which Next.js needs for hydration. That is a small risk here: React escapes what it renders, the site never renders HTML supplied by a user, and no other origin is allowed. `object-src` and `base-uri` are `'none'`, `frame-ancestors` is `'none'`, and `form-action` is `'self'`.
- `Cache-Control: private, no-store` on guest and administrator responses.
- `X-Robots-Tag: noindex, nofollow` on everything, and a `robots.txt` that disallows all.
- No external scripts, fonts, analytics or images. Vercel's own analytics stay off.
- Link previews are identical for every link.
- Logs record route, status and duration with the token removed from the path.
- Secrets are environment variables in Vercel, never in the repository.

### 7.5 Retention

- `vercel.json` schedules `GET /api/cron/retention` once a day.
- The endpoint requires `Authorization: Bearer <CRON_SECRET>` and answers 401 otherwise. Vercel sends that header when the `CRON_SECRET` variable is set; this is confirmed in milestone 0.
- If the day plus thirty days has passed, one transaction deletes every alternative, guest, character, session and attempt and clears the event row. Otherwise it does nothing.
- It is safe to retry: a second run finds nothing to delete.
- Independently of the job, the same date check makes every link invalid from that moment.

## 8. Local development and deployment

### 8.1 Environments

| Environment | Application | Database |
|---|---|---|
| Local | `next dev` | PostgreSQL 18 in Docker, on port 54329. Local work never writes to Neon |
| Tests and CI | Vitest, Playwright | A throwaway PostgreSQL container, created per run |
| Preview | Vercel preview deployments | Neon branch `preview` |
| Production | Vercel production | Neon branch `main` |

Tests never touch Neon's production branch: they use a container that exists only for the run.

### 8.2 Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Neon connection string, used by the application |
| `DATABASE_URL_DIRECT` | Direct connection string, used only for migrations |
| `ADMIN_PASSPHRASE_HASH` | scrypt hash of the generated passphrase |
| `SESSION_KEY` | Signs the session cookie |
| `CRON_SECRET` | Protects the retention endpoint |
| `EVENT_TIMEZONE` | IANA time zone of the event: `Asia/Kolkata`. It seeds `event.timezone` when the event row is created; from then on the column is the source |
| `NEON_DATABASE_URL`, `NEON_DATABASE_URL_DIRECT` | Local only. The Neon strings, read by `npm run db:check` and nothing else |

`web/.env.example` lists them. `web/.env.local` holds local values and is not committed; `npm run env:setup` creates it without printing a value. Locally, `DATABASE_URL` and `DATABASE_URL_DIRECT` both point at the Docker database. Preview and production values are set in Vercel's project settings.

### 8.3 Commands

Run from `web/`.

| Task | Command |
|---|---|
| Create `.env.local` | `npm run env:setup` |
| Start the local database | `docker compose up -d` |
| Check every configured database answers | `npm run db:check` |
| Develop | `npm run dev` |
| Format, lint, type-check | `npm run format`, `npm run lint`, `npm run typecheck` |
| Copy the approved assets and fonts into the application | `npm run assets:sync` |
| Re-export the marks from the board generator | `python scripts/export-marks.py` |
| Create a migration from the schema | `npm run db:generate` (drizzle-kit) |
| Apply migrations | `npm run db:migrate` against the database in `DATABASE_URL_DIRECT` |
| Unit and integration tests | `npm test` |
| End-to-end tests | `npm run e2e` |
| Generate a passphrase and its hash | `npm run admin:passphrase` |
| Back up | `npm run db:dump` (`pg_dump` to a dated file) |

### 8.4 Deployment

Built and proven on 16 November 2026 (milestone 0B). The workflow is `.github/workflows/ci.yml`.

1. **Every pull request and push to `main`:** format, lint, type-check, Vitest, and the Playwright journey, against a PostgreSQL 18 service container.
2. **A pull request** then gets a preview, one at a time (they share the database): `vercel pull` and `vercel build` on the Linux runner, migrate the Neon `preview` branch, `vercel deploy --prebuilt`, and a smoke test.
3. **A push to `main`** goes to production, one run at a time, never cancelled midway:
   1. `vercel build --prod`, then `vercel deploy --prebuilt --prod --skip-domain`. The deployment is staged: it exists and is ready, but the production domain still points at the previous one.
   2. `pg_dump` of production, kept as a workflow artifact for seven days. It contains guest data and tokens; artifacts of this private repository are visible only to its owner.
   3. The migration runner applies pending migrations under its advisory lock (section 4.4).
   4. `scripts/smoke-test.mjs` asks the staged deployment, through Vercel's protection bypass (`vercel curl`), whether it reads the database and has every migration in this commit's journal. If not, the run stops and the live deployment is untouched.
   5. `vercel promote` moves the production domain to the new deployment.

The first production run through the workflow (16 November 2026) went through every step: checks, build on Linux, staged deploy, backup, migration under the lock, smoke test ("2 of 2 migrations applied"), promotion. Two fixes were needed on the way, both in the workflow, not the application: generate Next.js's route types before type-checking (`next typegen`), and let `vercel curl` read the token from `VERCEL_TOKEN` (it forwards options it does not know, `--token` included, to curl).

What the trial established, by hand from the CLI, before the workflow was written:

- **Staging and promotion work on Hobby.** Before promotion the production domain answered 404 (no deployment yet held it); after `vercel promote` it served the staged deployment at once.
- **Deployment URLs are protected** (Vercel Authentication answers 302); the production domain is public. `vercel curl` reaches a protected deployment without a separate bypass secret.
- **`--prebuilt` cannot be uploaded from Windows**: the local build writes function links Vercel cannot take. The workflow builds on Linux, where it works; a deployment from a Windows machine by hand must let Vercel build (`vercel deploy` without `--prebuilt`).
- `web/.vercelignore` keeps every `.env` file, tests and caches out of any upload.

Settings: Vercel holds `DATABASE_URL` (the pooled string), `EVENT_TIMEZONE`, `SESSION_KEY` and `CRON_SECRET` for production and for preview, each environment with its own secrets; `ADMIN_PASSPHRASE_HASH` is set by the owner (milestone 7, or earlier to use the panel). GitHub holds `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `PRODUCTION_DATABASE_URL_DIRECT` and `PREVIEW_DATABASE_URL_DIRECT`.

Migrations are written to be backward compatible, so the previous deployment keeps working while the new one goes live, and `vercel rollback` stays safe after a promotion.

**Confirmed on 16 November 2026:**

- **Vercel's cron sends the secret.** The job is registered (`vercel crons list`: `/api/cron/retention`, `30 21 * * *`). A run triggered through Vercel (`vercel crons run /api/cron/retention`) logged "retention: nothing due", which the endpoint writes only after `Authorization: Bearer <CRON_SECRET>` has matched. On Hobby a scheduled run fires within the hour of its time, not at the minute.
- **Hobby keeps runtime logs for less than an hour.** A log query for the last hour is refused ("The hobby plan does not retain runtime logs for the requested time range"); the last 30 minutes are available. So a request path carrying a token is gone from Vercel's logs within the hour (section 7.3).

**Still to confirm:** Vercel's Hobby terms (the owner's reading). Also noted for milestone 6: `pg` warns that `sslmode=require` will mean less in its next major version; setting `sslmode=verify-full` in the connection strings keeps today's full certificate check.

## 9. Cost

| Service | Free allowance (verified) | Our use |
|---|---|---|
| Vercel Hobby: data transfer | 100 GB a month | Well under 1 GB |
| Vercel Hobby: function invocations | 1,000,000 a month | A few thousand |
| Vercel Hobby: active CPU | 4 CPU-hours a month | Minutes |
| Vercel Hobby: function duration | 300 seconds | Milliseconds |
| Vercel Hobby: cron | Daily jobs, hour precision | One daily job |
| Neon Free: storage | 1 GB per project | Under 1 MB |
| Neon Free: compute | 100 CU-hours per project a month, sleeping after 5 idle minutes | A few hours |
| Neon Free: branches | 10 per project | 2 or 3 |
| Neon Free: restore history | 6 hours | See backups |

**Expected cost: nothing**, or 10 to 15 dollars a year if you want a custom domain.

**Vercel's terms.** The plan pages I could read did not state the usage restriction, so it was not verified. My understanding is that Hobby is for personal, non-commercial use. A free, private invitation among friends is that, but the Terms of Service are read at milestone 0 before anything is deployed. If the project ever became commercial, or needed a team, the Pro plan is 20 dollars a month **(verified)**.

**When a paid plan would be needed.** Vercel Pro: only for commercial use or collaborators. Neon Launch: pay-as-you-go with no minimum **(verified)**, only if the database must not sleep or needs longer restore history. Neither is expected.

**Backup and recovery.** Neon's free restore window is six hours, which is short. So: `npm run db:dump` before every migration and whenever the guest list changes materially, and the administrator panel's Export downloads the whole event as JSON. The data is a few kilobytes.

## 10. Testing strategy

| Area | Test | Runs against |
|---|---|---|
| Domain rules and transitions | Every row of section 4.2 and every arrow and cut-off of 4.3 | Vitest, real PostgreSQL |
| Concurrent character selection | Twenty simultaneous claims on one character leave exactly one holder and nineteen conflicts. A change racing a claim leaves no guest with two characters, or with none by accident | Vitest, real PostgreSQL, parallel connections |
| Character change and removal | The old character is freed only on success. Removal flags the holder and rolls back whole if any part fails | Vitest, real PostgreSQL |
| Approval reset and amendments | Changing the proposal zeroes the count. Amending raises the plan version and the notice appears once | Vitest and Playwright |
| Dates in words | All quarter hours, month ends, both sides of noon and five o'clock, the time zone | Table-driven unit tests |
| Token security | Length and alphabet; an unknown token and a cancelled one get identical 404s; no token in another guest's response | Handler tests |
| Authentication and authorisation | Wrong passphrase, lockout, forged or expired cookie, every administrator route without a session, a guest token on an administrator route | Handler tests |
| Retention | Deletes everything at day plus thirty, nothing before, safe to run twice, 401 without the secret | Vitest with the clock set |
| Typography restrictions | No V reaches Pirata One, no numeral or name reaches Orbitron, no missing rune; a scan of `src/copy/` | Unit tests |
| Reduced motion | The opening ends on the final frame with no movement | Playwright, emulated |
| Accessibility | Keyboard through every screen; axe on every screen | Playwright |
| Layouts | Phone and desktop viewports for every screen, long names | Playwright |
| Privacy and headers | Headers present, no third-party request, identical link previews | Playwright and handler tests |
| Real devices | Phones, including a messaging app's browser and Low Power Mode; sound | A checklist by hand |
| Copy | Every line in `src/copy` appears word for word in the matching row of `COPY.md` | Unit test |
| End-to-end setup | `npm run e2e` builds, creates a fresh `iron_throne_e2e` database in the local container, serves the build on port 3311 and runs the journey at 1440×900 and 390×844 | Playwright |

No database behaviour is mocked.

## 11. Repository structure

```
doomsday-invitation/
  AGENTS.md  CLAUDE.md
  docs/                     PRODUCT_SPEC.md, COPY.md, ARCHITECTURE.md, HANDOFF.md
  design/                   specification, boards, generators (not deployed)
  references/               reference images (never deployed)
  research/
  .github/workflows/ci.yml
  web/                      the application; the only folder Vercel builds
    package.json  next.config.ts  vercel.json  drizzle.config.ts  docker-compose.yml
    drizzle/                SQL migrations
    public/
      art/  icons/  audio/              approved assets, copied from design/explorations/assets
      robots.txt
    src/
      app/
        layout.tsx
        s/[token]/          guest route
        throne/             administrator panel
        api/g/[token]/      guest handlers
        api/admin/          administrator handlers
        api/cron/retention/
      domain/               guests, characters, approval, alternatives, plan, cutoffs, retention
      db/                   schema.ts, client.ts
      components/           Panel, Well, Button, QuietControl, Heading, Label, Figure, Runes, Mark (Seal, Mask, SuitRune)
      fonts/                the four families as WOFF2, with their licences
      marks/                generated.ts, exported from the board generator
      data/                 Doomscript glyphs and the opening's layout data
      scenes/               Opening, Summons, Council, Hall, transitions
      styles/               tokens.css, app.css, surfaces.css, scenes.css, type.css
      copy/                 strings keyed by COPY.md line numbers
      lib/                  words, tokens, session, rate-limit, fit
    tests/
      domain/  handlers/  e2e/
```

## 12. Milestones

| # | Milestone | Contains | Done when |
|---|---|---|---|
| 0A | Local foundation | `web/` scaffold with Next, Tailwind v4, Drizzle; tokens, fonts, base components; approved assets copied and marks exported; Docker database; the migration runner; security headers. **Done on 15 November 2026** | A styled specimen page runs locally, the health route reads the local database, and `db:check` reaches Neon |
| 0B | Deployment foundation | Vercel project, GitHub Actions, CI, the deployment workflow, the `preview` database branch; Vercel's terms, the cron header and log retention confirmed. **Done on 16 November 2026**: staging and promotion proven by hand, then by the workflow's first production run | A styled page that reads the database deploys from `main`, with migrations finished before traffic moves |
| 1 | Schema and domain | Migrations, the domain module, date words, tokens, retention. **Done on 15 November 2026** | Domain and concurrency tests pass against PostgreSQL |
| 2 | Administrator panel | Sign-in, guests and links, characters, proposal, council view, finalise, amend, export. **Done on 16 November 2026**, verified locally; review on a preview waits for 0B | Doom can run an event end to end with no guest screens |
| 3 | Guest journey, still | Summons, decline and leave, character selection, council, proposal and alternatives, decree, closing screens, invalid link, errors. Final type and copy, no motion. **Done on 16 November 2026**, verified locally; the preview check waits for 0B | The journey passes end to end on phone and desktop, on a preview deployment |
| 4 | Opening and motion | The reveal, the title, three transitions, reduced motion, skip, tablet layouts, long-name fitting. **Done on 16 November 2026**; judged by eye on screenshots, not yet on real phones | The opening matches the storyboard and the reduced-motion path works |
| 5 | Sound | Source the sounds, wire them, controls. **Done on 16 November 2026**; the sounds are synthesised (`scripts/make-sounds.py`, `scripts/encode-sounds.sh`) and await approval by ear | Plays only after a choice; silent mode loses nothing |
| 6 | Hardening | Headers, rate limits, the cron job, accessibility and performance passes | All automated checks pass on preview |
| 7 | Devices and launch | The real-phone checklist; production data; passphrase; links sent | Guests are in |

Screens that were never drawn are built in milestones 2 to 4 from `DESIGN.md` and the approved council mock, and reviewed in the running product.

## 13. Risks and limitations

| Risk or limitation | Effect | Handling |
|---|---|---|
| Vercel Hobby's usage terms were not verified | The free plan might not be allowed | Read at milestone 0. A private, free invitation should qualify; Pro is the fallback at 20 dollars a month |
| Neon's free restore window is six hours | A mistake noticed late cannot be rolled back by the host | A dump before every migration, and the JSON export |
| Neon sleeps when idle | The first request after a quiet spell is a little slower | Acceptable; the opening covers it |
| Serverless connections | Many short connections could exhaust the database | The pooled connection string and a small per-instance pool |
| The opening on a weak phone in a messaging app | Slow or uneven | Flat layers, about 0.4 MB, static final frame as fallback, real-phone testing |
| No audio exists | Milestone 5 has nothing to wire | Free sounds chosen then. Launch does not wait |
| Free-tier terms change | A cost appears | Figures read on 15 November 2026, rechecked at milestone 0. The design needs only Node and PostgreSQL |
| The artwork follows studio-owned designs | Unsuitable for public use | The site is private, unindexed and shares nothing in previews |

## 14. Blockers and what is needed

**Genuine blockers: none.** This stack meets every requirement without any change to product, design or copy.

Needed from you before implementation begins: nothing more. The GitHub repository, the Vercel account and the Neon project exist, and the event's time zone is `Asia/Kolkata`. Milestone 0B needs a Vercel access token stored as a GitHub secret and a `preview` branch in Neon.

Later, during the build: your ear on the sounds in milestone 5, and the content you enter yourself (guests, characters, the first proposal).

## 15. Summary

- **Architecture.** One Next.js application deployed natively on Vercel, one Neon PostgreSQL database, one daily Vercel Cron job. Assets are served from `web/public/`. Tailwind v4 for layout over CSS tokens; GSAP and Howler in the browser.
- **Key decisions.** Character uniqueness is a database constraint, and a claim is a single statement whose conflict is returned as a 409. Multi-step changes are Drizzle transactions. One driver, `pg`, in production and in tests, over Neon's pooled connection. No middleware, no extra services. The domain module is free of framework code and tested against real PostgreSQL.
- **Expected cost.** Nothing on Vercel Hobby and Neon Free, plus a domain if you want one.
- **Blocking implementation.** Nothing. I need the three accounts and the time zone to start milestone 0.
