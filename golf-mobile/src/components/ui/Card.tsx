import { View, ViewProps, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface CardProps extends ViewProps {
  highlighted?: boolean;
}

export function Card({ style, highlighted, children, ...props }: CardProps) {
  return (
    <View
      style={[styles.card, highlighted && styles.highlighted, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  highlighted: {
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
