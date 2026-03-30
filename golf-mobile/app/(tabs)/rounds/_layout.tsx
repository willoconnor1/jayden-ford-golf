import { Stack } from "expo-router";
import { colors } from "@/theme/colors";

export default function RoundsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Rounds" }} />
      <Stack.Screen
        name="new"
        options={{ title: "New Round", presentation: "card" }}
      />
      <Stack.Screen name="[id]" options={{ title: "Round Detail" }} />
    </Stack>
  );
}
