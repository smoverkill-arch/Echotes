import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import ProtectedDayRoute from "../../../app/day/[date]";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import { installMockSystemDate } from "../../support/mock-system-date";

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockSearchParams: { date?: string | string[] } = {
  date: "2026-04-18",
};

const mockNotesTable: Record<string, unknown>[] = [];
const mockTasksTable: Record<string, unknown>[] = [];
let mockReadErrorMessage: string | null = null;

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
        if (mockReadErrorMessage) {
          return {
            data: null,
            error: new Error(mockReadErrorMessage),
          };
        }

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

let mockSystemDate: ReturnType<typeof installMockSystemDate> | null = null;

const setAuthenticatedState = () => {
  useAuthStore.setState({
    status: "authenticated",
    session: authenticatedSession,
    errorMessage: null,
    hasHydrated: true,
    isRestoring: false,
    isAuthenticated: true,
  });
};

beforeEach(() => {
  mockSystemDate = installMockSystemDate("2026-04-18T00:00:00Z");
  jest.clearAllMocks();
  mockSearchParams.date = "2026-04-18";
  mockNotesTable.splice(0, mockNotesTable.length);
  mockTasksTable.splice(0, mockTasksTable.length);
  mockReadErrorMessage = null;
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
  setAuthenticatedState();
});

afterEach(() => {
  cleanup();
  mockSystemDate?.restore();
  mockSystemDate = null;
});

describe("day surface regressions", () => {
  it("mantem estado vazio alinhado com US3 no dia protegido", async () => {
    render(<ProtectedDayRoute />);

    expect(await screen.findByText("Timeline do dia")).toBeTruthy();
    expect(await screen.findByText("Nada registrado neste dia ainda.")).toBeTruthy();
    expect(
      screen.getByText(
        "Use o botao + para criar uma nota, uma tarefa deste dia ou uma tarefa projetada para outro dia.",
      ),
    ).toBeTruthy();
    expect(screen.queryByTestId("redirect-target")).toBeNull();
  });

  it("mantem erro de carregamento visivel sem expor itens obsoletos", async () => {
    mockReadErrorMessage = "Falha simulada";
    mockNotesTable.push({
      id: "30000000-0000-4000-8000-000000000001",
      user_id: authenticatedSession.userId,
      day: "2026-04-18",
      title: "Nota que nao deve aparecer",
      content: "Conteudo",
      brief: null,
      tag_id: null,
      color: null,
      is_color_overridden: false,
      created_at: "2026-04-18T09:15:00+00:00",
      updated_at: "2026-04-18T09:15:00+00:00",
    });

    render(<ProtectedDayRoute />);

    expect(await screen.findByText("Falha ao carregar a timeline")).toBeTruthy();
    expect(
      screen.getByText("Nao foi possivel carregar o dia. Falha simulada"),
    ).toBeTruthy();
    expect(screen.queryByText("Nota que nao deve aparecer")).toBeNull();
  });

  it("protege a superficie e preserva a data temporal ao abrir o destino", async () => {
    mockSearchParams.date = "2026-04-20";
    useCalendarStore.setState({
      selectedDate: "2026-04-20",
      clockDate: "2026-04-18",
    });
    mockTasksTable.push({
      id: "20000000-0000-4000-8000-000000000001",
      user_id: authenticatedSession.userId,
      title: "Tarefa projetada sem horario",
      content: "Destino real",
      tag_id: null,
      color: null,
      is_color_overridden: false,
      source_day: "2026-04-18",
      target_day: "2026-04-20",
      created_at: "2026-04-18T10:00:00+00:00",
      scheduled_at: null,
      status: "open",
      completed_at: null,
      updated_at: "2026-04-18T10:00:00+00:00",
    });

    render(<ProtectedDayRoute />);

    expect(await screen.findByText("20-04-2026")).toBeTruthy();
    expect(await screen.findByText("Tarefa projetada sem horario")).toBeTruthy();
    expect(
      screen.getByTestId(
        "task-card-real-20000000-0000-4000-8000-000000000001",
      ),
    ).toBeTruthy();
    expect(
      screen.queryByTestId(
        "task-card-ghost-20000000-0000-4000-8000-000000000001",
      ),
    ).toBeNull();
    expect(useCalendarStore.getState().selectedDate).toBe("2026-04-20");
  });

  it("redireciona a rota protegida sem sessao sem renderizar a timeline", async () => {
    useAuthStore.setState({
      status: "unauthenticated",
      session: null,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: false,
    });

    render(<ProtectedDayRoute />);

    expect(screen.getByText("/sign-in")).toBeTruthy();
    expect(screen.queryByText("Timeline do dia")).toBeNull();

    await waitFor(() => {
      expect(screen.getByTestId("redirect-target")).toBeTruthy();
    });
  });

  it("faz fallback para o dia selecionado quando o parametro da rota e uma data impossivel", async () => {
    mockSearchParams.date = "2026-02-31";

    render(<ProtectedDayRoute />);

    expect(await screen.findByText("18-04-2026")).toBeTruthy();
    expect(screen.queryByText("31-02-2026")).toBeNull();
    expect(useCalendarStore.getState().selectedDate).toBe("2026-04-18");
  });

  it("renderiza listas filtradas em largura util sem eixo central fora da aba timeline", async () => {
    mockNotesTable.push({
      id: "30000000-0000-4000-8000-000000000001",
      user_id: authenticatedSession.userId,
      day: "2026-04-18",
      title: "Nota filtrada",
      content: "Conteudo",
      brief: null,
      tag_id: null,
      color: null,
      is_color_overridden: false,
      created_at: "2026-04-18T09:15:00+00:00",
      updated_at: "2026-04-18T09:15:00+00:00",
    });
    mockTasksTable.push({
      id: "20000000-0000-4000-8000-000000000002",
      user_id: authenticatedSession.userId,
      title: "Tarefa agendada filtrada",
      content: "Conteudo",
      tag_id: null,
      color: null,
      is_color_overridden: false,
      source_day: "2026-04-18",
      target_day: "2026-04-18",
      created_at: "2026-04-18T10:00:00+00:00",
      scheduled_at: "2026-04-18T18:30:00+00:00",
      status: "open",
      completed_at: null,
      updated_at: "2026-04-18T10:00:00+00:00",
    });

    render(<ProtectedDayRoute />);

    expect(await screen.findByTestId("timeline-axis-rail")).toBeTruthy();

    fireEvent.press(screen.getByTestId("day-tab-tasks"));

    expect(await screen.findByTestId("tasks-list-view")).toBeTruthy();
    expect(screen.queryByTestId("timeline-axis-rail")).toBeNull();
    expect(
      screen.getByTestId("task-card-timed-20000000-0000-4000-8000-000000000002"),
    ).toBeTruthy();
    expect(
      screen.queryByTestId(
        "task-creation-marker-20000000-0000-4000-8000-000000000002",
      ),
    ).toBeNull();

    fireEvent.press(screen.getByTestId("day-tab-notes"));

    expect(await screen.findByTestId("notes-list-view")).toBeTruthy();
    expect(screen.queryByTestId("timeline-axis-rail")).toBeNull();
    expect(
      screen.getByTestId("note-card-real-30000000-0000-4000-8000-000000000001"),
    ).toBeTruthy();
  });
});
