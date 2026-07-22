"use client";

/**
 * CheckoutProgressSteps.jsx
 *
 * 3-step progress indicator (Review → Checkout → Confirmation), ported from
 * the reference BookingSummary.vue's `vb-checkout-progress` onto the
 * existing Tailwind design system.
 *
 * Completed steps (currentStep > step.id) are clickable via onStepClick,
 * so users can jump back to Review from Checkout. Step 3 ("Confirmation")
 * lives on a separate route (the existing /checkout/[category]/[propertyId]/success
 * page) rather than as in-page step state, so it's never clickable — shown
 * for visual continuity/expectation-setting only.
 */

import { useTranslations } from "next-intl";

export default function CheckoutProgressSteps({ tint, currentStep, onStepClick }) {
  const t = useTranslations("checkout.steps");

  const steps = [
    { id: 1, label: t("review_label"), description: t("review_desc") },
    { id: 2, label: t("checkout_label"), description: t("checkout_desc") },
    { id: 3, label: t("confirm_label"), description: t("confirm_desc") },
  ];

  return (
    <div className="flex items-start mb-6 sm:mb-8" aria-label={t("aria_label")}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep >= step.id;
        const isClickable = isCompleted && typeof onStepClick === "function";
        const Tag = isClickable ? "button" : "div";

        return (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}
          >
            <Tag
              type={isClickable ? "button" : undefined}
              onClick={isClickable ? () => onStepClick(step.id) : undefined}
              className={`flex items-center gap-2 sm:gap-3 min-w-0 ${
                isClickable ? "cursor-pointer rounded-lg -m-1 p-1 hover:opacity-80 transition-opacity" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                  isActive ? "text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
                style={isActive ? { backgroundColor: tint.hex } : undefined}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden sm:block min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${
                    isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{step.description}</p>
              </div>
              <p
                className={`sm:hidden text-xs font-semibold truncate ${
                  isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </p>
            </Tag>

            {index < steps.length - 1 && (
              <div
                className={`mx-2 sm:mx-4 h-0.5 flex-1 rounded-full transition-colors ${
                  currentStep > step.id ? "" : "bg-gray-200 dark:bg-gray-700"
                }`}
                style={currentStep > step.id ? { backgroundColor: tint.hex } : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
