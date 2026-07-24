"use client";

/**
 * Rewards & Membership — Farmstay rewards only, per spec. Reuses the exact
 * same real membership system the Profile dashboard uses
 * (config/checkoutConfig.js: MEMBERSHIP_TIERS / getMembershipTier /
 * POINTS_PER_INR, and mockProfileData.js's computeMockWalletPoints /
 * hasFarmstayBooking) so the tier/points shown here can never disagree
 * with the Profile page's own MemberCard/FarmRewards.
 *
 * This whole section is only reachable when hasFarmstayBooking() is true —
 * page.jsx filters it out of the sidebar entirely for venue-only accounts
 * — so no separate "not eligible" branch is needed inside the section
 * itself.
 */

import { useTranslations } from "next-intl";
import { IconAward, IconCrown, IconHistory, IconTicket } from "@tabler/icons-react";

import { MEMBERSHIP_TIERS, getMembershipTier, POINTS_PER_INR } from "@/config/checkoutConfig";
import { computeMockWalletPoints, MOCK_BOOKINGS } from "@/app/[locale]/[country]/profile/data/mockProfileData";
import { ProgressBar } from "@/app/[locale]/[country]/profile/components/shared/ui";
import { MOCK_REWARDS_HISTORY, MOCK_COUPONS } from "../../data/mockAccountData";
import { SettingsCard, CardHeading, StatusPill } from "../ui";

export default function Rewards() {
  const t = useTranslations("accountSettings.rewards");
  const tm = useTranslations("membership");

  const walletPoints = computeMockWalletPoints(POINTS_PER_INR);
  const tier = getMembershipTier(walletPoints);
  const tierIndex = MEMBERSHIP_TIERS.findIndex((tt) => tt.id === tier.id);
  const nextTier = MEMBERSHIP_TIERS[tierIndex + 1];

  const lifetimePoints = MOCK_REWARDS_HISTORY.reduce((sum, r) => sum + Math.max(r.points, 0), walletPoints);

  const totalBookings = MOCK_BOOKINGS.filter((b) => b.bookingStatus !== "cancelled").length;

  const progressPercent = nextTier
    ? Math.min(100, Math.round(((walletPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100;

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconAward size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      {/* Tier card */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: `linear-gradient(135deg, ${tier.color}14, ${tier.color}28)`, border: `1px solid ${tier.color}35` }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold tracking-wide text-white shadow-sm"
            style={
              tier.id === "diamond"
                ? { background: "linear-gradient(242deg, #a44bf3, #499ce8)", boxShadow: "0 4px 12px -2px #a44bf380" }
                : { backgroundColor: tier.color, boxShadow: `0 4px 12px -2px ${tier.color}80` }
            }
          >
            <IconCrown size={13} />
            {tm(`tier_${tier.id}`).toUpperCase()}
          </span>
          <div className="text-right">
            <p className="text-[20px] font-bold text-gray-900 dark:text-gray-50 leading-none">{walletPoints.toLocaleString()}</p>
            <p className="text-[10.5px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{t("currentPoints")}</p>
          </div>
        </div>

        {nextTier && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1.5">
              <span>{t("progressToNext", { tier: tm(`tier_${nextTier.id}`) })}</span>
              <span>{progressPercent}%</span>
            </div>
            <ProgressBar percent={progressPercent} colorClass="bg-violet-600" trackClass="bg-white/60 dark:bg-gray-900/40" />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-[18px] font-bold text-gray-900 dark:text-gray-50">{lifetimePoints.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t("lifetimePoints")}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-[18px] font-bold text-gray-900 dark:text-gray-50">{totalBookings}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t("bookingsCounted")}</p>
        </div>
      </div>

      {/* Available coupons */}
      <div className="mb-5">
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 mb-3">
          <IconTicket size={15} stroke={1.75} />
          {t("availableCoupons")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MOCK_COUPONS.map((c) => (
            <div key={c.id} className="rounded-xl border border-dashed border-violet-200 dark:border-violet-800/60 bg-violet-50/50 dark:bg-violet-900/10 px-3.5 py-3">
              <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">{c.title}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-mono text-[10.5px] font-bold text-violet-600 dark:text-violet-400">{c.tag}</span>
                <span className="text-[10.5px] text-gray-400 dark:text-gray-500">{t("expires")} {c.expiry}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <p className="flex items-center gap-2 text-[12.5px] font-semibold text-gray-700 dark:text-gray-200 mb-3">
          <IconHistory size={15} stroke={1.75} />
          {t("history")}
        </p>
        <ul className="space-y-2.5">
          {MOCK_REWARDS_HISTORY.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 text-[12.5px]">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{row.label}</p>
                <p className="text-gray-400 dark:text-gray-500 text-[11px]">{row.date}</p>
              </div>
              <StatusPill tone={row.points >= 0 ? "green" : "gray"} label={`${row.points >= 0 ? "+" : ""}${row.points}`} />
            </li>
          ))}
        </ul>
      </div>
    </SettingsCard>
  );
}
