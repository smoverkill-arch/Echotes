import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import ProtectedDayRoute from "../../../app/day/[date]";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import { installMockSystemDate } from "../../support/mock-system-date";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockSearchParams: { date?: string | string[] } = {
  date: "2026-04-18",
};

const mockSupabase = createSupabaseNoteEchoMock();

let mockNoteCounter = 0;
let mockTaskCounter = 0;

const makeUuid = (prefix: string, counter: number) =>
  `${prefix}-0000-4000-8000-${counter.toString().padStart(12, "0")}`;

const toOffsetIsoValue = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  if (/[+-]\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (value.endsWith("Z")) {
    return `${value.slice(0, -1)}+00:00`;
  }

  return `${value}+00:00`;
};

const buildMockRow = (
  tableName: "notes" | "tasks" | "note_echoes",
  payload: Record<string, unknown>,
) => {
  const counter =
    tableName === "notes"
      ? ++mockNoteCounter
      : tableName === "tasks"
        ? ++mockTaskCounter
        : mockSupabase.getTableRows("note_echoes").length + 1;
  const idPrefix =
    tableName === "notes"
      ? "10000000"
      : tableName === "tasks"
        ? "20000000"
        : "30000000";
  const timestamp =
    tableName === "notes"
      ? "2026-04-18T09:30:00+00:00"
      : tableName === "tasks"
        ? "2026-04-18T10:00:00+00:00"
        : "2026-04-18T10:30:00+00:00";
  const row: Record<string, unknown> = {
    id: makeUuid(idPrefix, counter),
    created_at: timestamp,
    updated_at: timestamp,
    ...payload,
  };

  if (tableName === "tasks") {
    row.completed_at = null;
    row.scheduled_at = toOffsetIsoValue(row.scheduled_at);
  }

  return row;
};

const appendMockRow = (
  tableName: "notes" | "tasks" | "note_echoes",
  payload: Record<string, unknown>,
) => {
  const row = buildMockRow(tableName, payload);
  mockSupabase.setTableRows(tableName, [
    ...mockSupabase.getTableRows(tableName),
    row,
  ]);

  return row;
};

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

let mockSystemDate: ReturnType<typeof installMockSystemDate> | null = null;

