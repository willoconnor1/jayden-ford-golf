import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateEventForm } from "@/components/live/CreateEventForm";
import { JoinEventForm } from "@/components/live/JoinEventForm";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { BACKGROUNDS } from "@/lib/background-images";

type Tab = "join" | "create";

export default function LiveHome() {
  const [tab, setTab] = useState<Tab>("join");

  return (
    <View style={styles.wrapper}>
      <ScreenBackground image={BACKGROUNDS.live} />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab("join")}
          style={[styles.tab, tab === "join" && styles.activeTab]}
        >
          <Text style={[styles.tabText, tab === "join" && styles.activeTabText]}>
            Join Event
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("create")}
          style={[styles.tab, tab === "create" && styles.activeTab]}
        >
          <Text style={[styles.tabText, tab === "create" && styles.activeTabText]}>
            Create Event
          </Text>
        </Pressable>
      </View>

        <View style={styles.content}>
          {tab === "join" ? <JoinEventForm /> : <CreateEventForm />}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: { backgroundColor: "#ffffff", shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  tabText: { fontSize: 14, fontWeight: "600", color: "#9ca3af" },
  activeTabText: { color: "#111827" },
  content: { flex: 1, padding: 16, paddingBottom: 100 },
});
