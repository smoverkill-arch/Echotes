import { StyleSheet, View } from "react-native";

import { AuthErrorBanner } from "../auth/auth-error-banner";
import type {
  ContinueNoteInput,
  Note,
  NoteEcho,
  NoteEchoCandidate,
  RelatedNote,
} from "../../types/note";
import type { Task } from "../../types/task";
import type { TemporalNavigationContext } from "../../stores/navigation-store";
import type { CalendarMode } from "../../stores/calendar-store";
import type { ReaderState, EditorState } from "../../stores/ui-store";
import type { DayTab, TimelineItemKind, TimelineNode } from "../../types/timeline";
import type { AuthStatus } from "../../types/auth";
import { colors, spacing } from "../../theme/tokens";
import { BreadcrumbBar } from "./breadcrumb-bar";
import { DayHeader } from "./day-header";
import { TaskEditor } from "../forms/task-editor";
import { NoteEditor } from "../forms/note-editor";
import { ContinueNoteEditor } from "../forms/continue-note-editor";
import { NoteEchoPicker } from "../reader/note-echo-picker";
import { NoteReader } from "../reader/note-reader";
import { TaskReader } from "../reader/task-reader";
import { TimelineView } from "../timeline/timeline-view";

interface DayShellProps {
  date: string;
  clockDate: string;
  email: string;
  isSigningOut: boolean;
  authStatus: AuthStatus;
  authErrorMessage: string | null;
  activeTab: DayTab;
  calendarMode: CalendarMode;
  readerState: ReaderState;
  editorState: EditorState;
  timelineNodes: TimelineNode[];
  isTimelineLoading: boolean;
  timelineErrorMessage: string | null;
  temporalNavigationContext: TemporalNavigationContext | null;
  activeNote: Note | null;
  activeTask: Task | null;
  relatedNotes: RelatedNote[];
  activeNoteEchoes: NoteEcho[];
  isEchoPickerVisible: boolean;
  isContinueNoteEditorVisible: boolean;
  isContinuingNote: boolean;
  continueNoteErrorMessage: string | null;
  echoFeedbackMessage: string | null;
  onSignOut: () => Promise<void> | void;
  onDateChange: (date: string) => void;
  onCalendarModeChange: (mode: CalendarMode) => void;
  onTabChange: (tab: DayTab) => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onNavigateToTask: (task: Task) => void;
  onOpenRelatedNote: (relatedNote: RelatedNote) => void;
  onReloadRelatedNote: () => Promise<void> | void;
  onAddEcho?: () => void;
  onCloseEchoPicker: () => void;
  onSelectEchoCandidate: (candidate: NoteEchoCandidate) => Promise<void> | void;
  onRemoveEcho?: (relatedNote: RelatedNote) => void;
  onContinueNote?: () => void;
  onCloseContinueNoteEditor: () => void;
  onSubmitContinueNote: (input: ContinueNoteInput) => Promise<void> | void;
  onReturnToSource: () => void;
  onCloseReader: () => void;
  onCloseEditor: () => void;
  onSaved: () => Promise<void> | void;
}

export function DayShell({
  date,
  clockDate,
  email,
  isSigningOut,
  authStatus,
  authErrorMessage,
  activeTab,
  calendarMode,
  readerState,
  editorState,
  timelineNodes,
  isTimelineLoading,
  timelineErrorMessage,
  temporalNavigationContext,
  activeNote,
  activeTask,
  relatedNotes,
  activeNoteEchoes,
  isEchoPickerVisible,
  isContinueNoteEditorVisible,
  isContinuingNote,
  continueNoteErrorMessage,
  echoFeedbackMessage,
  onSignOut,
  onDateChange,
  onCalendarModeChange,
  onTabChange,
  onCreateNote,
  onCreateTask,
  onOpenReader,
  onOpenEditor,
  onNavigateToTask,
  onOpenRelatedNote,
  onReloadRelatedNote,
  onAddEcho,
  onCloseEchoPicker,
  onSelectEchoCandidate,
  onRemoveEcho,
  onContinueNote,
  onCloseContinueNoteEditor,
  onSubmitContinueNote,
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
        clockDate={clockDate}
        email={email}
        activeTab={activeTab}
        calendarMode={calendarMode}
        isSigningOut={isSigningOut}
        onDateChange={onDateChange}
        onCalendarModeChange={onCalendarModeChange}
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
        echoFeedbackMessage={echoFeedbackMessage}
      />

      <NoteEchoPicker
        visible={isEchoPickerVisible}
        sourceNote={activeNote}
        selectedDay={date}
        existingEchoes={activeNoteEchoes}
        onClose={onCloseEchoPicker}
        onSelectCandidate={onSelectEchoCandidate}
      />

      <ContinueNoteEditor
        visible={isContinueNoteEditorVisible}
        selectedDay={date}
        sourceNote={activeNote}
        isSubmitting={isContinuingNote}
        errorMessage={continueNoteErrorMessage}
        onClose={onCloseContinueNoteEditor}
        onSubmit={onSubmitContinueNote}
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
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: colors.background,
  },
});
