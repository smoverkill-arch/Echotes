import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppearanceMode = "dark" | "light";
export type AccentColor = "green" | "slate" | "amber";
export type TimelineDensity = "compact" | "normal" | "airy";

export interface AppearancePalette {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfacePressed: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  primaryText: string;
  note: string;
  noteSoft: string;
  task: string;
  taskSoft: string;
  ghostBorder: string;
  shadowColor: string;
  danger: string;
  dangerSoft: string;
  disabled: string;
  white: string;
}

interface AppearanceStore {
  mode: AppearanceMode;
  accent: AccentColor;
  density: TimelineDensity;
  setMode: (mode: AppearanceMode) => void;
  setAccent: (accent: AccentColor) => void;
  setDensity: (density: TimelineDensity) => void;
}

const darkBase = {
  background: "#161c19",
  surface: "#1e2722",
  surfaceMuted: "#252f2a",
  surfacePressed: "#2d3b34",
  border: "#2e3d36",
  borderStrong: "#3e5448",
  text: "#deeae0",
  textMuted: "#7a9285",
  textSubtle: "#4e6459",
  note: "#5ab4e0",
  noteSoft: "#0b2535",
  task: "#d9a432",
  taskSoft: "#332808",
  ghostBorder: "rgba(180,148,80,0.38)",
  shadowColor: "rgba(0,0,0,0.55)",
  danger: "#f47171",
  dangerSoft: "#381010",
  disabled: "#4e6459",
  white: "#ffffff",
};

const lightBase = {
  background: "#f2efe8",
  surface: "#fdfcf8",
  surfaceMuted: "#ece9e0",
  surfacePressed: "#e0ddd4",
  border: "#d4cfc3",
  borderStrong: "#b0a898",
  text: "#1a1e1c",
  textMuted: "#5c6660",
  textSubtle: "#8a9490",
  note: "#1a5c8f",
  noteSoft: "#daeefa",
  task: "#8a5d0c",
  taskSoft: "#fef0cc",
  ghostBorder: "#c8c2b4",
  shadowColor: "rgba(0,0,0,0.10)",
  danger: "#b42318",
  dangerSoft: "#fee4e2",
  disabled: "#8a9490",
  white: "#ffffff",
};

const accentPalettes: Record<
  AppearanceMode,
  Record<AccentColor, Pick<AppearancePalette, "primary" | "primaryPressed" | "primarySoft" | "primaryText">>
> = {
  dark: {
    green: {
      primary: "#1dc98a",
      primaryPressed: "#18b07a",
      primarySoft: "#0c2e1e",
      primaryText: "#081a10",
    },
    slate: {
      primary: "#3a6fdd",
      primaryPressed: "#2e5ec4",
      primarySoft: "#0e1f48",
      primaryText: "#ffffff",
    },
    amber: {
      primary: "#d9a432",
      primaryPressed: "#c0901e",
      primarySoft: "#332808",
      primaryText: "#1a1000",
    },
  },
  light: {
    green: {
      primary: "#0a6b50",
      primaryPressed: "#085e44",
      primarySoft: "#d2f0e6",
      primaryText: "#ffffff",
    },
    slate: {
      primary: "#2a50c8",
      primaryPressed: "#2445ad",
      primarySoft: "#dce6fb",
      primaryText: "#ffffff",
    },
    amber: {
      primary: "#8a5d0c",
      primaryPressed: "#754d08",
      primarySoft: "#fef0cc",
      primaryText: "#ffffff",
    },
  },
};

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      mode: "dark",
      accent: "amber",
      density: "normal",
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setDensity: (density) => set({ density }),
    }),
    {
      name: "echotes-appearance",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function getAppearancePalette(
  mode: AppearanceMode,
  accent: AccentColor,
): AppearancePalette {
  const base = mode === "dark" ? darkBase : lightBase;
  return {
    ...base,
    ...accentPalettes[mode][accent],
  };
}

export function useAppearancePalette(): AppearancePalette {
  const mode = useAppearanceStore((state) => state.mode);
  const accent = useAppearanceStore((state) => state.accent);
  return getAppearancePalette(mode, accent);
}

export const densityMetrics = {
  compact: {
    cardPaddingVertical: 8,
    cardPaddingHorizontal: 12,
    timelineGap: 5,
    noteTitleSize: 14,
    taskTitleSize: 13,
    previewLineHeight: 19,
    showPreview: false,
  },
  normal: {
    cardPaddingVertical: 12,
    cardPaddingHorizontal: 14,
    timelineGap: 9,
    noteTitleSize: 16,
    taskTitleSize: 15,
    previewLineHeight: 21,
    showPreview: true,
  },
  airy: {
    cardPaddingVertical: 16,
    cardPaddingHorizontal: 17,
    timelineGap: 14,
    noteTitleSize: 17,
    taskTitleSize: 16,
    previewLineHeight: 24,
    showPreview: true,
  },
} as const;
