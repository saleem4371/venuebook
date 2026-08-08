"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Crown, ShieldCheck, Zap, Gift as GiftIcon, Sparkles } from "lucide-react";

import { MEMBERSHIP_TIERS } from "@/config/checkoutConfig";
import { ProgressBar } from "./shared/ui";

const BENEFIT_ICONS = {
  benefit_priority_support: ShieldCheck,
  benefit_faster_refunds: Zap,
  benefit_exclusive_offers: GiftIcon,
};

const COUNT_UP_DURATION_MS = 900;

function useCountUp(target, durationMs = COUNT_UP_DURATION_MS) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const safeTarget = Number.isFinite(target) ? target : 0;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(safeTarget * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export default function MemberCard({ memberSinceYear, rewards, isLoading = false }) {
  const t = useTranslations("profile.member");
  const tm = useTranslations("membership");

  const rewad = rewards?.rewads;
  const hasRealData = Boolean(rewad && typeof rewad.total_points === "number");

  // Compute this unconditionally, before any early return, so useCountUp's
  // internal useState/useEffect always run in the same order every render.
  const displayPoints = hasRealData ? (rewad.available_points ?? 0) : 0;
  const animatedPoints = useCountUp(displayPoints);

  // ── Still loading: skeleton, not a guess ────────────────────────────
  if (isLoading) {
    return (
      <div className="rounded-3xl p-4 sm:p-5 bg-gray-100 dark:bg-gray-800 animate-pulse h-[190px]" />
    );
  }

  // ── No real membership data yet: honest empty state ─────────────────
  if (!hasRealData) {
    const firstTier = MEMBERSHIP_TIERS[0];
    return (
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl p-4 sm:p-5 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-800">
            <Sparkles size={16} className="text-gray-500" />
          </span>
          <div>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wide">{t("title")}</p>
            <h3 className="text-gray-900 dark:text-gray-100 text-[16px] font-bold leading-tight">
              Welcome to {firstTier?.name || "Bronze"} Membership
            </h3>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-[12.5px] mt-2.5 leading-relaxed">
           Your membership journey starts with your first booking. Make bookings to
  unlock higher tiers and enjoy more rewards and benefits.
        </p>
      </motion.section>
    );
  }

  // ── Real data path ───────────────────────────────────────────────────
  const pointsForProgress = rewad.total_points;
  const configTierIndex = MEMBERSHIP_TIERS.findIndex((tr) => tr.id === rewad.tierId);
  const configTier = MEMBERSHIP_TIERS[configTierIndex >= 0 ? configTierIndex : 0];
  const nextConfigTier = MEMBERSHIP_TIERS[(configTierIndex >= 0 ? configTierIndex : 0) + 1];

  const progressPercent = nextConfigTier
    ? Math.min(100, Math.max(0, Math.round(
        ((pointsForProgress - configTier.minPoints) / (nextConfigTier.minPoints - configTier.minPoints)) * 100,
      )))
    : 100;

  const displayColor = rewad.color || configTier.color;
  const displayTierLabel = tm("member_label", { tier: rewad.name });
  const nextTierLabel = nextConfigTier ? tm(`tier_${nextConfigTier.id}`) : null;
  const benefitKeys = configTier.benefits ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
      style={{ background: `linear-gradient(135deg, ${displayColor} 0%, ${displayColor}CC 55%, #111827 130%)` }}
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

      <motion.div
        className="relative flex flex-wrap gap-2 mt-3.5"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }}
      >
        {benefitKeys.map((key) => {
          const Icon = BENEFIT_ICONS[key];
          return (
            <motion.span
              key={key}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur text-white text-[11px] font-medium"
            >
              {Icon && <Icon size={12} />}
              {tm(key)}
            </motion.span>
          );
        })}
      </motion.div>

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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}>
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