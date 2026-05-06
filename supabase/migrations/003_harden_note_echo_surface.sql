revoke all on table public.tags from anon;
revoke all on table public.tasks from anon;
revoke all on table public.notes from anon;
revoke all on table public.note_echoes from anon;

drop extension if exists pg_graphql cascade;

revoke all on table public.tags from authenticated;
revoke all on table public.tasks from authenticated;
revoke all on table public.notes from authenticated;
revoke all on table public.note_echoes from authenticated;

grant select, insert, update, delete on table public.tags to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;
grant select, insert, update, delete on table public.note_echoes to authenticated;

alter policy "tags_select_own" on public.tags to authenticated;
alter policy "tags_insert_own" on public.tags to authenticated;
alter policy "tags_update_own" on public.tags to authenticated;
alter policy "tags_delete_own" on public.tags to authenticated;

alter policy "tasks_select_own" on public.tasks to authenticated;
alter policy "tasks_insert_own" on public.tasks to authenticated;
alter policy "tasks_update_own" on public.tasks to authenticated;
alter policy "tasks_delete_own" on public.tasks to authenticated;

alter policy "notes_select_own" on public.notes to authenticated;
alter policy "notes_insert_own" on public.notes to authenticated;
alter policy "notes_update_own" on public.notes to authenticated;
alter policy "notes_delete_own" on public.notes to authenticated;

alter policy "note_echoes_select_own" on public.note_echoes to authenticated;
alter policy "note_echoes_insert_own" on public.note_echoes to authenticated;
alter policy "note_echoes_update_own" on public.note_echoes to authenticated;
alter policy "note_echoes_delete_own" on public.note_echoes to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_updated_at() from authenticated;
