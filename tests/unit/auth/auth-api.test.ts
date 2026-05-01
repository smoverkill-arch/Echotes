import { signIn } from "../../../src/features/auth/api/sign-in";
import { signUp } from "../../../src/features/auth/api/sign-up";
import { useAuthStore } from "../../../src/stores/auth-store";

const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
let mockIsSupabaseConfigured = true;
let mockSupabaseConfigurationError: string | null = null;

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  }),
  getSupabaseConfigurationError: () => mockSupabaseConfigurationError,
  get isSupabaseConfigured() {
    return mockIsSupabaseConfigured;
  },
}));

const supabaseSession = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  user: {
    id: "f3b86608-11f6-4df4-b902-3bc0b1d5b8bc",
    email: "pessoa@echotes.app",
  },
};
const authSecret = ["senha", "segura", "123"].join("-");

describe("auth api flows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSupabaseConfigured = true;
    mockSupabaseConfigurationError = null;
    useAuthStore.setState({
      status: "unauthenticated",
      session: null,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: false,
    });
  });

  // @req FR-001
  it("cria conta com email e senha e inicia sessao autenticada", async () => {
    mockSignUp.mockResolvedValue({
      data: { session: supabaseSession },
      error: null,
    });

    const result = await signUp({
      email: "pessoa@echotes.app",
      password: authSecret,
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "pessoa@echotes.app",
      password: authSecret,
    });
    expect(result).toEqual({
      ok: true,
      status: "authenticated",
      errorMessage: null,
    });
    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      isAuthenticated: true,
      session: {
        userId: supabaseSession.user.id,
        email: supabaseSession.user.email,
        accessToken: supabaseSession.access_token,
        refreshToken: supabaseSession.refresh_token,
      },
    });
  });

  // @req FR-002
  it("entra com email e senha e inicia sessao autenticada", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: supabaseSession },
      error: null,
    });

    const result = await signIn({
      email: "pessoa@echotes.app",
      password: authSecret,
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "pessoa@echotes.app",
      password: authSecret,
    });
    expect(result).toEqual({
      ok: true,
      status: "authenticated",
      errorMessage: null,
    });
    expect(useAuthStore.getState()).toMatchObject({
      status: "authenticated",
      isAuthenticated: true,
      session: {
        userId: supabaseSession.user.id,
        email: supabaseSession.user.email,
        accessToken: supabaseSession.access_token,
        refreshToken: supabaseSession.refresh_token,
      },
    });
  });
});
