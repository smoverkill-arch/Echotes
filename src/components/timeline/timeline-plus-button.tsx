import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";

interface TimelinePlusButtonProps {
  isSheetOpen: boolean;
  onOpenSheet: () => void;
  onCloseSheet: () => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  isDisabled?: boolean;
}

export function TimelinePlusButton({
  isSheetOpen,
  onOpenSheet,
  onCloseSheet,
  onCreateNote,
  onCreateTask,
  isDisabled = false,
}: TimelinePlusButtonProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      {isSheetOpen ? (
        <View style={styles.sheetBackdrop} testID="timeline-plus-sheet-backdrop">
          <View collapsable={false} style={styles.sheet} testID="timeline-plus-sheet">
            <View style={styles.handle} />
            <Text style={styles.sheetEyebrow}>Criar</Text>
            <Text style={styles.sheetTitle}>Escolha uma acao</Text>

            <View style={styles.menu}>
              <Pressable
                accessibilityLabel="Criar nota"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.option,
                  styles.noteOption,
                  pressed ? styles.optionPressed : null,
                ]}
                testID="timeline-create-note-button"
                onPress={onCreateNote}
              >
                <Text style={styles.optionLabel}>Criar nota</Text>
                <Text style={styles.optionHint}>Registrar uma ideia deste dia.</Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Criar tarefa"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.option,
                  styles.taskOption,
                  pressed ? styles.optionPressed : null,
                ]}
                testID="timeline-create-task-button"
                onPress={onCreateTask}
              >
                <Text style={styles.optionLabel}>Criar tarefa</Text>
                <Text style={styles.optionHint}>Projetar uma acao no tempo.</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityLabel="Cancelar criacao"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.cancelButton,
                pressed ? styles.optionPressed : null,
              ]}
              testID="timeline-plus-cancel-button"
              onPress={onCloseSheet}
            >
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityHint="Abre o menu de criação de nota ou tarefa"
        accessibilityLabel="Abrir menu de criação"
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          pressed && !isDisabled ? styles.buttonPressed : null,
          isDisabled ? styles.buttonDisabled : null,
        ]}
        testID="timeline-plus-button"
        onPress={onOpenSheet}
      >
        <Text style={styles.buttonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 4,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23, 33, 27, 0.32)",
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
  cancelLabel: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.text,
  },
  button: {
    marginRight: 0,
    marginBottom: 0,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonLabel: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "600",
    color: colors.white,
  },
});
