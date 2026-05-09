import { createNoteEcho } from "../../../src/features/notes/api/create-note-echo";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildConnectedPair,
  NOTE_ECHO_FIXTURE_USER_ID,
  NOTE_ECHO_SOURCE_DAY,
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

describe("createNoteEcho", () => {
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

  it("bloqueia self-link antes de escrever no Supabase", async () => {
    const noteId = "10000000-0000-4000-8000-000000000001";

    const result = await createNoteEcho({
      from_note_id: noteId,
      to_note_id: noteId,
      context_note_id: noteId,
      context_day: NOTE_ECHO_SOURCE_DAY,
      kind: "manual_link",
    });

    expect(result).toEqual({
      ok: false,
      status: "invalid_input",
      echo: null,
      errorMessage: "Uma nota nao pode criar eco com ela mesma.",
    });
    expect(mockSupabase.queryCalls).toEqual([]);
  });

  it("reconcilia duplicidade invertida preservando o kind original", async () => {
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
      context_note_id: targetNote.id,
      context_day: targetNote.day,
      kind: "manual_link",
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe("already_exists");
    expect(result.echo).toMatchObject({
      id: echo.id,
      kind: "continue_note",
      from_note_id: sourceNote.id,
      to_note_id: targetNote.id,
    });
  });
});
