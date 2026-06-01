import { fireEvent, render, screen } from "@testing-library/react-native";

import { DayHeader } from "../../../src/components/day/day-header";

const baseProps = {
  date: "2026-04-18",
  clockDate: "2026-04-18",
  email: "pessoa@echotes.app",
  calendarMode: "week" as const,
  isSigningOut: false,
  onDateChange: jest.fn(),
  onCalendarModeChange: jest.fn(),
  onSignOut: jest.fn(),
  onSettings: jest.fn(),
};

describe("DayHeader calendar shell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // @req 003-mobile-day-shell-ux:FR-001
  // @req 003-mobile-day-shell-ux:FR-002
  // @req 003-mobile-day-shell-ux:FR-003
  it("renderiza a semana com domingo como inicio e estados de hoje/selecionado", () => {
    render(<DayHeader {...baseProps} />);

    expect(screen.getByTestId("day-calendar-week-day-2026-04-12")).toBeTruthy();
    expect(screen.getByTestId("day-calendar-week-day-2026-04-18")).toBeTruthy();
    expect(
      screen.getByTestId("day-calendar-week-day-2026-04-18").props
        .accessibilityState.selected,
    ).toBe(true);
    expect(screen.getByText("Voce esta em hoje")).toBeTruthy();
  });

  // @req 003-mobile-day-shell-ux:FR-004
  it("navega para semanas anterior e proxima", () => {
    render(<DayHeader {...baseProps} />);

    fireEvent.press(screen.getByTestId("day-calendar-previous-week"));
    fireEvent.press(screen.getByTestId("day-calendar-next-week"));

    expect(baseProps.onDateChange).toHaveBeenNthCalledWith(1, "2026-04-11");
    expect(baseProps.onDateChange).toHaveBeenNthCalledWith(2, "2026-04-25");
  });

  // @req 003-mobile-day-shell-ux:FR-005
  it("volta para hoje quando outro dia esta selecionado", () => {
    render(
      <DayHeader
        {...baseProps}
        date="2026-04-15"
        clockDate="2026-04-18"
      />,
    );

    fireEvent.press(screen.getByTestId("day-calendar-today-button"));

    expect(baseProps.onCalendarModeChange).toHaveBeenCalledWith("week");
    expect(baseProps.onDateChange).toHaveBeenCalledWith("2026-04-18");
  });

  // @req 003-mobile-day-shell-ux:FR-006
  it("expande mes inline e escolhe uma data", () => {
    render(<DayHeader {...baseProps} calendarMode="month" />);

    expect(screen.getByTestId("day-calendar-month-sheet")).toBeTruthy();
    expect(screen.queryByTestId("day-calendar-week-day-2026-04-18")).toBeNull();
    expect(screen.getByTestId("day-calendar-month-week-0").props.children).toHaveLength(7);
    expect(screen.getByTestId("day-calendar-month-week-5").props.children).toHaveLength(7);
    expect(screen.getByTestId("day-calendar-month-day-2026-04-25")).toBeTruthy();

    fireEvent.press(screen.getByTestId("day-calendar-month-day-2026-04-30"));

    expect(baseProps.onCalendarModeChange).toHaveBeenCalledWith("week");
    expect(baseProps.onDateChange).toHaveBeenCalledWith("2026-04-30");
  });

  it("usa os chevrons para navegar por mes quando o calendario mensal esta aberto", () => {
    render(<DayHeader {...baseProps} calendarMode="month" />);

    fireEvent.press(screen.getByTestId("day-calendar-previous-week"));
    fireEvent.press(screen.getByTestId("day-calendar-next-week"));

    expect(baseProps.onDateChange).toHaveBeenNthCalledWith(1, "2026-03-01");
    expect(baseProps.onDateChange).toHaveBeenNthCalledWith(2, "2026-05-01");
  });

  // @req UI-HEADER-001
  it("mostra a marca Echotes e o chip de hoje quando o dia selecionado e hoje", () => {
    render(<DayHeader {...baseProps} />);

    expect(screen.getByText("Echotes")).toBeTruthy();
    expect(screen.getByText("18-04-2026")).toBeTruthy();
    expect(screen.getByTestId("day-header-today-chip")).toBeTruthy();
  });

  // @req UI-HEADER-001
  it("alterna o calendario entre semana e mes pelo toggle", () => {
    const { rerender } = render(<DayHeader {...baseProps} calendarMode="week" />);

    fireEvent.press(screen.getByTestId("day-calendar-month-toggle"));
    expect(baseProps.onCalendarModeChange).toHaveBeenLastCalledWith("month");

    rerender(<DayHeader {...baseProps} calendarMode="month" />);
    fireEvent.press(screen.getByTestId("day-calendar-month-toggle"));
    expect(baseProps.onCalendarModeChange).toHaveBeenLastCalledWith("week");
  });
});
