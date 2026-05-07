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
  buildNoteEcho,
  buildNote,
  NOTE_ECHO_FIXTURE_USER_ID,
  NOTE_ECHO_SOURCE_DAY,
} from "../../support/note-echo-fixtures";
import {
  createSupabaseNoteEchoMock,
} from "../../support/supabase-note-echo-mock";

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
      status: "not_accessible",
    });
    expect(useAuthStore.getState().status).toBe("session_expired");
    expect(mockSupabase.queryCalls).toEqual([]);
  });

  it("preserva eco com stale_detail quando detalhe relacionado nao retorna", async () => {
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
        kind: echo.kind,
        echoId: echo.id,
        availability: "stale_detail",
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
    mockSupabase.setTableRows("notes", [
      sourceNote,
      futureCandidate,
      targetNote,
      sameDayCandidate,
    ]);

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
    expect(
      mockSupabase.queryCalls.filter(
        (call) => call.table === "notes" && call.operation === "range",
      ),
    ).toEqual([
      { table: "notes", operation: "range", args: [0, 1] },
      { table: "notes", operation: "range", args: [0, 0] },
      { table: "notes", operation: "range", args: [0, 2] },
      { table: "notes", operation: "range", args: [0, 2] },
    ]);
    expect(
      firstPage.page.items.some((candidate) => candidate.id === sourceNote.id),
    ).toBe(false);
  });

  it("reconcilia criacao duplicada preservando kind original", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("duplicate key value violates unique constraint", {
        code: "23505",
      }),
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
      mockSupabase.error("duplicate key value violates unique constraint", {
        code: "23505",
      }),
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

  it("propaga not_accessible quando reconciliacao de duplicidade falha por acesso", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("duplicate key value violates unique constraint", {
        code: "23505",
      }),
    );
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("JWT expired", { status: 401 }),
    );

    const result = await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });

    expect(result.status).toBe("not_accessible");
    expect(result.errorMessage).toContain("JWT expired");
  });

  it("nao envia created_by_user_id nem user id na criacao manual", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok(echo));

    const result = await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
      context_note_id: sourceNote.id,
      context_day: sourceNote.day,
    });
    const insertCall = mockSupabase.queryCalls.find(
      (call) => call.table === "note_echoes" && call.operation === "insert",
    );

    expect(result.status).toBe("created");
    expect(insertCall?.args[0]).not.toHaveProperty("created_by_user_id");
    expect(JSON.stringify(insertCall?.args[0])).not.toContain(
      authenticatedSession.userId,
    );
  });

  it("bloqueia payload invalido de criacao/remocao antes de consultar Supabase", async () => {
    const result = await createNoteEcho({
      from_note_id: "10000000-0000-4000-8000-000000000001",
      to_note_id: "10000000-0000-4000-8000-000000000001",
      kind: "manual_link",
    });
    const deleteResult = await deleteNoteEcho({
      noteIdA: "10000000-0000-4000-8000-000000000001",
      noteIdB: "10000000-0000-4000-8000-000000000001",
    });

    expect(result.status).toBe("invalid_input");
    expect(deleteResult.status).toBe("invalid_input");
    expect(mockSupabase.queryCalls).toEqual([]);
  });

  it("nao reconcilia duplicidade por mensagem sem codigo 23505", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("duplicate timeout on unique connection", {
        code: "PGRST500",
      }),
    );

    const result = await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });

    expect(result.status).toBe("retryable_failure");
    expect(
      mockSupabase.queryCalls.filter(
        (call) => call.table === "note_echoes" && call.operation === "select",
      ),
    ).toHaveLength(1);
  });

  it("classifica erro 401 de criacao como not_accessible", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("JWT expired", { status: 401 }),
    );

    const result = await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });

    expect(result.status).toBe("not_accessible");
  });

  it("bloqueia listagem de candidatas sem sessao antes de consultar Supabase", async () => {
    const { sourceNote } = buildConnectedPair();
    useAuthStore.setState({
      status: "unauthenticated",
      session: null,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: false,
    });

    const result = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [],
    });

    expect(result).toEqual({
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: "Sua sessao expirou. Entre novamente.",
      status: "not_accessible",
    });
    expect(useAuthStore.getState().status).toBe("session_expired");
    expect(mockSupabase.queryCalls).toEqual([]);
  });

  it("retorna erro de configuracao em leituras antes de consultar Supabase", async () => {
    const { sourceNote } = buildConnectedPair();
    mockIsSupabaseConfigured = false;
    mockSupabaseConfigurationError = "Supabase URL ausente.";

    const echoesResult = await listNoteEchoes([sourceNote.id]);
    const candidatesResult = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [],
    });

    expect(echoesResult).toEqual({
      ok: false,
      echoes: [],
      errorMessage: "Supabase URL ausente.",
      status: "not_accessible",
    });
    expect(candidatesResult).toEqual({
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: "Supabase URL ausente.",
      status: "not_accessible",
    });
    expect(mockSupabase.queryCalls).toEqual([]);
    expect(useAuthStore.getState().status).toBe("config_error");
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

  it("classifica erro 403 de remocao como not_accessible", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("permission denied for table note_echoes", {
        status: 403,
      }),
    );

    const result = await deleteNoteEcho({
      echoId: echo.id,
      noteIdA: sourceNote.id,
      noteIdB: targetNote.id,
    });

    expect(result.status).toBe("not_accessible");
  });

  it("propaga not_accessible quando reload de reconciliacao apos delete falha por RLS", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok([echo]));
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("new row violates row-level security policy"),
    );

    const result = await deleteNoteEcho({
      echoId: echo.id,
      noteIdA: sourceNote.id,
      noteIdB: targetNote.id,
    });

    expect(result.status).toBe("not_accessible");
    expect(result.errorMessage).toContain("row-level security");
  });

  it("preserva relacao adjacente A-C ao remover somente A-B pelo mock compartilhado", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    const adjacentNote = buildNote({
      id: "10000000-0000-4000-8000-000000000003",
      day: NOTE_ECHO_SOURCE_DAY,
      title: "Adjacente",
    });
    const adjacentEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000003",
      from_note_id: sourceNote.id,
      to_note_id: adjacentNote.id,
    });
    mockSupabase.setTableRows("note_echoes", [echo, adjacentEcho]);

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
    expect(mockSupabase.getTableRows("note_echoes")).toEqual([adjacentEcho]);
    const reconciliationSelects = mockSupabase.queryCalls.filter(
      (call) => call.table === "note_echoes" && call.operation === "select",
    );
    expect(reconciliationSelects).toHaveLength(2);
    expect(mockSupabase.queryCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: "note_echoes",
          operation: "or",
          args: [
            `and(from_note_id.eq.${sourceNote.id},to_note_id.eq.${targetNote.id}),and(from_note_id.eq.${targetNote.id},to_note_id.eq.${sourceNote.id})`,
          ],
        }),
      ]),
    );
  });

  it("mantem erros 5xx como retryable_failure", async () => {
    const { sourceNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("upstream unavailable", { status: 503 }),
    );

    const result = await listNoteEchoes([sourceNote.id]);

    expect(result.status).toBe("retryable_failure");
    expect(result.errorMessage).toContain("upstream unavailable");
  });

  it("preserva mensagem de erro Supabase em objeto puro", async () => {
    const { sourceNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.plainError("permission denied by RLS", { status: 403 }),
    );

    const result = await listNoteEchoes([sourceNote.id]);

    expect(result.status).toBe("not_accessible");
    expect(result.errorMessage).toBe(
      "Nao foi possivel carregar ecos. permission denied by RLS",
    );
  });

  it.each([
    ["401", mockSupabase.error("Unauthorized", { status: 401 })],
    ["403", mockSupabase.error("Forbidden", { status: 403 })],
    ["JWT", mockSupabase.error("JWT expired")],
    [
      "RLS",
      mockSupabase.error("new row violates row-level security policy"),
    ],
    ["permission", mockSupabase.error("permission denied for table notes")],
  ])(
    "classifica erro de leitura %s como not_accessible apos preflight",
    async (_label, errorResult) => {
      const { sourceNote, echo } = buildConnectedPair();

      mockSupabase.enqueueTableResult("note_echoes", errorResult);
      const echoesResult = await listNoteEchoes([sourceNote.id]);

      expect(echoesResult.ok).toBe(false);
      expect(echoesResult.status).toBe("not_accessible");
      expect(echoesResult.errorMessage).not.toBe(
        "Sua sessao expirou. Entre novamente.",
      );

      mockSupabase.reset();
      mockSupabase.enqueueTableResult("notes", errorResult);
      const detailsResult = await listRelatedNoteDetails(sourceNote, [echo]);

      expect(detailsResult.ok).toBe(true);
      expect(detailsResult.relatedNotes).toHaveLength(1);
      expect(detailsResult.relatedNotes[0]).toMatchObject({
        availability: "stale_detail",
        echoId: echo.id,
      });

      mockSupabase.reset();
      mockSupabase.enqueueTableResult("notes", errorResult);
      const candidatesResult = await listNoteCandidates({
        sourceNoteId: sourceNote.id,
        selectedDay: NOTE_ECHO_SOURCE_DAY,
        existingEchoes: [],
      });

      expect(candidatesResult.ok).toBe(false);
      expect(candidatesResult.status).toBe("not_accessible");
      expect(candidatesResult.page).toEqual({ items: [], nextCursor: null });
    },
  );

  it("aceita pagina de fixture grande para cobertura de lote de 51 candidatas", () => {
    expect(buildCandidatePage()).toHaveLength(51);
  });

  // TD030: graceful degradation when related-note details query fails transiently
  it("degrada graciosamente para UnavailableRelatedNote quando consulta de detalhes falha por auth", async () => {
    const { sourceNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "notes",
      mockSupabase.error("JWT expired"),
    );

    const result = await listRelatedNoteDetails(sourceNote, [echo]);

    expect(result.ok).toBe(true);
    expect(result.relatedNotes).toHaveLength(1);
    expect(result.relatedNotes[0]).toMatchObject({
      id: echo.to_note_id,
      availability: "stale_detail",
      day: null,
      title: null,
      brief: null,
      created_at: null,
      kind: echo.kind,
      echoId: echo.id,
    });
  });

  // TD031: delete A→B by echoId preserves B→A and succeeds
  it("deleta eco A→B por echoId sem confundir par semantico B→A na verificacao", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    const forwardEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000010",
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });
    const invertedEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000011",
      from_note_id: targetNote.id,
      to_note_id: sourceNote.id,
      kind: "manual_link",
    });
    mockSupabase.setTableRows("note_echoes", [forwardEcho, invertedEcho]);

    const result = await deleteNoteEcho({
      echoId: forwardEcho.id,
      noteIdA: sourceNote.id,
      noteIdB: targetNote.id,
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("deleted");
    expect(mockSupabase.getTableRows("note_echoes")).toEqual([invertedEcho]);
  });

  // TD032: context field defaults in createNoteEcho
  it("usa from_note_id como context_note_id quando omitido, e persiste context_day como null", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok(echo));

    await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });

    const insertCall = mockSupabase.queryCalls.find(
      (call) => call.table === "note_echoes" && call.operation === "insert",
    );

    expect(insertCall?.args[0]).toMatchObject({
      context_note_id: sourceNote.id,
      context_day: null,
    });
  });

  it("usa from_note_id como context_note_id quando context_note_id explicito e null", async () => {
    const { sourceNote, targetNote, echo } = buildConnectedPair();
    mockSupabase.enqueueTableResult("note_echoes", mockSupabase.ok(echo));

    await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
      context_note_id: null,
    });

    const insertCall = mockSupabase.queryCalls.find(
      (call) => call.table === "note_echoes" && call.operation === "insert",
    );

    expect(insertCall?.args[0]).toMatchObject({
      context_note_id: sourceNote.id,
    });
  });

  // TD033: pagination cursor boundary transitions from selectedDay to otherDay group
  it("transiciona cursor de isSelectedDayGroup=true para false ao esgotar notas do dia selecionado", async () => {
    const sourceNote = buildNote({ id: "10000000-0000-4000-8000-000000000001" });
    const sd1 = buildNote({
      id: "50000000-0000-4000-8000-000000000001",
      day: NOTE_ECHO_SOURCE_DAY,
      created_at: "2026-05-01T12:00:00+00:00",
    });
    const sd2 = buildNote({
      id: "50000000-0000-4000-8000-000000000002",
      day: NOTE_ECHO_SOURCE_DAY,
      created_at: "2026-05-01T11:00:00+00:00",
    });
    const sd3 = buildNote({
      id: "50000000-0000-4000-8000-000000000003",
      day: NOTE_ECHO_SOURCE_DAY,
      created_at: "2026-05-01T10:00:00+00:00",
    });
    const od1 = buildNote({
      id: "50000000-0000-4000-8000-000000000004",
      day: "2026-05-02",
      created_at: "2026-05-02T12:00:00+00:00",
    });
    const od2 = buildNote({
      id: "50000000-0000-4000-8000-000000000005",
      day: "2026-05-02",
      created_at: "2026-05-02T11:00:00+00:00",
    });
    mockSupabase.setTableRows("notes", [sourceNote, sd1, sd2, sd3, od1, od2]);

    const page1 = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [],
      pageSize: 2,
    });

    expect(page1.ok).toBe(true);
    expect(page1.page.items.map((c) => c.id)).toEqual([sd1.id, sd2.id]);
    expect(page1.page.nextCursor?.isSelectedDayGroup).toBe(true);

    const page2 = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [],
      cursor: page1.page.nextCursor!,
      pageSize: 2,
    });

    expect(page2.ok).toBe(true);
    expect(page2.page.items.map((c) => c.id)).toEqual([sd3.id, od1.id]);
    expect(page2.page.nextCursor?.isSelectedDayGroup).toBe(false);

    const page3 = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [],
      cursor: page2.page.nextCursor!,
      pageSize: 2,
    });

    expect(page3.ok).toBe(true);
    expect(page3.page.items.map((c) => c.id)).toEqual([od2.id]);
    expect(page3.page.nextCursor).toBeNull();

    const allIds = [
      ...page1.page.items.map((c) => c.id),
      ...page2.page.items.map((c) => c.id),
      ...page3.page.items.map((c) => c.id),
    ];
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds).not.toContain(sourceNote.id);
  });

  // TD034: isAlreadyConnected when only inverted echo (B→A) exists
  it("marca candidata como isAlreadyConnected quando apenas eco invertido B→A existe", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    const invertedEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000020",
      from_note_id: targetNote.id,
      to_note_id: sourceNote.id,
    });
    mockSupabase.setTableRows("notes", [sourceNote, targetNote]);

    const result = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [invertedEcho],
    });

    expect(result.ok).toBe(true);
    const targetCandidate = result.page.items.find(
      (c) => c.id === targetNote.id,
    );
    expect(targetCandidate?.isAlreadyConnected).toBe(true);
  });

  // TD036: malformed echo during 23505 reconciliation → retryable_failure
  it("classifica falha de validacao de schema em reconciliacao de duplicidade como retryable", async () => {
    const { sourceNote, targetNote } = buildConnectedPair();
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.error("duplicate key value violates unique constraint", {
        code: "23505",
      }),
    );
    // Reconciliation fetch returns malformed data (missing required fields)
    mockSupabase.enqueueTableResult(
      "note_echoes",
      mockSupabase.ok([{ id: "malformed-echo", from_note_id: null }]),
    );

    const result = await createNoteEcho({
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
      kind: "manual_link",
    });

    expect(result.status).toBe("retryable_failure");
    expect(result.ok).toBe(false);
  });
});
