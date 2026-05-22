import { fireEvent, render, screen } from "@testing-library/react-native";

import { DayBottomTabs } from "../../../src/components/day/day-bottom-tabs";

describe("DayBottomTabs", () => {
  // @req 003-mobile-day-shell-ux:FR-008
  it("mantem tabs como lentes do dia selecionado na bottom bar", () => {
    const onTabChange = jest.fn();

    render(<DayBottomTabs activeTab="timeline" onTabChange={onTabChange} />);

    expect(screen.getByTestId("day-tab-timeline").props.accessibilityState).toEqual({
      selected: true,
    });

    fireEvent.press(screen.getByTestId("day-tab-notes"));

    expect(onTabChange).toHaveBeenCalledWith("notes");
  });
});
