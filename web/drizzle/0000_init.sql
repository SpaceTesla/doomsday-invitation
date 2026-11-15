CREATE TABLE "admin_session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alternative" (
	"guest_id" uuid PRIMARY KEY NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt" (
	"key" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"name_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "character_name_key_unique" UNIQUE("name_key")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" integer PRIMARY KEY NOT NULL,
	"timezone" text NOT NULL,
	"proposal_at" timestamp with time zone,
	"proposal_venue" text,
	"proposal_version" integer DEFAULT 0 NOT NULL,
	"finalised_at" timestamp with time zone,
	"plan_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_single_row" CHECK ("event"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "guest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text,
	"title" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'summoned' NOT NULL,
	"character_id" uuid,
	"approved_version" integer,
	"seen_proposal" integer DEFAULT 0 NOT NULL,
	"seen_plan" integer DEFAULT 0 NOT NULL,
	"character_removed" boolean DEFAULT false NOT NULL,
	"opened_at" timestamp with time zone,
	"opening_played_at" timestamp with time zone,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answered_at" timestamp with time zone,
	CONSTRAINT "guest_token_unique" UNIQUE("token"),
	CONSTRAINT "guest_character_id_unique" UNIQUE("character_id"),
	CONSTRAINT "guest_status_known" CHECK ("guest"."status" in ('summoned', 'seated', 'declined'))
);
--> statement-breakpoint
ALTER TABLE "alternative" ADD CONSTRAINT "alternative_guest_id_guest_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest" ADD CONSTRAINT "guest_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_key_at" ON "attempt" USING btree ("key","at");