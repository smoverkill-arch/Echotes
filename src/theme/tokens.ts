export const colors = {
  background: "#161c19",
  surface: "#1e2722",
  surfaceMuted: "#252f2a",
  surfacePressed: "#2d3b34",
  border: "#2e3d36",
  borderStrong: "#3e5448",
  text: "#deeae0",
  textMuted: "#7a9285",
  textSubtle: "#4e6459",
  primary: "#d9a432",
  primaryPressed: "#c0901e",
  primarySoft: "#332808",
  primaryText: "#1a1000",
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
} as const;

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 4,
  md: 6,
  lg: 14,
  pill: 999,
} as const;

export const typography = {
  eyebrow: 10,
  caption: 12,
  body: 14,
  bodyLarge: 16,
  title: 26,
} as const;

export const touchTarget = {
  min: 44,
  androidMin: 48,
} as const;
