import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import ProtectedDayRoute from "../../../app/day/[date]";
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
};

const mockSearchParams: { date?: string | string[] } = {
  date: "2026-05-01",
};

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

jest.mock("../../../src/features/auth/api/sign-out", () => ({
  signOut: jest.fn(async () => ({
    ok: true,
    status: "unauthenticated",
    errorMessage: null,
  })),
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

const openSourceReader = async () => {
  jest.useFakeTimers();
  fireEvent.press(screen.getByTestId(`timeline-node-${sourceNote.id}:note`));
  await act(async () => {
    jest.advanceTimersByTime(250);
  });
  jest.useRealTimers();
  await flushMicrotasks();
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
    pendingReaderOpen: null,
  });
  useUIStore.setState({
    activeTab: "timeline",
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
  // @req FR-014
  // @req FR-016
  it("cria continuidade no mesmo dia, recarrega e abre Reader uma vez", async () => {
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

    render(<ProtectedDayRoute />);
    await flushMicrotasks();
    await openSourceReader();
    await continueFromSource("2026-05-01");

    await waitFor(() => {
      expect(screen.getAllByText("Continuidade same-day").length).toBeGreaterThan(1);
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(useNavigationStore.getState().pendingReaderOpen).toBeNull();
  });

  // @req FR-017
  // @req FR-018
  it("cria continuidade futura, navega e abre Reader depois do reload do dia destino", async () => {
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
      mockSupabase.setTableRows("notes", [futureNewNote]);
      mockSupabase.setTableRows("note_echoes", [noteEcho]);
      return mockSupabase.ok({ newNote: futureNewNote, noteEcho });
    });

    const route = render(<ProtectedDayRoute />);
    await flushMicrotasks();
    await openSourceReader();
    await continueFromSource("2026-05-02");

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/day/2026-05-02");
    });
    expect(useNavigationStore.getState().pendingReaderOpen).toMatchObject({
      noteId: futureNewNote.id,
      noteDay: "2026-05-02",
      actionOrigin: "continue_note_created",
    });

    mockSearchParams.date = "2026-05-02";
    route.rerender(<ProtectedDayRoute />);
    await flushMicrotasks();

    await waitFor(() => {
      expect(screen.getAllByText("Continuidade futura").length).toBeGreaterThan(1);
    });
    expect(useNavigationStore.getState().pendingReaderOpen).toBeNull();
  });
});
