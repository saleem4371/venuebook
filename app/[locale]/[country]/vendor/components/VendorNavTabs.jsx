"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useParams }  from "next/navigation";
import Link                        from "next/link";
import {
  Home, Users, Calendar, CalendarCheck,
  BarChart2, Package, Layers, Settings, MoreHorizontal,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── animation ────────────────────────────────────────────── */
const DD = {
  initial:    { opacity: 0, scale: 0.96, y: -4 },
  animate:    { opacity: 1, scale: 1,    y:  0 },
  exit:       { opacity: 0, scale: 0.96, y: -4 },
  transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
};

const DROPDOWN_CLS = [
  "rounded-2xl overflow-hidden",
  "bg-white dark:bg-gray-900",
  "border border-gray-100 dark:border-gray-800",
  "shadow-xl shadow-gray-300/40 dark:shadow-black/50",
].join(" ");

/* ─── tab style helpers ─────────────────────────────────────── */
const TAB = "relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-lg transition-colors cursor-pointer select-none";
const TAB_ON  = "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30";
const TAB_OFF = "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800/40";

function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

/* ═══════════════════════════════════════════════════════════════
   SECONDARY STICKY NAV — desktop only
   Fixed at top-[72px], different design from primary header.
   Dynamically collapses overflow items into "More" dropdown.
═══════════════════════════════════════════════════════════════ */
export default function VendorNavTabs() {
  const pathname = usePathname();
  const params   = useParams();
  const base     = `/${params?.locale}/${params?.country}/vendor`;

  const allTabs = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: Home            },
    { label: "Listing",   href: `${base}/listing`,   icon: Home            },
    { label: "Calendar",  href: `${base}/calendar`,  icon: CalendarCheck   },
    { label: "Leads",     href: `${base}/leads`,     icon: Users, badge: 12 },
    { label: "Bookings",  href: `${base}/bookings`,  icon: Calendar, badge: 2 },
    { label: "Addons",    href: `${base}/addons`,    icon: Layers          },
    { label: "Packages",  href: `${base}/package`,   icon: Package         },
    { label: "Settings",  href: `${base}/settings`,  icon: Settings        },
    { label: "Reports",   href: `${base}/reports`,   icon: BarChart2       },
    { label: "Teams",     href: `${base}/teams`,     icon: Users           },
  ];

  /* ── overflow state ── */
  const [overflowIndex, setOverflowIndex] = useState(allTabs.length); // start: show all
  const [morePos, setMorePos]             = useState({ top: 120, left: 0 });
  const [showMore,  setShowMore]  = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  /* ── refs ── */
  const containerRef = useRef(null);  // inner flex row — measured for width
  const measureRefs  = useRef([]);    // invisible measurement items
  const moreBtnRef   = useRef(null);  // More button — for dropdown position
  const notifAreaRef = useRef(null);  // click-outside for notif

  const closeNotif = useCallback(() => setShowNotif(false), []);
  useClickOutside(notifAreaRef, closeNotif);

  /* ── dynamic overflow calculation ── */
  const MORE_BTN_W = 76; // px — reserved when More button is needed

  const recalculate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Available width = container width − notif area (≈ 88px)
    const available = container.offsetWidth - 88;

    let usedW = 0;
    let fitCount = allTabs.length;

    for (let i = 0; i < measureRefs.current.length; i++) {
      const el = measureRefs.current[i];
      if (!el) continue;
      const tabW = el.getBoundingClientRect().width + 4; // 4px gap
      const moreNeeded = i < allTabs.length - 1; // items still remain
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
    // Run after paint so measurement row has rendered
    const id = requestAnimationFrame(recalculate);
    const obs = new ResizeObserver(recalculate);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { cancelAnimationFrame(id); obs.disconnect(); };
  }, [recalculate]);

  const visibleTabs  = allTabs.slice(0, overflowIndex);
  const overflowTabs = allTabs.slice(overflowIndex);
  const hasMore      = overflowTabs.length > 0;

  /* ── open More dropdown with fixed coords ── */
  const openMore = useCallback(() => {
    if (moreBtnRef.current) {
      const r = moreBtnRef.current.getBoundingClientRect();
      setMorePos({ top: r.bottom + 4, left: r.left });
    }
    setShowMore(true);
  }, []);

  /* ── notifications data ── */
  const notifications = [
    { text: "New lead received", time: "2 min ago"  },
    { text: "Booking confirmed", time: "15 min ago" },
    { text: "Payment received",  time: "1 hr ago"   },
  ];
  const unread = notifications.length;

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          SECONDARY NAV BAR
      ══════════════════════════════════════════════════════ */}
      <div className="hidden md:block fixed inset-x-0 top-[72px] z-40">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800/60 ">

          {/* Outer padding wrapper */}
          <div className="max-w-7xl mx-auto px-8 lg:px-10">

            {/* Inner flex row — THIS is what we measure for available width */}
            <div ref={containerRef} className="flex items-center h-[44px] relative">

              {/* ─── Hidden measurement row ───────────────────
                  All tabs rendered invisibly so we can measure
                  their natural widths via getBoundingClientRect.
                  position:absolute keeps it out of flow.
              ─────────────────────────────────────────────── */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", top: 0, left: 0,
                  visibility: "hidden", pointerEvents: "none",
                  display: "flex", alignItems: "center", gap: "4px",
                  height: "44px",
                }}
              >
                {allTabs.map((tab, i) => (
                  <div
                    key={tab.label}
                    ref={(el) => (measureRefs.current[i] = el)}
                    style={{ flexShrink: 0 }}
                  >
                    <div className={`${TAB} ${TAB_OFF}`}>
                      <tab.icon size={14} />
                      <span>{tab.label}</span>
                      {tab.badge > 0 && (
                        <span style={{ display: "inline-flex", width: "20px", height: "16px" }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ─── Visible tab list ─────────────────────────
                  Only shows items up to overflowIndex.
                  overflow-hidden prevents any rounding bleed.
              ─────────────────────────────────────────────── */}
              <div className="flex items-center flex-1 gap-0.5 overflow-hidden">
                {visibleTabs.map((tab) => {
                  const Icon   = tab.icon;
                  const active = pathname.startsWith(tab.href);
                  return (
                    <Link key={tab.label} href={tab.href} className="shrink-0">
                      <div className={`${TAB} ${active ? TAB_ON : TAB_OFF}`}>
                        {active && (
                          <motion.div
                            layoutId="vSecondaryActive"
                            className="absolute inset-0 rounded-lg bg-violet-50 dark:bg-violet-950/30"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon size={14} className="relative shrink-0" />
                        <span className="relative">{tab.label}</span>
                        {tab.badge > 0 && (
                          <span className="relative inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* More button — only rendered when items overflow */}
                {hasMore && (
                  <button
                    ref={moreBtnRef}
                    type="button"
                    onClick={() => (showMore ? setShowMore(false) : openMore())}
                    className={`${TAB} shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                      showMore
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        : TAB_OFF
                    }`}
                  >
                    <MoreHorizontal size={14} />
                    <span>More</span>
                  </button>
                )}
              </div>

              {/* ─── Notifications — right side ─────────────── */}
              <div ref={notifAreaRef} className="shrink-0 ms-3 relative">
                <button
                  type="button"
                  onClick={() => setShowNotif((p) => !p)}
                  aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
                  className={`${TAB} px-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                    showNotif
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      : TAB_OFF
                  }`}
                >
                  <BellSVG />
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                      {unread}
                    </span>
                  )}
                </button>

                {/* Notif dropdown — absolute, parent overflow:visible → no clip */}
                <AnimatePresence>
                  {showNotif && (
                    <motion.div
                      {...DD}
                      className={`absolute end-0 mt-2 z-50 w-72 ${DROPDOWN_CLS}`}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</p>
                        <button
                          type="button"
                          onClick={closeNotif}
                          className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      </div>
                      <ul className="py-1.5">
                        {notifications.map((n, i) => (
                          <li key={i}>
                            <button type="button" className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                              <span className="min-w-0 flex-1">
                                <span className="block text-gray-800 dark:text-gray-200 leading-snug">{n.text}</span>
                                <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">{n.time}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Bottom separator line */}
          {/* <div className="h-[2px] bg-gray-100/80 dark:bg-gray-800/60" /> */}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MORE DROPDOWN — fixed, outside nav container,
          won't be clipped by any parent overflow.
          Transparent backdrop closes it on outside click.
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMore && hasMore && (
          <>
            {/* Backdrop — transparent, closes dropdown */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setShowMore(false)}
              aria-hidden="true"
            />

            {/* Dropdown — floats above everything */}
            <motion.div
              {...DD}
              style={{
                position: "fixed",
                top:      morePos.top,
                left:     morePos.left,
                zIndex:   9999,
              }}
              className={`w-52 ${DROPDOWN_CLS}`}
            >
              <ul className="py-1.5" role="menu">
                {overflowTabs.map((tab) => {
                  const Icon   = tab.icon;
                  const active = pathname.startsWith(tab.href);
                  return (
                    <li key={tab.label} role="none">
                      <Link
                        href={tab.href}
                        onClick={() => setShowMore(false)}
                        role="menuitem"
                        className={[
                          "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          active
                            ? "text-violet-700 dark:text-violet-300 font-medium bg-violet-50/60 dark:bg-violet-950/30"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60",
                        ].join(" ")}
                      >
                        <Icon
                          size={15}
                          className={active ? "text-violet-500 dark:text-violet-400 shrink-0" : "text-gray-400 dark:text-gray-500 shrink-0"}
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
    </>
  );
}

function BellSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
