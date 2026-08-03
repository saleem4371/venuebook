"use client";

/**
 * VendorSidebar — Left rail navigation (desktop only)
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the old horizontal `VendorNavTabs` bar on md+ screens. Mobile keeps
 * its existing bottom dock (`BottomNav.jsx`) untouched — this component is
 * `hidden md:flex` and never renders below the md breakpoint.
 *
 * Fixed width: 88px. Keep in sync with the `md:ms-[88px]` left margin
 * applied to the main content wrapper in `layout.jsx`.
 *
 * Data fetching (settings/paxPricing gate, live reservation + notification
 * counts) is ported verbatim from VendorNavTabs.jsx so behavior is identical —
 * only the presentation changed from a horizontal bar + overflow menu to a
 * vertical icon-over-label rail with no overflow (there's room for every tab).
 *
 * Uses `start-0` / logical properties throughout so it flips to the opposite
 * edge automatically under RTL locales.
 */

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams } from "next/navigation";
import Link, { useLinkStatus } from "next/link";
import {
  LayoutDashboard,
  Building,
  CalendarDays,
  ClipboardList,
  BarChart2,
  Package,
  Layers,
  Settings,
  Bell,
  MessageSquareText,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useVendorCategory } from "@/context/VendorCategoryContext";
import { CATEGORY_COLORS } from "@/config/categoryConfig";
import { Panel, IconBadge, CategoryIcon } from "./VendorCategoryNavigator";

import { useRealtime } from "@/context/RealtimeContext";
import { getnotification } from "@/services/global.service";
import { useSocket } from "@/context/SocketContext";
import { globalSetting } from "@/services/booking.service";

/* ── Per-tab loading indicator ──────────────────────────────────────
   useLinkStatus() only works when called from a component rendered
   INSIDE the <Link> it's reporting on — it reads the pending state of
   the nearest ancestor Link's navigation (App Router route transition,
   e.g. the next page's server component still fetching data). Pulled
   out as its own component for exactly that reason: it has to be a
   child of <Link>, not called directly in VendorSidebar's own body. */
