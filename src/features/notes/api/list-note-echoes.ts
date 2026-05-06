import {
  persistedNoteEchoSchema,
  relatedNoteSchema,
} from "../../../schemas/note.schema";
import type { Note, NoteEcho, RelatedNote } from "../../../types/note";
import { useAuthStore } from "../../../stores/auth-store";
import {
  getRelatedNoteId,
  sortRelatedNotes,
} from "../utils/note-echo-relations";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export interface ListNoteEchoesResult {
  ok: boolean;
  echoes: NoteEcho[];
  errorMessage: string | null;
}

export interface ListRelatedNoteDetailsResult {
  ok: boolean;
  relatedNotes: RelatedNote[];
  errorMessage: string | null;
}

const preflightNoteEchoRead = () => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    const message =
      getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.";
    authStore.setConfigError(message);

    return { ok: false as const, errorMessage: message };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();

    return {
      ok: false as const,
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  return { ok: true as const };
};

export const listNoteEchoes = async (
  noteIds: string[],
): Promise<ListNoteEchoesResult> => {
  const uniqueNoteIds = Array.from(new Set(noteIds));

  if (uniqueNoteIds.length === 0) {
    return { ok: true, echoes: [], errorMessage: null };
  }

  const preflight = preflightNoteEchoRead();

  if (!preflight.ok) {
    return { ok: false, echoes: [], errorMessage: preflight.errorMessage };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("note_echoes")
      .select("*")
      .or(
        `from_note_id.in.(${uniqueNoteIds.join(",")}),to_note_id.in.(${uniqueNoteIds.join(",")})`,
      )
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const parsedEchoes = persistedNoteEchoSchema.array().safeParse(data ?? []);

    if (!parsedEchoes.success) {
      throw new Error(
        parsedEchoes.error.issues[0]?.message ?? "Falha ao validar ecos.",
      );
    }

    return { ok: true, echoes: parsedEchoes.data, errorMessage: null };
  } catch (error) {
    return {
      ok: false,
      echoes: [],
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel carregar ecos. ${error.message}`
          : "Nao foi possivel carregar ecos.",
    };
  }
};

export const listRelatedNoteDetails = async (
  activeNote: Note,
  echoes: NoteEcho[],
): Promise<ListRelatedNoteDetailsResult> => {
  const relatedNoteIds = Array.from(
    new Set(
      echoes
        .map((echo) => getRelatedNoteId(echo, activeNote.id))
        .filter((noteId): noteId is string => Boolean(noteId)),
    ),
  );

  if (relatedNoteIds.length === 0) {
    return { ok: true, relatedNotes: [], errorMessage: null };
  }

  const preflight = preflightNoteEchoRead();

  if (!preflight.ok) {
    return {
      ok: false,
      relatedNotes: [],
      errorMessage: preflight.errorMessage,
    };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("notes")
      .select("id,day,title,brief,created_at")
      .in("id", relatedNoteIds);

    if (error) {
      throw error;
    }

    const noteDetails = new Map(
      (data ?? []).map((row) => [
        String(row.id),
        {
          id: String(row.id),
          day: typeof row.day === "string" ? row.day : null,
          title: typeof row.title === "string" ? row.title : null,
          brief: typeof row.brief === "string" ? row.brief : null,
          created_at:
            typeof row.created_at === "string" ? row.created_at : null,
        },
      ]),
    );

    const relatedNotes = echoes
      .map((echo) => {
        const relatedNoteId = getRelatedNoteId(echo, activeNote.id);

        if (!relatedNoteId) {
          return null;
        }

        const detail = noteDetails.get(relatedNoteId);

        return {
          id: relatedNoteId,
          day: detail?.day ?? null,
          title: detail?.title ?? null,
          brief: detail?.brief ?? null,
          created_at: detail?.created_at ?? null,
          kind: echo.kind,
          echoId: echo.id,
          availability: detail ? "available" : "transient_unavailable",
        };
      })
      .filter((note): note is RelatedNote => note !== null);

    const parsedRelatedNotes = relatedNoteSchema
      .array()
      .safeParse(sortRelatedNotes(activeNote, relatedNotes));

    if (!parsedRelatedNotes.success) {
      throw new Error(
        parsedRelatedNotes.error.issues[0]?.message ??
          "Falha ao validar notas conectadas.",
      );
    }

    return {
      ok: true,
      relatedNotes: parsedRelatedNotes.data,
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      relatedNotes: [],
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel carregar notas conectadas. ${error.message}`
          : "Nao foi possivel carregar notas conectadas.",
    };
  }
};
