import { Stack } from "expo-router";
import { colors } from "@/theme/colors";

export default function EventLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Event", headerShown: true }} />
      <Stack.Screen name="score" options={{ title: "Score Entry", headerShown: true }} />
      <Stack.Screen name="leaderboard" options={{ title: "Leaderboard", headerShown: true }} />
      <Stack.Screen name="scorecard" options={{ headerShown: false }} />
    </Stack>
  );
}
