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

    fireEvent.press(screen.getByTestId("day-calendar-month-day-2026-04-30"));

    expect(baseProps.onCalendarModeChange).toHaveBeenCalledWith("week");
    expect(baseProps.onDateChange).toHaveBeenCalledWith("2026-04-30");
  });
});
