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
import type { Note } from "../../types/note";
import type { Task } from "../../types/task";
import type { TemporalNavigationContext } from "../../stores/navigation-store";
import type { CalendarMode } from "../../stores/calendar-store";
import type { EditorState } from "../../stores/ui-store";
import type { DayTab, TimelineItemKind, TimelineNode } from "../../types/timeline";
import type { AuthStatus } from "../../types/auth";
import { colors, spacing } from "../../theme/tokens";
import { BreadcrumbBar } from "./breadcrumb-bar";
import { DayHeader } from "./day-header";
import { DayBottomTabs } from "./day-bottom-tabs";
import { SettingsSheet } from "./settings-sheet";
import { useAppearancePalette } from "../../stores/appearance-store";
import { TaskEditor } from "../forms/task-editor";
import { NoteEditor } from "../forms/note-editor";
import {
  TimelinePageView,
  taskPageFeedback,
  notePageFeedback,
} from "../timeline/timeline-page-view";

interface DayShellProps {
  date: string;
  clockDate: string;
  email: string;
  isSigningOut: boolean;
  authStatus: AuthStatus;
  authErrorMessage: string | null;
  activeTab: DayTab;
  calendarMode: CalendarMode;
  editorState: EditorState;
  taskNodes: TimelineNode[];
  noteNodes: TimelineNode[];
  isTimelineLoading: boolean;
  timelineErrorMessage: string | null;
  temporalNavigationContext: TemporalNavigationContext | null;
  activeNote: Note | null;
  activeTask: Task | null;
  onSignOut: () => Promise<void> | void;
  onDateChange: (date: string) => void;
  onCalendarModeChange: (mode: CalendarMode) => void;
  onTabChange: (tab: DayTab) => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onOpenReader: (kind: TimelineItemKind, id: string) => void;
  onOpenEditor: (kind: TimelineItemKind, id: string) => void;
  onNavigateToTask: (task: Task) => void;
  onReturnToSource: () => void;
  onCloseEditor: () => void;
  onSaved: (options?: { openReaderNoteId?: string }) => Promise<void> | void;
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
  editorState,
  taskNodes,
  noteNodes,
  isTimelineLoading,
  timelineErrorMessage,
  temporalNavigationContext,
  activeNote,
  activeTask,
  onSignOut,
  onDateChange,
  onCalendarModeChange,
  onTabChange,
  onCreateNote,
  onCreateTask,
  onOpenReader,
  onOpenEditor,
  onNavigateToTask,
  onReturnToSource,
  onCloseEditor,
  onSaved,
}: DayShellProps) {
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const chromeVisibility = useSharedValue(1);
  const palette = useAppearancePalette();
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const [chromeHeight, setChromeHeight] = useState(0);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

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
        {
          paddingTop: insets.top,
          backgroundColor: palette.background,
        },
      ]}
    >
      <AuthErrorBanner status={authStatus} message={authErrorMessage} />

      <Animated.View
        pointerEvents={isChromeVisible ? "auto" : "none"}
        style={[
          styles.chromeOverlay,
          chromeAnimatedStyle,
          { top: insets.top, left: 0, right: 0 },
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
          onSettings={() => setIsSettingsVisible(true)}
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

      <NoteEditor
        visible={editorState.isOpen && editorState.kind === "note"}
        mode={editorState.mode === "edit" ? "edit" : "create"}
        selectedDay={date}
        note={editorState.mode === "edit" ? activeNote : null}
        onClose={onCloseEditor}
        onSaved={async (savedNote, options) => {
          await onSaved(options?.openReader ? { openReaderNoteId: savedNote.id } : undefined);
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

      <SettingsSheet
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
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
    marginHorizontal: 0,
  },
});
