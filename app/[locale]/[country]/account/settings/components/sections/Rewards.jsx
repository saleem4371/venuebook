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

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import { IconAward, IconTicket, IconCheck, IconCrown, IconLeaf, IconBuildingSkyscraper } from "@tabler/icons-react";

import { POINTS_PER_INR, MEMBERSHIP_TIERS, getMembershipTier } from "@/config/checkoutConfig";
import { computeMockWalletPoints, MOCK_BOOKINGS } from "@/app/[locale]/[country]/profile/data/mockProfileData";
import MemberCard from "@/app/[locale]/[country]/profile/components/MemberCard";
import FarmRewards from "@/app/[locale]/[country]/profile/components/FarmRewards";
import { MOCK_COUPONS } from "../../data/mockAccountData";
import { SettingsCard, CardHeading } from "../ui";

/**
 * Tier journey stepper — bronze → silver → gold → diamond, with every
 * tier at or below the account's current one marked achieved (checkmark)
 * and the current tier itself marked with a crown, so reaching the top
 * tier (Diamond) reads as "here's the path you climbed", not just a
 * single static badge with no sense of progression.
 */
function TierStepper({ walletPoints }) {
  const tm = useTranslations("membership");
  const currentTier = getMembershipTier(walletPoints);
  const currentIndex = MEMBERSHIP_TIERS.findIndex((tr) => tr.id === currentTier.id);

  return (
    <div className="flex items-start">
      {MEMBERSHIP_TIERS.map((tier, i) => {
        const achieved = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === MEMBERSHIP_TIERS.length - 1;
        return (
          <Fragment key={tier.id}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                  achieved ? "border-transparent" : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}
                style={achieved ? { backgroundColor: tier.color, boxShadow: `0 4px 10px -2px ${tier.color}80` } : undefined}
              >
                {achieved ? (
                  isCurrent ? (
                    <IconCrown size={16} className="text-white" />
                  ) : (
                    <IconCheck size={16} className="text-white" />
                  )
                ) : (
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-[10.5px] font-semibold whitespace-nowrap ${
                  achieved ? "text-gray-900 dark:text-gray-50" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {tm(`tier_${tier.id}`)}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-[3px] rounded-full mx-2 mt-[18px] ${i < currentIndex ? "" : "bg-gray-200 dark:bg-gray-700"}`}
                style={i < currentIndex ? { backgroundColor: tier.color } : undefined}
              />
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
function PointsBookingJourney() {
  const t = useTranslations("accountSettings.rewards");

  const rows = MOCK_BOOKINGS
    .filter((b) => b.bookingType === "reservation" && b.bookingStatus !== "cancelled")
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, b) => {
      const earned = Math.floor(b.amountINR * POINTS_PER_INR);
      const cumulative = (acc[acc.length - 1]?.cumulative || 0) + earned;
      acc.push({ ...b, earned, cumulative });
      return acc;
    }, []);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">{t("activityJourney")}</p>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{rows.length} {t("bookingsCounted").toLowerCase()}</span>
      </div>

      <div>
        {rows.map((r, i) => {
          const isLast = i === rows.length - 1;
          const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(r.date));
          return (
            <div key={r.bookingId} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span className="absolute left-[13px] top-7 bottom-0 w-px bg-gradient-to-b from-violet-300 to-violet-100 dark:from-violet-700 dark:to-violet-900/20" />
              )}
              <span className="relative z-10 shrink-0 w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-[0_2px_8px_-1px_rgba(124,58,237,0.5)]">
                {r.category === "farmstays" ? <IconLeaf size={13} /> : <IconBuildingSkyscraper size={13} />}
              </span>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-3 pt-0.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-gray-900 dark:text-gray-50 truncate">{r.propertyName}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{dateLabel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12.5px] font-bold text-green-600">+{r.earned.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{r.cumulative.toLocaleString()} {t("runningTotal")}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Rewards() {
  const t = useTranslations("accountSettings.rewards");

  const walletPoints = computeMockWalletPoints(POINTS_PER_INR);

  return (
    <SettingsCard>
      <CardHeading title={t("title")} subtitle={t("subtitle")} icon={<IconAward size={18} className="text-gray-500 dark:text-gray-400" stroke={1.75} />} />

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-5">
        <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 mb-4">{t("tierJourney")}</p>
        <TierStepper walletPoints={walletPoints} />
      </div>

      <div className="space-y-4 mb-5">
        <MemberCard walletPoints={walletPoints} />
        <FarmRewards walletPoints={walletPoints} />
      </div>

      {/* Points & booking journey — replaces the old flat lifetime-points /
          bookings-counted number boxes with the chronological story of how
          the account reached its current tier */}
      <PointsBookingJourney />

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
