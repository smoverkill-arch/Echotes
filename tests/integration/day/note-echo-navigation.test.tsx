import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react-native";

import ProtectedDayRoute from "../../../app/day/[date]/index";
import NoteReaderRoute from "../../../app/day/[date]/note/[id]";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

// @req 002-note-echo-flows:FR-011
// @req 002-note-echo-flows:FR-012
const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
};

const mockSearchParams: { date?: string | string[]; id?: string | string[] } = {
  date: "2026-04-18",
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
  userId: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const sourceNote = {
  id: "10000000-0000-4000-8000-000000000001",
  user_id: authenticatedSession.userId,
  day: "2026-04-18",
  title: "Nota de origem",
  content: "Contexto inicial",
  brief: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  created_at: "2026-04-18T09:15:00+00:00",
  updated_at: "2026-04-18T09:15:00+00:00",
};

const targetNote = {
  ...sourceNote,
  id: "10000000-0000-4000-8000-000000000002",
  day: "2026-04-19",
  title: "Nota conectada futura",
  content: "Continuidade em outro dia",
  created_at: "2026-04-19T10:00:00+00:00",
  updated_at: "2026-04-19T10:00:00+00:00",
};

const noteEcho = {
  id: "30000000-0000-4000-8000-000000000001",
  from_note_id: sourceNote.id,
  to_note_id: targetNote.id,
  created_by_user_id: authenticatedSession.userId,
  created_at: "2026-04-18T10:30:00+00:00",
  context_note_id: sourceNote.id,
  context_day: "2026-04-18",
  kind: "manual_link",
  metadata: null,
};

const flushMicrotasks = async (passes = 4) => {
  for (let pass = 0; pass < passes; pass += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams.date = "2026-04-18";
  mockSearchParams.id = undefined;
  mockSupabase.reset();
  mockSupabase.setTableRows("notes", [sourceNote, targetNote]);
  mockSupabase.setTableRows("tasks", []);
  mockSupabase.setTableRows("note_echoes", [noteEcho]);
  useCalendarStore.setState({
    selectedDate: "2026-04-18",
    clockDate: "2026-04-18",
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

describe("note echo cross-day navigation", () => {
  it("empurra a rota do Reader de nota ao tocar no card", async () => {
    render(<ProtectedDayRoute />);
    await flushMicrotasks();

    expect(screen.getByText("Ecos 1")).toBeTruthy();

    jest.useFakeTimers();
    fireEvent.press(screen.getByTestId(`timeline-node-${sourceNote.id}:note`));
    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    jest.useRealTimers();

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/day/2026-04-18/note/${sourceNote.id}`,
    );
  });

  it("abre nota conectada de outro dia empurrando a rota cross-day", async () => {
    mockSearchParams.date = "2026-04-18";
    mockSearchParams.id = sourceNote.id;

    render(<NoteReaderRoute />);
    await flushMicrotasks();

    expect(screen.getByText("Reader de nota")).toBeTruthy();
    expect(await screen.findByText("Nota conectada futura")).toBeTruthy();

    fireEvent.press(
      screen.getByTestId(`note-reader-open-related-note-${targetNote.id}`),
    );
    await flushMicrotasks();

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/day/2026-04-19/note/${targetNote.id}`,
    );
  });
});
