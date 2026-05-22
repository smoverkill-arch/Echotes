import { render, screen } from "@testing-library/react-native";

import { NoteCardReal } from "../../../src/components/cards/note-card-real";
import { buildNote } from "../../support/note-echo-fixtures";

describe("NoteCardReal", () => {
  // @req 003-mobile-day-shell-ux:FR-010
  it("renderiza somente preview curto do conteudo no card", () => {
    const longContent =
      "Primeira linha da nota extensa. Segunda linha com detalhes. Terceira linha que pertence apenas ao reader.";
    const note = buildNote({
      id: "10000000-0000-4000-8000-000000000010",
      title: "Nota longa",
      content: longContent,
      brief: "Resumo alternativo",
    });

    render(<NoteCardReal note={note} directEchoCount={2} />);

    const preview = screen.getByText(longContent);

    expect(screen.getByText("Nota longa")).toBeTruthy();
    expect(screen.getByText("Ecos 2")).toBeTruthy();
    expect(preview.props.numberOfLines).toBe(2);
    expect(screen.queryByText("Resumo alternativo")).toBeNull();
  });
});