function TabIcon({ Icon, active, badge, size = 19 }) {
  const { pending } = useLinkStatus();
  return (
    <span className="relative flex items-center justify-center">
      {pending && (
        <span
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin opacity-70"
        />
      )}
      <Icon
        size={size}
        strokeWidth={active ? 2.1 : 1.7}
        className={pending ? "animate-pulse" : ""}
      />
      {badge > 0 && (
        <span className="absolute -top-1.5 -end-2 flex items-center justify-center h-[15px] min-w-[15px] px-[3px] rounded-full bg-red-500 text-white text-[8px] font-bold leading-none ring-2 ring-white dark:ring-gray-950">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </span>
  );
}

function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

export default function VendorSidebar() {
  const { refreshKey } = useRealtime();

  const pathname = usePathname();
  const params = useParams();
  const base = `/${params?.locale}/${params?.country}/vendor`;

  const { activeCategory, setActiveCategory, vendorCategories, categoryConfig } =
    useVendorCategory();
  const tCategories = useTranslations("categories");

  /* Active category's brand color — venues is violet, farmstays is
     emerald, etc. Drives both the active tab accent below and the
     switcher's own icon badge. */
  const activeAccent = CATEGORY_COLORS[categoryConfig?.color ?? "violet"];

  const [settings, setSettings] = useState({});
  const [settingsMap, setSettingsMap] = useState({});
  const [allNotification, setAllNotification] = useState([]);
  const [reservationCount, setReservationCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showCategory, setShowCategory] = useState(false);

  const notifAreaRef = useRef(null);
  useClickOutside(notifAreaRef, useCallback(() => setShowNotif(false), []));

  const categoryAreaRef = useRef(null);
  useClickOutside(categoryAreaRef, useCallback(() => setShowCategory(false), []));

  const load = async () => {
    const _settings = await globalSetting();
    setSettings(_settings.data);
  };

  // Re-fetch settings on mount AND whenever a realtime event bumps
  // refreshKey, so the Packages tab (gated by paxPricing) stays in sync live.
  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [refreshKey]);

  useEffect(() => {
    if (!settings?.length) return;

    const map = settings.reduce((acc, item) => {
      let value = item.setting_value;
      if (value === "1") value = true;
      else if (value === "0") value = false;
      else if (!isNaN(value) && value !== "") value = Number(value);
      acc[item.setting_key] = value;
      return acc;
    }, {});

    setSettingsMap(map);
  }, [settings]);

  const { status } = useSocket();

  useEffect(() => {
    fetchNotify();
  }, [status, refreshKey]);

  const fetchNotify = async () => {
    try {
      const resp = await getnotification();
      setAllNotification(resp?.data || {});
      setReservationCount(resp?.data?.counts?.booking_count || 0);
    } catch (err) {
      console.error(err);
      setAllNotification(null);
    }
  };

  const unread = allNotification?.counts?.notification_count;

  /* ── Tab list ─────────────────────────────────────────── */
  const tabs = useMemo(() => {
    const TABS = [
      { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard, legacyPaths: [] },
      { label: "Listing", href: `${base}/listing`, icon: Building, legacyPaths: [] },
      { label: "Calendar", href: `${base}/calendar`, icon: CalendarDays, legacyPaths: [] },
      {
        label: "Reservations",
        href: `${base}/reservations`,
        icon: ClipboardList,
        badge: reservationCount,
        legacyPaths: [`${base}/leads`, `${base}/bookings`],
      },
      {
        label: "Messages",
        href: `${base}/messages`,
        icon: MessageSquareText,
        badge: 11,
        legacyPaths: [],
      },
      { label: "Addons", href: `${base}/addons`, icon: Layers, legacyPaths: [] },

      // Only include Packages if paxPricing exists
      ...(settingsMap?.paxPricing
        ? [{ label: "Packages", href: `${base}/package`, icon: Package, legacyPaths: [] }]
        : []),

      { label: "Settings", href: `${base}/settings`, icon: Settings, legacyPaths: [] },
      { label: "Reports", href: `${base}/reports`, icon: BarChart2, legacyPaths: [] },
    ];

    return activeCategory !== "venues"
      ? TABS.filter((t) => t.label !== "Packages")
      : TABS;
  }, [base, activeCategory, settingsMap, reservationCount]);

  return (
    <aside
      aria-label="Vendor navigation"
      className="
        hidden md:flex fixed start-0 top-[72px] bottom-0 z-30
        w-[88px] flex-col
        bg-white/95 dark:bg-gray-950/95
        backdrop-blur-xl
        border-e border-gray-200/60 dark:border-gray-800/50
      "
    >
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname.startsWith(tab.href) ||
            (tab.legacyPaths?.some((p) => pathname.startsWith(p)) ?? false);

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={[
                "relative flex flex-col items-center justify-center gap-1",
                "rounded-xl py-2.5 px-1 text-center transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
                active
                  ? activeAccent.text
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200",
              ].join(" ")}
            >
              {active && (
                <motion.span
                  layoutId="vendorSidebarActive"
                  className={`absolute inset-0 -z-10 rounded-xl ${activeAccent.light} ring-1 ${activeAccent.ring}`}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}

              <TabIcon Icon={Icon} active={active} badge={tab.badge} />

              <span className="text-[10.5px] font-medium leading-tight tracking-tight">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Category switcher — docked footer item, sits directly above
          Alerts. Only shown when the vendor actually has more than one
          enabled category (matches VendorCategoryNavigator's own gate).
          Reuses Panel/IconBadge/CategoryIcon from VendorCategoryNavigator
          so the picker grid looks identical to the mobile FAB version. ── */}
      {vendorCategories.length > 1 && (
        <div
          ref={categoryAreaRef}
          className="relative px-2 pt-2 pb-1 border-t border-gray-100 dark:border-gray-800/60"
        >
          <button
            type="button"
            onClick={() => setShowCategory((p) => !p)}
            aria-label={`${activeCategory ? tCategories(activeCategory) : ""} — change category`}
            aria-expanded={showCategory}
            aria-haspopup="dialog"
            className={[
              "relative w-full flex flex-col items-center justify-center gap-1",
              "rounded-xl py-2.5 transition-colors duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
              showCategory
                ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200",
            ].join(" ")}
          >
            <span className="relative flex items-center justify-center">
              <IconBadge color={activeAccent} size="lg">
                <CategoryIcon id={activeCategory} className="h-4 w-4 text-white" />
              </IconBadge>
            </span>
            <span className="text-[10.5px] font-medium leading-tight tracking-tight truncate max-w-full">
              {activeCategory ? tCategories(activeCategory) : ""}
            </span>
          </button>

          {/* Flyout — same grid picker as the mobile FAB, anchored to the
              rail's right edge (flips under RTL). */}
          <AnimatePresence>
            {showCategory && (
              <div className="absolute bottom-0 start-full ms-2 z-50">
                <Panel
                  cols={2}
                  vendorCategories={vendorCategories}
                  activeCategory={activeCategory}
                  onSelect={(id) => {
                    setActiveCategory(id);
                    setShowCategory(false);
                  }}
                  onClose={() => setShowCategory(false)}
                  t={tCategories}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Notification bell — footer item ─────────────────── */}
      <div
        ref={notifAreaRef}
        className="relative px-2 pt-2 pb-3 border-t border-gray-100 dark:border-gray-800/60"
      >
        <button
          type="button"
          onClick={() => setShowNotif((p) => !p)}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
          aria-expanded={showNotif}
          className={[
            "relative w-full flex flex-col items-center justify-center gap-1",
            "rounded-xl py-2.5 transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
            showNotif
              ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 hover:text-gray-800 dark:hover:text-gray-200",
          ].join(" ")}
        >
          <span className="relative flex items-center justify-center">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -end-2 flex items-center justify-center h-[15px] min-w-[15px] px-[3px] rounded-full bg-red-500 text-white text-[8px] font-bold leading-none ring-2 ring-white dark:ring-gray-950">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </span>
          <span className="text-[10.5px] font-medium leading-tight">Alerts</span>
        </button>

        {/* Flyout — anchored to the right edge of the rail (flips under RTL) */}
        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, x: -6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.97, x: -6 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 start-full ms-2 z-50 w-76 rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700/60 shadow-xl shadow-gray-300/30 dark:shadow-black/50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">
                    Notifications
                  </p>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[9px] font-bold">
                      {unread}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotif(false)}
                  className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                >
                  Mark all read
                </button>
              </div>

              <ul className="py-1 max-h-72 overflow-y-auto">
                {(allNotification?.notifications ?? []).map((n, i) => (
                  <li key={i}>
                    <Link
                      href={`${base}/notifications`}
                      onClick={() => setShowNotif(false)}
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] text-gray-800 dark:text-gray-200 leading-snug">
                          {n.message}
                        </span>
                        <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {n.created_at}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href={`${base}/notifications`}
                  onClick={() => setShowNotif(false)}
                  className="block text-[12px] text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors w-full text-center"
                >
                  View all notifications →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
