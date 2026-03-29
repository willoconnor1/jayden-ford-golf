import { View, Text, ScrollView, StyleSheet } from "react-native";
import { ScoreIndicator } from "@/components/ui/ScoreIndicator";
import { Card } from "@/components/ui/Card";
import { HoleData } from "@/lib/types";
import { colors } from "@/theme/colors";

interface ScorecardProps {
  holes: HoleData[];
  totalScore: number;
  totalPutts: number;
}

function NineTable({
  holes,
  startHole,
  label,
  showTotal,
  totalScore,
  totalPutts,
  totalPar,
}: {
  holes: HoleData[];
  startHole: number;
  label: string;
  showTotal?: boolean;
  totalScore?: number;
  totalPutts?: number;
  totalPar?: number;
}) {
  const ninePar = holes.reduce((s, h) => s + h.par, 0);
  const nineScore = holes.reduce((s, h) => s + h.score, 0);
  const ninePutts = holes.reduce((s, h) => s + h.putts, 0);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header row */}
        <View style={styles.tableRow}>
          <View style={styles.labelCell}>
            <Text style={styles.headerLabel}>Hole</Text>
          </View>
          {holes.map((_, i) => (
            <View key={i} style={styles.cell}>
              <Text style={styles.headerText}>{startHole + i}</Text>
            </View>
          ))}
          <View style={styles.cell}>
            <Text style={styles.headerBold}>{label}</Text>
          </View>
          {showTotal && (
            <View style={styles.cell}>
              <Text style={styles.headerBold}>Tot</Text>
            </View>
          )}
        </View>

        {/* Par row */}
        <View style={[styles.tableRow, styles.rowBorder]}>
          <View style={styles.labelCell}>
            <Text style={styles.rowLabel}>Par</Text>
          </View>
          {holes.map((h, i) => (
            <View key={i} style={styles.cell}>
              <Text style={styles.parText}>{h.par}</Text>
            </View>
          ))}
          <View style={styles.cell}>
            <Text style={styles.parBold}>{ninePar}</Text>
          </View>
          {showTotal && (
            <View style={styles.cell}>
              <Text style={styles.parBold}>{totalPar}</Text>
            </View>
          )}
        </View>

        {/* Score row */}
        <View style={[styles.tableRow, styles.rowBorder]}>
          <View style={styles.labelCell}>
            <Text style={styles.rowLabel}>Score</Text>
          </View>
          {holes.map((h, i) => (
            <View key={i} style={styles.cell}>
              <ScoreIndicator score={h.score} par={h.par} size={22} />
            </View>
          ))}
          <View style={styles.cell}>
            <Text style={styles.scoreBold}>{nineScore}</Text>
          </View>
          {showTotal && (
            <View style={styles.cell}>
              <Text style={styles.scoreBold}>{totalScore}</Text>
            </View>
          )}
        </View>

        {/* Putts row */}
        <View style={[styles.tableRow, styles.rowBorder]}>
          <View style={styles.labelCell}>
            <Text style={styles.rowLabel}>Putts</Text>
          </View>
          {holes.map((h, i) => (
            <View key={i} style={styles.cell}>
              <Text style={styles.puttText}>{h.putts}</Text>
            </View>
          ))}
          <View style={styles.cell}>
            <Text style={styles.puttBold}>{ninePutts}</Text>
          </View>
          {showTotal && (
            <View style={styles.cell}>
              <Text style={styles.puttBold}>{totalPutts}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export function Scorecard({ holes, totalScore, totalPutts }: ScorecardProps) {
  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9, 18);
  const totalPar = holes.reduce((s, h) => s + h.par, 0);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Scorecard</Text>
      <NineTable holes={front9} startHole={1} label="Out" />
      {back9.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <NineTable
            holes={back9}
            startHole={10}
            label="In"
            showTotal
            totalScore={totalScore}
            totalPutts={totalPutts}
            totalPar={totalPar}
          />
        </View>
      )}
    </Card>
  );
}

const CELL_WIDTH = 32;

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  labelCell: {
    width: 44,
    paddingVertical: 6,
  },
  cell: {
    width: CELL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  headerLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  headerText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text,
  },
  headerBold: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  rowLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  parText: {
    fontSize: 11,
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  parBold: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  scoreBold: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  puttText: {
    fontSize: 11,
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  puttBold: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
});
