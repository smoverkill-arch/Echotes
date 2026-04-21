import { noteFormSchema, noteSchema } from "../../../schemas/note.schema";
import { useAuthStore } from "../../../stores/auth-store";
import type { NoteFormValues, Note } from "../../../types/note";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export interface CreateNoteResult {
  ok: boolean;
  note: Note | null;
  errorMessage: string | null;
}

export const createNote = async (
  input: NoteFormValues,
): Promise<CreateNoteResult> => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    authStore.setConfigError();
    return {
      ok: false,
      note: null,
      errorMessage:
        getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.",
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
      .insert({
        user_id: authStore.session.userId,
        day: parsedInput.data.day,
        title: parsedInput.data.title,
        content: parsedInput.data.content || null,
        brief: parsedInput.data.brief || null,
        tag_id: parsedInput.data.tag_id,
        color: parsedInput.data.color,
        is_color_overridden: parsedInput.data.is_color_overridden,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const parsedNote = noteSchema.safeParse(data);

    if (!parsedNote.success) {
      throw new Error(parsedNote.error.issues[0]?.message ?? "Nota criada com formato invalido.");
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
          ? `Nao foi possivel criar a nota. ${error.message}`
          : "Nao foi possivel criar a nota.",
    };
  }
};
