"use client";

/**
 * RefundPolicy.jsx
 *
 * Cancellation / refund tier breakdown shown inside TermsModal's
 * "Cancellation Policy" tab. Ported from the reference RefundPolicy.vue
 * component onto the existing Tailwind design system.
 *
 * Each tier: { daysFrom, daysTo, refundPercent, description, condition, color }
 *   color is one of "success" | "warning" | "danger".
 *
 * `compact` renders the condensed list used for quick previews;
 * the default (full) view is the detailed breakdown shown in the modal.
 */

import { useTranslations } from "next-intl";

const TIER_STYLES = {
  success: {
    border: "border-emerald-200 dark:border-emerald-800",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    title: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
    title: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    border: "border-red-200 dark:border-red-800",
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-700 dark:text-red-300",
  },
};

function TierIcon({ percent, className }) {
  if (percent >= 75) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
      </svg>
    );
  }
  if (percent > 0) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
    </svg>
  );
}

export default function RefundPolicy({ compact = false, cancellationRule }) {
  const t = useTranslations("checkout.terms");
  const tiers = Array.isArray(cancellationRule) ? cancellationRule : [];

  if (tiers.length === 0) return null;

  if (compact) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        {tiers.map((tier, index) => {
          const percent = tier.refundPercent ?? tier.refundPercentage ?? 0;
          const style = TIER_STYLES[tier.color] ?? TIER_STYLES.success;
          return (
            <div
              key={index}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${style.border} ${style.bg}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <TierIcon percent={percent} className={`h-4 w-4 shrink-0 ${style.icon}`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {tier.condition}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-md px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                  percent === 0
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                }`}
              >
                {t("refund_percent", { percent })}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Timeline — connecting line down the side with a colored marker per
          tier (green/amber/red), so the tiers read as a chronological
          progression rather than a stack of isolated cards. */}
      <div className="relative flex flex-col">
        <div
          className="absolute start-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700"
          aria-hidden="true"
        />

        {tiers.map((tier, index) => {
          const percent = tier.refundPercent ?? tier.refundPercentage ?? 0;
          const style = TIER_STYLES[tier.color] ?? TIER_STYLES.success;
          const isLast = index === tiers.length - 1;
          return (
            <div key={index} className={`relative flex items-start gap-4 ${isLast ? "" : "pb-6"}`}>
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900 ${style.border}`}
              >
                <TierIcon percent={percent} className={`h-5 w-5 ${style.icon}`} />
              </div>
              <div className="min-w-0 flex-1 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className={`text-sm font-semibold truncate ${style.title}`}>
                    {tier.daysFrom != null && tier.daysTo != null
                      ? t("day_range", { from: tier.daysFrom, to: tier.daysTo })
                      : tier.condition}
                  </h4>
                  <span
                    className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                      percent === 0
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                    }`}
                  >
                    {t("refund_percent", { percent })}
                  </span>
                </div>
                {tier.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {tier.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <strong className="font-semibold text-gray-700 dark:text-gray-300">
            {t("note_label")}
          </strong>{" "}
          {t("default_note")}
        </p>
      </div>
    </div>
  );
}
