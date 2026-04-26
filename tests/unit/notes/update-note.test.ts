import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import type { Note } from "../../../src/types/note";
import { updateNote } from "../../../src/features/notes/api/update-note";

const mockSingle = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();
let mockIsSupabaseConfigured = true;
let mockSupabaseConfigurationError: string | null = null;

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => ({
    from: mockFrom,
  }),
  getSupabaseConfigurationError: () => mockSupabaseConfigurationError,
  get isSupabaseConfigured() {
    return mockIsSupabaseConfigured;
  },
}));

const authenticatedSession: AuthenticatedSession = {
  userId: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const existingNote: Note = {
  id: "10000000-0000-4000-8000-000000000001",
  user_id: authenticatedSession.userId,
  day: "2026-04-18",
  title: "Nota atual",
  content: "Conteudo",
  brief: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  created_at: "2026-04-18T09:15:00+00:00",
  updated_at: "2026-04-18T09:15:00+00:00",
};

describe("updateNote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSupabaseConfigured = true;
    mockSupabaseConfigurationError = null;

    mockFrom.mockReturnValue({
      update: mockUpdate,
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      single: mockSingle,
    });

    useAuthStore.setState({
      status: "authenticated",
      session: authenticatedSession,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: true,
    });
  });

  it("propaga erro de configuracao tambem para o estado global de auth", async () => {
    mockIsSupabaseConfigured = false;
    mockSupabaseConfigurationError = "Supabase indisponivel para o ambiente atual.";

    const result = await updateNote(existingNote, {
      title: "Nota revisada",
      content: existingNote.content ?? "",
      brief: existingNote.brief ?? "",
      day: existingNote.day,
      tag_id: existingNote.tag_id,
      color: existingNote.color,
      is_color_overridden: existingNote.is_color_overridden,
    });

    expect(result).toEqual({
      ok: false,
      note: null,
      errorMessage: "Supabase indisponivel para o ambiente atual.",
    });
    expect(useAuthStore.getState().status).toBe("config_error");
    expect(useAuthStore.getState().errorMessage).toBe(
      "Supabase indisponivel para o ambiente atual.",
    );
  });

  it("transforma rejection de transporte em erro amigavel", async () => {
    mockSingle.mockRejectedValue(new Error("Network request failed"));

    const result = await updateNote(existingNote, {
      title: "Nota revisada",
      content: existingNote.content ?? "",
      brief: existingNote.brief ?? "",
      day: existingNote.day,
      tag_id: existingNote.tag_id,
      color: existingNote.color,
      is_color_overridden: existingNote.is_color_overridden,
    });

    expect(result).toEqual({
      ok: false,
      note: null,
      errorMessage: "Nao foi possivel salvar a nota. Network request failed",
    });
  });
});
