import { useAuthStore } from "../../../stores/auth-store";
import {
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export type SupabaseNoteEchoFailure =
  | "not_accessible"
  | "invalid_input"
  | "retryable_failure";

const getErrorField = (error: unknown, field: string) =>
  typeof error === "object" && error !== null && field in error
    ? (error as Record<string, unknown>)[field]
    : null;

const getErrorText = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  const message = getErrorField(error, "message");

  return typeof message === "string" ? message : "";
};

export const isUniqueViolation = (error: unknown) =>
  getErrorField(error, "code") === "23505";

export const classifySupabaseNoteEchoError = (
  error: unknown,
): SupabaseNoteEchoFailure => {
  const status = getErrorField(error, "status");
  const code = getErrorField(error, "code");
  const statusText = String(status);
  const text = getErrorText(error).toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    statusText === "401" ||
    statusText === "403" ||
    code === "401" ||
    code === "403" ||
    code === "42501" ||
    text.includes("jwt") ||
    text.includes("row-level security") ||
    text.includes("permission denied") ||
    text.includes("not authorized") ||
    text.includes("unauthorized") ||
    text.includes("forbidden")
  ) {
    return "not_accessible";
  }

  if (
    status === 400 ||
    code === "23503" ||
    code === "23502" ||
    code === "23514"
  ) {
    return "invalid_input";
  }

  return "retryable_failure";
};

export const getSupabaseNoteEchoErrorMessage = (
  prefix: string,
  error: unknown,
) =>
  getErrorText(error).length > 0 ? `${prefix} ${getErrorText(error)}` : prefix;

export const preflightNoteEchoSupabaseAccess = () => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    const message =
      getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.";
    authStore.setConfigError(message);

    return {
      ok: false as const,
      status: "not_accessible" as const,
      errorMessage: message,
    };
  }

  if (!authStore.session?.userId) {
    authStore.setSessionExpired();

    return {
      ok: false as const,
      status: "not_accessible" as const,
      errorMessage: "Sua sessao expirou. Entre novamente.",
    };
  }

  return { ok: true as const, userId: authStore.session.userId };
};
