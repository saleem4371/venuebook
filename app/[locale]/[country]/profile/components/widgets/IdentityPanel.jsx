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

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Pencil, Settings, Crown, FlaskConical } from "lucide-react";

import { MEMBERSHIP_TIERS, getMembershipTier } from "@/config/checkoutConfig";
import { ProgressBar } from "../shared/ui";
import {
  MOCK_BOOKINGS,
  computeMockTotalNights,
} from "../../data/mockProfileData";

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
  collectionsCount = 0,
  memberSinceYear,
  onOpenSettings,
  onOpenRewards,
  previewNoBookings = false,
  onTogglePreview,
  flat = false,
}) {
  const t = useTranslations("profile.header");
  const tIdentity = useTranslations("profile.identity");
  const tStats = useTranslations("profile.stats");
  const tm = useTranslations("membership");

  const [hovering, setHovering] = useState(false);

  const hasAvatar = Boolean(user?.avatar);
  const isVerified = Boolean(user?.verified || user?.is_verified || user?.email_verified);
  const hasPhone = Boolean(user?.phone);

  const completion = useMemo(() => {
    const checks = [Boolean(user?.name), Boolean(user?.email), hasAvatar, hasPhone, isVerified];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [user, hasAvatar, hasPhone, isVerified]);

  const totalBookings = MOCK_BOOKINGS.filter(
    (b) => b.bookingType === "reservation" && b.bookingStatus !== "cancelled",
  ).length;
  const totalNights = useMemo(() => computeMockTotalNights(), []);
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
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[13px] font-bold border-2 border-white dark:border-gray-800 shadow-md"
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

          <div className="flex items-center gap-1.5 shrink-0">
            {/* TEMPORARY — dev-only preview toggle, not a real user-facing
                control. Simulates "zero bookings anywhere" so the
                Bookings↔Offers layout swap (see page.jsx) can be checked
                without emptying MOCK_BOOKINGS. Remove once that layout has
                been reviewed. */}
            {onTogglePreview && (
              <button
                onClick={onTogglePreview}
                title="Preview: no bookings anywhere (temporary, dev-only)"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  previewNoBookings
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <FlaskConical size={14} />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              title={tIdentity("settingsTooltip")}
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        <div className="mt-2.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h1 className="text-[14.5px] font-bold text-gray-900 dark:text-gray-50 truncate">
              {user?.name || "—"}
            </h1>
            {isVerified && <CheckCircle2 size={13} className="text-violet-600 shrink-0" />}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>

          <button
            type="button"
            onClick={onOpenRewards}
            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: tier.color }}
          >
            <Crown size={10} />
            {tm(`tier_${tier.id}`).toUpperCase()}
          </button>
        </div>

        {/* STATS — mirrors the "label above, bold number below" density
            used in the reference mockup, kept in our existing tokens. */}
        <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
          <Stat label={tStats("points")} value={walletPoints.toLocaleString()} />
          <Stat label={tIdentity("bookings")} value={totalBookings} />
          <Stat label={tIdentity("nights")} value={totalNights} />
          <Stat label={tStats("collections")} value={collectionsCount} />
        </div>

        <div className="mt-3.5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {t("completionTitle")}
            </span>
            <span className="text-[10.5px] font-bold text-violet-600">{t("completion", { percent: completion })}</span>
          </div>
          <ProgressBar percent={completion} height="h-1.5" />
          {memberSinceYear && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
              {t("customerSince", { year: memberSinceYear })}
            </p>
          )}
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
