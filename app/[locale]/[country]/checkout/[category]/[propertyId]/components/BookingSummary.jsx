"use client";

/**
 * BookingSummary.jsx
 *
 * Right-column sticky panel containing:
 *   1. Property card
 *   2. Category-specific booking snapshot
 *   3. Financial breakdown (live updates)
 *   4. Security deposit (when applicable)
 *   5. Loyalty reward callout
 *   6. Payment method selector
 *   7. Trust block
 *   8. Primary CTA
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MEMBERSHIP_TIERS } from "@/config/checkoutConfig";

/* ─── Line item ──────────────────────────────────────────────────────── */
function LineItem({ label, value, isTotal, isDiscount, tooltip }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className={`flex items-center justify-between gap-2 ${
        isTotal ? "pt-3 mt-3 border-t border-gray-200 dark:border-neutral-700" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`text-sm truncate ${
            isTotal
              ? "font-semibold text-gray-900 dark:text-neutral-100"
              : "text-gray-500 dark:text-neutral-400"
          }`}
        >
          {label}
        </span>
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onClick={() => setShowTip((p) => !p)}
              className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 flex-shrink-0"
              aria-label="More info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
            {showTip && (
              <div className="absolute bottom-5 start-0 z-10 w-56 px-3 py-2 rounded-xl bg-gray-900 dark:bg-neutral-700 text-xs text-white shadow-xl">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <span
        className={`text-sm font-medium shrink-0 ${
          isTotal
            ? "text-lg font-bold text-gray-900 dark:text-neutral-100"
            : isDiscount
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-gray-700 dark:text-neutral-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Category booking snapshot ─────────────────────────────────────── */
function CategorySummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-gray-400 dark:text-neutral-500">{label}</span>
      <span className="font-medium text-gray-700 dark:text-neutral-300 text-end max-w-[60%]">{value}</span>
    </div>
  );
}

function CategorySnapshot({ normCat, bookingDetails, t }) {
  const tBook = useTranslations("checkout.booking");

  switch (normCat) {
    case "venues":
      return (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <CategorySummaryRow label={t("event_type")} value={bookingDetails.eventType} />
          <CategorySummaryRow label={t("event_date")} value={bookingDetails.eventDate} />
          <CategorySummaryRow label={t("shift")} value={bookingDetails.shift ? tBook(`shift_${bookingDetails.shift}`) : null} />
          <CategorySummaryRow label={t("guest_count")} value={bookingDetails.guestCount ? `${bookingDetails.guestCount} guests` : null} />
        </div>
      );
    case "farmstays":
      return (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <CategorySummaryRow label={t("check_in")} value={bookingDetails.checkIn} />
          <CategorySummaryRow label={t("check_out")} value={bookingDetails.checkOut} />
          <CategorySummaryRow label={t("guest_count")} value={bookingDetails.adults ? `${bookingDetails.adults} adults${bookingDetails.children ? `, ${bookingDetails.children} children` : ""}` : null} />
        </div>
      );
    case "studios":
      return (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <CategorySummaryRow label={t("shoot_date")} value={bookingDetails.shootDate} />
          <CategorySummaryRow label={t("time_slot")} value={bookingDetails.timeSlot} />
          <CategorySummaryRow label={t("studio_name")} value="Studio A" />
        </div>
      );
    case "workspaces":
      return (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <CategorySummaryRow label={t("booking_hours")} value={bookingDetails.timeSlot} />
          <CategorySummaryRow label={t("seats")} value={bookingDetails.seats ? `${bookingDetails.seats} seats` : null} />
        </div>
      );
    case "rentals":
      return (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <CategorySummaryRow label={t("rental_duration")} value={bookingDetails.rentalStart ? "2 days" : null} />
          <CategorySummaryRow label={t("pickup")} value={bookingDetails.pickup} />
        </div>
      );
    case "experiences":
      return (
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <CategorySummaryRow label={t("experience_date")} value={bookingDetails.experienceDate} />
          <CategorySummaryRow label={t("session")} value={bookingDetails.sessionTime} />
          <CategorySummaryRow label={t("participants")} value={bookingDetails.participants ? `${bookingDetails.participants} participants` : null} />
        </div>
      );
    default:
      return null;
  }
}

/* ─── Payment method selector ───────────────────────────────────────── */
function PaymentMethodTab({ id, label, icon, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
        selected
          ? "border-transparent text-white shadow-sm"
          : "border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-800 hover:border-gray-300"
      }`}
      style={selected ? { backgroundColor: "#1f2937" } : {}}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

/* ─── Trust block ────────────────────────────────────────────────────── */
function TrustBlock({ tTrust }) {
  const items = [
    { key: "cancellation", icon: "↩" },
    { key: "secure", icon: "🔒" },
    { key: "no_hidden", icon: "✦" },
    { key: "verified", icon: "✓" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ key, icon }) => (
        <div
          key={key}
          className="flex items-center gap-2 text-xs text-gray-500 dark:text-neutral-400"
        >
          <span className="text-emerald-500 text-sm">{icon}</span>
          <span>{tTrust(key)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Loyalty progress ───────────────────────────────────────────────── */
function LoyaltyCallout({ financials, currentTier, format, tSummary }) {
  const nextTier = MEMBERSHIP_TIERS.find((t) => t.minPoints > financials.totalINR * 2 + 12500);
  const progressPercent = currentTier.nextAt
    ? Math.min(100, Math.round(((12500 - currentTier.minPoints) / (currentTier.nextAt - currentTier.minPoints)) * 100))
    : 100;

  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
          {tSummary("earning_points")}
        </p>
        <p className="text-sm font-bold text-violet-900 dark:text-violet-100">
          +{financials.pointsEarned.toLocaleString()} {tSummary("points_label")}
        </p>
      </div>

      {currentTier.nextAt && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-violet-600 dark:text-violet-400">
            <span>{currentTier.label}</span>
            <span>{tSummary("tier_progress", { tier: MEMBERSHIP_TIERS[MEMBERSHIP_TIERS.findIndex((t) => t.id === currentTier.id) + 1]?.label ?? "" })}</span>
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

/* ─── Main component ────────────────────────────────────────────────── */
export default function BookingSummary({
  tint,
  normCat,
  ctaKey,
  property,
  financials,
  bookingDetails,
  catConfig,
  currentTier,
  format,
  paymentMethod,
  onPaymentMethodChange,
  isProcessing,
  onPay,
}) {
  const t = useTranslations("checkout.summary");
  const tPayment = useTranslations("checkout.payment");
  const tTrust = useTranslations("checkout.trust");
  const tCta = useTranslations("checkout.cta");

  const [upiInput, setUpiInput] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const paymentMethods = [
    { id: "upi", label: tPayment("upi"), icon: "⚡" },
    { id: "cards", label: tPayment("cards"), icon: "💳" },
    { id: "netbanking", label: tPayment("netbanking"), icon: "🏦" },
    { id: "wallets", label: tPayment("wallets"), icon: "📱" },
    { id: "emi", label: tPayment("emi"), icon: "📅" },
  ];

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 transition-shadow";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">

      {/* ── Property card ────────────────────────────────────────────── */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs text-white/70 font-medium">{property.parentName}</p>
          <p className="text-white font-semibold text-base leading-tight">{property.name}</p>
          <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" clipRule="evenodd" />
            </svg>
            {property.location}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* ── Category snapshot ───────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
            {t("title")}
          </p>
          <CategorySnapshot normCat={normCat} bookingDetails={bookingDetails} t={t} />
        </div>

        {/* ── Financial breakdown ──────────────────────────────────────── */}
        <div className="space-y-2 border-t border-gray-100 dark:border-neutral-800 pt-4">
          <LineItem label={t("base_price")} value={format(financials.baseINR)} />
          {financials.addOnsINR > 0 && (
            <LineItem label={t("addons")} value={`+ ${format(financials.addOnsINR)}`} />
          )}
          <LineItem label={t("platform_fee")} value={format(financials.platformFeeINR)} />
          <LineItem label={t("taxes")} value={format(financials.taxINR)} />
          {financials.rewardDiscountINR > 0 && (
            <LineItem
              label={t("reward_discount")}
              value={`− ${format(financials.rewardDiscountINR)}`}
              isDiscount
            />
          )}
          {catConfig.depositApplies && financials.depositINR > 0 && (
            <LineItem
              label={t("security_deposit")}
              value={format(financials.depositINR)}
              tooltip={t("security_deposit_tooltip")}
            />
          )}
          <LineItem
            label={t("total")}
            value={format(financials.totalINR)}
            isTotal
          />
          {catConfig.depositApplies && (
            <p className="text-xs text-gray-400 dark:text-neutral-500 text-end">
              {t("security_deposit_note")}
            </p>
          )}
        </div>

        {/* ── Loyalty callout ──────────────────────────────────────────── */}
        <LoyaltyCallout
          financials={financials}
          currentTier={currentTier}
          format={format}
          tSummary={t}
        />

        {/* ── Payment method ───────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100 mb-3">
            {tPayment("title")}
          </p>

          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {paymentMethods.map((m) => (
              <PaymentMethodTab
                key={m.id}
                id={m.id}
                label={m.label}
                icon={m.icon}
                selected={paymentMethod === m.id}
                onSelect={onPaymentMethodChange}
              />
            ))}
          </div>

          {/* UPI input */}
          {paymentMethod === "upi" && (
            <input
              type="text"
              value={upiInput}
              onChange={(e) => setUpiInput(e.target.value)}
              placeholder={tPayment("upi_placeholder")}
              className={inputClass}
            />
          )}

          {/* Card inputs */}
          {paymentMethod === "cards" && (
            <div className="space-y-2">
              <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder={tPayment("card_number")} className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder={tPayment("card_expiry")} className={inputClass} />
                <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder={tPayment("card_cvv")} className={inputClass} maxLength={4} />
              </div>
              <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder={tPayment("card_name")} className={inputClass} />
            </div>
          )}

          {/* Other methods placeholder */}
          {(paymentMethod === "netbanking" || paymentMethod === "wallets" || paymentMethod === "emi") && (
            <div className="flex items-center justify-center py-6 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-dashed border-gray-200 dark:border-neutral-700">
              <p className="text-sm text-gray-400 dark:text-neutral-500">
                {paymentMethod === "netbanking" ? "Select your bank after proceeding" : paymentMethod === "wallets" ? "PhonePe, Google Pay, Paytm & more" : "Select EMI plan after proceeding"}
              </p>
            </div>
          )}
        </div>

        {/* ── Trust block ──────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-neutral-800 pt-4">
          <TrustBlock tTrust={tTrust} />
        </div>

        {/* ── CTA button ───────────────────────────────────────────────── */}
        <button
          onClick={onPay}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl text-white text-base font-semibold tracking-wide transition-all duration-200 relative overflow-hidden disabled:opacity-70"
          style={{
            backgroundColor: tint.hex,
            boxShadow: isProcessing ? "none" : tint.activeGlow,
          }}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {tPayment("processing")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {tCta(ctaKey)}
              <span className="font-normal opacity-80">· {format(financials.totalINR)}</span>
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
