import { create } from "zustand";

export interface TemporalNavigationContext {
  sourceDate: string;
  destinationDate: string;
  sourceTaskId: string;
  returnScrollOffset: number | null;
  isTemporalNavigationActive: boolean;
}

interface NavigationStore {
  temporalNavigationContext: TemporalNavigationContext | null;
  setTemporalNavigationContext: (
    context: Omit<TemporalNavigationContext, "isTemporalNavigationActive">,
  ) => void;
  setReturnScrollOffset: (offset: number | null) => void;
  clearTemporalNavigationContext: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  temporalNavigationContext: null,

  setTemporalNavigationContext: (context) => {
    set({
      temporalNavigationContext: {
        ...context,
        isTemporalNavigationActive: true,
      },
    });
  },

  setReturnScrollOffset: (offset) => {
    set((state) => ({
      temporalNavigationContext: state.temporalNavigationContext
        ? {
            ...state.temporalNavigationContext,
            returnScrollOffset: offset,
          }
        : null,
    }));
  },

  clearTemporalNavigationContext: () => {
    set({ temporalNavigationContext: null });
  },
}));
