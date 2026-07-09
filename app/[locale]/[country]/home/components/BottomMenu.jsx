"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Map } from "lucide-react";
import { useUI }       from "@/context/UIContext";
import { useCategory } from "@/context/CategoryContext";
import { CATEGORY_COLORS } from "@/config/categoryConfig";

const CAT_LABEL = {
  venues:      "Venue",
  farmstays:   "Farmstay",
  studios:     "Studio",
  rentals:     "Rental",
  workspaces:  "Workspace",
  experiences: "Experience",
};

const SCROLL_THRESHOLD = 80;

/*
 * Map FAB sits at this bottom value on ALL sizes where it is visible:
 *   Mobile  (<768px)  : above the footer pill (~68px) + 12px gap = ~80px
 *   Tablet (768–1023px): footer is hidden, so 80px from bottom = comfortable thumb zone
 *   Desktop (1024px+) : lg:hidden — not rendered
 *
 * The Compare button (in FloatingMenu) uses the exact same value so they align.
 */
const FAB_BOTTOM = "calc(68px + env(safe-area-inset-bottom, 0px) + 12px)";

export default function BottomMenu() {
  const {
    showMap, setShowMap,
    showReels, setShowReels,
    filterOpen, compareOpen,
    hideBottomMenu,
    setCategorySheetOpen,
  } = useUI();
  const { activeCategory, categoryConfig } = useCategory();

  const [visible,      setVisible]      = useState(true);
  const [isMobileWidth, setIsMobileWidth] = useState(false);
  const lastScroll = useRef(0);
  const pathname   = usePathname();
  const router     = useRouter();

  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const locale   = segments[0];
  const country  = segments[1];

  const isSearchPage =
    pathname.includes("/search") || pathname.includes("/venues");

  // 5+ segments = detail page (/locale/country/search/type/id)
  // 4  segments = list page  (/locale/country/search/type) — show nav
  const isDetailPage = segments.length >= 5 && segments[2] === "search";

  const isHome =
    pathname === `/${locale}/${country}` ||
    pathname === `/${locale}/${country}/home`;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y <= lastScroll.current || y <= SCROLL_THRESHOLD);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Track mobile breakpoint — scroll-hide only applies below 768px */
  useEffect(() => {
    const check = () => setIsMobileWidth(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const go = useCallback(
    (path) => router.push(`/${locale}/${country}${path}`),
    [router, locale, country]
  );

  if (!locale || !country) return null;

  /*
   * Footer nav: hide when map/filter/compare overlays are open, detail pages, or scroll-down
   * Map FAB   : hide only on filter/compare overlays (NOT on showMap — it's the toggle!)
   *             Always visible on scroll-up; hidden on scroll-down
   */
  /* Footer nav: mobile-only — scroll-hide applies only on mobile (<768px) */
  const showNav = (isMobileWidth ? visible : true) && !hideBottomMenu && !isDetailPage;
  /* Map FAB: scroll-hide applies only on mobile (<768px); tablet always stays visible */
  const showFab = (isMobileWidth ? visible : true) && isSearchPage && !isDetailPage && !filterOpen && !compareOpen;

  const catColor    = CATEGORY_COLORS[categoryConfig?.color ?? "violet"] ?? CATEGORY_COLORS.violet;
  const searchRoute = `/search/${categoryConfig?.route ?? "venues"}`;
  const isSearchActive = isSearchPage && !isDetailPage;

  const purpleText = "text-violet-600 dark:text-violet-400";
  const purpleBg   = "bg-violet-50 dark:bg-violet-500/10";

  const FADE = {
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0  },
    exit:       { opacity: 0, y: 10 },
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  };

  return (
    <>
      {/*
        Map FAB
        ────────
        Breakpoints  : lg:hidden (hidden at 1024px+, visible on mobile + tablet)
        Visibility   : scroll-aware via showFab; shown even when map view is active
        Position     : bottom-right, mirrors Compare button on bottom-left
        The same FAB_BOTTOM constant is exported-by-convention to FloatingMenu
        so both buttons sit on the exact same horizontal plane.
      */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            key="map-fab"
            type="button"
            onClick={() => setShowMap((v) => !v)}
            aria-label={showMap ? "Show list view" : "Show map view"}
            aria-pressed={showMap}
            {...FADE}
            whileTap={{ scale: 0.88 }}
            style={{
              position:             "fixed",
              right:                25,
              bottom:               FAB_BOTTOM,
              width:                46,
              height:               46,
              borderRadius:         "50%",
              background:           "rgba(255,255,255,0.97)",
              backdropFilter:       "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border:               "1px solid rgba(0,0,0,0.08)",
              boxShadow:            "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              /* NOTE: no display here — let lg:hidden CSS control display */
              alignItems:           "center",
              justifyContent:       "center",
              cursor:               "pointer",
              zIndex:               42,
            }}
            className="flex lg:hidden dark:!bg-gray-900/97 dark:!border-white/[0.08]"
          >
            <Map className="h-[17px] w-[17px] text-gray-700 dark:text-gray-300" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/*
        Footer navigation bar
        ──────────────────────
        Breakpoints : md:hidden (hidden at 768px+)
        Mobile only — tablet and desktop never render this
      */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            aria-label="Primary mobile navigation"
            {...FADE}
            className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),10px)] md:hidden"
          >
            <ul
              role="list"
              className={[
                "flex w-full max-w-sm items-center",
                "rounded-[22px] border border-gray-200/50 dark:border-gray-700/30",
                "bg-white/95 dark:bg-gray-950/95",
                "px-1.5 py-1",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.10),0_2px_6px_-2px_rgba(0,0,0,0.06)]",
                "backdrop-blur-2xl",
              ].join(" ")}
            >
              <NavItem icon={<HomeIcon />}   label="Home"    active={isHome}                     textCls={purpleText} bgCls={purpleBg} onClick={() => go("/home")} />
              <NavItem icon={<SearchIcon />} label="Search"  active={isSearchActive}              textCls={purpleText} bgCls={purpleBg} onClick={() => go(searchRoute)} />
              <NavItem icon={<ReelsIcon />}  label="Reels"   active={showReels}                   textCls={purpleText} bgCls={purpleBg} onClick={() => { setShowReels(true); }} />
              <NavItem icon={<FolderIcon />}  label="My Collections" active={pathname.includes("/collections")} textCls={purpleText} bgCls={purpleBg} onClick={() => go("/collections")} />
              <NavItem
                icon={<CategoryTabIcon id={activeCategory} />}
                label={CAT_LABEL[activeCategory] ?? "Categories"}
                active={false}
                alwaysAccented
                textCls={catColor.text}
                bgCls={catColor.light}
                onClick={() => setCategorySheetOpen(true)}
              />
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── NavItem ─────────────────────────────────────────────────────── */
function NavItem({ icon, label, onClick, active = false, alwaysAccented = false, textCls, bgCls }) {
  const accented = active || alwaysAccented;
  return (
    <li className="flex-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={[
          "group flex w-full flex-col items-center gap-[3px]",
          "rounded-[18px] px-1 py-[5px]",
          "text-[10px] font-medium leading-none tracking-[0.01em]",
          "transition-colors duration-200 active:scale-[0.93]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
          accented
            ? textCls
            : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
        ].join(" ")}
      >
        <motion.span
          animate={{ scale: accented ? 1.05 : 1 }}
          transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={[
            "flex h-[32px] w-[32px] items-center justify-center rounded-[11px]",
            "transition-colors duration-200",
            accented ? bgCls : "group-hover:bg-gray-100/80 dark:group-hover:bg-gray-800/50",
          ].join(" ")}
        >
          {icon}
        </motion.span>
        <span className="truncate max-w-[60px]">{label}</span>
      </button>
    </li>
  );
}

/* ── CategoryTabIcon ─────────────────────────────────────────────── */
function CategoryTabIcon({ id }) {
  const norm = id?.toLowerCase().replace(/s$/, "");
  const p = { width:"17", height:"17", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true" };
  switch (norm) {
    case "venue":      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "farmstay":   return <svg {...p}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"/></svg>;
    case "studio":     return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "rental":     return <svg {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
    case "workspace":  return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case "experience": return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    default:           return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
  }
}

/* ── Inline SVG icons ─────────────────────────────────────────────── */
const S = { width:"17", height:"17", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":"true" };
function ReelsIcon()  { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="2" y1="17" x2="7" y2="17"/></svg>; }
function HomeIcon()   { return <svg {...S}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function SearchIcon() { return <svg {...S}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
// Matches lucide-react's "Folder" glyph — same icon the /collections page
// itself uses for Collections, replacing the leftover heart from when this
// nav item was "Wishlist".
function FolderIcon() { return <svg {...S}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>; }
