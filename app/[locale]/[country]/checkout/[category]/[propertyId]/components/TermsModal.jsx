"use client";

/**
 * TermsModal.jsx
 *
 * Terms & Conditions / Cancellation Policy / Privacy Policy modal, ported
 * from the reference TermsModal.vue onto the checkout's Tailwind design
 * system. Opened from the "Terms & Conditions" link in BookingSummary.
 *
 * Body text (terms/privacy/cancellation copy) is supplied via props from
 * checkoutConfig.js per category — legal copy is treated as content, not
 * UI chrome, so it isn't run through next-intl the way labels/buttons are.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import RefundPolicy from "./RefundPolicy";

const TABS = ["terms", "cancellation", "privacy"];

export default function TermsModal({
  open,
  onClose,
  defaultTab = "terms",
  onAccept,
  tint,
  termsText,
  privacyText,
  cancellationText,
  cancellationRule,
}) {
  const t = useTranslations("checkout.terms");
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (open) setActiveTab(defaultTab);
  }, [open, defaultTab]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const accentHex = tint?.hex ?? "#8368ef";
  const tabLabels = {
    terms: t("tab_terms"),
    cancellation: t("tab_cancellation"),
    privacy: t("tab_privacy"),
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div
        className="flex w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 dark:border-gray-800 p-5 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("description")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-5 sm:mx-6 mt-4 grid grid-cols-3 gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`truncate rounded-md px-2 py-2 text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mx-5 sm:mx-6 my-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          {activeTab === "terms" && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {termsText}
            </p>
          )}

          {activeTab === "cancellation" && (
            <div className="space-y-4">
              <RefundPolicy cancellationRule={cancellationRule} />
              {cancellationText && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {cancellationText}
                </p>
              )}
            </div>
          )}

          {activeTab === "privacy" && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {privacyText}
            </p>
          )}
        </div>

        {/* Footer */}
        {onAccept && (
          <div className="flex shrink-0 flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <button
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {t("footer_close")}
            </button>
            <button
              onClick={() => {
                onAccept();
                onClose?.();
              }}
              className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: accentHex }}
            >
              {t("footer_accept")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
