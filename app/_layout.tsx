import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useBootstrapAuthSession } from "../src/features/auth/hooks/use-auth-session";
import { appFonts } from "../src/theme/fonts";

export default function RootLayout() {
  useBootstrapAuthSession();
  const [fontsLoaded] = useFonts(appFonts);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }} />
    </SafeAreaProvider>
  );
}
