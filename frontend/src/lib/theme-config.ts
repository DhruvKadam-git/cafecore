export type ThemeId =
  | "brewhouse"
  | "royal_navy"
  | "emerald_luxury"
  | "black_gold"
  | "rose_platinum"
  | "midnight_command"
  | "arctic_white"
  | "coral_sunrise";

export type KDSMode = "light" | "dark";

export interface ThemeColors {
  primary: string;
  sidebar: string;
  background: string;
  surface: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  sidebarActiveIcon: string;
  input: string;
}

export interface KDSThemeColors {
  bg: string;
  surface: string;
  elevated: string;
  searchBg: string;
  border: string;
  text: string;
  muted: string;
  timer: string;
  amber: string;
  orange: string;
  green: string;
  online: string;
  amberBg: string;
  orangeBg: string;
  greenBg: string;
  filterActiveBg: string;
  filterActiveText: string;
  danger: string;
  dangerBg: string;
  glowAmber: string;
  glowOrange: string;
  glowGreen: string;
  actionPrimaryBg: string;
  actionPrimaryText: string;
  columnHeaderBg: string;
  noteBg: string;
  noteText: string;
  itemDone: string;
  shadow: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  category: string;
  kdsMode: KDSMode;
  colors: ThemeColors;
  kds: KDSThemeColors;
}

export const STORAGE_KEY = "brewhouse-theme";
export const DEFAULT_THEME_ID: ThemeId = "brewhouse";

/** Maps removed theme IDs to their replacements for localStorage migration */
export const REMOVED_THEME_ALIASES: Record<string, ThemeId> = {
  neo_ops: "midnight_command",
  luxury_ops: "black_gold",
  dark_emerald_ops: "emerald_luxury",
  midnight_purple: "midnight_command",
};

const CREAM_KITCHEN_KDS: KDSThemeColors = {
  bg: "#FFFBF5",
  surface: "#FFFFFF",
  elevated: "#F5F0E8",
  searchBg: "#FFFFFF",
  border: "#E7D9C8",
  text: "#1C1410",
  muted: "#78716C",
  timer: "#A8A29E",
  amber: "#D97706",
  orange: "#EA580C",
  green: "#16A34A",
  online: "#22C55E",
  amberBg: "#FEF3C7",
  orangeBg: "#FFEDD5",
  greenBg: "#DCFCE7",
  filterActiveBg: "#1C1410",
  filterActiveText: "#FFFFFF",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  glowAmber: "rgba(217, 119, 6, 0.2)",
  glowOrange: "rgba(234, 88, 12, 0.2)",
  glowGreen: "rgba(22, 163, 74, 0.2)",
  actionPrimaryBg: "#D97706",
  actionPrimaryText: "#FFFFFF",
  columnHeaderBg: "#F5F0E8",
  noteBg: "#FEF3C7",
  noteText: "#92400E",
  itemDone: "#A8A29E",
  shadow: "rgba(15, 23, 42, 0.08)",
};

const ARCTIC_WHITE_KDS: KDSThemeColors = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  elevated: "#F1F5F9",
  searchBg: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  timer: "#94A3B8",
  amber: "#F59E0B",
  orange: "#3B82F6",
  green: "#10B981",
  online: "#22C55E",
  amberBg: "#FEF3C7",
  orangeBg: "#DBEAFE",
  greenBg: "#D1FAE5",
  filterActiveBg: "#0F172A",
  filterActiveText: "#FFFFFF",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  glowAmber: "rgba(245, 158, 11, 0.2)",
  glowOrange: "rgba(59, 130, 246, 0.2)",
  glowGreen: "rgba(16, 185, 129, 0.2)",
  actionPrimaryBg: "#F59E0B",
  actionPrimaryText: "#0F172A",
  columnHeaderBg: "#F1F5F9",
  noteBg: "#FEF9C3",
  noteText: "#854D0E",
  itemDone: "#94A3B8",
  shadow: "rgba(15, 23, 42, 0.08)",
};

