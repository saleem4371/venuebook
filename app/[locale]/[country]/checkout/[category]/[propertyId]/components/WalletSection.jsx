"use client";

/**
 * WalletSection.jsx
 *
 * Section 1 of checkout: VenueBook Rewards Wallet.
 * Shows tier, points, wallet value, max redeemable, and a redemption picker
 * — None / 50% / Max presets, plus Custom (types any ₹ amount up to
 * maxRedeemableINR) — not an all-or-nothing toggle, so guests can partially
 * or precisely redeem instead of being forced into fixed amounts.
 * Updates the invoice instantly.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function WalletSection({
  tint,
  pointsTotal,
  walletValueINR,
  maxRedeemableINR,
  redeemAmountINR,
  onSelectRedeemAmount,
  rewardDiscountINR,
  remainingPoints,
  currentTier,
  format,
  loading = false,
}) {
  const t = useTranslations("checkout.wallet");
  const walletApplied = redeemAmountINR > 0;

  // Custom input is its own UI mode, separate from the derived preset
  // match below — so picking "Custom" opens the input even before the
  // guest has typed an amount (redeemAmountINR may still be 0 or match a
  // preset from before they switched modes).
  const [customOpen, setCustomOpen] = useState(false);
  const halfValue = Math.round(maxRedeemableINR * 0.5);
  // Derived from the region's own Intl.NumberFormat output rather than a
  // hardcoded "₹" — keeps this region-agnostic like the rest of the
  // currency system (format() already resolves the correct symbol/code).
  const currencySymbol = format(0).replace(/[\d.,\s]/g, "");

  const REDEEM_PRESETS = [
    { key: "redeem_none", value: 0 },
    { key: "redeem_half", value: halfValue },
    { key: "redeem_max", value: maxRedeemableINR },
  ];

  const tierColors = {
    bronze:  { bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-400",  dot: "#cd7f32" },
    silver:  { bg: "bg-gray-100 dark:bg-gray-800/50",   text: "text-gray-600 dark:text-gray-300",   dot: "#9ca3af" },
    gold:    { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", dot: "#f59e0b" },
    diamond: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400", dot: "#818cf8" },
  };

  const tc = tierColors[currentTier?.id] ?? tierColors.bronze;

  if (loading) {
    // Wallet balance is mock data (not tied to the venueData fetch), but it
    // renders alongside BookingReviewCard/AddOnsSection which do wait on
    // that fetch — showing this card fully live while its siblings are
    // still pulse-block skeletons reads as broken, so it loads in lockstep
    // with them instead, matching the same pulse-block shape as its own
    // real layout (header stripe + stats grid + redeem picker).
    return (
      <section
        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
        aria-label="venuebook.in Rewards Wallet"
      >
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
            <div className="min-w-0 space-y-1.5">
              <div className="h-4 w-28 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-4 w-20 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
          <div className="text-end shrink-0 space-y-1.5">
            <div className="h-6 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ms-auto" />
            <div className="h-3 w-14 rounded bg-gray-100 dark:bg-gray-800 animate-pulse ms-auto" />
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
          {[0, 1].map((n) => (
            <div key={n} className="px-4 sm:px-6 py-4 space-y-2">
              <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-5 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-6 py-4">
          <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

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

      {/* Redemption picker — None / Half / Max, not all-or-nothing */}
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t("redeem_label")}
          </p>
          {walletApplied && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("remaining_after")}:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {remainingPoints.toLocaleString()} {t("points_suffix")}
              </span>
            </p>
          )}
        </div>

        <div
          role="radiogroup"
          aria-label={t("redeem_label")}
          className="grid grid-cols-2 gap-2"
        >
          {REDEEM_PRESETS.map((preset) => {
            const active = !customOpen && redeemAmountINR === preset.value;
            return (
              <button
                key={preset.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setCustomOpen(false);
                  onSelectRedeemAmount(preset.value);
                }}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? ""
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                style={
                  active
                    ? { borderColor: tint.hex, backgroundColor: tint.light, color: tint.hex }
                    : undefined
                }
              >
                {t(preset.key)}
              </button>
            );
          })}

          {/* Custom — opens an amount input instead of setting a fixed value directly */}
          <button
            type="button"
            role="radio"
            aria-checked={customOpen}
            onClick={() => setCustomOpen(true)}
            className={`col-span-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              customOpen
                ? ""
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            style={
              customOpen
                ? { borderColor: tint.hex, backgroundColor: tint.light, color: tint.hex }
                : undefined
            }
          >
            {t("redeem_custom")}
          </button>
        </div>

        {customOpen && (
          <div className="mt-3">
            <div className="flex items-center gap-2 rounded-xl border-2 px-3 py-2" style={{ borderColor: tint.hex }}>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0">{currencySymbol}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={maxRedeemableINR}
                value={redeemAmountINR || ""}
                placeholder="0"
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  const clamped = Number.isFinite(raw) ? Math.max(0, Math.min(maxRedeemableINR, raw)) : 0;
                  onSelectRedeemAmount(clamped);
                }}
                className="w-full bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {t("custom_max_hint", { amount: format(maxRedeemableINR) })}
            </p>
          </div>
        )}
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
