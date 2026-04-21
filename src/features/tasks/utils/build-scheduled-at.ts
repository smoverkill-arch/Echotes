import { buildDayTimeIso } from "../../../utils/date";

export const buildScheduledAt = (
  targetDay: string,
  scheduledTime: string | null,
) => {
  if (!scheduledTime) {
    return null;
  }

  return buildDayTimeIso(targetDay, scheduledTime);
};
