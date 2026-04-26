import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AuthErrorBanner } from "../../src/components/auth/auth-error-banner";
import { DayShell } from "../../src/components/day/day-shell";
import { signOut } from "../../src/features/auth/api/sign-out";
import { useAuthSession } from "../../src/features/auth/hooks/use-auth-session";
import { useCalendarStore } from "../../src/stores/calendar-store";
import { useDayTimeline } from "../../src/features/day/hooks/use-day-timeline";
import { useNavigationStore } from "../../src/stores/navigation-store";
import { useUIStore } from "../../src/stores/ui-store";
import { parseDayKey } from "../../src/utils/date";

const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const resolveDateParam = (
  value: string | string[] | undefined,
  fallbackDate: string,
) => {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (rawValue && DAY_KEY_PATTERN.test(rawValue)) {
    try {
      parseDayKey(rawValue);
      return rawValue;
    } catch {
      return fallbackDate;
    }
  }

  return fallbackDate;
};

export default function ProtectedDayRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const setSelectedDate = useCalendarStore((state) => state.setSelectedDate);
  const {
    authStatus,
    errorMessage,
    isAuthenticated,
    isBootstrapping,
    protectedDayHref,
    selectedDate,
    session,
    signInHref,
  } = useAuthSession();
  const activeTab = useUIStore((state) => state.activeTab);
  const readerState = useUIStore((state) => state.readerState);
  const editorState = useUIStore((state) => state.editorState);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const openReader = useUIStore((state) => state.openReader);
  const closeReader = useUIStore((state) => state.closeReader);
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

  const rawDateParam = Array.isArray(params.date) ? params.date[0] : params.date;
  const resolvedDate = resolveDateParam(params.date, selectedDate);
  const {
    notes,
    taskLookup,
    timelineNodes,
    isLoading: isTimelineLoading,
    errorMessage: timelineErrorMessage,
    reload,
  } = useDayTimeline(resolvedDate, activeTab);
  const activeItemId = readerState.id ?? editorState.id;
  const activeNote = useMemo(
    () =>
      readerState.kind === "note" || editorState.kind === "note"
        ? notes.find((note) => note.id === activeItemId) ?? null
        : null,
    [activeItemId, editorState.kind, notes, readerState.kind],
  );
  const activeTask = useMemo(
    () =>
      readerState.kind === "task" || editorState.kind === "task"
        ? (activeItemId ? taskLookup.get(activeItemId) ?? null : null)
        : null,
    [activeItemId, editorState.kind, readerState.kind, taskLookup],
  );
  const destinationTemporalContext =
    temporalNavigationContext?.destinationDate === resolvedDate
      ? temporalNavigationContext
      : null;

  useEffect(() => {
    setSelectedDate(resolvedDate);
  }, [resolvedDate, setSelectedDate]);

  useEffect(() => {
    if (!destinationTemporalContext?.pendingOpenTaskId) {
      return;
    }

    if (isTimelineLoading || timelineErrorMessage) {
      return;
    }

    const task = taskLookup.get(destinationTemporalContext.pendingOpenTaskId);

    if (!task || task.target_day !== resolvedDate) {
      return;
    }

    openReader("task", destinationTemporalContext.pendingOpenTaskId);
    consumePendingOpenTaskId();
  }, [
    consumePendingOpenTaskId,
    destinationTemporalContext,
    isTimelineLoading,
    openReader,
    resolvedDate,
    taskLookup,
    timelineErrorMessage,
  ]);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#111827" />
        <Text style={styles.loadingText}>Carregando sua superficie diaria...</Text>
      </View>
    );
  }

  if (authStatus === "config_error" || authStatus === "session_expired") {
    return (
      <View style={styles.feedbackContainer}>
        <AuthErrorBanner message={errorMessage} status={authStatus} />
        <Text style={styles.feedbackText}>
          Redirecionando para o fluxo publico...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated || !session) {
    return <Redirect href={signInHref} />;
  }

  if (protectedDayHref !== `/day/${resolvedDate}`) {
    return <Redirect href={`/day/${resolvedDate}`} />;
  }

  if (rawDateParam && rawDateParam !== resolvedDate) {
    return <Redirect href={`/day/${resolvedDate}`} />;
  }

  return (
    <DayShell
      date={resolvedDate}
      email={session.email}
      isSigningOut={isSigningOut}
      authStatus={authStatus}
      authErrorMessage={errorMessage}
      activeTab={activeTab}
      readerState={readerState}
      editorState={editorState}
      timelineNodes={timelineNodes}
      isTimelineLoading={isTimelineLoading}
      timelineErrorMessage={timelineErrorMessage}
      temporalNavigationContext={destinationTemporalContext}
      activeNote={activeNote}
      activeTask={activeTask}
      onSignOut={async () => {
        await signOut();
      }}
      onTabChange={setActiveTab}
      onCreateNote={() => {
        openEditor({ mode: "create", kind: "note" });
      }}
      onCreateTask={() => {
        openEditor({ mode: "create", kind: "task" });
      }}
      onOpenReader={openReader}
      onOpenEditor={(kind, id) => {
        openEditor({ mode: "edit", kind, id });
      }}
      onNavigateToTask={(task) => {
        closeReader();
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

        closeReader();
        closeEditor();
        clearTemporalNavigationContext();
        router.push(`/day/${destinationTemporalContext.sourceDate}`);
      }}
      onCloseReader={closeReader}
      onCloseEditor={closeEditor}
      onSaved={async () => {
        await reload();
        closeEditor();
        closeReader();
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
    backgroundColor: "#f7f8fb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#4b5563",
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#f7f8fb",
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 15,
    color: "#4b5563",
  },
});
