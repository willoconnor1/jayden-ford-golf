import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  color = colors.primary,
  trackColor = "rgba(255,255,255,0.10)",
  height = 6,
  style,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${clamped}%`,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {},
});
