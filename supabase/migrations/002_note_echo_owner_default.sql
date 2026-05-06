alter table public.note_echoes
  alter column created_by_user_id set default auth.uid();
