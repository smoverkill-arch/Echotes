import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import {
  getSupabaseClient,
  getSupabaseConfigurationError,
  isSupabaseConfigured,
} from "../lib/supabase";
import type {
  AuthActionResult,
  AuthStateSnapshot,
  AuthStatus,
  AuthenticatedSession,
} from "../types/auth";

type AuthStore = AuthStateSnapshot & {
  hydrateSession: () => Promise<AuthActionResult>;
  startSessionSync: () => () => void;
  beginAuthTransition: (params: {
    status: Extract<AuthStatus, "authenticating" | "signing_out">;
    isRestoring?: boolean;
  }) => void;
  setAuthenticatedSession: (session: AuthenticatedSession) => void;
  clearSession: (
    status?: Extract<AuthStatus, "unauthenticated" | "session_expired">,
  ) => void;
  setAuthError: (message: string) => void;
  setConfigError: (message?: string) => void;
  setSessionExpired: (message?: string) => void;
  clearFeedback: () => void;
};

let authSyncListeners = 0;
let authSyncUnsubscribe: (() => void) | null = null;

const CONFIG_ERROR_FALLBACK_MESSAGE = "Configuracao do Supabase ausente.";
const SESSION_EXPIRED_FALLBACK_MESSAGE =
  "Sua sessao expirou. Entre novamente.";
const RESTORE_SESSION_FALLBACK_MESSAGE = "Falha ao restaurar a sessao local.";

export const mapSessionToAuthenticatedSession = (
  session: Session | null,
): AuthenticatedSession | null => {
  if (!session?.user || !session.access_token || !session.refresh_token) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
};

const buildUnauthenticatedState = (message: string | null = null) => ({
  status: "unauthenticated" as const,
  session: null,
  isAuthenticated: false,
  isRestoring: false,
  hasHydrated: true,
  errorMessage: message,
});

const buildConfigErrorState = (message?: string) => ({
  status: "config_error" as const,
  session: null,
  isAuthenticated: false,
  isRestoring: false,
  hasHydrated: true,
  errorMessage:
    message ?? getSupabaseConfigurationError() ?? CONFIG_ERROR_FALLBACK_MESSAGE,
});

const buildSessionExpiredState = (message?: string) => ({
  status: "session_expired" as const,
  session: null,
  isAuthenticated: false,
  isRestoring: false,
  hasHydrated: true,
  errorMessage: message ?? SESSION_EXPIRED_FALLBACK_MESSAGE,
});

const buildAuthenticatedState = (
  session: AuthenticatedSession,
): AuthStateSnapshot => ({
  status: "authenticated",
  session,
  isAuthenticated: true,
  isRestoring: false,
  hasHydrated: true,
  errorMessage: null,
});

const resolveSessionState = (
  session: Session | null,
): AuthStateSnapshot => {
  const mappedSession = mapSessionToAuthenticatedSession(session);

  if (mappedSession) {
    return buildAuthenticatedState(mappedSession);
  }

  return buildUnauthenticatedState();
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: isSupabaseConfigured ? "unauthenticated" : "config_error",
  session: null,
  errorMessage: isSupabaseConfigured
    ? null
    : getSupabaseConfigurationError() ?? CONFIG_ERROR_FALLBACK_MESSAGE,
  hasHydrated: false,
  isRestoring: false,
  isAuthenticated: false,

  hydrateSession: async (): Promise<AuthActionResult> => {
    if (!isSupabaseConfigured) {
      const nextState = buildConfigErrorState();
      set(nextState);
      return {
        ok: false,
        status: nextState.status,
        errorMessage: nextState.errorMessage,
      };
    }

    set({
      status: "authenticating",
      isRestoring: true,
      errorMessage: null,
    });

    try {
      const { data, error } = await getSupabaseClient().auth.getSession();

      if (error) {
        throw error;
      }

      const nextState = resolveSessionState(data.session);
      set(nextState);
      return {
        ok: nextState.status === "authenticated",
        status: nextState.status,
        errorMessage: nextState.errorMessage,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? `${RESTORE_SESSION_FALLBACK_MESSAGE} ${error.message}`
          : RESTORE_SESSION_FALLBACK_MESSAGE;
      const nextState = buildUnauthenticatedState(message);
      set(nextState);
      return {
        ok: false,
        status: nextState.status,
        errorMessage: nextState.errorMessage,
      };
    }
  },

  startSessionSync: () => {
    if (!isSupabaseConfigured) {
      return () => undefined;
    }

    authSyncListeners += 1;

      if (!authSyncUnsubscribe) {
      const {
        data: { subscription },
      } = getSupabaseClient().auth.onAuthStateChange((event, session) => {
        const currentState = get();

        if (event === "SIGNED_OUT") {
          if (currentState.status === "signing_out") {
            set(buildUnauthenticatedState());
            return;
          }

          if (currentState.status === "authenticated" || currentState.session) {
            set(buildSessionExpiredState());
            return;
          }

          set(buildUnauthenticatedState());
          return;
        }

        if (!session) {
          if (currentState.status === "authenticated" || currentState.session) {
            set(buildSessionExpiredState());
            return;
          }

          set(buildUnauthenticatedState());
          return;
        }

        set(resolveSessionState(session));
      });

      authSyncUnsubscribe = () => subscription.unsubscribe();
    }

    return () => {
      authSyncListeners = Math.max(0, authSyncListeners - 1);

      if (authSyncListeners === 0) {
        authSyncUnsubscribe?.();
        authSyncUnsubscribe = null;
      }
    };
  },

  beginAuthTransition: ({ status, isRestoring = false }) => {
    set({
      status,
      isRestoring,
      errorMessage: null,
    });
  },

  setAuthenticatedSession: (session) => {
    set(buildAuthenticatedState(session));
  },

  clearSession: (status = "unauthenticated") => {
    if (status === "session_expired") {
      set(buildSessionExpiredState());
      return;
    }

    set(buildUnauthenticatedState());
  },

  setAuthError: (message) => {
    set(buildUnauthenticatedState(message));
  },

  setConfigError: (message) => {
    set(buildConfigErrorState(message));
  },

  setSessionExpired: (message) => {
    set(buildSessionExpiredState(message));
  },

  clearFeedback: () => {
    set((state) => ({
      errorMessage: state.status === "config_error" ? state.errorMessage : null,
    }));
  },
}));
