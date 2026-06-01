import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingStore {
  hasSeen: boolean;
  hasHydrated: boolean;
  setSeen: () => void;
  markHydrated: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasSeen: false,
      hasHydrated: false,
      setSeen: () => set({ hasSeen: true }),
      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "echotes-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasSeen: state.hasSeen }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
