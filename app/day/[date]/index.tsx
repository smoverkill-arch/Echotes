import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AuthErrorBanner } from "../../../src/components/auth/auth-error-banner";
import { DayShell } from "../../../src/components/day/day-shell";
import { signOut } from "../../../src/features/auth/api/sign-out";
import { useAuthSession } from "../../../src/features/auth/hooks/use-auth-session";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useDayTimeline } from "../../../src/features/day/hooks/use-day-timeline";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import { useAppearancePalette } from "../../../src/stores/appearance-store";
import { parseDayKey } from "../../../src/utils/date";

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const resolveDateParam = (
  value: string | string[] | undefined,
  fallbackDate: string,
): { resolved: string; needsRedirect: boolean } => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue && DAY_KEY_PATTERN.test(rawValue)) {
    try {
      parseDayKey(rawValue);
      return { resolved: rawValue, needsRedirect: false };
    } catch {
      return { resolved: fallbackDate, needsRedirect: true };
    }
  }

  return { resolved: fallbackDate, needsRedirect: Boolean(rawValue) };
};

export default function ProtectedDayRoute() {
  const palette = useAppearancePalette();
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[]; create?: string }>();
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const calendarMode = useCalendarStore((state) => state.calendarMode);
  const setCalendarMode = useCalendarStore((state) => state.setCalendarMode);
  const {
    authStatus,
    clockDate,
    errorMessage,
    isAuthenticated,
    isBootstrapping,
    protectedDayHref,
    selectedDate,
    session,
    signInHref,
  } = useAuthSession();
  const activeTab = useUIStore((state) => state.activeTab);
  const editorState = useUIStore((state) => state.editorState);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const openEditor = useUIStore((state) => state.openEditor);
  const closeEditor = useUIStore((state) => state.closeEditor);
  const temporalNavigationContext = useNavigationStore(
    (state) => state.temporalNavigationContext,
  );
  const setTemporalNavigationContext = useNavigationStore(
    (state) => state.setTemporalNavigationContext,
  );
  const consumePendingOpenTaskId = useNavigationStore(
    (state) => state.consumePendingOpenTaskId,
  );
  const clearTemporalNavigationContext = useNavigationStore(
    (state) => state.clearTemporalNavigationContext,
  );
  const isSigningOut = authStatus === "signing_out";

  const { resolved: resolvedDate, needsRedirect: dateParamNeedsRedirect } =
    resolveDateParam(params.date, selectedDate);
  const {
    notes,
    taskLookup,
    taskNodes,
    noteNodes,
    isLoading: isTimelineLoading,
    errorMessage: timelineErrorMessage,
    reload,
  } = useDayTimeline(resolvedDate);

  const handleDateChange = useCallback(
    (nextDate: string) => {
      if (nextDate === resolvedDate) {
        return;
      }
      closeEditor();
      clearTemporalNavigationContext();
      setSelectedDate(nextDate);
      router.push(`/day/${nextDate}`);
    },
    [
      clearTemporalNavigationContext,
      closeEditor,
      resolvedDate,
      router,
      setSelectedDate,
    ],
  );

  const activeItemId = editorState.id;
  const activeNote = useMemo(
    () =>
      editorState.kind === "note"
        ? notes.find((note) => note.id === activeItemId) ?? null
        : null,
    [activeItemId, editorState.kind, notes],
  );
  const activeTask = useMemo(
    () =>
      editorState.kind === "task" && activeItemId
        ? taskLookup.get(activeItemId) ?? null
        : null,
    [activeItemId, editorState.kind, taskLookup],
  );
  const destinationTemporalContext =
    temporalNavigationContext?.destinationDate === resolvedDate
      ? temporalNavigationContext
      : null;

  useEffect(() => {
    setSelectedDate(resolvedDate);
  }, [resolvedDate, setSelectedDate]);

  const createParam = Array.isArray(params.create) ? params.create[0] : params.create;
  useEffect(() => {
    if (createParam !== "note" && createParam !== "task") {
      return;
    }
    openEditor({ mode: "create", kind: createParam });
    router.setParams({ create: undefined });
  }, [createParam, openEditor, router]);

  useEffect(() => {
    if (!destinationTemporalContext || isTimelineLoading || timelineErrorMessage) {
      return;
    }
    if (taskLookup.has(destinationTemporalContext.sourceTaskId)) {
      return;
    }
    clearTemporalNavigationContext();
  }, [
    clearTemporalNavigationContext,
    destinationTemporalContext,
    isTimelineLoading,
    taskLookup,
    timelineErrorMessage,
  ]);

  useEffect(() => {
    const pendingTaskId = destinationTemporalContext?.pendingOpenTaskId;
    if (!pendingTaskId || isTimelineLoading || timelineErrorMessage) {
      return;
    }
    const task = taskLookup.get(pendingTaskId);
    if (!task || task.target_day !== resolvedDate) {
      return;
    }
    consumePendingOpenTaskId();
    router.push(`/day/${resolvedDate}/task/${pendingTaskId}`);
  }, [
    consumePendingOpenTaskId,
    destinationTemporalContext,
    isTimelineLoading,
    resolvedDate,
    router,
    taskLookup,
    timelineErrorMessage,
  ]);

  useEffect(() => {
    if (
      authStatus !== "config_error" &&
      authStatus !== "session_expired" &&
      !isAuthenticated
    ) {
      return;
    }
    if (isBootstrapping || isAuthenticated) {
      return;
    }
    router.replace(signInHref);
  }, [authStatus, isAuthenticated, isBootstrapping, router, signInHref]);

  if (isBootstrapping || isSigningOut) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="small" color={palette.textMuted} />
        <Text style={[styles.loadingText, { color: palette.textMuted }]}>
          Carregando sua superficie diaria...
        </Text>
      </View>
    );
  }

  if (authStatus === "config_error" || authStatus === "session_expired") {
    return (
      <View style={[styles.feedbackContainer, { backgroundColor: palette.background }]}>
        <AuthErrorBanner message={errorMessage} status={authStatus} />
        <Text style={[styles.feedbackText, { color: palette.textMuted }]}>
          Redirecionando para o fluxo publico...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated || !session) {
    return <Redirect href={signInHref} />;
  }

  if (protectedDayHref !== `/day/${resolvedDate}` || dateParamNeedsRedirect) {
    return <Redirect href={`/day/${resolvedDate}`} />;
  }

  return (
    <DayShell
      date={resolvedDate}
      clockDate={clockDate}
      email={session.email}
      isSigningOut={isSigningOut}
      authStatus={authStatus}
      authErrorMessage={errorMessage}
      activeTab={activeTab}
      calendarMode={calendarMode}
      editorState={editorState}
      taskNodes={taskNodes}
      noteNodes={noteNodes}
      isTimelineLoading={isTimelineLoading}
      timelineErrorMessage={timelineErrorMessage}
      temporalNavigationContext={destinationTemporalContext}
      activeNote={activeNote}
      activeTask={activeTask}
      onSignOut={async () => {
        await signOut();
      }}
      onDateChange={handleDateChange}
      onCalendarModeChange={setCalendarMode}
      onTabChange={setActiveTab}
      onCreateNote={() => {
        openEditor({ mode: "create", kind: "note" });
      }}
      onCreateTask={() => {
        openEditor({ mode: "create", kind: "task" });
      }}
      onOpenReader={(kind, id) => {
        router.push(`/day/${resolvedDate}/${kind}/${id}`);
      }}
      onOpenEditor={(kind, id) => {
        openEditor({ mode: "edit", kind, id });
      }}
      onNavigateToTask={(task) => {
        closeEditor();
        setTemporalNavigationContext({
          sourceDate: resolvedDate,
          destinationDate: task.target_day,
          sourceTaskId: task.id,
          returnScrollOffset: null,
        });
        router.push(`/day/${task.target_day}`);
      }}
      onReturnToSource={() => {
        if (!destinationTemporalContext) {
          return;
        }
        closeEditor();
        clearTemporalNavigationContext();
        router.push(`/day/${destinationTemporalContext.sourceDate}`);
      }}
      onCloseEditor={closeEditor}
      onSaved={async (options) => {
        const createdKind = editorState.kind;
        await reload();
        closeEditor();
        if (createdKind === "note" && activeTab !== "notes") {
          setActiveTab("notes");
        } else if (createdKind === "task" && activeTab !== "tasks") {
          setActiveTab("tasks");
        }
        if (options?.openReaderNoteId) {
          router.push(`/day/${resolvedDate}/note/${options.openReaderNoteId}`);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 15,
  },
});
