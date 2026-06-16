"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

/*
  WizardFooter — sticky, full-width bottom bar.

  Props:
    isFirst / isLast / isCurrentValid — step state
    onBack / onNext / onSubmit       — navigation handlers
    fromReview                       — true when the user arrived here via a
                                       Review-step Edit button
    onBackToReview                   — called when "Back to Review" is clicked
*/
export default function WizardFooter({
  isFirst, isLast, isCurrentValid,
  onBack, onNext, onSubmit,
  fromReview = false, onBackToReview,
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit?.();
      // On success the wizard navigates away — submitting stays true intentionally
      // to prevent double-clicks while the route transition completes.
    } catch (_) {
      // API error — re-enable so user can retry without a page refresh
      setSubmitting(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
      <div className="w-full px-5 sm:px-10 py-4 flex items-center justify-between gap-3">

        {/* ── Back ──────────────────────────────────────────────────── */}
        {/* Hidden on step 1 — there's no previous wizard step to go back to */}
        {isFirst ? (
          <div aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={onBack}
            aria-label="Previous step"
            className={[
              "min-h-[44px] px-6 rounded-xl text-sm font-semibold border flex-shrink-0",
              "inline-flex items-center transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.97]",
            ].join(" ")}
          >
            Back
          </button>
        )}

        {/* ── Right-side actions ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">

          {/* "Back to Review" shortcut — shown when editing from review */}
          {fromReview && !isLast && (
            <button
              type="button"
              onClick={onBackToReview}
              aria-label="Back to review step"
              className={[
                "min-h-[44px] px-5 rounded-xl text-sm font-semibold border flex-shrink-0",
                "inline-flex items-center gap-2 transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                "border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300",
                "bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/30 active:scale-[0.97]",
              ].join(" ")}
            >
              <RotateCcw size={13} strokeWidth={2.2} />
              <span className="hidden sm:inline">Back to Review</span>
              <span className="sm:hidden">Review</span>
            </button>
          )}

          {/* Continue / Submit */}
          {isLast ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              aria-label="Submit listing"
              className={[
                "min-h-[44px] px-8 rounded-xl text-sm font-semibold text-white",
                "inline-flex items-center justify-center gap-2",
                "transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                submitting
                  ? "opacity-60"
                  : "hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200 dark:shadow-violet-950/50",
              ].join(" ")}
              style={{ background: "linear-gradient(242deg, #a44bf3, #499ce8)" }}
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                : "Submit Listing"
              }
            </button>
          ) : (
            <button
              type="button"
              onClick={isCurrentValid ? onNext : undefined}
              disabled={!isCurrentValid}
              aria-label="Continue to next step"
              className={[
                "min-h-[44px] px-8 rounded-xl text-sm font-semibold",
                "inline-flex items-center justify-center",
                "transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                isCurrentValid
                  ? "text-white hover:opacity-90 active:scale-[0.98] shadow-lg shadow-violet-200 dark:shadow-violet-950/50"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 shadow-none",
              ].join(" ")}
              style={isCurrentValid ? { background: "linear-gradient(242deg, #a44bf3, #499ce8)" } : {}}
            >
              Continue
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
