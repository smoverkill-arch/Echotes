import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useBootstrapAuthSession } from "../src/features/auth/hooks/use-auth-session";

export default function RootLayout() {
  useBootstrapAuthSession();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />
    </SafeAreaProvider>
  );
}
