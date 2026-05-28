import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { authCredentialsSchema } from "../../schemas/auth.schema";
import { useAppearancePalette } from "../../stores/appearance-store";
import { radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { AuthCredentials } from "../../types/auth";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  isSubmitting: boolean;
  isDisabled?: boolean;
  onSubmit: (credentials: AuthCredentials) => Promise<void> | void;
  onSecondaryAction: () => void;
}

const copyByMode = {
  "sign-in": {
    eyebrow: "Entrar",
    title: "Acesse seu dia autenticado",
    subtitle:
      "Entre com email e senha para abrir a superficie diaria protegida do Echotes.",
    submitLabel: "Entrar",
    secondaryPrompt: "Ainda nao tem conta?",
    secondaryLabel: "Criar conta",
  },
  "sign-up": {
    eyebrow: "Criar conta",
    title: "Comece com email e senha",
    subtitle:
      "Crie sua conta para habilitar restauracao de sessao e acesso protegido ao dia.",
    submitLabel: "Criar conta",
    secondaryPrompt: "Ja possui uma conta?",
    secondaryLabel: "Entrar",
  },
} as const;

export function AuthForm({
  mode,
  isSubmitting,
  isDisabled = false,
  onSubmit,
  onSecondaryAction,
}: AuthFormProps) {
  const palette = useAppearancePalette();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const copy = copyByMode[mode];
  const isButtonDisabled = isSubmitting || isDisabled;

  const handleSubmit = async () => {
    const parsedCredentials = authCredentialsSchema.safeParse({
      email,
      password,
    });

    if (!parsedCredentials.success) {
      setValidationMessage(
        parsedCredentials.error.issues[0]?.message ??
          "Informe email e senha validos.",
      );
      return;
    }

    setValidationMessage(null);
    await onSubmit(parsedCredentials.data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.wrapper}
    >
      <View
        style={[
          styles.card,
          {
            borderColor: palette.border,
            backgroundColor: palette.surface,
            shadowColor: palette.shadowColor,
          },
        ]}
      >
        <View style={[styles.logoMark, { backgroundColor: palette.primary }]}>
          <Text style={[styles.logoLetter, { color: palette.primaryText }]}>E</Text>
        </View>
        <Text style={[styles.brand, { color: palette.text }]}>Echotes</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          O teu dia, em foco.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.primary }]}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="voce@exemplo.com"
            placeholderTextColor={palette.textSubtle}
            style={[
              styles.input,
              {
                borderColor: palette.border,
                backgroundColor: palette.surfaceMuted,
                color: palette.text,
              },
            ]}
            testID="auth-email-input"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: palette.primary }]}>Senha</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Sua senha"
            placeholderTextColor={palette.textSubtle}
            secureTextEntry
            style={[
              styles.input,
              {
                borderColor: palette.border,
                backgroundColor: palette.surfaceMuted,
                color: palette.text,
              },
            ]}
            testID="auth-password-input"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {validationMessage ? (
          <Text style={[styles.validationMessage, { color: palette.danger }]}>
            {validationMessage}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isButtonDisabled}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: isButtonDisabled
                ? palette.disabled
                : pressed
                  ? palette.primaryPressed
                  : palette.primary,
            },
          ]}
          testID="auth-submit-button"
          onPress={() => {
            void handleSubmit();
          }}
        >
          <Text style={[styles.submitButtonLabel, { color: palette.primaryText }]}>
            {isSubmitting ? "Processando..." : copy.submitLabel}
          </Text>
        </Pressable>

        <View style={styles.secondaryRow}>
          <Text style={[styles.secondaryPrompt, { color: palette.textMuted }]}>
            {copy.secondaryPrompt}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={styles.secondaryButton}
            testID="auth-secondary-button"
            onPress={onSecondaryAction}
          >
            <Text style={[styles.secondaryButtonLabel, { color: palette.primary }]}>
              {copy.secondaryLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  card: {
    width: "100%",
    borderRadius: 14,
    padding: spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  logoMark: {
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: "800",
  },
  brand: {
    marginTop: spacing.lg,
    textAlign: "center",
    fontSize: 38,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: "center",
    fontSize: typography.body,
  },
  fieldGroup: {
    marginTop: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
    fontSize: typography.eyebrow,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  input: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
  },
  validationMessage: {
    marginTop: spacing.md,
    fontSize: typography.body,
  },
  submitButton: {
    marginTop: spacing.xl,
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonLabel: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  secondaryRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryPrompt: {
    fontSize: typography.body,
  },
  secondaryButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  secondaryButtonLabel: {
    fontSize: typography.body,
    fontWeight: "800",
  },
});
