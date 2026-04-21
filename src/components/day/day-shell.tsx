import { StyleSheet, View } from "react-native";

import type { Note } from "../../types/note";
import type { Task } from "../../types/task";
import type { ReaderState, EditorState } from "../../stores/ui-store";
import type { DayTab, TimelineItemKind, TimelineNode } from "../../types/timeline";
import { DayHeader } from "./day-header";
import { TaskEditor } from "../forms/task-editor";
import { NoteEditor } from "../forms/note-editor";
import { NoteReader } from "../reader/note-reader";
import { TaskReader } from "../reader/task-reader";
import { TimelineView } from "../timeline/timeline-view";

interface DayShellProps {
  date: string;
  email: string;
  isSigningOut: boolean;
  activeTab: DayTab;
  readerState: ReaderState;
  editorState: EditorState;
  timelineNodes: TimelineNode[];
  isTimelineLoading: boolean;
  timelineErrorMessage: string | null;
  activeNote: Note | null;
  activeTask: Task | null;
  onSignOut: () => Promise<void> | void;
  onTabChange: (tab: DayTab) => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onCloseReader: () => void;
  onCloseEditor: () => void;
  onSaved: () => Promise<void> | void;
}

export function DayShell({
  date,
  email,
  isSigningOut,
  activeTab,
  readerState,
  editorState,
  timelineNodes,
  isTimelineLoading,
  timelineErrorMessage,
  activeNote,
  activeTask,
  onSignOut,
  onTabChange,
  onCreateNote,
  onCreateTask,
  onOpenReader,
  onOpenEditor,
  onCloseReader,
  onCloseEditor,
  onSaved,
}: DayShellProps) {
  return (
    <View style={styles.container}>
      <DayHeader
        date={date}
        email={email}
        activeTab={activeTab}
        isSigningOut={isSigningOut}
        onTabChange={onTabChange}
        onSignOut={onSignOut}
      />

      <TimelineView
        nodes={timelineNodes}
        isLoading={isTimelineLoading}
        errorMessage={timelineErrorMessage}
        onCreateNote={onCreateNote}
        onCreateTask={onCreateTask}
        onOpenReader={onOpenReader}
        onOpenEditor={onOpenEditor}
      />

      <NoteReader
        visible={readerState.isOpen && readerState.kind === "note"}
        note={activeNote}
        onClose={onCloseReader}
        onEdit={() => {
          if (activeNote) {
            onOpenEditor("note", activeNote.id);
          }
        }}
      />

      <TaskReader
        visible={readerState.isOpen && readerState.kind === "task"}
        task={activeTask}
        onClose={onCloseReader}
        onEdit={() => {
          if (activeTask) {
            onOpenEditor("task", activeTask.id);
          }
        }}
      />

      <NoteEditor
        visible={editorState.isOpen && editorState.kind === "note"}
        mode={editorState.mode === "edit" ? "edit" : "create"}
        selectedDay={date}
        note={editorState.mode === "edit" ? activeNote : null}
        onClose={onCloseEditor}
        onSaved={async () => {
          await onSaved();
        }}
      />

      <TaskEditor
        visible={editorState.isOpen && editorState.kind === "task"}
        mode={editorState.mode === "edit" ? "edit" : "create"}
        selectedDay={date}
        task={editorState.mode === "edit" ? activeTask : null}
        onClose={onCloseEditor}
        onSaved={async () => {
          await onSaved();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#f7f8fb",
  },
});
