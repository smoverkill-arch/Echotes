import { deriveTimelineNodes } from "../../../src/features/timeline/utils/derive-timeline-nodes";
import type { Task } from "../../../src/types/task";
import { buildInDaySortAt } from "../../../src/utils/date";

const sourceDay = "2026-04-18";
const targetDay = "2026-04-20";

const buildProjectedTask = (overrides: Partial<Task> = {}): Task => ({
  id: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9",
  user_id: "1b373d49-cf7f-4f40-b4a0-23327214f165",
  title: "Tarefa projetada",
  content: "Detalhes",
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: sourceDay,
  target_day: targetDay,
  created_at: `${sourceDay}T10:00:00+00:00`,
  scheduled_at: null,
  status: "open",
  completed_at: null,
  updated_at: `${sourceDay}T10:00:00+00:00`,
  ...overrides,
});

describe("projected task timeline nodes", () => {
  // @req FR-015
  // @req FR-016
  it("gera apenas task_ghost no dia de origem quando source_day e target_day divergem", () => {
    const nodes = deriveTimelineNodes({
      selectedDay: sourceDay,
      notes: [],
      tasks: [buildProjectedTask()],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      id: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9:task_ghost",
      type: "task_ghost",
      itemKind: "task",
      itemId: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9",
      sortAt: buildInDaySortAt(sourceDay, `${sourceDay}T10:00:00+00:00`),
    });
  });

  // @req FR-017
  it("mantem a tarefa projetada sem horario como item real no dia de destino", () => {
    const nodes = deriveTimelineNodes({
      selectedDay: targetDay,
      notes: [],
      tasks: [buildProjectedTask()],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      id: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9:task_untimed",
      type: "task_untimed",
      itemKind: "task",
      itemId: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9",
      sortAt: buildInDaySortAt(targetDay, `${sourceDay}T10:00:00+00:00`),
    });
  });

  // @req FR-017
  it("posiciona a tarefa futura com horario como item real em task_timed no dia de destino", () => {
    const nodes = deriveTimelineNodes({
      selectedDay: targetDay,
      notes: [],
      tasks: [
        buildProjectedTask({
          scheduled_at: `${targetDay}T18:30:00+00:00`,
        }),
      ],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      id: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9:task_timed",
      type: "task_timed",
      itemKind: "task",
      itemId: "6f366e86-4d1e-45c1-ab27-57d7f0188ea9",
      sortAt: buildInDaySortAt(targetDay, `${targetDay}T18:30:00+00:00`),
      scheduledAt: `${targetDay}T18:30:00+00:00`,
    });
  });
});
