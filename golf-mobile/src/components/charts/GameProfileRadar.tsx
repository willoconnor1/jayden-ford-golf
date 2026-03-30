import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/colors";

interface RadarPoint {
  stat: string;
  value: number;
}

interface GameProfileRadarProps {
  data: RadarPoint[];
}

export function GameProfileRadar({ data }: GameProfileRadarProps) {
  const { width: screenWidth } = useWindowDimensions();
  const size = Math.min(screenWidth - 64, 280);
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.35;
  const n = data.length;

  // Compute max absolute value for scaling
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 0.5);

  // Angles: start from top (-90 degrees), go clockwise
  function angle(i: number) {
    return (2 * Math.PI * i) / n - Math.PI / 2;
  }

  function polarToXY(i: number, radius: number) {
    const a = angle(i);
    return {
      x: cx + radius * Math.cos(a),
      y: cy + radius * Math.sin(a),
    };
  }

  // Grid rings (3 concentric)
  const rings = [0.33, 0.66, 1.0];

  function ringPoints(scale: number) {
    return Array.from({ length: n }, (_, i) => {
      const { x, y } = polarToXY(i, outerRadius * scale);
      return `${x},${y}`;
    }).join(" ");
  }

  // Data polygon
  const dataPoints = data
    .map((d, i) => {
      const r = (Math.abs(d.value) / maxAbs) * outerRadius;
      const { x, y } = polarToXY(i, r);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Grid rings */}
        {rings.map((scale) => (
          <Polygon
            key={scale}
            points={ringPoints(scale)}
            fill="none"
            stroke={colors.border}
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const { x, y } = polarToXY(i, outerRadius);
          return (
            <Line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={colors.border}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill={colors.primary}
          fillOpacity={0.25}
          stroke={colors.primary}
          strokeWidth={2}
        />

        {/* Data dots */}
        {data.map((d, i) => {
          const r = (Math.abs(d.value) / maxAbs) * outerRadius;
          const { x, y } = polarToXY(i, r);
          return (
            <Circle key={`dot-${i}`} cx={x} cy={y} r={3} fill={colors.primary} />
          );
        })}

        {/* Axis labels */}
        {data.map((d, i) => {
          const labelRadius = outerRadius + 18;
          const { x, y } = polarToXY(i, labelRadius);
          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize={11}
              fill={colors.textSecondary}
            >
              {d.stat}
            </SvgText>
          );
        })}

        {/* Value labels at each data point */}
        {data.map((d, i) => {
          const r = (Math.abs(d.value) / maxAbs) * outerRadius;
          const valueRadius = r + 12;
          const { x, y } = polarToXY(i, valueRadius);
          return (
            <SvgText
              key={`val-${i}`}
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight="600"
              fill={d.value >= 0 ? colors.primary : colors.danger}
            >
              {d.value >= 0 ? "+" : ""}{d.value.toFixed(2)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
