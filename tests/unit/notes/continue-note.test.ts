import { continueNote } from "../../../src/features/notes/api/continue-note";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildNote,
  buildNoteEcho,
  NOTE_ECHO_FIXTURE_USER_ID,
  NOTE_ECHO_SOURCE_DAY,
  NOTE_ECHO_TARGET_DAY,
} from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockSupabase = createSupabaseNoteEchoMock();

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabase.client,
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
}));

const authenticatedSession: AuthenticatedSession = {
  userId: NOTE_ECHO_FIXTURE_USER_ID,
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

// @req 002-note-echo-flows:FR-014
// @req 002-note-echo-flows:FR-015
// @req 002-note-echo-flows:FR-016
// @req 002-note-echo-flows:FR-017
// @req 002-note-echo-flows:FR-018
// @req 002-note-echo-flows:SC-005
beforeEach(() => {
  mockSupabase.reset();
  useAuthStore.setState({
    status: "authenticated",
    session: authenticatedSession,
    errorMessage: null,
    hasHydrated: true,
    isRestoring: false,
    isAuthenticated: true,
  });
});

describe("continueNote", () => {
  // @req 002-note-echo-flows:FR-014
  // @req 002-note-echo-flows:FR-016
  // @req 002-note-echo-flows:SC-005
  it("chama RPC atomica com new_note_day e mantem context_day no servidor", async () => {
    const sourceNoteId = "10000000-0000-4000-8000-000000000001";
    const newNote = buildNote({
      id: "10000000-0000-4000-8000-000000000099",
      day: NOTE_ECHO_TARGET_DAY,
      title: "Continuidade",
      brief: "Briefing gerado",
    });
    const noteEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000099",
      from_note_id: sourceNoteId,
      to_note_id: newNote.id,
      context_note_id: sourceNoteId,
      context_day: NOTE_ECHO_SOURCE_DAY,
      kind: "continue_note",
    });
    mockSupabase.enqueueRpcResult(
      "continue_note",
      mockSupabase.ok({ newNote, noteEcho }),
    );

    const result = await continueNote({
      sourceNoteId,
      newNoteDay: NOTE_ECHO_TARGET_DAY,
      title: "Continuidade",
      generatedBrief: "Briefing gerado",
      content: "Texto editado",
    });

    expect(result.ok).toBe(true);
    expect(result.newNote?.day).toBe(NOTE_ECHO_TARGET_DAY);
    expect(result.noteEcho?.kind).toBe("continue_note");
    expect(mockSupabase.rpcCalls).toEqual([
      {
        name: "continue_note",
        payload: {
          source_note_id: sourceNoteId,
          new_note_day: NOTE_ECHO_TARGET_DAY,
          title: "Continuidade",
          brief: "Briefing gerado",
          content: "Texto editado",
        },
      },
    ]);
    expect(JSON.stringify(mockSupabase.rpcCalls[0].payload)).not.toContain(
      "source_day",
    );
    expect(JSON.stringify(mockSupabase.rpcCalls[0].payload)).not.toContain(
      "target_day",
    );
    expect(JSON.stringify(mockSupabase.rpcCalls[0].payload)).not.toContain(
      "scheduled_at",
    );
  });

  // @req 002-note-echo-flows:SC-005
  it("falha sem declarar sucesso parcial quando a RPC falha", async () => {
    mockSupabase.enqueueRpcResult(
      "continue_note",
      mockSupabase.error("source note is not accessible", { status: 403 }),
    );

    const result = await continueNote({
      sourceNoteId: "10000000-0000-4000-8000-000000000001",
      newNoteDay: NOTE_ECHO_SOURCE_DAY,
      title: "Continuidade",
      generatedBrief: "Briefing gerado",
      content: "",
    });

    expect(result).toMatchObject({
      ok: false,
      status: "not_accessible",
      newNote: null,
      noteEcho: null,
    });
    expect(mockSupabase.queryCalls).toEqual([]);
  });

  // @req 002-note-echo-flows:FR-015
  it("rejeita payload invalido antes de chamar Supabase", async () => {
    const result = await continueNote({
      sourceNoteId: "10000000-0000-4000-8000-000000000001",
      newNoteDay: NOTE_ECHO_SOURCE_DAY,
      title: "",
      generatedBrief: "Briefing gerado",
      content: "",
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe("invalid_input");
    expect(mockSupabase.rpcCalls).toEqual([]);
  });
});
