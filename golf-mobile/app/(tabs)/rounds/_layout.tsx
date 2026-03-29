import { Stack } from "expo-router";

export default function RoundsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "rgba(255,255,255,0.85)" },
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
