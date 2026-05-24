import { fireEvent, render, screen } from "@testing-library/react-native";

import { DayBottomTabs } from "../../../src/components/day/day-bottom-tabs";

describe("DayBottomTabs", () => {
  // @req 003-mobile-day-shell-ux:FR-008
  it("marca a tab ativa corretamente e dispara onTabChange ao pressionar", () => {
    const onTabChange = jest.fn();
    const onCreateNote = jest.fn();
    const onCreateTask = jest.fn();

    render(
      <DayBottomTabs
        activeTab="tasks"
        onTabChange={onTabChange}
        onCreateNote={onCreateNote}
        onCreateTask={onCreateTask}
      />,
    );

    expect(screen.getByTestId("day-tab-tasks").props.accessibilityState).toEqual({
      selected: true,
    });

    fireEvent.press(screen.getByTestId("day-tab-notes"));

    expect(onTabChange).toHaveBeenCalledWith("notes");
  });
});
