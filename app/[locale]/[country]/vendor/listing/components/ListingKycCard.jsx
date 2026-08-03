"use client";

/**
 * ListingKycCard
 * ─────────────────────────────────────────────────────────────────────────────
 * KYC reminder, shown as a card in a horizontal scroll row at the top of the
 * Listing page — replaces the old fixed-header KycStatusChip (removed from
 * Navbar.jsx). Card-per-account, not tied to the currently active category,
 * so it reads the same regardless of which category tab the vendor is on.
 *
 * Status logic is ported verbatim from KycStatusChip.jsx:
 *   pending                  → action required
 *   verification_in_progress → submitted, in review
 *   approved / verified      → hidden (nothing to show)
 *   rejected                 → re-submission required
 *
 * Clicking the card opens the same KYCModal the header chip used to open,
 * prefilled from each_kyc_status(activeCategory) — same data source as
 * before, just fetched here instead of in Navbar.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldX, Clock, ChevronRight } from "lucide-react";

import { kyc_status, each_kyc_status } from "@/services/kyc.service";
import { useVendorCategory } from "@/context/VendorCategoryContext";
import KYCModal from "../../components/KYCModal";

/* ── Per-status card copy + colors ──────────────────────────────────── */
const STATUS = {
  pending: {
    Icon: ShieldAlert,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Your account",
    title: "Verify your KYC details",
    subtitle: "Required to keep accepting bookings",
  },
  verification_in_progress: {
    Icon: Clock,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    label: "Your account",
    title: "KYC under review",
    subtitle: "We'll notify you once it's verified",
  },
  verified: null, /* hidden when approved, same as the old chip */
  rejected: {
    Icon: ShieldX,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    label: "Your account",
    title: "KYC verification failed",
    subtitle: "Resubmit your documents to continue",
  },
};

export default function ListingKycCard() {
  const { activeCategory } = useVendorCategory();

  const [kycState, setKycState] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [open, setOpen] = useState(false);

  /* Status — same call KycStatusChip used to make. */
  useEffect(() => {
    if (!activeCategory) return;
    (async () => {
      try {
        const res = await kyc_status();
        setKycState(res?.data ?? null);
      } catch (err) {
        console.error("KYC status fetch error:", err);
      }
    })();
  }, [activeCategory]);

  /* Modal prefill data — same call Navbar used to make. */
  useEffect(() => {
    (async () => {
      try {
        const res = await each_kyc_status(activeCategory);
        setKycData(res?.data ?? null);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [activeCategory]);

  if (!kycState) return null;

  const statusKey = kycState?.kyc_status === "approved" ? "verified" : kycState?.kyc_status;
  const cfg = STATUS[statusKey];
  if (!cfg) return null;

  const { Icon, iconBg, iconColor, label, title, subtitle } = cfg;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.200)_transparent] dark:[scrollbar-color:theme(colors.gray.800)_transparent]">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="
            group shrink-0 w-[300px] sm:w-[340px]
            flex items-center gap-3 sm:gap-4
            p-4 sm:p-[18px] rounded-2xl text-start
            bg-white dark:bg-gray-900
            border border-gray-100 dark:border-white/[0.07]
            shadow-[0_1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)]
            hover:shadow-md hover:border-gray-200 dark:hover:border-white/[0.12]
            transition-all duration-150 cursor-pointer
          "
        >
          <span className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
            <Icon size={19} className={iconColor} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-gray-400 dark:text-gray-500 leading-none">
              {label}
            </span>
            <span className="block text-[14px] font-bold text-gray-900 dark:text-gray-50 leading-snug mt-1">
              {title}
            </span>
            <span className="block text-[12px] text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
              {subtitle}
            </span>
          </span>

          <ChevronRight
            size={16}
            className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors"
          />
        </motion.button>
      </div>

      <KYCModal open={open} setOpen={setOpen} kycData={kycData} kycStatus={kycState} />
    </>
  );
}
