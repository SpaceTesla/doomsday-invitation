// The database schema. It follows docs/ARCHITECTURE.md, section 4.1, column for column.
// The database enforces the rules; the domain module reports the outcome.
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

// ---------------------------------------------------------------- organizers
//
// An organizer's account, sessions and password, in the shape Better Auth expects
// (src/lib/auth.ts). Better Auth reads and writes these tables; the application reads
// only organizer.id and organizer.name.

export const organizer = pgTable("organizer", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

export const organizerSession = pgTable(
  "organizer_session",
  {
    id: text("id").primaryKey(),
    /** The session's secret; Better Auth checks the signed cookie against it. */
    token: text("token").notNull().unique(),
    expiresAt: instant("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => organizer.id, { onDelete: "cascade" }),
    createdAt: instant("created_at").notNull().defaultNow(),
    updatedAt: instant("updated_at").notNull().defaultNow(),
  },
  (table) => [index("organizer_session_user").on(table.userId)],
);

/** The organizer's password lives here, hashed by Better Auth (scrypt). */
export const organizerAccount = pgTable(
  "organizer_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => organizer.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: instant("access_token_expires_at"),
    refreshTokenExpiresAt: instant("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: instant("created_at").notNull().defaultNow(),
    updatedAt: instant("updated_at").notNull().defaultNow(),
  },
  (table) => [index("organizer_account_user").on(table.userId)],
);

/** Unused while there is no email provider; Better Auth requires the table. */
export const organizerVerification = pgTable("organizer_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: instant("expires_at").notNull(),
  createdAt: instant("created_at").notNull().defaultNow(),
  updatedAt: instant("updated_at").notNull().defaultNow(),
});

/** Better Auth's limits on sign-in and sign-up, in the database so they hold on serverless. */
export const authRateLimit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

// ---------------------------------------------------------------- events

/**
 * An event, owned by one organizer. Every guest, character, approval and alternative
 * belongs to exactly one event. The first event (id 1) predates organizers: it has no
 * owner until it is claimed (scripts/claim-event.ts), and until then no one can manage it.
 */
export const event = pgTable(
  "event",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity({ startWith: 2 }),
    /** Null only for the first event, until it is claimed. */
    organizerId: text("organizer_id").references(() => organizer.id, { onDelete: "restrict" }),
    /** Shown beneath Doctor Doom on the council's guest list. Null shows Doom alone. */
    hostName: text("host_name"),
    timezone: text("timezone").notNull(),
    proposalAt: instant("proposal_at"),
    proposalVenue: text("proposal_venue"),
    /** Raised on each change of the proposal; approvals of older versions no longer count. */
    proposalVersion: integer("proposal_version").notNull().default(0),
    /** Null until Doom decrees the plan. */
    finalisedAt: instant("finalised_at"),
    /** Raised each time the decree is amended. */
    planVersion: integer("plan_version").notNull().default(0),
    createdAt: instant("created_at").notNull().defaultNow(),
  },
  (table) => [index("event_organizer").on(table.organizerId)],
);

export const character = pgTable(
  "character",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: integer("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Lower-cased and trimmed, so an event's roster cannot hold the same name twice. */
    nameKey: text("name_key").notNull(),
    /** The faction it is listed under (src/domain/factions.ts). Null lists it last. */
    faction: text("faction"),
    /** Its place within the faction. The seeded roster counts from 1; additions go after. */
    position: integer("position").notNull().default(1000),
    createdAt: instant("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("character_event_name_key").on(table.eventId, table.nameKey),
    check(
      "character_faction_known",
      sql`${table.faction} is null or ${table.faction} in ('avengers', 'new-avengers', 'fantastic-four', 'x-men', 'wakanda-talokan', 'multiverse-tva', 'dooms-team')`,
    ),
  ],
);

export const guestStatuses = ["summoned", "seated", "declined"] as const;
export type GuestStatus = (typeof guestStatuses)[number];

export const guest = pgTable(
  "guest",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: integer("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    /** Null when the link is cancelled. Unique across every event. */
    token: text("token").unique(),
    title: text("title").notNull().default(""),
    name: text("name").notNull(),
    status: text("status", { enum: guestStatuses }).notNull().default("summoned"),
    /**
     * Unique: one guest per character, enforced by PostgreSQL. The character is always of
     * the guest's own event: src/domain/characters.ts checks it in the claiming statement.
     */
    characterId: uuid("character_id")
      .unique()
      .references(() => character.id, { onDelete: "set null" }),
    /** The guest approves the current proposal when this equals event.proposal_version. */
    approvedVersion: integer("approved_version"),
    seenProposal: integer("seen_proposal").notNull().default(0),
    seenPlan: integer("seen_plan").notNull().default(0),
    /** Set when Doom removed the character this guest held; cleared by the next claim. */
    characterRemoved: boolean("character_removed").notNull().default(false),
    /** The name of the character Doom removed, for the message that tells the guest. */
    removedCharacterName: text("removed_character_name"),
    openedAt: instant("opened_at"),
    openingPlayedAt: instant("opening_played_at"),
    invitedAt: instant("invited_at").notNull().defaultNow(),
    answeredAt: instant("answered_at"),
  },
  (table) => [
    index("guest_event").on(table.eventId),
    check("guest_status_known", sql`${table.status} in ('summoned', 'seated', 'declined')`),
  ],
);

/** At most one active alternative per guest: the guest is the primary key. */
export const alternative = pgTable("alternative", {
  guestId: uuid("guest_id")
    .primaryKey()
    .references(() => guest.id, { onDelete: "cascade" }),
  at: instant("at").notNull(),
  createdAt: instant("created_at").notNull().defaultNow(),
});

/**
 * The single administrator's sessions, from before organizer accounts. No longer read or
 * written; kept so that the move to organizers deletes nothing.
 */
export const adminSession = pgTable("admin_session", {
  id: uuid("id").primaryKey(),
  expiresAt: instant("expires_at").notNull(),
});

/** Failed attempts, counted for rate limits. */
export const attempt = pgTable(
  "attempt",
  {
    key: text("key").notNull(),
    at: instant("at").notNull().defaultNow(),
  },
  (table) => [index("attempt_key_at").on(table.key, table.at)],
);
