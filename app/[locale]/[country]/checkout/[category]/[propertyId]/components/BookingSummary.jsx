"use client";

/**
 * BookingSummary.jsx
 *
 * Right-column sticky pricing panel — mirrors the reference
 * pricing_summary.vue: purely the financial breakdown + terms gate + CTA.
 * The property image/booking recap now lives in BookingReviewCard.jsx
 * (step 1, left column), matching the reference's layout split.
 *
 * Contains:
 *   1. Base Price / Add-ons / Platform Fee — each its own ticket-style
 *      group showing a GROSS total, with GST nested as its own sub-item
 *      inside that group's breakdown (net amount + "GST (18%)"), rather
 *      than one blended GST line for everything. Mirrors the BookMyShow-
 *      style reference: "Ticket price" → Net + GST, "Convenience fees" →
 *      Base Amount + IGST, each reconciling to its own gross total.
 *   2. Security deposit — highlighted box, never expandable (nothing to
 *      break down, it's a single refundable line)
 *   3. Points Redeemed — non-venue categories only, when wallet applied
 *   4. Total Payable — the one number that should visually dominate
 *   5. Loyalty reward callout (skipped for venues)
 *   6. Terms & Conditions checkbox gate (step 1 only)
 *   7. Step-aware primary CTA (Proceed → Pay, reflects advance/full amount)
 */

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { MEMBERSHIP_TIERS } from "@/config/checkoutConfig";


/* ─── Breakdown group ────────────────────────────────────────────────── */
/* Expandable line item — collapsed shows just the label + group total;
   expanded reveals the itemized sub-rows underneath (matching the
   ticket-style breakdown pattern: Base Price / Add-ons / Taxes & Fees).
   - 0 sub-items:  plain row, nothing to break down.
   - 1 sub-item:   plain row + an always-visible caption underneath (what
                    the amount actually is), no chevron needed for a single line.
   - 2+ sub-items: collapsible — label + total row, chevron reveals the list. */
