import { fireEvent, render, screen } from "@testing-library/react-native";

import HomeRoute from "../../../app/home";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";

const mockRouter = { push: jest.fn(), replace: jest.fn(), setParams: jest.fn() };

jest.mock("expo-router", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");
  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, { testID: "redirect-target" }, String(href)),
    useRouter: () => mockRouter,
  };
});

const mockTimeline = {
  tasks: [] as unknown[],
  notes: [] as unknown[],
  echoes: [] as unknown[],
  isLoading: false,
};

jest.mock("../../../src/features/day/hooks/use-day-timeline", () => ({
  useDayTimeline: () => mockTimeline,
}));

const buildTask = (overrides: Record<string, unknown>) => ({
  id: "t1",
  user_id: "u1",
  title: "Tarefa",
  content: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: "2026-04-18",
  target_day: "2026-04-18",
  created_at: "2026-04-18T08:00:00+00:00",
  scheduled_at: null,
  status: "open",
  completed_at: null,
  updated_at: "2026-04-18T08:00:00+00:00",
  ...overrides,
});

describe("HomeRoute dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTimeline.tasks = [];
    mockTimeline.notes = [];
    mockTimeline.echoes = [];
    mockTimeline.isLoading = false;
    useCalendarStore.setState({ selectedDate: "2026-04-18", clockDate: "2026-04-18" });
    useAuthStore.setState({
      status: "authenticated",
      session: { userId: "u1", email: "a@b.co", accessToken: "x", refreshToken: "y" },
      isAuthenticated: true,
      isRestoring: false,
      hasHydrated: true,
      errorMessage: null,
    });
  });

  // @req UI-DASHBOARD-001
  it("mostra contagens do dia e proxima tarefa agendada", () => {
    mockTimeline.tasks = [
      buildTask({ id: "t1", scheduled_at: "2026-04-18T09:30:00+00:00", title: "Reuniao" }),
      buildTask({ id: "t2" }),
    ];
    mockTimeline.notes = [{ id: "n1" }];
    mockTimeline.echoes = [{ id: "e1" }, { id: "e2" }, { id: "e3" }];

    render(<HomeRoute />);

    expect(screen.getByTestId("home-summary-tasks")).toBeTruthy();
    expect(screen.getByTestId("home-next-task")).toBeTruthy();
    expect(screen.getByText("Reuniao")).toBeTruthy();
    expect(screen.getByText("09:30")).toBeTruthy();
  });

  // @req UI-DASHBOARD-001
  it("mostra estado vazio quando nao ha itens", () => {
    render(<HomeRoute />);
    expect(screen.getByText("Nada registrado ainda. Comece o seu dia.")).toBeTruthy();
    expect(screen.queryByTestId("home-next-task")).toBeNull();
  });

  // @req UI-DASHBOARD-001
  it("abre o dia pelo CTA primario", () => {
    render(<HomeRoute />);
    fireEvent.press(screen.getByTestId("home-open-day-button"));
    expect(mockRouter.push).toHaveBeenCalledWith("/day/2026-04-18");
  });

  // @req UI-DASHBOARD-001
  it("redireciona para sign-in quando nao autenticado", () => {
    useAuthStore.setState({ isAuthenticated: false, status: "unauthenticated", session: null });
    render(<HomeRoute />);
    expect(screen.getByTestId("redirect-target").props.children).toBe("/sign-in");
  });
});
