"use client";

/**
 * KycStatusChip
 * ─────────────────────────────────────────────────────────────────────────────
 * Independent KYC status badge in the vendor header.
 * Clicking directly opens the KYC modal — no intermediate dropdown.
 *
 * States:
 *   pending                  → Amber  + pulse  (action required)
 *   verification_in_progress → Blue            (submitted, in review)
 *   approved / verified      → hidden           (nothing to show)
 *   rejected                 → Red   + pulse   (re-submission required)
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldX, Clock } from "lucide-react";

import { kyc_status } from "@/services/kyc.service";
import { useAuth }    from "@/context/AuthContext";

import { useVendorCategory } from "@/context/VendorCategoryContext";
/* ── Per-status design tokens ───────────────────────────────────────── */
const STATUS = {
  pending: {
    Icon:  ShieldAlert,
    chip:  "bg-amber-50 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 focus-visible:ring-amber-500",
    dot:   "bg-amber-500",
    pulse: true,
    label: "KYC Pending",
    short: "KYC",
  },
  verification_in_progress: {
    Icon:  Clock,
    chip:  "bg-blue-50 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-700/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 focus-visible:ring-blue-500",
    dot:   "bg-blue-500",
    pulse: false,
    label: "Under Review",
    short: "Review",
  },
  verified: null, /* hidden when approved */
  rejected: {
    Icon:  ShieldX,
    chip:  "bg-red-50 dark:bg-red-950/30 border-red-200/80 dark:border-red-700/40 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 focus-visible:ring-red-500",
    dot:   "bg-red-500",
    pulse: true,
    label: "Action Required",
    short: "Action",
  },
};

export default function KycStatusChip({ onClick ,kycState , setKycState}) {
  const { user }              = useAuth();
 

   const { activeCategory } = useVendorCategory();

  /* Border glow keyframe — injected once per mount */
  const glowStyle = "@keyframes vb-kyc-glow { 0%,100%{box-shadow:0 0 0 0px rgba(245,158,11,0.45)} 50%{box-shadow:0 0 0 3.5px rgba(245,158,11,0)} }";

  /* Fetch KYC status */
  useEffect(() => {
    if (!activeCategory) return;
    const doFetch = async () => {
      try {
        const res = await kyc_status();
        setKycState(res?.data ?? null);
      } catch (err) {
        console.error("KYC status fetch error:", err);
      }
    };
    doFetch();
  }, [activeCategory]);

  if (!kycState) return null;

  const statusKey = kycState?.kyc_status === "approved" ? "verified" : kycState?.kyc_status;
  const cfg       = STATUS[statusKey];
  if (!cfg) return null;

  const { Icon, chip, dot, pulse, label, short } = cfg;

  return (
    <>
      {/* Inject glow keyframe once (noop on server, safe on client) */}
      {pulse && <style>{glowStyle}</style>}

      <motion.button
        type="button"
        onClick={() => onClick?.()}
        aria-label={`${label} — click to open KYC verification`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        style={pulse ? { animation: "vb-kyc-glow 2.8s ease-in-out infinite" } : undefined}
        className={[
          "relative inline-flex items-center gap-1.5 cursor-pointer",
          "rounded-full border",
          /* Compact on xs (<640px), medium on sm–lg (tablet), full on lg+ (desktop) */
          "px-2 py-1.5 sm:px-2.5 sm:py-[6px] lg:px-3.5 lg:py-[7px]",
          "text-sm font-semibold",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
          chip,
        ].join(" ")}
      >
        <Icon size={15} className="shrink-0" aria-hidden="true" />

        {/* Responsive label: nothing below sm, short on sm–lg (tablet+mobile), full on lg+ (desktop) */}
        <span className="hidden sm:inline lg:hidden">{short}</span>
        <span className="hidden lg:inline">{label}</span>
      </motion.button>
    </>
  );
}
