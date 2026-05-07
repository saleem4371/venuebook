"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/*
  WizardFooter — sticky, full-width bottom bar.
  No max-width constraint on the outer shell.
  Buttons: Back (outline, left) · Continue/Submit (gradient fill, auto-width, right).
  Back is invisible on step 0 but occupies space so Continue doesn't shift.

  Interaction rules:
  - All clickable states: cursor-pointer (via globals.css)
  - All disabled states:  cursor-not-allowed (via globals.css button:disabled rule)
  - Submit button disabled + spinner while submitting to block double-clicks
  - Continue button disabled (not just styled) when step is invalid
*/
export default function WizardFooter({
  isFirst, isLast, isCurrentValid, onBack, onNext, onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    onSubmit?.();
    setSubmitting(false);
  };

  return (
    <div className="sticky bottom-0 z-40 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
      <div className="w-full px-5 sm:px-10 py-4 flex items-center justify-between gap-4">

        {/* ── Back ─────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          aria-label="Previous step"
          className={[
            "h-11 px-6 rounded-xl text-sm font-semibold border flex-shrink-0",
            "inline-flex items-center transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
            isFirst
              ? "opacity-0 pointer-events-none border-transparent"
              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.97]",
          ].join(" ")}
        >
          Back
        </button>

        {/* ── Continue / Submit — auto-width, right-aligned ─────────── */}
        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            aria-label="Submit listing"
            className={[
              "h-11 px-8 rounded-xl text-sm font-semibold text-white",
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
              "h-11 px-8 rounded-xl text-sm font-semibold",
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
  );
}
