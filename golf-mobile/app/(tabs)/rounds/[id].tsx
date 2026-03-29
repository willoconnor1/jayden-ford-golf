import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRoundStore } from "@/stores/round-store";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { calculateRoundStrokesGained } from "@/lib/stats/strokes-gained";
import { Scorecard } from "@/components/round-detail/Scorecard";
import { Card } from "@/components/ui/Card";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";
import { roundBadgeColor } from "@/lib/utils";
import { format } from "date-fns";
import { colors } from "@/theme/colors";
import { RoundEntryWizard } from "@/components/round-entry/RoundEntryWizard";

export default function RoundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getRound = useRoundStore((s) => s.getRound);
  const round = id === "new" ? null : getRound(id);

  // Fallback: if the router matched [id] with "new", render the wizard directly
  if (id === "new") {
    return <RoundEntryWizard />;
  }

  if (!round) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Round not found.</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Rounds</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const stats = calculateRoundStats(round);
  const sg = calculateRoundStrokesGained(round);
  const badge = roundBadgeColor(stats.scoreToPar);
  const scoreLabel =
    stats.scoreToPar === 0
      ? "Even Par"
      : stats.scoreToPar > 0
        ? `+${stats.scoreToPar}`
        : `${stats.scoreToPar}`;

  const sgItems = [
    { label: "Off the Tee", value: sg.sgOffTheTee },
    { label: "Approach", value: sg.sgApproach },
    { label: "Around the Green", value: sg.sgAroundTheGreen },
    { label: "Putting", value: sg.sgPutting },
    { label: "Total", value: sg.sgTotal },
  ];

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.roundDetail} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable style={styles.backRow} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Course name + date */}
        <Text style={styles.courseName}>{round.course.name}</Text>
        <Text style={styles.date}>
          {format(new Date(round.date), "MMM d, yyyy")}
          {round.course.tees ? ` | ${round.course.tees} tees` : ""}
        </Text>

        {/* Score hero */}
        <Card style={styles.scoreHero}>
          <Text style={styles.totalScore}>{stats.totalScore}</Text>
          <View style={[styles.scoreBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.scoreBadgeText, { color: badge.text }]}>
              {scoreLabel}
            </Text>
          </View>
        </Card>

        {/* Scorecard */}
        <Scorecard
          holes={round.holes}
          totalScore={stats.totalScore}
          totalPutts={stats.totalPutts}
        />

        {/* Stats 2x2 grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCell}>
            <Text style={styles.statLabel}>Fairways</Text>
            <Text style={styles.statValue}>
              {stats.fairwaysHit}/{stats.fairwaysAttempted}
            </Text>
            <Text style={styles.statSub}>
              {stats.fairwayPercentage.toFixed(1)}%
            </Text>
          </Card>
          <Card style={styles.statCell}>
            <Text style={styles.statLabel}>Greens in Reg</Text>
            <Text style={styles.statValue}>{stats.greensInRegulation}/18</Text>
            <Text style={styles.statSub}>
              {stats.girPercentage.toFixed(1)}%
            </Text>
          </Card>
          <Card style={styles.statCell}>
            <Text style={styles.statLabel}>Total Putts</Text>
            <Text style={styles.statValue}>{stats.totalPutts}</Text>
            <Text style={styles.statSub}>
              {stats.puttsPerGir.toFixed(2)} per GIR
            </Text>
          </Card>
          <Card style={styles.statCell}>
            <Text style={styles.statLabel}>Scrambling</Text>
            <Text style={styles.statValue}>
              {stats.scramblingPercentage.toFixed(0)}%
            </Text>
            <Text style={styles.statSub}>
              {stats.upAndDownConversions}/{stats.upAndDownAttempts} up & down
            </Text>
          </Card>
        </View>

        {/* Strokes Gained */}
        <Card style={styles.sgCard}>
          <Text style={styles.sectionTitle}>Strokes Gained vs PGA Tour</Text>
          {sgItems.map((item) => (
            <View key={item.label} style={styles.sgRow}>
              <Text style={styles.sgLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.sgValue,
                  { color: item.value >= 0 ? colors.primary : colors.danger },
                ]}
              >
                {item.value > 0 ? "+" : ""}
                {item.value.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Notes */}
          {round.notes && (
            <Card style={styles.notesCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{round.notes}</Text>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: "#ffffff",
  },
  courseName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  date: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  scoreHero: {
    alignItems: "center",
    paddingVertical: 20,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.text,
  },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCell: {
    width: "48%",
    flexGrow: 1,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  statSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sgCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },
  sgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  sgLabel: {
    fontSize: 14,
    color: colors.text,
  },
  sgValue: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  notesCard: {
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
