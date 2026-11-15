create table slow_log (applied_at timestamptz not null default clock_timestamp());
--> statement-breakpoint
insert into slow_log default values;
--> statement-breakpoint
select pg_sleep(0.6);
