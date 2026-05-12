import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { NoteEditor } from "../../../src/components/forms/note-editor";
import { createNote } from "../../../src/features/notes/api/create-note";
import { updateNote } from "../../../src/features/notes/api/update-note";
import { buildNote } from "../../support/note-echo-fixtures";

jest.mock("../../../src/features/notes/api/create-note", () => ({
  createNote: jest.fn(),
}));

jest.mock("../../../src/features/notes/api/update-note", () => ({
  updateNote: jest.fn(),
}));

const note = buildNote({
  id: "10000000-0000-4000-8000-000000000001",
  title: "Nota existente",
  day: "2026-05-02",
  content: "Conteudo antigo",
  brief: "Briefing antigo",
});

const mockedCreateNote = jest.mocked(createNote);
const mockedUpdateNote = jest.mocked(updateNote);

const renderEditor = (overrides: Partial<Parameters<typeof NoteEditor>[0]> = {}) => {
  const props = {
    visible: true,
    mode: "create" as const,
    selectedDay: "2026-05-01",
    note: null,
    onClose: jest.fn(),
    onSaved: jest.fn(),
    ...overrides,
  };

  render(<NoteEditor {...props} />);

  return props;
};

describe("NoteEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("renderiza modo de criacao com chip do dia e preserva payload de createNote", async () => {
    const createdNote = buildNote({
      id: "10000000-0000-4000-8000-000000000099",
      title: "Nova nota",
      day: "2026-05-01",
    });
    mockedCreateNote.mockResolvedValue({
      ok: true,
      note: createdNote,
      errorMessage: null,
    });
    const { onSaved } = renderEditor();

    expect(screen.getByText("Criar nota")).toBeTruthy();
    expect(screen.getByText("01-05-2026")).toBeTruthy();

    fireEvent.changeText(screen.getByTestId("note-editor-title-input"), "Nova nota");
    fireEvent.changeText(
      screen.getByTestId("note-editor-content-input"),
      "Conteudo novo",
    );
    fireEvent.changeText(screen.getByTestId("note-editor-brief-input"), "Resumo");
    fireEvent.press(screen.getByTestId("note-editor-submit-button"));

    await waitFor(() => {
      expect(mockedCreateNote).toHaveBeenCalledWith({
        title: "Nova nota",
        content: "Conteudo novo",
        brief: "Resumo",
        day: "2026-05-01",
        tag_id: null,
        color: null,
        is_color_overridden: false,
      });
      expect(onSaved).toHaveBeenCalledWith(createdNote);
    });
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("renderiza modo de edicao e preserva payload de updateNote", async () => {
    const updatedNote = { ...note, title: "Nota revisada" };
    mockedUpdateNote.mockResolvedValue({
      ok: true,
      note: updatedNote,
      errorMessage: null,
    });
    const { onSaved } = renderEditor({
      mode: "edit",
      selectedDay: "2026-05-01",
      note,
    });

    expect(screen.getByText("Editar nota")).toBeTruthy();
    expect(screen.getByText("02-05-2026")).toBeTruthy();

    fireEvent.changeText(
      screen.getByTestId("note-editor-title-input"),
      "Nota revisada",
    );
    fireEvent.press(screen.getByTestId("note-editor-submit-button"));

    await waitFor(() => {
      expect(mockedUpdateNote).toHaveBeenCalledWith(note, {
        title: "Nota revisada",
        content: "Conteudo antigo",
        brief: "Briefing antigo",
        day: note.day,
        tag_id: note.tag_id,
        color: note.color,
        is_color_overridden: note.is_color_overridden,
      });
      expect(onSaved).toHaveBeenCalledWith(updatedNote);
    });
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("mostra erro de salvamento como bloco de feedback", async () => {
    mockedCreateNote.mockResolvedValue({
      ok: false,
      note: null,
      errorMessage: "Nao foi possivel criar a nota.",
    });
    const { onSaved } = renderEditor();

    fireEvent.press(screen.getByTestId("note-editor-submit-button"));

    expect(await screen.findByTestId("note-editor-error")).toBeTruthy();
    expect(screen.getByText("Nao foi possivel criar a nota.")).toBeTruthy();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
