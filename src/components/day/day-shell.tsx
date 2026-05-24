import { useCallback, useEffect, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
import { DayBottomTabs } from "./day-bottom-tabs";
import { TaskEditor } from "../forms/task-editor";
import { NoteEditor } from "../forms/note-editor";
import { ContinueNoteEditor } from "../forms/continue-note-editor";
import { NoteEchoPicker } from "../reader/note-echo-picker";
import { NoteReader } from "../reader/note-reader";
import { TaskReader } from "../reader/task-reader";
import {
  TimelinePageView,
  taskPageFeedback,
  notePageFeedback,
} from "../timeline/timeline-page-view";

export interface DayShellSavedOptions {
  openReader?: {
    kind: TimelineItemKind;
    id: string;
  };
  echoFeedbackMessage?: string | null;
}

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
  taskNodes: TimelineNode[];
  noteNodes: TimelineNode[];
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
  onSaved: (options?: DayShellSavedOptions) => Promise<void> | void;
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
  taskNodes,
  noteNodes,
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
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const chromeVisibility = useSharedValue(1);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [chromeHeight, setChromeHeight] = useState(0);

  // Sync pager position when tab changes via tap (not swipe)
  useEffect(() => {
    pagerRef.current?.setPage(activeTab === "notes" ? 1 : 0);
  }, [activeTab]);

  const showChrome = useCallback(() => {
    setIsChromeVisible(true);
    chromeVisibility.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [chromeVisibility]);

  const hideChrome = useCallback(() => {
    setIsChromeVisible(false);
    chromeVisibility.value = withTiming(0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [chromeVisibility]);

  const handleChromeLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setChromeHeight((current) =>
      Math.abs(current - nextHeight) > 1 ? nextHeight : current,
    );
  }, []);

  const chromeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: chromeVisibility.value,
    transform: [
      { translateY: interpolate(chromeVisibility.value, [0, 1], [-32, 0]) },
    ],
  }));

  const contentTopInset = chromeHeight + spacing.md;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <AuthErrorBanner status={authStatus} message={authErrorMessage} />

      <Animated.View
        pointerEvents={isChromeVisible ? "auto" : "none"}
        style={[
          styles.chromeOverlay,
          chromeAnimatedStyle,
          { top: insets.top },
        ]}
        onLayout={handleChromeLayout}
      >
        <DayHeader
          date={date}
          clockDate={clockDate}
          email={email}
          calendarMode={calendarMode}
          isSigningOut={isSigningOut}
          onDateChange={onDateChange}
          onCalendarModeChange={onCalendarModeChange}
          onSignOut={onSignOut}
        />

        {temporalNavigationContext ? (
          <BreadcrumbBar
            sourceDate={temporalNavigationContext.sourceDate}
            destinationDate={temporalNavigationContext.destinationDate}
            onReturn={onReturnToSource}
          />
        ) : null}
      </Animated.View>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={activeTab === "notes" ? 1 : 0}
        onPageSelected={(e) => {
          const page = e.nativeEvent.position;
          onTabChange(page === 0 ? "tasks" : "notes");
        }}
      >
        <View key="tasks" style={styles.page}>
          <TimelinePageView
            axisPosition="left"
            nodes={taskNodes}
            isLoading={isTimelineLoading}
            errorMessage={timelineErrorMessage}
            feedback={taskPageFeedback}
            onOpenReader={onOpenReader}
            onOpenEditor={onOpenEditor}
            onNavigateToTask={onNavigateToTask}
            onScrollInteractionStart={hideChrome}
            onScrollInteractionEnd={showChrome}
            contentTopInset={contentTopInset}
            testID="task-timeline-page"
          />
        </View>

        <View key="notes" style={styles.page}>
          <TimelinePageView
            axisPosition="right"
            nodes={noteNodes}
            isLoading={isTimelineLoading}
            errorMessage={timelineErrorMessage}
            feedback={notePageFeedback}
            onOpenReader={onOpenReader}
            onOpenEditor={onOpenEditor}
            onNavigateToTask={onNavigateToTask}
            onScrollInteractionStart={hideChrome}
            onScrollInteractionEnd={showChrome}
            contentTopInset={contentTopInset}
            testID="note-timeline-page"
          />
        </View>
      </PagerView>

      <View style={styles.tabsWrapper}>
        <DayBottomTabs
          activeTab={activeTab}
          isDisabled={isTimelineLoading}
          onTabChange={onTabChange}
          onCreateNote={onCreateNote}
          onCreateTask={onCreateTask}
        />
      </View>

      <NoteReader
        visible={readerState.isOpen && readerState.kind === "note"}
        note={activeNote}
        relatedNotes={relatedNotes}
        onClose={onCloseReader}
        onEdit={() => {
          if (activeNote) onOpenEditor("note", activeNote.id);
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
          if (activeTask) onOpenEditor("task", activeTask.id);
        }}
      />

      <NoteEditor
        visible={editorState.isOpen && editorState.kind === "note"}
        mode={editorState.mode === "edit" ? "edit" : "create"}
        selectedDay={date}
        note={editorState.mode === "edit" ? activeNote : null}
        onClose={onCloseEditor}
        onSaved={async (savedNote, options) => {
          await onSaved({
            openReader: options?.openReader
              ? { kind: "note", id: savedNote.id }
              : undefined,
            echoFeedbackMessage: options?.feedbackMessage ?? null,
          });
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
    backgroundColor: colors.background,
  },
  chromeOverlay: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 3,
    gap: spacing.md,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tabsWrapper: {
    paddingBottom: spacing.xs,
  },
});
