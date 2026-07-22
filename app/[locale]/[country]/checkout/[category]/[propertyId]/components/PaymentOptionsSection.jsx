"use client";

/**
 * PaymentOptionsSection.jsx
 *
 * Step 2 "Checkout" left column — Full vs Advance payment selector with a
 * pay-now/remaining/due-date schedule breakdown, ported from the reference
 * BookingSummary.vue's Payment Options card. Only rendered when the active
 * category's checkoutConfig has `allowAdvancePayment: true`.
 *
 * Controlled component: `paymentType` ("full" | "advance") is owned by the
 * parent so the selected amount can drive both the sidebar CTA and the
 * actual startPayment() call.
 */

import { useTranslations } from "next-intl";

function PaymentOptionCard({ selected, onSelect, title, amount, description }) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        selected
          ? "border-transparent ring-2"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
      style={selected ? { backgroundColor: "var(--vb-option-bg)", "--tw-ring-color": "var(--vb-option-ring)" } : undefined}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "" : "border-gray-300 dark:border-gray-600"
        }`}
        style={selected ? { borderColor: "var(--vb-option-ring)" } : undefined}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "var(--vb-option-ring)" }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
          <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            {amount}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function PaymentOptionsSection({
  tint,
  format,
  total,
  advancePercent = 30,
  paymentType,
  onChangePaymentType,
  dueDateLabel,
}) {
  const t = useTranslations("checkout.payment_options");

  const advanceAmount = Math.round((total || 0) * (advancePercent / 100));
  const remainingAmount = Math.max((total || 0) - advanceAmount, 0);

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      aria-label={t("title")}
      style={{ "--vb-option-bg": tint?.light, "--vb-option-ring": tint?.hex }}
    >
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("title")}</h2>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-3">
        <div role="radiogroup" aria-label={t("title")} className="space-y-3">
          <PaymentOptionCard
            selected={paymentType === "full"}
            onSelect={() => onChangePaymentType("full")}
            title={t("full_title")}
            amount={format(total)}
            description={t("full_desc")}
          />
          <PaymentOptionCard
            selected={paymentType === "advance"}
            onSelect={() => onChangePaymentType("advance")}
            title={t("advance_title")}
            amount={format(advanceAmount)}
            description={t("advance_desc", { percent: advancePercent })}
          />
        </div>

        {paymentType === "advance" && (
          <div
            className="rounded-xl border p-4 space-y-2.5"
            style={{ borderColor: tint?.border, backgroundColor: tint?.light }}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke={tint?.hex} strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
              <span className="text-sm font-semibold" style={{ color: tint?.hex }}>
                {t("schedule_title")}
              </span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">{t("pay_now")}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {format(advanceAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 dark:text-gray-400">{t("remaining_balance")}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {format(remainingAmount)}
                </span>
              </div>
              {dueDateLabel && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500 dark:text-gray-400">{t("due_date")}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {dueDateLabel}
                  </span>
                </div>
              )}
            </div>

            <p className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-1 border-t border-gray-200/70 dark:border-gray-700/70">
              <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {t("reminder_note")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
