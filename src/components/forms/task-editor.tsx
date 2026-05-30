import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createTask } from "../../features/tasks/api/create-task";
import { updateTask } from "../../features/tasks/api/update-task";
import type { TemporalNavigationContext } from "../../stores/navigation-store";
import { fontFamily } from "../../theme/fonts";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { Task } from "../../types/task";
import {
  addDaysToDayKey,
  extractTimePart,
  formatDisplayDay,
  getTodayDateKey,
  parseDisplayDayInput,
} from "../../utils/date";

interface TaskEditorProps {
  visible: boolean;
  mode: "create" | "edit";
  selectedDay: string;
  task: Task | null;
  temporalContext: TemporalNavigationContext | null;
  onClose: () => void;
  onSaved: (task: Task) => Promise<void> | void;
}

export function TaskEditor({
  visible,
  mode,
  selectedDay,
  task,
  temporalContext,
  onClose,
  onSaved,
}: TaskEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetDayInput, setTargetDayInput] = useState(formatDisplayDay(selectedDay));
  const [scheduledTime, setScheduledTime] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(task?.title ?? "");
    setContent(task?.content ?? "");
    setTargetDayInput(formatDisplayDay(task?.target_day ?? selectedDay));
    setScheduledTime(task?.scheduled_at ? extractTimePart(task.scheduled_at).slice(0, 5) : "");
    setErrorMessage(null);
  }, [selectedDay, task, visible]);

  if (!visible) {
    return null;
  }

  const originDay = mode === "edit" && task ? task.source_day : selectedDay;
  const titleLabel = mode === "create" ? "Criar tarefa" : "Editar tarefa";

  const updateTargetDayInput = (value: string) => {
    setTargetDayInput(value);
    setErrorMessage(null);
  };

  const shiftTargetDay = (amount: number) => {
    try {
      const currentTargetDay = parseDisplayDayInput(targetDayInput);
      updateTargetDayInput(formatDisplayDay(addDaysToDayKey(currentTargetDay, amount)));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Data invalida. Use o formato DD-MM-AAAA.",
      );
    }
  };

  const persistEditedTask = async () => {
    if (!task) {
      setErrorMessage("Selecione uma tarefa valida para editar.");
      return;
    }

    let targetDay: string;

    try {
      targetDay = parseDisplayDayInput(targetDayInput);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Data invalida. Use o formato DD-MM-AAAA.",
      );
      return;
    }

    const result = await updateTask(task, {
      title,
      content,
      source_day: task.source_day,
      target_day: targetDay,
      scheduled_time: scheduledTime,
      status: task.status,
      tag_id: task.tag_id,
      color: task.color,
      is_color_overridden: task.is_color_overridden,
    });

    if (!result.ok || !result.task) {
      setErrorMessage(result.errorMessage);
      return;
    }

    await onSaved(result.task);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === "create") {
        let targetDay: string;

        try {
          targetDay = parseDisplayDayInput(targetDayInput);
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Data invalida. Use o formato DD-MM-AAAA.",
          );
          return;
        }

        const result = await createTask({
          title,
          content,
          source_day: selectedDay,
          target_day: targetDay,
          scheduled_time: scheduledTime,
          status: "open",
          tag_id: null,
          color: null,
          is_color_overridden: false,
        });

        if (!result.ok || !result.task) {
          setErrorMessage(result.errorMessage);
          return;
        }

        await onSaved(result.task);
        return;
      }

      await persistEditedTask();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{titleLabel}</Text>
              <Text style={styles.title}>
                {mode === "create" ? "Nova tarefa do dia" : task?.title}
              </Text>
              <View style={styles.originRow}>
                <Text style={styles.originLabel}>Dia de origem</Text>
                <Text style={styles.originChip}>{formatDisplayDay(originDay)}</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Fechar editor de tarefa"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && !isSubmitting ? styles.closeButtonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="task-editor-close-button"
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.body}
          >
            {temporalContext ? (
              <View style={styles.contextBlock}>
                <Text style={styles.contextTitle}>Aberta a partir de ghost card</Text>
                <Text style={styles.contextText}>
                  Item real vindo de {formatDisplayDay(temporalContext.sourceDate)}.
                </Text>
              </View>
            ) : null}

            <Text style={styles.label}>Titulo</Text>
            <TextInput
              placeholder="Titulo da tarefa"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              testID="task-editor-title-input"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setErrorMessage(null);
              }}
            />

            <Text style={styles.label}>Conteudo</Text>
            <TextInput
              multiline
              placeholder="Detalhes opcionais"
              placeholderTextColor={colors.textSubtle}
              style={[styles.input, styles.multiline]}
              testID="task-editor-content-input"
              value={content}
              onChangeText={(value) => {
                setContent(value);
                setErrorMessage(null);
              }}
            />

            <Text style={styles.label}>Dia de destino</Text>
            <View style={styles.dayControls}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.dayControlButton,
                  pressed && !isSubmitting ? styles.buttonPressed : null,
                  isSubmitting ? styles.disabledButton : null,
                ]}
                testID="task-editor-previous-day-button"
                onPress={() => {
                  shiftTargetDay(-1);
                }}
              >
                <Text style={styles.dayControlLabel}>Dia anterior</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.dayControlButton,
                  pressed && !isSubmitting ? styles.buttonPressed : null,
                  isSubmitting ? styles.disabledButton : null,
                ]}
                testID="task-editor-next-day-button"
                onPress={() => {
                  shiftTargetDay(1);
                }}
              >
                <Text style={styles.dayControlLabel}>Dia seguinte</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.dayControlButton,
                  styles.todayButton,
                  pressed && !isSubmitting ? styles.todayButtonPressed : null,
                  isSubmitting ? styles.disabledButton : null,
                ]}
                testID="task-editor-today-button"
                onPress={() => {
                  updateTargetDayInput(formatDisplayDay(getTodayDateKey()));
                }}
              >
                <Text style={[styles.dayControlLabel, styles.todayButtonLabel]}>
                  Hoje
                </Text>
              </Pressable>
            </View>
            <TextInput
              placeholder="DD-MM-AAAA"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              testID="task-editor-target-day-input"
              value={targetDayInput}
              onChangeText={updateTargetDayInput}
            />

            <Text style={styles.label}>Horario</Text>
            <TextInput
              placeholder="Opcional, ex.: 18:30"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              testID="task-editor-time-input"
              value={scheduledTime}
              onChangeText={(value) => {
                setScheduledTime(value);
                setErrorMessage(null);
              }}
            />
            <Text style={styles.helperText}>Use HH:mm quando houver horario.</Text>

            {errorMessage ? (
              <View
                accessibilityRole="alert"
                style={styles.errorBlock}
                testID="task-editor-error"
              >
                <Text style={styles.errorTitle}>Nao foi possivel salvar</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !isSubmitting ? styles.buttonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="task-editor-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !isSubmitting ? styles.primaryButtonPressed : null,
                isSubmitting ? styles.disabledButton : null,
              ]}
              testID="task-editor-submit-button"
              onPress={() => {
                void handleSubmit();
              }}
            >
              <Text style={styles.primaryLabel}>
                {isSubmitting ? "Salvando..." : "Salvar tarefa"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(23, 33, 27, 0.45)",
  },
  sheet: {
    maxHeight: "94%",
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.task,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.title,
    fontFamily: fontFamily.display,
    color: colors.text,
  },
  originRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  originLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.textMuted,
  },
  originChip: {
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.taskSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    color: colors.task,
  },
  closeButton: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  closeButtonText: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  body: {
    marginTop: spacing.lg,
  },
  contextBlock: {
    borderLeftWidth: 2,
    borderLeftColor: colors.task,
    padding: spacing.md,
  },
  contextTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.task,
  },
  contextText: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    fontFamily: fontFamily.body,
    color: colors.task,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  input: {
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.body,
    color: colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  dayControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayControlButton: {
    minHeight: touchTarget.min,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  dayControlLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.text,
  },
  todayButton: {
    borderColor: colors.task,
    backgroundColor: colors.taskSoft,
  },
  todayButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  todayButtonLabel: {
    color: colors.task,
  },
  helperText: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
    color: colors.textMuted,
  },
  errorBlock: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
  },
  errorTitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.danger,
  },
  errorText: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    fontFamily: fontFamily.body,
    color: colors.danger,
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  secondaryLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodySemiBold,
    color: colors.text,
  },
  primaryButton: {
    flex: 1.25,
    minHeight: touchTarget.androidMin,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
    color: colors.white,
  },
  buttonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