const flushMicrotasks = async (passes = 3) => {
  for (let pass = 0; pass < passes; pass += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

const renderReadyDayRoute = async () => {
  render(<ProtectedDayRoute />);
  await flushMicrotasks();

  expect(screen.getByText("Timeline do dia")).toBeTruthy();
  expect(screen.queryByTestId("timeline-loading-state")).toBeNull();

  const plusButton = screen.getByTestId("timeline-plus-button");
  const isDisabled =
    plusButton.props.disabled ?? plusButton.props.accessibilityState?.disabled ?? false;

  expect(isDisabled).toBe(false);
};

beforeEach(() => {
  mockSystemDate = installMockSystemDate("2026-04-18T00:00:00Z");
  jest.clearAllMocks();
  mockSupabase.reset();
  mockSupabase.setTableRows("notes", []);
  mockSupabase.setTableRows("tasks", []);
  mockSupabase.setTableRows("note_echoes", []);
  mockSupabase.setInsertHandler("notes", (payload) =>
    buildMockRow("notes", payload),
  );
  mockSupabase.setInsertHandler("tasks", (payload) =>
    buildMockRow("tasks", payload),
  );
  mockSupabase.setInsertHandler("note_echoes", (payload) =>
    buildMockRow("note_echoes", payload),
  );
  mockSupabase.setRpcHandler("continue_note", (payload) => {
    if (typeof payload !== "object" || payload === null) {
      return mockSupabase.plainError("payload invalido");
    }

    const rpcPayload = payload as Record<string, unknown>;
    const newNote = appendMockRow("notes", {
      user_id: authenticatedSession.userId,
      day: rpcPayload.new_note_day,
      title: rpcPayload.title,
      content: rpcPayload.content ?? null,
      brief: rpcPayload.brief ?? null,
      tag_id: null,
      color: null,
      is_color_overridden: false,
    });
    const noteEcho = appendMockRow("note_echoes", {
      from_note_id: rpcPayload.source_note_id,
      to_note_id: newNote.id,
      created_by_user_id: authenticatedSession.userId,
      context_note_id: rpcPayload.source_note_id,
      context_day: mockSearchParams.date,
      kind: "continue_note",
      metadata: null,
    });

    return mockSupabase.ok({ newNote, noteEcho });
  });
  mockNoteCounter = 0;
  mockTaskCounter = 0;
  mockSearchParams.date = "2026-04-18";
  useCalendarStore.setState({
    selectedDate: "2026-04-18",
    clockDate: "2026-04-18",
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
  mockSystemDate?.restore();
  mockSystemDate = null;
});

describe("US2 same-day day surface", () => {
  it("mantem o botao + fechado por padrao, abre o bottom sheet e fecha ao cancelar", async () => {
    await renderReadyDayRoute();

    expect(screen.queryByTestId("timeline-plus-sheet")).toBeNull();
    expect(screen.queryByTestId("timeline-create-note-button")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });

    expect(await screen.findByTestId("timeline-plus-sheet")).toBeTruthy();
    expect(screen.getByTestId("timeline-plus-cancel-button")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-cancel-button"));
    });

    await waitFor(() => {
      expect(screen.queryByTestId("timeline-plus-sheet")).toBeNull();
    });
  });

  it("fecha o bottom sheet ao escolher uma acao e abre o editor correspondente", async () => {
    await renderReadyDayRoute();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-note-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("timeline-plus-sheet")).toBeNull();
    });
    expect(await screen.findByTestId("note-editor-submit-button")).toBeTruthy();
  });

  // @req FR-007
  // @req FR-008
  // @req FR-010
  // @req FR-022
  // @req SC-003
  it("permite criar nota e tarefas do mesmo dia e renderiza a timeline correta", async () => {
    await renderReadyDayRoute();
    expect(screen.getByText("18-04-2026")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-note-button"));

    fireEvent.changeText(
      await screen.findByTestId("note-editor-title-input"),
      "Nota do dia",
    );
    fireEvent.changeText(
      screen.getByTestId("note-editor-content-input"),
      "Registrar contexto",
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("note-editor-submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByText("Nota do dia")).toBeTruthy();
    });
    expect(screen.getByTestId("note-card-real-10000000-0000-4000-8000-000000000001")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

    fireEvent.changeText(
      await screen.findByTestId("task-editor-title-input"),
      "Tarefa sem horario",
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByText("Tarefa sem horario")).toBeTruthy();
    });
    expect(screen.getByTestId("task-card-real-20000000-0000-4000-8000-000000000001")).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

    fireEvent.changeText(
      await screen.findByTestId("task-editor-title-input"),
      "Tarefa com horario",
    );
    fireEvent.changeText(screen.getByTestId("task-editor-time-input"), "18:30");

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("task-creation-marker-20000000-0000-4000-8000-000000000002")).toBeTruthy();
    });
    expect(screen.getByTestId("task-card-timed-20000000-0000-4000-8000-000000000002")).toBeTruthy();

    jest.useFakeTimers();
    try {
      fireEvent.press(
        screen.getByTestId("timeline-node-10000000-0000-4000-8000-000000000001:note"),
      );

      await act(async () => {
        jest.advanceTimersByTime(250);
      });
    } finally {
      jest.useRealTimers();
    }

    expect(await screen.findByText("Reader de nota")).toBeTruthy();

    fireEvent.press(screen.getByTestId("note-reader-edit-button"));

    fireEvent.changeText(
      await screen.findByTestId("note-editor-title-input"),
      "Nota do dia atualizada",
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("note-editor-submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByText("Nota do dia atualizada")).toBeTruthy();
    });
  });

  it("exibe e aceita DD-MM-AAAA no editor e persiste day key interna", async () => {
    await renderReadyDayRoute();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

    expect(screen.getByPlaceholderText("DD-MM-AAAA")).toBeTruthy();
    expect(await screen.findByDisplayValue("18-04-2026")).toBeTruthy();

    fireEvent.changeText(
      screen.getByTestId("task-editor-title-input"),
      "Tarefa para outro dia",
    );
    fireEvent.changeText(
      screen.getByTestId("task-editor-target-day-input"),
      "20-04-2026",
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });

    expect(mockSupabase.getTableRows("tasks")[0]?.target_day).toBe(
      "2026-04-20",
    );
    expect(await screen.findByText("Vai para 20-04-2026")).toBeTruthy();
  });

  // @req FR-011
  // @req FR-012
  it("salva horario futuro local e bloqueia horario passado local no mesmo dia", async () => {
    mockSystemDate?.set(new Date(2026, 3, 18, 23, 0, 0, 0));

    await renderReadyDayRoute();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

    fireEvent.changeText(
      await screen.findByTestId("task-editor-title-input"),
      "Tarefa futura local",
    );
    fireEvent.changeText(screen.getByTestId("task-editor-time-input"), "23:59");

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("task-card-timed-20000000-0000-4000-8000-000000000001"),
      ).toBeTruthy();
    });
    expect(mockSupabase.getTableRows("tasks")[0]?.scheduled_at).toBe(
      `${new Date(2026, 3, 18, 23, 59, 0, 0).toISOString().slice(0, 19)}+00:00`,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

    fireEvent.changeText(
      await screen.findByTestId("task-editor-title-input"),
      "Tarefa passada local",
    );
    fireEvent.changeText(screen.getByTestId("task-editor-time-input"), "22:00");

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });

    expect(
      await screen.findByText("O horario da tarefa precisa estar no futuro no fuso local."),
    ).toBeTruthy();
    expect(screen.queryByText("Tarefa passada local")).toBeNull();
  });

  it("aceita timestamps com offset retornados pelo Supabase real", async () => {
    await renderReadyDayRoute();

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-note-button"));

    fireEvent.changeText(
      await screen.findByTestId("note-editor-title-input"),
      "Nota com offset",
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("note-editor-submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByText("Nota com offset")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId("timeline-plus-button"));
    });
    fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

    fireEvent.changeText(
      await screen.findByTestId("task-editor-title-input"),
      "Tarefa com offset",
    );
    fireEvent.changeText(screen.getByTestId("task-editor-time-input"), "20:15");

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("task-card-timed-20000000-0000-4000-8000-000000000001")).toBeTruthy();
    });
    expect(mockSupabase.getTableRows("notes")[0]?.created_at).toBe(
      "2026-04-18T09:30:00+00:00",
    );
    expect(mockSupabase.getTableRows("tasks")[0]?.created_at).toBe(
      "2026-04-18T00:00:00.000Z",
    );
    expect(mockSupabase.getTableRows("tasks")[0]?.scheduled_at).toBe(
      `${new Date(2026, 3, 18, 20, 15, 0, 0).toISOString().slice(0, 19)}+00:00`,
    );
  });
});