const CORAL_SUNRISE_KDS: KDSThemeColors = {
  bg: "#FFF7ED",
  surface: "#FFFFFF",
  elevated: "#FFEDD5",
  searchBg: "#FFFFFF",
  border: "#FED7AA",
  text: "#1C1917",
  muted: "#78716C",
  timer: "#A8A29E",
  amber: "#F97316",
  orange: "#E11D48",
  green: "#059669",
  online: "#22C55E",
  amberBg: "#FFEDD5",
  orangeBg: "#FFE4E6",
  greenBg: "#D1FAE5",
  filterActiveBg: "#1C1917",
  filterActiveText: "#FFFFFF",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  glowAmber: "rgba(249, 115, 22, 0.2)",
  glowOrange: "rgba(225, 29, 72, 0.2)",
  glowGreen: "rgba(5, 150, 105, 0.2)",
  actionPrimaryBg: "#F97316",
  actionPrimaryText: "#FFFFFF",
  columnHeaderBg: "#FFEDD5",
  noteBg: "#FEF3C7",
  noteText: "#C2410C",
  itemDone: "#A8A29E",
  shadow: "rgba(15, 23, 42, 0.08)",
};

const SAGE_GARDEN_KDS: KDSThemeColors = {
  bg: "#F0FDF4",
  surface: "#FFFFFF",
  elevated: "#DCFCE7",
  searchBg: "#FFFFFF",
  border: "#BBF7D0",
  text: "#052E16",
  muted: "#166534",
  timer: "#4ADE80",
  amber: "#CA8A04",
  orange: "#0D9488",
  green: "#15803D",
  online: "#22C55E",
  amberBg: "#FEF9C3",
  orangeBg: "#CCFBF1",
  greenBg: "#DCFCE7",
  filterActiveBg: "#052E16",
  filterActiveText: "#FFFFFF",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  glowAmber: "rgba(202, 138, 4, 0.2)",
  glowOrange: "rgba(13, 148, 136, 0.2)",
  glowGreen: "rgba(21, 128, 61, 0.2)",
  actionPrimaryBg: "#CA8A04",
  actionPrimaryText: "#FFFFFF",
  columnHeaderBg: "#DCFCE7",
  noteBg: "#FEF9C3",
  noteText: "#854D0E",
  itemDone: "#4ADE80",
  shadow: "rgba(15, 23, 42, 0.08)",
};

const ROSE_PLATINUM_BRIGHT_KDS: KDSThemeColors = {
  bg: "#FFF1F2",
  surface: "#FFFFFF",
  elevated: "#FFE4E6",
  searchBg: "#FFFFFF",
  border: "#FECDD3",
  text: "#4C0519",
  muted: "#9F1239",
  timer: "#FB7185",
  amber: "#E11D48",
  orange: "#F59E0B",
  green: "#16A34A",
  online: "#22C55E",
  amberBg: "#FFE4E6",
  orangeBg: "#FEF3C7",
  greenBg: "#DCFCE7",
  filterActiveBg: "#4C0519",
  filterActiveText: "#FFFFFF",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  glowAmber: "rgba(225, 29, 72, 0.2)",
  glowOrange: "rgba(245, 158, 11, 0.2)",
  glowGreen: "rgba(22, 163, 74, 0.2)",
  actionPrimaryBg: "#E11D48",
  actionPrimaryText: "#FFFFFF",
  columnHeaderBg: "#FFE4E6",
  noteBg: "#FFE4E6",
  noteText: "#9F1239",
  itemDone: "#FDA4AF",
  shadow: "rgba(15, 23, 42, 0.08)",
};

