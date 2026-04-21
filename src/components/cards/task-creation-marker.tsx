import { StyleSheet, Text, View } from "react-native";

import type { Task } from "../../types/task";

interface TaskCreationMarkerProps {
  task: Task;
}

export function TaskCreationMarker({
  task,
}: TaskCreationMarkerProps) {
  return (
    <View style={styles.marker} testID={`task-creation-marker-${task.id}`}>
      <Text style={styles.label}>Criacao da tarefa</Text>
      <Text style={styles.title}>{task.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#f59e0b",
    backgroundColor: "#fff7ed",
    padding: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#c2410c",
  },
  title: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#7c2d12",
  },
});
