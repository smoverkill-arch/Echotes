import type { Note } from "../../../types/note";

const MAX_BRIEF_LENGTH = 180;

const normalizeBriefSource = (value: string | null | undefined) =>
  value?.replace(/\s+/g, " ").trim() ?? "";

const truncateBrief = (value: string) => {
  if (value.length <= MAX_BRIEF_LENGTH) {
    return value;
  }

  const truncated = value.slice(0, MAX_BRIEF_LENGTH);
  const lastSpace = truncated.lastIndexOf(" ");
  const safeCut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;

  return safeCut.trimEnd();
};

export const buildContinueNoteBrief = (
  sourceNote: Pick<Note, "brief" | "content" | "title">,
) => {
  const briefSource =
    normalizeBriefSource(sourceNote.brief) ||
    normalizeBriefSource(sourceNote.content) ||
    `Continuidade de ${normalizeBriefSource(sourceNote.title)}`;

  return truncateBrief(briefSource);
};
