import {
  createNoteEchoInputSchema,
  persistedNoteEchoSchema,
} from "../../../schemas/note.schema";
import { useAuthStore } from "../../../stores/auth-store";
import type { CreateEchoInput, NoteEcho } from "../../../types/note";
import { listNoteEchoes } from "./list-note-echoes";
import { isSameSemanticNotePair } from "../utils/note-echo-relations";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export type CreateNoteEchoStatus =
  | "created"
  | "already_exists"
  | "not_accessible"
  | "retryable_failure";

export interface CreateNoteEchoResult {
  ok: boolean;
  status: CreateNoteEchoStatus;
  echo: NoteEcho | null;
  errorMessage: string | null;
}

const isUniqueViolation = (error: unknown) =>
  error instanceof Error
    ? error.message.includes("duplicate") || error.message.includes("unique")
    : typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505";

export const createNoteEcho = async (
  input: CreateEchoInput,
): Promise<CreateNoteEchoResult> => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    const message =
      getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.";
    authStore.setConfigError(message);

    return {
      ok: false,
      status: "retryable_failure",
      echo: null,
      errorMessage: message,
    };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();

    return {
      ok: false,
      status: "not_accessible",
      echo: null,
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  const parsedInput = createNoteEchoInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      status: "retryable_failure",
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
        created_by_user_id: authStore.session.userId,
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
      const existingEcho = echoesResult.echoes.find((echo) =>
        isSameSemanticNotePair(
          echo,
          parsedInput.data.from_note_id,
          parsedInput.data.to_note_id,
        ),
      );

      if (!echoesResult.ok) {
        return {
          ok: false,
          status: "retryable_failure",
          echo: null,
          errorMessage: echoesResult.errorMessage,
        };
      }

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
      status: "retryable_failure",
      echo: null,
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel criar eco. ${error.message}`
          : "Nao foi possivel criar eco.",
    };
  }
};
