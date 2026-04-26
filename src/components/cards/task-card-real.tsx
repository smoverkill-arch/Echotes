import { StyleSheet, Text, View } from "react-native";

import type { Task } from "../../types/task";

interface TaskCardRealProps {
  task: Task;
}

export function TaskCardReal({ task }: TaskCardRealProps) {
  return (
    <View style={styles.card} testID={`task-card-real-${task.id}`}>
      <Text style={styles.eyebrow}>Tarefa</Text>
      <Text style={styles.title}>{task.title}</Text>
      {task.content ? <Text style={styles.body}>{task.content}</Text> : null}
      <Text style={styles.footer}>Sem horario agendado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
    padding: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#b45309",
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
    color: "#92400e",
  },
});
