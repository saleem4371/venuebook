/**
 * Category-aware theme tokens for listing step components.
 *
 * RULES:
 * - Use theme.accent    for icon colors, text accents, check marks
 * - Use theme.ring      as a prefix: `${theme.ring}0.10)` → rgba(r,g,b,0.10)
 * - Use theme.gradient  for gradient buttons / CTA inside steps
 * - DEFAULT_BRAND       is used ONLY for global UI chrome (tab toggle, Save & Continue CTA in page.jsx)
 *
 * Adding a new category: add ONE entry here — no other file changes needed.
 */

export const CATEGORY_THEME = {
  venues:      { accent: "#a44bf3", ring: "rgba(164,75,243,",   gradient: "linear-gradient(242deg,#a44bf3,#499ce8)" },
  farmstays:   { accent: "#10b981", ring: "rgba(16,185,129,",   gradient: "linear-gradient(242deg,#10b981,#34d399)" },
  studios:     { accent: "#f97316", ring: "rgba(249,115,22,",   gradient: "linear-gradient(242deg,#f97316,#fb923c)" },
  workspaces:  { accent: "#3b82f6", ring: "rgba(59,130,246,",   gradient: "linear-gradient(242deg,#3b82f6,#60a5fa)" },
  rentals:     { accent: "#f59e0b", ring: "rgba(245,158,11,",   gradient: "linear-gradient(242deg,#f59e0b,#fbbf24)" },
  experiences: { accent: "#ec4899", ring: "rgba(236,72,153,",   gradient: "linear-gradient(242deg,#ec4899,#f472b6)" },
};

/** Returns theme for a category, falling back to venues. */
export function getCategoryTheme(category) {
  return CATEGORY_THEME[category] ?? CATEGORY_THEME.venues;
}
