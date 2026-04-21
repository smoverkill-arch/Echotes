import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import ProtectedDayRoute from "../../../app/day/[date]";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockSearchParams: { date?: string | string[] } = {
  date: "2026-04-18",
};

const mockNotesTable: Record<string, unknown>[] = [];
const mockTasksTable: Record<string, unknown>[] = [];

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

jest.mock("../../../src/lib/supabase", () => {
  const buildQuery = (tableName: "notes" | "tasks") => {
    const filters = new Map<string, unknown>();

    return {
      select() {
        return this;
      },
      eq(column: string, value: unknown) {
        filters.set(column, value);
        return this;
      },
      async order(column: string, options?: { ascending?: boolean }) {
        const source = tableName === "notes" ? mockNotesTable : mockTasksTable;
        const rows = source
          .filter((row) =>
            Array.from(filters.entries()).every(
              ([key, expected]) => row[key] === expected,
            ),
          )
          .sort((left, right) => {
            const leftValue = String(left[column] ?? "");
            const rightValue = String(right[column] ?? "");
            return options?.ascending === false
              ? rightValue.localeCompare(leftValue)
              : leftValue.localeCompare(rightValue);
          });

        return { data: rows, error: null };
      },
      insert(payload: Record<string, unknown>) {
        return {
          select() {
            return {
              async single() {
                if (!payload.user_id) {
                  return {
                    data: null,
                    error: { message: `${tableName}.user_id is required` },
                  };
                }

                const counter =
                  tableName === "notes" ? ++mockNoteCounter : ++mockTaskCounter;
                const idPrefix =
                  tableName === "notes" ? "10000000" : "20000000";
                const timestamp =
                  tableName === "notes"
                    ? "2026-04-18T09:30:00+00:00"
                    : "2026-04-18T10:00:00+00:00";
                const row: Record<string, unknown> = {
                  id: makeUuid(idPrefix, counter),
                  created_at: timestamp,
                  updated_at: timestamp,
                  completed_at: null,
                  ...payload,
                };
                if (tableName === "tasks") {
                  row.scheduled_at = toOffsetIsoValue(row.scheduled_at);
                }
                if (tableName === "notes") {
                  mockNotesTable.push(row);
                } else {
                  mockTasksTable.push(row);
                }
                return { data: row, error: null };
              },
            };
          },
        };
      },
      update(payload: Record<string, unknown>) {
        return {
          eq(column: string, value: unknown) {
            return {
              select() {
                return {
                  async single() {
                    const source =
                      tableName === "notes" ? mockNotesTable : mockTasksTable;
                    const index = source.findIndex((row) => row[column] === value);
                    if (index < 0) {
                      return {
                        data: null,
                        error: { message: `${tableName} not found` },
                      };
                    }
                    source[index] = {
                      ...source[index],
                      ...payload,
                      updated_at: "2026-04-18T11:00:00+00:00",
                    };
                    if (tableName === "tasks") {
                      source[index].scheduled_at = toOffsetIsoValue(
                        source[index].scheduled_at,
                      );
                    }
                    return { data: source[index], error: null };
                  },
                };
              },
            };
          },
        };
      },
    };
  };

  return {
    getSupabaseClient: () => ({
      from: (tableName: "notes" | "tasks") => buildQuery(tableName),
    }),
    getSupabaseConfigurationError: () => null,
    isSupabaseConfigured: true,
  };
});

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

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-04-18T00:00:00Z"));
  jest.clearAllMocks();
  mockNotesTable.splice(0, mockNotesTable.length);
  mockTasksTable.splice(0, mockTasksTable.length);
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
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("US2 same-day day surface", () => {
  it("permite criar nota e tarefas do mesmo dia e renderiza a timeline correta", async () => {
    render(<ProtectedDayRoute />);

    expect(await screen.findByText("Timeline do dia")).toBeTruthy();

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

    fireEvent.press(screen.getByTestId("timeline-node-10000000-0000-4000-8000-000000000001:note"));

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

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

  it("aceita timestamps com offset retornados pelo Supabase real", async () => {
    render(<ProtectedDayRoute />);

    expect(await screen.findByText("Timeline do dia")).toBeTruthy();

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
    expect(mockNotesTable[0]?.created_at).toBe("2026-04-18T09:30:00+00:00");
    expect(mockTasksTable[0]?.created_at).toBe("2026-04-18T10:00:00+00:00");
    expect(mockTasksTable[0]?.scheduled_at).toBe("2026-04-18T20:15:00+00:00");
  });
});
