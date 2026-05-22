import { fireEvent, render, screen } from "@testing-library/react-native";

import { TaskReader } from "../../../src/components/reader/task-reader";
import type { TemporalNavigationContext } from "../../../src/stores/navigation-store";
import type { Task } from "../../../src/types/task";

const task: Task = {
  id: "20000000-0000-4000-8000-000000000001",
  user_id: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  title: "Tarefa futura",
  content: "Detalhe da tarefa",
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: "2026-05-01",
  target_day: "2026-05-02",
  created_at: "2026-05-01T09:00:00+00:00",
  scheduled_at: "2026-05-02T18:30:00+00:00",
  status: "open",
  completed_at: null,
  updated_at: "2026-05-01T09:00:00+00:00",
};

const temporalContext: TemporalNavigationContext = {
  sourceDate: "2026-05-01",
  destinationDate: "2026-05-02",
  sourceTaskId: task.id,
  returnScrollOffset: null,
  pendingOpenTaskId: task.id,
  isTemporalNavigationActive: true,
};

describe("TaskReader", () => {
  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("renderiza chips de tarefa, contexto de ghost card e aciona editar", () => {
    const onEdit = jest.fn();

    render(
      <TaskReader
        visible
        task={task}
        temporalContext={temporalContext}
        onClose={jest.fn()}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByText("Reader de tarefa")).toBeTruthy();
    expect(screen.getByText("Tarefa futura")).toBeTruthy();
    expect(screen.getByTestId("task-reader-status-chip")).toBeTruthy();
    expect(screen.getByText("Aberta")).toBeTruthy();
    expect(screen.getByTestId("task-reader-source-day-chip")).toBeTruthy();
    expect(screen.getByText("01-05-2026")).toBeTruthy();
    expect(screen.getByTestId("task-reader-target-day-chip")).toBeTruthy();
    expect(screen.getByText("02-05-2026")).toBeTruthy();
    expect(screen.getByTestId("task-reader-time-chip")).toBeTruthy();
    expect(screen.getByText("18:30")).toBeTruthy();
    expect(screen.getByTestId("task-reader-context-meta")).toBeTruthy();
    expect(screen.getByText("Detalhe da tarefa")).toBeTruthy();

    fireEvent.press(screen.getByTestId("task-reader-edit-button"));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("renderiza tarefa sem horario sem quebrar o chip", () => {
    render(
      <TaskReader
        visible
        task={{ ...task, scheduled_at: null }}
        temporalContext={null}
        onClose={jest.fn()}
        onEdit={jest.fn()}
      />,
    );

    expect(screen.getByTestId("task-reader-time-chip")).toBeTruthy();
    expect(screen.getByText("Sem horario")).toBeTruthy();
  });
});
