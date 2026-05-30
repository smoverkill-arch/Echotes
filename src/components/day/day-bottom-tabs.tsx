import { useState } from "react";
import { ListTodo, Plus, StickyNote } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "../../theme/fonts";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import { useAppearancePalette } from "../../stores/appearance-store";
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
  const palette = useAppearancePalette();
  const insets = useSafeAreaInsets();
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
          style={[styles.sheetBackdrop, { backgroundColor: "rgba(10,15,12,0.6)" }]}
          onPress={() => setIsSheetOpen(false)}
        >
          <View
            collapsable={false}
            style={[styles.sheet, { backgroundColor: palette.surface }]}
            testID="day-fab-sheet"
          >
            <View style={[styles.handle, { backgroundColor: palette.borderStrong }]} />
            <Text style={[styles.sheetTitle, { color: palette.text }]}>O que queres criar?</Text>

            <View style={styles.menu}>
              <Pressable
                accessibilityLabel="Criar nota"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderColor: palette.note,
                    backgroundColor: pressed ? palette.surfacePressed : palette.noteSoft,
                  },
                ]}
                testID="fab-create-note-button"
                onPress={handleCreateNote}
              >
                <Text style={[styles.optionLabel, { color: palette.note }]}>Criar nota</Text>
                <Text style={[styles.optionHint, { color: palette.textMuted }]}>
                  Registrar uma ideia deste dia.
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Criar tarefa"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.option,
                  {
                    borderColor: palette.task,
                    backgroundColor: pressed ? palette.surfacePressed : palette.taskSoft,
                  },
                ]}
                testID="fab-create-task-button"
                onPress={handleCreateTask}
              >
                <Text style={[styles.optionLabel, { color: palette.task }]}>Criar tarefa</Text>
                <Text style={[styles.optionHint, { color: palette.textMuted }]}>
                  Projetar uma ação no tempo.
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityLabel="Cancelar criação"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.cancelButton,
                {
                  borderColor: palette.border,
                  backgroundColor: pressed ? palette.surfacePressed : "transparent",
                },
              ]}
              testID="fab-cancel-button"
              onPress={() => setIsSheetOpen(false)}
            >
              <Text style={[styles.cancelLabel, { color: palette.textMuted }]}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      ) : null}

      <View
        accessibilityRole="tablist"
        style={[
          styles.bar,
          {
            borderColor: palette.border,
            backgroundColor: palette.surface,
            height: 68 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Ver tarefas do dia"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "tasks" }}
          style={({ pressed }) => [
            styles.tab,
            activeTab === "tasks" ? { backgroundColor: palette.surfaceMuted } : null,
            pressed ? { backgroundColor: palette.surfacePressed } : null,
          ]}
          testID="day-tab-tasks"
          onPress={() => onTabChange("tasks")}
        >
          <ListTodo
            color={activeTab === "tasks" ? palette.task : palette.textSubtle}
            size={20}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.label,
              { color: activeTab === "tasks" ? palette.task : palette.textSubtle },
            ]}
          >
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
              {
                backgroundColor: isDisabled
                  ? palette.disabled
                  : pressed
                    ? palette.primaryPressed
                    : palette.primary,
                shadowColor: palette.shadowColor,
              },
            ]}
            testID="day-fab-button"
            onPress={() => setIsSheetOpen(true)}
          >
            <Plus color={palette.primaryText} size={26} strokeWidth={2.5} />
          </Pressable>
        </View>

        <Pressable
          accessibilityLabel="Ver notas do dia"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "notes" }}
          style={({ pressed }) => [
            styles.tab,
            activeTab === "notes" ? { backgroundColor: palette.surfaceMuted } : null,
            pressed ? { backgroundColor: palette.surfacePressed } : null,
          ]}
          testID="day-tab-notes"
          onPress={() => onTabChange("notes")}
        >
          <StickyNote
            color={activeTab === "notes" ? palette.note : palette.textSubtle}
            size={20}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.label,
              { color: activeTab === "notes" ? palette.note : palette.textSubtle },
            ]}
          >
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
    borderTopWidth: 1,
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
  label: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  sheetBackdrop: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    top: -2000,
    justifyContent: "flex-end",
    zIndex: 10,
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
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
  sheetTitle: {
    fontSize: typography.title,
    fontFamily: fontFamily.display,
  },
  menu: {
    gap: spacing.sm,
  },
  option: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.bodyBold,
  },
  optionHint: {
    marginTop: spacing.xxs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
  },
  cancelButton: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodySemiBold,
  },
});
