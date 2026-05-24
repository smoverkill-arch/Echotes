import { useState } from "react";
import { ListTodo, Plus, StickyNote } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { DayTab } from "../../types/timeline";

interface DayBottomTabsProps {
  activeTab: DayTab;
  isDisabled?: boolean;
  onTabChange: (tab: DayTab) => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
}

export function DayBottomTabs({
  activeTab,
  isDisabled = false,
  onTabChange,
  onCreateNote,
  onCreateTask,
}: DayBottomTabsProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleCreateNote = () => {
    setIsSheetOpen(false);
    onCreateNote();
  };

  const handleCreateTask = () => {
    setIsSheetOpen(false);
    onCreateTask();
  };

  return (
    <View style={styles.wrapper}>
      {isSheetOpen ? (
        <Pressable
          accessibilityLabel="Fechar menu de criação"
          style={styles.sheetBackdrop}
          onPress={() => setIsSheetOpen(false)}
        >
          <View collapsable={false} style={styles.sheet} testID="day-fab-sheet">
            <View style={styles.handle} />
            <Text style={styles.sheetEyebrow}>Criar</Text>
            <Text style={styles.sheetTitle}>Escolha uma ação</Text>

            <View style={styles.menu}>
              <Pressable
                accessibilityLabel="Criar nota"
                accessibilityRole="button"
                style={({ pressed }) => [styles.option, styles.noteOption, pressed && styles.optionPressed]}
                testID="fab-create-note-button"
                onPress={handleCreateNote}
              >
                <Text style={styles.optionLabel}>Criar nota</Text>
                <Text style={styles.optionHint}>Registrar uma ideia deste dia.</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Criar tarefa"
                accessibilityRole="button"
                style={({ pressed }) => [styles.option, styles.taskOption, pressed && styles.optionPressed]}
                testID="fab-create-task-button"
                onPress={handleCreateTask}
              >
                <Text style={styles.optionLabel}>Criar tarefa</Text>
                <Text style={styles.optionHint}>Projetar uma ação no tempo.</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityLabel="Cancelar criação"
              accessibilityRole="button"
              style={({ pressed }) => [styles.cancelButton, pressed && styles.optionPressed]}
              testID="fab-cancel-button"
              onPress={() => setIsSheetOpen(false)}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      ) : null}

      <View accessibilityRole="tablist" style={styles.bar}>
        <Pressable
          accessibilityLabel="Ver tarefas do dia"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "tasks" }}
          style={({ pressed }) => [
            styles.tab,
            activeTab === "tasks" && styles.tabSelected,
            pressed && styles.tabPressed,
          ]}
          testID="day-tab-tasks"
          onPress={() => onTabChange("tasks")}
        >
          <ListTodo
            color={activeTab === "tasks" ? colors.task : colors.textMuted}
            size={20}
            strokeWidth={2.4}
          />
          <Text style={[styles.label, activeTab === "tasks" && styles.labelTaskSelected]}>
            TAREFAS
          </Text>
        </Pressable>

        <View style={styles.fabSlot}>
          <Pressable
            accessibilityHint="Abre o menu de criação de nota ou tarefa"
            accessibilityLabel="Criar nota ou tarefa"
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled }}
            disabled={isDisabled}
            style={({ pressed }) => [
              styles.fab,
              pressed && !isDisabled && styles.fabPressed,
              isDisabled && styles.fabDisabled,
            ]}
            testID="day-fab-button"
            onPress={() => setIsSheetOpen(true)}
          >
            <Plus color={colors.white} size={26} strokeWidth={2.5} />
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="Ver notas do dia"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "notes" }}
          style={({ pressed }) => [
            styles.tab,
            activeTab === "notes" && styles.tabSelected,
            pressed && styles.tabPressed,
          ]}
          testID="day-tab-notes"
          onPress={() => onTabChange("notes")}
        >
          <StickyNote
            color={activeTab === "notes" ? colors.note : colors.textMuted}
            size={20}
            strokeWidth={2.4}
          />
          <Text style={[styles.label, activeTab === "notes" && styles.labelNoteSelected]}>
            NOTAS
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const FAB_SIZE = 56;
const FAB_LIFT = 20;

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  bar: {
    height: 68,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    overflow: "visible",
  },
  tab: {
    flex: 1,
    minHeight: touchTarget.androidMin,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    borderRadius: radius.md,
    marginHorizontal: spacing.xs,
  },
  tabSelected: {
    backgroundColor: colors.surfaceMuted,
  },
  tabPressed: {
    backgroundColor: colors.surfacePressed,
  },
  label: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    color: colors.textMuted,
  },
  labelTaskSelected: {
    color: colors.task,
  },
  labelNoteSelected: {
    color: colors.note,
  },
  fabSlot: {
    width: FAB_SIZE + spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -(FAB_LIFT),
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPressed: {
    backgroundColor: colors.primaryPressed,
  },
  fabDisabled: {
    backgroundColor: colors.disabled,
  },
  sheetBackdrop: {
    position: "absolute",
    bottom: "100%",
    left: -spacing.xl,
    right: -spacing.xl,
    top: -2000,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23, 33, 27, 0.32)",
    zIndex: 10,
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  sheetEyebrow: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.primary,
  },
  sheetTitle: {
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.text,
  },
  menu: {
    gap: spacing.sm,
  },
  option: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteOption: {
    borderColor: colors.noteSoft,
  },
  taskOption: {
    borderColor: colors.taskSoft,
  },
  optionPressed: {
    backgroundColor: colors.surfacePressed,
  },
  optionLabel: {
    fontSize: typography.bodyLarge,
    fontWeight: "800",
    color: colors.text,
  },
  optionHint: {
    marginTop: spacing.xxs,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  cancelButton: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLabel: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
});
