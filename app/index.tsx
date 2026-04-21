import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuthSession } from "../src/features/auth/hooks/use-auth-session";

export default function IndexRoute() {
  const { authStatus, isAuthenticated, isBootstrapping, protectedDayHref, signInHref } =
    useAuthSession();

  if (isBootstrapping || authStatus === "signing_out") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#111827" />
        <Text style={styles.loadingText}>Preparando a sessao do app...</Text>
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
    backgroundColor: "#f7f8fb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
