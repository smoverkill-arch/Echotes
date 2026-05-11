import { fireEvent, render, screen } from "@testing-library/react-native";

import { NoteReader } from "../../../src/components/reader/note-reader";
import type { RelatedNote } from "../../../src/types/note";
import { buildNote } from "../../support/note-echo-fixtures";

// @req 002-note-echo-flows:FR-004
// @req 002-note-echo-flows:FR-010
// @req 002-note-echo-flows:FR-011
// @req 002-note-echo-flows:FR-021
// @req 002-note-echo-flows:SC-001
const activeNote = buildNote({
  id: "10000000-0000-4000-8000-000000000001",
  title: "Nota aberta",
  day: "2026-05-01",
});

const availableRelatedNote: RelatedNote = {
  id: "10000000-0000-4000-8000-000000000002",
  day: "2026-05-01",
  title: "Nota conectada",
  brief: "Ligacao direta",
  created_at: "2026-05-01T11:00:00+00:00",
  kind: "manual_link",
  echoId: "30000000-0000-4000-8000-000000000001",
  availability: "available",
};

const unavailableRelatedNote: RelatedNote = {
  id: "10000000-0000-4000-8000-000000000003",
  day: null,
  title: null,
  brief: null,
  created_at: null,
  kind: "continue_note",
  echoId: "30000000-0000-4000-8000-000000000002",
  availability: "stale_detail",
};

describe("NoteReader note echo relations", () => {
  it("renderiza ecos e item indisponivel sem expor acoes de fases futuras", () => {
    const onOpenRelatedNote = jest.fn();
    const onReloadRelatedNote = jest.fn();

    render(
      <NoteReader
        visible
        note={activeNote}
        relatedNotes={[availableRelatedNote, unavailableRelatedNote]}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onOpenRelatedNote={onOpenRelatedNote}
        onReloadRelatedNote={onReloadRelatedNote}
      />,
    );

    expect(screen.getByText("Ecos")).toBeTruthy();
    expect(screen.queryByText("Adicionar eco")).toBeNull();
    expect(screen.queryByText("Continuar desta nota")).toBeNull();
    expect(screen.getByText("Nota conectada")).toBeTruthy();
    expect(screen.getByText("Item indisponivel")).toBeTruthy();
    expect(screen.getByText("Recarregar")).toBeTruthy();

    fireEvent.press(
      screen.getByTestId(`note-reader-open-related-note-${availableRelatedNote.id}`),
    );
    fireEvent.press(
      screen.getByTestId(`note-reader-reload-related-note-${unavailableRelatedNote.id}`),
    );

    expect(onOpenRelatedNote).toHaveBeenCalledWith(availableRelatedNote);
    expect(onReloadRelatedNote).toHaveBeenCalledTimes(1);
  });

  it("renderiza comandos opcionais apenas quando handlers existem", () => {
    const onAddEcho = jest.fn();
    const onContinueNote = jest.fn();

    render(
      <NoteReader
        visible
        note={activeNote}
        relatedNotes={[]}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onAddEcho={onAddEcho}
        onContinueNote={onContinueNote}
      />,
    );

    fireEvent.press(screen.getByTestId("note-reader-add-echo-button"));
    fireEvent.press(screen.getByTestId("note-reader-continue-note-button"));

    expect(onAddEcho).toHaveBeenCalledTimes(1);
    expect(onContinueNote).toHaveBeenCalledTimes(1);
  });
});
