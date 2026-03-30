import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Text as SvgText, Rect } from "react-native-svg";
import { useRoundStore } from "@/stores/round-store";
import { Club, ShotLie } from "@/lib/types";
import { CLUBS, SHOT_LIES } from "@/lib/constants-clubs";
import {
  collectShots,
  calculateDispersion,
  getUsedClubs,
  getUsedLies,
} from "@/lib/stats/dispersion";
import { Card } from "@/components/ui/Card";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";
import { colors } from "@/theme/colors";

// ── Filter Pill ───────────────────────────────────────────────

function FilterPill({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterPill, active && styles.filterPillActive]}
    >
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
        {children}
      </Text>
    </Pressable>
  );
}

// ── Scatter Plot ──────────────────────────────────────────────

function ScatterPlot({
  data,
  size,
}: {
  data: { x: number; y: number }[];
  size: number;
}) {
  const padding = 40;
  const plotSize = size - padding * 2;

  if (data.length === 0) {
    return (
      <View style={[styles.plotEmpty, { height: size }]}>
        <Text style={styles.plotEmptyText}>No shots match the current filters</Text>
      </View>
    );
  }

  const maxAbs = Math.max(
    ...data.map((d) => Math.abs(d.x)),
    ...data.map((d) => Math.abs(d.y)),
    10
  );
  const scale = plotSize / 2 / maxAbs;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size}>
      {/* Background */}
      <Rect x={0} y={0} width={size} height={size} fill={colors.inputBg} rx={8} />
      {/* Grid lines */}
      <Line x1={padding} y1={cy} x2={size - padding} y2={cy} stroke={colors.border} strokeWidth={0.5} />
      <Line x1={cx} y1={padding} x2={cx} y2={size - padding} stroke={colors.border} strokeWidth={0.5} />
      {/* Crosshair */}
      <Line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={colors.textSecondary} strokeWidth={1.5} />
      <Line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke={colors.textSecondary} strokeWidth={1.5} />
      {/* Axis labels */}
      <SvgText x={size - padding + 4} y={cy + 4} fontSize={9} fill={colors.textMuted}>R</SvgText>
      <SvgText x={padding - 10} y={cy + 4} fontSize={9} fill={colors.textMuted}>L</SvgText>
      <SvgText x={cx + 4} y={padding - 4} fontSize={9} fill={colors.textMuted}>Long</SvgText>
      <SvgText x={cx + 4} y={size - padding + 14} fontSize={9} fill={colors.textMuted}>Short</SvgText>
      {/* Dots */}
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={cx + d.x * scale}
          cy={cy - d.y * scale}
          r={4.5}
          fill={colors.primary}
          fillOpacity={0.6}
          stroke={colors.primary}
          strokeWidth={0.5}
        />
      ))}
    </Svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function DispersionScreen() {
  const { width } = useWindowDimensions();
  const rounds = useRoundStore((s) => s.rounds);
  const [clubFilter, setClubFilter] = useState<Club | "all">("all");
  const [lieFilter, setLieFilter] = useState<ShotLie | "all">("all");

  const usedClubs = useMemo(() => getUsedClubs(rounds), [rounds]);
  const usedLies = useMemo(() => getUsedLies(rounds), [rounds]);
  const shots = useMemo(() => collectShots(rounds, clubFilter, lieFilter), [rounds, clubFilter, lieFilter]);
  const stats = useMemo(() => calculateDispersion(shots), [shots]);
  const scatterData = useMemo(() => shots.map((s) => ({ x: s.missX, y: s.missY })), [shots]);

  const hasShots = usedClubs.length > 0;
  const plotSize = Math.min(width - 32, 360);

  if (!hasShots) {
    return (
      <View style={styles.wrapper}>
        <ScreenBackground image={BACKGROUNDS.dispersion} />
        <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No shot data yet</Text>
          <Text style={styles.emptyText}>
            When entering a round, expand the "More" section on each hole and
            click "Track shots" to record where each shot lands relative to your
            target.
          </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.dispersion} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Club filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Club</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <FilterPill
              active={clubFilter === "all"}
              onPress={() => setClubFilter("all")}
            >
              All
            </FilterPill>
            {CLUBS.filter((c) => usedClubs.includes(c.value)).map((c) => (
              <FilterPill
                key={c.value}
                active={clubFilter === c.value}
                onPress={() => setClubFilter(c.value)}
              >
                {c.label}
              </FilterPill>
            ))}
          </ScrollView>
        </View>

        {/* Lie filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Lie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <FilterPill
              active={lieFilter === "all"}
              onPress={() => setLieFilter("all")}
            >
              All
            </FilterPill>
            {SHOT_LIES.filter((l) => usedLies.includes(l.value)).map((l) => (
              <FilterPill
                key={l.value}
                active={lieFilter === l.value}
                onPress={() => setLieFilter(l.value)}
              >
                {l.label}
              </FilterPill>
            ))}
          </ScrollView>
        </View>

        {/* Scatter Plot */}
        <Card style={styles.plotCard}>
          <View style={styles.plotHeader}>
            <Text style={styles.plotTitle}>Dispersion Pattern</Text>
            <Text style={styles.plotCount}>
              {shots.length} shot{shots.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.plotContainer}>
            <ScatterPlot data={scatterData} size={plotSize} />
          </View>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatCard label="Avg Miss" value={`${stats.avgMissDistance.toFixed(1)}ft`} />
            <StatCard label="80% Radius" value={`${stats.dispersionRadius80.toFixed(1)}ft`} />
            <StatCard
              label="Tendency"
              value={`${Math.abs(stats.avgMissX).toFixed(1)}ft ${stats.avgMissX >= 0 ? "R" : "L"}, ${Math.abs(stats.avgMissY).toFixed(1)}ft ${stats.avgMissY >= 0 ? "long" : "short"}`}
            />
            <StatCard label="Miss Left" value={`${stats.pctLeft.toFixed(0)}%`} />
            <StatCard label="Miss Right" value={`${stats.pctRight.toFixed(0)}%`} />
            <StatCard label="Avg Target" value={`${stats.avgTargetDistance.toFixed(0)} yds`} />
          </View>
        )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  // Empty
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: "center", paddingHorizontal: 32, lineHeight: 20 },
  // Filters
  filterSection: { gap: 6 },
  filterLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  filterRow: { gap: 6 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.pillInactiveBg,
    borderWidth: 1,
    borderColor: colors.pillInactiveBorder,
  },
  filterPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterPillText: { fontSize: 12, fontWeight: "500", color: colors.pillInactiveText },
  filterPillTextActive: { color: "#ffffff" },
  // Plot
  plotCard: { padding: 16 },
  plotHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  plotTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  plotCount: { fontSize: 13, color: colors.textSecondary },
  plotContainer: { alignItems: "center" },
  plotEmpty: { alignItems: "center", justifyContent: "center" },
  plotEmptyText: { fontSize: 14, color: colors.textMuted },
  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statCard: { width: "48%", padding: 12 },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
});
