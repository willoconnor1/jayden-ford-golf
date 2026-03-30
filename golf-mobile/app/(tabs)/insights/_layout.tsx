import { Stack } from "expo-router";
import { colors } from "@/theme/colors";

export default function InsightsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Insights" }} />
      <Stack.Screen name="strokes-gained" options={{ title: "Strokes Gained" }} />
      <Stack.Screen name="goals" options={{ title: "Goals" }} />
      <Stack.Screen name="practice" options={{ title: "Practice" }} />
      <Stack.Screen name="dispersion" options={{ title: "Dispersion" }} />
    </Stack>
  );
}
