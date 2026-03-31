import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { colors } from "@/theme/colors";
import { BENCHMARK_LEVELS, BENCHMARK_LABELS, BenchmarkLevel } from "@/lib/types";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [distanceUnit, setDistanceUnit] = useState<"yards" | "meters">("yards");
  const [benchmarkLevel, setBenchmarkLevel] = useState<BenchmarkLevel>("pga-tour");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, { distanceUnit, benchmarkLevel });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>J</Text>
          </View>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            Start tracking your game
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min. 8 characters)"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
          />

          <View style={styles.unitRow}>
            <Pressable
              style={[
                styles.unitButton,
                distanceUnit === "yards" && styles.unitButtonActive,
              ]}
              onPress={() => setDistanceUnit("yards")}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  distanceUnit === "yards" && styles.unitButtonTextActive,
                ]}
              >
                Yards / Feet
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.unitButton,
                distanceUnit === "meters" && styles.unitButtonActive,
              ]}
              onPress={() => setDistanceUnit("meters")}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  distanceUnit === "meters" && styles.unitButtonTextActive,
                ]}
              >
                Meters
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Compare your stats against</Text>
          <View style={styles.benchmarkGrid}>
            {BENCHMARK_LEVELS.map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.benchmarkButton,
                  benchmarkLevel === level && styles.benchmarkButtonActive,
                ]}
                onPress={() => setBenchmarkLevel(level)}
              >
                <Text
                  style={[
                    styles.benchmarkButtonText,
                    benchmarkLevel === level && styles.benchmarkButtonTextActive,
                  ]}
                >
                  {BENCHMARK_LABELS[level]}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.benchmarkHint}>
            You can change this in settings as you improve your game.
          </Text>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkBold}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  logoText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  unitRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  unitButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center" as const,
    backgroundColor: colors.inputBg,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  unitButtonTextActive: {
    color: "#fff",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginTop: 4,
  },
  benchmarkGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  benchmarkButton: {
    width: "31%" as unknown as number,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center" as const,
    backgroundColor: colors.inputBg,
  },
  benchmarkButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  benchmarkButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  benchmarkButtonTextActive: {
    color: "#fff",
  },
  benchmarkHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  linkBold: { color: colors.primary, fontWeight: "600" },
});
