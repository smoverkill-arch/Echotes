import type { Note, NoteEcho, NoteEchoKind } from "../../src/types/note";

export const NOTE_ECHO_FIXTURE_USER_ID =
  "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc";

export const NOTE_ECHO_SOURCE_DAY = "2026-05-01";
export const NOTE_ECHO_TARGET_DAY = "2026-05-02";

export interface NoteEchoCandidateFixture {
  id: string;
  day: string;
  title: string;
  brief: string | null;
  created_at: string;
  isAlreadyConnected: boolean;
}

export interface RelatedNoteFixture {
  id: string;
  day: string | null;
  title: string | null;
  brief: string | null;
  created_at: string | null;
  kind: NoteEchoKind;
  status: "available" | "unavailable";
}

export const buildNote = (
  overrides: Partial<Note> & { id: string },
): Note => {
  const day = overrides.day ?? NOTE_ECHO_SOURCE_DAY;

  return {
    id: overrides.id,
    user_id: overrides.user_id ?? NOTE_ECHO_FIXTURE_USER_ID,
    day,
    title: overrides.title ?? `Nota ${overrides.id.slice(-4)}`,
    content: overrides.content ?? `Conteudo da nota ${overrides.id.slice(-4)}`,
    brief: overrides.brief ?? null,
    tag_id: overrides.tag_id ?? null,
    color: overrides.color ?? null,
    is_color_overridden: overrides.is_color_overridden ?? false,
    created_at: overrides.created_at ?? `${day}T09:00:00+00:00`,
    updated_at: overrides.updated_at ?? `${day}T09:00:00+00:00`,
  };
};

export const buildNoteEcho = (
  overrides: Partial<NoteEcho> & {
    from_note_id: string;
    to_note_id: string;
  },
): NoteEcho => {
  if (overrides.from_note_id === overrides.to_note_id) {
    throw new Error("Fixture de eco nao pode conectar uma nota a ela mesma.");
  }

  return {
    id: overrides.id ?? "30000000-0000-4000-8000-000000000001",
    from_note_id: overrides.from_note_id,
    to_note_id: overrides.to_note_id,
    created_by_user_id:
      overrides.created_by_user_id ?? NOTE_ECHO_FIXTURE_USER_ID,
    created_at: overrides.created_at ?? `${NOTE_ECHO_SOURCE_DAY}T10:00:00+00:00`,
    context_note_id: overrides.context_note_id ?? overrides.from_note_id,
    context_day: overrides.context_day ?? NOTE_ECHO_SOURCE_DAY,
    kind: overrides.kind ?? "manual_link",
    metadata: overrides.metadata ?? null,
  };
};

export const buildConnectedPair = () => {
  const sourceNote = buildNote({
    id: "10000000-0000-4000-8000-000000000001",
    title: "Origem da ideia",
  });
  const targetNote = buildNote({
    id: "10000000-0000-4000-8000-000000000002",
    day: NOTE_ECHO_TARGET_DAY,
    title: "Continuidade futura",
    created_at: `${NOTE_ECHO_TARGET_DAY}T11:00:00+00:00`,
    updated_at: `${NOTE_ECHO_TARGET_DAY}T11:00:00+00:00`,
  });
  const echo = buildNoteEcho({
    id: "30000000-0000-4000-8000-000000000001",
    from_note_id: sourceNote.id,
    to_note_id: targetNote.id,
    kind: "continue_note",
  });

  return { sourceNote, targetNote, echo };
};

export const buildInvertedConnectedPair = () => {
  const { sourceNote, targetNote } = buildConnectedPair();
  const invertedEcho = buildNoteEcho({
    id: "30000000-0000-4000-8000-000000000002",
    from_note_id: targetNote.id,
    to_note_id: sourceNote.id,
    context_note_id: targetNote.id,
    context_day: NOTE_ECHO_TARGET_DAY,
    kind: "manual_link",
  });

  return { sourceNote, targetNote, invertedEcho };
};

export const buildUnavailableRelatedNote = (
  echo: NoteEcho,
): RelatedNoteFixture => ({
  id: echo.to_note_id,
  day: null,
  title: null,
  brief: null,
  created_at: null,
  kind: echo.kind,
  status: "unavailable",
});

export const buildCandidatePage = (
  total = 51,
): NoteEchoCandidateFixture[] =>
  Array.from({ length: total }, (_, index) => {
    const position = index + 1;
    const suffix = String(position).padStart(3, "0");

    return {
      id: `20000000-0000-4000-8000-000000000${suffix}`,
      day: position % 2 === 0 ? NOTE_ECHO_TARGET_DAY : NOTE_ECHO_SOURCE_DAY,
      title: `Candidata ${suffix}`,
      brief: position === 1 ? "Eco ja existente" : null,
      created_at: `${NOTE_ECHO_SOURCE_DAY}T${String(23 - (index % 12)).padStart(
        2,
        "0",
      )}:00:00+00:00`,
      isAlreadyConnected: position === 1,
    };
  });

export const noteEchoFixtureSet = {
  ...buildConnectedPair(),
  invertedPair: buildInvertedConnectedPair(),
  candidatePage: buildCandidatePage(),
};
