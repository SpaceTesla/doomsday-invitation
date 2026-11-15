-- Records which backend ran this migration and which backend holds the migration lock.
create table probe as
select
  pg_backend_pid() as migrator_pid,
  (
    select l.pid
    from pg_locks l
    where l.locktype = 'advisory'
      and l.classid = 0
      and l.objid = 1953719668
      and l.objsubid = 1
      and l.granted
      and l.database = (select oid from pg_database where datname = current_database())
  ) as lock_pid;
