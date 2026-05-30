import { StyleSheet, Text, View } from "react-native";

import {
  densityMetrics,
  useAppearancePalette,
  useAppearanceStore,
} from "../../stores/appearance-store";
import { radius, spacing, typography } from "../../theme/tokens";
import type { Task } from "../../types/task";
import { extractTimePart } from "../../utils/date";

interface TaskCardTimedProps {
  task: Task;
}

export function TaskCardTimed({ task }: TaskCardTimedProps) {
  const palette = useAppearancePalette();
  const density = useAppearanceStore((state) => state.density);
  const metrics = densityMetrics[density];
  const scheduledTime = task.scheduled_at
    ? extractTimePart(task.scheduled_at).slice(0, 5)
    : null;

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
      testID={`task-card-timed-${task.id}`}
    >
      <View style={styles.metaRow}>
        <Text style={[styles.eyebrow, { color: palette.task }]}>Tarefa</Text>
        <View style={[styles.timeChip, { backgroundColor: palette.taskSoft }]}>
          <Text style={[styles.timeChipLabel, { color: palette.task }]}>
            {scheduledTime ?? "sem hora"}
          </Text>
        </View>
      </View>
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  timeChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  timeChipLabel: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    letterSpacing: 0.8,
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
