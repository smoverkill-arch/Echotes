import { Clock3, ListTodo, StickyNote } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { DayTab } from "../../types/timeline";

interface DayBottomTabsProps {
  activeTab: DayTab;
  onTabChange: (tab: DayTab) => void;
}

const TAB_ITEMS = [
  { id: "timeline", label: "TIME LINE", Icon: Clock3 },
  { id: "tasks", label: "TAREFAS", Icon: ListTodo },
  { id: "notes", label: "NOTAS", Icon: StickyNote },
] as const;

export function DayBottomTabs({ activeTab, onTabChange }: DayBottomTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {TAB_ITEMS.map(({ id, label, Icon }) => {
        const isSelected = activeTab === id;

        return (
          <Pressable
            key={id}
            accessibilityLabel={`Ver ${label.toLowerCase()} do dia selecionado`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.tab,
              isSelected ? styles.tabSelected : null,
              pressed ? styles.tabPressed : null,
            ]}
            testID={`day-tab-${id}`}
            onPress={() => {
              onTabChange(id);
            }}
          >
            <Icon
              color={isSelected ? colors.primary : colors.textMuted}
              size={20}
              strokeWidth={2.4}
            />
            <Text style={[styles.label, isSelected ? styles.labelSelected : null]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  tabSelected: {
    backgroundColor: colors.primarySoft,
  },
  tabPressed: {
    backgroundColor: colors.surfacePressed,
  },
  label: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    color: colors.textMuted,
  },
  labelSelected: {
    color: colors.primary,
  },
});
