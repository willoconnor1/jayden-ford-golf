import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGoalStore } from "@/stores/goal-store";
import { useGoalProgress } from "@/hooks/use-goal-progress";
import { useStats } from "@/hooks/use-stats";
import { useStrokesGained } from "@/hooks/use-strokes-gained";
import { Goal, StatCategory } from "@/lib/types";
import { STAT_LABELS, STAT_DIRECTION, formatStat } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";
import { colors } from "@/theme/colors";
import { differenceInDays, format } from "date-fns";

// ── Goal Card Component ───────────────────────────────────────

function GoalCard({ goal }: { goal: Goal }) {
  const { currentValue, progress, isAchieved } = useGoalProgress(goal);
  const deleteGoal = useGoalStore((s) => s.deleteGoal);
  const completeGoal = useGoalStore((s) => s.completeGoal);
  const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());

  useEffect(() => {
    if (isAchieved && !goal.isCompleted) {
      completeGoal(goal.id);
    }
  }, [isAchieved, goal.isCompleted, goal.id, completeGoal]);

  return (
    <Card
      style={[styles.goalCard, goal.isCompleted && styles.goalCardCompleted]}
    >
      <View style={styles.goalHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalStat}>
            {STAT_LABELS[goal.statCategory]}
          </Text>
          <Text style={styles.goalTarget}>
            Target: {formatStat(goal.targetValue, goal.statCategory)} by{" "}
            {format(new Date(goal.targetDate), "MMM d")}
          </Text>
        </View>
        <View style={styles.goalBadges}>
          {goal.isCompleted ? (
            <View style={styles.badgeDone}>
              <Text style={styles.badgeDoneText}>Done</Text>
            </View>
          ) : daysLeft < 0 ? (
            <View style={styles.badgeOverdue}>
              <Text style={styles.badgeOverdueText}>Overdue</Text>
            </View>
          ) : (
            <View style={styles.badgeDays}>
              <Text style={styles.badgeDaysText}>{daysLeft}d</Text>
            </View>
          )}
          <Pressable
            onPress={() => {
              Alert.alert("Delete Goal", "Remove this goal?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteGoal(goal.id),
                },
              ]);
            }}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            Current: {formatStat(currentValue, goal.statCategory)}
          </Text>
          <Text style={styles.progressText}>
            Target: {formatStat(goal.targetValue, goal.statCategory)}
          </Text>
        </View>
        <ProgressBar
          value={progress}
          color={colors.primary}
        />
        <Text style={styles.progressPct}>{progress.toFixed(0)}% complete</Text>
      </View>
    </Card>
  );
}

// ── Stat Picker ───────────────────────────────────────────────

const STAT_CATEGORIES = Object.keys(STAT_LABELS) as StatCategory[];

function StatPicker({
  value,
  onChange,
}: {
  value: StatCategory;
  onChange: (v: StatCategory) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pickerRow}
    >
      {STAT_CATEGORIES.map((cat) => (
        <Pressable
          key={cat}
          onPress={() => onChange(cat)}
          style={[styles.pill, cat === value && styles.pillActive]}
        >
          <Text style={[styles.pillText, cat === value && styles.pillTextActive]}>
            {STAT_LABELS[cat]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ── Main Screen ───────────────────────────────────────────────

export default function GoalsScreen() {
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const { aggregateStats } = useStats();
  const { sgAverages } = useStrokesGained();

  const [modalVisible, setModalVisible] = useState(false);
  const [statCategory, setStatCategory] = useState<StatCategory>("fairwayPercentage");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const getCurrentValue = useCallback(
    (cat: StatCategory): number => {
      if (cat.startsWith("sg") && sgAverages) {
        return sgAverages[cat as keyof typeof sgAverages] ?? 0;
      }
      return (aggregateStats as unknown as Record<string, number>)[cat] ?? 0;
    },
    [aggregateStats, sgAverages]
  );

  const handleCreate = () => {
    if (!targetValue || !targetDate) {
      Alert.alert("Missing fields", "Please fill in target value and date.");
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      Alert.alert("Invalid date", "Please use YYYY-MM-DD format.");
      return;
    }

    const goal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      statCategory,
      targetValue: parseFloat(targetValue),
      startValue: getCurrentValue(statCategory),
      targetDate,
      direction: STAT_DIRECTION[statCategory],
      createdAt: new Date().toISOString(),
      isCompleted: false,
      completedAt: null,
    };
    addGoal(goal);
    setModalVisible(false);
    setTargetValue("");
    setTargetDate("");
  };

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.goals} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Add Goal button */}
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
          <Text style={styles.addBtnText}>New Goal</Text>
        </Pressable>

        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No goals yet. Set your first goal to start tracking progress.
            </Text>
          </View>
        )}

        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            {activeGoals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </View>
        )}

        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Completed
            </Text>
            {completedGoals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </View>
        )}
        </ScrollView>

        {/* Create Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create a Goal</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.fieldLabel}>Stat to improve</Text>
            <StatPicker value={statCategory} onChange={setStatCategory} />
            <Text style={styles.fieldHint}>
              Current: {formatStat(getCurrentValue(statCategory), statCategory)}
              {" | "}
              {STAT_DIRECTION[statCategory] === "increase"
                ? "Higher is better"
                : "Lower is better"}
            </Text>

            <Text style={styles.fieldLabel}>Target value</Text>
            <TextInput
              style={styles.input}
              value={targetValue}
              onChangeText={setTargetValue}
              placeholder={
                statCategory.startsWith("sg") ? "e.g., 0.50" : "e.g., 65"
              }
              keyboardType="decimal-pad"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Target date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="2026-06-01"
              keyboardType="numbers-and-punctuation"
              placeholderTextColor={colors.textMuted}
            />

            <Pressable style={styles.createBtn} onPress={handleCreate}>
              <Text style={styles.createBtnText}>Create Goal</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  // Add button
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  // Empty
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  // Section
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  // Goal card
  goalCard: { padding: 14, gap: 12 },
  goalCardCompleted: { borderColor: "rgba(107, 163, 214, 0.3)", backgroundColor: "rgba(107, 163, 214, 0.10)" },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  goalStat: { fontSize: 14, fontWeight: "600", color: colors.text },
  goalTarget: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  goalBadges: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeDone: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeDoneText: { fontSize: 11, fontWeight: "600", color: "#ffffff" },
  badgeOverdue: { backgroundColor: "rgba(220,38,38,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeOverdueText: { fontSize: 11, fontWeight: "600", color: colors.danger },
  badgeDays: { backgroundColor: colors.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeDaysText: { fontSize: 11, fontWeight: "600", color: colors.textSecondary },
  // Progress
  progressSection: { gap: 4 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 11, color: colors.textSecondary },
  progressPct: { fontSize: 11, color: colors.textSecondary, textAlign: "right" },
  // Picker
  pickerRow: { gap: 6, paddingVertical: 4 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.pillInactiveBg,
    borderWidth: 1,
    borderColor: colors.pillInactiveBorder,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 12, fontWeight: "500", color: colors.pillInactiveText },
  pillTextActive: { color: "#ffffff" },
  // Modal
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  modalContent: { padding: 16, gap: 12 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: colors.text, marginTop: 4 },
  fieldHint: { fontSize: 12, color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.inputBg,
  },
  createBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
});
