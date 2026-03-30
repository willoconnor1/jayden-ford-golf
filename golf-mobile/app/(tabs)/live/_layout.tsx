import { Stack } from "expo-router";
import { colors } from "@/theme/colors";

export default function LiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
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
