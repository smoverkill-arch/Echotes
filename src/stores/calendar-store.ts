import { create } from "zustand";

import { getTodayDateKey } from "../utils/date";

interface CalendarStore {
  selectedDate: string;
  clockDate: string;
  setSelectedDate: (date: string) => void;
  setClockDate: (date: string) => void;
  syncClockDate: (referenceDate?: Date) => void;
  resetSelectedDateToClock: () => void;
}

const initialClockDate = getTodayDateKey();

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  selectedDate: initialClockDate,
  clockDate: initialClockDate,

  setSelectedDate: (selectedDate) => set({ selectedDate }),

  setClockDate: (clockDate) => set({ clockDate }),

  syncClockDate: (referenceDate = new Date()) => {
    const nextClockDate = getTodayDateKey(referenceDate);

    set({ clockDate: nextClockDate });
  },

  resetSelectedDateToClock: () => {
    set({ selectedDate: get().clockDate });
  },
}));
