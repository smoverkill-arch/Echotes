import { useCallback, useEffect, useState } from "react";

import { noteSchema } from "../../../schemas/note.schema";
import { taskSchema } from "../../../schemas/task.schema";
import { useAuthStore } from "../../../stores/auth-store";
import type { DayEntries } from "../../../types/timeline";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

const EMPTY_DAY_ENTRIES: DayEntries = {
  tasks: [],
  notes: [],
  echoes: [],
};

interface UseDayEntriesResult extends DayEntries {
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
}

export const useDayEntries = (selectedDay: string): UseDayEntriesResult => {
  const session = useAuthStore((state) => state.session);
  const [entries, setEntries] = useState<DayEntries>(EMPTY_DAY_ENTRIES);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setEntries(EMPTY_DAY_ENTRIES);
      setErrorMessage(
        getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.",
      );
      setIsLoading(false);
      return;
    }

    if (!session?.userId) {
      setEntries(EMPTY_DAY_ENTRIES);
      setErrorMessage("Sua sessao expirou. Entre novamente.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = getSupabaseClient();
      const [notesResult, tasksResult] = await Promise.all([
        supabase
          .from("notes")
          .select("*")
          .eq("day", selectedDay)
          .order("created_at", { ascending: true }),
        supabase
          .from("tasks")
          .select("*")
          .eq("source_day", selectedDay)
          .eq("target_day", selectedDay)
          .order("created_at", { ascending: true }),
      ]);

      if (notesResult.error) {
        throw notesResult.error;
      }

      if (tasksResult.error) {
        throw tasksResult.error;
      }

      const parsedNotes = noteSchema.array().safeParse(notesResult.data ?? []);
      const parsedTasks = taskSchema.array().safeParse(tasksResult.data ?? []);

      if (!parsedNotes.success) {
        throw new Error(parsedNotes.error.issues[0]?.message ?? "Falha ao validar notas.");
      }

      if (!parsedTasks.success) {
        throw new Error(parsedTasks.error.issues[0]?.message ?? "Falha ao validar tarefas.");
      }

      setEntries({
        notes: parsedNotes.data,
        tasks: parsedTasks.data,
        echoes: [],
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? `Nao foi possivel carregar o dia. ${error.message}`
          : "Nao foi possivel carregar o dia.";
      setEntries(EMPTY_DAY_ENTRIES);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDay, session?.userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    ...entries,
    isLoading,
    errorMessage,
    reload,
  };
};
