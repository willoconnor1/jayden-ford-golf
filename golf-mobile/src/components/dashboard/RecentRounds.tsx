import { View, Text, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Round } from "@/lib/types";
import { calculateRoundStats } from "@/lib/stats/calculate-stats";
import { roundBadgeColor } from "@/lib/utils";
import { format } from "date-fns";
import { colors } from "@/theme/colors";

interface RecentRoundsProps {
  rounds: Round[];
}

export function RecentRounds({ rounds }: RecentRoundsProps) {
  const recent = rounds.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Rounds</Text>
        <Link href="/rounds" asChild>
          <Pressable>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </Link>
      </View>

      {recent.map((round) => {
        const stats = calculateRoundStats(round);
        const scoreToPar = stats.scoreToPar;
        const badge = roundBadgeColor(scoreToPar);
        const scoreLabel =
          scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;

        return (
          <Link key={round.id} href={`/rounds/${round.id}`} asChild>
            <Pressable style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.courseName} numberOfLines={1}>
                  {round.course.name}
                </Text>
                <Text style={styles.date}>
                  {format(new Date(round.date), "MMM d, yyyy")}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.score}>{stats.totalScore}</Text>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {scoreLabel}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Link>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  viewAll: {
    fontSize: 14,
    color: colors.primary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  score: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
