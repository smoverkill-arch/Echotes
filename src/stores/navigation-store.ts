import { create } from "zustand";

import type { PendingReaderOpen } from "../types/note";

export interface TemporalNavigationContext {
  sourceDate: string;
  destinationDate: string;
  sourceTaskId: string;
  returnScrollOffset: number | null;
  pendingOpenTaskId: string | null;
  isTemporalNavigationActive: boolean;
}

interface NavigationStore {
  temporalNavigationContext: TemporalNavigationContext | null;
  pendingReaderOpen: PendingReaderOpen | null;
  setTemporalNavigationContext: (
    context: Omit<
      TemporalNavigationContext,
      "isTemporalNavigationActive" | "pendingOpenTaskId"
    >,
  ) => void;
  consumePendingOpenTaskId: () => void;
  setPendingReaderOpen: (pendingReaderOpen: PendingReaderOpen) => void;
  consumePendingReaderOpen: (requestId: string) => void;
  clearPendingReaderOpen: () => void;
  setReturnScrollOffset: (offset: number | null) => void;
  clearTemporalNavigationContext: () => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  temporalNavigationContext: null,
  pendingReaderOpen: null,

  setTemporalNavigationContext: (context) => {
    set({
      temporalNavigationContext: {
        ...context,
        pendingOpenTaskId: context.sourceTaskId,
        isTemporalNavigationActive: true,
      },
    });
  },

  consumePendingOpenTaskId: () => {
    set((state) => ({
      temporalNavigationContext: state.temporalNavigationContext
        ? {
            ...state.temporalNavigationContext,
            pendingOpenTaskId: null,
          }
        : null,
    }));
  },

  setPendingReaderOpen: (pendingReaderOpen) => {
    set({ pendingReaderOpen });
  },

  consumePendingReaderOpen: (requestId) => {
    set((state) => ({
      pendingReaderOpen:
        state.pendingReaderOpen?.requestId === requestId
          ? null
          : state.pendingReaderOpen,
    }));
  },

  clearPendingReaderOpen: () => {
    set({ pendingReaderOpen: null });
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
