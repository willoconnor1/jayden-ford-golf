import { Stack } from "expo-router";

export default function LiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "rgba(255,255,255,0.85)" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Live Events" }} />
      <Stack.Screen
        name="[eventId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
