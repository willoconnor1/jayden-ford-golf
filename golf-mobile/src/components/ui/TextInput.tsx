import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export function TextInput({ label, suffix, containerStyle, style, ...props }: TextInputProps) {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <RNTextInput
          style={[styles.input, suffix ? styles.inputWithSuffix : null, style]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.inputBg,
  },
  inputWithSuffix: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  suffix: {
    height: 40,
    lineHeight: 40,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
