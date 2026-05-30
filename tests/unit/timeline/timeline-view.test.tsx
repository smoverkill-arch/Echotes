import { act, cleanup, fireEvent, render, screen } from "@testing-library/react-native";

import { TimelineView } from "../../../src/components/timeline/timeline-view";
import type { Note } from "../../../src/types/note";
import type { Task } from "../../../src/types/task";
import type { TimelineNode } from "../../../src/types/timeline";

// @req 002-note-echo-flows:FR-002
// @req 002-note-echo-flows:FR-003
// @req 002-note-echo-flows:FR-019
// @req 002-note-echo-flows:FR-020
// @req 002-note-echo-flows:SC-001
// @req 002-note-echo-flows:SC-006
const noteA: Note = {
  id: "30000000-0000-4000-8000-000000000001",
  user_id: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  day: "2026-04-18",
  title: "Nota A",
  content: "Conteudo A",
  brief: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  created_at: "2026-04-18T09:15:00+00:00",
  updated_at: "2026-04-18T09:15:00+00:00",
};

const noteB: Note = {
  ...noteA,
  id: "30000000-0000-4000-8000-000000000002",
  title: "Nota B",
  content: "Conteudo B",
  created_at: "2026-04-18T09:30:00+00:00",
  updated_at: "2026-04-18T09:30:00+00:00",
};

const timedTask: Task = {
  id: "20000000-0000-4000-8000-000000000001",
  user_id: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  title: "Tarefa futura",
  content: "Detalhe",
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: "2026-04-18",
  target_day: "2026-04-20",
  created_at: "2026-04-18T10:00:00+00:00",
  scheduled_at: "2026-04-20T18:30:00+00:00",
  status: "open",
  completed_at: null,
  updated_at: "2026-04-18T10:00:00+00:00",
};

const noteNodeA: TimelineNode = {
  id: `${noteA.id}:note`,
  type: "note",
  itemKind: "note",
  itemId: noteA.id,
  sortAt: "2026-04-18T09:15:00",
  createdAt: noteA.created_at,
  scheduledAt: null,
  data: noteA,
};

const noteNodeB: TimelineNode = {
  ...noteNodeA,
  id: `${noteB.id}:note`,
  itemId: noteB.id,
  sortAt: "2026-04-18T09:30:00",
  createdAt: noteB.created_at,
  data: noteB,
};

const noteNodeWithEchoes: TimelineNode = {
  ...noteNodeA,
  directEchoCount: 2,
};

const ghostNode: TimelineNode = {
  id: `${timedTask.id}:task_ghost`,
  type: "task_ghost",
  itemKind: "task",
  itemId: timedTask.id,
  sortAt: "2026-04-18T10:00:00",
  createdAt: timedTask.created_at,
  scheduledAt: timedTask.scheduled_at,
  data: timedTask,
};

const renderTimelineView = (
  nodes: TimelineNode[],
  overrides: Partial<Parameters<typeof TimelineView>[0]> = {},
) => {
  const onOpenReader = jest.fn();
  const onOpenEditor = jest.fn();
  const onNavigateToTask = jest.fn();

  render(
    <TimelineView
      activeTab="timeline"
      nodes={nodes}
      isLoading={false}
      errorMessage={null}
      onOpenReader={onOpenReader}
      onOpenEditor={onOpenEditor}
      onNavigateToTask={onNavigateToTask}
      {...overrides}
    />,
  );

  return {
    onOpenReader,
    onOpenEditor,
    onNavigateToTask,
    onScrollInteractionStart: overrides.onScrollInteractionStart,
    onScrollInteractionEnd: overrides.onScrollInteractionEnd,
  };
};

describe("timeline view pending press handling", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  // @req 002-note-echo-flows:FR-019
  it("abre o reader no single tap", async () => {
    const { onOpenReader, onOpenEditor } = renderTimelineView([noteNodeA]);

    fireEvent.press(screen.getByTestId(`timeline-node-${noteNodeA.id}`));

    await act(async () => {
      jest.advanceTimersByTime(220);
    });

    expect(onOpenReader).toHaveBeenCalledWith("note", noteA.id);
    expect(onOpenEditor).not.toHaveBeenCalled();
  });

  // @req 002-note-echo-flows:FR-020
  it("abre o editor no double tap do mesmo item", () => {
    const { onOpenReader, onOpenEditor } = renderTimelineView([noteNodeA]);

    fireEvent.press(screen.getByTestId(`timeline-node-${noteNodeA.id}`));
    fireEvent.press(screen.getByTestId(`timeline-node-${noteNodeA.id}`));

    expect(onOpenEditor).toHaveBeenCalledWith("note", noteA.id);

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(onOpenReader).not.toHaveBeenCalled();
  });

  it("cancela o press pendente anterior ao tocar rapidamente em outro item", async () => {
    const { onOpenReader } = renderTimelineView([noteNodeA, noteNodeB]);

    fireEvent.press(screen.getByTestId(`timeline-node-${noteNodeA.id}`));
    fireEvent.press(screen.getByTestId(`timeline-node-${noteNodeB.id}`));

    await act(async () => {
      jest.advanceTimersByTime(220);
    });

    expect(onOpenReader).toHaveBeenCalledTimes(1);
    expect(onOpenReader).toHaveBeenCalledWith("note", noteB.id);
  });

  it("cancela o press pendente antes de navegar pelo ghost card", () => {
    const { onOpenReader, onNavigateToTask } = renderTimelineView([
      noteNodeA,
      ghostNode,
    ]);

    fireEvent.press(screen.getByTestId(`timeline-node-${noteNodeA.id}`));
    fireEvent.press(screen.getByTestId(`timeline-node-${ghostNode.id}`));

    expect(onNavigateToTask).toHaveBeenCalledWith(timedTask);

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(onOpenReader).not.toHaveBeenCalled();
  });

  it("exibe badge Ecos apenas quando a contagem direta e maior que zero", () => {
    renderTimelineView([noteNodeWithEchoes, noteNodeB]);

    expect(screen.getByTestId(`note-echo-badge-${noteA.id}`)).toBeTruthy();
    expect(screen.getByText("Ecos 2")).toBeTruthy();
    expect(screen.queryByTestId(`note-echo-badge-${noteB.id}`)).toBeNull();
  });

  // @req 003-mobile-day-shell-ux:FR-008
  it("dispara callbacks de esconder e restaurar chrome durante scroll", () => {
    const onScrollInteractionStart = jest.fn();
    const onScrollInteractionEnd = jest.fn();

    renderTimelineView([noteNodeA], {
      onScrollInteractionStart,
      onScrollInteractionEnd,
    });

    fireEvent(screen.getByTestId("timeline-view"), "scrollBeginDrag");
    fireEvent(screen.getByTestId("timeline-view"), "scrollEndDrag");

    expect(onScrollInteractionStart).toHaveBeenCalledTimes(1);
    expect(onScrollInteractionEnd).toHaveBeenCalledTimes(1);
  });
});
