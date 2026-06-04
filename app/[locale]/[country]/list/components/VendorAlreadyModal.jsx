"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Home } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Dashboard illustration — clean SVG, same line-art style as PropertyTypeModal
─────────────────────────────────────────────────────────────────────────────── */
function DashboardIllustration() {
  const accent  = "#a44bf3";
  const accent2 = "#499ce8";
  const fill    = `${accent}0d`;
  const fill2   = `${accent}18`;

  return (
    <svg
      viewBox="0 0 280 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vadGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent2} stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Browser chrome */}
      <rect x="20" y="14" width="240" height="102" rx="8"
        fill="url(#vadGrad)" stroke={accent} strokeWidth="1.4" strokeOpacity="0.3" />

      {/* Title bar */}
      <rect x="20" y="14" width="240" height="22" rx="8"
        fill={accent} fillOpacity="0.1" />
      <rect x="20" y="27" width="240" height="9" fill={accent} fillOpacity="0.1" />

      {/* Traffic dots */}
      <circle cx="33" cy="25" r="3.5" fill={accent} fillOpacity="0.35" />
      <circle cx="45" cy="25" r="3.5" fill={accent} fillOpacity="0.22" />
      <circle cx="57" cy="25" r="3.5" fill={accent} fillOpacity="0.14" />

      {/* URL bar */}
      <rect x="72" y="19" width="148" height="12" rx="3"
        fill="white" fillOpacity="0.35" stroke={accent} strokeWidth="0.8" strokeOpacity="0.3" />

      {/* Left sidebar */}
      <rect x="20" y="36" width="52" height="80" rx="0"
        fill={accent} fillOpacity="0.06" />

      {/* Sidebar nav items */}
      {[48, 62, 76, 90, 104].map((y, i) => (
        <g key={y}>
          <rect x="28" y={y} width="8" height="8" rx="1.5"
            fill={i === 0 ? accent : accent} fillOpacity={i === 0 ? 0.5 : 0.2} />
          <rect x="40" y={y + 1.5} width={i === 0 ? 24 : 18} height="5" rx="1.5"
            fill={accent} fillOpacity={i === 0 ? 0.4 : 0.15} />
        </g>
      ))}

      {/* Main content area */}
      {/* Stat cards row */}
      {[78, 118, 158, 198].map((x, i) => (
        <rect key={x} x={x} y="42" width="32" height="22" rx="3"
          fill={fill2} stroke={accent} strokeWidth="0.9" strokeOpacity="0.3" />
      ))}

      {/* Listing card 1 */}
      <rect x="78" y="72" width="92" height="36" rx="3"
        fill={fill} stroke={accent} strokeWidth="1" strokeOpacity="0.25" />
      <rect x="82" y="76" width="36" height="28" rx="2" fill={fill2} />
      <rect x="123" y="78" width="40" height="5" rx="1.5" fill={accent} fillOpacity="0.3" />
      <rect x="123" y="87" width="28" height="4" rx="1.5" fill={accent} fillOpacity="0.18" />
      <rect x="123" y="95" width="34" height="4" rx="1.5" fill={accent} fillOpacity="0.14" />

      {/* Listing card 2 */}
      <rect x="178" y="72" width="72" height="36" rx="3"
        fill={fill} stroke={accent} strokeWidth="1" strokeOpacity="0.25" />
      <rect x="182" y="76" width="28" height="28" rx="2" fill={fill2} />
      <rect x="215" y="78" width="28" height="5" rx="1.5" fill={accent} fillOpacity="0.3" />
      <rect x="215" y="87" width="20" height="4" rx="1.5" fill={accent} fillOpacity="0.18" />

      {/* Active nav indicator */}
      <rect x="20" y="44" width="3" height="16" rx="1.5"
        fill={accent} fillOpacity="0.8" />

      {/* Sparkle / check */}
      <circle cx="246" cy="50" r="8"
        style={{ fill: `linear-gradient(135deg, ${accent}, ${accent2})` }}
        fill={accent} fillOpacity="0.15"
        stroke={accent} strokeWidth="1.2" strokeOpacity="0.5" />
      <path d="M242 50 l2.5 2.5 4.5-5"
        stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fillOpacity="0" fill="none" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   VendorAlreadyModal
   This is a ROUTING DECISION modal — not dismissible.
   No X button. No ESC. No backdrop click. User must choose an action.

   Props:
     open          boolean
     onDashboard   fn()  — "Go to Property Dashboard" → /vendor/listing
     onHome        fn()  — "Go to Home"               → /home
─────────────────────────────────────────────────────────────────────────────── */
export default function VendorAlreadyModal({ open, onDashboard, onHome }) {
  // Body scroll lock only — no close handlers
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — non-interactive; user cannot click to dismiss */}
          <motion.div
            key="vam-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9998 }}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="vam-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vam-title"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.97,  y: 8  }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "fixed bg-white dark:bg-gray-900",
              "shadow-[0_32px_80px_rgba(0,0,0,0.26)] overflow-hidden",
              /* Desktop — centred, auto height */
              "sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
              "sm:bottom-auto sm:right-auto",
              "sm:w-[min(520px,92vw)]",
              "sm:max-h-[92vh] sm:overflow-y-auto sm:overflow-x-hidden",
              "sm:rounded-2xl sm:pb-0",
              /* Mobile — bottom sheet */
              "bottom-0 left-0 right-0 rounded-t-2xl",
              "max-h-[88vh] overflow-y-auto overflow-x-hidden",
              "pb-[env(safe-area-inset-bottom)]",
            ].join(" ")}
            style={{ zIndex: 9999 }}
          >
            {/* No close button — user must choose an action */}

            {/* Illustration */}
            <div className="w-full px-8 pt-8 pb-4">
              <div className="w-full h-[130px]">
                <DashboardIllustration />
              </div>
            </div>

            {/* Body */}
            <div className="px-7 pb-6 sm:px-8 sm:pb-7">

              {/* Title */}
              <h2
                id="vam-title"
                className="text-[19px] sm:text-[21px] font-bold text-gray-900 dark:text-white leading-snug mb-2"
              >
                You already have a vendor account
              </h2>

              {/* Description */}
              <p className="text-[13.5px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                You're already managing properties on VenueBook. You can continue to your property
                dashboard to manage properties, create new listings, edit existing listings, manage
                availability, pricing, bookings and property settings.
              </p>

              {/* Helper note */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900 mb-6">
                <LayoutDashboard
                  className="w-4 h-4 text-violet-500 shrink-0 mt-0.5"
                />
                <p className="text-[12.5px] text-violet-700 dark:text-violet-300 leading-relaxed">
                  Your <strong>Property Dashboard</strong> is where you manage existing listings
                  and create new ones. It's the central place for all your vendor operations.
                </p>
              </div>

              {/* Sub-copy */}
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5">
                Choose where you'd like to continue.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={onDashboard}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl text-[13.5px] font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #a44bf3, #499ce8)" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Switch to Property
                </button>

                <button
                  type="button"
                  onClick={onHome}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl text-[13.5px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-[0.98]"
                >
                  <Home className="w-4 h-4" />
                  Go to Home
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
