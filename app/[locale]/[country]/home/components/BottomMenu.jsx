"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Heart, User, Map } from "lucide-react";
import { useUI } from "@/context/UIContext";

const SCROLL_THRESHOLD = 100;

export default function BottomMenu() {
  const { setShowMap, hideBottomMenu, setLoginOpen } = useUI();

  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);

  const pathname = usePathname();
  const router = useRouter();

  /* ---------------- Path parsing ---------------- */
  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  const locale = segments[0];
  const country = segments[1];

  const isSearchPage =
    pathname.includes("/search") || pathname.includes("/venues");

  const isDetailPage =
    segments.length === 4 &&
    segments[2] === "search" &&
    !["venues", "farmstay"].includes(segments[3]);

  const isHome =
    pathname === `/${locale}/${country}` ||
    pathname === `/${locale}/${country}/home`;

  /* ---------------- Scroll show/hide ---------------- */
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll.current && current > SCROLL_THRESHOLD) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScroll.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- Navigation helper ---------------- */
  const go = useCallback(
    (path) => {
      router.push(`/${locale}/${country}${path}`);
    },
    [router, locale, country]
  );

  if (!locale || !country) return null;

  return (
    <AnimatePresence>
      {visible && !hideBottomMenu && !isDetailPage && (
        <motion.nav
          aria-label="Primary mobile"
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),12px)] md:hidden"
        >
          <ul className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-2 py-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <NavItem
              icon={<Home className="h-5 w-5" aria-hidden="true" />}
              label="Home"
              active={isHome}
              onClick={() => go("/home")}
            />
            <NavItem
              icon={<Search className="h-5 w-5" aria-hidden="true" />}
              label="Search"
              active={pathname.includes("/search") && !isDetailPage}
              onClick={() => go("/search")}
            />
            <NavItem
              icon={<Heart className="h-5 w-5" aria-hidden="true" />}
              label="Wishlist"
              active={pathname.includes("/wishlist")}
              onClick={() => go("/wishlist")}
            />
            <NavItem
              icon={<User className="h-5 w-5" aria-hidden="true" />}
              label="Profile"
              active={pathname.includes("/profile")}
              onClick={() => setLoginOpen(true)}
            />
            {isSearchPage && (
              <NavItem
                icon={<Map className="h-5 w-5" aria-hidden="true" />}
                label="Map"
                onClick={() => setShowMap(true)}
              />
            )}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  NavItem                                                            */
/* ------------------------------------------------------------------ */
function NavItem({ icon, label, onClick, active = false }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={[
          "group relative flex min-w-[56px] flex-col items-center justify-center rounded-full px-3 py-1.5",
          "text-[11px] font-medium transition active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
          active
            ? "text-purple-700"
            : "text-gray-600 hover:text-gray-900",
        ].join(" ")}
      >
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full transition",
            active ? "bg-purple-50" : "group-hover:bg-gray-100",
          ].join(" ")}
        >
          {icon}
        </span>
        <span className="mt-0.5">{label}</span>
      </button>
    </li>
  );
}
