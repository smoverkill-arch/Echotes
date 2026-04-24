import { StyleSheet, Text, View } from "react-native";

import type { Task } from "../../types/task";
import { extractTimePart, formatDisplayDay } from "../../utils/date";

interface TaskCardGhostProps {
  task: Task;
}

export function TaskCardGhost({ task }: TaskCardGhostProps) {
  const scheduledTime = task.scheduled_at
    ? extractTimePart(task.scheduled_at).slice(0, 5)
    : null;

  return (
    <View style={styles.card} testID={`task-card-ghost-${task.id}`}>
      <Text style={styles.eyebrow}>Ghost card</Text>
      <Text style={styles.title}>{task.title}</Text>
      {task.content ? <Text style={styles.body}>{task.content}</Text> : null}
      <Text style={styles.footer}>
        Vai para {formatDisplayDay(task.target_day)}
        {scheduledTime ? ` as ${scheduledTime}` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#f59e0b",
    backgroundColor: "#fff7ed",
    padding: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#c2410c",
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#7c2d12",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#9a3412",
  },
  footer: {
    marginTop: 10,
    fontSize: 12,
    color: "#b45309",
  },
});
