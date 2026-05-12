import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { TemporalNavigationContext } from "../../stores/navigation-store";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
import type { Task } from "../../types/task";
import { extractTimePart, formatDisplayDay } from "../../utils/date";

interface TaskReaderProps {
  visible: boolean;
  task: Task | null;
  temporalContext: TemporalNavigationContext | null;
  onClose: () => void;
  onEdit: () => void;
}

const TASK_STATUS_LABELS: Record<Task["status"], string> = {
  open: "Aberta",
  done: "Concluida",
  cancelled: "Cancelada",
};

export function TaskReader({
  visible,
  task,
  temporalContext,
  onClose,
  onEdit,
}: TaskReaderProps) {
  if (!visible || !task) {
    return null;
  }

  const scheduledTime = task.scheduled_at
    ? extractTimePart(task.scheduled_at).slice(0, 5)
    : null;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Reader de tarefa</Text>
              <Text style={styles.title}>{task.title}</Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar tarefa"
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.closeButtonPressed : null,
              ]}
              testID="task-reader-close-icon-button"
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.bodyScroll}>
            <View style={styles.metaGrid}>
              <View style={styles.metaCard} testID="task-reader-status-chip">
                <Text style={styles.metaLabel}>Status</Text>
                <Text style={styles.metaValue}>{TASK_STATUS_LABELS[task.status]}</Text>
              </View>
              <View style={styles.metaCard} testID="task-reader-source-day-chip">
                <Text style={styles.metaLabel}>Origem</Text>
                <Text style={styles.metaValue}>{formatDisplayDay(task.source_day)}</Text>
              </View>
              <View style={styles.metaCard} testID="task-reader-target-day-chip">
                <Text style={styles.metaLabel}>Destino</Text>
                <Text style={styles.metaValue}>{formatDisplayDay(task.target_day)}</Text>
              </View>
              <View style={styles.metaCard} testID="task-reader-time-chip">
                <Text style={styles.metaLabel}>Horario</Text>
                <Text style={styles.metaValue}>{scheduledTime ?? "Sem horario"}</Text>
              </View>
            </View>

            {temporalContext ? (
              <View style={styles.contextBlock} testID="task-reader-context-meta">
                <Text style={styles.contextTitle}>Aberta a partir de ghost card</Text>
                <Text style={styles.contextText}>
                  Item real aberto a partir de {formatDisplayDay(temporalContext.sourceDate)}.
                </Text>
              </View>
            ) : null}

            {task.content ? (
              <View style={styles.contentBlock}>
                <Text style={styles.contentLabel}>Conteudo</Text>
                <Text style={styles.contentText}>{task.content}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.buttonPressed : null,
              ]}
              testID="task-reader-close-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Fechar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.primaryButtonPressed : null,
              ]}
              testID="task-reader-edit-button"
              onPress={onEdit}
            >
              <Text style={styles.primaryLabel}>Editar</Text>
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
    maxHeight: "88%",
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
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
    fontWeight: "800",
    color: colors.task,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.text,
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
    fontWeight: "800",
    color: colors.text,
  },
  bodyScroll: {
    marginTop: spacing.lg,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metaCard: {
    minWidth: "47%",
    flexGrow: 1,
    borderRadius: radius.md,
    backgroundColor: colors.taskSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  metaLabel: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.task,
  },
  metaValue: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  contextBlock: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  contextTitle: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.task,
  },
  contextText: {
    marginTop: spacing.xxs,
    fontSize: typography.body,
    color: colors.textMuted,
  },
  contentBlock: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  contentLabel: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.textMuted,
  },
  contentText: {
    marginTop: spacing.xs,
    fontSize: typography.bodyLarge,
    lineHeight: 24,
    color: colors.text,
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
    fontWeight: "700",
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
    fontWeight: "700",
    color: colors.white,
  },
  buttonPressed: {
    backgroundColor: colors.surfacePressed,
  },
});
