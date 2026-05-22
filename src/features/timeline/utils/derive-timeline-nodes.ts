import type { DayTimelineInput, TimelineNode, TimelineNodeType } from "../../../types/timeline";

import { buildInDaySortAt } from "../../../utils/date";

const TIMELINE_NODE_PRIORITY: Record<TimelineNodeType, number> = {
  note: 0,
  task_untimed: 1,
  task_creation_marker: 2,
  task_timed: 3,
  task_ghost: 4,
};

export const deriveTimelineNodes = ({
  selectedDay,
  tasks,
  notes,
  directEchoCounts = [],
}: DayTimelineInput): TimelineNode[] => {
  const nodes: TimelineNode[] = [];
  const directEchoCountByNoteId = new Map(
    directEchoCounts.map((count) => [count.noteId, count.directCount]),
  );

  for (const note of notes) {
    if (note.day !== selectedDay) {
      continue;
    }

    nodes.push({
      id: `${note.id}:note`,
      type: "note",
      itemKind: "note",
      itemId: note.id,
      sortAt: buildInDaySortAt(selectedDay, note.created_at),
      createdAt: note.created_at,
      scheduledAt: null,
      data: note,
      directEchoCount: directEchoCountByNoteId.get(note.id) ?? 0,
    });
  }

  for (const task of tasks) {
    const isSourceDay = task.source_day === selectedDay;
    const isTargetDay = task.target_day === selectedDay;
    const isTimed = Boolean(task.scheduled_at);
    const isProjected = task.source_day !== task.target_day;

    if (isTargetDay && !isTimed) {
      nodes.push({
        id: `${task.id}:task_untimed`,
        type: "task_untimed",
        itemKind: "task",
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.created_at),
        createdAt: task.created_at,
        scheduledAt: null,
        data: task,
      });
    }

    if (isSourceDay && isTargetDay && isTimed) {
      nodes.push({
        id: `${task.id}:task_creation_marker`,
        type: "task_creation_marker",
        itemKind: "task",
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.created_at),
        createdAt: task.created_at,
        scheduledAt: task.scheduled_at,
        data: task,
      });
    }

    if (isTargetDay && isTimed) {
      nodes.push({
        id: `${task.id}:task_timed`,
        type: "task_timed",
        itemKind: "task",
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.scheduled_at as string),
        createdAt: task.created_at,
        scheduledAt: task.scheduled_at,
        data: task,
      });
    }

    if (isSourceDay && isProjected) {
      nodes.push({
        id: `${task.id}:task_ghost`,
        type: "task_ghost",
        itemKind: "task",
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.created_at),
        createdAt: task.created_at,
        scheduledAt: null,
        data: task,
      });
    }
  }

  return nodes.sort((left, right) => {
    const sortAtDiff = left.sortAt.localeCompare(right.sortAt);

    if (sortAtDiff !== 0) {
      return sortAtDiff;
    }

    const priorityDiff =
      TIMELINE_NODE_PRIORITY[left.type] - TIMELINE_NODE_PRIORITY[right.type];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return left.id.localeCompare(right.id);
  });
};
