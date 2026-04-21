const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_KEY_PATTERN = /^\d{2}:\d{2}$/;

const ensureDayKey = (value: string) => {
  if (!DAY_KEY_PATTERN.test(value)) {
    throw new Error("Data invalida. Use o formato YYYY-MM-DD.");
  }
};

const ensureTimeKey = (value: string) => {
  if (!TIME_KEY_PATTERN.test(value)) {
    throw new Error("Hora invalida. Use o formato HH:mm.");
  }
};

const normalizeDateInstance = (value: Date) => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);

  return normalized;
};

export const parseDayKey = (value: string) => {
  ensureDayKey(value);

  return new Date(`${value}T00:00:00`);
};

export const formatDayKey = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = (now: Date = new Date()) =>
  formatDayKey(normalizeDateInstance(now));

export const buildDayTimeIso = (day: string, time: string) => {
  ensureDayKey(day);
  ensureTimeKey(time);

  return `${day}T${time}:00+00:00`;
};

export const extractTimePart = (iso: string) => iso.slice(11, 19);

export const buildInDaySortAt = (day: string, iso: string) => {
  ensureDayKey(day);

  return `${day}T${extractTimePart(iso)}`;
};

export const isIsoAfter = (leftIso: string, rightIso: string) =>
  new Date(leftIso).getTime() > new Date(rightIso).getTime();

export const getStartOfWeekSunday = (value: Date | string) => {
  const baseDate =
    typeof value === "string" ? parseDayKey(value) : normalizeDateInstance(value);
  const startOfWeek = new Date(baseDate);

  startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());

  return formatDayKey(startOfWeek);
};

export const getWeekRangeForSelectedDay = (value: Date | string) => {
  const startOfWeek = parseDayKey(getStartOfWeekSunday(value));

  return Array.from({ length: 7 }, (_, offset) => {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + offset);

    return formatDayKey(currentDay);
  });
};
