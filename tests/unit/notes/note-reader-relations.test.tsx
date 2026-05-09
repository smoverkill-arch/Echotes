import { fireEvent, render, screen } from "@testing-library/react-native";

import { NoteReader } from "../../../src/components/reader/note-reader";
import type { RelatedNote } from "../../../src/types/note";
import { buildNote } from "../../support/note-echo-fixtures";

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
  it("renderiza ecos, item indisponivel e acoes principais", () => {
    const onOpenRelatedNote = jest.fn();
    const onReloadRelatedNote = jest.fn();
    const onAddEcho = jest.fn();
    const onContinueNote = jest.fn();

    render(
      <NoteReader
        visible
        note={activeNote}
        relatedNotes={[availableRelatedNote, unavailableRelatedNote]}
        onClose={jest.fn()}
        onEdit={jest.fn()}
        onOpenRelatedNote={onOpenRelatedNote}
        onReloadRelatedNote={onReloadRelatedNote}
        onAddEcho={onAddEcho}
        onContinueNote={onContinueNote}
      />,
    );

    expect(screen.getByText("Ecos")).toBeTruthy();
    expect(screen.getByText("Adicionar eco")).toBeTruthy();
    expect(screen.getByText("Continuar desta nota")).toBeTruthy();
    expect(screen.getByText("Nota conectada")).toBeTruthy();
    expect(screen.getByText("Item indisponivel")).toBeTruthy();
    expect(screen.getByText("Recarregar")).toBeTruthy();

    fireEvent.press(
      screen.getByTestId(`note-reader-open-related-note-${availableRelatedNote.id}`),
    );
    fireEvent.press(
      screen.getByTestId(`note-reader-reload-related-note-${unavailableRelatedNote.id}`),
    );
    fireEvent.press(screen.getByTestId("note-reader-add-echo-button"));
    fireEvent.press(screen.getByTestId("note-reader-continue-note-button"));

    expect(onOpenRelatedNote).toHaveBeenCalledWith(availableRelatedNote);
    expect(onReloadRelatedNote).toHaveBeenCalledTimes(1);
    expect(onAddEcho).toHaveBeenCalledTimes(1);
    expect(onContinueNote).toHaveBeenCalledTimes(1);
  });
});
