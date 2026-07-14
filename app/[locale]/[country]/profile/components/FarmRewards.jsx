"use client";

/**
 * /app/[locale]/[country]/profile/components/FarmRewards.jsx
 *
 * Only ever rendered by page.jsx when hasFarmstayBooking() is true — this
 * component itself doesn't gate visibility, the caller does, so there's a
 * single obvious place (page.jsx) controlling "loyalty only shows for
 * Farmstay guests" per the brief. Internally it's a farmstay-flavored view
 * of the SAME points ledger MemberCard renders (walletPoints prop, same
 * source), not a second independent points system — see MemberCard.jsx
 * header comment for why.
 */

import { useTranslations } from "next-intl";
import { Sprout, Gift } from "lucide-react";

import { SectionCard, SectionHeading, ProgressBar, PrimaryButton } from "./shared/ui";
import { MOCK_POINTS_HISTORY } from "../data/mockProfileData";

const REWARD_STEP = 500;

export default function FarmRewards({ walletPoints = 0 }) {
  const t = useTranslations("profile.farmRewards");

  const nextThreshold = (Math.floor(walletPoints / REWARD_STEP) + 1) * REWARD_STEP;
  const progressPercent = Math.round(((walletPoints % REWARD_STEP) / REWARD_STEP) * 100);
  const canRedeem = walletPoints >= REWARD_STEP;

  return (
    <SectionCard>
      <SectionHeading
        title={t("title")}
        subtitle={t("subtitle")}
        icon={
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/30">
            <Sprout size={16} className="text-green-600" />
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{t("currentPoints")}</p>
          <p className="text-[24px] font-bold text-gray-900 dark:text-gray-50 leading-tight mt-0.5">
            {walletPoints.toLocaleString()}
          </p>

          <div className="mt-3">
            <ProgressBar percent={progressPercent} colorClass="bg-green-600" />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
              {t("nextReward", { points: nextThreshold.toLocaleString() })}
            </p>
          </div>

          <PrimaryButton
            disabled={!canRedeem}
            className={`mt-3 !bg-green-600 hover:!bg-green-700 ${!canRedeem ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <Gift size={13} />
            {t("redeem")}
          </PrimaryButton>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {t("history")}
          </p>
          {MOCK_POINTS_HISTORY.length === 0 ? (
            <p className="text-[12px] text-gray-400 dark:text-gray-500">{t("empty")}</p>
          ) : (
            <ul className="space-y-2">
              {MOCK_POINTS_HISTORY.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 text-[12px]">
                  <div className="min-w-0">
                    <p className="text-gray-700 dark:text-gray-300 truncate">{h.label}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{h.date}</p>
                  </div>
                  <span
                    className={`shrink-0 font-semibold ${
                      h.delta >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {h.delta >= 0 ? "+" : ""}
                    {h.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
