"use client";

/**
 * /app/[locale]/[country]/profile/components/MemberCard.jsx
 *
 * Large premium membership card. Prefers the REAL rewards payload
 * (rewards.rewads — current tier record: mem_id, name, color,
 * available_points, total_points, min_booking/max_booking/book_amount)
 * when present, since that's the actual account state. Falls back to the
 * app-wide mock loyalty system in config/checkoutConfig.js
 * (MEMBERSHIP_TIERS, getMembershipTier, POINTS_PER_INR) only when real
 * data hasn't arrived yet — same source UserDropdown's MembershipWidget
 * and the checkout flow use, so there's still just one mock system, not
 * a second competing one.
 *
 * Progress-to-next-tier: the real API doesn't (yet) send an explicit
 * "points needed for next tier" threshold per tier, only min_booking /
 * max_booking / book_amount, which aren't directly comparable to a
 * points balance. Until the backend adds that field, the progress bar's
 * percentage still comes from the mock MEMBERSHIP_TIERS point thresholds
 * (matched by tier id) — only the current tier's NAME/COLOR and the
 * points figures themselves are pulled from the real record. That keeps
 * the progress bar meaningful instead of guessing a conversion between
 * money and points.
 *
 * walletPoints is passed down from page.jsx as the mock fallback so this
 * card, QuickStats, and FarmRewards all still agree on the same number
 * when real data isn't available.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Crown, ShieldCheck, Zap, Gift as GiftIcon } from "lucide-react";

import { MEMBERSHIP_TIERS, getMembershipTier } from "@/config/checkoutConfig";
import { ProgressBar } from "./shared/ui";

const BENEFIT_ICONS = {
  benefit_priority_support: ShieldCheck,
  benefit_faster_refunds: Zap,
  benefit_exclusive_offers: GiftIcon,
};

const COUNT_UP_DURATION_MS = 900;

/* Animates a number counting up from 0 to `target` — used for the points
   figure so it reads as "live" data settling in rather than static text. */
function useCountUp(target, durationMs = COUNT_UP_DURATION_MS) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const safeTarget = Number.isFinite(target) ? target : 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(safeTarget * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

export default function MemberCard({ walletPoints = 0, memberSinceYear, rewards }) {
  const t = useTranslations("profile.member");
  const tm = useTranslations("membership");

  // Real current-tier record from the API, when present.
  const rewad = rewards?.rewads;
  const hasRealData = Boolean(rewad);

  // Progress math still comes from the mock config's point thresholds —
  // see file header for why. Matched against the real points balance
  // when available so the bar itself is still accurate to the account.
  const pointsForProgress = hasRealData ? rewad.total_points ?? walletPoints : walletPoints;
  const configTier = getMembershipTier(pointsForProgress);
  const configTierIndex = MEMBERSHIP_TIERS.findIndex((tr) => tr.id === configTier.id);
  const nextConfigTier = MEMBERSHIP_TIERS[configTierIndex + 1];

  const progressPercent = nextConfigTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((pointsForProgress - configTier.minPoints) / (nextConfigTier.minPoints - configTier.minPoints)) * 100,
          ),
        ),
      )
    : 100;

  // Display values: real name/color straight from the API (already
  // human-readable, no i18n lookup needed); fall back to the translated
  // mock tier label when real data isn't there yet.
  const displayColor = hasRealData ? rewad.color : configTier.color;
  const displayTierLabel = hasRealData
    ? tm("member_label", { tier: rewad.name })
    : tm("member_label", { tier: tm(`tier_${configTier.id}`) });
  const displayPoints = hasRealData ? rewad.available_points ?? walletPoints : walletPoints;
  const nextTierLabel = nextConfigTier ? tm(`tier_${nextConfigTier.id}`) : null;

  const animatedPoints = useCountUp(displayPoints);

  const benefitKeys = ["benefit_priority_support", "benefit_faster_refunds", "benefit_exclusive_offers"];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
      style={{
        background: `linear-gradient(135deg, ${displayColor} 0%, ${displayColor}CC 55%, #111827 130%)`,
      }}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-14 -left-8 w-48 h-48 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 backdrop-blur"
            >
              <Crown size={16} className="text-white" />
            </motion.span>
            <div>
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wide">{t("title")}</p>
              <motion.h3
                key={displayTierLabel}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="text-white text-[17px] sm:text-[19px] font-bold leading-tight"
              >
                {displayTierLabel}
              </motion.h3>
            </div>
          </div>
          {memberSinceYear && (
            <p className="text-white/70 text-[11px] mt-1.5">{t("since", { year: memberSinceYear })}</p>
          )}
        </div>

        <div className="text-left sm:text-right">
          <p className="text-white/70 text-[11px] font-medium">
            {tm("points_label", { points: animatedPoints.toLocaleString() })}
          </p>
        </div>
      </div>

      {/* BENEFITS — staggered fade/slide in */}
      <motion.div
        className="relative flex flex-wrap gap-2 mt-3.5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
        }}
      >
        {benefitKeys.map((key) => {
          const Icon = BENEFIT_ICONS[key];
          return (
            <motion.span
              key={key}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur text-white text-[11px] font-medium"
            >
              <Icon size={12} />
              {tm(key)}
            </motion.span>
          );
        })}
      </motion.div>

      {/* UPGRADE PROGRESS — bar fills in on mount instead of snapping to
          its resting width. */}
      <div className="relative mt-3.5">
        {nextConfigTier ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/85 text-[12.5px] font-medium">
                {tm("next_tier_label", {
                  points: Math.max(0, nextConfigTier.minPoints - pointsForProgress).toLocaleString(),
                  tier: nextTierLabel,
                })}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <ProgressBar percent={progressPercent} colorClass="bg-white" trackClass="bg-white/20" animate />
            </motion.div>
          </>
        ) : (
          <p className="text-white/85 text-[12.5px] font-medium">{t("maxTier")}</p>
        )}
      </div>
    </motion.section>
  );
}