create index if not exists idx_tasks_tag_id
  on public.tasks (tag_id);

create index if not exists idx_notes_tag_id
  on public.notes (tag_id);

create index if not exists idx_note_echoes_created_by_user_id
  on public.note_echoes (created_by_user_id);

create index if not exists idx_note_echoes_context_note_id
  on public.note_echoes (context_note_id);

drop policy if exists "tags_select_own" on public.tags;
create policy "tags_select_own"
on public.tags for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "tags_insert_own" on public.tags;
create policy "tags_insert_own"
on public.tags for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "tags_update_own" on public.tags;
create policy "tags_update_own"
on public.tags for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "tags_delete_own" on public.tags;
create policy "tags_delete_own"
on public.tags for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own"
on public.notes for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own"
on public.notes for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own"
on public.notes for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own"
on public.notes for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "note_echoes_select_own" on public.note_echoes;
create policy "note_echoes_select_own"
on public.note_echoes for select
to authenticated
using (
  exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = (select auth.uid())
  )
);

drop policy if exists "note_echoes_insert_own" on public.note_echoes;
create policy "note_echoes_insert_own"
on public.note_echoes for insert
to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = (select auth.uid())
  )
);

drop policy if exists "note_echoes_update_own" on public.note_echoes;
create policy "note_echoes_update_own"
on public.note_echoes for update
to authenticated
using (
  created_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = (select auth.uid())
  )
)
with check (
  created_by_user_id = (select auth.uid())
  and exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = (select auth.uid())
  )
);

drop policy if exists "note_echoes_delete_own" on public.note_echoes;
create policy "note_echoes_delete_own"
on public.note_echoes for delete
to authenticated
using (
  exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = (select auth.uid())
  )
);
