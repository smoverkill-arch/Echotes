import { createNoteEcho } from "../../../src/features/notes/api/create-note-echo";
import { deleteNoteEcho } from "../../../src/features/notes/api/delete-note-echo";
import {
  listNoteEchoes,
  listRelatedNoteDetails,
} from "../../../src/features/notes/api/list-note-echoes";
import { listNoteCandidates } from "../../../src/features/notes/api/list-note-candidates";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildCandidatePage,
  buildConnectedPair,
  buildNote,
  NOTE_ECHO_FIXTURE_USER_ID,
  NOTE_ECHO_SOURCE_DAY,
} from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockSupabase = createSupabaseNoteEchoMock();
let mockIsSupabaseConfigured = true;
let mockSupabaseConfigurationError: string | null = null;

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabase.client,
  getSupabaseConfigurationError: () => mockSupabaseConfigurationError,
  get isSupabaseConfigured() {
    return mockIsSupabaseConfigured;
  },
}));

const authenticatedSession: AuthenticatedSession = {
  userId: NOTE_ECHO_FIXTURE_USER_ID,
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

describe("note echo APIs", () => {
  beforeEach(() => {
    mockSupabase.reset();
    mockIsSupabaseConfigured = true;
    mockSupabaseConfigurationError = null;

    useAuthStore.setState({
      status: "authenticated",
      session: authenticatedSession,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: true,
    });
  });

  it("bloqueia leitura de ecos sem sessao antes de consultar Supabase", async () => {
    useAuthStore.setState({
      status: "unauthenticated",
      session: null,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: false,
    });

    const result = await listNoteEchoes([
      "10000000-0000-4000-8000-000000000001",
    ]);

    expect(result).toEqual({
      ok: false,
      echoes: [],
      errorMessage: "Sua sessao expirou. Entre novamente.",
    });
    expect(useAuthStore.getState().status).toBe("session_expired");
    expect(mockSupabase.queryCalls).toEqual([]);
  });

  it("carrega detalhes relacionados indisponiveis como item recuperavel", async () => {
    const { sourceNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult("notes", mockSupabase.ok([]));

    const result = await listRelatedNoteDetails(sourceNote, [echo]);

    expect(result.ok).toBe(true);
    expect(result.relatedNotes).toEqual([
      {
        id: echo.to_note_id,
        day: null,
        title: null,
        brief: null,
        created_at: null,
        kind: "continue_note",
        echoId: echo.id,
        availability: "transient_unavailable",
      },
    ]);
  });

  it("pagina candidatas com cursor estavel e marca Eco ja existe", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    const futureCandidate = buildNote({
      id: "20000000-0000-4000-8000-000000000003",
      day: "2026-05-03",
      title: "Outra futura",
      created_at: "2026-05-03T12:00:00+00:00",
    });
    const sameDayCandidate = buildNote({
      id: "20000000-0000-4000-8000-000000000004",
      day: NOTE_ECHO_SOURCE_DAY,
      title: "Mesmo dia",
      created_at: "2026-05-01T08:00:00+00:00",
    });
    mockSupabase.enqueueTableResult(
      "notes",
      mockSupabase.ok([futureCandidate, targetNote, sameDayCandidate]),
    );

    const firstPage = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [echo],
      pageSize: 1,
    });

    expect(firstPage.ok).toBe(true);
    expect(firstPage.page.items).toEqual([
      expect.objectContaining({
        id: sameDayCandidate.id,
        isAlreadyConnected: false,
      }),
    ]);
    expect(firstPage.page.nextCursor).toEqual({
      isSelectedDayGroup: true,
      day: sameDayCandidate.day,
      created_at: sameDayCandidate.created_at,
      id: sameDayCandidate.id,
    });

    mockSupabase.enqueueTableResult(
      "notes",
      mockSupabase.ok([futureCandidate, targetNote, sameDayCandidate]),
    );

    const secondPage = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [echo],
      cursor: firstPage.page.nextCursor,
      pageSize: 2,
    });

    expect(secondPage.page.items.map((candidate) => candidate.id)).toEqual([
      futureCandidate.id,
      targetNote.id,
    ]);
    expect(secondPage.page.items[1].isAlreadyConnected).toBe(true);
    expect(secondPage.page.nextCursor).toBeNull();
  });

  it("reconcilia criacao duplicada preservando kind original", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("duplicate key value violates unique constraint"),
    );
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok([echo]));

    const result = await createNoteEcho({
      from_note_id: targetNote.id,
      to_note_id: sourceNote.id,
      kind: "manual_link",
      context_note_id: targetNote.id,
      context_day: targetNote.day,
    });

    expect(result).toEqual({
      ok: true,
      status: "already_exists",
      echo,
      errorMessage: null,
    });
    expect(result.echo?.kind).toBe("continue_note");
  });

  it("classifica falha tecnica de reconciliacao como retryable", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("duplicate key value violates unique constraint"),
    );
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.error("timeout"));

    const result = await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });

    expect(result.status).toBe("retryable_failure");
    expect(result.errorMessage).toContain("timeout");
  });

  it("remove eco por echoId somente junto do par selecionado e preserva notas", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok([echo]));
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok([]));

    const result = await deleteNoteEcho({
      echoId: echo.id,
      noteIdA: sourceNote.id,
      noteIdB: targetNote.id,
    });

    expect(result).toEqual({
      ok: true,
      status: "deleted",
      errorMessage: null,
    });
    expect(mockSupabase.queryCalls).toEqual(
      expect.arrayContaining([
        { table: "note_echoes", operation: "delete", args: [] },
        { table: "note_echoes", operation: "eq", args: ["id", echo.id] },
        expect.objectContaining({
          table: "note_echoes",
          operation: "or",
          args: [
            expect.stringContaining(`from_note_id.eq.${sourceNote.id}`),
          ],
        }),
      ]),
    );
    expect(
      mockSupabase.queryCalls.some((call) => call.table === "notes"),
    ).toBe(false);
  });

  it("aceita pagina de fixture grande para cobertura de lote de 51 candidatas", () => {
    expect(buildCandidatePage()).toHaveLength(51);
  });
});
