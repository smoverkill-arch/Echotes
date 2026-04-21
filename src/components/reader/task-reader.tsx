import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { TemporalNavigationContext } from "../../stores/navigation-store";
import type { Task } from "../../types/task";
import { extractTimePart } from "../../utils/date";

interface TaskReaderProps {
  visible: boolean;
  task: Task | null;
  temporalContext: TemporalNavigationContext | null;
  onClose: () => void;
  onEdit: () => void;
}

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
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>Reader de tarefa</Text>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.meta}>Status: {task.status}</Text>
          <Text style={styles.meta}>Dia de origem: {task.source_day}</Text>
          <Text style={styles.meta}>Dia de destino: {task.target_day}</Text>
          {temporalContext ? (
            <Text style={styles.contextMeta} testID="task-reader-context-meta">
              Item real aberto a partir do ghost card de {temporalContext.sourceDate}.
            </Text>
          ) : null}
          {scheduledTime ? (
            <Text style={styles.meta}>Horario: {scheduledTime}</Text>
          ) : null}
          {task.content ? <Text style={styles.body}>{task.content}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={styles.secondaryButton}
              testID="task-reader-close-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Fechar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
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
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    padding: 24,
  },
  sheet: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#6b7280",
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: "#4b5563",
  },
  contextMeta: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
    color: "#1d4ed8",
  },
  body: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#1f2937",
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
