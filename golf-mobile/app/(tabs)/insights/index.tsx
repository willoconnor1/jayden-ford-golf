import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoundStore } from "@/stores/round-store";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useStats } from "@/hooks/use-stats";
import { Card } from "@/components/ui/Card";
import { colors } from "@/theme/colors";

const SECTIONS = [
  {
    href: "/insights/strokes-gained" as const,
    title: "Strokes Gained",
    description: "See where you gain and lose strokes vs PGA Tour average",
    icon: "trending-up-outline" as const,
    color: colors.primary,
    bgColor: "rgba(107,163,214,0.15)",
  },
  {
    href: "/insights/goals" as const,
    title: "Goals",
    description: "Set targets and track your improvement over time",
    icon: "flag-outline" as const,
    color: colors.info,
    bgColor: "rgba(37,99,235,0.15)",
  },
  {
    href: "/insights/practice" as const,
    title: "Practice",
    description: "Personalized practice plans based on your weaknesses",
    icon: "fitness-outline" as const,
    color: colors.warning,
    bgColor: "rgba(217,119,6,0.15)",
  },
  {
    href: "/insights/dispersion" as const,
    title: "Dispersion",
    description: "Analyze your shot patterns and miss tendencies",
    icon: "locate-outline" as const,
    color: colors.violet,
    bgColor: "rgba(124,58,237,0.15)",
  },
];

export default function InsightsHub() {
  const rounds = useRoundStore((s) => s.rounds);
  const { sgAverages } = useStrokesGained();
  const { aggregateStats } = useStats();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Quick summary */}
        {rounds.length > 0 && (
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Rounds</Text>
              <Text style={styles.summaryValue}>{rounds.length}</Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Scoring Avg</Text>
              <Text style={styles.summaryValue}>
                {aggregateStats.scoringAverage > 0
                  ? aggregateStats.scoringAverage.toFixed(1)
                  : "\u2014"}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total SG</Text>
              <Text
                style={[
                  styles.summaryValue,
                  sgAverages
                    ? { color: sgAverages.sgTotal >= 0 ? colors.primary : colors.danger }
                    : undefined,
                ]}
              >
                {sgAverages
                  ? `${sgAverages.sgTotal >= 0 ? "+" : ""}${sgAverages.sgTotal.toFixed(2)}`
                  : "\u2014"}
              </Text>
            </Card>
          </View>
        )}

        {/* Section cards */}
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} asChild>
            <Pressable>
              <Card style={styles.sectionCard}>
                <View style={[styles.iconCircle, { backgroundColor: section.bgColor }]}>
                  <Ionicons name={section.icon} size={24} color={section.color} />
                </View>
                <View style={styles.sectionText}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionDesc}>{section.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Card>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 100, gap: 12 },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  summaryCard: { flex: 1, padding: 12, alignItems: "center" },
  summaryLabel: { fontSize: 11, fontWeight: "500", color: colors.textSecondary, marginBottom: 2 },
  summaryValue: { fontSize: 18, fontWeight: "700", color: colors.text },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionText: { flex: 1, gap: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  sectionDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
});
