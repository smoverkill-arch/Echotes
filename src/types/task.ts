export const TASK_STATUS_VALUES = ["open", "done", "cancelled"] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  tag_id: string | null;
  color: string | null;
  is_color_overridden: boolean;
  source_day: string;
  target_day: string;
  created_at: string;
  scheduled_at: string | null;
  status: TaskStatus;
  completed_at: string | null;
  updated_at: string;
}

export interface TaskFormValues {
  title: string;
  content: string;
  tag_id: string | null;
  color: string | null;
  is_color_overridden: boolean;
  source_day: string;
  target_day: string;
  scheduled_time: string | null;
  status: TaskStatus;
}
