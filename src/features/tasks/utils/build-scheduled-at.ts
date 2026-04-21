import { buildDayTimeIso } from "../../../utils/date";

export const buildScheduledAt = (
  targetDay: string,
  scheduledTime: string | null,
) => {
  const normalizedScheduledTime = scheduledTime?.trim() ?? "";

  if (!normalizedScheduledTime) {
    return null;
  }

  return buildDayTimeIso(targetDay, normalizedScheduledTime);
};
