import { create } from "zustand";

import type { DayTab, TimelineItemKind } from "../types/timeline";

export interface ReaderState {
  kind: TimelineItemKind | null;
  id: string | null;
  isOpen: boolean;
}

export interface EditorState {
  mode: "create" | "edit" | null;
  kind: TimelineItemKind | null;
  id: string | null;
  isOpen: boolean;
}

interface UIStore {
  activeTab: DayTab;
  readerState: ReaderState;
  editorState: EditorState;
  setActiveTab: (tab: DayTab) => void;
  openReader: (kind: TimelineItemKind, id: string) => void;
  closeReader: () => void;
  openEditor: (params: {
    mode: "create" | "edit";
    kind: TimelineItemKind;
    id?: string;
  }) => void;
  closeEditor: () => void;
}

const closedReaderState: ReaderState = {
  kind: null,
  id: null,
  isOpen: false,
};

const closedEditorState: EditorState = {
  mode: null,
  kind: null,
  id: null,
  isOpen: false,
};

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "tasks",
  readerState: closedReaderState,
  editorState: closedEditorState,

  setActiveTab: (activeTab) => set({ activeTab }),

  openReader: (kind, id) => {
    set({
      readerState: {
        kind,
        id,
        isOpen: true,
      },
      editorState: closedEditorState,
    });
  },

  closeReader: () => set({ readerState: closedReaderState }),

  openEditor: ({ mode, kind, id }) => {
    set({
      readerState: closedReaderState,
      editorState: {
        mode,
        kind,
        id: id ?? null,
        isOpen: true,
      },
    });
  },

  closeEditor: () => set({ editorState: closedEditorState }),
}));
