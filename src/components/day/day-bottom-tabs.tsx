import { Clock3, ListTodo, StickyNote } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontFamily,
  letterSpacing,
  radius,
  shadow,
  spacing,
  touchTarget,
  typography,
} from "../../theme/tokens";
import type { DayTab } from "../../types/timeline";

interface DayBottomTabsProps {
  activeTab: DayTab;
  onTabChange: (tab: DayTab) => void;
}

const TAB_ITEMS = [
  { id: "timeline", label: "Timeline", Icon: Clock3 },
  { id: "tasks", label: "Tarefas", Icon: ListTodo },
  { id: "notes", label: "Notas", Icon: StickyNote },
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
              size={18}
              strokeWidth={isSelected ? 2.5 : 2}
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
    ...shadow.sm,
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
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.eyebrow,
    letterSpacing: letterSpacing.normal,
    color: colors.textMuted,
  },
  labelSelected: {
    fontFamily: fontFamily.bodyExtraBold,
    color: colors.primary,
  },
});
