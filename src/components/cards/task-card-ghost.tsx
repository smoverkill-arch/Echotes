import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontFamily,
  letterSpacing,
  lineHeight,
  radius,
  spacing,
  typography,
} from "../../theme/tokens";
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
      <Text style={styles.eyebrow}>Projetada</Text>
      <Text style={styles.title}>{task.title}</Text>
      {task.content ? <Text style={styles.body}>{task.content}</Text> : null}
      <Text style={styles.footer}>
        → {formatDisplayDay(task.target_day)}
        {scheduledTime ? ` às ${scheduledTime}` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.taskGhostBorder,
    backgroundColor: colors.taskGhostSoft,
    padding: spacing.lg,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wider,
    color: colors.taskGhost,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    marginTop: spacing.sm,
    fontSize: typography.bodyLarge,
    lineHeight: typography.bodyLarge * lineHeight.snug,
    color: colors.taskGhost,
  },
  body: {
    fontFamily: fontFamily.bodyRegular,
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: typography.body * lineHeight.normal,
    color: colors.taskGhost,
  },
  footer: {
    fontFamily: fontFamily.bodyMedium,
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: colors.taskGhost,
  },
});