function BreakdownGroup({ label, amount, format, items = [], tAria }) {
  const [open, setOpen] = useState(false);
  const expandable = items.length > 1;

  if (items.length === 1) {
    return (
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{format(amount)}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 truncate">{items[0].label}</p>
      </div>
    );
  }

  if (!expandable) {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{label}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{format(amount)}</span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
        aria-label={tAria}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 truncate">
          {label}
          <svg
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">{format(amount)}</span>
      </button>

      {open && (
        <div className="mt-2 ms-1 ps-3 border-s border-gray-200 dark:border-gray-700 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{format(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Loyalty progress ───────────────────────────────────────────────── */
function LoyaltyCallout({ financials, currentTier, pointsTotal, tSummary }) {
  // Uses the real wallet balance passed down from the parent instead of a
  // hardcoded placeholder, so this reflects the actual signed-in user.
  const progressPercent = currentTier.nextAt
    ? Math.min(
        100,
        Math.round(
          ((pointsTotal - currentTier.minPoints) /
            (currentTier.nextAt - currentTier.minPoints)) *
            100,
        ),
      )
    : 100;

  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-violet-700 dark:text-violet-300 truncate">
          {tSummary("earning_points")}
        </p>
        <p className="text-sm font-bold text-violet-900 dark:text-violet-100 shrink-0 whitespace-nowrap">
          +{financials.pointsEarned.toLocaleString()} {tSummary("points_label")}
        </p>
      </div>

      {currentTier.nextAt && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-violet-600 dark:text-violet-400">
            <span className="truncate">{currentTier.label}</span>
            <span className="shrink-0 truncate">
              {tSummary("tier_progress", {
                tier:
                  MEMBERSHIP_TIERS[
                    MEMBERSHIP_TIERS.findIndex((t) => t.id === currentTier.id) + 1
                  ]?.label ?? "",
              })}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-violet-200 dark:bg-violet-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getWeekendCount(start, end) {
  if (!start || !end) return { saturday: 0, sunday: 0, weekend: 0 };

  let saturday = 0;
  let sunday = 0;

  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 6) saturday++;
    if (day === 0) sunday++;
    current.setDate(current.getDate() + 1);
  }

  return { saturday, sunday, weekend: saturday + sunday };
}

function getNightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
}

/* ─── Main component ────────────────────────────────────────────────── */
export default function BookingSummary({
  tint,
  normCat,
  ctaKey,
  financials,
  catConfig,
  currentTier,
  pointsTotal = 0,
  format,
  isProcessing,
  onPay,
  venueData,
  booking,
  venueshifts,
  venueSettings,
  addonSummary,
  onSummaryChange,
  onOpenTerms,
  currentStep = 1,
  termsAccepted = false,
  onToggleTerms,
  onProceed,
  paymentType = "full",
  disablePay = false,
  walletApplied = false,
}) {
  const t = useTranslations("checkout.summary");
  const tBook = useTranslations("checkout.booking");
  const tPayment = useTranslations("checkout.payment");
  const tCta = useTranslations("checkout.cta");
  const tTerms = useTranslations("checkout.terms");

  // -----------------------------
  // PRICE CALCULATION — memoized so the object identity only changes when
  // an actual input changes. Without this, `summary` was a brand-new object
  // every render, which fed straight into a useEffect that called
  // onSummaryChange (the parent's setState) on every render — an infinite
  // render loop, since setting parent state re-renders this component,
  // which built a new `summary`, which re-fired the effect, forever.
  // -----------------------------
  const summary = useMemo(() => {
    let baseAmount = 0;
    let nights = 0;
    let weekends = 0;
    let weeklyAmount = 0;
    let cleaningAmount = 0;
    const addonAmount = addonSummary?.grandTotal || 0;

    const isStay = normCat !== "venues";

    if (isStay) {
      nights = getNightCount(booking.checkIn, booking.checkOut);
      weekends = getWeekendCount(booking.checkIn, booking.checkOut).weekend;

      baseAmount = Number(venueData?.nightly_amount || venueData?.minPrice || 0) * nights;
      weeklyAmount = Number(venueData?.weekly_amount || 0) * weekends;
      cleaningAmount = Number(venueData?.cleaning_amount || 0);
    } else {
      // booking.shift comes from a URL query string, so it's always a
      // string — coerce both sides before comparing against shift.id,
      // which may come back as a number from the API.
      const matchedShift = (venueshifts || []).find(
        (s) => String(s.id) === String(booking.shift)
      );
      baseAmount = Number(matchedShift?.price || 0);
    }

    // -----------------------------
    // SECURITY DEPOSIT
    // -----------------------------
    const propertySettings = (venueSettings || [])
      .filter((item) => item.group === "deposits")
      .reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

    const securityDeposit =
      propertySettings.security === "true" || propertySettings.security === true
        ? Number(propertySettings.secAmt || 0)
        : 0;

    // -----------------------------
    // FEES
    // -----------------------------
    const taxPercent = 18; // Backend setting
    const convenienceFee = 100; // Backend/Admin

    // -----------------------------
    // SUBTOTAL / TAX / TOTAL
    // -----------------------------
    const subtotal = baseAmount + weeklyAmount + cleaningAmount + addonAmount;
    const taxableAmount = subtotal + convenienceFee;
    const gstAmount = (taxableAmount * taxPercent) / 100;
    const payableAmount = taxableAmount + gstAmount;
    const grandTotal = payableAmount + securityDeposit;

    return {
      category: normCat,
      nights,
      weekends,

      baseAmount,
      nightlyRate: Number(venueData?.nightly_amount || 0),
      weeklyRate: Number(venueData?.weekly_amount || 0),
      cleaningRate: Number(venueData?.cleaning_amount || 0),

      weeklyAmount,
      cleaningAmount,
      addonAmount,

      convenienceFee,

      subtotal,
      taxableAmount,
      gstPercent: taxPercent,
      gstAmount,

      securityDeposit,

      payableAmount, // amount sent to Cashfree
      grandTotal,    // includes refundable security deposit
    };
  }, [
    normCat,
    booking.checkIn,
    booking.checkOut,
    booking.shift,
    venueData?.nightly_amount,
    venueData?.minPrice,
    venueData?.weekly_amount,
    venueData?.cleaning_amount,
    venueshifts,
    venueSettings,
    addonSummary?.grandTotal,
  ]);

  // -----------------------------
  // POINTS REDEEMED — venues don't run the loyalty program, so this only
  // ever applies to farmstays (and any other non-venue category). The
  // wallet's redeemable amount (financials.rewardDiscountINR) comes from a
  // separate estimate pipeline than `summary` above; it's clamped here so
  // it can never discount the total below zero.
  // -----------------------------
  const pointsDiscount =
    normCat !== "venues" && walletApplied
      ? Math.min(financials?.rewardDiscountINR || 0, summary.grandTotal)
      : 0;
  const finalTotal = Math.max(summary.grandTotal - pointsDiscount, 0);

  useEffect(() => {
    onSummaryChange?.({ ...summary, grandTotal: finalTotal, pointsDiscount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, finalTotal, pointsDiscount, onSummaryChange]);

  const advanceAmount = paymentType === "advance"
    ? Math.round(finalTotal * ((catConfig?.advancePercent ?? 30) / 100))
    : finalTotal;
  const remainingAmount = Math.max(finalTotal - advanceAmount, 0);
  const payableNow = currentStep === 2 && paymentType === "advance" ? advanceAmount : finalTotal;

  /* ── Breakdown group contents ────────────────────────────────────────
     Every group below shows a GROSS total (net + its own GST slice), with
     GST nested as a sub-item in that group's breakdown rather than one
     blended line — gstRate is applied per-group so each group reconciles
     to its own gross figure, and the three gross totals still sum exactly
     to summary.payableAmount (tax is linear, so splitting it per-group
     doesn't change the total sent to the payment gateway). */
  const gstRate = summary.gstPercent / 100;
  const gstItemLabel = t("gst_label", { percent: summary.gstPercent });

  const baseItems = [];
  if (normCat !== "venues") {
    baseItems.push({
      label: t("rate_x_nights", {
        rate: format(venueData?.nightly_amount || venueData?.minPrice || 0),
        nights: summary.nights,
      }),
      value: summary.baseAmount,
    });
    if (summary.weeklyAmount > 0) baseItems.push({ label: t("weekend_charges"), value: summary.weeklyAmount });
    if (summary.cleaningAmount > 0) baseItems.push({ label: t("cleaning_fee"), value: summary.cleaningAmount });
  } else if (booking.shift) {
    // Venues price per shift rather than per night — a single line, but
    // still worth naming so "Base Price" isn't just a bare number.
    baseItems.push({ label: tBook(`shift_${booking.shift}`), value: summary.baseAmount });
  }
  const baseGroupTotal = summary.baseAmount + summary.weeklyAmount + summary.cleaningAmount;
  const baseGst = baseGroupTotal * gstRate;
  const baseGross = baseGroupTotal + baseGst;
  if (baseGst > 0) baseItems.push({ label: gstItemLabel, value: baseGst });

  const addonItems = Array.from(addonSummary?.selectedAddOns?.values?.() ?? []).map(({ addon, qty }) => ({
    label: qty > 1 ? t("addon_line_label", { name: addon?.add_on_name ?? "", count: qty }) : addon?.add_on_name ?? "",
    value: Number(addon?.price || 0) * (qty || 1),
  }));
  const addonsGst = summary.addonAmount * gstRate;
  const addonsGross = summary.addonAmount + addonsGst;
  if (addonsGst > 0) addonItems.push({ label: gstItemLabel, value: addonsGst });

  const feeGst = summary.convenienceFee * gstRate;
  const feeGross = summary.convenienceFee + feeGst;
  const feeItems = [
    { label: t("platform_fee_caption"), value: summary.convenienceFee },
    ...(feeGst > 0 ? [{ label: gstItemLabel, value: feeGst }] : []),
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 space-y-5">
        {/* ── Financial breakdown ──────────────────────────────────────── */}
        <div className="space-y-3">
          <BreakdownGroup
            label={t("base_price")}
            amount={baseGross}
            format={format}
            items={baseItems}
            tAria={t("toggle_breakdown", { section: t("base_price") })}
          />

          {summary.addonAmount > 0 && (
            <BreakdownGroup
              label={t("addons")}
              amount={addonsGross}
              format={format}
              items={addonItems}
              tAria={t("toggle_breakdown", { section: t("addons") })}
            />
          )}

          {/* Platform Fee — its own group; GST on the fee nests inside its
              breakdown instead of being blended into one site-wide GST line. */}
          {summary.convenienceFee > 0 && (
            <BreakdownGroup
              label={t("platform_fee")}
              amount={feeGross}
              format={format}
              items={feeItems}
              tAria={t("toggle_breakdown", { section: t("platform_fee") })}
            />
          )}

          {/* Security deposit — highlighted, no breakdown. Negative margin +
              matching padding so the background bleeds slightly wider than
              the row while the label text stays flush with the rows above. */}
          {summary.securityDeposit > 0 && (
            <div className="-mx-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-amber-800 dark:text-amber-300">
                  {t("security_deposit")}
                  <span className="relative shrink-0 group">
                    <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    {/* Sits fully above the icon (bottom-full + mb-2 gap) instead
                        of overlapping the row it's anchored to, with a small
                        arrow pointing back down at the icon. */}
                    <div className="pointer-events-none absolute bottom-full mb-2 start-0 z-20 w-56 rounded-xl bg-gray-900 dark:bg-gray-700 px-3 py-2 text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                      {t("security_deposit_tooltip")}
                      <div className="absolute top-full start-2 -mt-1 h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700" />
                    </div>
                  </span>
                </span>
                <span className="text-sm font-bold text-amber-800 dark:text-amber-300 shrink-0">
                  {format(summary.securityDeposit)}
                </span>
              </div>
            </div>
          )}

          {/* Points redeemed — non-venue categories only, when wallet applied */}
          {pointsDiscount > 0 && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-emerald-600 dark:text-emerald-400">{t("points_redeemed")}</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                −{format(pointsDiscount)}
              </span>
            </div>
          )}

          {/* ── Total Payable — stands out via weight/border, not size ──── */}
          <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t-2 border-gray-200 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{t("total")}</span>
            <span className="text-lg font-extrabold shrink-0 text-gray-900 dark:text-gray-100">
              {format(finalTotal)}
            </span>
          </div>

          {/* Advance payment breakdown — step 2 only, when advance is selected */}
          {currentStep === 2 && paymentType === "advance" && (
            <div className="mt-2 rounded-xl p-3 space-y-1 text-xs" style={{ backgroundColor: tint.light }}>
              <div className="flex items-center justify-between gap-2">
                <span style={{ color: tint.hex }}>{t("pay_now")}</span>
                <span className="font-semibold" style={{ color: tint.hex }}>{format(advanceAmount)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span style={{ color: tint.hex }}>{t("remaining_balance")}</span>
                <span className="font-semibold" style={{ color: tint.hex }}>{format(remainingAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Loyalty callout ──────────────────────────────────────────── */}
        {/* Venue bookings don't surface the loyalty/points program on checkout;
            every other category (farmstays, etc.) keeps it. */}
        {normCat !== "venues" && (
          <LoyaltyCallout
            financials={financials}
            currentTier={currentTier}
            pointsTotal={pointsTotal}
            tSummary={t}
          />
        )}

        {/* ── Terms & Conditions checkbox gate ────────────────────────── */}
        {/* Step 1 only — once accepted, the user proceeds to Contact & Payment. */}
        {currentStep === 1 && (
          <button
            type="button"
            onClick={() => onToggleTerms?.(!termsAccepted)}
            className="flex w-full items-start gap-3 text-start"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                termsAccepted ? "border-transparent text-white" : "border-gray-300 dark:border-gray-600"
              }`}
              style={termsAccepted ? { backgroundColor: tint.hex } : undefined}
            >
              {termsAccepted && (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {tTerms("agree_prefix")}{" "}
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onOpenTerms?.("terms"); }}
                className="font-medium underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {tTerms("agree_terms_link")}
              </span>{" "}
              {tTerms("agree_and")}{" "}
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onOpenTerms?.("cancellation"); }}
                className="font-medium underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {tTerms("agree_cancellation_link")}
              </span>
            </span>
          </button>
        )}

        {/* ── CTA button ───────────────────────────────────────────────── */}
        {currentStep === 1 ? (
          <button
            type="button"
            onClick={onProceed}
            disabled={!termsAccepted}
            className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-40"
            style={{ backgroundColor: tint.hex, boxShadow: termsAccepted ? tint.activeGlow : "none" }}
          >
            {t("proceed_to_checkout")}
          </button>
        ) : (
          <button
            onClick={onPay}
            disabled={isProcessing || disablePay}
            className="w-full py-3 px-4 rounded-xl text-white text-sm font-semibold tracking-wide transition-all duration-200 relative overflow-hidden disabled:opacity-70"
            style={{
              backgroundColor: tint.hex,
              boxShadow: isProcessing ? "none" : tint.activeGlow,
            }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="truncate">{tPayment("processing")}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 text-center">
                <span className="truncate">{tCta(ctaKey)}</span>
                <span className="font-normal opacity-80 whitespace-nowrap">·{format(payableNow)}</span>
              </span>
            )}
          </button>
        )}

        {currentStep === 1 && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">{t("no_charge_note")}</p>
        )}
      </div>
    </div>
  );
}