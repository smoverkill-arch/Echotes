import { Stack } from "expo-router";

export default function DayStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="note/[id]" />
      <Stack.Screen name="task/[id]" />
    </Stack>
  );
}
