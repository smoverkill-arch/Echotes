import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";

import ProtectedDayRoute from "../../../app/day/[date]/note/[id]";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import { buildNote, NOTE_ECHO_FIXTURE_USER_ID } from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
};

const mockSearchParams: { date?: string | string[]; id?: string | string[] } = {
  date: "2026-05-01",
  id: "10000000-0000-4000-8000-000000000001",
};

// @req 002-note-echo-flows:FR-006
// @req 002-note-echo-flows:FR-009
// @req 002-note-echo-flows:FR-013
// @req 002-note-echo-flows:FR-022
// @req 002-note-echo-flows:FR-023
// @req 002-note-echo-flows:SC-003
// @req 002-note-echo-flows:SC-004
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
  day: "2026-05-01",
  created_at: "2026-05-01T10:00:00+00:00",
  updated_at: "2026-05-01T10:00:00+00:00",
});

const alreadyConnectedNote = buildNote({
  id: "20000000-0000-4000-8000-000000000001",
  title: "Nota ja conectada",
  day: "2026-05-01",
  created_at: "2026-05-01T09:59:00+00:00",
  updated_at: "2026-05-01T09:59:00+00:00",
});

const candidateToConnect = buildNote({
  id: "20000000-0000-4000-8000-000000000999",
  title: "Nota candidata tardia",
  day: "2026-05-01",
  created_at: "2026-05-01T09:00:00+00:00",
  updated_at: "2026-05-01T09:00:00+00:00",
});

const fillerNotes = Array.from({ length: 49 }, (_, index) => {
  const suffix = String(index + 2).padStart(12, "0");
  const seconds = String(58 - index).padStart(2, "0");

  return buildNote({
    id: `20000000-0000-4000-8000-${suffix}`,
    title: `Candidata intermediaria ${index + 1}`,
    day: "2026-05-01",
    created_at: `2026-05-01T09:59:${seconds}+00:00`,
    updated_at: `2026-05-01T09:59:${seconds}+00:00`,
  });
});

const existingEcho = {
  id: "30000000-0000-4000-8000-000000000001",
  from_note_id: sourceNote.id,
  to_note_id: alreadyConnectedNote.id,
  created_by_user_id: authenticatedSession.userId,
  created_at: "2026-05-01T10:05:00+00:00",
  context_note_id: sourceNote.id,
  context_day: "2026-05-01",
  kind: "manual_link",
  metadata: null,
};

const insertedEchoId = "30000000-0000-4000-8000-000000000999";

const flushMicrotasks = async (passes = 5) => {
  for (let pass = 0; pass < passes; pass += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams.date = "2026-05-01";
  mockSupabase.reset();
  mockSupabase.setTableRows("notes", [
    sourceNote,
    alreadyConnectedNote,
    ...fillerNotes,
    candidateToConnect,
  ]);
  mockSupabase.setTableRows("tasks", []);
  mockSupabase.setTableRows("note_echoes", [existingEcho]);
  mockSupabase.setInsertHandler("note_echoes", (payload) => ({
    id: insertedEchoId,
    created_by_user_id: authenticatedSession.userId,
    created_at: "2026-05-01T10:10:00+00:00",
    ...payload,
  }));
  useCalendarStore.setState({
    selectedDate: "2026-05-01",
    clockDate: "2026-05-01",
  });
  mockSearchParams.date = "2026-05-01";
  mockSearchParams.id = sourceNote.id;
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

describe("note echo management flow", () => {
  it("adiciona eco, pagina candidatas, mostra duplicidade e remove com confirmacao", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation();

    render(<ProtectedDayRoute />);
    await flushMicrotasks();

    expect(
      await screen.findByTestId(
        `note-reader-related-note-${alreadyConnectedNote.id}`,
      ),
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId("note-reader-add-echo-button"));
    await waitFor(() => {
      expect(screen.getByText("Eco ja existe")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("note-echo-picker-load-more-button"));
    await waitFor(() => {
      expect(
        screen.getByTestId(`note-echo-candidate-${candidateToConnect.id}`),
      ).toBeTruthy();
    });

    fireEvent.press(
      screen.getByTestId(`note-echo-candidate-${candidateToConnect.id}`),
    );
    await waitFor(() => {
      expect(screen.getByText("Eco adicionado.")).toBeTruthy();
    });
    await waitFor(() => {
      expect(
        screen.getByTestId(`note-reader-related-note-${candidateToConnect.id}`),
      ).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId(`note-reader-remove-echo-${insertedEchoId}`));
    const buttons = alertSpy.mock.calls[0][2] ?? [];
    const confirmButton = buttons.find((button) => button.text === "Remover eco");
    confirmButton?.onPress?.();

    await waitFor(() => {
      expect(screen.getByText("Eco removido.")).toBeTruthy();
    });
    await waitFor(() => {
      expect(
        screen.queryByTestId(`note-reader-related-note-${candidateToConnect.id}`),
      ).toBeNull();
    });
    expect(mockSupabase.getTableRows("notes")).toHaveLength(52);
  });
});
