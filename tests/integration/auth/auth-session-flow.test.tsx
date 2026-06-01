import { act, cleanup, render, screen, waitFor } from "@testing-library/react-native";

import IndexRoute from "../../../app/index";
import ProtectedDayRoute from "../../../app/day/[date]";
import { restoreSession } from "../../../src/features/auth/api/restore-session";
import { signOut } from "../../../src/features/auth/api/sign-out";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useOnboardingStore } from "../../../src/stores/onboarding-store";
import type { AuthenticatedSession } from "../../../src/types/auth";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockSearchParams: { date?: string | string[] } = {
  date: "2026-04-18",
};

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignOut = jest.fn();
const mockStartSupabaseSessionAutoRefresh = jest.fn(() => () => undefined);

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
  getSupabaseClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
  startSupabaseSessionAutoRefresh: mockStartSupabaseSessionAutoRefresh,
}));

jest.mock("../../../src/features/day/hooks/use-day-timeline", () => ({
  useDayTimeline: () => ({
    notes: [],
    tasks: [],
    echoes: [],
    taskLookup: new Map(),
    taskNodes: [],
    noteNodes: [],
    isLoading: false,
    errorMessage: null,
    reload: jest.fn(async () => undefined),
  }),
}));

const authenticatedSession: AuthenticatedSession = {
  userId: "2ce8fe8c-53ac-4ec6-98c4-77db7993bd1b",
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const supabaseSession = {
  access_token: authenticatedSession.accessToken,
  refresh_token: authenticatedSession.refreshToken,
  user: {
    id: authenticatedSession.userId,
    email: authenticatedSession.email,
  },
};

const setUnauthenticatedState = (message: string | null = null) => {
  useAuthStore.setState({
    status: "unauthenticated",
    session: null,
    errorMessage: message,
    hasHydrated: true,
    isRestoring: false,
    isAuthenticated: false,
  });
};

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

afterEach(() => {
  cleanup();
});

describe("US1 auth session flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.date = "2026-04-18";
    useCalendarStore.setState({
      selectedDate: "2026-04-18",
      clockDate: "2026-04-18",
    });
    useOnboardingStore.setState({ hasSeen: true, hasHydrated: true });
    setUnauthenticatedState();
  });

  // @req FR-003
  // @req SC-002
  it("restaura a sessao local e atualiza o estado autenticado", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: supabaseSession },
      error: null,
    });

    useAuthStore.setState({
      hasHydrated: false,
      isRestoring: false,
    });

    let result:
      | Awaited<ReturnType<typeof restoreSession>>
      | undefined;

    await act(async () => {
      result = await restoreSession();
    });

    expect(result).toEqual({
      ok: true,
      status: "authenticated",
      errorMessage: null,
    });
    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      isAuthenticated: true,
      hasHydrated: true,
      isRestoring: false,
      errorMessage: null,
      session: authenticatedSession,
    });
  });

  // @req FR-004
  // @req SC-001
  it("nao expoe a rota protegida sem sessao valida", async () => {
    render(<ProtectedDayRoute />);

    expect(screen.getByText("/sign-in")).toBeTruthy();
    expect(screen.queryByTestId("day-tab-tasks")).toBeNull();
  });

  // @req FR-006
  // @req 003-mobile-day-shell-ux:FR-001
  // @req 003-mobile-day-shell-ux:FR-003
  // @req SC-002
  it("permite acesso ao shell minimo do dia quando a sessao esta autenticada", async () => {
    setAuthenticatedState();

    render(<ProtectedDayRoute />);

    expect(screen.getByText("Echotes")).toBeTruthy();
    expect(screen.getByTestId("day-calendar-month-toggle")).toBeTruthy();
    expect(screen.getByTestId("day-calendar-week-day-2026-04-18")).toBeTruthy();
    expect(screen.getByTestId("day-tab-tasks")).toBeTruthy();
    expect(screen.getByText("18-04-2026")).toBeTruthy();
    expect(screen.getByText("pessoa@echotes.app")).toBeTruthy();
    expect(screen.queryByText("/sign-in")).toBeNull();
  });

  // @req FR-005
  it("faz logout real e retorna ao fluxo publico", async () => {
    setAuthenticatedState();
    mockSignOut.mockResolvedValue({ error: null });

    await act(async () => {
      await signOut();
    });

    render(<IndexRoute />);

    expect(useAuthStore.getState()).toMatchObject({
      status: "unauthenticated",
      isAuthenticated: false,
      session: null,
      errorMessage: null,
    });
    expect(screen.getByText("/sign-in")).toBeTruthy();
  });

  it("mantem a sessao autenticada e exibe feedback quando o logout falha", async () => {
    setAuthenticatedState();
    mockSignOut.mockRejectedValue(new Error("Falha de rede"));

    render(<ProtectedDayRoute />);

    await act(async () => {
      await signOut();
    });

    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      isAuthenticated: true,
      session: authenticatedSession,
      errorMessage: "Nao foi possivel encerrar a sessao. Falha de rede",
    });
    expect(screen.getByTestId("auth-error-banner")).toBeTruthy();
    expect(screen.getByText("Falha de sessao")).toBeTruthy();
    expect(
      screen.getByText("Nao foi possivel encerrar a sessao. Falha de rede"),
    ).toBeTruthy();
  });

  it("retorna ao fluxo publico com feedback quando a sessao expira", async () => {
    await act(async () => {
      useAuthStore.setState({
        status: "session_expired",
        session: null,
        errorMessage: "Sua sessao expirou. Entre novamente.",
        hasHydrated: true,
        isRestoring: false,
        isAuthenticated: false,
      });
    });

    render(<ProtectedDayRoute />);

    expect(screen.getByTestId("auth-error-banner")).toBeTruthy();
    expect(screen.getByText("Sessao expirada")).toBeTruthy();
    expect(screen.getByText("Sua sessao expirou. Entre novamente.")).toBeTruthy();

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/sign-in");
    });
  });
});
