import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { NoteEchoPicker } from "../../../src/components/reader/note-echo-picker";
import {
  listNoteCandidates,
  type ListNoteCandidatesResult,
} from "../../../src/features/notes/api/list-note-candidates";
import type { NoteEchoCandidate, NoteEchoCandidateCursor } from "../../../src/types/note";
import { buildNote } from "../../support/note-echo-fixtures";

jest.mock("../../../src/features/notes/api/list-note-candidates", () => ({
  listNoteCandidates: jest.fn(),
}));

const sourceNote = buildNote({
  id: "10000000-0000-4000-8000-000000000001",
  title: "Nota de origem",
  day: "2026-05-01",
});

const sameDayCandidate: NoteEchoCandidate = {
  id: "20000000-0000-4000-8000-000000000001",
  day: "2026-05-01",
  title: "Candidata do mesmo dia",
  brief: "Ligacao no mesmo dia",
  created_at: "2026-05-01T09:00:00+00:00",
  isAlreadyConnected: false,
};

const connectedOtherDayCandidate: NoteEchoCandidate = {
  id: "20000000-0000-4000-8000-000000000002",
  day: "2026-05-02",
  title: "Candidata ja conectada",
  brief: null,
  created_at: "2026-05-02T09:00:00+00:00",
  isAlreadyConnected: true,
};

const nextCursor: NoteEchoCandidateCursor = {
  isSelectedDayGroup: true,
  day: sameDayCandidate.day,
  created_at: sameDayCandidate.created_at,
  id: sameDayCandidate.id,
};

const okResult = (
  items: NoteEchoCandidate[],
  cursor: NoteEchoCandidateCursor | null = null,
): ListNoteCandidatesResult => ({
  ok: true,
  page: {
    items,
    nextCursor: cursor,
  },
  errorMessage: null,
});

const mockedListNoteCandidates = jest.mocked(listNoteCandidates);

describe("NoteEchoPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("renderiza origem, contexto das candidatas e bloqueia eco existente", async () => {
    const onSelectCandidate = jest.fn();
    mockedListNoteCandidates.mockResolvedValue(
      okResult([sameDayCandidate, connectedOtherDayCandidate], nextCursor),
    );

    render(
      <NoteEchoPicker
        visible
        existingEchoes={[]}
        selectedDay="2026-05-01"
        sourceNote={sourceNote}
        onClose={jest.fn()}
        onSelectCandidate={onSelectCandidate}
      />,
    );

    expect(await screen.findByText("Adicionar eco")).toBeTruthy();
    expect(screen.getAllByText("Nota de origem").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("01-05-2026").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByTestId(`note-echo-candidate-chip-${sameDayCandidate.id}`).props
        .children,
    ).toBe("Mesmo dia");
    expect(
      screen.getByTestId(`note-echo-candidate-chip-${connectedOtherDayCandidate.id}`)
        .props.children,
    ).toBe("Outro dia");
    expect(screen.getByText("Eco ja existe")).toBeTruthy();

    fireEvent.press(screen.getByTestId(`note-echo-candidate-${sameDayCandidate.id}`));
    fireEvent.press(
      screen.getByTestId(`note-echo-candidate-${connectedOtherDayCandidate.id}`),
    );

    expect(onSelectCandidate).toHaveBeenCalledTimes(1);
    expect(onSelectCandidate).toHaveBeenCalledWith(sameDayCandidate);
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("desabilita Carregar mais enquanto pagina candidatas", async () => {
    let resolveLoadMore: (value: ListNoteCandidatesResult) => void = () => {};
    const loadMorePromise = new Promise<ListNoteCandidatesResult>((resolve) => {
      resolveLoadMore = resolve;
    });
    mockedListNoteCandidates
      .mockResolvedValueOnce(okResult([sameDayCandidate], nextCursor))
      .mockReturnValueOnce(loadMorePromise);

    render(
      <NoteEchoPicker
        visible
        existingEchoes={[]}
        selectedDay="2026-05-01"
        sourceNote={sourceNote}
        onClose={jest.fn()}
        onSelectCandidate={jest.fn()}
      />,
    );

    const loadMoreButton = await screen.findByTestId(
      "note-echo-picker-load-more-button",
    );
    fireEvent.press(loadMoreButton);

    expect(screen.getByText("Carregando...")).toBeTruthy();
    expect(loadMoreButton.props.accessibilityState).toEqual({ disabled: true });
    expect(mockedListNoteCandidates.mock.calls[1][0]).toMatchObject({
      cursor: nextCursor,
    });

    await act(async () => {
      resolveLoadMore(okResult([]));
      await loadMorePromise;
    });
    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).toBeNull();
    });
  });

  // @req 003-mobile-day-shell-ux:FR-009
  it("mostra bloco de erro e bloco vazio", async () => {
    mockedListNoteCandidates.mockResolvedValueOnce({
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: "Falha ao carregar candidatas.",
      status: "retryable_failure",
    });

    const { rerender } = render(
      <NoteEchoPicker
        visible
        existingEchoes={[]}
        selectedDay="2026-05-01"
        sourceNote={sourceNote}
        onClose={jest.fn()}
        onSelectCandidate={jest.fn()}
      />,
    );

    expect(await screen.findByTestId("note-echo-picker-error")).toBeTruthy();
    expect(screen.getByText("Falha ao carregar candidatas.")).toBeTruthy();

    mockedListNoteCandidates.mockResolvedValueOnce(okResult([]));
    rerender(
      <NoteEchoPicker
        visible={false}
        existingEchoes={[]}
        selectedDay="2026-05-01"
        sourceNote={sourceNote}
        onClose={jest.fn()}
        onSelectCandidate={jest.fn()}
      />,
    );
    rerender(
      <NoteEchoPicker
        visible
        existingEchoes={[]}
        selectedDay="2026-05-01"
        sourceNote={sourceNote}
        onClose={jest.fn()}
        onSelectCandidate={jest.fn()}
      />,
    );

    expect(await screen.findByTestId("note-echo-picker-empty")).toBeTruthy();
    expect(screen.getByText("Nenhuma candidata disponivel")).toBeTruthy();
  });
});
