import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { ContinueNoteEditor } from "../../../src/components/forms/continue-note-editor";
import { buildNote } from "../../support/note-echo-fixtures";
import { installMockSystemDate } from "../../support/mock-system-date";

const sourceNote = buildNote({
  id: "10000000-0000-4000-8000-000000000001",
  title: "Nota de origem",
  brief: "Briefing original",
  day: "2026-05-01",
});

const renderEditor = (overrides: Partial<Parameters<typeof ContinueNoteEditor>[0]> = {}) => {
  const props = {
    visible: true,
    selectedDay: "2026-05-01",
    sourceNote,
    isSubmitting: false,
    errorMessage: null,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    ...overrides,
  };

  render(<ContinueNoteEditor {...props} />);

  return props;
};

describe("ContinueNoteEditor", () => {
  let mockSystemDate: ReturnType<typeof installMockSystemDate> | null = null;

  beforeEach(() => {
    mockSystemDate = installMockSystemDate("2026-05-03T12:00:00Z");
  });

  afterEach(() => {
    mockSystemDate?.restore();
    mockSystemDate = null;
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("renderiza origem e dia da nova nota", () => {
    renderEditor();

    expect(screen.getByText("Continuar desta nota")).toBeTruthy();
    expect(screen.getByText("Nota de origem")).toBeTruthy();
    expect(screen.getByText("Dia original")).toBeTruthy();
    expect(screen.getByText("01-05-2026")).toBeTruthy();
    expect(screen.getByTestId("continue-note-day-input").props.value).toBe(
      "2026-05-01",
    );
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("atualiza o campo com Dia anterior, Dia seguinte e Hoje", () => {
    renderEditor();

    fireEvent.press(screen.getByTestId("continue-note-next-day-button"));
    expect(screen.getByTestId("continue-note-day-input").props.value).toBe(
      "2026-05-02",
    );

    fireEvent.press(screen.getByTestId("continue-note-previous-day-button"));
    expect(screen.getByTestId("continue-note-day-input").props.value).toBe(
      "2026-05-01",
    );

    fireEvent.press(screen.getByTestId("continue-note-today-button"));
    expect(screen.getByTestId("continue-note-day-input").props.value).toBe(
      "2026-05-03",
    );
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("bloqueia dia anterior ao original com mensagem clara", async () => {
    const { onSubmit } = renderEditor();

    fireEvent.press(screen.getByTestId("continue-note-previous-day-button"));
    expect(
      screen.getByTestId("continue-note-before-origin-warning"),
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId("continue-note-submit-button"));

    expect(await screen.findByTestId("continue-note-error")).toBeTruthy();
    expect(
      screen.getByText("O dia da nota nao pode ser anterior ao dia original."),
    ).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("preserva o payload atual no submit valido", async () => {
    const { onSubmit } = renderEditor();

    fireEvent.changeText(
      screen.getByTestId("continue-note-title-input"),
      "Continuidade nova",
    );
    fireEvent.press(screen.getByTestId("continue-note-next-day-button"));
    fireEvent.changeText(
      screen.getByTestId("continue-note-brief-input"),
      "Briefing preservado",
    );
    fireEvent.changeText(
      screen.getByTestId("continue-note-content-input"),
      "Texto da continuidade",
    );
    fireEvent.press(screen.getByTestId("continue-note-submit-button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        sourceNoteId: sourceNote.id,
        newNoteDay: "2026-05-02",
        title: "Continuidade nova",
        generatedBrief: "Briefing preservado",
        content: "Texto da continuidade",
      });
    });
  });
});
