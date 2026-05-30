import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuthSession } from "../src/features/auth/hooks/use-auth-session";
import { useAppearancePalette } from "../src/stores/appearance-store";

export default function IndexRoute() {
  const palette = useAppearancePalette();
  const { authStatus, isAuthenticated, isBootstrapping, protectedDayHref, signInHref } =
    useAuthSession();

  if (isBootstrapping || authStatus === "signing_out") {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="small" color={palette.textMuted} />
        <Text style={[styles.loadingText, { color: palette.textMuted }]}>
          Preparando a sessao do app...
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={protectedDayHref} />;
  }

  return <Redirect href={signInHref} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
});
