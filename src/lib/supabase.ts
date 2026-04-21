import "react-native-url-polyfill/auto";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import {
  SUPABASE_AUTH_STORAGE_KEY,
  sessionStorage,
} from "../features/auth/session-storage";
import { env, envConfigErrorMessage, hasEnvConfig } from "./env";

let supabaseClient: SupabaseClient | null = null;
let autoRefreshListeners = 0;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null =
  null;

export const isSupabaseConfigured = hasEnvConfig;

export const getSupabaseConfigurationError = () => envConfigErrorMessage;

export const getSupabaseClient = () => {
  if (!hasEnvConfig) {
    throw new Error(
      envConfigErrorMessage ?? "Configuracao do Supabase indisponivel.",
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(
      env.EXPO_PUBLIC_SUPABASE_URL,
      env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          storage: sessionStorage,
          storageKey: SUPABASE_AUTH_STORAGE_KEY,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );
  }

  return supabaseClient;
};

export const startSupabaseSessionAutoRefresh = () => {
  if (!hasEnvConfig) {
    return () => undefined;
  }

  const supabase = getSupabaseClient();
  autoRefreshListeners += 1;

  if (!appStateSubscription) {
    supabase.auth.startAutoRefresh();
    appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        supabase.auth.startAutoRefresh();
        return;
      }

      supabase.auth.stopAutoRefresh();
    });
  }

  return () => {
    autoRefreshListeners = Math.max(0, autoRefreshListeners - 1);

    if (autoRefreshListeners === 0) {
      supabase.auth.stopAutoRefresh();
      appStateSubscription?.remove();
      appStateSubscription = null;
    }
  };
};

export type SupabaseSession = Session;
