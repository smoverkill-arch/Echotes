declare const process: {
  env: Record<string, string | undefined>;
};

describe("src/lib/env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("gera falha clara quando o ambiente obrigatorio estiver ausente", () => {
    const envModule = jest.requireActual(
      "../../../src/lib/env",
    ) as typeof import("../../../src/lib/env");

    expect(envModule.hasEnvConfig).toBe(false);
    expect(envModule.envConfigErrorMessage).toContain(
      "Configuracao de ambiente invalida para o Echotes.",
    );
    expect(envModule.envConfigErrorMessage).toContain(
      "EXPO_PUBLIC_SUPABASE_URL",
    );
    expect(envModule.envConfigErrorMessage).toContain(
      "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    );
    expect(() => envModule.getEnv()).toThrow(
      /Configuracao de ambiente invalida para o Echotes\./,
    );
  });

  it("resolve o ambiente quando as variaveis publicas obrigatorias existem", () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://echotes.supabase.co";
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key";

    const envModule = jest.requireActual(
      "../../../src/lib/env",
    ) as typeof import("../../../src/lib/env");

    expect(envModule.hasEnvConfig).toBe(true);
    expect(envModule.envConfigErrorMessage).toBeNull();
    expect(envModule.getEnv()).toEqual({
      EXPO_PUBLIC_SUPABASE_URL: "https://echotes.supabase.co",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-public-key",
    });
  });
});
