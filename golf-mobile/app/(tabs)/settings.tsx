import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useAuthStore } from "@/stores/auth-store";
import { useRoundStore } from "@/stores/round-store";
import { useGoalStore } from "@/stores/goal-store";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";
import { Card } from "@/components/ui/Card";
import { Round, Goal } from "@/lib/types";
import { colors } from "@/theme/colors";

interface ExportData {
  version: number;
  exportedAt: string;
  rounds: Round[];
  goals: Goal[];
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const rounds = useRoundStore((s) => s.rounds);
  const addRound = useRoundStore((s) => s.addRound);
  const clearSeedData = useRoundStore((s) => s.clearSeedData);
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const [importing, setImporting] = useState(false);

  async function handleLogout() {
    useRoundStore.getState().reset();
    useGoalStore.getState().reset();
    await logout();
  }

  async function handleExport() {
    const data: ExportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      rounds,
      goals,
    };
    const filename = `jolf-backup-${new Date().toISOString().split("T")[0]}.json`;
    const file = new File(Paths.cache, filename);
    file.write(JSON.stringify(data, null, 2));
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export Jolf Data",
    });
  }

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    setImporting(true);
    try {
      const picked = result.assets[0];
      const importedFile = new File(picked.uri);
      const text = await importedFile.text();
      const data = JSON.parse(text) as ExportData;

      if (!data.rounds || !Array.isArray(data.rounds)) {
        Alert.alert("Invalid file", "No rounds found in backup file.");
        return;
      }

      const existingIds = new Set(rounds.map((r) => r.id));
      let importedRounds = 0;
      let importedGoals = 0;

      for (const round of data.rounds) {
        if (!existingIds.has(round.id)) {
          addRound(round);
          importedRounds++;
        }
      }

      if (data.goals && Array.isArray(data.goals)) {
        const existingGoalIds = new Set(goals.map((g) => g.id));
        for (const goal of data.goals) {
          if (!existingGoalIds.has(goal.id)) {
            addGoal(goal);
            importedGoals++;
          }
        }
      }

      Alert.alert(
        "Import Complete",
        `Imported ${importedRounds} new rounds and ${importedGoals} new goals.`
      );
    } catch {
      Alert.alert("Error", "Failed to read backup file.");
    } finally {
      setImporting(false);
    }
  }

  function handleClearSeedData() {
    Alert.alert(
      "Remove Demo Data",
      "This removes the 10 pre-loaded demo rounds. Your manually entered rounds are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            clearSeedData();
            Alert.alert("Done", "Seed data removed.");
          },
        },
      ]
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.settings} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Settings</Text>

          {/* User info */}
          <Card style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name}</Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </Card>

          {/* Data Backup */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Data Backup</Text>
            <Text style={styles.description}>
              Export your rounds and goals as a JSON file for safekeeping.
              Import to restore data on a new device.
            </Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.outlineButton} onPress={handleExport}>
                <Ionicons name="download-outline" size={18} color={colors.primary} />
                <Text style={styles.outlineButtonText}>
                  Export ({rounds.length} rounds)
                </Text>
              </Pressable>
              <Pressable
                style={[styles.outlineButton, importing && styles.buttonDisabled]}
                onPress={handleImport}
                disabled={importing}
              >
                <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
                <Text style={styles.outlineButtonText}>
                  {importing ? "Importing..." : "Import Backup"}
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Demo Data */}
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Demo Data</Text>
            <Text style={styles.description}>
              Remove the 10 pre-loaded demo rounds. Your manually entered rounds
              are kept.
            </Text>
            <Pressable style={styles.dangerButton} onPress={handleClearSeedData}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={styles.dangerButtonText}>Remove Seed Data</Text>
            </Pressable>
          </Card>

          {/* Sign out */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  card: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  buttonRow: {
    gap: 10,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: colors.inputBg,
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.3)",
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: "rgba(220,38,38,0.10)",
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.danger,
  },
  logoutButton: {
    backgroundColor: "rgba(220,38,38,0.15)",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});
