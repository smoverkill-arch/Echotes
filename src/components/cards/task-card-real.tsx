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

interface TaskCardRealProps {
  task: Task;
}

export function TaskCardReal({ task }: TaskCardRealProps) {
  return (
    <View style={styles.card} testID={`task-card-real-${task.id}`}>
      <Text style={styles.eyebrow}>Tarefa</Text>
      <Text style={styles.title}>{task.title}</Text>
      {task.content ? <Text style={styles.body}>{task.content}</Text> : null}
      <Text style={styles.footer}>Sem horário agendado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.taskBorder,
    backgroundColor: colors.taskSoft,
    padding: spacing.lg,
    ...shadow.sm,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.wider,
    color: colors.task,
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
    color: colors.task,
  },
});
