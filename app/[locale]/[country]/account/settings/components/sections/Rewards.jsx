"use client";

/**
 * Rewards & Membership — Farmstay rewards only, per spec.
 *
 * The tier/points display is no longer a bespoke, plainer rebuild — it
 * DIRECTLY REUSES the same MemberCard and FarmRewards components the
 * Profile dashboard's left column now shows inline, so this section can
 * never visually or numerically drift from Profile (same gradient tier
 * card with benefit pills + progress-to-next-tier, same green Farm
 * Rewards card with redeem button + recent activity) instead of a second,
 * flatter reimplementation of the same idea. Only the points & booking
 * journey timeline (not shown by either reused card) and "Available
 * Coupons" (Account-Settings-specific) are still built locally here.
 *
 * This whole section is only reachable when hasFarmstayBooking() is true —
 * page.jsx filters it out of the sidebar entirely for venue-only accounts
 * — so no separate "not eligible" branch is needed inside the section
 * itself.
 */

import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { IconAward, IconTicket, IconCheck, IconCrown, IconLeaf, IconBuildingSkyscraper } from "@tabler/icons-react";

import { POINTS_PER_INR, MEMBERSHIP_TIERS, getMembershipTier } from "@/config/checkoutConfig";
import { computeMockWalletPoints, MOCK_BOOKINGS } from "@/app/[locale]/[country]/profile/data/mockProfileData";
import MemberCard from "@/app/[locale]/[country]/profile/components/MemberCard";
import FarmRewards from "@/app/[locale]/[country]/profile/components/FarmRewards";
import { MOCK_COUPONS } from "../../data/mockAccountData";
import { SettingsCard, CardHeading } from "../ui";

const STEP_REVEAL_DELAY_MS = 420; // pacing between each tier lighting up on mount

/**
 * Tier journey stepper — bronze → silver → gold → diamond, with every
 * tier at or below the account's current one marked achieved (checkmark)
 * and the current tier itself marked with a crown, so reaching the top
 * tier (Diamond) reads as "here's the path you climbed", not just a
 * single static badge with no sense of progression.
 *
 * On mount/refresh this climbs the ladder visibly — step 1, then 2, then
 * 3, etc. — pausing briefly at each rung (checkmark scales in, connector
 * line fills left→right) instead of rendering the whole path already
 * achieved. Re-plays whenever the resolved current tier changes.
 */
function TierStepper({ walletPoints, rewards }) {
  const tm = useTranslations("membership");

  const tiers = rewards?.tier ?? [];

  // The account's current membership id lives at rewards.rewads.mem_id in
  // the real API payload (NOTE: "rewads", not "rewards" — easy typo, and
  // one that silently breaks this whole component since findIndex then
  // never matches anything). Falls back to the points-based mock lookup
  // only when that field isn't present yet.
  const memberTierId = rewards?.rewads?.mem_id;
  const fallbackTier = getMembershipTier(walletPoints);
  const currentIndex = tiers.findIndex(
    (item) => item.id === (memberTierId ?? fallbackTier?.id),
  );
  const targetIndex = Math.max(currentIndex, 0);

  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    if (targetIndex === 0) return; // nothing to climb — already resting at step 0

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= targetIndex) clearInterval(timer);
    }, STEP_REVEAL_DELAY_MS);

    return () => clearInterval(timer);
  }, [targetIndex]);

  return (
    <div className="flex items-start">
      {tiers.map((tier, i) => {
        const achieved = i <= step;
        const isCurrent = i === step && step === targetIndex;
        const isLast = i === tiers.length - 1;

        return (
          <Fragment key={tier.id}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <motion.div
                initial={false}
                animate={{
                  scale: achieved ? 1 : 0.88,
                  backgroundColor: achieved ? tier.color : undefined,
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                  achieved ? "border-transparent" : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                style={achieved ? { boxShadow: `0 4px 10px -2px ${tier.color}80` } : undefined}
              >
                {achieved ? (
                  <motion.span
                    key={isCurrent ? "crown" : "check"}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center"
                  >
                    {isCurrent ? <IconCrown size={16} className="text-white" /> : <IconCheck size={16} className="text-white" />}
                  </motion.span>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                )}
              </motion.div>

              <span
                className={`text-[10.5px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                  achieved ? "text-gray-900 dark:text-gray-50" : "text-gray-400 dark:text-gray-500"
                }`}
              >
              {tm(`tier_${tier.name?.toLowerCase()}`)}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 h-[3px] rounded-full mx-2 mt-[18px] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tier.color, transformOrigin: "left" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < step ? 1 : 0 }}
                  transition={{ duration: STEP_REVEAL_DELAY_MS / 1000, ease: "easeInOut" }}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * Points & booking journey — replaces the old two flat "Lifetime points" /
 * "Bookings counted" number boxes with an actual chronological story: every
 * confirmed reservation (same filter computeMockWalletPoints uses, so the
 * final running total always matches walletPoints exactly, no second mock
 * ledger that can drift), sorted oldest-first, each node showing what was
 * booked, when, how many points it earned, and the running cumulative
 * total climbing toward the tier the user is at right now.
 */
function PointsBookingJourney({ rewards }) {
  const t = useTranslations("accountSettings.rewards");

  const rows = (rewards?.history || []).filter(
    (item) => item.transaction_type === "reward"
  );

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">
          {t("activityJourney")}
        </p>

        <span className="text-[11px] text-gray-400">
          {rows.length} {t("bookingsCounted").toLowerCase()}
        </span>
      </div>

      <div>
        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;

          return (
            <div
              key={r.id}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {!isLast && (
                <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gradient-to-b from-violet-300 to-violet-100 dark:from-violet-700 dark:to-violet-900/20" />
              )}

              <span className="relative z-10 shrink-0 w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white">
                <IconLeaf size={13} />
              </span>

              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50">
                    {r.child_venue_name || "Venue"}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {r.event_date || "-"}
                  </p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    #{r.booking_code}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[13px] font-bold text-green-600">
                    +{Number(r.points).toLocaleString()}
                  </p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    ₹{Number(r.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No reward history found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Rewards({ rewards }) {
  const t = useTranslations("accountSettings.rewards");

  const walletPoints = computeMockWalletPoints(POINTS_PER_INR);

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconAward size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
        <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 mb-4">{t("tierJourney")}</p>
        <TierStepper walletPoints={walletPoints} rewards={rewards} />
      </div>

      <div className="space-y-4 mb-5">
        <MemberCard walletPoints={walletPoints} rewards={rewards} />
        <FarmRewards walletPoints={walletPoints} rewards={rewards} />
      </div>

      {/* Points & booking journey — replaces the old flat lifetime-points /
          bookings-counted number boxes with the chronological story of how
          the account reached its current tier */}
      <PointsBookingJourney rewards={rewards} />

      {/* Available coupons — Account-Settings-specific, not shown on Profile */}
      <div>
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
    </SettingsCard>
  );
}