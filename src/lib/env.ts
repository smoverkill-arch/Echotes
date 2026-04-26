import { z } from "zod";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const readEnv = (key: string) => process?.env?.[key];

const requiredString = (key: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, `${key} e obrigatoria.`),
  );

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: requiredString("EXPO_PUBLIC_SUPABASE_URL").pipe(
    z.string().url("EXPO_PUBLIC_SUPABASE_URL deve ser uma URL valida."),
  ),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: requiredString(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  ),
});

const envResult = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: readEnv("EXPO_PUBLIC_SUPABASE_URL"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
});

const buildEnvErrorMessage = () => {
  if (envResult.success) {
    return null;
  }

  const details = envResult.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  return [
    "Configuracao de ambiente invalida para o Echotes.",
    "Defina estas variaveis publicas do Supabase antes de iniciar o app:",
    "- EXPO_PUBLIC_SUPABASE_URL",
    "- EXPO_PUBLIC_SUPABASE_ANON_KEY",
    details ? `Detalhes:\n${details}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

export type Env = z.infer<typeof envSchema>;

export const envConfigErrorMessage = buildEnvErrorMessage();
export const hasEnvConfig = envResult.success;

export const getEnv = (): Env => {
  if (!envResult.success) {
    throw new Error(envConfigErrorMessage ?? "Configuracao de ambiente invalida.");
  }

  return envResult.data;
};

export const env = new Proxy({} as Env, {
  get(_target, property) {
    const resolvedEnv = getEnv();
    return resolvedEnv[property as keyof Env];
  },
});
