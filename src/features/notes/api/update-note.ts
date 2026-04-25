import { noteFormSchema, noteSchema } from "../../../schemas/note.schema";
import { useAuthStore } from "../../../stores/auth-store";
import type { Note, NoteFormValues } from "../../../types/note";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export interface UpdateNoteResult {
  ok: boolean;
  note: Note | null;
  errorMessage: string | null;
}

export const updateNote = async (
  note: Note,
  input: NoteFormValues,
): Promise<UpdateNoteResult> => {
  const authStore = useAuthStore.getState();
  const configErrorMessage =
    getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.";

  if (!isSupabaseConfigured) {
    authStore.setConfigError(configErrorMessage);
    return {
      ok: false,
      note: null,
      errorMessage: configErrorMessage,
    };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();
    return {
      ok: false,
      note: null,
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  const parsedInput = noteFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      note: null,
      errorMessage:
        parsedInput.error.issues[0]?.message ?? "Informe os dados da nota corretamente.",
    };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("notes")
      .update({
        title: parsedInput.data.title,
        content: parsedInput.data.content || null,
        brief: parsedInput.data.brief || null,
      })
      .eq("id", note.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const parsedNote = noteSchema.safeParse(data);

    if (!parsedNote.success) {
      throw new Error(parsedNote.error.issues[0]?.message ?? "Nota salva com formato invalido.");
    }

    return {
      ok: true,
      note: parsedNote.data,
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      note: null,
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel salvar a nota. ${error.message}`
          : "Nao foi possivel salvar a nota.",
    };
  }
};
