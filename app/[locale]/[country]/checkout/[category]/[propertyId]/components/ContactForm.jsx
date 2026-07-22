"use client";

/**
 * ContactForm.jsx
 *
 * Step 2 "Checkout" left column — contact details used for the booking
 * confirmation + payment gateway, plus an optional special-requests note.
 * Ported from the reference BookingSummary.vue's Contact Information card.
 *
 * Controlled component: `formData`/`errors` are owned by the parent
 * (CheckoutClient) so the same values can be sent to startPayment().
 */

import { useTranslations } from "next-intl";

const inputClass =
  "w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow";

function FieldWrapper({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ContactForm({ tint, formData, errors, onChange, onBlur }) {
  const t = useTranslations("checkout.contact");

  const borderClass = (field) =>
    errors?.[field]
      ? "border-red-400 dark:border-red-600 focus:ring-red-400"
      : "border-gray-200 dark:border-gray-700";

  const focusStyle = { "--tw-ring-color": tint?.hex ?? "#7c3aed" };

  return (
    <section
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
      aria-label={t("title")}
    >
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("title")}</h2>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        <FieldWrapper label={t("full_name")} required error={errors?.fullName}>
          <input
            type="text"
            value={formData.fullName ?? ""}
            onChange={(e) => onChange("fullName", e.target.value)}
            onBlur={() => onBlur?.("fullName")}
            placeholder={t("full_name_placeholder")}
            className={`${inputClass} ${borderClass("fullName")}`}
            style={focusStyle}
          />
        </FieldWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper label={t("email")} required error={errors?.email}>
            <input
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              onBlur={() => onBlur?.("email")}
              placeholder={t("email_placeholder")}
              className={`${inputClass} ${borderClass("email")}`}
              style={focusStyle}
            />
          </FieldWrapper>
          <FieldWrapper label={t("phone")} required error={errors?.phone}>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone ?? ""}
              onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={() => onBlur?.("phone")}
              placeholder={t("phone_placeholder")}
              className={`${inputClass} ${borderClass("phone")}`}
              style={focusStyle}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper label={t("organization")}>
          <input
            type="text"
            value={formData.organization ?? ""}
            onChange={(e) => onChange("organization", e.target.value)}
            placeholder={t("organization_placeholder")}
            className={`${inputClass} border-gray-200 dark:border-gray-700`}
            style={focusStyle}
          />
        </FieldWrapper>

        <FieldWrapper label={t("special_requests")}>
          <textarea
            value={formData.specialRequests ?? ""}
            onChange={(e) => onChange("specialRequests", e.target.value)}
            placeholder={t("special_requests_placeholder")}
            rows={3}
            className={`${inputClass} border-gray-200 dark:border-gray-700`}
            style={focusStyle}
          />
        </FieldWrapper>
      </div>
    </section>
  );
}
