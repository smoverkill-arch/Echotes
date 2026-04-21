import { taskFormSchema, taskSchema } from "../../../schemas/task.schema";
import { useAuthStore } from "../../../stores/auth-store";
import type { Task, TaskFormValues } from "../../../types/task";
import { isIsoAfter } from "../../../utils/date";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";
import { buildScheduledAt } from "../utils/build-scheduled-at";

export interface CreateTaskResult {
  ok: boolean;
  task: Task | null;
  errorMessage: string | null;
}

export const SAME_DAY_TASK_ONLY_MESSAGE =
  "A US2 suporta apenas tarefas do mesmo dia selecionado.";

export const createTask = async (
  input: TaskFormValues,
): Promise<CreateTaskResult> => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    authStore.setConfigError();
    return {
      ok: false,
      task: null,
      errorMessage:
        getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.",
    };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();
    return {
      ok: false,
      task: null,
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  const parsedInput = taskFormSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      task: null,
      errorMessage:
        parsedInput.error.issues[0]?.message ?? "Informe os dados da tarefa corretamente.",
    };
  }

  if (parsedInput.data.source_day !== parsedInput.data.target_day) {
    return {
      ok: false,
      task: null,
      errorMessage: SAME_DAY_TASK_ONLY_MESSAGE,
    };
  }

  const createdAt = new Date().toISOString();
  const scheduledAt = buildScheduledAt(
    parsedInput.data.target_day,
    parsedInput.data.scheduled_time,
  );

  if (scheduledAt && !isIsoAfter(scheduledAt, createdAt)) {
    return {
      ok: false,
      task: null,
      errorMessage:
        "O horario da tarefa precisa ser estritamente posterior ao momento atual.",
    };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("tasks")
      .insert({
        user_id: authStore.session.userId,
        title: parsedInput.data.title,
        content: parsedInput.data.content || null,
        tag_id: parsedInput.data.tag_id,
        color: parsedInput.data.color,
        is_color_overridden: parsedInput.data.is_color_overridden,
        source_day: parsedInput.data.source_day,
        target_day: parsedInput.data.target_day,
        scheduled_at: scheduledAt,
        status: parsedInput.data.status,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const parsedTask = taskSchema.safeParse(data);

    if (!parsedTask.success) {
      throw new Error(parsedTask.error.issues[0]?.message ?? "Tarefa criada com formato invalido.");
    }

    return {
      ok: true,
      task: parsedTask.data,
      errorMessage: null,
    };
  } catch (error) {
    return {
      ok: false,
      task: null,
      errorMessage:
        error instanceof Error
          ? `Nao foi possivel criar a tarefa. ${error.message}`
          : "Nao foi possivel criar a tarefa.",
    };
  }
};
