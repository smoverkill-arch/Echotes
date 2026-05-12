-- RPC atomica para Continuar desta nota.

create or replace function public.continue_note(
  source_note_id uuid,
  new_note_day date,
  title text,
  brief text,
  content text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  source_note public.notes%rowtype;
  inserted_note public.notes%rowtype;
  inserted_echo public.note_echoes%rowtype;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if source_note_id is null then
    raise exception 'source note is required' using errcode = '23502';
  end if;

  if new_note_day is null then
    raise exception 'new note day is required' using errcode = '23502';
  end if;

  if title is null or length(btrim(title)) = 0 then
    raise exception 'title is required' using errcode = '23502';
  end if;

  if brief is null or length(btrim(brief)) = 0 then
    raise exception 'brief is required' using errcode = '23502';
  end if;

  select *
    into source_note
    from public.notes
   where id = source_note_id
     and user_id = current_user_id;

  if not found then
    raise exception 'source note is not accessible' using errcode = '42501';
  end if;

  if new_note_day < source_note.day::date then
    raise exception 'new note day cannot be before source note day'
      using errcode = '23514';
  end if;

  insert into public.notes (
    user_id,
    day,
    title,
    content,
    brief,
    tag_id,
    color,
    is_color_overridden
  )
  values (
    current_user_id,
    new_note_day,
    btrim(title),
    nullif(btrim(coalesce(content, '')), ''),
    btrim(brief),
    source_note.tag_id,
    source_note.color,
    source_note.is_color_overridden
  )
  returning * into inserted_note;

  insert into public.note_echoes (
    from_note_id,
    to_note_id,
    created_by_user_id,
    context_note_id,
    context_day,
    kind,
    metadata
  )
  values (
    source_note.id,
    inserted_note.id,
    current_user_id,
    source_note.id,
    source_note.day,
    'continue_note',
    null
  )
  returning * into inserted_echo;

  return jsonb_build_object(
    'newNote', to_jsonb(inserted_note),
    'noteEcho', to_jsonb(inserted_echo)
  );
end;
$$;

revoke all on function public.continue_note(uuid, date, text, text, text) from public;
revoke all on function public.continue_note(uuid, date, text, text, text) from anon;
grant execute on function public.continue_note(uuid, date, text, text, text) to authenticated;

-- Reversao:
-- drop function if exists public.continue_note(uuid, date, text, text, text);
