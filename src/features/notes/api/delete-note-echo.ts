import { deleteNoteEchoInputSchema } from "../../../schemas/note.schema";
import { useAuthStore } from "../../../stores/auth-store";
import type { DeleteEchoInput } from "../../../types/note";
import { listNoteEchoes } from "./list-note-echoes";
import { isSameSemanticNotePair } from "../utils/note-echo-relations";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export type DeleteNoteEchoStatus =
  | "deleted"
  | "already_removed"
  | "not_accessible"
  | "retryable_failure";

export interface DeleteNoteEchoResult {
  ok: boolean;
  status: DeleteNoteEchoStatus;
  errorMessage: string | null;
}

export const deleteNoteEcho = async (
  input: DeleteEchoInput,
): Promise<DeleteNoteEchoResult> => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    const message =
      getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.";
    authStore.setConfigError(message);

    return { ok: false, status: "retryable_failure", errorMessage: message };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();

    return {
      ok: false,
      status: "not_accessible",
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  const parsedInput = deleteNoteEchoInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      status: "retryable_failure",
      errorMessage:
        parsedInput.error.issues[0]?.message ??
        "Informe os dados do eco corretamente.",
    };
  }

  try {
    const query = getSupabaseClient().from("note_echoes").delete();
    const semanticPairFilter = `and(from_note_id.eq.${parsedInput.data.noteIdA},to_note_id.eq.${parsedInput.data.noteIdB}),and(from_note_id.eq.${parsedInput.data.noteIdB},to_note_id.eq.${parsedInput.data.noteIdA})`;
    const { data, error } = parsedInput.data.echoId
      ? await query.eq("id", parsedInput.data.echoId).or(semanticPairFilter).select("*")
      : await query.or(semanticPairFilter).select("*");

    if (error) {
      throw error;
    }

    const echoesResult = await listNoteEchoes([
      parsedInput.data.noteIdA,
      parsedInput.data.noteIdB,
    ]);

    if (!echoesResult.ok) {
      return {
        ok: false,
        status: "retryable_failure",
        errorMessage: echoesResult.errorMessage,
      };
    }

    const stillExists = echoesResult.echoes.some((echo) =>
      isSameSemanticNotePair(
        echo,
        parsedInput.data.noteIdA,
        parsedInput.data.noteIdB,
      ),
    );
    const removedRows = Array.isArray(data) ? data.length : 0;

    if (stillExists) {
      return {
        ok: false,
        status: "retryable_failure",
        errorMessage: "Eco ainda presente apos tentativa de remocao.",
      };
    }

    return {
      ok: true,
      status: removedRows > 0 ? "deleted" : "already_removed",
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: "retryable_failure",
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel remover eco. ${error.message}`
          : "Nao foi possivel remover eco.",
    };
  }
};