const MIDNIGHT_COMMAND_KDS: KDSThemeColors = {
  bg: "#0C0E12",
  surface: "#151921",
  elevated: "#1C2230",
  searchBg: "#111620",
  border: "#2A3344",
  text: "#F1F5F9",
  muted: "#94A3B8",
  timer: "#64748B",
  amber: "#F5A524",
  orange: "#3B82F6",
  green: "#22C55E",
  online: "#4ADE80",
  amberBg: "#3D2E14",
  orangeBg: "#1E3A5F",
  greenBg: "#14532D",
  filterActiveBg: "#FFFFFF",
  filterActiveText: "#0C0E12",
  danger: "#EF4444",
  dangerBg: "#3B1515",
  glowAmber: "rgba(245, 165, 36, 0.25)",
  glowOrange: "rgba(59, 130, 246, 0.25)",
  glowGreen: "rgba(34, 197, 94, 0.25)",
  actionPrimaryBg: "#F5A524",
  actionPrimaryText: "#0C0E12",
  columnHeaderBg: "#1C2230",
  noteBg: "#2A2210",
  noteText: "#F5A524",
  itemDone: "#64748B",
  shadow: "rgba(0, 0, 0, 0.45)",
};

const LUXURY_OPS_KDS: KDSThemeColors = {
  bg: "#0A0A0A",
  surface: "#141414",
  elevated: "#1F1F1F",
  searchBg: "#101010",
  border: "#2E2E2E",
  text: "#F8F8F8",
  muted: "#9CA3AF",
  timer: "#6B7280",
  amber: "#D4AF37",
  orange: "#C9A227",
  green: "#4ADE80",
  online: "#4ADE80",
  amberBg: "#3D3520",
  orangeBg: "#3D3520",
  greenBg: "#1A3D24",
  filterActiveBg: "#D4AF37",
  filterActiveText: "#0A0A0A",
  danger: "#EF4444",
  dangerBg: "#3B1515",
  glowAmber: "rgba(212, 175, 55, 0.3)",
  glowOrange: "rgba(201, 162, 39, 0.25)",
  glowGreen: "rgba(74, 222, 128, 0.25)",
  actionPrimaryBg: "#D4AF37",
  actionPrimaryText: "#0A0A0A",
  columnHeaderBg: "#1F1F1F",
  noteBg: "#2A2418",
  noteText: "#D4AF37",
  itemDone: "#6B7280",
  shadow: "rgba(0, 0, 0, 0.5)",
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "brewhouse",
    name: "Brewhouse Cream Kitchen",
    category: "Bright",
    kdsMode: "light",
    colors: {
      primary: "#C9783A",
      sidebar: "#866443",
      background: "#F4F0EA",
      surface: "#F8F4EE",
      border: "#D8CCBF",
      success: "#789658",
      warning: "#D6A144",
      danger: "#D95C4D",
      textPrimary: "#2C2118",
      textSecondary: "#735F4F",
      textMuted: "#9A8B7D",
      sidebarActiveBg: "#FAF6F0",
      sidebarActiveText: "#2D2218",
      sidebarActiveIcon: "#CB7A39",
      input: "#FFFFFF",
    },
    kds: CREAM_KITCHEN_KDS,
  },
  {
    id: "arctic_white",
    name: "Arctic White Ops",
    category: "Bright",
    kdsMode: "light",
    colors: {
      primary: "#3B82F6",
      sidebar: "#0F172A",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      border: "#E2E8F0",
      success: "#10B981",
      warning: "#F59E0B",
      danger: "#EF4444",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textMuted: "#94A3B8",
      sidebarActiveBg: "#F1F5F9",
      sidebarActiveText: "#0F172A",
      sidebarActiveIcon: "#3B82F6",
      input: "#FFFFFF",
    },
    kds: ARCTIC_WHITE_KDS,
  },
  {
    id: "coral_sunrise",
    name: "Coral Sunrise",
    category: "Bright",
    kdsMode: "light",
    colors: {
      primary: "#F97316",
      sidebar: "#9A3412",
      background: "#FFF7ED",
      surface: "#FFFFFF",
      border: "#FED7AA",
      success: "#059669",
      warning: "#F97316",
      danger: "#DC2626",
      textPrimary: "#1C1917",
      textSecondary: "#78716C",
      textMuted: "#A8A29E",
      sidebarActiveBg: "#FFEDD5",
      sidebarActiveText: "#1C1917",
      sidebarActiveIcon: "#F97316",
      input: "#FFFFFF",
    },
    kds: CORAL_SUNRISE_KDS,
  },
  {
    id: "emerald_luxury",
    name: "Sage Garden",
    category: "Bright",
    kdsMode: "light",
    colors: {
      primary: "#0F766E",
      sidebar: "#064E3B",
      background: "#F0FDF4",
      surface: "#FFFFFF",
      border: "#BBF7D0",
      success: "#15803D",
      warning: "#CA8A04",
      danger: "#DC2626",
      textPrimary: "#052E16",
      textSecondary: "#166534",
      textMuted: "#4ADE80",
      sidebarActiveBg: "#DCFCE7",
      sidebarActiveText: "#052E16",
      sidebarActiveIcon: "#0F766E",
      input: "#FFFFFF",
    },
    kds: SAGE_GARDEN_KDS,
  },
  {
    id: "rose_platinum",
    name: "Rose Platinum",
    category: "Bright",
    kdsMode: "light",
    colors: {
      primary: "#E11D48",
      sidebar: "#881337",
      background: "#FFF1F2",
      surface: "#FFFFFF",
      border: "#FECDD3",
      success: "#16A34A",
      warning: "#F59E0B",
      danger: "#DC2626",
      textPrimary: "#4C0519",
      textSecondary: "#9F1239",
      textMuted: "#FDA4AF",
      sidebarActiveBg: "#FFE4E6",
      sidebarActiveText: "#4C0519",
      sidebarActiveIcon: "#E11D48",
      input: "#FFFFFF",
    },
    kds: ROSE_PLATINUM_BRIGHT_KDS,
  },
  {
    id: "midnight_command",
    name: "Midnight Command Center",
    category: "Dark",
    kdsMode: "dark",
    colors: {
      primary: "#F5A524",
      sidebar: "#0C0E12",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      border: "#E2E8F0",
      success: "#22C55E",
      warning: "#F5A524",
      danger: "#EF4444",
      textPrimary: "#0C0E12",
      textSecondary: "#475569",
      textMuted: "#94A3B8",
      sidebarActiveBg: "#F1F5F9",
      sidebarActiveText: "#0C0E12",
      sidebarActiveIcon: "#F5A524",
      input: "#FFFFFF",
    },
    kds: MIDNIGHT_COMMAND_KDS,
  },
  {
    id: "royal_navy",
    name: "Royal Navy",
    category: "Dark",
    kdsMode: "dark",
    colors: {
      primary: "#1E3A8A",
      sidebar: "#0F172A",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      border: "#CBD5E1",
      success: "#16A34A",
      warning: "#F59E0B",
      danger: "#DC2626",
      textPrimary: "#0F172A",
      textSecondary: "#475569",
      textMuted: "#94A3B8",
      sidebarActiveBg: "#E2E8F0",
      sidebarActiveText: "#0F172A",
      sidebarActiveIcon: "#1E3A8A",
      input: "#FFFFFF",
    },
    kds: {
      ...MIDNIGHT_COMMAND_KDS,
      bg: "#0A1628",
      surface: "#152238",
      elevated: "#1E2F4A",
      searchBg: "#111D33",
      border: "#2D4A6E",
      amber: "#60A5FA",
      orange: "#F59E0B",
      green: "#16A34A",
      amberBg: "#1E3A5F",
      orangeBg: "#3D2E14",
      filterActiveText: "#0F172A",
      glowAmber: "rgba(96, 165, 250, 0.25)",
      glowOrange: "rgba(245, 158, 11, 0.25)",
      actionPrimaryBg: "#60A5FA",
      actionPrimaryText: "#0F172A",
      columnHeaderBg: "#1E2F4A",
    },
  },
  {
    id: "black_gold",
    name: "Black Gold",
    category: "Dark",
    kdsMode: "dark",
    colors: {
      primary: "#D4AF37",
      sidebar: "#0A0A0A",
      background: "#121212",
      surface: "#1E1E1E",
      border: "#2A2A2A",
      success: "#22C55E",
      warning: "#D4AF37",
      danger: "#EF4444",
      textPrimary: "#F8F8F8",
      textSecondary: "#CFCFCF",
      textMuted: "#9CA3AF",
      sidebarActiveBg: "#2A2A2A",
      sidebarActiveText: "#F8F8F8",
      sidebarActiveIcon: "#D4AF37",
      input: "#1E1E1E",
    },
    kds: LUXURY_OPS_KDS,
  },
];

