"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   LogoutConfirmationModal — shared, reusable
   Used by: consumer (UserDropdown), vendor (Navbar)

   Props:
     open       boolean  — controlled visibility
     onCancel   fn()     — Cancel button / ESC / backdrop click
     onConfirm  fn()     — "Log Out" button (execute logout + redirect)
─────────────────────────────────────────────────────────────────────────────── */
export default function LogoutConfirmationModal({ open, onCancel, onConfirm }) {
  // ESC to cancel
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onCancel]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lcm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            style={{ zIndex: 99998 }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="lcm-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lcm-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96,  y: 6  }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "fixed bg-white dark:bg-gray-900",
              "shadow-[0_24px_60px_rgba(0,0,0,0.18)]",
              "rounded-[22px] overflow-hidden",
              /* Desktop — centred */
              "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[calc(100vw-32px)] max-w-[460px]",
            ].join(" ")}
            style={{ zIndex: 99999 }}
          >
            <div className="px-7 pt-8 pb-7">

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #a44bf314, #499ce814)" }}
                >
                  <svg
                    width="26" height="26" viewBox="0 0 24 24"
                    fill="none" stroke="url(#lcm-grad)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="lcm-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a44bf3" />
                        <stop offset="100%" stopColor="#499ce8" />
                      </linearGradient>
                    </defs>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2
                id="lcm-title"
                className="text-[19px] font-bold text-gray-900 dark:text-white text-center mb-2"
              >
                Log out?
              </h2>

              {/* Description */}
              <p className="text-[13.5px] text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-1">
                Are you sure you want to sign out of your account?
              </p>
              <p className="text-[12.5px] text-gray-400 dark:text-gray-500 text-center mb-7">
                You can sign back in anytime.
              </p>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 min-h-[44px] px-5 rounded-xl text-[13.5px] font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 min-h-[44px] px-5 rounded-xl text-[13.5px] font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #a44bf3, #499ce8)" }}
                >
                  Log Out
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
