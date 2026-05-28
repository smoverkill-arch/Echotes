import { StyleSheet, Text, View } from "react-native";

import {
  densityMetrics,
  useAppearancePalette,
  useAppearanceStore,
} from "../../stores/appearance-store";
import { radius, spacing, typography } from "../../theme/tokens";
import type { Task } from "../../types/task";

interface TaskCreationMarkerProps {
  task: Task;
}

export function TaskCreationMarker({
  task,
}: TaskCreationMarkerProps) {
  const palette = useAppearancePalette();
  const density = useAppearanceStore((state) => state.density);
  const metrics = densityMetrics[density];

  return (
    <View
      style={[
        styles.marker,
        {
          borderColor: palette.ghostBorder,
          backgroundColor: palette.taskSoft,
          paddingVertical: metrics.cardPaddingVertical,
          paddingHorizontal: metrics.cardPaddingHorizontal,
        },
      ]}
      testID={`task-creation-marker-${task.id}`}
    >
      <Text style={[styles.label, { color: palette.task }]}>Criacao da tarefa</Text>
      <Text style={[styles.title, { color: palette.textMuted }]}>
        {task.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  label: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: 15,
    fontWeight: "600",
  },
});
