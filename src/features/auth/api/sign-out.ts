import { useAuthStore } from "../../../stores/auth-store";
import type { AuthActionResult } from "../../../types/auth";
import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../../../lib/supabase";

export const signOut = async (): Promise<AuthActionResult> => {
  const authStore = useAuthStore.getState();
  const currentSession = authStore.session;

  if (!isSupabaseConfigured) {
    authStore.setConfigError();
    return {
      ok: false,
      status: "config_error",
      errorMessage:
        getSupabaseConfigurationError() ?? "Configuracao do Supabase ausente.",
    };
  }

  authStore.beginAuthTransition({
    status: "signing_out",
    isRestoring: false,
  });

  try {
    const { error } = await getSupabaseClient().auth.signOut();

    if (error) {
      throw error;
    }

    authStore.clearSession("unauthenticated");
    return {
      ok: true,
      status: "unauthenticated",
      errorMessage: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? `Nao foi possivel encerrar a sessao. ${error.message}`
        : "Nao foi possivel encerrar a sessao.";

    if (currentSession) {
      useAuthStore.setState({
        status: "authenticated",
        session: currentSession,
        isAuthenticated: true,
        isRestoring: false,
        hasHydrated: true,
        errorMessage: message,
      });
      return {
        ok: false,
        status: "authenticated",
        errorMessage: message,
      };
    }

    authStore.setAuthError(message);
    return {
      ok: false,
      status: "unauthenticated",
      errorMessage: message,
    };
  }
};
