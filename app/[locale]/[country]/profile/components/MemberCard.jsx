"use client";

/**
 * /app/[locale]/[country]/profile/components/MemberCard.jsx
 *
 * Large premium membership card. Deliberately reuses the app-wide loyalty
 * system that already exists in config/checkoutConfig.js (MEMBERSHIP_TIERS,
 * getMembershipTier, POINTS_PER_INR) — the same source UserDropdown's
 * MembershipWidget and the checkout flow use — instead of inventing a
 * second, competing tier system. It also reuses the pre-existing
 * `membership` i18n namespace (tier_bronze/silver/gold/diamond,
 * benefit_* keys) that was already translated in all 4 locales but never
 * consumed outside the navbar dropdown.
 *
 * walletPoints is passed down from page.jsx so this card, QuickStats, and
 * FarmRewards all agree on the same number instead of computing three
 * different mock totals independently.
 */

import { useTranslations } from "next-intl";
import { Crown, ShieldCheck, Zap, Gift as GiftIcon } from "lucide-react";

import { MEMBERSHIP_TIERS, getMembershipTier } from "@/config/checkoutConfig";
import { ProgressBar } from "./shared/ui";

const BENEFIT_ICONS = {
  benefit_priority_support: ShieldCheck,
  benefit_faster_refunds: Zap,
  benefit_exclusive_offers: GiftIcon,
};

export default function MemberCard({ walletPoints = 0, memberSinceYear }) {
  const t = useTranslations("profile.member");
  const tm = useTranslations("membership");

  const tier = getMembershipTier(walletPoints);
  const tierIndex = MEMBERSHIP_TIERS.findIndex((tr) => tr.id === tier.id);
  const nextTier = MEMBERSHIP_TIERS[tierIndex + 1];

  const progressPercent = nextTier
    ? Math.min(100, Math.round(((walletPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100;

  const benefitKeys = ["benefit_priority_support", "benefit_faster_refunds", "benefit_exclusive_offers"];

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
      style={{
        background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}CC 55%, #111827 130%)`,
      }}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-14 -left-8 w-48 h-48 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 backdrop-blur">
              <Crown size={16} className="text-white" />
            </span>
            <div>
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">{t("title")}</p>
              <h3 className="text-white text-[17px] sm:text-[19px] font-bold leading-tight">
                {tm("member_label", { tier: tm(`tier_${tier.id}`) })}
              </h3>
            </div>
          </div>
          {memberSinceYear && (
            <p className="text-white/70 text-[11px] mt-1.5">{t("since", { year: memberSinceYear })}</p>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="text-white/70 text-[11px] font-medium">{tm("points_label", { points: walletPoints.toLocaleString() })}</p>
        </div>
      </div>

      {/* BENEFITS */}
      <div className="relative flex flex-wrap gap-2 mt-3.5">
        {benefitKeys.map((key) => {
          const Icon = BENEFIT_ICONS[key];
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur text-white text-[11px] font-medium"
            >
              <Icon size={12} />
              {tm(key)}
            </span>
          );
        })}
      </div>

      {/* UPGRADE PROGRESS */}
      <div className="relative mt-3.5">
        {nextTier ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/85 text-[12.5px] font-medium">
                {tm("next_tier_label", {
                  points: Math.max(0, nextTier.minPoints - walletPoints).toLocaleString(),
                  tier: tm(`tier_${nextTier.id}`),
                })}
              </p>
            </div>
            <ProgressBar percent={progressPercent} colorClass="bg-white" trackClass="bg-white/20" />
          </>
        ) : (
          <p className="text-white/85 text-[12.5px] font-medium">{t("maxTier")}</p>
        )}
      </div>
    </section>
  );
}
