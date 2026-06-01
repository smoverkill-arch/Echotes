import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import type { CalendarMode } from "../../stores/calendar-store";
import { useAppearancePalette } from "../../stores/appearance-store";
import { BrandMark } from "../brand/brand-mark";
import { fontFamily } from "../../theme/fonts";
import { radius, spacing, touchTarget, typography } from "../../theme/tokens";
import {
  addMonthsToDayKey,
  addWeeksToDayKey,
  formatDayOfMonth,
  formatDisplayDay,
  formatMonthYear,
  formatWeekdayShort,
  getMonthGridForSelectedDay,
  getWeekRangeForSelectedDay,
  isSameMonth,
} from "../../utils/date";

interface DayHeaderProps {
  date: string;
  clockDate: string;
  email: string;
  calendarMode: CalendarMode;
  isSigningOut: boolean;
  onDateChange: (date: string) => void;
  onCalendarModeChange: (mode: CalendarMode) => void;
  onSignOut: () => Promise<void> | void;
  onSettings: () => void;
}

const WEEKDAY_HEADERS = ["D", "S", "T", "Q", "Q", "S", "S"];

const groupMonthWeeks = (days: string[]) =>
  Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) =>
    days.slice(weekIndex * 7, weekIndex * 7 + 7),
  );

export function DayHeader({
  date,
  clockDate,
  email,
  calendarMode,
  isSigningOut,
  onDateChange,
  onCalendarModeChange,
  onSignOut,
  onSettings,
}: DayHeaderProps) {
  const palette = useAppearancePalette();
  const isToday = date === clockDate;
  const formattedDate = formatDisplayDay(date);
  const visibleWeek = getWeekRangeForSelectedDay(date);
  const monthGrid = getMonthGridForSelectedDay(date);
  const monthWeeks = groupMonthWeeks(monthGrid);

  const selectDate = (nextDate: string) => {
    onCalendarModeChange("week");
    onDateChange(nextDate);
  };

  const navigateBackward = () => {
    onDateChange(
      calendarMode === "month"
        ? addMonthsToDayKey(date, -1)
        : addWeeksToDayKey(date, -1),
    );
  };

  const navigateForward = () => {
    onDateChange(
      calendarMode === "month"
        ? addMonthsToDayKey(date, 1)
        : addWeeksToDayKey(date, 1),
    );
  };

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: palette.border, backgroundColor: palette.surface },
      ]}
    >
      <View style={styles.brandRow}>
        <BrandMark size="sm" />

        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Abrir definicoes de aparencia"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.headerActionButton,
              {
                borderColor: palette.border,
                backgroundColor: pressed ? palette.surfacePressed : "transparent",
              },
            ]}
            testID="day-header-settings-button"
            onPress={onSettings}
          >
            <Text style={[styles.headerActionLabel, { color: palette.textMuted }]}>Ajustes</Text>
          </Pressable>

          <Pressable
            accessibilityLabel={isSigningOut ? "Saindo" : "Sair da conta"}
            accessibilityRole="button"
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.headerActionButton,
              {
                borderColor: palette.border,
                backgroundColor: pressed && !isSigningOut ? palette.surfacePressed : "transparent",
              },
              isSigningOut ? { opacity: 0.55 } : null,
            ]}
            testID="day-header-sign-out-button"
            onPress={() => {
              void onSignOut();
            }}
          >
            <Text style={[styles.headerActionLabel, { color: palette.textMuted }]}>
              {isSigningOut ? "Saindo..." : "Sair"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.identityBlock}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.text }]}>{formattedDate}</Text>
          {isToday ? (
            <View
              style={[styles.todayChip, { backgroundColor: palette.primarySoft }]}
              testID="day-header-today-chip"
            >
              <Text style={[styles.todayChipLabel, { color: palette.primary }]}>Hoje</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.subtitle, { color: palette.textSubtle }]}>{email}</Text>
      </View>

      <View style={styles.calendarPanel}>
        <View style={styles.calendarToolbar}>
          <Pressable
            accessibilityLabel="Semana anterior"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: pressed ? palette.surfacePressed : "transparent" },
            ]}
            testID="day-calendar-previous-week"
            onPress={navigateBackward}
          >
            <Text style={[styles.iconButtonLabel, { color: palette.text }]}>{"<"}</Text>
          </Pressable>

          <Pressable
            accessibilityLabel={
              calendarMode === "month"
                ? `Recolher calendario mensal de ${formatMonthYear(date)}`
                : `Expandir calendario mensal de ${formatMonthYear(date)}`
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.monthButton,
              {
                borderColor: calendarMode === "month" ? palette.primary : palette.border,
                backgroundColor: pressed
                  ? palette.surfacePressed
                  : calendarMode === "month"
                    ? palette.primarySoft
                    : palette.surface,
              },
            ]}
            testID="day-calendar-month-toggle"
            onPress={() => {
              onCalendarModeChange(calendarMode === "month" ? "week" : "month");
            }}
          >
            <Text
              style={[
                styles.monthButtonLabel,
                { color: calendarMode === "month" ? palette.primary : palette.text },
              ]}
            >
              {formatMonthYear(date)}
              <Text style={styles.monthButtonIndicator}>
                {calendarMode === "month" ? "  ^" : "  v"}
              </Text>
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Proxima semana"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: pressed ? palette.surfacePressed : "transparent" },
            ]}
            testID="day-calendar-next-week"
            onPress={navigateForward}
          >
            <Text style={[styles.iconButtonLabel, { color: palette.text }]}>{">"}</Text>
          </Pressable>
        </View>

        {calendarMode === "week" ? (
          <Animated.View key="week" entering={FadeIn.duration(160)} style={styles.weekStrip}>
            {visibleWeek.map((day) => {
              const isSelected = day === date;
              const dayIsToday = day === clockDate;

              return (
                <Pressable
                  key={day}
                  accessibilityLabel={`${formatWeekdayShort(day)} ${formatDisplayDay(day)}${
                    dayIsToday ? ", hoje" : ""
                  }${isSelected ? ", selecionado" : ""}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [
                    styles.weekDayButton,
                    {
                      borderColor: isSelected || dayIsToday ? palette.primary : palette.border,
                      backgroundColor: pressed
                        ? palette.surfacePressed
                        : isSelected
                          ? palette.primary
                          : dayIsToday
                            ? palette.primarySoft
                            : palette.surfaceMuted,
                    },
                  ]}
                  testID={`day-calendar-week-day-${day}`}
                  onPress={() => {
                    selectDate(day);
                  }}
                >
                  <Text
                    style={[
                      styles.weekDayName,
                      { color: isSelected ? palette.primaryText : palette.textSubtle },
                    ]}
                  >
                    {formatWeekdayShort(day)}
                  </Text>
                  <Text
                    style={[
                      styles.weekDayNumber,
                      {
                        color: isSelected
                          ? palette.primaryText
                          : dayIsToday
                            ? palette.primary
                            : palette.text,
                      },
                    ]}
                  >
                    {formatDayOfMonth(day)}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>
        ) : (
          <Animated.View
            key="month"
            entering={FadeIn.duration(160)}
            style={styles.monthSheet}
            testID="day-calendar-month-sheet"
          >
            <View style={styles.monthWeekHeader}>
              {WEEKDAY_HEADERS.map((label, index) => (
                <Text
                  key={`${label}-${index}`}
                  style={[styles.monthWeekLabel, { color: palette.textSubtle }]}
                >
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.monthGrid}>
              {monthWeeks.map((week, weekIndex) => (
                <View
                  key={`month-week-${week[0]}`}
                  style={styles.monthWeekRow}
                  testID={`day-calendar-month-week-${weekIndex}`}
                >
                  {week.map((day) => {
                    const isSelected = day === date;
                    const dayIsToday = day === clockDate;
                    const isOutsideMonth = !isSameMonth(day, date);

                    return (
                      <Pressable
                        key={day}
                        accessibilityLabel={`${formatDisplayDay(day)}${
                          dayIsToday ? ", hoje" : ""
                        }${isSelected ? ", selecionado" : ""}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        style={({ pressed }) => [
                          styles.monthDayButton,
                          isOutsideMonth ? styles.monthDayOutsideVisual : null,
                          {
                            borderColor:
                              isSelected || dayIsToday ? palette.primary : "transparent",
                            backgroundColor: pressed
                              ? palette.surfacePressed
                              : isSelected
                                ? palette.primary
                                : dayIsToday
                                  ? palette.primarySoft
                                  : "transparent",
                          },
                        ]}
                        testID={`day-calendar-month-day-${day}`}
                        onPress={() => {
                          selectDate(day);
                        }}
                      >
                        <Text
                          style={[
                            styles.monthDayLabel,
                            {
                              color: isSelected
                                ? palette.primaryText
                                : isOutsideMonth
                                  ? palette.textSubtle
                                  : dayIsToday
                                    ? palette.primary
                                    : palette.text,
                            },
                          ]}
                        >
                          {formatDayOfMonth(day)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={styles.calendarFooter}>
          <Text style={[styles.calendarHint, { color: palette.textSubtle }]}>
            {isToday ? "Voce esta em hoje" : "Dia selecionado fora de hoje"}
          </Text>
          <Pressable
            accessibilityLabel="Voltar para hoje"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.todayButton,
              {
                backgroundColor: isToday
                  ? palette.surfaceMuted
                  : pressed
                    ? palette.primaryPressed
                    : palette.primary,
              },
            ]}
            disabled={isToday}
            testID="day-calendar-today-button"
            onPress={() => {
              selectDate(clockDate);
            }}
          >
            <Text
              style={[
                styles.todayButtonLabel,
                { color: isToday ? palette.textSubtle : palette.primaryText },
              ]}
            >
              Hoje
            </Text>
          </Pressable>
        </View>

        {calendarMode === "month" ? (
          <Pressable
            accessibilityLabel="Fechar seletor mensal"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.closeMonthButton,
              { backgroundColor: pressed ? palette.surfacePressed : palette.surfaceMuted },
            ]}
            testID="day-calendar-close-month"
            onPress={() => {
              onCalendarModeChange("week");
            }}
          >
            <Text style={[styles.closeMonthLabel, { color: palette.text }]}>Recolher</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
  },
  identityBlock: {
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.title,
    fontFamily: fontFamily.display,
  },
  todayChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  todayChipLabel: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  headerActionButton: {
    minHeight: touchTarget.min,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  headerActionLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
  calendarPanel: {
    borderTopWidth: 1,
    borderTopColor: "transparent",
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  calendarToolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  iconButtonLabel: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.bodyBold,
  },
  monthButton: {
    flex: 1,
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  monthButtonLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
  },
  monthButtonIndicator: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
  weekStrip: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  weekDayButton: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.xxs,
  },
  weekDayName: {
    fontSize: typography.eyebrow,
    fontFamily: fontFamily.bodyBold,
  },
  weekDayNumber: {
    fontSize: typography.bodyLarge,
    fontFamily: fontFamily.display,
  },
  calendarFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  calendarHint: {
    flex: 1,
    fontSize: typography.caption,
    fontFamily: fontFamily.body,
  },
  todayButton: {
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
  },
  todayButtonLabel: {
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
  monthSheet: {
    gap: spacing.xs,
  },
  monthWeekHeader: {
    flexDirection: "row",
    gap: 2,
  },
  monthWeekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.caption,
    fontFamily: fontFamily.bodyBold,
  },
  monthGrid: {
    gap: 2,
  },
  monthWeekRow: {
    flexDirection: "row",
    gap: 2,
  },
  monthDayButton: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  monthDayOutsideVisual: {
    opacity: 0.34,
  },
  monthDayLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
  },
  closeMonthButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  closeMonthLabel: {
    fontSize: typography.body,
    fontFamily: fontFamily.bodyBold,
  },
});
