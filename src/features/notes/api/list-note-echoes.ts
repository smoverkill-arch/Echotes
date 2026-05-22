import {
  persistedNoteEchoSchema,
  relatedNoteSchema,
} from "../../../schemas/note.schema";
import type { Note, NoteEcho, RelatedNote } from "../../../types/note";
import {
  getRelatedNoteId,
  sortRelatedNotes,
} from "../utils/note-echo-relations";
import { getSupabaseClient } from "../../../lib/supabase";
import {
  classifySupabaseNoteEchoError,
  getSupabaseNoteEchoErrorMessage,
  preflightNoteEchoSupabaseAccess,
  type SupabaseNoteEchoFailure,
} from "./note-echo-errors";

export type ListNoteEchoesResult =
  | {
      ok: true;
      echoes: NoteEcho[];
      errorMessage: null;
      status?: never;
    }
  | {
      ok: false;
      echoes: [];
      errorMessage: string;
      status: SupabaseNoteEchoFailure;
    };

export type ListRelatedNoteDetailsResult =
  | {
      ok: true;
      relatedNotes: RelatedNote[];
      errorMessage: null;
      status?: never;
    }
  | {
      ok: false;
      relatedNotes: [];
      errorMessage: string;
      status: SupabaseNoteEchoFailure;
    };

interface RelatedNoteDetail {
  id: string;
  day: string;
  title: string;
  brief: string | null;
  created_at: string;
}

interface RelatedNoteRow {
  id?: unknown;
  day?: unknown;
  title?: unknown;
  brief?: unknown;
  created_at?: unknown;
}

const buildUnavailableRelatedNotes = (
  activeNote: Note,
  echoes: NoteEcho[],
  availability: Exclude<RelatedNote["availability"], "available">,
): RelatedNote[] => {
  const unavailableNotes = echoes
    .map((echo): RelatedNote | null => {
      const relatedNoteId = getRelatedNoteId(echo, activeNote.id);

      if (!relatedNoteId) {
        return null;
      }

      return {
        id: relatedNoteId,
        day: null,
        title: null,
        brief: null,
        created_at: null,
        kind: echo.kind,
        echoId: echo.id,
        availability,
      };
    })
    .filter((note): note is RelatedNote => note !== null);

  return sortRelatedNotes(activeNote, unavailableNotes);
};

const toRelatedNoteDetail = (row: RelatedNoteRow): RelatedNoteDetail | null => {
  if (
    typeof row.id !== "string" ||
    typeof row.day !== "string" ||
    typeof row.title !== "string" ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    day: row.day,
    title: row.title,
    brief: typeof row.brief === "string" ? row.brief : null,
    created_at: row.created_at,
  };
};

export const listNoteEchoes = async (
  noteIds: string[],
): Promise<ListNoteEchoesResult> => {
  const uniqueNoteIds = Array.from(new Set(noteIds));

  if (uniqueNoteIds.length === 0) {
    return { ok: true, echoes: [], errorMessage: null };
  }

  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      echoes: [],
      errorMessage: preflight.errorMessage,
      status: preflight.status,
    };
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
      return {
        ok: false,
        echoes: [],
        errorMessage:
          parsedEchoes.error.issues[0]?.message ?? "Falha ao validar ecos.",
        status: "invalid_input",
      };
    }

    return { ok: true, echoes: parsedEchoes.data, errorMessage: null };
  } catch (error) {
    return {
      ok: false,
      echoes: [],
      errorMessage: getSupabaseNoteEchoErrorMessage(
        "Nao foi possivel carregar ecos.",
        error,
      ),
      status: classifySupabaseNoteEchoError(error),
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

  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      relatedNotes: [],
      errorMessage: preflight.errorMessage,
      status: preflight.status,
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
      (data ?? [])
        .map((row) => toRelatedNoteDetail(row))
        .filter((detail): detail is RelatedNoteDetail => detail !== null)
        .map((detail) => [detail.id, detail]),
    );

    const relatedNotes = echoes
      .map((echo): RelatedNote | null => {
        const relatedNoteId = getRelatedNoteId(echo, activeNote.id);

        if (!relatedNoteId) {
          return null;
        }

        const detail = noteDetails.get(relatedNoteId);

        if (!detail) {
          return {
            id: relatedNoteId,
            day: null,
            title: null,
            brief: null,
            created_at: null,
            kind: echo.kind,
            echoId: echo.id,
            availability: "stale_detail" as const,
          };
        }

        return {
          id: relatedNoteId,
          day: detail.day,
          title: detail.title,
          brief: detail.brief,
          created_at: detail.created_at,
          kind: echo.kind,
          echoId: echo.id,
          availability: "available" as const,
        };
      })
      .filter((note): note is RelatedNote => note !== null);

    const parsedRelatedNotes = relatedNoteSchema
      .array()
      .safeParse(sortRelatedNotes(activeNote, relatedNotes));

    if (!parsedRelatedNotes.success) {
      return {
        ok: false,
        relatedNotes: [],
        errorMessage:
          parsedRelatedNotes.error.issues[0]?.message ??
          "Falha ao validar notas conectadas.",
        status: "invalid_input",
      };
    }

    return {
      ok: true,
      relatedNotes: parsedRelatedNotes.data,
      errorMessage: null,
    };
  } catch (error) {
    const status = classifySupabaseNoteEchoError(error);
    const availability =
      status === "not_accessible" ? "stale_detail" : "transient_unavailable";

    return {
      ok: true,
      relatedNotes: buildUnavailableRelatedNotes(activeNote, echoes, availability),
      errorMessage: null,
    };
  }
};
