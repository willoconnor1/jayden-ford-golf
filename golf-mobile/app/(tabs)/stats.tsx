import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Strokes Gained</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
});
