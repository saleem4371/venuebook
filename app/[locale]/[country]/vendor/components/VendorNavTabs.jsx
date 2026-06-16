"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, CalendarDays, ClipboardList,
  BarChart2, Package, Layers, Settings,
  MoreHorizontal, X, Bell, MessageSquareText,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useVendorCategory } from "@/context/VendorCategoryContext";

import {
  globalSetting,
} from "@/services/booking.service";

/* ─────────────────────────────────────────────────────────────
   ANIMATION PRESETS
───────────────────────────────────────────────────────────── */
const DROPDOWN_ANIM = {
  initial:    { opacity: 0, scale: 0.97, y: -6 },
  animate:    { opacity: 1, scale: 1,    y:  0 },
  exit:       { opacity: 0, scale: 0.97, y: -6 },
  transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
};

const DRAWER_ANIM = {
  initial:    { y: "100%" },
  animate:    { y: 0 },
  exit:       { y: "100%" },
  transition: { type: "spring", stiffness: 380, damping: 38, mass: 0.8 },
};

/* ─────────────────────────────────────────────────────────────
   STYLE CONSTANTS
───────────────────────────────────────────────────────────── */
const TAB_BASE =
  "relative flex items-center gap-1.5 px-3 text-[13px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 h-[46px]";

const TAB_ACTIVE =
  "text-gray-900 dark:text-gray-50 font-semibold";

const TAB_INACTIVE =
  "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200";

const DROPDOWN_PANEL =
  "rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700/60 shadow-xl shadow-gray-300/30 dark:shadow-black/50";

