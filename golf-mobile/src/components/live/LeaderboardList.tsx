import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { hapticLight } from "@/lib/platform";
import {
  calculateLeaderboard,
  formatScoreToPar,
  formatThru,
  formatRank,
} from "@/lib/live-leaderboard";
import type { LiveEventData } from "@/lib/types";
import { colors } from "@/theme/colors";

interface LeaderboardListProps {
  data: LiveEventData;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function LeaderboardList({ data, onRefresh, refreshing }: LeaderboardListProps) {
  const router = useRouter();
  const entries = calculateLeaderboard(
    data.players,
    data.scores,
    data.event.holePars
  );

  return (
    <FlatList
      data={entries}
      keyExtractor={(e) => e.playerId}
      onRefresh={onRefresh}
      refreshing={refreshing ?? false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.headerCell, styles.rankCol]}>Pos</Text>
          <Text style={[styles.headerCell, styles.nameCol]}>Player</Text>
          <Text style={[styles.headerCell, styles.scoreCol]}>Score</Text>
          <Text style={[styles.headerCell, styles.thruCol]}>Thru</Text>
          <Text style={[styles.headerCell, styles.totalCol]}>Tot</Text>
        </View>
      }
      renderItem={({ item }) => {
        const scoreStr = formatScoreToPar(item.scoreToPar, item.thru);
        const thruStr = formatThru(item.thru);
        const rankStr = formatRank(item.rank, entries);
        const scoreColor =
          item.thru === 0
            ? colors.textMuted
            : item.scoreToPar < 0
            ? colors.birdie
            : item.scoreToPar > 0
            ? colors.info
            : colors.textSecondary;

        return (
          <Pressable
            onPress={() => {
              hapticLight();
              router.push(
                `/live/${data.event.id}/scorecard/${item.playerId}`
              );
            }}
            style={styles.row}
          >
            <Text style={[styles.cell, styles.rankCol]}>{rankStr}</Text>
            <Text style={[styles.cell, styles.nameCol]} numberOfLines={1}>
              {item.playerName}
            </Text>
            <Text
              style={[styles.cell, styles.scoreCol, { color: scoreColor, fontWeight: "700" }]}
            >
              {scoreStr || "-"}
            </Text>
            <Text style={[styles.cell, styles.thruCol]}>{thruStr}</Text>
            <Text style={[styles.cell, styles.totalCol]}>
              {item.thru > 0 ? item.totalStrokes : "-"}
            </Text>
          </Pressable>
        );
      }}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: { fontSize: 11, fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cell: { fontSize: 15, color: colors.text },
  rankCol: { width: 40 },
  nameCol: { flex: 1 },
  scoreCol: { width: 50, textAlign: "center" },
  thruCol: { width: 40, textAlign: "center", color: colors.textSecondary },
  totalCol: { width: 36, textAlign: "right", color: colors.textSecondary },
});
