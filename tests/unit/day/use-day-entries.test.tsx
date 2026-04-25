import { render, screen, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";

import { useDayEntries } from "../../../src/features/day/hooks/use-day-entries";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";

type QueryResult = {
  data: Record<string, unknown>[] | null;
  error: Error | null;
};

const mockFrom = jest.fn();
const pendingQueries = new Map<
  string,
  { promise: Promise<QueryResult>; resolve: (result: QueryResult) => void }
>();

const createDeferred = () => {
  let resolve!: (result: QueryResult) => void;
  const promise = new Promise<QueryResult>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => ({
    from: mockFrom,
  }),
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
}));

const authenticatedSession: AuthenticatedSession = {
  userId: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const buildNote = (day: string, suffix: string) => ({
  id: `10000000-0000-4000-8000-00000000000${suffix}`,
  user_id: authenticatedSession.userId,
  day,
  title: `Nota ${suffix}`,
  content: `Conteudo ${suffix}`,
  brief: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  created_at: `${day}T09:15:00+00:00`,
  updated_at: `${day}T09:15:00+00:00`,
});

const resolveQuery = (
  table: "notes" | "tasks",
  column: "day" | "source_day" | "target_day",
  day: string,
  result: QueryResult,
) => {
  const deferred = pendingQueries.get(`${table}:${column}:${day}`);

  if (!deferred) {
    throw new Error(`Missing deferred query for ${table}:${column}:${day}`);
  }

  deferred.resolve(result);
};

function HookProbe({ selectedDay }: { selectedDay: string }) {
  const { notes, isLoading, errorMessage } = useDayEntries(selectedDay);

  return (
    <View>
      <Text testID="selected-day">{selectedDay}</Text>
      <Text testID="loading-state">{isLoading ? "loading" : "ready"}</Text>
      <Text testID="error-state">{errorMessage ?? "ok"}</Text>
      <Text testID="note-titles">
        {notes.map((note) => note.title).join(" | ") || "none"}
      </Text>
    </View>
  );
}

describe("useDayEntries stale response protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pendingQueries.clear();

    mockFrom.mockImplementation((tableName: "notes" | "tasks") => ({
      select() {
        return this;
      },
      eq(column: "day" | "source_day" | "target_day", value: string) {
        return {
          order() {
            const key = `${tableName}:${column}:${value}`;
            const deferred = createDeferred();
            pendingQueries.set(key, deferred);
            return deferred.promise;
          },
        };
      },
    }));

    useAuthStore.setState({
      status: "authenticated",
      session: authenticatedSession,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: true,
    });
  });

  it("ignora a resposta atrasada do dia anterior apos trocar rapidamente de data", async () => {
    const view = render(<HookProbe selectedDay="2026-04-18" />);

    view.rerender(<HookProbe selectedDay="2026-04-19" />);

    resolveQuery("notes", "day", "2026-04-19", {
      data: [buildNote("2026-04-19", "2")],
      error: null,
    });
    resolveQuery("tasks", "source_day", "2026-04-19", {
      data: [],
      error: null,
    });
    resolveQuery("tasks", "target_day", "2026-04-19", {
      data: [],
      error: null,
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-state").props.children).toBe("ready");
    });
    expect(screen.getByTestId("note-titles").props.children).toBe("Nota 2");

    resolveQuery("notes", "day", "2026-04-18", {
      data: [buildNote("2026-04-18", "1")],
      error: null,
    });
    resolveQuery("tasks", "source_day", "2026-04-18", {
      data: [],
      error: null,
    });
    resolveQuery("tasks", "target_day", "2026-04-18", {
      data: [],
      error: null,
    });

    await waitFor(() => {
      expect(screen.getByTestId("note-titles").props.children).toBe("Nota 2");
    });
    expect(screen.queryByText("Nota 1")).toBeNull();
  });
});
