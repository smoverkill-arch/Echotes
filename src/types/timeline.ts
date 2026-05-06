import type { DirectEchoCount, Note, NoteEcho } from "./note";
import type { Task } from "./task";

export const TIMELINE_NODE_TYPES = [
  "note",
  "task_untimed",
  "task_creation_marker",
  "task_timed",
  "task_ghost",
] as const;

export type TimelineNodeType = (typeof TIMELINE_NODE_TYPES)[number];
export type TimelineItemKind = "note" | "task";
export type DayTab = "timeline" | "tasks" | "notes";

export interface TimelineNode {
  id: string;
  type: TimelineNodeType;
  itemKind: TimelineItemKind;
  itemId: string;
  sortAt: string;
  createdAt: string;
  scheduledAt: string | null;
  data: Note | Task;
  directEchoCount?: number;
}

export interface DayTimelineInput {
  selectedDay: string;
  tasks: Task[];
  notes: Note[];
  echoes?: NoteEcho[];
  directEchoCounts?: DirectEchoCount[];
}

export interface DayEntries {
  tasks: Task[];
  notes: Note[];
  echoes: NoteEcho[];
}
