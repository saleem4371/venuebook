"use client";

/**
 * WalletSection.jsx
 *
 * Section 1 of checkout: VenueBook Rewards Wallet.
 * Shows tier, points, wallet value, max redeemable, and a toggle
 * to apply maximum reward points. Updates the invoice instantly.
 */

import { useTranslations } from "next-intl";

export default function WalletSection({
  tint,
  pointsTotal,
  walletValueINR,
  maxRedeemableINR,
  walletApplied,
  onToggleWallet,
  rewardDiscountINR,
  remainingPoints,
  currentTier,
  format,
}) {
  const t = useTranslations("checkout.wallet");

  const tierColors = {
    bronze:  { bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-400",  dot: "#cd7f32" },
    silver:  { bg: "bg-gray-100 dark:bg-gray-800/50",   text: "text-gray-600 dark:text-gray-300",   dot: "#9ca3af" },
    gold:    { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", dot: "#f59e0b" },
    diamond: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400", dot: "#818cf8" },
  };

  const tc = tierColors[currentTier?.id] ?? tierColors.bronze;

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      aria-label="venuebook.in Rewards Wallet"
    >
      {/* Header stripe */}
      <div
        className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3"
        style={{ background: `linear-gradient(135deg, ${tint.bg}, ${tint.activeBg})`, borderBottom: `1px solid ${tint.border}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Coin icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0"
            style={{ backgroundColor: tint.hex }}
          >
            ✦
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {t("title")}
            </p>
            <div className={`mt-0.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: currentTier?.color ?? tc.dot }}
              />
              <span className="truncate">{currentTier?.label} {t("tier")}</span>
            </div>
          </div>
        </div>

        {/* Points badge */}
        <div className="text-end shrink-0">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {pointsTotal.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("points")}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
        <div className="px-4 sm:px-6 py-4 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("wallet_value")}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            {format(walletValueINR)}
          </p>
        </div>
        <div className="px-4 sm:px-6 py-4 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("max_redeemable")}</p>
          <p className="text-lg font-semibold truncate" style={{ color: tint.hex }}>
            {format(maxRedeemableINR)}
          </p>
        </div>
      </div>

      {/* Toggle row */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("apply_toggle")}
          </p>
          {walletApplied && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t("remaining_after")}:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {remainingPoints.toLocaleString()} {t("points_suffix")}
              </span>
            </p>
          )}
        </div>

        {/* Toggle switch */}
        <button
          role="switch"
          aria-checked={walletApplied}
          onClick={() => onToggleWallet(!walletApplied)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{
            backgroundColor: walletApplied ? tint.hex : "#d1d5db",
            focusRingColor: tint.hex,
          }}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              walletApplied ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Applied feedback */}
      {walletApplied && (
        <div
          className="mx-4 sm:mx-6 mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ backgroundColor: tint.light, color: tint.hex }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {t("applied")} — {t("saved")} {format(rewardDiscountINR)}
        </div>
      )}
    </section>
  );
}
