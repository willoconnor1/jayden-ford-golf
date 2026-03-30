import { View, Text, Pressable, StyleSheet } from "react-native";
import { EntryMode } from "@/lib/types";
import { hapticLight } from "@/lib/platform";
import { colors } from "@/theme/colors";

interface EntryModeSelectorProps {
  value: EntryMode;
  onChange: (mode: EntryMode) => void;
}

const MODES: { value: EntryMode; title: string; subtitle: string }[] = [
  { value: "simple", title: "Simple", subtitle: "Score, fairway, GIR, putts per hole" },
  { value: "standard", title: "Standard", subtitle: "Shot-by-shot with quick pills" },
  { value: "detailed", title: "Detailed", subtitle: "Shot-by-shot + visual miss trackers" },
  { value: "voice", title: "Voice (Beta)", subtitle: "Speak your stats shot-by-shot" },
];

export function EntryModeSelector({ value, onChange }: EntryModeSelectorProps) {
  return (
    <View>
      <Text style={styles.label}>Entry Mode</Text>
      <View style={styles.row}>
        {MODES.map((mode) => {
          const isActive = value === mode.value;
          return (
            <Pressable
              key={mode.value}
              onPress={() => {
                hapticLight();
                onChange(mode.value);
              }}
              style={[
                styles.card,
                isActive && styles.cardActive,
              ]}
            >
              <Text style={[styles.title, isActive && styles.titleActive]}>
                {mode.title}
              </Text>
              <Text style={styles.subtitle}>{mode.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    width: "47%",
    flexGrow: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    gap: 4,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(107,163,214,0.12)",
  },
  title: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  titleActive: { color: colors.primary },
  subtitle: { fontSize: 10, color: colors.textMuted, textAlign: "center", lineHeight: 13 },
});
