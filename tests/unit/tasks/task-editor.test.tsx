import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { TaskEditor } from "../../../src/components/forms/task-editor";
import { createTask } from "../../../src/features/tasks/api/create-task";
import { updateTask } from "../../../src/features/tasks/api/update-task";
import type { Task } from "../../../src/types/task";
import { installMockSystemDate } from "../../support/mock-system-date";

jest.mock("../../../src/features/tasks/api/create-task", () => ({
  createTask: jest.fn(),
}));

jest.mock("../../../src/features/tasks/api/update-task", () => ({
  updateTask: jest.fn(),
}));

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id ?? "20000000-0000-4000-8000-000000000001",
  user_id: overrides.user_id ?? "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
  title: overrides.title ?? "Tarefa existente",
  content: overrides.content ?? "Detalhe antigo",
  tag_id: overrides.tag_id ?? null,
  color: overrides.color ?? null,
  is_color_overridden: overrides.is_color_overridden ?? false,
  source_day: overrides.source_day ?? "2026-05-01",
  target_day: overrides.target_day ?? "2026-05-02",
  created_at: overrides.created_at ?? "2026-05-01T09:00:00+00:00",
  scheduled_at: overrides.scheduled_at ?? "2026-05-02T18:30:00+00:00",
  status: overrides.status ?? "open",
  completed_at: overrides.completed_at ?? null,
  updated_at: overrides.updated_at ?? "2026-05-01T09:00:00+00:00",
});

const mockedCreateTask = jest.mocked(createTask);
const mockedUpdateTask = jest.mocked(updateTask);

const renderEditor = (overrides: Partial<Parameters<typeof TaskEditor>[0]> = {}) => {
  const props = {
    visible: true,
    mode: "create" as const,
    selectedDay: "2026-05-01",
    task: null,
    temporalContext: null,
    onClose: jest.fn(),
    onSaved: jest.fn(),
    ...overrides,
  };

  render(<TaskEditor {...props} />);

  return props;
};

describe("TaskEditor", () => {
  let mockSystemDate: ReturnType<typeof installMockSystemDate> | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSystemDate = installMockSystemDate("2026-05-03T12:00:00Z");
  });

  afterEach(() => {
    mockSystemDate?.restore();
    mockSystemDate = null;
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("atualiza o destino com Dia anterior, Dia seguinte e Hoje", () => {
    renderEditor();

    expect(screen.getByTestId("task-editor-target-day-input").props.value).toBe(
      "01-05-2026",
    );

    fireEvent.press(screen.getByTestId("task-editor-next-day-button"));
    expect(screen.getByTestId("task-editor-target-day-input").props.value).toBe(
      "02-05-2026",
    );

    fireEvent.press(screen.getByTestId("task-editor-previous-day-button"));
    expect(screen.getByTestId("task-editor-target-day-input").props.value).toBe(
      "01-05-2026",
    );

    fireEvent.press(screen.getByTestId("task-editor-today-button"));
    expect(screen.getByTestId("task-editor-target-day-input").props.value).toBe(
      "03-05-2026",
    );
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("preserva payload de createTask no submit valido", async () => {
    const createdTask = buildTask({
      id: "20000000-0000-4000-8000-000000000099",
      title: "Nova tarefa",
      target_day: "2026-05-02",
    });
    mockedCreateTask.mockResolvedValue({
      ok: true,
      task: createdTask,
      errorMessage: null,
    });
    const { onSaved } = renderEditor();

    fireEvent.changeText(screen.getByTestId("task-editor-title-input"), "Nova tarefa");
    fireEvent.changeText(
      screen.getByTestId("task-editor-content-input"),
      "Detalhe novo",
    );
    fireEvent.press(screen.getByTestId("task-editor-next-day-button"));
    fireEvent.changeText(screen.getByTestId("task-editor-time-input"), "18:30");
    fireEvent.press(screen.getByTestId("task-editor-submit-button"));

    await waitFor(() => {
      expect(mockedCreateTask).toHaveBeenCalledWith({
        title: "Nova tarefa",
        content: "Detalhe novo",
        source_day: "2026-05-01",
        target_day: "2026-05-02",
        scheduled_time: "18:30",
        status: "open",
        tag_id: null,
        color: null,
        is_color_overridden: false,
      });
      expect(onSaved).toHaveBeenCalledWith(createdTask);
    });
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("preserva payload de updateTask no modo edicao", async () => {
    const task = buildTask();
    const updatedTask = { ...task, title: "Tarefa revisada" };
    mockedUpdateTask.mockResolvedValue({
      ok: true,
      task: updatedTask,
      errorMessage: null,
    });
    const { onSaved } = renderEditor({
      mode: "edit",
      selectedDay: "2026-05-01",
      task,
    });

    expect(screen.getByText("Editar tarefa")).toBeTruthy();
    expect(screen.getByText("01-05-2026")).toBeTruthy();

    fireEvent.changeText(
      screen.getByTestId("task-editor-title-input"),
      "Tarefa revisada",
    );
    fireEvent.press(screen.getByTestId("task-editor-submit-button"));

    await waitFor(() => {
      expect(mockedUpdateTask).toHaveBeenCalledWith(task, {
        title: "Tarefa revisada",
        content: "Detalhe antigo",
        source_day: task.source_day,
        target_day: task.target_day,
        scheduled_time: "18:30",
        status: task.status,
        tag_id: task.tag_id,
        color: task.color,
        is_color_overridden: task.is_color_overridden,
      });
      expect(onSaved).toHaveBeenCalledWith(updatedTask);
    });
  });

  // @req 003-mobile-day-shell-ux:FR-011
  // @req 003-mobile-day-shell-ux:FR-012
  it("mostra erro de data invalida como bloco de feedback", async () => {
    const { onSaved } = renderEditor();

    fireEvent.changeText(screen.getByTestId("task-editor-target-day-input"), "31-02-2026");
    fireEvent.press(screen.getByTestId("task-editor-submit-button"));

    expect(await screen.findByTestId("task-editor-error")).toBeTruthy();
    expect(
      screen.getByText(/Data invalida\. Use o formato (DD-MM-AAAA|YYYY-MM-DD)\./),
    ).toBeTruthy();
    expect(mockedCreateTask).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
