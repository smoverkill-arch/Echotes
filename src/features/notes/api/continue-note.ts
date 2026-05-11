import {
  continueNoteInputSchema,
  noteSchema,
  persistedNoteEchoSchema,
} from "../../../schemas/note.schema";
import type { ContinueNoteInput, Note, NoteEcho } from "../../../types/note";
import { getSupabaseClient } from "../../../lib/supabase";
import {
  classifySupabaseNoteEchoError,
  getSupabaseNoteEchoErrorMessage,
  preflightNoteEchoSupabaseAccess,
  type SupabaseNoteEchoFailure,
} from "./note-echo-errors";

type ContinueNoteFailure = SupabaseNoteEchoFailure | "invalid_input";

export type ContinueNoteResult =
  | {
      ok: true;
      newNote: Note;
      noteEcho: NoteEcho;
      errorMessage: null;
      status: "created";
    }
  | {
      ok: false;
      newNote: null;
      noteEcho: null;
      errorMessage: string;
      status: ContinueNoteFailure;
    };

const getPayloadField = (payload: unknown, key: string) =>
  typeof payload === "object" && payload !== null && key in payload
    ? (payload as Record<string, unknown>)[key]
    : null;

export const continueNote = async (
  input: ContinueNoteInput,
): Promise<ContinueNoteResult> => {
  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      newNote: null,
      noteEcho: null,
      errorMessage: preflight.errorMessage,
      status: preflight.status,
    };
  }

  const parsedInput = continueNoteInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      newNote: null,
      noteEcho: null,
      errorMessage:
        parsedInput.error.issues[0]?.message ??
        "Informe os dados da continuacao corretamente.",
      status: "invalid_input",
    };
  }

  try {
    const { data, error } = await getSupabaseClient().rpc("continue_note", {
      source_note_id: parsedInput.data.sourceNoteId,
      new_note_day: parsedInput.data.newNoteDay,
      title: parsedInput.data.title,
      brief: parsedInput.data.generatedBrief,
      content: parsedInput.data.content,
    });

    if (error) {
      throw error;
    }

    const parsedNote = noteSchema.safeParse(getPayloadField(data, "newNote"));
    const parsedEcho = persistedNoteEchoSchema.safeParse(
      getPayloadField(data, "noteEcho"),
    );

    if (!parsedNote.success || !parsedEcho.success) {
      return {
        ok: false,
        newNote: null,
        noteEcho: null,
        errorMessage: "Continuacao criada com resposta invalida.",
        status: "retryable_failure",
      };
    }

    return {
      ok: true,
      newNote: parsedNote.data,
      noteEcho: parsedEcho.data,
      errorMessage: null,
      status: "created",
    };
  } catch (error) {
    return {
      ok: false,
      newNote: null,
      noteEcho: null,
      errorMessage: getSupabaseNoteEchoErrorMessage(
        "Nao foi possivel continuar a nota.",
        error,
      ),
      status: classifySupabaseNoteEchoError(error),
    };
  }
};
