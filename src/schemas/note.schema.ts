import { z } from "zod";

import { NOTE_ECHO_KIND_VALUES } from "../types/note";
import { colorSchema, dateStringSchema } from "./task.schema";

export const noteEchoKindSchema = z.enum(NOTE_ECHO_KIND_VALUES);

export const noteSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  day: dateStringSchema,
  title: z.string().trim().min(1, "Titulo e obrigatorio."),
  content: z.string().nullable(),
  brief: z.string().nullable(),
  tag_id: z.string().uuid().nullable(),
  color: colorSchema.nullable(),
  is_color_overridden: z.boolean(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export const noteFormSchema = z.object({
  title: z.string().trim().min(1, "Titulo e obrigatorio."),
  content: z.string().trim().optional().default(""),
  brief: z.string().trim().optional().default(""),
  tag_id: z.string().uuid().nullable().optional().default(null),
  color: colorSchema.nullable().optional().default(null),
  is_color_overridden: z.boolean().default(false),
  day: dateStringSchema,
});

export const noteEchoSchema = z
  .object({
    id: z.string().uuid().optional(),
    from_note_id: z.string().uuid(),
    to_note_id: z.string().uuid(),
    created_by_user_id: z.string().uuid().optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
    context_note_id: z.string().uuid().nullable().optional().default(null),
    context_day: dateStringSchema.nullable().optional().default(null),
    kind: noteEchoKindSchema,
    metadata: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  })
  .refine((echo) => echo.from_note_id !== echo.to_note_id, {
    message: "Uma nota nao pode criar eco com ela mesma.",
    path: ["to_note_id"],
  });

export const persistedNoteEchoSchema = noteEchoSchema.safeExtend({
  id: z.string().uuid(),
  created_by_user_id: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }),
});

export const createNoteEchoInputSchema = z
  .object({
    from_note_id: z.string().uuid(),
    to_note_id: z.string().uuid(),
    context_note_id: z.string().uuid().nullable().optional().default(null),
    context_day: dateStringSchema.nullable().optional().default(null),
    kind: noteEchoKindSchema.default("manual_link"),
    metadata: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  })
  .refine((echo) => echo.from_note_id !== echo.to_note_id, {
    message: "Uma nota nao pode criar eco com ela mesma.",
    path: ["to_note_id"],
  });

export const deleteNoteEchoInputSchema = z
  .object({
    echoId: z.string().uuid().optional(),
    noteIdA: z.string().uuid(),
    noteIdB: z.string().uuid(),
  })
  .refine((input) => input.noteIdA !== input.noteIdB, {
    message: "Uma nota nao pode remover eco com ela mesma.",
    path: ["noteIdB"],
  });

export const relatedNoteAvailabilitySchema = z.enum([
  "available",
  "transient_unavailable",
  "stale_detail",
]);

const relatedAvailableNoteSchema = z.object({
  id: z.string().uuid(),
  day: dateStringSchema,
  title: z.string(),
  brief: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
  kind: noteEchoKindSchema,
  echoId: z.string().uuid(),
  availability: z.literal("available"),
});

const relatedUnavailableNoteSchema = z.object({
  id: z.string().uuid(),
  day: z.null(),
  title: z.null(),
  brief: z.null(),
  created_at: z.null(),
  kind: noteEchoKindSchema,
  echoId: z.string().uuid(),
  availability: z.enum(["transient_unavailable", "stale_detail"]),
});

export const relatedNoteSchema = z.discriminatedUnion("availability", [
  relatedAvailableNoteSchema,
  relatedUnavailableNoteSchema,
]);

export const noteEchoCandidateCursorSchema = z.object({
  isSelectedDayGroup: z.boolean(),
  day: dateStringSchema,
  created_at: z.string().datetime({ offset: true }),
  id: z.string().uuid(),
});

export const noteEchoCandidateSchema = z.object({
  id: z.string().uuid(),
  day: dateStringSchema,
  title: z.string().trim().min(1, "Titulo e obrigatorio."),
  brief: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
  isAlreadyConnected: z.boolean(),
});

export const noteEchoCandidatePageSchema = z.object({
  items: noteEchoCandidateSchema.array(),
  nextCursor: noteEchoCandidateCursorSchema.nullable(),
});

export const continueNoteInputSchema = z.object({
  sourceNoteId: z.string().uuid(),
  newNoteDay: dateStringSchema,
  title: z.string().trim().min(1, "Titulo e obrigatorio."),
  generatedBrief: z.string().trim().min(1, "Briefing gerado e obrigatorio."),
  content: z.string().optional().default(""),
});
