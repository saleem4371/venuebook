"use client";

/**
 * KycReminderCard
 * ─────────────────────────────────────────────────────────────────────────────
 * KYC reminder row, rendered in vendor/layout.jsx as a sibling BEFORE
 * PageMainWrapper — not a child of it — on every vendor route EXCEPT
 * Messages (vendor asked for it off that one route specifically; see the
 * isMessagesPage check around where this is rendered in layout.jsx).
 * Being a sibling rather than a child matters for two reasons:
 *
 *   1. "Outside the main page": PageMainWrapper is the `<motion.main>` that
 *      scales/blurs during category transitions (shrinkVariants). Living
 *      outside it means this reminder never flickers, shrinks, or blurs
 *      when the vendor switches categories — it just stays put.
 *   2. "Fixed at the top": it's `sticky`, not `static` — so once it scrolls
 *      to the top of the viewport it stays pinned there while the rest of
 *      the page scrolls underneath, on every screen, every category.
 *
 * Header/sidebar clearance (margin) is NOT this component's job — the
 * shared outer box in layout.jsx (AdminLayout) carries that margin ONCE,
 * unconditionally, for both this card and PageMainWrapper as plain
 * siblings. That's what makes "disappears once verified" free: this
 * component just returns null when there's nothing to show, and the
 * layout doesn't need to know or react to that. This component only owns
 * its own padding.
 *
 * CORRECTION vs. an earlier version of this file: I originally assumed
 * `kyc_status()` was fully account-wide with no category concept, because
 * the service function itself takes no arguments. That was wrong — every
 * request goes through lib/axios.js's interceptor, which stamps an
 * `x-category` header from `localStorage.activeCategory` onto EVERY call.
 * So the backend response for `/kyc/kyc_status` genuinely differs per
 * category — the previous single-fetch version was silently showing
 * whichever category happened to be active when the component mounted,
 * and would show different content if you switched category and the
 * component re-mounted/re-fetched. That's the exact bug that was reported.
 *
 * Real fix: fetch `kyc_status()` once PER vendor category (overriding the
 * `x-category` header per call — axios.js was updated to only fall back to
 * the globally active category when a call doesn't already set its own),
 * and render one card per category that still needs attention. That's
 * what "show cards at top no matter the category, so I know what's
 * pending in one shot without switching categories" actually requires —
 * it can't be done with a single account-wide fetch because the account
 * doesn't have a single KYC status; each category does.
 *
 * Status logic ported verbatim from KycStatusChip.jsx:
 *   pending                  → action required
 *   verification_in_progress → submitted, in review
 *   approved / verified      → hidden (nothing to show for that category)
 *   rejected                 → re-submission required
 *
 * Renders nothing at all (no DOM node) once all categories are verified.
 *
 * Clicking a card opens the same KYCModal the header chip used to open,
 * prefilled from each_kyc_status() for THAT category (fetched on click,
 * scoped with the same x-category override).
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShieldAlert, ShieldX, Clock, ChevronRight } from "lucide-react";

import { kyc_status, each_kyc_status } from "@/services/kyc.service";
import { useVendorCategory } from "@/context/VendorCategoryContext";
import { CATEGORIES, CATEGORY_COLORS } from "@/config/categoryConfig";
import { CategoryIcon } from "./VendorCategoryNavigator";
import KYCModal from "./KYCModal";

/* ── Per-status card copy + colors (severity, not category) ──────────── */
const STATUS = {
  pending: {
    Icon: ShieldAlert,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    title: "Verify your KYC details",
    subtitle: "Required to keep accepting bookings",
  },
  verification_in_progress: {
    Icon: Clock,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "KYC under review",
    subtitle: "We'll notify you once it's verified",
  },
  verified: null, /* hidden when approved, same as the old chip */
  rejected: {
    Icon: ShieldX,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    title: "KYC verification failed",
    subtitle: "Resubmit your documents to continue",
  },
};

export default function KycReminderCard() {
  const { vendorCategories } = useVendorCategory();
  const t = useTranslations("categories");

  const [reminders, setReminders] = useState([]); // [{ id, cfg, state }]
  const [loaded, setLoaded] = useState(false);

  const [kycData, setKycData] = useState(null);
  const [modalStatus, setModalStatus] = useState(null);
  const [open, setOpen] = useState(false);

  /* One status fetch per vendor category, each scoped with its own
     x-category header override — not the globally active one. Runs once
     the category list is known; doesn't re-run when the vendor switches
     the active tab (vendorCategories itself doesn't change on switch). */
  useEffect(() => {
    if (!vendorCategories?.length) return;
    let cancelled = false;

    (async () => {
      const results = await Promise.allSettled(
        vendorCategories.map((id) => kyc_status({ headers: { "x-category": id } }))
      );
      if (cancelled) return;

      const next = [];
      results.forEach((res, i) => {
        const id = vendorCategories[i];
        if (res.status !== "fulfilled") return;
        const state = res.value?.data ?? null;
        const statusKey = state?.kyc_status === "approved" ? "verified" : state?.kyc_status;
        const cfg = state ? STATUS[statusKey] : null;
        if (cfg) next.push({ id, cfg, state });
      });

      setReminders(next);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [vendorCategories]);

  const handleOpen = useCallback(async (categoryId, state) => {
    setModalStatus(state);
    setOpen(true);
    try {
      const res = await each_kyc_status({ headers: { "x-category": categoryId } });
      setKycData(res?.data ?? null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  if (!loaded || reminders.length === 0) return null;

  return (
    <>
      <div
        className="
          sticky top-[64px] md:top-[72px] z-40 shrink-0
          px-3 sm:px-4 md:px-5 lg:px-6
          pt-2 pb-2
          bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl
          border-b border-gray-100 dark:border-gray-800/60
        "
      >
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.gray.200)_transparent] dark:[scrollbar-color:theme(colors.gray.800)_transparent]">
          {reminders.map(({ id, cfg, state }) => {
            const { Icon, iconBg, iconColor, title, subtitle } = cfg;
            const accent = CATEGORY_COLORS[CATEGORIES[id]?.color ?? "violet"];

            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => handleOpen(id, state)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="
                  group shrink-0 w-[240px] sm:w-[260px]
                  flex items-center gap-2.5
                  p-2.5 rounded-xl text-start
                  bg-white dark:bg-gray-900
                  border border-gray-100 dark:border-white/[0.07]
                  cursor-pointer
                "
              >
                <span className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={15} className={iconColor} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 leading-none">
                    <CategoryIcon id={id} className={`h-2.5 w-2.5 ${accent.text}`} />
                    {t(id)}
                  </span>
                  <span className="block text-[12.5px] font-bold text-gray-900 dark:text-gray-50 leading-snug mt-0.5 truncate">
                    {title}
                  </span>
                  <span className="block text-[10.5px] text-gray-500 dark:text-gray-400 leading-snug truncate">
                    {subtitle}
                  </span>
                </span>

                <ChevronRight
                  size={13}
                  className="shrink-0 text-gray-300 dark:text-gray-600 rtl:rotate-180 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors"
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      <KYCModal open={open} setOpen={setOpen} kycData={kycData} kycStatus={modalStatus} />
    </>
  );
}
