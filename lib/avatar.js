/**
 * lib/avatar.js
 *
 * Single source of truth for "what color does this user's initials avatar
 * get when there's no profile photo". Before this file existed, four
 * different components each computed their own color independently:
 *   - home/components/UserDropdown.jsx's getAvatarBg() (10 Tailwind
 *     classes, hashed off the first letter of the name)
 *   - profile/components/widgets/IdentityPanel.jsx's avatarTone() (a
 *     DIFFERENT 6-hex-color palette, hashed off the sum of every
 *     character in the name)
 *   - profile/components/ProfileHeader.jsx's avatarTone() (an exact
 *     duplicate of IdentityPanel's)
 *   - vendor/components/Navbar.jsx's avatarBg() (an exact duplicate of
 *     UserDropdown's)
 *   - account/settings PersonalInfo.jsx (not hashed at all — a single
 *     hardcoded purple/blue gradient for every account)
 * The same user could show up as green in the navbar, blue on Profile,
 * and purple in Account Settings, all at once. This file ports the
 * navbar's own logic (first-letter hash) as the one canonical algorithm —
 * per direct instruction to "keep the header logic the same" — and
 * exposes it as a hex color so it can be applied via inline `style`
 * anywhere, instead of relying on Tailwind class names (which can't be
 * built dynamically at runtime).
 */

// Hex equivalents of the header's original 10 Tailwind *-500 classes, in
// the exact same order, so the visual result is identical to before.
export const AVATAR_COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#f97316", // orange-500
  "#f43f5e", // rose-500
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
];

/**
 * Same hash the navbar always used: first letter of the (trimmed,
 * uppercased) name, mapped into the palette. Different first letters land
 * on different colors; the same name always lands on the same one.
 */
export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  const idx = Math.max(0, name.trim().toUpperCase().charCodeAt(0) - 65) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/** Up to two initials from the first two words of a name. */
export function getInitials(name, fallback = "U") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
  return initials || fallback;
}
