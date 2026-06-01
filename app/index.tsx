import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuthSession } from "../src/features/auth/hooks/use-auth-session";
import { useAppearancePalette } from "../src/stores/appearance-store";
import { useOnboardingStore } from "../src/stores/onboarding-store";

export default function IndexRoute() {
  const palette = useAppearancePalette();
  const { authStatus, isAuthenticated, isBootstrapping, signInHref } = useAuthSession();
  const onboardingSeen = useOnboardingStore((state) => state.hasSeen);
  const onboardingHydrated = useOnboardingStore((state) => state.hasHydrated);

  if (isBootstrapping || !onboardingHydrated || authStatus === "signing_out") {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="small" color={palette.textMuted} />
        <Text style={[styles.loadingText, { color: palette.textMuted }]}>
          Preparando a sessao do app...
        </Text>
      </View>
    );
  }

  if (!onboardingSeen) {
    return <Redirect href="/onboarding" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
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
