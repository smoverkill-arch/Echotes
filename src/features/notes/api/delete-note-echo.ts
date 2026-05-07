import { deleteNoteEchoInputSchema } from "../../../schemas/note.schema";
import type { DeleteEchoInput } from "../../../types/note";
import { listNoteEchoes } from "./list-note-echoes";
import { isSameSemanticNotePair } from "../utils/note-echo-relations";
import { getSupabaseClient } from "../../../lib/supabase";
import {
  classifySupabaseNoteEchoError,
  getSupabaseNoteEchoErrorMessage,
  preflightNoteEchoSupabaseAccess,
} from "./note-echo-errors";

export type DeleteNoteEchoStatus =
  | "deleted"
  | "already_removed"
  | "invalid_input"
  | "not_accessible"
  | "retryable_failure";

export type DeleteNoteEchoResult =
  | {
      ok: true;
      status: "deleted" | "already_removed";
      errorMessage: null;
    }
  | {
      ok: false;
      status: "invalid_input" | "not_accessible" | "retryable_failure";
      errorMessage: string;
    };

export const deleteNoteEcho = async (
  input: DeleteEchoInput,
): Promise<DeleteNoteEchoResult> => {
  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      status: preflight.status,
      errorMessage: preflight.errorMessage,
    };
  }

  const parsedInput = deleteNoteEchoInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      status: "invalid_input",
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
        status: echoesResult.status,
        errorMessage: `Remocao executada mas verificacao falhou. ${echoesResult.errorMessage}`,
      };
    }

    const stillExists = parsedInput.data.echoId
      ? echoesResult.echoes.some((echo) => echo.id === parsedInput.data.echoId)
      : echoesResult.echoes.some((echo) =>
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
      status: classifySupabaseNoteEchoError(error),
      errorMessage: getSupabaseNoteEchoErrorMessage(
        "Nao foi possivel remover eco.",
        error,
      ),
    };
  }
};
