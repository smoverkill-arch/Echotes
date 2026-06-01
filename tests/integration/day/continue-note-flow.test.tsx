import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import NoteReaderRoute from "../../../app/day/[date]/note/[id]";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildNote,
  buildNoteEcho,
  NOTE_ECHO_FIXTURE_USER_ID,
} from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
};

const mockSearchParams: { date?: string | string[]; id?: string | string[] } = {
  date: "2026-05-01",
};

// @req 002-note-echo-flows:FR-014
// @req 002-note-echo-flows:FR-015
// @req 002-note-echo-flows:FR-016
// @req 002-note-echo-flows:FR-017
// @req 002-note-echo-flows:FR-018
// @req 002-note-echo-flows:SC-005
// @req 002-note-echo-flows:SC-006
const mockSupabase = createSupabaseNoteEchoMock();

jest.mock("expo-router", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");

  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, { testID: "redirect-target" }, String(href)),
    useLocalSearchParams: () => mockSearchParams,
    useRouter: () => mockRouter,
  };
});

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

const sourceNote = buildNote({
  id: "10000000-0000-4000-8000-000000000001",
  title: "Nota aberta",
  brief: "Briefing original",
  day: "2026-05-01",
  created_at: "2026-05-01T10:00:00+00:00",
  updated_at: "2026-05-01T10:00:00+00:00",
});

const sameDayNewNote = buildNote({
  id: "10000000-0000-4000-8000-000000000099",
  title: "Continuidade same-day",
  day: "2026-05-01",
  created_at: "2026-05-01T11:00:00+00:00",
  updated_at: "2026-05-01T11:00:00+00:00",
});

const futureNewNote = buildNote({
  id: "10000000-0000-4000-8000-000000000100",
  title: "Continuidade futura",
  day: "2026-05-02",
  created_at: "2026-05-02T11:00:00+00:00",
  updated_at: "2026-05-02T11:00:00+00:00",
});

const flushMicrotasks = async (passes = 6) => {
  for (let pass = 0; pass < passes; pass += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

const continueFromSource = async (day: string) => {
  fireEvent.press(screen.getByTestId("note-reader-continue-note-button"));
  fireEvent.changeText(screen.getByTestId("continue-note-title-input"), "Continuidade");
  fireEvent.changeText(screen.getByTestId("continue-note-day-input"), day);
  fireEvent.changeText(
    screen.getByTestId("continue-note-content-input"),
    "Texto editado",
  );
  fireEvent.press(screen.getByTestId("continue-note-submit-button"));
  await flushMicrotasks();
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams.date = "2026-05-01";
  mockSearchParams.id = sourceNote.id;
  mockSupabase.reset();
  mockSupabase.setTableRows("notes", [sourceNote]);
  mockSupabase.setTableRows("tasks", []);
  mockSupabase.setTableRows("note_echoes", []);
  useCalendarStore.setState({
    selectedDate: "2026-05-01",
    clockDate: "2026-05-01",
  });
  useNavigationStore.setState({
    temporalNavigationContext: null,
  });
  useUIStore.setState({
    activeTab: "tasks",
    readerState: { kind: null, id: null, isOpen: false },
    editorState: { mode: null, kind: null, id: null, isOpen: false },
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

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

describe("continue note flow", () => {
  // @req 002-note-echo-flows:FR-014
  // @req 002-note-echo-flows:FR-016
  it("cria continuidade no mesmo dia e empurra a rota da nova nota", async () => {
    mockSupabase.setRpcHandler("continue_note", () => {
      const noteEcho = buildNoteEcho({
        id: "30000000-0000-4000-8000-000000000099",
        from_note_id: sourceNote.id,
        to_note_id: sameDayNewNote.id,
        context_note_id: sourceNote.id,
        context_day: "2026-05-01",
        kind: "continue_note",
      });
      mockSupabase.setTableRows("notes", [sourceNote, sameDayNewNote]);
      mockSupabase.setTableRows("note_echoes", [noteEcho]);
      return mockSupabase.ok({ newNote: sameDayNewNote, noteEcho });
    });

    render(<NoteReaderRoute />);
    await flushMicrotasks();
    await continueFromSource("2026-05-01");

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/day/2026-05-01/note/${sameDayNewNote.id}`,
      );
    });
  });

  // @req 002-note-echo-flows:FR-017
  // @req 002-note-echo-flows:FR-018
  it("cria continuidade futura e empurra a rota cross-day da nova nota", async () => {
    mockSupabase.setRpcHandler("continue_note", (payload) => {
      const noteEcho = buildNoteEcho({
        id: "30000000-0000-4000-8000-000000000100",
        from_note_id: sourceNote.id,
        to_note_id: futureNewNote.id,
        context_note_id: sourceNote.id,
        context_day: "2026-05-01",
        kind: "continue_note",
      });
      expect(payload).toMatchObject({
        source_note_id: sourceNote.id,
        new_note_day: "2026-05-02",
      });
      expect(JSON.stringify(payload)).not.toContain("target_day");
      mockSupabase.setTableRows("notes", [sourceNote, futureNewNote]);
      mockSupabase.setTableRows("note_echoes", [noteEcho]);
      return mockSupabase.ok({ newNote: futureNewNote, noteEcho });
    });

    render(<NoteReaderRoute />);
    await flushMicrotasks();
    await continueFromSource("2026-05-02");

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/day/2026-05-02/note/${futureNewNote.id}`,
      );
    });
  });

  // @req 002-note-echo-flows:FR-018
  it("nao navega e exibe erro quando a RPC de continuidade falha", async () => {
    mockSupabase.setRpcHandler("continue_note", () =>
      mockSupabase.error("Nao foi possivel continuar a nota."),
    );

    render(<NoteReaderRoute />);
    await flushMicrotasks();
    await continueFromSource("2026-05-02");

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(screen.getByTestId("continue-note-error")).toBeTruthy();
  });
});
