import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { BrandMark } from "../../../src/components/brand/brand-mark";
import { Chip } from "../../../src/components/ui/chip";
import { PrimaryAction } from "../../../src/components/ui/primary-action";
import { SecondaryAction } from "../../../src/components/ui/secondary-action";
import { SectionLabel } from "../../../src/components/ui/section-label";
import { useAppearanceStore } from "../../../src/stores/appearance-store";

describe("Brand and UI primitives", () => {
  beforeEach(() => {
    useAppearanceStore.setState({ mode: "dark", accent: "amber", density: "normal" });
  });

  // @req UI-BRAND-001
  it("renderiza BrandMark em tamanhos com wordmark opcional", () => {
    const { rerender } = render(<BrandMark size="sm" />);
    expect(screen.getByTestId("brand-mark-sm")).toBeTruthy();
    expect(screen.getByText("Echotes")).toBeTruthy();

    rerender(<BrandMark size="lg" showWordmark={false} />);
    expect(screen.getByTestId("brand-mark-lg")).toBeTruthy();
    expect(screen.queryByText("Echotes")).toBeNull();
  });

  // @req UI-BRAND-001
  it("mantem a marca consistente ao trocar modo e destaque", () => {
    render(<BrandMark size="md" />);
    act(() => {
      useAppearanceStore.setState({ mode: "light", accent: "slate" });
    });
    expect(screen.getByText("E")).toBeTruthy();
  });

  // @req UI-PRIMITIVE-001
  it("renderiza SectionLabel e Chip", () => {
    render(
      <>
        <SectionLabel tone="note" testID="label">Ecos</SectionLabel>
        <Chip label="Outro dia" tone="note" testID="chip" />
      </>,
    );
    expect(screen.getByTestId("label")).toBeTruthy();
    expect(screen.getByText("Outro dia")).toBeTruthy();
  });

  // @req UI-PRIMITIVE-001
  it("dispara PrimaryAction e respeita disabled", () => {
    const onPress = jest.fn();
    const { rerender } = render(
      <PrimaryAction label="Salvar" onPress={onPress} testID="primary" />,
    );
    fireEvent.press(screen.getByTestId("primary"));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<PrimaryAction label="Salvar" onPress={onPress} disabled testID="primary" />);
    fireEvent.press(screen.getByTestId("primary"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // @req UI-PRIMITIVE-001
  it("dispara SecondaryAction neutro e destrutivo", () => {
    const onPress = jest.fn();
    render(
      <SecondaryAction label="Remover" tone="danger" onPress={onPress} testID="secondary" />,
    );
    fireEvent.press(screen.getByTestId("secondary"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
