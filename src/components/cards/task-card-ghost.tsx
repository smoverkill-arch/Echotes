import { StyleSheet, Text, View } from "react-native";

import {
  densityMetrics,
  useAppearancePalette,
  useAppearanceStore,
} from "../../stores/appearance-store";
import { radius, spacing, typography } from "../../theme/tokens";
import type { Task } from "../../types/task";
import { extractTimePart, formatDisplayDay } from "../../utils/date";

interface TaskCardGhostProps {
  task: Task;
}

export function TaskCardGhost({ task }: TaskCardGhostProps) {
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
          borderColor: palette.ghostBorder,
          paddingVertical: metrics.cardPaddingVertical,
          paddingHorizontal: metrics.cardPaddingHorizontal,
        },
      ]}
      testID={`task-card-ghost-${task.id}`}
    >
      <View style={styles.ghostContent}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: palette.textSubtle }]}>Projetada</Text>
          <Text style={[styles.title, { color: palette.textMuted, fontSize: metrics.taskTitleSize }]}>
            {task.title}
          </Text>
          {task.content && metrics.showPreview ? (
            <Text numberOfLines={2} style={[styles.body, { color: palette.textSubtle }]}>
              {task.content}
            </Text>
          ) : null}
        </View>
        <View style={styles.destination}>
          <View style={[styles.destinationChip, { backgroundColor: palette.taskSoft }]}>
            <Text style={[styles.destinationChipLabel, { color: palette.task }]}>
              {formatDisplayDay(task.target_day)}
            </Text>
          </View>
          <Text style={[styles.footer, { color: palette.textSubtle }]}>
            Vai para {formatDisplayDay(task.target_day)}
            {scheduledTime ? ` as ${scheduledTime}` : ""}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    opacity: 0.82,
  },
  ghostContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  destination: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  title: {
    marginTop: spacing.xs,
    fontWeight: "700",
  },
  body: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
  },
  destinationChip: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  destinationChipLabel: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
  },
  footer: {
    fontSize: typography.eyebrow,
  },
});
