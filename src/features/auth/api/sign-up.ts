import type { AuthError } from "@supabase/supabase-js";

import { authCredentialsSchema } from "../../../schemas/auth.schema";
import { useAuthStore, mapSessionToAuthenticatedSession } from "../../../stores/auth-store";
import type { AuthActionResult, AuthCredentials } from "../../../types/auth";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

const buildSignUpErrorMessage = (
  fallbackMessage: string,
  error: AuthError | Error | unknown,
) => {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const normalizedMessage = error.message.toLowerCase();

  if (normalizedMessage.includes("user already registered")) {
    return "Ja existe uma conta com este email.";
  }

  if (normalizedMessage.includes("password")) {
    return `Nao foi possivel criar a conta. ${error.message}`.trim();
  }

  return `${fallbackMessage} ${error.message}`.trim();
};

export const signUp = async (
  credentials: AuthCredentials,
): Promise<AuthActionResult> => {
  const authStore = useAuthStore.getState();

  if (!isSupabaseConfigured) {
    authStore.setConfigError();
    return {
      ok: false,
      status: "config_error",
      errorMessage:
        getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.",
    };
  }

  const parsedCredentials = authCredentialsSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    const message =
      parsedCredentials.error.issues[0]?.message ??
      "Informe email e senha validos.";
    authStore.setAuthError(message);
    return {
      ok: false,
      status: "unauthenticated",
      errorMessage: message,
    };
  }

  authStore.beginAuthTransition({
    status: "authenticating",
    isRestoring: false,
  });

  try {
    const { data, error } = await getSupabaseClient().auth.signUp(
      parsedCredentials.data,
    );

    if (error) {
      throw error;
    }

    const session = mapSessionToAuthenticatedSession(data.session);

    if (!session) {
      const message =
        "A conta foi criada, mas a sessao nao foi iniciada automaticamente. Ajuste o Auth do Supabase para login imediato com email e senha.";
      authStore.setAuthError(message);
      return {
        ok: false,
        status: "unauthenticated",
        errorMessage: message,
      };
    }

    authStore.setAuthenticatedSession(session);
    return {
      ok: true,
      status: "authenticated",
      errorMessage: null,
    };
  } catch (error) {
    const message = buildSignUpErrorMessage(
      "Nao foi possivel criar a conta.",
      error,
    );
    authStore.setAuthError(message);
    return {
      ok: false,
      status: "unauthenticated",
      errorMessage: message,
    };
  }
};
