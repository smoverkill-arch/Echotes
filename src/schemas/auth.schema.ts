import { z } from "zod";

import { AUTH_STATUS_VALUES } from "../types/auth";

export const authStatusSchema = z.enum(AUTH_STATUS_VALUES);

export const authCredentialsSchema = z.object({
  email: z.string().trim().email("Informe um email valido."),
  password: z.string().min(1, "A senha e obrigatoria."),
});

export const authenticatedSessionSchema = z.object({
  userId: z.string().uuid("Sessao autenticada com userId invalido."),
  email: z.string().trim().email("Sessao autenticada com email invalido."),
  accessToken: z.string().min(1, "Sessao autenticada sem access token."),
  refreshToken: z.string().min(1, "Sessao autenticada sem refresh token."),
});

export const authStateSchema = z
  .object({
    status: authStatusSchema,
    session: authenticatedSessionSchema.nullable(),
    errorMessage: z.string().nullable(),
    hasHydrated: z.boolean(),
    isRestoring: z.boolean(),
    isAuthenticated: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "authenticated" && !value.session) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Estado autenticado exige sessao valida.",
        path: ["session"],
      });
    }

    if (value.isAuthenticated && value.status !== "authenticated") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "isAuthenticated so pode ser true no estado authenticated.",
        path: ["isAuthenticated"],
      });
    }

    if (value.status === "config_error" && !value.errorMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "config_error exige mensagem explicita.",
        path: ["errorMessage"],
      });
    }
  });
