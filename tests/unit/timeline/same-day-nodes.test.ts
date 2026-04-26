import { deriveTimelineNodes } from "../../../src/features/timeline/utils/derive-timeline-nodes";
import type { Note } from "../../../src/types/note";
import type { Task } from "../../../src/types/task";

const selectedDay = "2026-04-18";

const buildNote = (overrides: Partial<Note> = {}): Note => ({
  id: "566bfd0e-44df-4cf5-b0df-5c73bf9066db",
  user_id: "1b373d49-cf7f-4f40-b4a0-23327214f165",
  day: selectedDay,
  title: "Nota do dia",
  content: "Conteudo da nota",
  brief: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  created_at: `${selectedDay}T09:15:00+00:00`,
  updated_at: `${selectedDay}T09:15:00+00:00`,
  ...overrides,
});

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9",
  user_id: "1b373d49-cf7f-4f40-b4a0-23327214f165",
  title: "Tarefa do dia",
  content: "Detalhes",
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: selectedDay,
  target_day: selectedDay,
  created_at: `${selectedDay}T10:00:00+00:00`,
  scheduled_at: null,
  status: "open",
  completed_at: null,
  updated_at: `${selectedDay}T10:00:00+00:00`,
  ...overrides,
});

describe("same-day timeline nodes", () => {
  it("transforma uma nota do dia em node do tipo note", () => {
    const nodes = deriveTimelineNodes({
      selectedDay,
      notes: [buildNote()],
      tasks: [],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "note",
      itemKind: "note",
      itemId: "566bfd0e-44df-4cf5-b0df-5c73bf9066db",
    });
  });

  it("transforma uma tarefa sem horario em node task_untimed", () => {
    const nodes = deriveTimelineNodes({
      selectedDay,
      notes: [],
      tasks: [buildTask()],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "task_untimed",
      itemKind: "task",
      itemId: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9",
    });
  });

  it("gera marker de criacao e item real para tarefa com horario no mesmo dia", () => {
    const nodes = deriveTimelineNodes({
      selectedDay,
      notes: [],
      tasks: [
        buildTask({
          scheduled_at: `${selectedDay}T18:30:00+00:00`,
        }),
      ],
    });

    expect(nodes).toHaveLength(2);
    expect(nodes.map((node) => node.type)).toEqual([
      "task_creation_marker",
      "task_timed",
    ]);
  });

  it("ordena a timeline por created_at e scheduled_at locais ao dia", () => {
    const nodes = deriveTimelineNodes({
      selectedDay,
      notes: [
        buildNote({
          id: "a89426ec-a813-4ca2-8fdd-c0fd6cb70b36",
          created_at: `${selectedDay}T08:00:00Z`,
        }),
      ],
      tasks: [
        buildTask({
          id: "46845487-b8dc-4fc8-910d-c3213b747154",
          created_at: `${selectedDay}T09:00:00+00:00`,
          scheduled_at: `${selectedDay}T19:00:00+00:00`,
        }),
        buildTask({
          id: "2db8bb3c-f294-468b-b0fe-53f735f15dad",
          created_at: `${selectedDay}T11:00:00Z`,
          scheduled_at: null,
        }),
      ],
    });

    expect(nodes.map((node) => `${node.type}:${node.itemId}`)).toEqual([
      "note:a89426ec-a813-4ca2-8fdd-c0fd6cb70b36",
      "task_creation_marker:46845487-b8dc-4fc8-910d-c3213b747154",
      "task_untimed:2db8bb3c-f294-468b-b0fe-53f735f15dad",
      "task_timed:46845487-b8dc-4fc8-910d-c3213b747154",
    ]);
  });
});