function kdsToCssVars(kds: KDSThemeColors): Record<string, string> {
  return {
    "--kds-bg": kds.bg,
    "--kds-surface": kds.surface,
    "--kds-elevated": kds.elevated,
    "--kds-search-bg": kds.searchBg,
    "--kds-border": kds.border,
    "--kds-text": kds.text,
    "--kds-muted": kds.muted,
    "--kds-timer": kds.timer,
    "--kds-amber": kds.amber,
    "--kds-orange": kds.orange,
    "--kds-green": kds.green,
    "--kds-online": kds.online,
    "--kds-amber-bg": kds.amberBg,
    "--kds-orange-bg": kds.orangeBg,
    "--kds-green-bg": kds.greenBg,
    "--kds-filter-active-bg": kds.filterActiveBg,
    "--kds-filter-active-text": kds.filterActiveText,
    "--kds-danger": kds.danger,
    "--kds-danger-bg": kds.dangerBg,
    "--kds-glow-amber": kds.glowAmber,
    "--kds-glow-orange": kds.glowOrange,
    "--kds-glow-green": kds.glowGreen,
    "--kds-action-primary-bg": kds.actionPrimaryBg,
    "--kds-action-primary-text": kds.actionPrimaryText,
    "--kds-column-header-bg": kds.columnHeaderBg,
    "--kds-note-bg": kds.noteBg,
    "--kds-note-text": kds.noteText,
    "--kds-item-done": kds.itemDone,
    "--kds-shadow": kds.shadow,
  };
}

