import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  comparison?: string;
  trendIsGood?: boolean;
}

export function StatCard({ label, value, comparison, trendIsGood }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        {trendIsGood !== undefined && (
          <Ionicons
            name={trendIsGood ? "trending-up" : "trending-down"}
            size={16}
            color={trendIsGood ? colors.primary : colors.danger}
          />
        )}
      </View>
      {comparison && <Text style={styles.comparison}>PGA: {comparison}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  comparison: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
