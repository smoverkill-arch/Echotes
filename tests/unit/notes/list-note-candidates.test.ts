import { listNoteCandidates } from "../../../src/features/notes/api/list-note-candidates";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildNote,
  buildNoteEcho,
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

const buildCandidateNotes = (total: number) =>
  Array.from({ length: total }, (_, index) => {
    const suffix = String(index + 2).padStart(12, "0");
    const seconds = String(59 - index).padStart(2, "0");

    return buildNote({
      id: `20000000-0000-4000-8000-${suffix}`,
      day: NOTE_ECHO_SOURCE_DAY,
      title: `Candidata ${index + 1}`,
      created_at: `${NOTE_ECHO_SOURCE_DAY}T23:59:${seconds}+00:00`,
      updated_at: `${NOTE_ECHO_SOURCE_DAY}T23:59:${seconds}+00:00`,
    });
  });

describe("listNoteCandidates", () => {
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

  it("lista lote padrao de 50, exclui a nota aberta e mantem proximo cursor", async () => {
    const sourceNote = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      day: NOTE_ECHO_SOURCE_DAY,
    });
    const candidates = buildCandidateNotes(51);
    mockSupabase.setTableRows("notes", [sourceNote, ...candidates]);

    const result = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [],
    });

    expect(result.ok).toBe(true);
    expect(result.page.items).toHaveLength(50);
    expect(result.page.items.map((candidate) => candidate.id)).not.toContain(
      sourceNote.id,
    );
    expect(result.page.nextCursor).toEqual({
      isSelectedDayGroup: true,
      day: NOTE_ECHO_SOURCE_DAY,
      created_at: candidates[49].created_at,
      id: candidates[49].id,
    });
  });

  it("marca candidata ja conectada como desabilitada tambem em par invertido", async () => {
    const sourceNote = buildNote({
      id: "10000000-0000-4000-8000-000000000001",
      day: NOTE_ECHO_SOURCE_DAY,
    });
    const alreadyConnected = buildNote({
      id: "20000000-0000-4000-8000-000000000002",
      day: NOTE_ECHO_SOURCE_DAY,
      title: "Candidata conectada",
    });
    const invertedEcho = buildNoteEcho({
      from_note_id: alreadyConnected.id,
      to_note_id: sourceNote.id,
      kind: "continue_note",
    });
    mockSupabase.setTableRows("notes", [sourceNote, alreadyConnected]);

    const result = await listNoteCandidates({
      sourceNoteId: sourceNote.id,
      selectedDay: NOTE_ECHO_SOURCE_DAY,
      existingEchoes: [invertedEcho],
    });

    expect(result.ok).toBe(true);
    expect(result.page.items).toEqual([
      expect.objectContaining({
        id: alreadyConnected.id,
        isAlreadyConnected: true,
      }),
    ]);
  });
});
