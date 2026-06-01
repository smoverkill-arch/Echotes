import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";

import { continueNote } from "../../notes/api/continue-note";
import { createNoteEcho } from "../../notes/api/create-note-echo";
import { deleteNoteEcho } from "../../notes/api/delete-note-echo";
import { listRelatedNoteDetails } from "../../notes/api/list-note-echoes";
import { getRelatedNoteId } from "../../notes/utils/note-echo-relations";
import { useAuthStore } from "../../../stores/auth-store";
import type {
  ContinueNoteInput,
  NoteEchoCandidate,
  RelatedNote,
} from "../../../types/note";
import { useDayTimeline } from "./use-day-timeline";

export const useNoteReaderController = (date: string, noteId: string) => {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const { notes, echoes, reload } = useDayTimeline(date);

  const note = useMemo(
    () => notes.find((candidate) => candidate.id === noteId) ?? null,
    [notes, noteId],
  );

  const noteEchoes = useMemo(() => {
    if (!note) {
      return [];
    }
    return echoes.filter((echo) => getRelatedNoteId(echo, note.id));
  }, [echoes, note]);

  const [relatedNotes, setRelatedNotes] = useState<RelatedNote[]>([]);
  const [isEchoPickerVisible, setIsEchoPickerVisible] = useState(false);
  const [isContinueVisible, setIsContinueVisible] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);
  const [echoFeedback, setEchoFeedback] = useState<string | null>(null);
  const relatedCountRef = useRef(0);

  const replaceRelated = useCallback((next: RelatedNote[]) => {
    relatedCountRef.current = next.length;
    setRelatedNotes(next);
  }, []);

  const loadRelatedNotes = useCallback(async () => {
    if (!note) {
      if (relatedCountRef.current !== 0) {
        relatedCountRef.current = 0;
        setRelatedNotes([]);
      }
      return;
    }
    const result = await listRelatedNoteDetails(note, noteEchoes);
    if (result.ok) {
      replaceRelated(result.relatedNotes);
      return;
    }
    if (relatedCountRef.current !== 0) {
      relatedCountRef.current = 0;
      setRelatedNotes([]);
    }
  }, [note, noteEchoes, replaceRelated]);

  useEffect(() => {
    void loadRelatedNotes();
  }, [loadRelatedNotes]);

  const handleSelectCandidate = useCallback(
    async (candidate: NoteEchoCandidate) => {
      if (!note) {
        return;
      }
      const result = await createNoteEcho({
        from_note_id: note.id,
        to_note_id: candidate.id,
        context_note_id: note.id,
        context_day: date,
        kind: "manual_link",
        metadata: null,
      });
      if (!result.ok) {
        setEchoFeedback(result.errorMessage);
        return;
      }
      setEchoFeedback(result.status === "already_exists" ? "Eco ja existe" : "Eco adicionado.");
      setIsEchoPickerVisible(false);
      await reload();
    },
    [note, date, reload],
  );

  const handleRemoveEcho = useCallback(
    async (relatedNote: RelatedNote) => {
      if (!note || relatedNote.availability !== "available") {
        return;
      }
      const result = await deleteNoteEcho({
        echoId: relatedNote.echoId,
        noteIdA: note.id,
        noteIdB: relatedNote.id,
      });
      if (!result.ok) {
        setEchoFeedback(result.errorMessage);
        return;
      }
      setEchoFeedback(result.status === "already_removed" ? "Eco ja removido." : "Eco removido.");
      replaceRelated(relatedNotes.filter((item) => item.echoId !== relatedNote.echoId));
      await reload();
    },
    [note, relatedNotes, reload, replaceRelated],
  );

  const handleContinueNote = useCallback(
    async (draft: ContinueNoteInput) => {
      if (!note || !session?.userId) {
        return;
      }
      setIsContinuing(true);
      setContinueError(null);
      try {
        const result = await continueNote(draft);
        if (!result.ok) {
          setContinueError(result.errorMessage);
          return;
        }
        setIsContinueVisible(false);
        router.push(`/day/${result.newNote.day}/note/${result.newNote.id}`);
      } finally {
        setIsContinuing(false);
      }
    },
    [note, session?.userId, router],
  );

  const openRelatedNote = useCallback(
    (relatedNote: RelatedNote) => {
      if (relatedNote.availability !== "available") {
        return;
      }
      router.push(`/day/${relatedNote.day}/note/${relatedNote.id}`);
    },
    [router],
  );

  return {
    note,
    noteEchoes,
    relatedNotes,
    echoFeedback,
    isEchoPickerVisible,
    isContinueVisible,
    isContinuing,
    continueError,
    reload,
    loadRelatedNotes,
    openRelatedNote,
    openEchoPicker: () => {
      setEchoFeedback(null);
      setIsEchoPickerVisible(true);
    },
    closeEchoPicker: () => setIsEchoPickerVisible(false),
    handleSelectCandidate,
    handleRemoveEcho,
    openContinue: () => {
      setContinueError(null);
      setIsContinueVisible(true);
    },
    closeContinue: () => setIsContinueVisible(false),
    handleContinueNote,
  };
};
