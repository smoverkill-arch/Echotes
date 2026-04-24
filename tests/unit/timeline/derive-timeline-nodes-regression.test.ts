import { deriveTimelineNodes } from "../../../src/features/timeline/utils/derive-timeline-nodes";
import type { Note } from "../../../src/types/note";
import type { Task } from "../../../src/types/task";

const selectedDay = "2026-04-18";
const targetDay = "2026-04-20";
const userId = "1b373d49-cf7f-4f40-b4a0-23327214f165";

const buildNote = (overrides: Partial<Note> = {}): Note => ({
  id: "10000000-0000-4000-8000-000000000001",
  user_id: userId,
  day: selectedDay,
  title: "Nota do dia",
  content: "Conteudo da nota",
  brief: null,
  tag_id: null,
  color: null,
  is_color_overridden: false,
  created_at: `${selectedDay}T10:00:00+00:00`,
  updated_at: `${selectedDay}T10:00:00+00:00`,
  ...overrides,
});

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  id: "20000000-0000-4000-8000-000000000001",
  user_id: userId,
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

describe("deriveTimelineNodes regressions", () => {
  it("mantem TimelineNode sem side e ordena por sortAt, prioridade e id", () => {
    const nodes = deriveTimelineNodes({
      selectedDay,
      notes: [buildNote()],
      tasks: [
        buildTask({
          id: "20000000-0000-4000-8000-000000000003",
          scheduled_at: `${selectedDay}T10:00:00+00:00`,
        }),
        buildTask({
          id: "20000000-0000-4000-8000-000000000001",
        }),
        buildTask({
          id: "20000000-0000-4000-8000-000000000002",
          source_day: selectedDay,
          target_day: targetDay,
        }),
      ],
    });

    expect(nodes.map((node) => `${node.type}:${node.itemId}`)).toEqual([
      "note:10000000-0000-4000-8000-000000000001",
      "task_untimed:20000000-0000-4000-8000-000000000001",
      "task_creation_marker:20000000-0000-4000-8000-000000000003",
      "task_timed:20000000-0000-4000-8000-000000000003",
      "task_ghost:20000000-0000-4000-8000-000000000002",
    ]);

    for (const node of nodes) {
      expect(node).not.toHaveProperty("side");
    }
  });

  it("mantem tarefa same-day com horario como marker de criacao e item agendado", () => {
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
    expect(nodes[0]).toMatchObject({
      sortAt: `${selectedDay}T10:00:00`,
      scheduledAt: `${selectedDay}T18:30:00+00:00`,
    });
    expect(nodes[1]).toMatchObject({
      sortAt: `${selectedDay}T18:30:00`,
      scheduledAt: `${selectedDay}T18:30:00+00:00`,
    });
  });

  it("mantem tarefa projetada apenas como ghost na origem", () => {
    const nodes = deriveTimelineNodes({
      selectedDay,
      notes: [],
      tasks: [
        buildTask({
          source_day: selectedDay,
          target_day: targetDay,
          scheduled_at: `${targetDay}T18:30:00+00:00`,
        }),
      ],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "task_ghost",
      sortAt: `${selectedDay}T10:00:00`,
      scheduledAt: null,
    });
  });

  it("mantem tarefa projetada como item real sem horario ou com horario no destino", () => {
    const untimedTask = buildTask({
      id: "20000000-0000-4000-8000-000000000004",
      source_day: selectedDay,
      target_day: targetDay,
    });
    const timedTask = buildTask({
      id: "20000000-0000-4000-8000-000000000005",
      source_day: selectedDay,
      target_day: targetDay,
      scheduled_at: `${targetDay}T18:30:00+00:00`,
    });

    const nodes = deriveTimelineNodes({
      selectedDay: targetDay,
      notes: [],
      tasks: [timedTask, untimedTask],
    });

    expect(nodes.map((node) => `${node.type}:${node.itemId}`)).toEqual([
      "task_untimed:20000000-0000-4000-8000-000000000004",
      "task_timed:20000000-0000-4000-8000-000000000005",
    ]);
    expect(nodes[0]).toMatchObject({
      sortAt: `${targetDay}T10:00:00`,
      scheduledAt: null,
    });
    expect(nodes[1]).toMatchObject({
      sortAt: `${targetDay}T18:30:00`,
      scheduledAt: `${targetDay}T18:30:00+00:00`,
    });
  });
});
