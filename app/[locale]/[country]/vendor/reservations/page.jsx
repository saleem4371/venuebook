"use client";

/* ══════════════════════════════════════════════════════════════════
   RESERVATIONS — UNIFIED WORKSPACE ORCHESTRATOR
   ─────────────────────────────────────────────
   Top-level tabs are ROUTER-BASED via ?tab= search param.
   • Refreshing the page preserves the active tab
   • Direct URLs like /reservations?tab=quotation work
   • Browser back / forward navigate tabs correctly
   • Content switches via AnimatePresence (no full-page nav)

   Tab map:
     all          → AllReservationsWorkspace  (full list + stats + filters)
     create       → CreateBookingWorkspace    (5-section form + summary)
     create-lead  → CreateLeadWorkspace       (quick lead capture form)
     draft        → FilteredListWorkspace     (DRAFT bookings)
     quotation    → FilteredListWorkspace     (QUOTATION bookings)
     historical   → FilteredListWorkspace     (HISTORICAL bookings)
══════════════════════════════════════════════════════════════════ */

import { useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Inbox, CalendarCheck, UserPlus, Save, FileText, History } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

import AllReservationsWorkspace from "./workspaces/AllReservationsWorkspace";
import CreateBookingWorkspace   from "./workspaces/CreateBookingWorkspace";
import CreateLeadWorkspace      from "./workspaces/CreateLeadWorkspace";
import FilteredListWorkspace    from "./workspaces/FilteredListWorkspace";
import ScrollableTabBar, { tabActiveCls, tabIconCls } from "../components/ScrollableTabBar";


/* ══════════════════════════════════════════════════════════════
   WORKSPACE CONFIG
══════════════════════════════════════════════════════════════ */
const WORKSPACES = [
  { key: "all",          labelKey: "title",                       icon: Inbox         },
  { key: "create",       labelKey: "quickActions.createBooking",  icon: CalendarCheck },
  { key: "create-lead",  labelKey: "quickActions.createLead",     icon: UserPlus      },
  { key: "draft",        labelKey: "quickActions.saveDraft",      icon: Save          },
  { key: "quotation",    labelKey: "quickActions.quotation",      icon: FileText      },
  { key: "historical",   labelKey: "quickActions.historical",     icon: History       },
];

const VALID_TABS = new Set(WORKSPACES.map((w) => w.key));

const FILTERED_META = {
  draft:      { workflowState: "DRAFT",      emptyTabKey: "draft"      },
  quotation:  { workflowState: "QUOTATION",  emptyTabKey: "quotation"  },
  historical: { workflowState: "HISTORICAL", emptyTabKey: "historical" },
};

/* ══════════════════════════════════════════════════════════════
   WORKSPACE CONTENT SWITCHER
══════════════════════════════════════════════════════════════ */
function WorkspaceContent({ active }) {
  if (active === "all")         return <AllReservationsWorkspace />;
  if (active === "create")      return <CreateBookingWorkspace />;
  if (active === "create-lead") return <CreateLeadWorkspace />;
  const meta = FILTERED_META[active];
  if (meta) return <FilteredListWorkspace workflowState={meta.workflowState} emptyTabKey={meta.emptyTabKey} />;
  return null;
}

/* ══════════════════════════════════════════════════════════════
   INNER PAGE — uses hooks that require Suspense boundary
══════════════════════════════════════════════════════════════ */
function ReservationsInner() {
  const t            = useTranslations("vendor.reservations");
  const searchParams = useSearchParams();
  const pathname     = usePathname();

  /* Read active tab from URL; validate and default to "all" */
  const rawTab         = searchParams.get("tab") ?? "all";
  const activeWorkspace = VALID_TABS.has(rawTab) ? rawTab : "all";

  /* Build href for each tab — preserves other search params */
  const tabHref = useCallback(
    (key) => {
      const params = new URLSearchParams(searchParams);
      params.set("tab", key);
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams],
  );

  return (
    <div className="space-y-5">
      <Toaster position="top-right" />

      {/* ── Page header ──────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{t("subtitle")}</p>
      </div>

      {/* ── Router-based Workspace Tab Bar ───────────────── */}
      <ScrollableTabBar
        tabs={WORKSPACES}
        active={activeWorkspace}
        renderTab={(tab, isActive) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tabHref(tab.key)}
              className={tabActiveCls(isActive)}
              replace          /* avoid stacking tab history entries */
            >
              <Icon
                size={13}
                className={tabIconCls(isActive)}
                aria-hidden="true"
              />
              <span>{t(tab.labelKey)}</span>
            </Link>
          );
        }}
      />

      {/* ── Animated workspace content ────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWorkspace}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <WorkspaceContent active={activeWorkspace} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE — Suspense boundary required for useSearchParams
══════════════════════════════════════════════════════════════ */
export default function ReservationsPage() {
  return (
    <Suspense fallback={null}>
      <ReservationsInner />
    </Suspense>
  );
}
