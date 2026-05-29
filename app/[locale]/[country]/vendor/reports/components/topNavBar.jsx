"use client";
/**
 * PLACEMENT: vendor/reports/components/topNavBar.jsx
 *
 * Unified design system — matches Add-ons / Teams / Reservations / Settings.
 *
 * Structure:
 *   [Non-sticky] Proper operational page header (icon + title + subtitle + actions)
 *   [Sticky]     Clean bottom-border tab row (standard violet active indicator)
 */

import Link                              from "next/link";
import { useParams, usePathname }        from "next/navigation";
import { useState }                      from "react";
import { Download, RefreshCw } from "lucide-react";
import { motion }                        from "framer-motion";

import { useVendorCategory }  from "@/context/VendorCategoryContext";
import { getReportConfig }    from "./reportsConfig";
import ScrollableTabBar, { tabActiveCls } from "../../components/ScrollableTabBar";

const BRAND = "linear-gradient(242deg,#a44bf3,#499ce8)";

/* ─── Tabs definition ─────────────────────────────────────────────────────── */
const TABS = [
  { key: "revenue", label: "Revenue Report", href: "revenue_report" },
  { key: "aging",   label: "Aging Report",   href: "aging_report"   },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function ReportsTopNav() {
  const params   = useParams();
  const pathname = usePathname();

  const { activeCategory } = useVendorCategory();
  const cat = getReportConfig(activeCategory);

  const [refreshing, setRefreshing] = useState(false);

  const basePath = `/${params?.locale}/${params?.country}/vendor/reports`;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <>
      {/* ══ NON-STICKY: Operational page header ══════════════════════════════ */}
      <div className="pt-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          {/* Title block */}
          <div>
            <motion.h1
              key={activeCategory}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50"
            >
              Reports
            </motion.h1>
            <motion.p
              key={`sub-${activeCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28, delay: 0.06 }}
              className="text-sm text-gray-400 dark:text-gray-500 mt-0.5"
            >
              {cat.subtitle}
            </motion.p>
          </div>

          {/* Actions — right-aligned, match app button style */}
          <div className="flex items-center gap-2 self-start shrink-0">

            {/* Date range selector */}
            <select className="h-9 px-3 text-[12px] font-medium rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer transition-colors">
              <option>All Time</option>
              <option>This Month</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              title="Refresh data"
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.16] transition-all duration-150"
            >
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            {/* Export — matches the brand gradient CTA style */}
            <button
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-px active:translate-y-0 transition-all duration-150"
              style={{ background: BRAND }}
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══ STICKY: Tab bar only ══════════════════════════════════════════════ */}
      {/*
        Offset accounts for: main nav (~64px) + vendor nav tabs (~44px) = ~108px.
        Only the slim tab bar is pinned — the header above naturally scrolls away.
      */}
      <div className="md:sticky z-30 top-[108px] md:top-[116px] bg-white dark:bg-[#030712] mt-4">
        <ScrollableTabBar
          tabs={TABS}
          active={TABS.find((t) => pathname.includes(t.href))?.key ?? ""}
          renderTab={(tab) => {
            const isActive = pathname.includes(tab.href);
            return (
              <Link
                key={tab.key}
                href={`${basePath}/${tab.href}`}
                className={tabActiveCls(isActive)}
              >
                {tab.label}
              </Link>
            );
          }}
        />
      </div>
    </>
  );
}
