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
import { getSupabaseClient } from "../../../lib/supabase";
import {
  classifySupabaseNoteEchoError,
  getSupabaseNoteEchoErrorMessage,
  preflightNoteEchoSupabaseAccess,
  type SupabaseNoteEchoFailure,
} from "./note-echo-errors";

export interface ListNoteCandidatesInput {
  sourceNoteId: string;
  selectedDay: string;
  existingEchoes: NoteEcho[];
  cursor?: NoteEchoCandidateCursor | null;
  pageSize?: number;
}

export type ListNoteCandidatesResult =
  | {
      ok: true;
      page: NoteEchoCandidatePage;
      errorMessage: null;
      status?: never;
    }
  | {
      ok: false;
      page: { items: []; nextCursor: null };
      errorMessage: string;
      status: SupabaseNoteEchoFailure;
    };

const DEFAULT_PAGE_SIZE = 50;

interface NoteCandidateRow {
  id?: unknown;
  day?: unknown;
  title?: unknown;
  brief?: unknown;
  created_at?: unknown;
}

const mapRowToCandidate = (
  row: NoteCandidateRow,
  sourceNoteId: string,
  existingEchoes: NoteEcho[],
): NoteEchoCandidate => {
  if (
    typeof row.id !== "string" ||
    typeof row.day !== "string" ||
    typeof row.title !== "string" ||
    typeof row.created_at !== "string"
  ) {
    throw new Error("Linha de candidata com campos obrigatorios ausentes.");
  }

  const id = row.id;
  const day = row.day;
  const title = row.title;
  const created_at = row.created_at;

  return {
    id,
    day,
    title,
    brief: typeof row.brief === "string" ? row.brief : null,
    created_at,
    isAlreadyConnected: existingEchoes.some((echo) =>
      isSameSemanticNotePair(echo, sourceNoteId, id),
    ),
  };
};

const buildSameDayCursorFilter = (cursor: NoteEchoCandidateCursor) =>
  `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`;

const buildOtherDayCursorFilter = (cursor: NoteEchoCandidateCursor) =>
  [
    `day.lt.${cursor.day}`,
    `and(day.eq.${cursor.day},created_at.lt.${cursor.created_at})`,
    `and(day.eq.${cursor.day},created_at.eq.${cursor.created_at},id.lt.${cursor.id})`,
  ].join(",");

const toCursor = (
  candidate: NoteEchoCandidate,
  selectedDay: string,
): NoteEchoCandidateCursor => ({
  isSelectedDayGroup: candidate.day === selectedDay,
  day: candidate.day,
  created_at: candidate.created_at,
  id: candidate.id,
});

const buildCandidatePage = (
  candidates: NoteEchoCandidate[],
  selectedDay: string,
  pageSize: number,
) => {
  const pageItems = candidates.slice(0, pageSize);
  const lastCandidate =
    candidates.length > pageSize ? pageItems[pageItems.length - 1] : null;

  return {
    items: pageItems,
    nextCursor: lastCandidate ? toCursor(lastCandidate, selectedDay) : null,
  };
};

export const listNoteCandidates = async ({
  sourceNoteId,
  selectedDay,
  existingEchoes,
  cursor = null,
  pageSize = DEFAULT_PAGE_SIZE,
}: ListNoteCandidatesInput): Promise<ListNoteCandidatesResult> => {
  const safePageSize = Math.max(1, pageSize);
  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: preflight.errorMessage,
      status: preflight.status,
    };
  }

  try {
    const fetchGroup = async (
      isSelectedDayGroup: boolean,
      groupCursor: NoteEchoCandidateCursor | null,
      limit: number,
    ) => {
      let query = getSupabaseClient()
        .from("notes")
        .select("id,day,title,brief,created_at")
        .neq("id", sourceNoteId);

      query = isSelectedDayGroup
        ? query.eq("day", selectedDay)
        : query.neq("day", selectedDay);

      if (groupCursor?.isSelectedDayGroup === isSelectedDayGroup) {
        query = query.or(
          isSelectedDayGroup
            ? buildSameDayCursorFilter(groupCursor)
            : buildOtherDayCursorFilter(groupCursor),
        );
      }

      if (!isSelectedDayGroup) {
        query = query.order("day", { ascending: false });
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(0, limit - 1);

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) =>
        mapRowToCandidate(row, sourceNoteId, existingEchoes),
      );
    };

    const sameDayRows =
      cursor?.isSelectedDayGroup === false
        ? []
        : await fetchGroup(true, cursor, safePageSize + 1);

    const hasEnoughSameDayRows = sameDayRows.length > safePageSize;
    const otherDaysCursor =
      cursor?.isSelectedDayGroup === false ? cursor : null;
    const remainingSlots = safePageSize - sameDayRows.length + 1;

    let otherDayRows: NoteEchoCandidate[] = [];

    if (!hasEnoughSameDayRows) {
      otherDayRows = await fetchGroup(false, otherDaysCursor, remainingSlots);
    }

    const candidates = [...sameDayRows, ...otherDayRows];

    const parsedCandidates = noteEchoCandidateSchema
      .array()
      .safeParse(candidates.slice(0, safePageSize + 1));

    if (!parsedCandidates.success) {
      return {
        ok: false,
        page: { items: [], nextCursor: null },
        errorMessage:
          parsedCandidates.error.issues[0]?.message ??
          "Falha ao validar candidatas de eco.",
        status: "invalid_input",
      };
    }

    const page = buildCandidatePage(
      parsedCandidates.data,
      selectedDay,
      safePageSize,
    );
    const parsedPage = noteEchoCandidatePageSchema.safeParse(page);

    if (!parsedPage.success) {
      return {
        ok: false,
        page: { items: [], nextCursor: null },
        errorMessage:
          parsedPage.error.issues[0]?.message ??
          "Falha ao validar pagina de candidatas.",
        status: "invalid_input",
      };
    }

    return { ok: true, page: parsedPage.data, errorMessage: null };
  } catch (error) {
    return {
      ok: false,
      page: { items: [], nextCursor: null },
      errorMessage: getSupabaseNoteEchoErrorMessage(
        "Nao foi possivel carregar candidatas.",
        error,
      ),
      status: classifySupabaseNoteEchoError(error),
    };
  }
};
