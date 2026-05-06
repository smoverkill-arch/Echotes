import type {
  DirectEchoCount,
  Note,
  NoteEcho,
  RelatedNote,
} from "../../../types/note";

export interface SemanticNotePair {
  leftNoteId: string;
  rightNoteId: string;
}

export const buildSemanticNotePair = (
  firstNoteId: string,
  secondNoteId: string,
): SemanticNotePair => {
  if (firstNoteId === secondNoteId) {
    throw new Error("Uma nota nao pode criar eco com ela mesma.");
  }

  const [leftNoteId, rightNoteId] = [firstNoteId, secondNoteId].sort();

  return { leftNoteId, rightNoteId };
};

export const isSameSemanticNotePair = (
  echo: Pick<NoteEcho, "from_note_id" | "to_note_id">,
  firstNoteId: string,
  secondNoteId: string,
) => {
  const echoPair = buildSemanticNotePair(echo.from_note_id, echo.to_note_id);
  const expectedPair = buildSemanticNotePair(firstNoteId, secondNoteId);

  return (
    echoPair.leftNoteId === expectedPair.leftNoteId &&
    echoPair.rightNoteId === expectedPair.rightNoteId
  );
};

export const getRelatedNoteId = (echo: NoteEcho, activeNoteId: string) => {
  if (echo.from_note_id === activeNoteId) {
    return echo.to_note_id;
  }

  if (echo.to_note_id === activeNoteId) {
    return echo.from_note_id;
  }

  return null;
};

export const countDirectEchoes = (
  echoes: NoteEcho[],
  noteIds: string[],
): DirectEchoCount[] => {
  const counts = new Map(noteIds.map((noteId) => [noteId, 0]));

  for (const echo of echoes) {
    if (counts.has(echo.from_note_id)) {
      counts.set(echo.from_note_id, (counts.get(echo.from_note_id) ?? 0) + 1);
    }

    if (counts.has(echo.to_note_id)) {
      counts.set(echo.to_note_id, (counts.get(echo.to_note_id) ?? 0) + 1);
    }
  }

  return noteIds.map((noteId) => ({
    noteId,
    directCount: counts.get(noteId) ?? 0,
  }));
};

export const sortRelatedNotes = (
  activeNote: Pick<Note, "day">,
  relatedNotes: RelatedNote[],
): RelatedNote[] =>
  [...relatedNotes].sort((left, right) => {
    const leftSameDay = left.day === activeNote.day;
    const rightSameDay = right.day === activeNote.day;

    if (leftSameDay !== rightSameDay) {
      return leftSameDay ? -1 : 1;
    }

    const leftDay = left.day ?? "";
    const rightDay = right.day ?? "";

    if (!leftSameDay && leftDay !== rightDay) {
      return rightDay.localeCompare(leftDay);
    }

    const createdCompare = String(right.created_at ?? "").localeCompare(
      String(left.created_at ?? ""),
    );

    if (createdCompare !== 0) {
      return createdCompare;
    }

    return right.id.localeCompare(left.id);
  });

export const buildRelatedNotes = (
  activeNote: Note,
  echoes: NoteEcho[],
  notesById: Map<string, Note>,
): RelatedNote[] => {
  const relatedNotes: RelatedNote[] = [];

  for (const echo of echoes) {
    const relatedNoteId = getRelatedNoteId(echo, activeNote.id);

    if (!relatedNoteId) {
      continue;
    }

    const note = notesById.get(relatedNoteId);

    if (!note) {
      continue;
    }

    relatedNotes.push({
      id: relatedNoteId,
      day: note.day,
      title: note.title,
      brief: note.brief,
      created_at: note.created_at,
      kind: echo.kind,
      echoId: echo.id,
      availability: "available",
    });
  }

  return sortRelatedNotes(activeNote, relatedNotes);
};
