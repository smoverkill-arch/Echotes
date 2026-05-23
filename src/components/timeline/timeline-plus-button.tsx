import { useEffect } from "react";
import { Plus, StickyNote, CheckSquare, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  colors,
  fontFamily,
  letterSpacing,
  lineHeight,
  radius,
  shadow,
  spacing,
  touchTarget,
  typography,
} from "../../theme/tokens";

interface TimelinePlusButtonProps {
  isSheetOpen: boolean;
  onOpenSheet: () => void;
  onCloseSheet: () => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  isDisabled?: boolean;
  isChromeVisible?: boolean;
}

export function TimelinePlusButton({
  isSheetOpen,
  onOpenSheet,
  onCloseSheet,
  onCreateNote,
  onCreateTask,
  isDisabled = false,
  isChromeVisible = true,
}: TimelinePlusButtonProps) {
  const resolvedVisibility = isChromeVisible || isSheetOpen ? 1 : 0;
  const visibility = useSharedValue(resolvedVisibility);

  useEffect(() => {
    visibility.value = withTiming(resolvedVisibility, { duration: 160 });
  }, [resolvedVisibility, visibility]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
    transform: [{ translateY: (1 - visibility.value) * 18 }],
  }));

  return (
    <Animated.View
      pointerEvents={resolvedVisibility ? "box-none" : "none"}
      style={[styles.container, animatedStyle]}
    >
      {isSheetOpen ? (
        <View style={styles.sheetBackdrop} testID="timeline-plus-sheet-backdrop">
          <View collapsable={false} style={styles.sheet} testID="timeline-plus-sheet">
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleBlock}>
                <Text style={styles.sheetEyebrow}>Registrar</Text>
                <Text style={styles.sheetTitle}>O que você quer criar?</Text>
              </View>
              <Pressable
                accessibilityLabel="Cancelar criação"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed ? styles.closeButtonPressed : null,
                ]}
                testID="timeline-plus-cancel-button"
                onPress={onCloseSheet}
              >
                <X color={colors.textMuted} size={18} strokeWidth={2} />
              </Pressable>
            </View>

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
                <View style={styles.optionIcon}>
                  <StickyNote color={colors.note} size={20} strokeWidth={2} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionLabel, styles.noteLabelColor]}>
                    Nota
                  </Text>
                  <Text style={styles.optionHint}>
                    Registre uma ideia ou pensamento do dia.
                  </Text>
                </View>
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
                <View style={styles.optionIcon}>
                  <CheckSquare color={colors.task} size={20} strokeWidth={2} />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionLabel, styles.taskLabelColor]}>
                    Tarefa
                  </Text>
                  <Text style={styles.optionHint}>
                    Projete uma ação neste ou em outro dia.
                  </Text>
                </View>
              </Pressable>
            </View>
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
        <Plus color={colors.white} size={24} strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
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
    backgroundColor: colors.overlay,
  },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sheetTitleBlock: {
    flex: 1,
  },
  sheetEyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.widest,
    color: colors.primary,
  },
  sheetTitle: {
    fontFamily: fontFamily.displayBold,
    marginTop: spacing.xs,
    fontSize: typography.title,
    lineHeight: typography.title * lineHeight.tight,
    color: colors.text,
  },
  closeButton: {
    width: touchTarget.min,
    height: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  closeButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  menu: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget.androidMin,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteOption: {
    borderColor: colors.noteBorder,
    backgroundColor: colors.noteSoft,
  },
  taskOption: {
    borderColor: colors.taskBorder,
    backgroundColor: colors.taskSoft,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.sm,
  },
  optionCopy: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: typography.bodyLarge,
    color: colors.text,
  },
  noteLabelColor: {
    color: colors.note,
  },
  taskLabelColor: {
    color: colors.task,
  },
  optionHint: {
    fontFamily: fontFamily.bodyRegular,
    marginTop: spacing.xxs,
    fontSize: typography.caption,
    lineHeight: typography.caption * lineHeight.normal,
    color: colors.textMuted,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    ...shadow.md,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
});
