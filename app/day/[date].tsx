import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AuthErrorBanner } from "../../src/components/auth/auth-error-banner";
import { DayShell, type DayShellSavedOptions } from "../../src/components/day/day-shell";
import { signOut } from "../../src/features/auth/api/sign-out";
import { useAuthSession } from "../../src/features/auth/hooks/use-auth-session";
import { continueNote } from "../../src/features/notes/api/continue-note";
import { createNoteEcho } from "../../src/features/notes/api/create-note-echo";
import { deleteNoteEcho } from "../../src/features/notes/api/delete-note-echo";
import { listRelatedNoteDetails } from "../../src/features/notes/api/list-note-echoes";
import { getRelatedNoteId } from "../../src/features/notes/utils/note-echo-relations";
import { useCalendarStore } from "../../src/stores/calendar-store";
import { useDayTimeline } from "../../src/features/day/hooks/use-day-timeline";
import { useNavigationStore } from "../../src/stores/navigation-store";
import { useUIStore } from "../../src/stores/ui-store";
import type {
  ContinueNoteInput,
  NoteEchoCandidate,
  RelatedNote,
} from "../../src/types/note";
import { parseDayKey } from "../../src/utils/date";

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
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[] }>();
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
  const pendingReaderOpen = useNavigationStore((state) => state.pendingReaderOpen);
  const setPendingReaderOpen = useNavigationStore(
    (state) => state.setPendingReaderOpen,
  );
  const consumePendingReaderOpen = useNavigationStore(
    (state) => state.consumePendingReaderOpen,
  );
  const clearPendingReaderOpen = useNavigationStore(
    (state) => state.clearPendingReaderOpen,
  );
  const [relatedNotes, setRelatedNotes] = useState<RelatedNote[]>([]);
  const [isEchoPickerVisible, setIsEchoPickerVisible] = useState(false);
  const [isContinueNoteEditorVisible, setIsContinueNoteEditorVisible] =
    useState(false);
  const [isContinuingNote, setIsContinuingNote] = useState(false);
  const [continueNoteErrorMessage, setContinueNoteErrorMessage] = useState<
    string | null
  >(null);
  const [echoFeedbackMessage, setEchoFeedbackMessage] = useState<string | null>(
    null,
  );
  const relatedNotesCountRef = useRef(0);
  const pendingReaderNavigationTargetRef = useRef<string | null>(null);
  const replaceRelatedNotes = useCallback((nextRelatedNotes: RelatedNote[]) => {
    relatedNotesCountRef.current = nextRelatedNotes.length;
    setRelatedNotes(nextRelatedNotes);
  }, []);
  const clearRelatedNotes = useCallback(() => {
    if (relatedNotesCountRef.current === 0) {
      return;
    }

    relatedNotesCountRef.current = 0;
    setRelatedNotes([]);
  }, []);
  const isSigningOut = authStatus === "signing_out";

  const { resolved: resolvedDate, needsRedirect: dateParamNeedsRedirect } =
    resolveDateParam(params.date, selectedDate);
  const {
    notes,
    echoes,
    taskLookup,
    timelineNodes,
    isLoading: isTimelineLoading,
    errorMessage: timelineErrorMessage,
    reload,
  } = useDayTimeline(resolvedDate, activeTab);
  const handleDateChange = useCallback(
    (nextDate: string) => {
      if (nextDate === resolvedDate) {
        return;
      }

      closeReader();
      closeEditor();
      clearPendingReaderOpen();
      clearTemporalNavigationContext();
      setSelectedDate(nextDate);
      router.push(`/day/${nextDate}`);
    },
    [
      clearPendingReaderOpen,
      clearTemporalNavigationContext,
      closeEditor,
      closeReader,
      resolvedDate,
      router,
      setSelectedDate,
    ],
  );
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
  const notesById = useMemo(
    () => new Map(notes.map((note) => [note.id, note])),
    [notes],
  );
  const activeNoteEchoes = useMemo(() => {
    if (!activeNote) {
      return [];
    }

    return echoes.filter((echo) => getRelatedNoteId(echo, activeNote.id));
  }, [activeNote, echoes]);
  const loadRelatedNotes = useCallback(async () => {
    if (!activeNote || !readerState.isOpen || readerState.kind !== "note") {
      clearRelatedNotes();
      return;
    }

    const result = await listRelatedNoteDetails(activeNote, activeNoteEchoes);

    if (result.ok) {
      replaceRelatedNotes(result.relatedNotes);
      return;
    }

    clearRelatedNotes();
  }, [
    activeNote,
    activeNoteEchoes,
    clearRelatedNotes,
    readerState.isOpen,
    readerState.kind,
    replaceRelatedNotes,
  ]);
  const closeEchoPicker = useCallback(() => {
    setIsEchoPickerVisible(false);
  }, []);
  const handleSelectEchoCandidate = useCallback(
    async (candidate: NoteEchoCandidate) => {
      if (!activeNote) {
        return;
      }

      const result = await createNoteEcho({
        from_note_id: activeNote.id,
        to_note_id: candidate.id,
        context_note_id: activeNote.id,
        context_day: resolvedDate,
        kind: "manual_link",
        metadata: null,
      });

      if (!result.ok) {
        setEchoFeedbackMessage(result.errorMessage);
        return;
      }

      setEchoFeedbackMessage(
        result.status === "already_exists" ? "Eco ja existe" : "Eco adicionado.",
      );
      setIsEchoPickerVisible(false);
      await reload();
    },
    [activeNote, reload, resolvedDate],
  );
  const handleRemoveEcho = useCallback(
    async (relatedNote: RelatedNote) => {
      if (!activeNote || relatedNote.availability !== "available") {
        return;
      }

      const result = await deleteNoteEcho({
        echoId: relatedNote.echoId,
        noteIdA: activeNote.id,
        noteIdB: relatedNote.id,
      });

      if (!result.ok) {
        setEchoFeedbackMessage(result.errorMessage);
        return;
      }

      setEchoFeedbackMessage(
        result.status === "already_removed" ? "Eco ja removido." : "Eco removido.",
      );
      replaceRelatedNotes(
        relatedNotes.filter((note) => note.echoId !== relatedNote.echoId),
      );
      await reload();
    },
    [activeNote, relatedNotes, reload, replaceRelatedNotes],
  );
  const handleContinueNote = useCallback(
    async (draft: ContinueNoteInput) => {
      if (!activeNote || !session?.userId) {
        return;
      }

      setIsContinuingNote(true);
      setContinueNoteErrorMessage(null);

      try {
        const result = await continueNote(draft);

        if (!result.ok) {
          setContinueNoteErrorMessage(result.errorMessage);
          return;
        }

        setIsContinueNoteEditorVisible(false);
        setEchoFeedbackMessage("Nota continuada.");
        setPendingReaderOpen({
          noteId: result.newNote.id,
          noteDay: result.newNote.day,
          requestId: `${result.newNote.id}:${Date.now()}`,
          sessionUserId: session.userId,
          actionOrigin: "continue_note_created",
        });

        if (result.newNote.day === resolvedDate) {
          await reload();
          return;
        }

        closeReader();
        closeEditor();
        pendingReaderNavigationTargetRef.current = result.newNote.day;
        router.push(`/day/${result.newNote.day}`);
      } finally {
        setIsContinuingNote(false);
      }
    },
    [
      activeNote,
      closeEditor,
      closeReader,
      reload,
      resolvedDate,
      router,
      session?.userId,
      setPendingReaderOpen,
    ],
  );

  useEffect(() => {
    setSelectedDate(resolvedDate);
  }, [resolvedDate, setSelectedDate]);

  useEffect(() => {
    setIsEchoPickerVisible(false);
    setIsContinueNoteEditorVisible(false);
    setContinueNoteErrorMessage(null);
    setEchoFeedbackMessage(null);
  }, [activeNote?.id, resolvedDate]);

  useEffect(() => {
    void loadRelatedNotes();
  }, [loadRelatedNotes]);

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
    if (!pendingReaderOpen) {
      return;
    }

    if (pendingReaderOpen.sessionUserId !== session?.userId) {
      clearPendingReaderOpen();
      return;
    }

    if (pendingReaderOpen.noteDay !== resolvedDate) {
      if (pendingReaderNavigationTargetRef.current === pendingReaderOpen.noteDay) {
        return;
      }

      clearPendingReaderOpen();
      return;
    }

    if (pendingReaderNavigationTargetRef.current === resolvedDate) {
      pendingReaderNavigationTargetRef.current = null;
    }

    if (isTimelineLoading) {
      return;
    }

    if (timelineErrorMessage) {
      clearPendingReaderOpen();
      return;
    }

    // During cross-day navigation the route can update before day entries finish reloading.
    if (notes.some((note) => note.day !== resolvedDate)) {
      return;
    }

    const noteToOpen = notesById.get(pendingReaderOpen.noteId);

    if (!noteToOpen || noteToOpen.day !== pendingReaderOpen.noteDay) {
      clearPendingReaderOpen();
      return;
    }

    openReader("note", pendingReaderOpen.noteId);
    consumePendingReaderOpen(pendingReaderOpen.requestId);
  }, [
    clearPendingReaderOpen,
    consumePendingReaderOpen,
    isTimelineLoading,
    notes,
    notesById,
    openReader,
    pendingReaderOpen,
    resolvedDate,
    session?.userId,
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

  if (
    protectedDayHref !== `/day/${resolvedDate}` ||
    dateParamNeedsRedirect
  ) {
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
      readerState={readerState}
      editorState={editorState}
      timelineNodes={timelineNodes}
      isTimelineLoading={isTimelineLoading}
      timelineErrorMessage={timelineErrorMessage}
      temporalNavigationContext={destinationTemporalContext}
      activeNote={activeNote}
      activeTask={activeTask}
      relatedNotes={relatedNotes}
      activeNoteEchoes={activeNoteEchoes}
      isEchoPickerVisible={isEchoPickerVisible}
      isContinueNoteEditorVisible={isContinueNoteEditorVisible}
      isContinuingNote={isContinuingNote}
      continueNoteErrorMessage={continueNoteErrorMessage}
      echoFeedbackMessage={echoFeedbackMessage}
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
      onOpenRelatedNote={(relatedNote) => {
        if (relatedNote.availability !== "available") {
          return;
        }

        if (relatedNote.day === resolvedDate) {
          openReader("note", relatedNote.id);
          return;
        }

        closeReader();
        closeEditor();
        setPendingReaderOpen({
          noteId: relatedNote.id,
          noteDay: relatedNote.day,
          requestId: `${relatedNote.id}:${Date.now()}`,
          sessionUserId: session.userId,
          actionOrigin: "connected_note_tap",
        });
        pendingReaderNavigationTargetRef.current = relatedNote.day;
        router.push(`/day/${relatedNote.day}`);
      }}
      onReloadRelatedNote={async () => {
        await loadRelatedNotes();
      }}
      onAddEcho={() => {
        setEchoFeedbackMessage(null);
        setIsEchoPickerVisible(true);
      }}
      onCloseEchoPicker={closeEchoPicker}
      onSelectEchoCandidate={handleSelectEchoCandidate}
      onRemoveEcho={handleRemoveEcho}
      onContinueNote={() => {
        setContinueNoteErrorMessage(null);
        setIsContinueNoteEditorVisible(true);
      }}
      onCloseContinueNoteEditor={() => {
        setIsContinueNoteEditorVisible(false);
      }}
      onSubmitContinueNote={handleContinueNote}
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
      onSaved={async (options?: DayShellSavedOptions) => {
        await reload();
        closeEditor();
        closeReader();

        if (options?.echoFeedbackMessage) {
          setEchoFeedbackMessage(options.echoFeedbackMessage);
        }

        if (options?.openReader) {
          openReader(options.openReader.kind, options.openReader.id);
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
