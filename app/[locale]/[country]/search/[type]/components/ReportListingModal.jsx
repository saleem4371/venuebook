"use client";

import { useState } from "react";
import { X, Flag, CheckCircle2 } from "lucide-react";

const REPORT_REASONS = [
  "This property doesn't exist",
  "The host is requesting direct payments outside venuebook.in",
  "The listing includes the host's personal contact information",
  "The host is not authorized to rent the property",
  "This listing has inaccurate or misleading information",
  "Offensive or inappropriate content",
];

export default function ReportListingModal({ open, onClose, venueName }) {
  const [step,      setStep]      = useState(1);
  const [reason,    setReason]    = useState("");
  const [details,   setDetails]   = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    onClose();
    // Reset after animation completes
    setTimeout(() => {
      setStep(1);
      setReason("");
      setDetails("");
      setSubmitted(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (!reason) return;
    // TODO: call report API with { venueName, reason, details }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 pt-5 pb-4 flex items-center justify-between rounded-t-2xl">
          <div className="w-8" /> {/* spacer */}
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 sm:hidden absolute top-2 left-1/2 -translate-x-1/2" />
          <button
            onClick={handleClose}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={15} strokeWidth={2.2} />
          </button>
        </div>

        <div className="px-6 pb-7 pt-5">

          {/* ── Submitted ── */}
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Report submitted
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Thanks for letting us know. We'll review this listing and take appropriate action if needed.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-7 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
              >
                Done
              </button>
            </div>

          ) : step === 1 ? (
            /* ── Step 1: Introduction ── */
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                What it means to report a listing
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  By submitting this form, you are reporting content on venuebook.in
                  that you believe to be fraudulent or in violation of our policies.
                </p>
                <p>
                  When you fill out this report, please be as specific as possible.
                  If your report does not contain enough information for us to assess
                  the issue, we may not be able to take action.
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    Do you have other concerns?
                  </p>
                  <p>
                    Please visit our{" "}
                    <a
                      href="/trust-safety"
                      className="text-blue-600 dark:text-blue-400 underline underline-offset-2"
                    >
                      trust and safety page
                    </a>{" "}
                    for more information on security, support, and inclusion.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-7 px-7 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </>

          ) : (
            /* ── Step 2: Reason + details ── */
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                What is suspicious or fraudulent?
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                Make sure you do not include any personal information in your feedback.
                We may contact you if we have any questions.
              </p>

              <div className="space-y-3 mb-5">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="mt-0.5 w-4 h-4 accent-gray-900 flex-none"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-snug">
                      {r}
                    </span>
                  </label>
                ))}
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide supporting details *"
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none"
              />

              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason}
                  className="px-7 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold disabled:opacity-35 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
                >
                  Submit
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
