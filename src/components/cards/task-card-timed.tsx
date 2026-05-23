import { StyleSheet, Text, View } from "react-native";

import {
  colors,
  fontFamily,
  letterSpacing,
  lineHeight,
  radius,
  shadow,
  spacing,
  typography,
} from "../../theme/tokens";
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
        {scheduledTime ? `Horário: ${scheduledTime}` : "Horário não disponível"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.taskTimedBorder,
    backgroundColor: colors.taskTimedSoft,
    padding: spacing.lg,
    ...shadow.sm,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wider,
    color: colors.taskTimed,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    marginTop: spacing.sm,
    fontSize: typography.bodyLarge,
    lineHeight: typography.bodyLarge * lineHeight.snug,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamily.bodyRegular,
    marginTop: spacing.sm,
    fontSize: typography.body,
    lineHeight: typography.body * lineHeight.normal,
    color: colors.textMuted,
  },
  footer: {
    fontFamily: fontFamily.bodyMedium,
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: colors.taskTimed,
  },
});
