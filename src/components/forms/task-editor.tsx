import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createTask } from "../../features/tasks/api/create-task";
import { updateTask } from "../../features/tasks/api/update-task";
import type { TemporalNavigationContext } from "../../stores/navigation-store";
import type { Task } from "../../types/task";
import { extractTimePart } from "../../utils/date";

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
  const [targetDay, setTargetDay] = useState(selectedDay);
  const [scheduledTime, setScheduledTime] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle(task?.title ?? "");
    setContent(task?.content ?? "");
    setTargetDay(task?.target_day ?? selectedDay);
    setScheduledTime(task?.scheduled_at ? extractTimePart(task.scheduled_at).slice(0, 5) : "");
    setErrorMessage(null);
  }, [selectedDay, task, visible]);

  if (!visible) {
    return null;
  }

  const persistEditedTask = async () => {
    if (!task) {
      setErrorMessage("Selecione uma tarefa valida para editar.");
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
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>
            {mode === "create" ? "Criar tarefa" : "Editar tarefa"}
          </Text>
          <Text style={styles.meta}>
            Dia de origem: {mode === "edit" && task ? task.source_day : selectedDay}
          </Text>
          {temporalContext ? (
            <Text style={styles.contextMeta}>
              Editando o item real aberto a partir de {temporalContext.sourceDate}.
            </Text>
          ) : null}

          <Text style={styles.label}>Titulo</Text>
          <TextInput
            placeholder="Titulo da tarefa"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="task-editor-title-input"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Conteudo</Text>
          <TextInput
            multiline
            placeholder="Detalhes opcionais"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="task-editor-content-input"
            value={content}
            onChangeText={setContent}
          />

          <Text style={styles.label}>Dia de destino (YYYY-MM-DD)</Text>
          <TextInput
            placeholder="Ex.: 2026-04-20"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="task-editor-target-day-input"
            value={targetDay}
            onChangeText={setTargetDay}
          />

          <Text style={styles.label}>Horario (HH:mm)</Text>
          <TextInput
            placeholder="Opcional, ex.: 18:30"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="task-editor-time-input"
            value={scheduledTime}
            onChangeText={setScheduledTime}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.secondaryButton}
              testID="task-editor-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.primaryButton}
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
  meta: {
    marginTop: 10,
    fontSize: 13,
    color: "#4b5563",
  },
  contextMeta: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#1d4ed8",
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#b91c1c",
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