export function getKdsMode(kds: KDSThemeColors): KDSMode {
  const hex = kds.bg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "light" : "dark";
}

export function resolveThemeId(stored: string | null): ThemeId {
  if (!stored) return DEFAULT_THEME_ID;
  if (isValidThemeId(stored)) return stored;
  const alias = REMOVED_THEME_ALIASES[stored];
  if (alias) return alias;
  return DEFAULT_THEME_ID;
}

export function isValidThemeId(id: string): id is ThemeId {
  return THEMES.some((t) => t.id === id);
}

export function getThemeById(id: ThemeId): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function themeToCssVars(theme: ThemeDefinition): Record<string, string> {
  const { colors, kds } = theme;
  return {
    "--background": colors.background,
    "--foreground": colors.textPrimary,
    "--primary": colors.primary,
    "--sidebar": colors.sidebar,
    "--surface": colors.surface,
    "--card": colors.surface,
    "--border-color": colors.border,
    "--success": colors.success,
    "--gold": colors.warning,
    "--warning": colors.warning,
    "--danger": colors.danger,
    "--text-heading": colors.textPrimary,
    "--text-body": colors.textSecondary,
    "--text-muted": colors.textMuted,
    "--sidebar-active-bg": colors.sidebarActiveBg,
    "--sidebar-active-text": colors.sidebarActiveText,
    "--sidebar-active-icon": colors.sidebarActiveIcon,
    "--input": colors.input,
    ...kdsToCssVars(kds),
  };
}

export function applyThemeToDocument(themeId: ThemeId): void {
  if (typeof document === "undefined") return;
  const theme = getThemeById(themeId);
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  const vars = themeToCssVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

/** Serialized theme vars for anti-flash inline script */
export function getThemeVarsForScript(): Record<ThemeId, Record<string, string>> {
  return Object.fromEntries(
    THEMES.map((t) => [t.id, themeToCssVars(t)])
  ) as Record<ThemeId, Record<string, string>>;
}

/** Theme vars including removed aliases for anti-flash migration */
export function getThemeVarsForScriptWithAliases(): Record<string, Record<string, string>> {
  const base = getThemeVarsForScript() as Record<string, Record<string, string>>;
  for (const [removed, replacement] of Object.entries(REMOVED_THEME_ALIASES)) {
    base[removed] = base[replacement];
  }
  return base;
}
