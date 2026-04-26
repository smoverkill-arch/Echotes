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
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="voce@exemplo.com"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="auth-email-input"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Sua senha"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={styles.input}
            testID="auth-password-input"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {validationMessage ? (
          <Text style={styles.validationMessage}>{validationMessage}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isButtonDisabled}
          style={({ pressed }) => [
            styles.submitButton,
            isButtonDisabled ? styles.submitButtonDisabled : null,
            pressed && !isButtonDisabled ? styles.submitButtonPressed : null,
          ]}
          testID="auth-submit-button"
          onPress={() => {
            void handleSubmit();
          }}
        >
          <Text style={styles.submitButtonLabel}>
            {isSubmitting ? "Processando..." : copy.submitLabel}
          </Text>
        </Pressable>

        <View style={styles.secondaryRow}>
          <Text style={styles.secondaryPrompt}>{copy.secondaryPrompt}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.secondaryButton}
            testID="auth-secondary-button"
            onPress={onSecondaryAction}
          >
            <Text style={styles.secondaryButtonLabel}>{copy.secondaryLabel}</Text>
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
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#6b7280",
  },
  title: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#4b5563",
  },
  fieldGroup: {
    marginTop: 18,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
  },
  validationMessage: {
    marginTop: 14,
    fontSize: 14,
    color: "#b91c1c",
  },
  submitButton: {
    marginTop: 22,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonPressed: {
    opacity: 0.92,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryPrompt: {
    fontSize: 14,
    color: "#4b5563",
  },
  secondaryButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  secondaryButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
});
