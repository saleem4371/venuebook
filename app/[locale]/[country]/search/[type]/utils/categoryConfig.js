/**
 * Category configuration — color system + normalizer
 *
 * All Tailwind class strings are written as complete literals so JIT
 * includes them in the build. Never build class names from string parts.
 */

export function normalizeCategory(type = "") {
  const t = type.toLowerCase();
  if (t.startsWith("farm")) return "farmstays";
  if (t.startsWith("studio")) return "studios";
  if (t.startsWith("work")) return "workspaces";
  if (t.startsWith("rental")) return "rentals";
  if (t.startsWith("exp")) return "experiences";
  return "venues";
}

// ─── Static class maps (one per category) ────────────────────────────────────
// Each key is a semantic token; value is a complete Tailwind class string.
const COLORS = {
  venues: {
    // Gradient (for buttons)
    gradient: "from-violet-600 to-purple-600",
    // Calendar / tab selected fill
    selBg: "bg-violet-600",
    selRing: "ring-violet-400",
    // Range highlight (calendar)
    rangeBg: "bg-violet-100 dark:bg-violet-900/30",
    // Text accent
    accent: "text-violet-600 dark:text-violet-400",
    accentBold: "text-violet-700 dark:text-violet-300",
    // Borders
    border: "border-violet-200 dark:border-violet-800",
    // Light tinted background
    light: "bg-violet-50 dark:bg-violet-950/20",
    // Solid icon background
    iconBg: "bg-violet-600",
    // Active pill (tabs, filter buttons)
    activePill: "bg-violet-600 text-white border-transparent",
    // Passive pill
    pill: "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800",
    // Loyalty badge
    loyaltyBg: "bg-violet-50 dark:bg-violet-950/30",
    loyaltyBorder: "border-violet-200 dark:border-violet-800",
    loyaltyText: "text-violet-700 dark:text-violet-400",
    // Parent property pill hover
    parentPill: "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-950/40",
    // Section tab active border
    tabBorderColor: "border-violet-600 dark:border-violet-400",
    tabTextActive: "text-violet-700 dark:text-violet-400",
  },
  farmstays: {
    gradient: "from-emerald-500 to-teal-500",
    selBg: "bg-emerald-600",
    selRing: "ring-emerald-400",
    rangeBg: "bg-emerald-100 dark:bg-emerald-900/30",
    accent: "text-emerald-600 dark:text-emerald-400",
    accentBold: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    light: "bg-emerald-50 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-600",
    activePill: "bg-emerald-600 text-white border-transparent",
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    loyaltyBg: "bg-emerald-50 dark:bg-emerald-950/30",
    loyaltyBorder: "border-emerald-200 dark:border-emerald-800",
    loyaltyText: "text-emerald-700 dark:text-emerald-400",
    parentPill: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-950/40",
    tabBorderColor: "border-emerald-600 dark:border-emerald-400",
    tabTextActive: "text-emerald-700 dark:text-emerald-400",
  },
  studios: {
    gradient: "from-blue-500 to-indigo-500",
    selBg: "bg-blue-600",
    selRing: "ring-blue-400",
    rangeBg: "bg-blue-100 dark:bg-blue-900/30",
    accent: "text-blue-600 dark:text-blue-400",
    accentBold: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    light: "bg-blue-50 dark:bg-blue-950/20",
    iconBg: "bg-blue-600",
    activePill: "bg-blue-600 text-white border-transparent",
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    loyaltyBg: "bg-blue-50 dark:bg-blue-950/30",
    loyaltyBorder: "border-blue-200 dark:border-blue-800",
    loyaltyText: "text-blue-700 dark:text-blue-400",
    parentPill: "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-950/40",
    tabBorderColor: "border-blue-600 dark:border-blue-400",
    tabTextActive: "text-blue-700 dark:text-blue-400",
  },
  workspaces: {
    gradient: "from-amber-500 to-orange-500",
    selBg: "bg-amber-600",
    selRing: "ring-amber-400",
    rangeBg: "bg-amber-100 dark:bg-amber-900/30",
    accent: "text-amber-600 dark:text-amber-400",
    accentBold: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    light: "bg-amber-50 dark:bg-amber-950/20",
    iconBg: "bg-amber-600",
    activePill: "bg-amber-600 text-white border-transparent",
    pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    loyaltyBg: "bg-amber-50 dark:bg-amber-950/30",
    loyaltyBorder: "border-amber-200 dark:border-amber-800",
    loyaltyText: "text-amber-700 dark:text-amber-400",
    parentPill: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-950/40",
    tabBorderColor: "border-amber-600 dark:border-amber-400",
    tabTextActive: "text-amber-700 dark:text-amber-400",
  },
  rentals: {
    gradient: "from-rose-500 to-pink-500",
    selBg: "bg-rose-600",
    selRing: "ring-rose-400",
    rangeBg: "bg-rose-100 dark:bg-rose-900/30",
    accent: "text-rose-600 dark:text-rose-400",
    accentBold: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    light: "bg-rose-50 dark:bg-rose-950/20",
    iconBg: "bg-rose-600",
    activePill: "bg-rose-600 text-white border-transparent",
    pill: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
    loyaltyBg: "bg-rose-50 dark:bg-rose-950/30",
    loyaltyBorder: "border-rose-200 dark:border-rose-800",
    loyaltyText: "text-rose-700 dark:text-rose-400",
    parentPill: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-950/40",
    tabBorderColor: "border-rose-600 dark:border-rose-400",
    tabTextActive: "text-rose-700 dark:text-rose-400",
  },
  experiences: {
    gradient: "from-cyan-500 to-sky-500",
    selBg: "bg-cyan-600",
    selRing: "ring-cyan-400",
    rangeBg: "bg-cyan-100 dark:bg-cyan-900/30",
    accent: "text-cyan-600 dark:text-cyan-400",
    accentBold: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    light: "bg-cyan-50 dark:bg-cyan-950/20",
    iconBg: "bg-cyan-600",
    activePill: "bg-cyan-600 text-white border-transparent",
    pill: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800",
    loyaltyBg: "bg-cyan-50 dark:bg-cyan-950/30",
    loyaltyBorder: "border-cyan-200 dark:border-cyan-800",
    loyaltyText: "text-cyan-700 dark:text-cyan-400",
    parentPill: "bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-950/40",
    tabBorderColor: "border-cyan-600 dark:border-cyan-400",
    tabTextActive: "text-cyan-700 dark:text-cyan-400",
  },
};

