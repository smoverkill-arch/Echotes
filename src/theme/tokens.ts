// =============================================================================
// ECHOTES — Design Tokens
// Fonte da verdade visual do app. Toda cor, fonte, espaçamento e sombra
// deve ser referenciada a partir deste arquivo.
// =============================================================================

// -----------------------------------------------------------------------------
// Cores — Light Mode
// Paleta Editorial Orgânica: verde floresta, azul mineral, âmbar terroso.
// -----------------------------------------------------------------------------
export const colors = {
  // Superfícies
  background: "#f4f6f2",
  surface: "#ffffff",
  surfaceMuted: "#eef3ef",
  surfacePressed: "#e5ece7",

  // Bordas
  border: "#d7ded8",
  borderStrong: "#9aa89f",

  // Texto
  text: "#17211b",
  textMuted: "#5b665f",
  textSubtle: "#7a8580",

  // Primária (verde floresta)
  primary: "#0f6b55",
  primaryPressed: "#0b5846",
  primarySoft: "#dff1eb",

  // Nota (azul mineral)
  note: "#1d5f8f",
  noteSoft: "#e4f0fb",
  noteBorder: "#bdd9f5",

  // Tarefa não-agendada (âmbar terroso)
  task: "#94620f",
  taskSoft: "#fff3d6",
  taskBorder: "#f5d78a",

  // Tarefa agendada (verde-menta, sinaliza compromisso no tempo)
  taskTimed: "#166534",
  taskTimedSoft: "#f0fdf4",
  taskTimedBorder: "#86efac",

  // Tarefa projetada / ghost (laranja-terra, sinaliza projeção futura)
  taskGhost: "#9a3412",
  taskGhostSoft: "#fff7ed",
  taskGhostBorder: "#fdba74",

  // Feedback
  danger: "#b42318",
  dangerSoft: "#fee4e2",
  dangerBorder: "#fecaca",

  // Utilitários
  disabled: "#a8b0aa",
  overlay: "rgba(23, 33, 27, 0.32)",
  white: "#ffffff",
} as const;

// -----------------------------------------------------------------------------
// Cores — Dark Mode
// Fundo quase-preto com tom verde (floresta noturna), não cinza genérico.
// Os tokens espelham a estrutura do light mode 1:1.
// -----------------------------------------------------------------------------
export const colorsDark = {
  // Superfícies
  background: "#111510",
  surface: "#1a201a",
  surfaceMuted: "#1f281f",
  surfacePressed: "#252e25",

  // Bordas
  border: "#2d3a2d",
  borderStrong: "#4a5c4a",

  // Texto
  text: "#e8ede4",
  textMuted: "#8fa88c",
  textSubtle: "#6a7d68",

  // Primária (verde mais claro p/ contrastar com fundo escuro)
  primary: "#5dc4a0",
  primaryPressed: "#4db896",
  primarySoft: "#1a3a2e",

  // Nota (azul mais claro)
  note: "#6aacdb",
  noteSoft: "#1a2d3d",
  noteBorder: "#2a4a63",

  // Tarefa não-agendada
  task: "#d4a456",
  taskSoft: "#2d2010",
  taskBorder: "#5a3e10",

  // Tarefa agendada
  taskTimed: "#4ade80",
  taskTimedSoft: "#0d2010",
  taskTimedBorder: "#1a4020",

  // Tarefa projetada / ghost
  taskGhost: "#fb923c",
  taskGhostSoft: "#2d1500",
  taskGhostBorder: "#5a2e00",

  // Feedback
  danger: "#e57373",
  dangerSoft: "#2d1515",
  dangerBorder: "#5a2020",

  // Utilitários
  disabled: "#4a5548",
  overlay: "rgba(5, 8, 5, 0.55)",
  white: "#ffffff",
} as const;

// -----------------------------------------------------------------------------
// Tipografia — Famílias de fonte
// Lora (serif editorial) para display/títulos.
// Inter (sans-serif moderna) para corpo, labels e UI.
//
// IMPORTANTE: Os nomes aqui devem corresponder exatamente às fontes carregadas
// em app/_layout.tsx via useFonts(). Expo usa o nome do arquivo como chave.
// -----------------------------------------------------------------------------
export const fontFamily = {
  // Display / Títulos editoriais
  displayBold: "Lora_700Bold" as const,
  displaySemiBold: "Lora_600SemiBold" as const,

  // Corpo / Interface
  bodyRegular: "Inter_400Regular" as const,
  bodyMedium: "Inter_500Medium" as const,
  bodySemiBold: "Inter_600SemiBold" as const,
  bodyBold: "Inter_700Bold" as const,
  bodyExtraBold: "Inter_800ExtraBold" as const,
} as const;

// -----------------------------------------------------------------------------
// Tipografia — Escala de tamanhos
// -----------------------------------------------------------------------------
export const typography = {
  eyebrow: 11,
  caption: 12,
  body: 14,
  bodyLarge: 16,
  title: 22,
  display: 28,
} as const;

// -----------------------------------------------------------------------------
// Tipografia — Line heights (multiplicadores)
// -----------------------------------------------------------------------------
export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.7,
} as const;

// -----------------------------------------------------------------------------
// Tipografia — Letter spacing (px, para RN)
// -----------------------------------------------------------------------------
export const letterSpacing = {
  tight: -0.3,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.4,
} as const;

// -----------------------------------------------------------------------------
// Espaçamento
// -----------------------------------------------------------------------------
export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// -----------------------------------------------------------------------------
// Border radius
// -----------------------------------------------------------------------------
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 999,
} as const;

// -----------------------------------------------------------------------------
// Sombras
// Usadas para dar profundidade aos cards e superfícies elevadas.
// Em Android, elevation é o equivalente.
// -----------------------------------------------------------------------------
export const shadow = {
  sm: {
    shadowColor: "#17211b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#17211b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#17211b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// -----------------------------------------------------------------------------
// Touch targets mínimos (acessibilidade)
// -----------------------------------------------------------------------------
export const touchTarget = {
  min: 44,
  androidMin: 48,
} as const;
