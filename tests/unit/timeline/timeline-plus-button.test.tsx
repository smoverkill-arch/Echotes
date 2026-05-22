import { fireEvent, render, screen } from "@testing-library/react-native";

import { TimelinePlusButton } from "../../../src/components/timeline/timeline-plus-button";

const baseProps = {
  isSheetOpen: false,
  onOpenSheet: jest.fn(),
  onCloseSheet: jest.fn(),
  onCreateNote: jest.fn(),
  onCreateTask: jest.fn(),
};

describe("TimelinePlusButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("abre o menu de criacao e respeita disabled", () => {
    const { rerender } = render(<TimelinePlusButton {...baseProps} />);

    fireEvent.press(screen.getByTestId("timeline-plus-button"));

    expect(baseProps.onOpenSheet).toHaveBeenCalledTimes(1);

    rerender(<TimelinePlusButton {...baseProps} isDisabled />);
    fireEvent.press(screen.getByTestId("timeline-plus-button"));

    expect(baseProps.onOpenSheet).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("timeline-plus-button").props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("chama criar nota, criar tarefa e cancelar pelo sheet", () => {
    render(<TimelinePlusButton {...baseProps} isSheetOpen />);

    expect(screen.getByTestId("timeline-plus-sheet")).toBeTruthy();

    fireEvent.press(screen.getByTestId("timeline-create-note-button"));
    fireEvent.press(screen.getByTestId("timeline-create-task-button"));
    fireEvent.press(screen.getByTestId("timeline-plus-cancel-button"));

    expect(baseProps.onCreateNote).toHaveBeenCalledTimes(1);
    expect(baseProps.onCreateTask).toHaveBeenCalledTimes(1);
    expect(baseProps.onCloseSheet).toHaveBeenCalledTimes(1);
  });
});
