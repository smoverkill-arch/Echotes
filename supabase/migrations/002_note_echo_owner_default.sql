-- Forward migration for databases created before migration 001 included the
-- auth.uid() default on note_echoes.created_by_user_id. On fresh databases
-- where 001 already applied the default, this is a safe no-op.
alter table public.note_echoes
  alter column created_by_user_id set default auth.uid();
