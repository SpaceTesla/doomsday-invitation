// The database schema. It follows docs/ARCHITECTURE.md, section 4.1, column for column.
// The database enforces the rules; the domain module reports the outcome.
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const instant = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

/** One event. The check keeps it to a single row. */
export const event = pgTable(
  "event",
  {
    id: integer("id").primaryKey(),
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
  (table) => [check("event_single_row", sql`${table.id} = 1`)],
);

export const character = pgTable("character", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** Lower-cased and trimmed, so the roster cannot hold the same name twice. */
  nameKey: text("name_key").notNull().unique(),
  createdAt: instant("created_at").notNull().defaultNow(),
});

export const guestStatuses = ["summoned", "seated", "declined"] as const;
export type GuestStatus = (typeof guestStatuses)[number];

export const guest = pgTable(
  "guest",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Null when the link is cancelled. */
    token: text("token").unique(),
    title: text("title").notNull().default(""),
    name: text("name").notNull(),
    status: text("status", { enum: guestStatuses }).notNull().default("summoned"),
    /** Unique: one guest per character, enforced by PostgreSQL. */
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
