create extension if not exists pgcrypto;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),

  constraint tags_name_not_empty check (char_length(trim(name)) > 0)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  tag_id uuid references public.tags(id) on delete set null,
  color text,
  is_color_overridden boolean not null default false,
  source_day date not null,
  target_day date not null,
  created_at timestamptz not null default now(),
  scheduled_at timestamptz,
  status text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint tasks_title_not_empty check (char_length(trim(title)) > 0),
  constraint tasks_scheduled_after_created_at check (
    scheduled_at is null or scheduled_at > created_at
  )
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  title text not null,
  content text,
  brief text,
  tag_id uuid references public.tags(id) on delete set null,
  color text,
  is_color_overridden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notes_title_not_empty check (char_length(trim(title)) > 0)
);

create table if not exists public.note_echoes (
  id uuid primary key default gen_random_uuid(),
  from_note_id uuid not null references public.notes(id) on delete cascade,
  to_note_id uuid not null references public.notes(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  context_note_id uuid references public.notes(id) on delete set null,
  context_day date,
  kind text not null check (kind in ('manual_link', 'continue_note')),
  metadata jsonb,

  constraint note_echoes_not_self check (from_note_id <> to_note_id)
);

create unique index if not exists idx_tags_user_name
  on public.tags (user_id, name);

create unique index if not exists idx_note_echoes_unique_pair
  on public.note_echoes (
    least(from_note_id, to_note_id),
    greatest(from_note_id, to_note_id)
  );

create index if not exists idx_tasks_user_target_day
  on public.tasks (user_id, target_day);

create index if not exists idx_tasks_user_source_day
  on public.tasks (user_id, source_day);

create index if not exists idx_tasks_user_created_at
  on public.tasks (user_id, created_at);

create index if not exists idx_tasks_user_scheduled_at
  on public.tasks (user_id, scheduled_at);

create index if not exists idx_notes_user_day
  on public.notes (user_id, day);

create index if not exists idx_notes_user_created_at
  on public.notes (user_id, created_at);

create index if not exists idx_note_echoes_from_note_id
  on public.note_echoes (from_note_id);

create index if not exists idx_note_echoes_to_note_id
  on public.note_echoes (to_note_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.note_echoes enable row level security;

drop policy if exists "tags_select_own" on public.tags;
create policy "tags_select_own"
on public.tags for select
using (auth.uid() = user_id);

drop policy if exists "tags_insert_own" on public.tags;
create policy "tags_insert_own"
on public.tags for insert
with check (auth.uid() = user_id);

drop policy if exists "tags_update_own" on public.tags;
create policy "tags_update_own"
on public.tags for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tags_delete_own" on public.tags;
create policy "tags_delete_own"
on public.tags for delete
using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own"
on public.tasks for select
using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own"
on public.tasks for insert
with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own"
on public.tasks for delete
using (auth.uid() = user_id);

drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own"
on public.notes for select
using (auth.uid() = user_id);

drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own"
on public.notes for insert
with check (auth.uid() = user_id);

drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own"
on public.notes for delete
using (auth.uid() = user_id);

drop policy if exists "note_echoes_select_own" on public.note_echoes;
create policy "note_echoes_select_own"
on public.note_echoes for select
using (
  exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = auth.uid()
  )
);

drop policy if exists "note_echoes_insert_own" on public.note_echoes;
create policy "note_echoes_insert_own"
on public.note_echoes for insert
with check (
  created_by_user_id = auth.uid()
  and exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = auth.uid()
  )
);

drop policy if exists "note_echoes_update_own" on public.note_echoes;
create policy "note_echoes_update_own"
on public.note_echoes for update
using (
  created_by_user_id = auth.uid()
  and exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = auth.uid()
  )
)
with check (
  created_by_user_id = auth.uid()
  and exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = auth.uid()
  )
);

drop policy if exists "note_echoes_delete_own" on public.note_echoes;
create policy "note_echoes_delete_own"
on public.note_echoes for delete
using (
  exists (
    select 1
    from public.notes from_note
    where from_note.id = from_note_id
      and from_note.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.notes to_note
    where to_note.id = to_note_id
      and to_note.user_id = auth.uid()
  )
);
