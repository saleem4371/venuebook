"use client";

import { useState } from "react";
import { ShieldAlert, X, ArrowRight } from "lucide-react";
import KYCModal from "./KYCModal";

export default function VerificationBanner() {
  const [open,      setOpen]      = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* ── Fixed outer layer — pointer-events-none so page content below is clickable ── */}
      <div
        aria-live="polite"
        className="fixed inset-x-0 top-[64px] md:top-[116px] z-[39] pointer-events-none"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-3">
          {/* ── Floating pill ── */}
          <div
            role="alert"
            className={[
              "pointer-events-auto",
              "flex items-center justify-between gap-3",
              "px-3.5 py-2 rounded-xl",
              "bg-amber-50/90 dark:bg-amber-950/20",
              "border border-amber-200/60 dark:border-amber-800/30",
              "shadow-sm shadow-amber-100/50 dark:shadow-black/20",
              "backdrop-blur-md",
            ].join(" ")}
          >
            {/* Left — icon + message */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0 flex items-center justify-center h-6 w-6 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <ShieldAlert
                  size={13}
                  className="text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 truncate leading-snug">
                <span className="font-semibold">KYC verification pending</span>
                <span className="hidden sm:inline font-normal text-amber-700/80 dark:text-amber-400/70">
                  {" "}— complete it to unlock all features.
                </span>
              </p>
            </div>

            {/* Right — action + dismiss */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className={[
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg cursor-pointer",
                  "text-[11px] font-semibold",
                  "text-amber-700 dark:text-amber-300",
                  "hover:bg-amber-100 dark:hover:bg-amber-900/30",
                  "transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1",
                ].join(" ")}
              >
                Verify now
                <ArrowRight size={11} className="shrink-0" />
              </button>
              <div className="w-px h-3.5 bg-amber-200/70 dark:bg-amber-800/40 shrink-0" />
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss verification banner"
                className="inline-flex h-6 w-6 items-center justify-center rounded-lg text-amber-500 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <KYCModal open={open} setOpen={setOpen} />
    </>
  );
}
