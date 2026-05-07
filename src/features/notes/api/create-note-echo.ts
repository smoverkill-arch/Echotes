import {
  createNoteEchoInputSchema,
  persistedNoteEchoSchema,
} from "../../../schemas/note.schema";
import type { CreateEchoInput, NoteEcho } from "../../../types/note";
import { listNoteEchoes } from "./list-note-echoes";
import { isSameSemanticNotePair } from "../utils/note-echo-relations";
import { getSupabaseClient } from "../../../lib/supabase";
import {
  classifySupabaseNoteEchoError,
  getSupabaseNoteEchoErrorMessage,
  isUniqueViolation,
  preflightNoteEchoSupabaseAccess,
} from "./note-echo-errors";

export type CreateNoteEchoStatus =
  | "created"
  | "already_exists"
  | "invalid_input"
  | "not_accessible"
  | "retryable_failure";

export type CreateNoteEchoResult =
  | {
      ok: true;
      status: "created" | "already_exists";
      echo: NoteEcho;
      errorMessage: null;
    }
  | {
      ok: false;
      status: "invalid_input" | "not_accessible" | "retryable_failure";
      echo: null;
      errorMessage: string;
    };

export const createNoteEcho = async (
  input: CreateEchoInput,
): Promise<CreateNoteEchoResult> => {
  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      status: preflight.status,
      echo: null,
      errorMessage: preflight.errorMessage,
    };
  }

  const parsedInput = createNoteEchoInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      status: "invalid_input",
      echo: null,
      errorMessage:
        parsedInput.error.issues[0]?.message ??
        "Informe os dados do eco corretamente.",
    };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("note_echoes")
      .insert({
        from_note_id: parsedInput.data.from_note_id,
        to_note_id: parsedInput.data.to_note_id,
        context_note_id:
          parsedInput.data.context_note_id ?? parsedInput.data.from_note_id,
        context_day: parsedInput.data.context_day,
        kind: parsedInput.data.kind,
        metadata: parsedInput.data.metadata,
      })
      .select("*")
      .single();

    if (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      const echoesResult = await listNoteEchoes([
        parsedInput.data.from_note_id,
        parsedInput.data.to_note_id,
      ]);

      if (!echoesResult.ok) {
        // invalid_input during reconciliation means fetched data is malformed —
        // treat as retryable, not a caller input error.
        const status =
          echoesResult.status === "invalid_input"
            ? "retryable_failure"
            : echoesResult.status;
        return {
          ok: false,
          status,
          echo: null,
          errorMessage: `Eco ja existia antes desta operacao. ${echoesResult.errorMessage}`,
        };
      }

      const existingEcho = echoesResult.echoes.find((echo) =>
        isSameSemanticNotePair(
          echo,
          parsedInput.data.from_note_id,
          parsedInput.data.to_note_id,
        ),
      );

      if (!existingEcho) {
        return {
          ok: false,
          status: "not_accessible",
          echo: null,
          errorMessage: "Eco ja existente nao esta acessivel para reconciliacao.",
        };
      }

      return {
        ok: true,
        status: "already_exists",
        echo: existingEcho,
        errorMessage: null,
      };
    }

    const parsedEcho = persistedNoteEchoSchema.safeParse(data);

    if (!parsedEcho.success) {
      throw new Error(
        parsedEcho.error.issues[0]?.message ?? "Eco criado com formato invalido.",
      );
    }

    return {
      ok: true,
      status: "created",
      echo: parsedEcho.data,
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      status: classifySupabaseNoteEchoError(error),
      echo: null,
      errorMessage: getSupabaseNoteEchoErrorMessage(
        "Nao foi possivel criar eco.",
        error,
      ),
    };
  }
};
