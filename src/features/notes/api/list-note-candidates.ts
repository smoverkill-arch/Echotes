import {
  noteEchoCandidatePageSchema,
  noteEchoCandidateSchema,
} from "../../../schemas/note.schema";
import type {
  NoteEcho,
  NoteEchoCandidate,
  NoteEchoCandidateCursor,
  NoteEchoCandidatePage,
} from "../../../types/note";
import { isSameSemanticNotePair } from "../utils/note-echo-relations";
import { useAuthStore } from "../../../stores/auth-store";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export interface ListNoteCandidatesInput {
  sourceNoteId: string;
  selectedDay: string;
  existingEchoes: NoteEcho[];
  cursor?: NoteEchoCandidateCursor | null;
  pageSize?: number;
}

export interface ListNoteCandidatesResult {
  ok: boolean;
  page: NoteEchoCandidatePage;
  errorMessage: string | null;
}

const DEFAULT_PAGE_SIZE = 50;

const compareCandidateOrder = (
  selectedDay: string,
  left: NoteEchoCandidate,
  right: NoteEchoCandidate,
) => {
  const leftSelectedDay = left.day === selectedDay;
  const rightSelectedDay = right.day === selectedDay;

  if (leftSelectedDay !== rightSelectedDay) {
    return leftSelectedDay ? -1 : 1;
  }

  if (!leftSelectedDay && left.day !== right.day) {
    return right.day.localeCompare(left.day);
  }

  const createdCompare = right.created_at.localeCompare(left.created_at);

  if (createdCompare !== 0) {
    return createdCompare;
  }

  return right.id.localeCompare(left.id);
};

const isAfterCursor = (
  selectedDay: string,
  candidate: NoteEchoCandidate,
  cursor: NoteEchoCandidateCursor | null | undefined,
) => {
  if (!cursor) {
    return true;
  }

  const cursorCandidate: NoteEchoCandidate = {
    id: cursor.id,
    day: cursor.day,
    title: "",
    brief: null,
    created_at: cursor.created_at,
    isAlreadyConnected: false,
  };

  return compareCandidateOrder(selectedDay, candidate, cursorCandidate) > 0;
};

export const listNoteCandidates = async ({
  sourceNoteId,
  selectedDay,
  existingEchoes,
  cursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
}: ListNoteCandidatesInput): Promise<ListNoteCandidatesResult> => {
  const safePageSize = Math.max(1, pageSize);
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    const message =
      getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.";
    authStore.setConfigError(message);

    return {
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: message,
    };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();

    return {
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("notes")
      .select("id,day,title,brief,created_at")
      .neq("id", sourceNoteId)
      .order("day", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    const candidates = (data ?? [])
      .map((row) => ({
        id: String(row.id),
        day: String(row.day),
        title: String(row.title),
        brief: typeof row.brief === "string" ? row.brief : null,
        created_at: String(row.created_at),
        isAlreadyConnected: existingEchoes.some((echo) =>
          isSameSemanticNotePair(echo, sourceNoteId, String(row.id)),
        ),
      }))
      .sort((left, right) => compareCandidateOrder(selectedDay, left, right))
      .filter((candidate) => isAfterCursor(selectedDay, candidate, cursor));

    const parsedCandidates = noteEchoCandidateSchema
      .array()
      .safeParse(candidates.slice(0, safePageSize + 1));

    if (!parsedCandidates.success) {
      throw new Error(
        parsedCandidates.error.issues[0]?.message ??
          "Falha ao validar candidatas de eco.",
      );
    }

    const pageItems = parsedCandidates.data.slice(0, safePageSize);
    const hasNextPage = parsedCandidates.data.length > safePageSize;
    const lastCandidate = hasNextPage ? pageItems[pageItems.length - 1] : null;
    const page = {
      items: pageItems,
      nextCursor: lastCandidate
        ? {
            isSelectedDayGroup: lastCandidate.day === selectedDay,
            day: lastCandidate.day,
            created_at: lastCandidate.created_at,
            id: lastCandidate.id,
          }
        : null,
    };
    const parsedPage = noteEchoCandidatePageSchema.safeParse(page);

    if (!parsedPage.success) {
      throw new Error(
        parsedPage.error.issues[0]?.message ??
          "Falha ao validar pagina de candidatas.",
      );
    }

    return { ok: true, page: parsedPage.data, errorMessage: null };
  } catch (error) {
    return {
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel carregar candidatas. ${error.message}`
          : "Nao foi possivel carregar candidatas.",
    };
  }
};