export function getCategoryColors(category) {
  const key = normalizeCategory(category);
  return COLORS[key] ?? COLORS.venues;
}

// ─── Venue-specific attribute sets (replaces beds/bathrooms for venues) ───────
export const VENUE_ATTRIBUTES = {
  venues: [
    { label: "1,000 Guests" },
    { label: "200 Car Parking" },
    { label: "Central AC" },
    { label: "Stage & AV" },
    { label: "In-house Catering" },
    { label: "Convention Hall" },
  ],
};

// ─── Calendar modes per category ─────────────────────────────────────────────
// "event" = date + shift (venue logic)
// "stay"  = check-in / check-out range (farmstay / rental logic)
export function getCalendarMode(category) {
  const key = normalizeCategory(category);
  if (key === "venues") return "event";
  return "stay";
}

// ─── Default CTA buttons per category ────────────────────────────────────────
// Each array lists buttons in priority order (last = primary / most prominent).
// Supported tokens: 'book' | 'reserve' | 'enquiry' | 'paxEnquiry'
//
// Layout rules (enforced in DynamicCTA):
//   1 button  → full-width gradient primary
//   2 buttons → [secondary outlined | primary gradient]
//   3 buttons → primary gradient full-width + two outlined side-by-side below
export function getDefaultCTA(category) {
  const key = normalizeCategory(category);
  if (key === "venues")    return ["reserve", "book", "enquiry", "paxEnquiry"];
  if (key === "farmstays") return ["book"];
  if (key === "studios" || key === "workspaces") return ["book"];
  if (key === "rentals")   return ["reserve", "paxEnquiry"];
  return ["book"];
}
