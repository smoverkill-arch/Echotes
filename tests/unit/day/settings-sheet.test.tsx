import { fireEvent, render, screen } from "@testing-library/react-native";

import { SettingsSheet } from "../../../src/components/day/settings-sheet";
import { useAppearanceStore } from "../../../src/stores/appearance-store";

describe("SettingsSheet", () => {
  beforeEach(() => {
    useAppearanceStore.setState({
      mode: "dark",
      accent: "amber",
      density: "normal",
    });
  });

  // @req UI-APPEARANCE-001
  it("persiste escolhas locais de tema, destaque e densidade", () => {
    render(<SettingsSheet visible onClose={jest.fn()} />);

    fireEvent.press(screen.getByTestId("settings-dark-mode-toggle"));
    fireEvent.press(screen.getByTestId("settings-accent-slate"));
    fireEvent.press(screen.getByTestId("settings-density-compact"));

    expect(useAppearanceStore.getState().mode).toBe("light");
    expect(useAppearanceStore.getState().accent).toBe("slate");
    expect(useAppearanceStore.getState().density).toBe("compact");
  });

  // @req UI-APPEARANCE-001
  it("fecha pelo controle explicito sem alterar os fluxos do dia", () => {
    const onClose = jest.fn();

    render(<SettingsSheet visible onClose={onClose} />);
    fireEvent.press(screen.getByTestId("settings-close-button"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
