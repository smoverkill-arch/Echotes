import { z } from "zod";

import { TASK_STATUS_VALUES } from "../types/task";
import { isValidTimeKey, TIME_KEY_ERROR_MESSAGE } from "../utils/date";

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato YYYY-MM-DD.");

export const timeStringSchema = z
  .string()
  .refine(isValidTimeKey, TIME_KEY_ERROR_MESSAGE);

export const colorSchema = z
  .string()
  .regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    "Cor invalida em hexadecimal.",
  );

export const taskStatusSchema = z.enum(TASK_STATUS_VALUES);
const optionalTimeStringSchema = z
  .preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const normalizedValue = value.trim();

    return normalizedValue === "" ? null : normalizedValue;
  }, z.union([timeStringSchema, z.null()]))
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

export const taskSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    title: z.string().trim().min(1, "Titulo e obrigatorio."),
    content: z.string().nullable(),
    tag_id: z.string().uuid().nullable(),
    color: colorSchema.nullable(),
    is_color_overridden: z.boolean(),
    source_day: dateStringSchema,
    target_day: dateStringSchema,
    created_at: z.string().datetime({ offset: true }),
    scheduled_at: z.string().datetime({ offset: true }).nullable(),
    status: taskStatusSchema,
    completed_at: z.string().datetime({ offset: true }).nullable(),
    updated_at: z.string().datetime({ offset: true }),
  })
  .superRefine((task, ctx) => {
    if (
      task.scheduled_at &&
      new Date(task.scheduled_at).getTime() <= new Date(task.created_at).getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "scheduled_at deve ser estritamente posterior a created_at.",
        path: ["scheduled_at"],
      });
    }
  });

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Titulo e obrigatorio."),
  content: z.string().trim().optional().default(""),
  tag_id: z.string().uuid().nullable().optional().default(null),
  color: colorSchema.nullable().optional().default(null),
  is_color_overridden: z.boolean().default(false),
  source_day: dateStringSchema,
  target_day: dateStringSchema,
  scheduled_time: optionalTimeStringSchema.default(null),
  status: taskStatusSchema.default("open"),
});
