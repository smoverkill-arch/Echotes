describe("src/lib/env", () => {
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const originalAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    jest.resetModules();
    // Apaga as chaves no proprio process.env em vez de reatribuir o objeto:
    // reatribuir faz o @expo/env (via babel-preset-expo) recarregar o .env e
    // repor as variaveis, mascarando o caminho de erro testado aqui.
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    if (originalUrl === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    }
    if (originalAnonKey === undefined) {
      delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
    }
  });

  // @req FR-021
  // @req NFR-003
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

  // @req NFR-001
  // @req NFR-003
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
