/**
 * /config/categoryConfig.js
 *
 * UNIVERSAL CATEGORY CONFIGURATION
 * ──────────────────────────────────
 * Single source of truth for every category on the platform.
 *
 * TO ADD A NEW CATEGORY:
 *   1. Add an entry to CATEGORIES below.
 *   2. Add the translation key to every /messages/{locale}.json under "categories".
 *   3. Set comingSoon: false when ready to launch.
 *   No other file needs changing.
 */

/**
 * Per-category glass tint tokens.
 * Applied dynamically to hero search bar, tabs, active chips, dropdowns.
 *
 * bg        – inactive/passive glass background (very low opacity)
 * activeBg  – active tab / focused element background
 * border    – default border color
 * activeBorder – active tab / focused border (more visible)
 * glow      – subtle ambient box-shadow
 * activeGlow – stronger glow for active/focused states
 * hex       – solid accent color (buttons, icons, highlights)
 * light     – ultra-low opacity tint (chip icons, row accents)
 */
export const CATEGORY_TINTS = {
  venues: {
    bg:           "rgba(124,58,237,0.10)",
    activeBg:     "rgba(124,58,237,0.22)",
    border:       "rgba(124,58,237,0.28)",
    activeBorder: "rgba(124,58,237,0.60)",
    glow:         "0 0 28px rgba(124,58,237,0.16)",
    activeGlow:   "0 0 20px rgba(124,58,237,0.36)",
    hex:          "#7c3aed",
    light:        "rgba(124,58,237,0.09)",
  },
  farmstays: {
    bg:           "rgba(5,150,105,0.10)",
    activeBg:     "rgba(5,150,105,0.22)",
    border:       "rgba(5,150,105,0.28)",
    activeBorder: "rgba(5,150,105,0.60)",
    glow:         "0 0 28px rgba(5,150,105,0.16)",
    activeGlow:   "0 0 20px rgba(5,150,105,0.36)",
    hex:          "#059669",
    light:        "rgba(5,150,105,0.09)",
  },
  studios: {
    bg:           "rgba(217,119,6,0.10)",
    activeBg:     "rgba(217,119,6,0.22)",
    border:       "rgba(217,119,6,0.28)",
    activeBorder: "rgba(217,119,6,0.60)",
    glow:         "0 0 28px rgba(217,119,6,0.16)",
    activeGlow:   "0 0 20px rgba(217,119,6,0.36)",
    hex:          "#d97706",
    light:        "rgba(217,119,6,0.09)",
  },
  rentals: {
    bg:           "rgba(37,99,235,0.10)",
    activeBg:     "rgba(37,99,235,0.22)",
    border:       "rgba(37,99,235,0.28)",
    activeBorder: "rgba(37,99,235,0.60)",
    glow:         "0 0 28px rgba(37,99,235,0.16)",
    activeGlow:   "0 0 20px rgba(37,99,235,0.36)",
    hex:          "#2563eb",
    light:        "rgba(37,99,235,0.09)",
  },
  /* ── Workspaces: ONE palette — premium cyan/teal ── */
  workspaces: {
    bg:           "rgba(8,145,178,0.10)",
    activeBg:     "rgba(8,145,178,0.22)",
    border:       "rgba(8,145,178,0.28)",
    activeBorder: "rgba(8,145,178,0.60)",
    glow:         "0 0 28px rgba(8,145,178,0.16)",
    activeGlow:   "0 0 20px rgba(8,145,178,0.36)",
    hex:          "#0891b2",
    light:        "rgba(8,145,178,0.09)",
  },
  experiences: {
    bg:           "rgba(219,39,119,0.10)",
    activeBg:     "rgba(219,39,119,0.22)",
    border:       "rgba(219,39,119,0.28)",
    activeBorder: "rgba(219,39,119,0.60)",
    glow:         "0 0 28px rgba(219,39,119,0.16)",
    activeGlow:   "0 0 20px rgba(219,39,119,0.36)",
    hex:          "#db2777",
    light:        "rgba(219,39,119,0.09)",
  },
};

/**
 * Per-category Tailwind color tokens.
 * Used by CategoryNavigator icon badges, ring states, panel highlights.
 */
export const CATEGORY_COLORS = {
  violet:  { bg: "bg-violet-500",  ring: "ring-violet-400",  text: "text-violet-600 dark:text-violet-400",  light: "bg-violet-50 dark:bg-violet-500/10",  accent: "#7c3aed" },
  emerald: { bg: "bg-emerald-500", ring: "ring-emerald-400", text: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-500/10", accent: "#059669" },
  amber:   { bg: "bg-amber-500",   ring: "ring-amber-400",   text: "text-amber-600 dark:text-amber-400",   light: "bg-amber-50 dark:bg-amber-500/10",   accent: "#d97706" },
  blue:    { bg: "bg-blue-500",    ring: "ring-blue-400",    text: "text-blue-600 dark:text-blue-400",    light: "bg-blue-50 dark:bg-blue-500/10",    accent: "#2563eb" },
  /* cyan replaces orange for workspaces — single consistent palette */
  cyan:    { bg: "bg-cyan-600",    ring: "ring-cyan-400",    text: "text-cyan-600 dark:text-cyan-400",    light: "bg-cyan-50 dark:bg-cyan-500/10",    accent: "#0891b2" },
  rose:    { bg: "bg-rose-500",    ring: "ring-rose-400",    text: "text-rose-600 dark:text-rose-400",    light: "bg-rose-50 dark:bg-rose-500/10",    accent: "#e11d48" },
};

/** All platform categories. */
export const CATEGORIES = {
  venues: {
    id:         "venues",
    color:      "violet",
    route:      "venues",
    comingSoon: false,
  },
  farmstays: {
    id:         "farmstays",
    color:      "emerald",
    route:      "farmstay",
    comingSoon: false,
  },
  studios: {
    id:         "studios",
    color:      "amber",
    route:      "studios",
    comingSoon: false,
  },
  rentals: {
    id:         "rentals",
    color:      "blue",
    route:      "rentals",
    comingSoon: false,
  },
  /* workspaces now uses cyan — syncs CategoryNavigator with hero tints */
  workspaces: {
    id:         "workspaces",
    color:      "cyan",
    route:      "workspaces",
    comingSoon: false,
  },
  experiences: {
    id:         "experiences",
    color:      "rose",
    route:      "experiences",
    comingSoon: true,
  },
};

/** Display order in navigator panel. */
export const CATEGORY_ORDER = [
  "venues",
  "farmstays",
  "studios",
  "rentals",
  "workspaces",
  "experiences",
];

/** Fallback when nothing is stored or detected. */
export const DEFAULT_CATEGORY = "venues";

/**
 * Return config for a category id. Falls back to DEFAULT_CATEGORY.
 * @param {string} id
 */
export function getCategoryConfig(id) {
  return CATEGORIES[id] ?? CATEGORIES[DEFAULT_CATEGORY];
}
