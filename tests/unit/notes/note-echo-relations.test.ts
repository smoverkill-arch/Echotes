import {
  buildRelatedNotes,
  buildSemanticNotePair,
  countDirectEchoes,
  getRelatedNoteId,
  isSameSemanticNotePair,
  sortRelatedNotes,
} from "../../../src/features/notes/utils/note-echo-relations";
import {
  buildConnectedPair,
  buildInvertedConnectedPair,
  buildNote,
  buildNoteEcho,
} from "../../support/note-echo-fixtures";

describe("note echo relation utilities", () => {
  it("normaliza par semantico e reconhece par invertido", () => {
    const { sourceNote, targetNote, invertedEcho } = buildInvertedConnectedPair();

    expect(buildSemanticNotePair(targetNote.id, sourceNote.id)).toEqual({
      leftNoteId: sourceNote.id,
      rightNoteId: targetNote.id,
    });
    expect(
      isSameSemanticNotePair(invertedEcho, sourceNote.id, targetNote.id),
    ).toBe(true);
  });

  it("conta apenas ecos diretos para cada nota", () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    const thirdNote = buildNote({
      id: "10000000-0000-4000-8000-000000000003",
    });
    const adjacentEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000003",
      from_note_id: sourceNote.id,
      to_note_id: thirdNote.id,
    });

    expect(
      countDirectEchoes([echo, adjacentEcho], [
        sourceNote.id,
        targetNote.id,
        thirdNote.id,
      ]),
    ).toEqual([
      { noteId: sourceNote.id, directCount: 2 },
      { noteId: targetNote.id, directCount: 1 },
      { noteId: thirdNote.id, directCount: 1 },
    ]);
  });

  it("mantem a mesma contagem direta para manual_link e continue_note", () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    const manualEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000004",
      from_note_id: targetNote.id,
      to_note_id: sourceNote.id,
      kind: "manual_link",
    });

    expect(countDirectEchoes([echo, manualEcho], [sourceNote.id])).toEqual([
      { noteId: sourceNote.id, directCount: 2 },
    ]);
  });

  it("ordena relacionadas do mesmo dia antes das demais e omite detalhe ausente", () => {
    const activeNote = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      day: "2026-05-01",
    });
    const sameDayNote = buildNote({
      id: "10000000-0000-4000-8000-000000000002",
      day: "2026-05-01",
      created_at: "2026-05-01T12:00:00+00:00",
    });
    const futureNote = buildNote({
      id: "10000000-0000-4000-8000-000000000003",
      day: "2026-05-02",
      created_at: "2026-05-02T12:00:00+00:00",
    });
    const missingNoteEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000003",
      from_note_id: activeNote.id,
      to_note_id: "10000000-0000-4000-8000-000000000004",
    });
    const echoes = [
      buildNoteEcho({
        id: "30000000-0000-4000-8000-000000000001",
        from_note_id: activeNote.id,
        to_note_id: futureNote.id,
      }),
      buildNoteEcho({
        id: "30000000-0000-4000-8000-000000000002",
        from_note_id: sameDayNote.id,
        to_note_id: activeNote.id,
      }),
      missingNoteEcho,
    ];
    const notesById = new Map([
      [sameDayNote.id, sameDayNote],
      [futureNote.id, futureNote],
    ]);

    const relatedNotes = buildRelatedNotes(activeNote, echoes, notesById);

    expect(relatedNotes.map((note) => note.id)).toEqual([
      sameDayNote.id,
      futureNote.id,
    ]);
    expect(getRelatedNoteId(echoes[1], activeNote.id)).toBe(sameDayNote.id);
  });

  it("ordena itens indisponiveis depois das notas disponiveis", () => {
    const activeNote = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      day: "2026-05-01",
    });
    const availableRelatedNote = {
      id: "10000000-0000-4000-8000-000000000002",
      day: "2026-05-01",
      title: "Relacionada",
      brief: null,
      created_at: "2026-05-01T11:00:00+00:00",
      kind: "manual_link" as const,
      echoId: "30000000-0000-4000-8000-000000000001",
      availability: "available" as const,
    };
    const unavailableRelatedNote = {
      id: "10000000-0000-4000-8000-000000000003",
      day: null,
      title: null,
      brief: null,
      created_at: null,
      kind: "continue_note" as const,
      echoId: "30000000-0000-4000-8000-000000000002",
      availability: "stale_detail" as const,
    };

    expect(
      sortRelatedNotes(activeNote, [
        unavailableRelatedNote,
        availableRelatedNote,
      ]).map((note) => note.id),
    ).toEqual([availableRelatedNote.id, unavailableRelatedNote.id]);
  });
});
