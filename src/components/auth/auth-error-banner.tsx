import { StyleSheet, Text, View } from "react-native";

import type { AuthStatus } from "../../types/auth";

interface AuthErrorBannerProps {
  status: AuthStatus;
  message: string | null;
}

const titleByStatus: Record<AuthStatus, string> = {
  unauthenticated: "Falha de autenticacao",
  authenticating: "Autenticando",
  authenticated: "Sessao ativa",
  signing_out: "Encerrando sessao",
  session_expired: "Sessao expirada",
  config_error: "Configuracao ausente",
};

const isVisibleStatus = (status: AuthStatus) =>
  status === "config_error" ||
  status === "session_expired" ||
  status === "unauthenticated";

export function AuthErrorBanner({
  status,
  message,
}: AuthErrorBannerProps) {
  if (!message || !isVisibleStatus(status)) {
    return null;
  }

  return (
    <View style={styles.container} testID="auth-error-banner">
      <Text style={styles.title}>{titleByStatus[status]}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
    padding: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#b91c1c",
  },
  message: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#7f1d1d",
  },
});
