export const AUTH_STATUS_VALUES = [
  "unauthenticated",
  "authenticating",
  "authenticated",
  "signing_out",
  "session_expired",
  "config_error",
] as const;

export type AuthStatus = (typeof AUTH_STATUS_VALUES)[number];

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthenticatedSession {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthStateSnapshot {
  status: AuthStatus;
  session: AuthenticatedSession | null;
  errorMessage: string | null;
  hasHydrated: boolean;
  isRestoring: boolean;
  isAuthenticated: boolean;
}

export interface AuthActionResult {
  ok: boolean;
  status: AuthStatus;
  errorMessage: string | null;
}
