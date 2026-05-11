import { act, cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import ProtectedDayRoute from "../../../app/day/[date]";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import { installMockSystemDate } from "../../support/mock-system-date";

const navigateToDay = (href: string) => {
  const match = href.match(/^\/day\/(\d{4}-\d{2}-\d{2})$/);

  if (!match) {
    return;
  }

  mockSearchParams.date = match[1];
  useCalendarStore.setState({ selectedDate: match[1] });
};

const mockRouter = {
  replace: jest.fn((href: string) => {
    navigateToDay(String(href));
  }),
  push: jest.fn((href: string) => {
    navigateToDay(String(href));
  }),
};

const mockSearchParams: { date?: string | string[] } = {
  date: "2026-04-18",
};

const mockNotesTable: Record<string, unknown>[] = [];
const mockTasksTable: Record<string, unknown>[] = [];
const mockNoteEchoesTable: Record<string, unknown>[] = [];

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
  const extractUuidValues = (filter: string) =>
    Array.from(filter.matchAll(/[0-9a-f]{8}-[0-9a-f-]{27}/gi)).map(
      ([value]) => value,
    );

  const buildQuery = (tableName: "notes" | "tasks" | "note_echoes") => {
    const filters = new Map<string, unknown>();
    let orFilter: string | null = null;

    return {
      select() {
        return this;
      },
      eq(column: string, value: unknown) {
        filters.set(column, value);
        return this;
      },
      or(filter: string) {
        orFilter = filter;
        return this;
      },
      async order(column: string, options?: { ascending?: boolean }) {
        const source =
          tableName === "notes"
            ? mockNotesTable
            : tableName === "tasks"
              ? mockTasksTable
              : mockNoteEchoesTable;
        const relatedNoteIds =
          tableName === "note_echoes" && orFilter
            ? new Set(extractUuidValues(orFilter))
            : null;
        const rows = source
          .filter((row) =>
            Array.from(filters.entries()).every(
              ([key, expected]) => row[key] === expected,
            ),
          )
          .filter((row) => {
            if (!relatedNoteIds) {
              return true;
            }

            return (
              relatedNoteIds.has(String(row.source_note_id)) ||
              relatedNoteIds.has(String(row.target_note_id))
            );
          })
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
                if (tableName === "notes") {
                  return {
                    data: null,
                    error: { message: "notes insert nao esperado neste teste" },
                  };
                }

                if (!payload.user_id) {
                  return {
                    data: null,
                    error: { message: "tasks.user_id is required" },
                  };
                }

                const counter = ++mockTaskCounter;
                const row: Record<string, unknown> = {
                  id: makeUuid("20000000", counter),
                  created_at: "2026-04-18T10:00:00+00:00",
                  updated_at: "2026-04-18T10:00:00+00:00",
                  completed_at: null,
                  ...payload,
                };

                row.scheduled_at = toOffsetIsoValue(row.scheduled_at);
                mockTasksTable.push(row);

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
                    const index = mockTasksTable.findIndex(
                      (row) => row[column] === value,
                    );

                    if (index < 0) {
                      return {
                        data: null,
                        error: { message: "task not found" },
                      };
                    }

                    mockTasksTable[index] = {
                      ...mockTasksTable[index],
                      ...payload,
                      scheduled_at: toOffsetIsoValue(payload.scheduled_at),
                      updated_at: "2026-04-20T19:00:00+00:00",
                    };

                    return {
                      data: mockTasksTable[index],
                      error: null,
                    };
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
      from: (tableName: "notes" | "tasks" | "note_echoes") =>
        buildQuery(tableName),
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
};

const createProjectedTaskFromOrigin = async () => {
  await act(async () => {
    fireEvent.press(screen.getByTestId("timeline-plus-button"));
  });
  fireEvent.press(await screen.findByTestId("timeline-create-task-button"));

  fireEvent.changeText(
    await screen.findByTestId("task-editor-title-input"),
    "Tarefa futura",
  );
  fireEvent.changeText(
    screen.getByTestId("task-editor-target-day-input"),
    "20-04-2026",
  );
  fireEvent.changeText(screen.getByTestId("task-editor-time-input"), "18:30");

  await act(async () => {
    fireEvent.press(screen.getByTestId("task-editor-submit-button"));
  });
  await flushMicrotasks();
};

const navigateToProjectedTaskDestination = async () => {
  fireEvent.press(
    screen.getByTestId(
      "timeline-node-20000000-0000-4000-8000-000000000001:task_ghost",
    ),
  );
  await flushMicrotasks();
};

beforeEach(() => {
  mockSystemDate = installMockSystemDate("2026-04-18T00:00:00Z");
  jest.clearAllMocks();
  mockSearchParams.date = "2026-04-18";
  mockNotesTable.splice(0, mockNotesTable.length);
  mockTasksTable.splice(0, mockTasksTable.length);
  mockNoteEchoesTable.splice(0, mockNoteEchoesTable.length);
  mockTaskCounter = 0;
  mockNotesTable.push({
    id: "30000000-0000-4000-8000-000000000001",
    user_id: authenticatedSession.userId,
    day: "2026-04-18",
    title: "Nota de contexto",
    content: "Anotacao lateral do dia",
    brief: null,
    tag_id: null,
    color: null,
    is_color_overridden: false,
    created_at: "2026-04-18T09:15:00+00:00",
    updated_at: "2026-04-18T09:15:00+00:00",
  });
  useCalendarStore.setState({
    selectedDate: "2026-04-18",
    clockDate: "2026-04-18",
  });
  useNavigationStore.setState({
    temporalNavigationContext: null,
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
  mockSystemDate?.restore();
  mockSystemDate = null;
});

describe("US3 ghost navigation", () => {
  // @req 002-note-echo-flows:FR-024
  // @req 002-note-echo-flows:SC-006
  it("renderiza a rota protegida de origem com timeline pronta", async () => {
    await renderReadyDayRoute();

    expect(screen.getByTestId("timeline-axis-rail")).toBeTruthy();
    expect(
      screen.getByTestId(
        "timeline-item-wrapper-right-30000000-0000-4000-8000-000000000001:note",
      ),
    ).toBeTruthy();
  });

  // @req 002-note-echo-flows:FR-018
  // @req 002-note-echo-flows:SC-004
  it("cria ghost card na origem e navega ao item real com breadcrumb", async () => {
    await renderReadyDayRoute();
    expect(screen.getByTestId("timeline-axis-rail")).toBeTruthy();

    await createProjectedTaskFromOrigin();
    expect(
      screen.getByTestId(
        "task-card-ghost-20000000-0000-4000-8000-000000000001",
      ),
    ).toBeTruthy();
    expect(
      screen.queryByTestId(
        "task-card-timed-20000000-0000-4000-8000-000000000001",
      ),
    ).toBeNull();
    expect(
      screen.getByTestId(
        "timeline-item-wrapper-right-30000000-0000-4000-8000-000000000001:note",
      ),
    ).toBeTruthy();
    expect(
      screen.getByTestId(
        "timeline-item-wrapper-left-20000000-0000-4000-8000-000000000001:task_ghost",
      ),
    ).toBeTruthy();

    await navigateToProjectedTaskDestination();
    expect(mockRouter.push).toHaveBeenCalledWith("/day/2026-04-20");
    expect(screen.getByTestId("breadcrumb-bar")).toBeTruthy();
    expect(screen.getByText("Item real em 20-04-2026")).toBeTruthy();
    expect(screen.getByText("Criada em 18-04-2026")).toBeTruthy();
    expect(screen.getByText("Reader de tarefa")).toBeTruthy();
    expect(screen.getByTestId("task-reader-context-meta")).toBeTruthy();
  });

  // @req 002-note-echo-flows:FR-018
  it("permite editar o item real e retornar ao contexto original", async () => {
    await renderReadyDayRoute();
    await createProjectedTaskFromOrigin();
    await navigateToProjectedTaskDestination();

    fireEvent.press(screen.getByTestId("task-reader-edit-button"));

    expect(await screen.findByDisplayValue("Tarefa futura")).toBeTruthy();
    fireEvent.changeText(
      screen.getByTestId("task-editor-title-input"),
      "Tarefa futura revisada",
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId("task-editor-submit-button"));
    });
    await flushMicrotasks();
    expect(
      screen.getByTestId(
        "task-card-timed-20000000-0000-4000-8000-000000000001",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Tarefa futura revisada")).toBeTruthy();

    fireEvent.press(screen.getByTestId("breadcrumb-return-button"));
    await flushMicrotasks();
    expect(mockRouter.push).toHaveBeenCalledWith("/day/2026-04-18");
    expect(
      screen.getByTestId(
        "task-card-ghost-20000000-0000-4000-8000-000000000001",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Tarefa futura revisada")).toBeTruthy();
  });
});
