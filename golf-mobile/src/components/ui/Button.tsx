import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { hapticLight } from "@/lib/platform";
import { colors } from "@/theme/colors";

type Variant = "primary" | "outline" | "ghost" | "danger";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<Variant, { bg: string; bgPressed: string; text: string; border: string }> = {
  primary: { bg: colors.primary, bgPressed: colors.primaryDark, text: "#ffffff", border: colors.primary },
  outline: { bg: "transparent", bgPressed: "rgba(255,255,255,0.08)", text: colors.text, border: colors.inputBorder },
  ghost: { bg: "transparent", bgPressed: "rgba(255,255,255,0.08)", text: colors.text, border: "transparent" },
  danger: { bg: colors.danger, bgPressed: "#b91c1c", text: "#ffffff", border: colors.danger },
};

const sizeStyles: Record<string, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: 12, fontSize: 13 },
  md: { height: 44, px: 16, fontSize: 15 },
  lg: { height: 52, px: 24, fontSize: 16 },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  size = "md",
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: disabled ? colors.disabledBg : pressed ? v.bgPressed : v.bg,
          borderWidth: 1,
          borderColor: disabled ? colors.disabledBg : v.border,
          borderRadius: 10,
          alignItems: "center" as const,
          justifyContent: "center" as const,
          flexDirection: "row" as const,
          gap: 8,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text
          style={{
            color: disabled ? colors.disabledText : v.text,
            fontSize: s.fontSize,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
