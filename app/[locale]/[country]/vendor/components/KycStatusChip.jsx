"use client";

/**
 * KycStatusChip
 * ─────────────
 * Compact navbar-integrated KYC alert chip.
 * Lives in the top-right header cluster beside "Switch to Customer".
 *
 * States:
 *   pending  → amber  + pulse dot  (action required)
 *   review   → blue               (submitted, waiting)
 *   verified → hidden             (nothing to show)
 *   rejected → red   + pulse dot  (re-submission required)
 *
 * Responsive:
 *   ≥ md  → icon + full label  ("KYC Pending")
 *   sm    → icon + short label ("KYC")
 *   xs    → icon + dot only
 */

import { useState, useEffect} from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, ShieldX, Clock } from "lucide-react";

import { kyc_status } from '@/services/kyc.service'

import { useAuth } from "@/context/AuthContext";

/* ── Per-status design tokens ───────────────────────────────────────── */
const STATUS = {
  pending: {
    label:  "KYC pending",
    short:  "KYC",
    Icon:   ShieldAlert,
    chip:   [
      "bg-amber-50 dark:bg-amber-950/30",
      "border-amber-200/80 dark:border-amber-700/40",
      "text-amber-700 dark:text-amber-400",
      "hover:bg-amber-100 dark:hover:bg-amber-950/50",
      "focus-visible:ring-amber-500",
    ].join(" "),
    dot:   "bg-amber-500",
    pulse: true,
  },
  verification_in_progress: {
    label:  "Under Review",
    short:  "Review",
    Icon:   Clock,
    chip:   [
      "bg-blue-50 dark:bg-blue-950/30",
      "border-blue-200/80 dark:border-blue-700/40",
      "text-blue-700 dark:text-blue-400",
      "hover:bg-blue-100 dark:hover:bg-blue-950/50",
      "focus-visible:ring-blue-500",
    ].join(" "),
    dot:   "bg-blue-500",
    pulse: false,
  },
  verified: null, /* chip hidden when verified */
  rejected: {
    label:  "KYC Rejected",
    short:  "Rejected",
    Icon:   ShieldX,
    chip:   [
      "bg-red-50 dark:bg-red-950/30",
      "border-red-200/80 dark:border-red-700/40",
      "text-red-700 dark:text-red-400",
      "hover:bg-red-100 dark:hover:bg-red-950/50",
      "focus-visible:ring-red-500",
    ].join(" "),
    dot:   "bg-red-500",
    pulse: true,
  },
};


export default function KycStatusChip({ status = "pending", onClick }) {

  const { user } = useAuth();

console.log("user =>", user);
  //kyc_status
 const [kycState, setKycState] = useState(null);

useEffect(() => {
  const kyc_check = async () => {
    if (!user) return;

    try {
      const res = await kyc_status();
      setKycState(res?.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  kyc_check();
}, [user]);

if (!kycState) return null;

const statusKey =
  kycState?.kyc_status === "approved"
    ? "verified"
    : kycState?.kyc_status;

const cfg = STATUS[statusKey];

if (!cfg) return null;


  const { label, short, Icon, chip, dot, pulse } = cfg;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${label} — click to complete KYC verification`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={[
        "relative inline-flex items-center gap-1.5 cursor-pointer",
        "rounded-full border",
        /* same height as Switch to Customer button */
        "px-4 py-2",
        "text-sm font-semibold",
        "transition-colors duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
        chip,
      ].join(" ")}
    >
      {/* Status dot — pulses for action-required states */}
      <span className="relative inline-flex h-[7px] w-[7px] shrink-0" aria-hidden="true">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${dot}`}
          />
        )}
        <span className={`relative inline-flex h-[7px] w-[7px] rounded-full ${dot}`} />
      </span>

      {/* Shield/status icon */}
      <Icon size={16} className="shrink-0" aria-hidden="true" />

      {/* Label — progressive disclosure by breakpoint */}
      <span className="hidden sm:inline md:hidden">{short}</span>
      <span className="hidden md:inline">{label}</span>
    </motion.button>
  );
}
