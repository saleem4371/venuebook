"use client";

/**
 * /app/[locale]/[country]/profile/components/widgets/IdentityPanel.jsx
 *
 * Left column of the fixed dashboard shell — compact identity + stats +
 * completion, replacing the old full-width ProfileHeader for the desktop
 * glance view. ProfileHeader.jsx itself is untouched and still used on the
 * mobile fallback (see page.jsx), so nothing already working was rewritten,
 * this is an additional compact presentation of the same real user data.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Pencil, Settings, Crown } from "lucide-react";

import { MEMBERSHIP_TIERS, getMembershipTier } from "@/config/checkoutConfig";
import { MOCK_BOOKINGS } from "../../data/mockProfileData";

function initialsOf(name) {
  if (!name) return "VB";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").concat(parts[1]?.[0] || "").toUpperCase() || "VB";
}

function avatarTone(name) {
  const palette = ["#7C3AED", "#2563EB", "#16A34A", "#DB2777", "#EA580C", "#0EA5E9"];
  if (!name) return palette[0];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

export default function IdentityPanel({
  user,
  walletPoints = 0,
  onOpenSettings,
  onOpenRewards,
  flat = false,
}) {
  const tIdentity = useTranslations("profile.identity");
  const tStats = useTranslations("profile.stats");
  const tm = useTranslations("membership");

  const [hovering, setHovering] = useState(false);

  const hasAvatar = Boolean(user?.avatar);
  const isVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);

  const totalBookings = MOCK_BOOKINGS.filter(
    (b) => b.bookingType === "reservation" && b.bookingStatus !== "cancelled",
  ).length;
  const tone = avatarTone(user?.name);
  const tier = getMembershipTier(walletPoints);

  return (
    <div
      className={
        flat
          ? "p-4"
          : "rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4"
      }
    >
        {/* Identity gets its own tinted card even inside a `flat` panel —
            this is the one thing on the whole left column that should read
            as "who you are" at a glance, not just more plain text sitting
            on the page background like everything else here. Tint is a
            soft blend of the avatar's own colour and the membership tier's
            colour, so DIAMOND vs a lower tier still looks visually
            distinct without needing a second, unrelated colour system. */}
        <div
          className="rounded-2xl p-3.5"
          style={{
            background: `linear-gradient(135deg, ${tone}17, ${tier.color}17)`,
            border: `1px solid ${tone}2A`,
          }}
        >
          <div className="flex items-start justify-between">
            <div
              className="relative shrink-0 group"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              {hasAvatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-[15px] font-bold border-2 border-white dark:border-gray-800 shadow-md"
                  style={{ backgroundColor: tone }}
                >
                  {initialsOf(user?.name)}
                </div>
              )}
              <button
                onClick={onOpenSettings}
                title={tIdentity("editTooltip")}
                className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                  hovering ? "opacity-100" : "opacity-0"
                }`}
              >
                <Pencil size={13} className="text-white" />
              </button>
            </div>

            <button
              onClick={onOpenSettings}
              title={tIdentity("settingsTooltip")}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 flex items-center justify-center text-gray-500 hover:bg-white dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="mt-3 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[15.5px] font-bold text-gray-900 dark:text-gray-50 truncate">
                {user?.name || "—"}
              </h1>
              {isVerified && <CheckCircle2 size={14} className="text-violet-600 shrink-0" />}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>

            <button
              type="button"
              onClick={onOpenRewards}
              className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide text-white hover:opacity-90 transition-opacity shadow-sm"
              style={{
                backgroundColor: tier.color,
                boxShadow: `0 4px 12px -2px ${tier.color}80`,
              }}
            >
              <Crown size={11} />
              {tm(`tier_${tier.id}`).toUpperCase()}
            </button>
          </div>
        </div>

        {/* STATS — trimmed to the two figures that actually matter at a
            glance (points earned, bookings made); Nights and Collections
            are already visible elsewhere on this same dashboard (Right
            column's Collections card, and booking dates themselves), so
            repeating them here was redundant. */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
          <Stat label={tStats("points")} value={walletPoints.toLocaleString()} />
          <Stat label={tIdentity("bookings")} value={totalBookings} />
        </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[15px] font-bold text-gray-900 dark:text-gray-50 leading-none">{value}</p>
      <p className="text-[9.5px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}
