"use client";

import { motion, AnimatePresence }          from "framer-motion";
import { usePathname, useParams, useRouter } from "next/navigation";
import Link                                  from "next/link";
import {
  Home, Users, Calendar, CalendarCheck,
  BarChart2, Package, Layers, Settings,
  MoreHorizontal, X,
  Globe, Sun, Moon, LogOut, ArrowLeftRight,
  BarChart3,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

import { useUI }  from "@/context/VendorUIContext";
import { useAuth } from "@/context/AuthContext";
import RegionLanguageModal from "../../home/components/RegionLanguageModal";

/* ═══════════════════════════════════════════════════════════════
   THEME HOOK (self-contained, matches Navbar.jsx)
═══════════════════════════════════════════════════════════════ */
function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setIsDark(stored === "dark");
  }, []);
  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);
  return { isDark, toggle };
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════════════════════════════ */
export default function BottomDock() {
  const pathname = usePathname();
  const params   = useParams();
  const router   = useRouter();

  const { setShowDock, hideBottomMenu } = useUI();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { user, isLoggedIn }            = useAuth();

  const basePath = `/${params?.locale}/${params?.country}/vendor`;

  /* ── 4 main tabs: Dashboard, Listing, Calendar, Bookings ── */
  const mainTabs = [
    { label: "Dashboard", href: `${basePath}/dashboard`, icon: Home            },
    { label: "Listing",   href: `${basePath}/listing`,   icon: Home            },
    { label: "Calendar",  href: `${basePath}/calendar`,  icon: CalendarCheck   },
    { label: "Bookings",  href: `${basePath}/bookings`,  icon: Calendar, badge: 2 },
  ];

  /* ── More panel — Leads + overflow nav ── */
  const moreNavLinks = [
    { label: "Leads",    href: `${basePath}/leads`,    icon: Users,    badge: 12 },
    { label: "Addons",   href: `${basePath}/addons`,   icon: Layers             },
    { label: "Packages", href: `${basePath}/package`,  icon: Package            },
    { label: "Reports",  href: `${basePath}/reports`,  icon: BarChart3          },
    { label: "Teams",    href: `${basePath}/teams`,    icon: Users              },
    { label: "Settings", href: `${basePath}/settings`, icon: Settings           },
  ];

  const [showMore, setShowMore] = useState(false);

  /* Smart scroll hide */
  const lastScrollY = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (Math.abs(current - lastScrollY.current) < 8) return;
      setShowDock(current <= lastScrollY.current || current <= 80);
      lastScrollY.current = current;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setShowDock]);

  /* Active pill */
  const itemRefs = useRef([]);
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const index = mainTabs.findIndex((i) => pathname.startsWith(i.href));
    if (index !== -1 && itemRefs.current[index]) {
      const el = itemRefs.current[index];
      requestAnimationFrame(() => {
        setActiveStyle({ left: el.offsetLeft, width: el.offsetWidth });
      });
    }
  }, [pathname]);

  /* Body scroll lock when More sheet open */
  useEffect(() => {
    document.body.style.overflow = showMore ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showMore]);

  const isHidden = hideBottomMenu;

  const goCustomer = () => {
    setShowMore(false);
    router.push(`/${params?.locale}/${params?.country}/home`);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════
          DOCK
      ══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.9 }}
        animate={{
          y:       !isHidden ? 0   : 140,
          opacity: !isHidden ? 1   : 0,
          scale:   !isHidden ? 1   : 0.92,
        }}
        transition={{ type: "spring", stiffness: 140, damping: 20, mass: 0.7 }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 md:hidden z-50"
      >
        <div className="relative flex items-center gap-3 px-5 py-3 border rounded-full backdrop-blur-2xl bg-white/30 dark:bg-gray-900/40 border-white/20 dark:border-gray-700/40 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl pointer-events-none" />

          {/* Active pill */}
          <motion.div
            className="absolute top-1 h-12 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            animate={{ left: activeStyle.left, width: activeStyle.width }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />

          {/* Main tabs */}
          {mainTabs.map((item, index) => {
            const Icon   = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setShowMore(false)}
                className="relative flex flex-col items-center z-10 px-2"
                ref={(el) => (itemRefs.current[index] = el)}
              >
                <motion.div
                  whileTap={{ scale: 0.75 }}
                  whileHover={{ scale: 1.15 }}
                  animate={active ? { y: [-2, 0] } : {}}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="p-2 rounded-full"
                >
                  <Icon
                    size={22}
                    className={`transition ${
                      active
                        ? "text-gray-900 dark:text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </motion.div>
                <motion.span
                  className={`text-[10px] mt-0.5 font-medium transition-colors ${
                    active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                  }`}
                  animate={{ opacity: active ? 1 : 0.6, y: active ? -1 : 1 }}
                >
                  {item.label}
                </motion.span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-0.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More tab */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.75 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => setShowMore(true)}
            className="relative flex flex-col items-center z-10 px-2 cursor-pointer focus:outline-none"
          >
            <div className="p-2 rounded-full">
              <MoreHorizontal size={22} className="text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-[10px] mt-0.5 font-medium text-gray-500 dark:text-gray-400 opacity-60">More</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════
          MORE BOTTOM SHEET
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setShowMore(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed bottom-0 inset-x-0 z-[70] md:hidden rounded-t-3xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 shadow-2xl"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
              </div>

              {/* Header row */}
              <div className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">More Navigation</p>
                <button
                  type="button"
                  onClick={() => setShowMore(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[70vh] pb-8">

                {/* ── Navigation ── */}
                <div className="px-4 pb-2">
                  {/* <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-2">
                    Navigation
                  </p> */}
                  <div className="grid grid-cols-3 gap-2">
                    {moreNavLinks.map((item) => {
                      const Icon   = item.icon;
                      const active = pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setShowMore(false)}
                          className={[
                            "flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-colors",
                            active
                              ? "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                              : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                          ].join(" ")}
                        >
                          <Icon size={20} />
                          <span className="text-[11px] font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                {/* <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4 my-3" /> */}

                {/* ── Preferences ── */}
                {/* <div className="px-4 pb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-2">
                    Preferences
                  </p> */}
                  {/* Theme toggle only — Region & Language is in profile dropdown */}
                  {/* <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isDark
                        ? <Sun  size={18} className="text-amber-500 shrink-0" />
                        : <Moon size={18} className="text-indigo-500 shrink-0" />
                      }
                      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                    <div className={`relative h-5 w-9 rounded-full transition-colors ${isDark ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"}`}>
                      <motion.div
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                        animate={{ x: isDark ? 16 : 2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    </div>
                  </button>
                </div> */}

                {/* Divider */}
                {/* <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4 my-3" /> */}

                {/* ── Account ── */}
                {/* <div className="px-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2 mb-2">
                    Account
                  </p>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={goCustomer}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors cursor-pointer"
                    >
                      <ArrowLeftRight size={18} className="text-violet-500 dark:text-violet-400 shrink-0" />
                      <span>Switch to Customer</span>
                    </button>
                  </div>
                </div> */}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
