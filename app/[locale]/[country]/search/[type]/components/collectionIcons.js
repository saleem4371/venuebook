"use client";

/**
 * collectionIcons — shared icon/color resolution for "Save to Collection".
 *
 * The backend category model (see UserWishlistCategory / save_wishlist_category)
 * currently only guarantees `id` + `name` (+ a legacy `category_image`). There
 * is no confirmed `icon`/`color` column, so we can't rely on the server to
 * round-trip a user's icon choice. Instead:
 *
 *   1. New collections optimistically send `icon` + `color` in the create
 *      payload — harmless if the backend ignores unknown fields, free upgrade
 *      later if it doesn't.
 *   2. Every choice is also mirrored into localStorage, keyed by category id,
 *      so it survives reloads on this device regardless of backend support.
 *   3. Any collection with no stored/returned icon (including ones created
 *      before this feature existed) falls back to a deterministic pick based
 *      on its name, so nothing ever renders as a blank/broken icon.
 *
 * This file has no side effects on the existing region/currency/theme/i18n
 * systems and doesn't touch any stable-foundation hook.
 */

import {
  Heart,
  TreePine,
  Umbrella,
  PartyPopper,
  Camera,
  Building2,
  Star,
  Cake,
  Briefcase,
  Plane,
  Folder,
} from "lucide-react";

// Curated presets shown in the icon picker (Create Collection modal).
export const ICON_PRESETS = [
  { key: "weddings", label: "Weddings", Icon: Heart, color: "#E11D48" },
  { key: "farmstays", label: "Farmstays", Icon: TreePine, color: "#16A34A" },
  { key: "beach", label: "Beach", Icon: Umbrella, color: "#0EA5E9" },
  { key: "events", label: "Events", Icon: PartyPopper, color: "#F59E0B" },
  { key: "studio", label: "Studio", Icon: Camera, color: "#8B5CF6" },
  { key: "rentals", label: "Rentals", Icon: Building2, color: "#F97316" },
  { key: "favorites", label: "Favorites", Icon: Star, color: "#EAB308" },
  { key: "birthday", label: "Birthday", Icon: Cake, color: "#EC4899" },
  { key: "corporate", label: "Corporate", Icon: Briefcase, color: "#334155" },
  { key: "travel", label: "Travel", Icon: Plane, color: "#06B6D4" },
];

export const DEFAULT_ICON = { key: "default", label: "Collection", Icon: Folder, color: "#6B7280" };

const ICON_BY_KEY = Object.fromEntries(
  [...ICON_PRESETS, DEFAULT_ICON].map((p) => [p.key, p]),
);

const STORAGE_KEY = "vb_collection_icon_map";

function readMap() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// Persist a user's icon choice for a (possibly not-yet-existing) category id,
// keyed by the id returned from the create API once it's known.
export function rememberCollectionIcon(categoryId, iconKey) {
  if (typeof window === "undefined" || !categoryId) return;
  try {
    const map = readMap();
    map[categoryId] = iconKey;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage unavailable (private mode, quota) — non-fatal, icon just
    // falls back to the deterministic name-based pick below.
  }
}

// Deterministic fallback so any collection (including ones that pre-date
// this feature) always renders a sensible icon, matched by keyword first,
// then a stable hash across the full preset palette.
function fallbackFor(name = "") {
  const n = name.toLowerCase();
  const match = ICON_PRESETS.find((p) => n.includes(p.key.slice(0, -1)) || n.includes(p.key));
  if (match) return match;
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = (hash * 31 + n.charCodeAt(i)) >>> 0;
  return ICON_PRESETS[hash % ICON_PRESETS.length];
}

// Resolve the {Icon, color} to render for a collection object coming from
// the API (shape: { id, name, icon?, color? }).
export function resolveCollectionIcon(cat) {
  if (!cat) return DEFAULT_ICON;

  const storedKey = readMap()[cat.id];
  if (storedKey && ICON_BY_KEY[storedKey]) return ICON_BY_KEY[storedKey];

  if (cat.icon && ICON_BY_KEY[cat.icon]) {
    return { ...ICON_BY_KEY[cat.icon], color: cat.color || ICON_BY_KEY[cat.icon].color };
  }

  return fallbackFor(cat.name);
}
