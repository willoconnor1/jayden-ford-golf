import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRoundStore } from "@/stores/round-store";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";
import { colors } from "@/theme/colors";

export default function RoundsListScreen() {
  const rounds = useRoundStore((s) => s.rounds);
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.rounds} />
      <View style={styles.container}>
        <Link href="/rounds/new" asChild>
          <Pressable style={styles.addButton}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New Round</Text>
          </Pressable>
        </Link>

        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No rounds yet. Add your first round!</Text>
          </View>
        ) : (
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const totalScore = item.holes.reduce((sum, h) => sum + h.score, 0);
              const scoreToPar = totalScore - item.course.totalPar;
              const scoreLabel =
                scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;

              return (
                <Link href={`/rounds/${item.id}`} asChild>
                  <Pressable style={styles.card}>
                    <View>
                      <Text style={styles.courseName}>{item.course.name}</Text>
                      <Text style={styles.date}>
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.score}>{totalScore}</Text>
                      <Text style={styles.scoreToPar}>{scoreLabel}</Text>
                    </View>
                  </Pressable>
                </Link>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: "center" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.surfaceGlass,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseName: { fontSize: 16, fontWeight: "600", color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  scoreContainer: { alignItems: "flex-end" },
  score: { fontSize: 24, fontWeight: "700", color: colors.text },
  scoreToPar: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
});
