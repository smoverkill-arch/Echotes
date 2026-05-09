import { StyleSheet, View } from "react-native";

import { AuthErrorBanner } from "../auth/auth-error-banner";
import type { Note, RelatedNote } from "../../types/note";
import type { Task } from "../../types/task";
import type { TemporalNavigationContext } from "../../stores/navigation-store";
import type { ReaderState, EditorState } from "../../stores/ui-store";
import type { DayTab, TimelineItemKind, TimelineNode } from "../../types/timeline";
import type { AuthStatus } from "../../types/auth";
import { BreadcrumbBar } from "./breadcrumb-bar";
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
  authStatus: AuthStatus;
  authErrorMessage: string | null;
  activeTab: DayTab;
  readerState: ReaderState;
  editorState: EditorState;
  timelineNodes: TimelineNode[];
  isTimelineLoading: boolean;
  timelineErrorMessage: string | null;
  temporalNavigationContext: TemporalNavigationContext | null;
  activeNote: Note | null;
  activeTask: Task | null;
  relatedNotes: RelatedNote[];
  onSignOut: () => Promise<void> | void;
  onTabChange: (tab: DayTab) => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onNavigateToTask: (task: Task) => void;
  onOpenRelatedNote: (relatedNote: RelatedNote) => void;
  onReloadRelatedNote: () => Promise<void> | void;
  onAddEcho?: () => void;
  onRemoveEcho?: (relatedNote: RelatedNote) => void;
  onContinueNote?: () => void;
  onReturnToSource: () => void;
  onCloseReader: () => void;
  onCloseEditor: () => void;
  onSaved: () => Promise<void> | void;
}

export function DayShell({
  date,
  email,
  isSigningOut,
  authStatus,
  authErrorMessage,
  activeTab,
  readerState,
  editorState,
  timelineNodes,
  isTimelineLoading,
  timelineErrorMessage,
  temporalNavigationContext,
  activeNote,
  activeTask,
  relatedNotes,
  onSignOut,
  onTabChange,
  onCreateNote,
  onCreateTask,
  onOpenReader,
  onOpenEditor,
  onNavigateToTask,
  onOpenRelatedNote,
  onReloadRelatedNote,
  onAddEcho,
  onRemoveEcho,
  onContinueNote,
  onReturnToSource,
  onCloseReader,
  onCloseEditor,
  onSaved,
}: DayShellProps) {
  return (
    <View style={styles.container}>
      <AuthErrorBanner status={authStatus} message={authErrorMessage} />

      <DayHeader
        date={date}
        email={email}
        activeTab={activeTab}
        isSigningOut={isSigningOut}
        onTabChange={onTabChange}
        onSignOut={onSignOut}
      />

      {temporalNavigationContext ? (
        <BreadcrumbBar
          sourceDate={temporalNavigationContext.sourceDate}
          destinationDate={temporalNavigationContext.destinationDate}
          onReturn={onReturnToSource}
        />
      ) : null}

      <TimelineView
        activeTab={activeTab}
        nodes={timelineNodes}
        isLoading={isTimelineLoading}
        errorMessage={timelineErrorMessage}
        onCreateNote={onCreateNote}
        onCreateTask={onCreateTask}
        onOpenReader={onOpenReader}
        onOpenEditor={onOpenEditor}
        onNavigateToTask={onNavigateToTask}
      />

      <NoteReader
        visible={readerState.isOpen && readerState.kind === "note"}
        note={activeNote}
        relatedNotes={relatedNotes}
        onClose={onCloseReader}
        onEdit={() => {
          if (activeNote) {
            onOpenEditor("note", activeNote.id);
          }
        }}
        onOpenRelatedNote={onOpenRelatedNote}
        onReloadRelatedNote={onReloadRelatedNote}
        onAddEcho={onAddEcho}
        onRemoveEcho={onRemoveEcho}
        onContinueNote={onContinueNote}
      />

      <TaskReader
        visible={readerState.isOpen && readerState.kind === "task"}
        task={activeTask}
        temporalContext={
          temporalNavigationContext && activeTask?.id === temporalNavigationContext.sourceTaskId
            ? temporalNavigationContext
            : null
        }
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
        temporalContext={
          temporalNavigationContext && activeTask?.id === temporalNavigationContext.sourceTaskId
            ? temporalNavigationContext
            : null
        }
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
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#f7f8fb",
  },
});
