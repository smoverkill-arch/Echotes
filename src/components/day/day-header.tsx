import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CalendarMode } from "../../stores/calendar-store";
import { useAppearancePalette } from "../../stores/appearance-store";
import { colors, radius, spacing, touchTarget, typography } from "../../theme/tokens";
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
  const formattedDate = formatDisplayDay(date);
  const visibleWeek = getWeekRangeForSelectedDay(date);
  const monthGrid = getMonthGridForSelectedDay(date);

  const selectDate = (nextDate: string) => {
    onCalendarModeChange("week");
    onDateChange(nextDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.identityBlock}>
          <Text style={[styles.eyebrow, { color: palette.primary }]}>Echotes</Text>
          <Text style={[styles.title, { color: palette.text }]}>{formattedDate}</Text>
          <Text style={[styles.subtitle, { color: palette.textSubtle }]}>{email}</Text>
        </View>

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
            <Text style={[styles.headerActionLabel, { color: palette.textMuted }]}>
              Ajustes
            </Text>
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

      <View
        style={[
          styles.calendarPanel,
          { borderColor: palette.border, backgroundColor: palette.surface },
        ]}
      >
        <View style={styles.calendarToolbar}>
          <Pressable
            accessibilityLabel="Semana anterior"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: pressed ? palette.surfacePressed : palette.surfaceMuted },
            ]}
            testID="day-calendar-previous-week"
            onPress={() => {
              onDateChange(addWeeksToDayKey(date, -1));
            }}
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
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Proxima semana"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: pressed ? palette.surfacePressed : palette.surfaceMuted },
            ]}
            testID="day-calendar-next-week"
            onPress={() => {
              onDateChange(addWeeksToDayKey(date, 1));
            }}
          >
            <Text style={[styles.iconButtonLabel, { color: palette.text }]}>{">"}</Text>
          </Pressable>
        </View>

        <View style={styles.weekStrip}>
          {visibleWeek.map((day) => {
            const isSelected = day === date;
            const isToday = day === clockDate;

            return (
              <Pressable
                key={day}
                accessibilityLabel={`${formatWeekdayShort(day)} ${formatDisplayDay(day)}${
                  isToday ? ", hoje" : ""
                }${isSelected ? ", selecionado" : ""}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.weekDayButton,
                  {
                    borderColor: isSelected || isToday ? palette.primary : palette.border,
                    backgroundColor: pressed
                      ? palette.surfacePressed
                      : isSelected
                        ? palette.primary
                        : isToday
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
                    { color: isSelected ? palette.primaryText : isToday ? palette.primary : palette.text },
                  ]}
                >
                  {formatDayOfMonth(day)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.calendarFooter}>
          <Text style={[styles.calendarHint, { color: palette.textSubtle }]}>
            {date === clockDate ? "Voce esta em hoje" : "Dia selecionado fora de hoje"}
          </Text>
          <Pressable
            accessibilityLabel="Voltar para hoje"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.todayButton,
              {
                backgroundColor:
                  date === clockDate
                    ? palette.surfaceMuted
                    : pressed
                      ? palette.primaryPressed
                      : palette.primary,
              },
            ]}
            disabled={date === clockDate}
            testID="day-calendar-today-button"
            onPress={() => {
              selectDate(clockDate);
            }}
          >
            <Text
              style={[
                styles.todayButtonLabel,
                { color: date === clockDate ? palette.textSubtle : palette.primaryText },
              ]}
            >
              Hoje
            </Text>
          </Pressable>
        </View>

        {calendarMode === "month" ? (
          <View
            style={[
              styles.monthSheet,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
            testID="day-calendar-month-sheet"
          >
            <View style={styles.monthSheetHeader}>
              <Pressable
                accessibilityLabel="Mes anterior"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: pressed ? palette.surfacePressed : palette.surfaceMuted },
                ]}
                testID="day-calendar-previous-month"
                onPress={() => {
                  onDateChange(addMonthsToDayKey(date, -1));
                }}
              >
                <Text style={[styles.iconButtonLabel, { color: palette.text }]}>{"<"}</Text>
              </Pressable>

              <Text style={[styles.monthSheetTitle, { color: palette.text }]}>
                {formatMonthYear(date)}
              </Text>

              <Pressable
                accessibilityLabel="Proximo mes"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: pressed ? palette.surfacePressed : palette.surfaceMuted },
                ]}
                testID="day-calendar-next-month"
                onPress={() => {
                  onDateChange(addMonthsToDayKey(date, 1));
                }}
              >
                <Text style={[styles.iconButtonLabel, { color: palette.text }]}>{">"}</Text>
              </Pressable>
            </View>

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
              {monthGrid.map((day) => {
                const isSelected = day === date;
                const isToday = day === clockDate;
                const isOutsideMonth = !isSameMonth(day, date);

                return (
                  <Pressable
                    key={day}
                    accessibilityLabel={`${formatDisplayDay(day)}${
                      isToday ? ", hoje" : ""
                    }${isSelected ? ", selecionado" : ""}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.monthDayButton,
                      {
                        borderColor: isSelected || isToday ? palette.primary : palette.border,
                        backgroundColor: pressed
                          ? palette.surfacePressed
                          : isSelected
                            ? palette.primary
                            : isOutsideMonth
                              ? palette.surfaceMuted
                              : palette.surface,
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
                              : isToday
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
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  identityBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.primary,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.title,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: 22,
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
    fontWeight: "800",
  },
  calendarPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
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
    backgroundColor: colors.surfaceMuted,
  },
  iconButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  iconButtonLabel: {
    fontSize: typography.bodyLarge,
    fontWeight: "800",
    color: colors.text,
  },
  monthButton: {
    flex: 1,
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  monthButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  monthButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  monthButtonLabel: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  monthButtonLabelActive: {
    color: colors.primary,
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
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.xxs,
  },
  weekDayToday: {
    borderColor: colors.primary,
  },
  weekDaySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  weekDayPressed: {
    backgroundColor: colors.surfacePressed,
  },
  weekDayName: {
    fontSize: typography.eyebrow,
    fontWeight: "800",
    color: colors.textMuted,
  },
  weekDayNumber: {
    fontSize: typography.bodyLarge,
    fontWeight: "800",
    color: colors.text,
  },
  weekDayTextSelected: {
    color: colors.white,
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
    color: colors.textMuted,
  },
  todayButton: {
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  todayButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
  },
  todayButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  todayButtonLabel: {
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.white,
  },
  todayButtonLabelDisabled: {
    color: colors.textSubtle,
  },
  monthSheet: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  monthSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  monthSheetTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.bodyLarge,
    fontWeight: "800",
    color: colors.text,
  },
  monthWeekHeader: {
    flexDirection: "row",
  },
  monthWeekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.caption,
    fontWeight: "800",
    color: colors.textSubtle,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  monthDayButton: {
    width: `${(100 - 6 * 1.3) / 7}%`,
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  monthDayOutside: {
    backgroundColor: colors.surfaceMuted,
  },
  monthDayToday: {
    borderColor: colors.primary,
  },
  monthDaySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  monthDayPressed: {
    backgroundColor: colors.surfacePressed,
  },
  monthDayLabel: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.text,
  },
  monthDayLabelOutside: {
    color: colors.textSubtle,
  },
  monthDayLabelSelected: {
    color: colors.white,
  },
  closeMonthButton: {
    minHeight: touchTarget.min,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.text,
  },
  closeMonthButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  closeMonthLabel: {
    fontSize: typography.body,
    fontWeight: "800",
    color: colors.white,
  },
});
