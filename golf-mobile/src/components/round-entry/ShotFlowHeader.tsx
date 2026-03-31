import { View, Text, StyleSheet } from "react-native";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { colors } from "@/theme/colors";
import { useDistanceUnit } from "@/hooks/use-distance-unit";

interface ShotFlowHeaderProps {
  holeNumber: number;
  totalHoles: number;
  par: number;
  distance: number;
  subtitle: string;
  progress: number; // 0–1
}

export function ShotFlowHeader({
  holeNumber,
  totalHoles,
  par,
  distance,
  subtitle,
  progress,
}: ShotFlowHeaderProps) {
  const { dYards, yLabel } = useDistanceUnit();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Hole {holeNumber} of {totalHoles}
        <Text style={styles.details}> · Par {par} · {dYards(distance)} {yLabel}</Text>
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <ProgressBar value={Math.max(1, progress * 100)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  heading: { fontSize: 14, fontWeight: "600", color: colors.text },
  details: { fontWeight: "400", color: colors.textSecondary },
  subtitle: { fontSize: 12, color: colors.textSecondary },
});