/* ─────────────────────────────────────────────────────────────
   HOOK: close on outside click
───────────────────────────────────────────────────────────── */
function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function VendorNavTabs() {
  const pathname = usePathname();
  const params   = useParams();
  const base     = `/${params?.locale}/${params?.country}/vendor`;

  const { activeCategory } = useVendorCategory();

  // Setting consdtion 

    const [settings, setSettings] = useState({});
 const [settingsMap, setSettingsMap] = useState({});

   const load = async () => {
      const _settings = await globalSetting();
      setSettings(_settings.data);
    };
  
    useEffect(() => {
      (async () => {
        await load();
      })();
    }, []);

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

  /* ── Tab list ─────────────────────────────────────────── */
  // const allTabs = useMemo(() => {
  //   const TABS = [
  //     { label: "Dashboard",    href: `${base}/dashboard`,    icon: LayoutDashboard, legacyPaths: [] },
  //     { label: "Listing",      href: `${base}/listing`,      icon: Building2,       legacyPaths: [] },
  //     { label: "Calendar",     href: `${base}/calendar`,     icon: CalendarDays,   legacyPaths: [] },
  //     {
  //       label: "Reservations",
  //       href:  `${base}/reservations`,
  //       icon:  ClipboardList,
  //       badge: 14, // combined: 12 leads + 2 bookings
  //       legacyPaths: [`${base}/leads`, `${base}/bookings`],
  //     },
  //     { label: "Messages",  href: `${base}/messages`,  icon: MessageSquareText, badge: 11, legacyPaths: [] },
  //     { label: "Addons",    href: `${base}/addons`,    icon: Layers,    legacyPaths: [] },
  //     { label: "Packages",  href: `${base}/package`,   icon: Package,       legacyPaths: [] },
  //     { label: "Settings",  href: `${base}/settings`,  icon: Settings,      legacyPaths: [] },
  //     { label: "Reports",   href: `${base}/reports`,   icon: BarChart2,     legacyPaths: [] },
  //   ];
  //   return activeCategory !== "venues"
  //     ? TABS.filter((t) => t.label !== "Packages")
  //     : TABS;
  // }, [base, activeCategory]);
  const allTabs = useMemo(() => {
  const TABS = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard, legacyPaths: [] },
    { label: "Listing", href: `${base}/listing`, icon: Building2, legacyPaths: [] },
    { label: "Calendar", href: `${base}/calendar`, icon: CalendarDays, legacyPaths: [] },
    {
      label: "Reservations",
      href: `${base}/reservations`,
      icon: ClipboardList,
      badge: 14,
      legacyPaths: [`${base}/leads`, `${base}/bookings`],
    },
    { label: "Messages", href: `${base}/messages`, icon: MessageSquareText, badge: 11, legacyPaths: [] },
    { label: "Addons", href: `${base}/addons`, icon: Layers, legacyPaths: [] },

    // Only include Packages if paxPricing exists
    ...(settingsMap?.paxPricing
      ? [
          {
            label: "Packages",
            href: `${base}/package`,
            icon: Package,
            legacyPaths: [],
          },
        ]
      : []),

    { label: "Settings", href: `${base}/settings`, icon: Settings, legacyPaths: [] },
    { label: "Reports", href: `${base}/reports`, icon: BarChart2, legacyPaths: [] },
  ];

  return activeCategory !== "venues"
    ? TABS.filter((t) => t.label !== "Packages")
    : TABS;
}, [base, activeCategory, settingsMap]);

  /* ── Overflow state ───────────────────────────────────── */
  const [overflowIndex, setOverflowIndex] = useState(allTabs.length);
  const [morePos, setMorePos]             = useState({ top: 0, left: 0 });
  const [showMore,  setShowMore]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);


 
  const containerRef = useRef(null);
  const measureRefs  = useRef([]);
  const moreBtnRef   = useRef(null);
  const notifAreaRef = useRef(null);

  const closeNotif = useCallback(() => setShowNotif(false), []);
  useClickOutside(notifAreaRef, closeNotif);

  /* ── Overflow calculation ─────────────────────────────── */
  const MORE_BTN_W = 80;

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const available = container.offsetWidth - 96; // reserve for notif area
    let usedW = 0;
    let fitCount = allTabs.length;

    for (let i = 0; i < measureRefs.current.length; i++) {
      const el = measureRefs.current[i];
      if (!el) continue;
      const tabW = el.getBoundingClientRect().width + 4;
      const moreNeeded = i < allTabs.length - 1;
      const needed = usedW + tabW + (moreNeeded ? MORE_BTN_W : 0);

      if (needed <= available) {
        usedW += tabW;
      } else {
        fitCount = i;
        break;
      }
    }

    setOverflowIndex(fitCount);
  }, [allTabs.length]);

  useEffect(() => {
    const id = requestAnimationFrame(recalculate);
    const obs = new ResizeObserver(recalculate);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { cancelAnimationFrame(id); obs.disconnect(); };
  }, [recalculate]);

  const visibleTabs  = allTabs.slice(0, overflowIndex);
  const overflowTabs = allTabs.slice(overflowIndex);
  const hasMore      = overflowTabs.length > 0;

  const openMore = useCallback(() => {
    if (moreBtnRef.current) {
      const r = moreBtnRef.current.getBoundingClientRect();
      setMorePos({ top: r.bottom + 6, left: r.left });
    }
    setShowMore(true);
  }, []);

  /* ── Notifications ────────────────────────────────────── */
  const notifications = [
    { text: "New lead received",  time: "2 min ago"  },
    { text: "Booking confirmed",  time: "15 min ago" },
    { text: "Payment received",   time: "1 hr ago"   },
  ];
  const unread = notifications.length;


  


  return (
    <>
      {/* ════════════════════════════════════════════════════
          DESKTOP NAV  (hidden on mobile)
      ════════════════════════════════════════════════════ */}
      <div className="hidden md:block fixed inset-x-0 top-[72px] z-30">

        {/* Bar */}
        <div
          className="
            bg-white/92 dark:bg-gray-950/90
            backdrop-blur-xl
            border-b border-gray-200/60 dark:border-gray-800/50
            shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_2px_12px_0_rgba(0,0,0,0.04)]
            dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_2px_12px_0_rgba(0,0,0,0.25)]
          "
        >
          <div className="xl:max-w-7xl xl:mx-auto px-6 me-[150px]">
            <div ref={containerRef} className="flex items-center justify-center h-[46px] relative">

              {/* Hidden measurement row */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: 0, left: 0,
                  visibility: "hidden", pointerEvents: "none",
                  display: "flex", alignItems: "center", gap: "4px",
                  height: "46px",
                }}
              >
                {allTabs.map((tab, i) => (
                  <div
                    key={tab.label}
                    ref={(el) => (measureRefs.current[i] = el)}
                    style={{ flexShrink: 0 }}
                  >
                    <div className={`${TAB_BASE} ${TAB_INACTIVE}`}>
                      <tab.icon size={14} />
                      <span>{tab.label}</span>
                      {tab.badge > 0 && (
                        <span style={{ display: "inline-flex", width: "18px", height: "16px" }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visible tabs */}
              <div className="flex items-center  gap-0.5 overflow-hidden">
                {visibleTabs.map((tab) => {
                  const Icon   = tab.icon;
                  const active = pathname.startsWith(tab.href) ||
                    (tab.legacyPaths?.some((p) => pathname.startsWith(p)) ?? false);
                  return (
                    <Link key={tab.label} href={tab.href} className="shrink-0">
                      <div className={`${TAB_BASE} ${active ? TAB_ACTIVE : TAB_INACTIVE}`}>

                        {/* Sliding underline */}
                        {active && (
                          <motion.span
                            layoutId="desktopActiveUnderline"
                            className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-600 dark:bg-violet-400"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}

                        <Icon
                          size={14}
                          className={`shrink-0 ${active ? "text-violet-600 dark:text-violet-400" : ""}`}
                        />
                        <span className="tracking-[-0.01em]">{tab.label}</span>

                        {/* Badge */}
                        {tab.badge > 0 && (
                          <span className="inline-flex items-center justify-center h-[17px] min-w-[17px] px-1 rounded-full text-[9px] font-semibold leading-none bg-red-500 text-white">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* More button */}
                {hasMore && (
                  <button
                    ref={moreBtnRef}
                    type="button"
                    onClick={() => (showMore ? setShowMore(false) : openMore())}
                    className={`
                      ${TAB_BASE} shrink-0
                      ${showMore
                        ? "text-gray-800 dark:text-gray-200"
                        : TAB_INACTIVE
                      }
                    `}
                  >
                    <MoreHorizontal size={14} />
                    <span>More</span>
                  </button>
                )}
              </div>

              {/* ── Notification bell ─────────────────────── */}
              <div ref={notifAreaRef} className="shrink-0 ml-2 relative">
                <motion.button
                  type="button"
                  onClick={() => setShowNotif((p) => !p)}
                  className={`
                    relative flex items-center justify-center
                    w-9 h-9 rounded-lg transition-all duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60
                    ${showNotif
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
                    }
                  `}
                  whileTap={{ scale: 0.93 }}
                  aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                >
                  <Bell size={16} />
                  {unread > 0 && (
                    <span
                      className="
                        absolute -top-0.5 -right-0.5
                        flex items-center justify-center
                        h-4 min-w-[16px] px-[3px]
                        rounded-full
                        bg-red-500 text-white text-[9px] font-bold leading-none
                        shadow-sm ring-2 ring-white dark:ring-gray-950
                      "
                    >
                      {unread}
                    </span>
                  )}
                </motion.button>

                {/* Notification dropdown */}
                <AnimatePresence>
                  {showNotif && (
                    <motion.div
                      {...DROPDOWN_ANIM}
                      className={`absolute end-0 mt-2 z-50 w-76 ${DROPDOWN_PANEL}`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                          <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[9px] font-bold">
                            {unread}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={closeNotif}
                          className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                        >
                          Mark all read
                        </button>
                      </div>

                      {/* Items */}
                      <ul className="py-1">
                        {notifications.map((n, i) => (
                          <li key={i}>
                            <Link
                              href={`${base}/notifications`}
                              onClick={closeNotif}
                              className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] text-gray-800 dark:text-gray-200 leading-snug">{n.text}</span>
                                <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* Footer */}
                      <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
                        <Link
                          href={`${base}/notifications`}
                          onClick={closeNotif}
                          className="block text-[12px] text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors w-full text-center"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MORE DROPDOWN  (fixed, unclipped)
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMore && hasMore && (
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowMore(false)}
              aria-hidden="true"
            />
            <motion.div
              {...DROPDOWN_ANIM}
              style={{ position: "fixed", top: morePos.top, left: morePos.left, zIndex: 9999 }}
              className={`w-52 ${DROPDOWN_PANEL}`}
            >
              <ul className="py-1.5" role="menu">
                {overflowTabs.map((tab) => {
                  const Icon   = tab.icon;
                  const active = pathname.startsWith(tab.href) ||
                    (tab.legacyPaths?.some((p) => pathname.startsWith(p)) ?? false);
                  return (
                    <li key={tab.label} role="none">
                      <Link
                        href={tab.href}
                        onClick={() => setShowMore(false)}
                        role="menuitem"
                        className={[
                          "flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors",
                          active
                            ? "text-violet-700 dark:text-violet-300 font-semibold bg-violet-50/70 dark:bg-violet-950/30"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                        ].join(" ")}
                      >
                        <Icon
                          size={14}
                          className={active ? "text-violet-500 shrink-0" : "text-gray-400 shrink-0"}
                        />
                        {tab.label}
                        {tab.badge > 0 && (
                          <span className="ms-auto inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                            {tab.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* ════════════════════════════════════════════════════
          MOBILE OVERFLOW DRAWER
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              {...DRAWER_ANIM}
              className="
                md:hidden fixed bottom-0 inset-x-0 z-[51]
                bg-white dark:bg-gray-900
                rounded-t-2xl
                border-t border-gray-200/60 dark:border-gray-800/50
                shadow-[0_-8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.5)]
                pb-[env(safe-area-inset-bottom,16px)]
              "
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">Navigation</p>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* All tabs grid */}
              <div className="p-4 grid grid-cols-3 gap-2">
                {allTabs.map((tab) => {
                  const Icon   = tab.icon;
                  const active = pathname.startsWith(tab.href) ||
                    (tab.legacyPaths?.some((p) => pathname.startsWith(p)) ?? false);
                  return (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      onClick={() => setMobileDrawerOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.94 }}
                        className={`
                          relative flex flex-col items-center gap-1.5
                          py-3 px-2 rounded-xl transition-colors
                          ${active
                            ? "bg-gray-50 dark:bg-gray-800/60 border border-violet-200/60 dark:border-violet-800/40"
                            : "bg-gray-50 dark:bg-gray-800/50 border border-transparent"
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          className={active
                            ? "text-violet-600 dark:text-violet-400"
                            : "text-gray-500 dark:text-gray-400"
                          }
                        />
                        <span
                          className={`
                            text-[11px] font-medium text-center leading-tight
                            ${active
                              ? "text-violet-700 dark:text-violet-300"
                              : "text-gray-600 dark:text-gray-400"
                            }
                          `}
                        >
                          {tab.label}
                        </span>
                        {tab.badge > 0 && (
                          <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-3.5 min-w-[14px] px-[2px] rounded-full bg-red-500 text-white text-[8px] font-bold leading-none">
                            {tab.badge}
                          </span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}