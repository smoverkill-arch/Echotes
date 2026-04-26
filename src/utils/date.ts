const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DISPLAY_DAY_PATTERN = /^\d{2}-\d{2}-\d{4}$/;
const TIME_KEY_PATTERN = /^\d{2}:\d{2}$/;
export const TIME_KEY_ERROR_MESSAGE =
  "Hora invalida. Use o formato HH:mm entre 00:00 e 23:59.";

const ensureDayKey = (value: string) => {
  if (!DAY_KEY_PATTERN.test(value)) {
    throw new Error("Data invalida. Use o formato YYYY-MM-DD.");
  }
};

const ensureTimeKey = (value: string) => {
  if (!isValidTimeKey(value)) {
    throw new Error(TIME_KEY_ERROR_MESSAGE);
  }
};

const ensureDisplayDayKey = (value: string) => {
  if (!DISPLAY_DAY_PATTERN.test(value)) {
    throw new Error("Data invalida. Use o formato DD-MM-AAAA.");
  }
};

const normalizeDateInstance = (value: Date) => {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);

  return normalized;
};

const padNumber = (value: number) => `${value}`.padStart(2, "0");

const getLocalTimeParts = (value: Date) => ({
  hours: padNumber(value.getHours()),
  minutes: padNumber(value.getMinutes()),
  seconds: padNumber(value.getSeconds()),
});

const isValidCalendarDate = (year: number, month: number, day: number) => {
  const candidate = new Date(year, month - 1, day, 0, 0, 0, 0);

  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  );
};

export const isValidTimeKey = (value: string) => {
  if (!TIME_KEY_PATTERN.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

export const parseDayKey = (value: string) => {
  ensureDayKey(value);

  const [year, month, day] = value.split("-").map(Number);

  if (!isValidCalendarDate(year, month, day)) {
    throw new Error("Data invalida. Use o formato YYYY-MM-DD.");
  }

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

export const formatDisplayDay = (value: string | Date) => {
  const dayKey = typeof value === "string" ? value : formatDayKey(value);
  ensureDayKey(dayKey);

  const [year, month, day] = dayKey.split("-");

  return `${day}-${month}-${year}`;
};

export const parseDisplayDayInput = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error("Data invalida. Use o formato DD-MM-AAAA.");
  }

  if (DAY_KEY_PATTERN.test(normalizedValue)) {
    parseDayKey(normalizedValue);
    return normalizedValue;
  }

  ensureDisplayDayKey(normalizedValue);

  const [day, month, year] = normalizedValue.split("-");
  const parsedDayKey = `${year}-${month}-${day}`;

  parseDayKey(parsedDayKey);

  return parsedDayKey;
};

export const buildDayTimeIso = (day: string, time: string) => {
  ensureDayKey(day);
  ensureTimeKey(time);

  const [year, month, date] = day.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const localDateTime = new Date(year, month - 1, date, hours, minutes, 0, 0);

  return `${localDateTime.toISOString().slice(0, 19)}+00:00`;
};

export const extractTimePart = (iso: string) => {
  const localDateTime = new Date(iso);
  const { hours, minutes, seconds } = getLocalTimeParts(localDateTime);

  return `${hours}:${minutes}:${seconds}`;
};

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
