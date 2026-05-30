import { StyleSheet, Text, View } from "react-native";

import {
  densityMetrics,
  useAppearancePalette,
  useAppearanceStore,
} from "../../stores/appearance-store";
import type { Task } from "../../types/task";
import { radius, spacing, typography } from "../../theme/tokens";

interface TaskCardRealProps {
  task: Task;
}

export function TaskCardReal({ task }: TaskCardRealProps) {
  const palette = useAppearancePalette();
  const density = useAppearanceStore((state) => state.density);
  const metrics = densityMetrics[density];

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: palette.border,
          borderLeftColor: palette.task,
          backgroundColor: palette.surface,
          paddingVertical: metrics.cardPaddingVertical,
          paddingHorizontal: metrics.cardPaddingHorizontal,
          shadowColor: palette.shadowColor,
        },
      ]}
      testID={`task-card-real-${task.id}`}
    >
      <Text style={[styles.eyebrow, { color: palette.task }]}>Tarefa</Text>
      <Text style={[styles.title, { color: palette.text, fontSize: metrics.taskTitleSize }]}>
        {task.title}
      </Text>
      {task.content && metrics.showPreview ? (
        <Text
          numberOfLines={2}
          style={[
            styles.body,
            { color: palette.textMuted, lineHeight: metrics.previewLineHeight },
          ]}
        >
          {task.content}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderLeftWidth: 3,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing.xs,
    fontWeight: "800",
  },
  body: {
    marginTop: spacing.xs,
    fontSize: 13,
  },
});
