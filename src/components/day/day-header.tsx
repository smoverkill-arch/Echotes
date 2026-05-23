import { ChevronLeft, ChevronRight, LogOut } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { CalendarMode } from "../../stores/calendar-store";
import {
  colors,
  fontFamily,
  letterSpacing,
  lineHeight,
  radius,
  shadow,
  spacing,
  touchTarget,
  typography,
} from "../../theme/tokens";
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
}: DayHeaderProps) {
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
          <Text style={styles.eyebrow}>Echotes</Text>
          <Text style={styles.title}>{formattedDate}</Text>
          <Text style={styles.subtitle}>{email}</Text>
        </View>

        <Pressable
          accessibilityLabel={isSigningOut ? "Saindo" : "Sair da conta"}
          accessibilityRole="button"
          disabled={isSigningOut}
          style={({ pressed }) => [
            styles.signOutButton,
            isSigningOut ? styles.signOutButtonDisabled : null,
            pressed && !isSigningOut ? styles.signOutButtonPressed : null,
          ]}
          testID="day-header-sign-out-button"
          onPress={() => {
            void onSignOut();
          }}
        >
          {isSigningOut ? (
            <Text style={styles.signOutLabel}>Saindo…</Text>
          ) : (
            <LogOut color={colors.white} size={16} strokeWidth={2} />
          )}
        </Pressable>
      </View>

      <View style={styles.calendarPanel}>
        <View style={styles.calendarToolbar}>
          <Pressable
            accessibilityLabel="Semana anterior"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.iconButton,
              pressed ? styles.iconButtonPressed : null,
            ]}
            testID="day-calendar-previous-week"
            onPress={() => {
              onDateChange(addWeeksToDayKey(date, -1));
            }}
          >
            <ChevronLeft color={colors.text} size={18} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            accessibilityLabel={
              calendarMode === "month"
                ? `Recolher calendário mensal de ${formatMonthYear(date)}`
                : `Expandir calendário mensal de ${formatMonthYear(date)}`
            }
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.monthButton,
              calendarMode === "month" ? styles.monthButtonActive : null,
              pressed ? styles.monthButtonPressed : null,
            ]}
            testID="day-calendar-month-toggle"
            onPress={() => {
              onCalendarModeChange(calendarMode === "month" ? "week" : "month");
            }}
          >
            <Text
              style={[
                styles.monthButtonLabel,
                calendarMode === "month" ? styles.monthButtonLabelActive : null,
              ]}
            >
              {formatMonthYear(date)}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Próxima semana"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.iconButton,
              pressed ? styles.iconButtonPressed : null,
            ]}
            testID="day-calendar-next-week"
            onPress={() => {
              onDateChange(addWeeksToDayKey(date, 1));
            }}
          >
            <ChevronRight color={colors.text} size={18} strokeWidth={2.5} />
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
                  isToday ? styles.weekDayToday : null,
                  isSelected ? styles.weekDaySelected : null,
                  pressed ? styles.weekDayPressed : null,
                ]}
                testID={`day-calendar-week-day-${day}`}
                onPress={() => {
                  selectDate(day);
                }}
              >
                <Text
                  style={[
                    styles.weekDayName,
                    isSelected ? styles.weekDayTextSelected : null,
                  ]}
                >
                  {formatWeekdayShort(day)}
                </Text>
                <Text
                  style={[
                    styles.weekDayNumber,
                    isSelected ? styles.weekDayTextSelected : null,
                  ]}
                >
                  {formatDayOfMonth(day)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.calendarFooter}>
          <Text style={styles.calendarHint}>
            {date === clockDate ? "Você está em hoje" : "Dia selecionado fora de hoje"}
          </Text>
          <Pressable
            accessibilityLabel="Voltar para hoje"
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.todayButton,
              date === clockDate ? styles.todayButtonDisabled : null,
              pressed && date !== clockDate ? styles.todayButtonPressed : null,
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
                date === clockDate ? styles.todayButtonLabelDisabled : null,
              ]}
            >
              Hoje
            </Text>
          </Pressable>
        </View>

        {calendarMode === "month" ? (
          <View style={styles.monthSheet} testID="day-calendar-month-sheet">
            <View style={styles.monthSheetHeader}>
              <Pressable
                accessibilityLabel="Mês anterior"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed ? styles.iconButtonPressed : null,
                ]}
                testID="day-calendar-previous-month"
                onPress={() => {
                  onDateChange(addMonthsToDayKey(date, -1));
                }}
              >
                <ChevronLeft color={colors.text} size={18} strokeWidth={2.5} />
              </Pressable>

              <Text style={styles.monthSheetTitle}>{formatMonthYear(date)}</Text>

              <Pressable
                accessibilityLabel="Próximo mês"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed ? styles.iconButtonPressed : null,
                ]}
                testID="day-calendar-next-month"
                onPress={() => {
                  onDateChange(addMonthsToDayKey(date, 1));
                }}
              >
                <ChevronRight color={colors.text} size={18} strokeWidth={2.5} />
              </Pressable>
            </View>

            <View style={styles.monthWeekHeader}>
              {WEEKDAY_HEADERS.map((label, index) => (
                <Text key={`${label}-${index}`} style={styles.monthWeekLabel}>
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
                      isOutsideMonth ? styles.monthDayOutside : null,
                      isToday ? styles.monthDayToday : null,
                      isSelected ? styles.monthDaySelected : null,
                      pressed ? styles.monthDayPressed : null,
                    ]}
                    testID={`day-calendar-month-day-${day}`}
                    onPress={() => {
                      selectDate(day);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthDayLabel,
                        isOutsideMonth ? styles.monthDayLabelOutside : null,
                        isSelected ? styles.monthDayLabelSelected : null,
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
                pressed ? styles.closeMonthButtonPressed : null,
              ]}
              testID="day-calendar-close-month"
              onPress={() => {
                onCalendarModeChange("week");
              }}
            >
              <Text style={styles.closeMonthLabel}>Recolher</Text>
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
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    textTransform: "uppercase",
    letterSpacing: letterSpacing.widest,
    color: colors.primary,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    marginTop: spacing.xs,
    fontSize: typography.title,
    lineHeight: typography.title * lineHeight.tight,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textMuted,
  },
  signOutButton: {
    minWidth: touchTarget.min,
    minHeight: touchTarget.min,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
  },
  signOutButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  signOutButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  signOutLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.caption,
    color: colors.white,
  },
  calendarPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.sm,
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
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.body,
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
    fontFamily: fontFamily.bodyExtraBold,
    fontSize: typography.eyebrow,
    color: colors.textMuted,
  },
  weekDayNumber: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: typography.bodyLarge,
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
    fontFamily: fontFamily.bodyRegular,
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
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.caption,
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
    fontFamily: fontFamily.bodyBold,
    flex: 1,
    textAlign: "center",
    fontSize: typography.bodyLarge,
    color: colors.text,
  },
  monthWeekHeader: {
    flexDirection: "row",
  },
  monthWeekLabel: {
    fontFamily: fontFamily.bodyExtraBold,
    flex: 1,
    textAlign: "center",
    fontSize: typography.caption,
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
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.body,
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
    fontFamily: fontFamily.bodyBold,
    fontSize: typography.body,
    color: colors.white,
  },
});
