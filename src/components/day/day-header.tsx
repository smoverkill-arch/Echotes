import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DayTab } from "../../types/timeline";

interface DayHeaderProps {
  date: string;
  email: string;
  activeTab: DayTab;
  isSigningOut: boolean;
  onTabChange: (tab: DayTab) => void;
  onSignOut: () => Promise<void> | void;
}

const TAB_LABELS: Record<DayTab, string> = {
  timeline: "Timeline",
  tasks: "Tarefas",
  notes: "Notas",
};

export function DayHeader({
  date,
  email,
  activeTab,
  isSigningOut,
  onTabChange,
  onSignOut,
}: DayHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>Superficie diaria autenticada</Text>
          <Text style={styles.title}>{date}</Text>
          <Text style={styles.subtitle}>{email}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          style={({ pressed }) => [
            styles.signOutButton,
            isSigningOut ? styles.signOutButtonDisabled : null,
            pressed && !isSigningOut ? styles.signOutButtonPressed : null,
          ]}
          testID="day-header-sign-out-button"
          onPress={() => {
            void onSignOut();
          }}
        >
          <Text style={styles.signOutLabel}>
            {isSigningOut ? "Saindo..." : "Sair"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        {(["timeline", "tasks", "notes"] as const).map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.tabButton,
              activeTab === tab ? styles.tabButtonActive : null,
              pressed ? styles.tabButtonPressed : null,
            ]}
            testID={`day-tab-${tab}`}
            onPress={() => {
              onTabChange(tab);
            }}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab ? styles.tabLabelActive : null,
              ]}
            >
              {TAB_LABELS[tab]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#6b7280",
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  signOutButton: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
  },
  signOutButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  signOutButtonPressed: {
    opacity: 0.92,
  },
  signOutLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  tabButtonPressed: {
    opacity: 0.92,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
  },
  tabLabelActive: {
    color: "#ffffff",
  },
});
