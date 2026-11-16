ALTER TABLE "character" ADD COLUMN "faction" text;--> statement-breakpoint
ALTER TABLE "character" ADD COLUMN "position" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE "character" ADD CONSTRAINT "character_faction_known" CHECK ("character"."faction" is null or "character"."faction" in ('avengers', 'new-avengers', 'fantastic-four', 'x-men', 'wakanda-talokan', 'multiverse-tva', 'dooms-team'));
--> statement-breakpoint
-- The Doomsday roster, grouped by faction (38 characters). Seeded once, by this
-- migration, so a character Doom removes in the panel stays removed. A character of
-- the same name already on the roster is moved into its faction, not duplicated.
-- Doctor Doom is not here: he is never a mantle (docs/PRODUCT_SPEC.md, Stage 3).
-- Rumoured appearances (Wolverine, Deadpool, Spider-Man / Peter 2, and Doom's team) are
-- listed like the rest; guests are not told which are rumoured.
INSERT INTO "character" ("name", "name_key", "faction", "position") VALUES
  ('Captain America / Sam Wilson', 'captain america / sam wilson', 'avengers', 1),
  ('Captain America / Steve Rogers', 'captain america / steve rogers', 'avengers', 2),
  ('Thor', 'thor', 'avengers', 3),
  ('Ant-Man', 'ant-man', 'avengers', 4),
  ('Shang-Chi', 'shang-chi', 'avengers', 5),
  ('Falcon / Joaquin Torres', 'falcon / joaquin torres', 'avengers', 6),
  ('Yelena Belova', 'yelena belova', 'new-avengers', 1),
  ('Winter Soldier', 'winter soldier', 'new-avengers', 2),
  ('Sentry', 'sentry', 'new-avengers', 3),
  ('Ghost', 'ghost', 'new-avengers', 4),
  ('U.S. Agent', 'u.s. agent', 'new-avengers', 5),
  ('Red Guardian', 'red guardian', 'new-avengers', 6),
  ('Reed Richards / Mister Fantastic', 'reed richards / mister fantastic', 'fantastic-four', 1),
  ('Sue Storm / Invisible Woman', 'sue storm / invisible woman', 'fantastic-four', 2),
  ('Johnny Storm / Human Torch', 'johnny storm / human torch', 'fantastic-four', 3),
  ('Ben Grimm / The Thing', 'ben grimm / the thing', 'fantastic-four', 4),
  ('Professor X', 'professor x', 'x-men', 1),
  ('Magneto', 'magneto', 'x-men', 2),
  ('Cyclops', 'cyclops', 'x-men', 3),
  ('Mystique', 'mystique', 'x-men', 4),
  ('Nightcrawler', 'nightcrawler', 'x-men', 5),
  ('Beast', 'beast', 'x-men', 6),
  ('Gambit', 'gambit', 'x-men', 7),
  ('Wolverine', 'wolverine', 'x-men', 8),
  ('Deadpool', 'deadpool', 'x-men', 9),
  ('Black Panther / Shuri', 'black panther / shuri', 'wakanda-talokan', 1),
  ('M''Baku', 'm''baku', 'wakanda-talokan', 2),
  ('Namor', 'namor', 'wakanda-talokan', 3),
  ('Namora', 'namora', 'wakanda-talokan', 4),
  ('Spider-Man / Peter 2', 'spider-man / peter 2', 'multiverse-tva', 1),
  ('Loki', 'loki', 'multiverse-tva', 2),
  ('Mobius', 'mobius', 'multiverse-tva', 3),
  ('Peggy Carter', 'peggy carter', 'multiverse-tva', 4),
  ('Hulk', 'hulk', 'dooms-team', 1),
  ('Scarlet Witch', 'scarlet witch', 'dooms-team', 2),
  ('Clea', 'clea', 'dooms-team', 3),
  ('Sylvie', 'sylvie', 'dooms-team', 4),
  ('Doctor Strange', 'doctor strange', 'dooms-team', 5)
ON CONFLICT ("name_key") DO UPDATE SET "faction" = EXCLUDED."faction", "position" = EXCLUDED."position";
