"use client";

/**
 * BottomDock — Premium Mobile Navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-width glass pill. Four nav tabs + More sheet.
 * Spacious, relaxed, confident — iOS Dock × Airbnb × Linear quality.
 *
 * Architecture:
 * • Full-width: left-3 right-3 (12px margins each side), stretches naturally
 * • flex-1 tabs — equal distribution, no fixed widths
 * • Subtle active pill (bg tint) instead of dot indicator
 * • Local scroll-hide state — context loop safe
 * • md:hidden — mobile only; desktop nav is VendorNavTabs
 */

import { motion, AnimatePresence }           from "framer-motion";
import { usePathname, useParams }            from "next/navigation";
import Link                                  from "next/link";
import {
  LayoutDashboard, Building2, CalendarDays,
  ClipboardList, MoreHorizontal, X,
  Layers, Package, BarChart3, Settings,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useUI }                             from "@/context/VendorUIContext";

import {
  globalSetting,
} from "@/services/booking.service";

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function BottomDock() {
  const pathname = usePathname();
  const params   = useParams();
  const { setShowDock } = useUI();

  const [showMore,    setShowMore]    = useState(false);
  const [dockVisible, setDockVisible] = useState(true);

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


  /* ── Stable base path ───────────────────────────────── */
  const base = useMemo(
    () => `/${params?.locale}/${params?.country}/vendor`,
    [params?.locale, params?.country]
  );

  /* ── Tab definitions ────────────────────────────────── */
  const mainTabs = useMemo(() => [
    { label: "Dashboard",    href: `${base}/dashboard`,    icon: LayoutDashboard },
    { label: "Listing",      href: `${base}/listing`,      icon: Building2       },
    { label: "Calendar",     href: `${base}/calendar`,     icon: CalendarDays    },
    {
      label: "Reservations",
      href:  `${base}/reservations`,
      icon:  ClipboardList,
      badge: 14,
      legacyPaths: [`${base}/leads`, `${base}/bookings`],
    },
  ], [base]);

  // const moreLinks = useMemo(() => [
  //   { label: "Add-ons",  href: `${base}/addons`,   icon: Layers    },
  //   { label: "Packages", href: `${base}/package`,  icon: Package   },
  //   { label: "Reports",  href: `${base}/reports`,  icon: BarChart3 },
  //   { label: "Settings", href: `${base}/settings`, icon: Settings  },
  // ], [base]);
  const moreLinks = useMemo(() => [
  { label: "Add-ons", href: `${base}/addons`, icon: Layers },

  ...(settingsMap?.paxPricing
    ? [
        {
          label: "Packages",
          href: `${base}/package`,
          icon: Package,
        },
      ]
    : []),

  { label: "Reports", href: `${base}/reports`, icon: BarChart3 },
  { label: "Settings", href: `${base}/settings`, icon: Settings },
], [base, settingsMap]);

  /* ── Scroll-hide ────────────────────────────────────── */
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handle = () => {
      const cur = window.scrollY;
      if (Math.abs(cur - lastScrollY.current) < 10) return;
      const visible = cur <= lastScrollY.current || cur < 60;
      setDockVisible(visible);
      setShowDock(visible);
      lastScrollY.current = cur;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [setShowDock]);

  /* ── Body scroll lock when More sheet is open ───────── */
  useEffect(() => {
    document.body.style.overflow = showMore ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showMore]);

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          FULL-WIDTH GLASS DOCK
      ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 110, opacity: 0 }}
        animate={{
          y:       dockVisible ? 0 : 110,
          opacity: dockVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 180, damping: 28, mass: 0.8 }}
        className="
          fixed
          bottom-[max(0.75rem,env(safe-area-inset-bottom))]
          left-3 right-3
          md:hidden
          z-50
        "
      >
        {/*
          Glass panel:
          - Light mode: bright white glass with strong inset highlight
          - Dark mode : near-black glass with subtle border
          - Multi-layer shadow for depth and lift
        */}
        <div
          className="
            flex items-center
            px-2 py-2
            rounded-[1.75rem]
            bg-white/82 dark:bg-[#0b0e1c]/82
            backdrop-blur-2xl
            border border-white/70 dark:border-white/[0.08]
            shadow-[0_8px_32px_rgba(0,0,0,0.09),0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.55)]
            dark:shadow-[0_8px_32px_rgba(0,0,0,0.44),0_2px_8px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.03)]
          "
        >

          {/* ── Nav tabs — flex-1 equal distribution ──── */}
          {mainTabs.map((item) => {
            const Icon   = item.icon;
            const active = pathname.startsWith(item.href) ||
              (item.legacyPaths?.some((p) => pathname.startsWith(p)) ?? false);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setShowMore(false)}
                className="flex-1 relative flex flex-col items-center gap-[3px] py-[10px]"
              >
                {/* Icon with badge */}
                <div className="relative">
                  <motion.div
                    whileTap={{ scale: 0.80 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.1 : 1.6}
                      className={`transition-colors duration-200 ${
                        active
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                  </motion.div>

                  {/* Badge (Reservations only) */}
                  {item.badge > 0 && (
                    <span className="
                      absolute -top-[5px] -right-[7px]
                      flex items-center justify-center
                      h-[14px] min-w-[14px] px-[3px]
                      rounded-full bg-red-500 text-white
                      text-[8px] font-bold leading-none
                      ring-[1.5px] ring-white dark:ring-[#0b0e1c]
                    ">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>

                {/* Label — leading-[1.2] prevents descender clipping (g, y, p) */}
                <span className={`
                  text-[10px] font-semibold leading-[1.2] tracking-tight
                  transition-colors duration-200 truncate max-w-full px-0.5
                  ${active
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-400 dark:text-gray-500"
                  }
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* ── More button — same flex-1 as tabs ──────── */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.80 }}
            onClick={() => setShowMore((p) => !p)}
            className="flex-1 flex flex-col items-center gap-[3px] py-[10px]"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div
              animate={{ rotate: showMore ? 90 : 0 }}
              transition={{ duration: 0.20, ease: [0.16, 1, 0.3, 1] }}
            >
              <MoreHorizontal
                size={21}
                strokeWidth={1.6}
                className={`transition-colors duration-200 ${
                  showMore
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
            </motion.div>
            <span className={`
              text-[10px] font-semibold leading-none tracking-tight
              transition-colors duration-200
              ${showMore
                ? "text-violet-600 dark:text-violet-400"
                : "text-gray-400 dark:text-gray-500"
              }
            `}>
              More
            </span>
          </motion.button>

        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          MORE SHEET
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/35 backdrop-blur-[3px] z-[60] md:hidden"
              onClick={() => setShowMore(false)}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 34, mass: 0.9 }}
              className="
                fixed bottom-0 inset-x-0 z-[70] md:hidden
                rounded-t-[1.75rem]
                bg-white dark:bg-[#0d1117]
                border-t border-gray-100/80 dark:border-white/[0.06]
                shadow-[0_-16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.58)]
                pb-[max(1.5rem,env(safe-area-inset-bottom))]
              "
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-[5px] w-10 rounded-full bg-gray-200/80 dark:bg-white/10" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  More
                </p>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setShowMore(false)}
                  className="
                    flex h-7 w-7 items-center justify-center
                    rounded-full
                    bg-gray-100 dark:bg-white/[0.07]
                    text-gray-500 dark:text-gray-400
                    hover:bg-gray-200 dark:hover:bg-white/[0.12]
                    transition-colors
                  "
                >
                  <X size={13} />
                </motion.button>
              </div>

              {/* Grid of links */}
              <div className="px-4 pb-2 grid grid-cols-4 gap-2">
                {moreLinks.map((item) => {
                  const Icon   = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`
                        flex flex-col items-center gap-2.5 py-5 px-1 rounded-2xl transition-all
                        ${active
                          ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-700/30"
                          : "bg-gray-50 dark:bg-white/[0.04] border border-transparent hover:bg-gray-100 dark:hover:bg-white/[0.07]"
                        }
                      `}
                    >
                      <Icon
                        size={22}
                        strokeWidth={active ? 2.0 : 1.6}
                        className={active
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-gray-500 dark:text-gray-400"
                        }
                      />
                      <span className={`
                        text-[11px] font-medium leading-tight text-center
                        ${active
                          ? "text-violet-700 dark:text-violet-300"
                          : "text-gray-600 dark:text-gray-400"
                        }
                      `}>
                        {item.label}
                      </span>
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
