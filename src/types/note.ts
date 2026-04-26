export const NOTE_ECHO_KIND_VALUES = ["manual_link", "continue_note"] as const;

export type NoteEchoKind = (typeof NOTE_ECHO_KIND_VALUES)[number];

export interface Note {
  id: string;
  user_id: string;
  day: string;
  title: string;
  content: string | null;
  brief: string | null;
  tag_id: string | null;
  color: string | null;
  is_color_overridden: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteEcho {
  id: string;
  from_note_id: string;
  to_note_id: string;
  created_by_user_id: string;
  created_at: string;
  context_note_id: string | null;
  context_day: string | null;
  kind: NoteEchoKind;
  metadata: Record<string, unknown> | null;
}

export interface NoteFormValues {
  title: string;
  content: string;
  brief: string;
  tag_id: string | null;
  color: string | null;
  is_color_overridden: boolean;
  day: string;
}

export interface ContinueNoteInput {
  sourceNoteId: string;
  targetDay: string;
  generatedBrief: string;
  title?: string;
}

export interface CreateEchoInput {
  from_note_id: string;
  to_note_id: string;
  kind: NoteEchoKind;
  context_note_id?: string | null;
  context_day?: string | null;
  metadata?: Record<string, unknown> | null;
}
