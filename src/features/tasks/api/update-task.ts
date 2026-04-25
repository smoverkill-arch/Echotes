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

export interface UpdateTaskResult {
  ok: boolean;
  task: Task | null;
  errorMessage: string | null;
}

export const updateTask = async (
  task: Task,
  input: TaskFormValues,
): Promise<UpdateTaskResult> => {
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

  const scheduledAt = buildScheduledAt(
    parsedInput.data.target_day,
    parsedInput.data.scheduled_time,
  );

  if (scheduledAt && !isIsoAfter(scheduledAt, task.created_at)) {
    return {
      ok: false,
      task: null,
      errorMessage:
        "O horario da tarefa precisa estar no futuro no fuso local.",
    };
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("tasks")
      .update({
        title: parsedInput.data.title,
        content: parsedInput.data.content || null,
        target_day: parsedInput.data.target_day,
        scheduled_at: scheduledAt,
        status: parsedInput.data.status,
      })
      .eq("id", task.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const parsedTask = taskSchema.safeParse(data);

    if (!parsedTask.success) {
      throw new Error(parsedTask.error.issues[0]?.message ?? "Tarefa salva com formato invalido.");
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
          ? `Nao foi possivel salvar a tarefa. ${error.message}`
          : "Nao foi possivel salvar a tarefa.",
    };
  }
};
