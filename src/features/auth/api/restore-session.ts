import { useAuthStore } from "../../../stores/auth-store";
import type { AuthActionResult } from "../../../types/auth";

export const restoreSession = async (): Promise<AuthActionResult> =>
  useAuthStore.getState().hydrateSession();
