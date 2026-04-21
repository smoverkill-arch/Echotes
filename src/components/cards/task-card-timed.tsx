import { StyleSheet, Text, View } from "react-native";

import type { Task } from "../../types/task";
import { extractTimePart } from "../../utils/date";

interface TaskCardTimedProps {
  task: Task;
}

export function TaskCardTimed({ task }: TaskCardTimedProps) {
  const scheduledTime = task.scheduled_at
    ? extractTimePart(task.scheduled_at).slice(0, 5)
    : null;

  return (
    <View style={styles.card} testID={`task-card-timed-${task.id}`}>
      <Text style={styles.eyebrow}>Tarefa agendada</Text>
      <Text style={styles.title}>{task.title}</Text>
      {task.content ? <Text style={styles.body}>{task.content}</Text> : null}
      <Text style={styles.footer}>
        {scheduledTime ? `Horario real: ${scheduledTime}` : "Horario nao disponivel"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
    padding: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#15803d",
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#1e293b",
  },
  footer: {
    marginTop: 10,
    fontSize: 12,
    color: "#166534",
  },
});
