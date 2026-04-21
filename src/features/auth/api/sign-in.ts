import type { AuthError } from "@supabase/supabase-js";

import { authCredentialsSchema } from "../../../schemas/auth.schema";
import { useAuthStore, mapSessionToAuthenticatedSession } from "../../../stores/auth-store";
import type { AuthActionResult, AuthCredentials } from "../../../types/auth";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

const buildAuthErrorMessage = (
  fallbackMessage: string,
  error: AuthError | Error | unknown,
) => {
  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const normalizedMessage = error.message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid_credentials")
  ) {
    return "Email ou senha invalidos.";
  }

  return `${fallbackMessage} ${error.message}`.trim();
};

export const signIn = async (
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
    const { data, error } = await getSupabaseClient().auth.signInWithPassword(
      parsedCredentials.data,
    );

    if (error) {
      throw error;
    }

    const session = mapSessionToAuthenticatedSession(data.session);

    if (!session) {
      const message =
        "Nao foi possivel iniciar a sessao. Verifique a configuracao do projeto no Supabase.";
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
    const message = buildAuthErrorMessage(
      "Nao foi possivel entrar.",
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
