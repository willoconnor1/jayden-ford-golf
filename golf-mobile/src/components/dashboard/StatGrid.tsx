import { View, StyleSheet } from "react-native";
import { StatCard } from "./StatCard";
import { PGA_TOUR_AVERAGES } from "@/lib/constants";
import { AggregateStats } from "@/lib/types";

interface StatGridProps {
  stats: AggregateStats;
}

export function StatGrid({ stats }: StatGridProps) {
  const cards = [
    {
      label: "Scoring Avg",
      value: stats.scoringAverage.toFixed(1),
      comparison: PGA_TOUR_AVERAGES.scoringAverage.toFixed(1),
      trendIsGood: stats.scoringAverage < PGA_TOUR_AVERAGES.scoringAverage,
    },
    {
      label: "Fairways Hit",
      value: `${stats.fairwayPercentage.toFixed(1)}%`,
      comparison: `${PGA_TOUR_AVERAGES.fairwayPercentage}%`,
      trendIsGood: stats.fairwayPercentage > PGA_TOUR_AVERAGES.fairwayPercentage,
    },
    {
      label: "Greens in Reg",
      value: `${stats.girPercentage.toFixed(1)}%`,
      comparison: `${PGA_TOUR_AVERAGES.girPercentage}%`,
      trendIsGood: stats.girPercentage > PGA_TOUR_AVERAGES.girPercentage,
    },
    {
      label: "Putts / Round",
      value: stats.puttsPerRound.toFixed(1),
      comparison: PGA_TOUR_AVERAGES.puttsPerRound.toFixed(1),
      trendIsGood: stats.puttsPerRound < PGA_TOUR_AVERAGES.puttsPerRound,
    },
    {
      label: "Putts / GIR",
      value: stats.puttsPerGir.toFixed(2),
      comparison: PGA_TOUR_AVERAGES.puttsPerGir.toFixed(2),
      trendIsGood: stats.puttsPerGir < PGA_TOUR_AVERAGES.puttsPerGir,
    },
    {
      label: "Up & Down",
      value: `${stats.upAndDownPercentage.toFixed(1)}%`,
      comparison: `${PGA_TOUR_AVERAGES.upAndDownPercentage}%`,
      trendIsGood: stats.upAndDownPercentage > PGA_TOUR_AVERAGES.upAndDownPercentage,
    },
    {
      label: "Sand Save",
      value: `${stats.sandSavePercentage.toFixed(1)}%`,
      comparison: `${PGA_TOUR_AVERAGES.sandSavePercentage}%`,
      trendIsGood: stats.sandSavePercentage > PGA_TOUR_AVERAGES.sandSavePercentage,
    },
    {
      label: "Scrambling",
      value: `${stats.scramblingPercentage.toFixed(1)}%`,
      comparison: `${PGA_TOUR_AVERAGES.scramblingPercentage}%`,
      trendIsGood: stats.scramblingPercentage > PGA_TOUR_AVERAGES.scramblingPercentage,
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <View key={card.label} style={styles.cell}>
          <StatCard
            label={card.label}
            value={card.value}
            comparison={card.comparison}
            trendIsGood={card.trendIsGood}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cell: {
    width: "48%",
    flexGrow: 1,
  },
});
