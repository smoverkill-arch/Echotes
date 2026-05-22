import { create } from "zustand";

import { getTodayDateKey } from "../utils/date";

export type CalendarMode = "week" | "month";

interface CalendarStore {
  selectedDate: string;
  clockDate: string;
  calendarMode: CalendarMode;
  setSelectedDate: (date: string) => void;
  setClockDate: (date: string) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  syncClockDate: (referenceDate?: Date) => void;
  resetSelectedDateToClock: () => void;
}

const initialClockDate = getTodayDateKey();

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  selectedDate: initialClockDate,
  clockDate: initialClockDate,
  calendarMode: "week",

  setSelectedDate: (selectedDate) => set({ selectedDate }),

  setClockDate: (clockDate) => set({ clockDate }),

  setCalendarMode: (calendarMode) => set({ calendarMode }),

  syncClockDate: (referenceDate = new Date()) => {
    const nextClockDate = getTodayDateKey(referenceDate);

    set({ clockDate: nextClockDate });
  },

  resetSelectedDateToClock: () => {
    set({ selectedDate: get().clockDate });
  },
}));
