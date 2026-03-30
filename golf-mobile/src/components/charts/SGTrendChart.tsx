import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Line, Polyline, Circle, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/colors";

interface TrendPoint {
  date: string;
  Tee: number;
  App: number;
  Short: number;
  Putt: number;
}

interface SGTrendChartProps {
  data: TrendPoint[];
}

const LINE_COLORS = {
  Tee: "#3b82f6",
  App: "#f97316",
  Short: "#10b981",
  Putt: "#8b5cf6",
};

const LINE_LABELS = {
  Tee: "Tee",
  App: "Approach",
  Short: "Short Game",
  Putt: "Putting",
};

export function SGTrendChart({ data }: SGTrendChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 64; // card padding
  const chartHeight = 200;
  const paddingLeft = 36;
  const paddingRight = 12;
  const paddingTop = 16;
  const paddingBottom = 32;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Compute Y bounds
  const allValues = data.flatMap((d) => [d.Tee, d.App, d.Short, d.Putt]);
  const rawMax = Math.max(...allValues, 0.5);
  const rawMin = Math.min(...allValues, -0.5);
  const yMax = Math.ceil(rawMax * 2) / 2;
  const yMin = Math.floor(rawMin * 2) / 2;
  const yRange = yMax - yMin || 1;

  function toX(i: number) {
    return paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
  }

  function toY(val: number) {
    return paddingTop + (1 - (val - yMin) / yRange) * plotHeight;
  }

  // Grid lines (every 0.5)
  const gridValues: number[] = [];
  for (let v = yMin; v <= yMax; v += 0.5) {
    gridValues.push(Math.round(v * 10) / 10);
  }

  function buildPoints(key: keyof TrendPoint) {
    return data
      .map((d, i) => `${toX(i)},${toY(d[key] as number)}`)
      .join(" ");
  }

  const keys = ["Tee", "App", "Short", "Putt"] as const;

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {gridValues.map((v) => (
          <Line
            key={v}
            x1={paddingLeft}
            y1={toY(v)}
            x2={chartWidth - paddingRight}
            y2={toY(v)}
            stroke={v === 0 ? colors.textMuted : colors.border}
            strokeWidth={v === 0 ? 1 : 0.5}
            strokeDasharray={v === 0 ? undefined : "3,3"}
          />
        ))}

        {/* Y axis labels */}
        {gridValues
          .filter((_, i) => i % 2 === 0 || gridValues.length <= 6)
          .map((v) => (
            <SvgText
              key={`label-${v}`}
              x={paddingLeft - 6}
              y={toY(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill={colors.textMuted}
            >
              {v.toFixed(1)}
            </SvgText>
          ))}

        {/* X axis labels */}
        {data.map((d, i) => {
          // Show every Nth label to avoid overlap
          const showEvery = data.length <= 6 ? 1 : data.length <= 12 ? 2 : 3;
          if (i % showEvery !== 0 && i !== data.length - 1) return null;
          return (
            <SvgText
              key={`x-${i}`}
              x={toX(i)}
              y={chartHeight - 6}
              textAnchor="middle"
              fontSize={9}
              fill={colors.textMuted}
            >
              {d.date}
            </SvgText>
          );
        })}

        {/* Lines */}
        {keys.map((key) => (
          <Polyline
            key={key}
            points={buildPoints(key)}
            fill="none"
            stroke={LINE_COLORS[key]}
            strokeWidth={2}
          />
        ))}

        {/* Dots */}
        {keys.map((key) =>
          data.map((d, i) => (
            <Circle
              key={`${key}-${i}`}
              cx={toX(i)}
              cy={toY(d[key] as number)}
              r={2.5}
              fill={LINE_COLORS[key]}
            />
          ))
        )}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {keys.map((key) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: LINE_COLORS[key] }]} />
            <Text style={styles.legendText}>{LINE_LABELS[key]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
