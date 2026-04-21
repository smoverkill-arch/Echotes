import { useEffect } from "react";

import { restoreSession } from "../api/restore-session";
import { startSupabaseSessionAutoRefresh } from "../../../lib/supabase";
import { useAuthStore } from "../../../stores/auth-store";
import { useCalendarStore } from "../../../stores/calendar-store";

export const useAuthSession = () => {
  const authStatus = useAuthStore((state) => state.status);
  const session = useAuthStore((state) => state.session);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const clockDate = useCalendarStore((state) => state.clockDate);

  return {
    authStatus,
    session,
    errorMessage,
    hasHydrated,
    isRestoring,
    isAuthenticated,
    selectedDate,
    clockDate,
    isBootstrapping: !hasHydrated || isRestoring,
    signInHref: "/sign-in" as const,
    signUpHref: "/sign-up" as const,
    protectedDayHref: `/day/${selectedDate}`,
  };
};

export const useBootstrapAuthSession = () => {
  const authSession = useAuthSession();

  useEffect(() => {
    useCalendarStore.getState().syncClockDate();

    void restoreSession();

    const stopSessionSync = useAuthStore.getState().startSessionSync();
    const stopAutoRefresh = startSupabaseSessionAutoRefresh();

    return () => {
      stopSessionSync();
      stopAutoRefresh();
    };
  }, []);

  return authSession;
};
