import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "../src/components/brand/brand-mark";
import { PrimaryAction } from "../src/components/ui/primary-action";
import { SecondaryAction } from "../src/components/ui/secondary-action";
import { SectionLabel } from "../src/components/ui/section-label";
import { useDayTimeline } from "../src/features/day/hooks/use-day-timeline";
import { useAuthSession } from "../src/features/auth/hooks/use-auth-session";
import { useAppearancePalette } from "../src/stores/appearance-store";
import type { Task } from "../src/types/task";
import { extractTimePart, formatDisplayDay } from "../src/utils/date";
import { fontFamily } from "../src/theme/fonts";
import { radius, spacing, typography } from "../src/theme/tokens";

const nextScheduledTask = (tasks: Task[], clockDate: string): Task | null => {
  const scheduled = tasks
    .filter((task) => task.scheduled_at && task.target_day === clockDate)
    .sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)));

  return scheduled[0] ?? null;
};

export default function HomeRoute() {
  const palette = useAppearancePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clockDate, isAuthenticated, isBootstrapping, signInHref } = useAuthSession();
  const { tasks, notes, echoes, isLoading } = useDayTimeline(clockDate);

  const nextTask = useMemo(() => nextScheduledTask(tasks, clockDate), [tasks, clockDate]);

  if (isBootstrapping) {
    return <View style={[styles.screen, { backgroundColor: palette.background }]} />;
  }

  if (!isAuthenticated) {
    return <Redirect href={signInHref} />;
  }

  const isEmpty = tasks.length === 0 && notes.length === 0;

  const summary = [
    { key: "tasks", label: "Tarefas", value: tasks.length, tone: "task" as const },
    { key: "notes", label: "Notas", value: notes.length, tone: "note" as const },
    { key: "echoes", label: "Ecos", value: echoes.length, tone: "primary" as const },
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <BrandMark size="md" />

      <View style={styles.intro}>
        <SectionLabel tone="primary">Hoje</SectionLabel>
        <Text style={[styles.title, { color: palette.text }]}>{formatDisplayDay(clockDate)}</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          {isEmpty ? "Nada registrado ainda. Comece o seu dia." : "Resumo do seu dia."}
        </Text>
      </View>

      <View style={styles.summaryRow} testID="home-summary">
        {summary.map((item) => {
          const color =
            item.tone === "task"
              ? palette.task
              : item.tone === "note"
                ? palette.note
                : palette.primary;
          return (
            <View
              key={item.key}
              style={[styles.summaryCard, { backgroundColor: palette.surface, borderColor: palette.border }]}
              testID={`home-summary-${item.key}`}
            >
              <Text style={[styles.summaryValue, { color }]}>{isLoading ? "-" : item.value}</Text>
              <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      {nextTask ? (
        <View
          style={[styles.nextCard, { backgroundColor: palette.surface, borderColor: palette.border, borderLeftColor: palette.task }]}
          testID="home-next-task"
        >
          <SectionLabel tone="task">Proxima tarefa</SectionLabel>
          <Text style={[styles.nextTitle, { color: palette.text }]}>{nextTask.title}</Text>
          {nextTask.scheduled_at ? (
            <Text style={[styles.nextTime, { color: palette.textMuted }]}>
              {extractTimePart(nextTask.scheduled_at).slice(0, 5)}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <PrimaryAction
          label="Abrir o dia"
          onPress={() => router.push(`/day/${clockDate}`)}
          accessibilityLabel="Abrir a superficie do dia"
          testID="home-open-day-button"
        />
        <View style={styles.shortcutRow}>
          <View style={styles.shortcut}>
            <SecondaryAction
              label="Criar nota"
              onPress={() => router.push(`/day/${clockDate}?create=note`)}
              testID="home-create-note-button"
            />
          </View>
          <View style={styles.shortcut}>
            <SecondaryAction
              label="Criar tarefa"
              onPress={() => router.push(`/day/${clockDate}?create=task`)}
              testID="home-create-task-button"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  intro: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.hero,
    fontFamily: fontFamily.display,
  },
  subtitle: {
    fontSize: typography.body,
    fontFamily: fontFamily.body,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xxs,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: typography.title,
    fontFamily: fontFamily.display,
  },
  summaryLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  nextCard: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  nextTitle: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.bodyBold,
  },
  nextTime: {
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
  },
  actions: {
    gap: spacing.md,
  },
  shortcutRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  shortcut: {
    flex: 1,
  },
});
