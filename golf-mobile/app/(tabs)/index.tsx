import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { useRoundStore } from "@/stores/round-store";
import { useGoalStore } from "@/stores/goal-store";
import { useStats } from "@/hooks/use-stats";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { useGoalProgress } from "@/hooks/use-goal-progress";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { RecentRounds } from "@/components/dashboard/RecentRounds";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";
import { STAT_LABELS, formatStat } from "@/lib/constants";
import { Goal } from "@/lib/types";
import { differenceInDays } from "date-fns";
import { colors } from "@/theme/colors";

function GoalCard({ goal }: { goal: Goal }) {
  const { currentValue, progress } = useGoalProgress(goal);
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());

  return (
    <View style={goalStyles.row}>
      <View style={goalStyles.header}>
        <Text style={goalStyles.label} numberOfLines={1}>
          {STAT_LABELS[goal.statCategory]}
        </Text>
        <Text style={goalStyles.days}>
          {daysLeft < 0 ? "Overdue" : `${daysLeft}d left`}
        </Text>
      </View>
      <ProgressBar value={Math.max(0, Math.min(100, progress))} height={5} />
      <View style={goalStyles.footer}>
        <Text style={goalStyles.footerText}>
          {formatStat(currentValue, goal.statCategory)}
        </Text>
        <Text style={goalStyles.footerText}>
          {formatStat(goal.targetValue, goal.statCategory)}
        </Text>
      </View>
    </View>
  );
}

const goalStyles = StyleSheet.create({
  row: { marginBottom: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 12, fontWeight: "500", color: colors.text, flex: 1, marginRight: 8 },
  days: { fontSize: 10, color: colors.textMuted },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  footerText: { fontSize: 10, color: colors.textMuted },
});

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const rounds = useRoundStore((s) => s.rounds);
  const { aggregateStats, sortedRounds } = useStats();
  const { sgAverages } = useStrokesGained();
  const goals = useGoalStore((s) => s.goals);
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const firstName = user?.name?.split(" ")[0] ?? "Golfer";

  if (rounds.length === 0) {
    return (
      <View style={styles.wrapper}>
        <ScreenBackground image={BACKGROUNDS.dashboard} />
        <SafeAreaView style={styles.container}>
          <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Welcome, {firstName}</Text>
          <Text style={styles.emptySubtitle}>
            Track your rounds, analyze your strokes gained, and get personalized
            practice plans to sharpen your game.
          </Text>
          <Link href="/rounds/new" asChild>
            <Pressable style={styles.ctaButton}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.ctaText}>Log Your First Round</Text>
            </Pressable>
          </Link>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const sgItems = sgAverages
    ? [
        { label: "Tee", value: sgAverages.sgOffTheTee },
        { label: "Approach", value: sgAverages.sgApproach },
        { label: "Short Game", value: sgAverages.sgAroundTheGreen },
        { label: "Putting", value: sgAverages.sgPutting },
        { label: "Total", value: sgAverages.sgTotal, isTotal: true },
      ]
    : [];

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.dashboard} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{firstName}'s Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              {rounds.length} round{rounds.length === 1 ? "" : "s"} tracked
            </Text>
          </View>
          <Link href="/rounds/new" asChild>
            <Pressable style={styles.newRoundButton}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.newRoundText}>New Round</Text>
            </Pressable>
          </Link>
        </View>

        {/* Stat Grid */}
        <StatGrid stats={aggregateStats} />

        {/* Recent Rounds */}
        <RecentRounds rounds={sortedRounds} />

        {/* Strokes Gained Summary */}
        {sgAverages && (
          <Card style={styles.sgCard}>
            <View style={styles.sgHeader}>
              <Text style={styles.sectionTitle}>Strokes Gained</Text>
              <Link href="/insights/strokes-gained" asChild>
                <Pressable>
                  <Text style={styles.detailsLink}>Details</Text>
                </Pressable>
              </Link>
            </View>
            {sgItems.map((item) => (
              <View
                key={item.label}
                style={[styles.sgRow, item.isTotal && styles.sgTotalRow]}
              >
                <Text
                  style={[styles.sgLabel, item.isTotal && styles.sgTotalLabel]}
                >
                  {item.label}
                </Text>
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
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <Card style={styles.goalsCard}>
            <View style={styles.sgHeader}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              <Link href="/insights/goals" asChild>
                <Pressable>
                  <Text style={styles.detailsLink}>All goals</Text>
                </Pressable>
              </Link>
            </View>
            {activeGoals.slice(0, 3).map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {activeGoals.length > 3 && (
              <Text style={styles.moreGoals}>
                +{activeGoals.length - 3} more
              </Text>
            )}
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
    paddingBottom: 100,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  newRoundButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  newRoundText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#ffffff",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sgCard: {
    padding: 16,
  },
  sgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  detailsLink: {
    fontSize: 14,
    color: colors.primary,
  },
  sgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  sgTotalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  sgLabel: {
    fontSize: 14,
    color: colors.text,
  },
  sgTotalLabel: {
    fontWeight: "600",
  },
  sgValue: {
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  goalsCard: {
    padding: 16,
  },
  moreGoals: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
