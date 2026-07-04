/**
 * estateTheme.js
 *
 * Category color palette for the Parent Property (Estate) public page.
 *
 * Deliberately NOT imported from search/[type]/utils/categoryConfig.js —
 * that file belongs to the child-listing search feature. Keeping a small,
 * self-contained copy here means this route can evolve independently
 * without risking the "stable systems" the project rules protect, at the
 * cost of duplicating a handful of class strings. Colors are kept visually
 * identical to categoryConfig so cards feel consistent across the site.
 */

export const CATEGORY_ORDER = ["venues", "farmstays", "studios", "workspaces"];

export const CATEGORY_LABELS = {
  venues: "Venues",
  farmstays: "Farmstays",
  studios: "Studios",
  workspaces: "Workspace",
};

export const CATEGORY_SINGULAR = {
  venues: "Venue",
  farmstays: "Farmstay",
  studios: "Studio",
  workspaces: "Workspace",
};

export const CATEGORY_THEME = {
  venues: {
    dot: "bg-violet-600",
    text: "text-violet-600 dark:text-violet-400",
    textBold: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800",
    solid: "bg-violet-600",
    gradient: "from-violet-600 to-purple-600",
    pill: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800",
    ring: "ring-violet-400",
  },
  farmstays: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    textBold: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    solid: "bg-emerald-600",
    gradient: "from-emerald-500 to-teal-500",
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    ring: "ring-emerald-400",
  },
  studios: {
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    textBold: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    solid: "bg-blue-600",
    gradient: "from-blue-500 to-indigo-500",
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    ring: "ring-blue-400",
  },
  workspaces: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    textBold: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    solid: "bg-amber-600",
    gradient: "from-amber-500 to-orange-500",
    pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    ring: "ring-amber-400",
  },
};

export function getCategoryTheme(cat) {
  return CATEGORY_THEME[cat] ?? CATEGORY_THEME.venues;
}

/**
 * Normalize a raw referrer/query value ("Venues", "farmstay", "STUDIO", ...)
 * down to one of the estate's canonical category keys. Falls back to the
 * first category the estate actually offers.
 */
export function normalizeEstateCategory(raw, availableKeys = CATEGORY_ORDER) {
  const t = String(raw || "").toLowerCase();
  let key = "venues";
  if (t.startsWith("farm")) key = "farmstays";
  else if (t.startsWith("studio")) key = "studios";
  else if (t.startsWith("work")) key = "workspaces";
  else if (t.startsWith("venue")) key = "venues";

  if (availableKeys.includes(key)) return key;
  return availableKeys[0] ?? "venues";
}
