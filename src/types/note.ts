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

export type RelatedNoteAvailability =
  | "available"
  | "transient_unavailable"
  | "stale_detail";

export interface RelatedNote {
  id: string;
  day: string | null;
  title: string | null;
  brief: string | null;
  created_at: string | null;
  kind: NoteEchoKind;
  echoId: string;
  availability: RelatedNoteAvailability;
}

export interface NoteEchoCandidate {
  id: string;
  day: string;
  title: string;
  brief: string | null;
  created_at: string;
  isAlreadyConnected: boolean;
}

export interface NoteEchoCandidatePage {
  items: NoteEchoCandidate[];
  nextCursor: NoteEchoCandidateCursor | null;
}

export interface NoteEchoCandidateCursor {
  isSelectedDayGroup: boolean;
  day: string;
  created_at: string;
  id: string;
}

export interface DirectEchoCount {
  noteId: string;
  directCount: number;
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
  newNoteDay: string;
  title: string;
  generatedBrief: string;
  content: string;
}

export interface CreateEchoInput {
  from_note_id: string;
  to_note_id: string;
  kind: NoteEchoKind;
  context_note_id?: string | null;
  context_day?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface DeleteEchoInput {
  echoId?: string;
  noteIdA: string;
  noteIdB: string;
}

export type PendingReaderOpenOrigin =
  | "connected_note_tap"
  | "continue_note_created";

export interface PendingReaderOpen {
  noteId: string;
  noteDay: string;
  requestId: string;
  sessionUserId: string;
  actionOrigin: PendingReaderOpenOrigin;
}

export interface ContinueCommittedPendingOpen {
  newNoteId: string;
  newNoteDay: string;
  sourceNoteId: string;
  contextDay: string;
  requestId: string;
  sessionUserId: string;
}
