"use client";

// Module-level theme init — executes once when this chunk is evaluated by the
// browser, before any React render. No script tag needed, no React warning.
if (typeof window !== "undefined") {
  try {
    const t = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", t === "dark");
  } catch (_) {}
}

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import LoginModal          from "./LoginModal";
import UserDropdown        from "./UserDropdown";
import RegionLanguageModal from "./RegionLanguageModal";

import lightLogo from "@/assets/logo.svg";
import darkLogo  from "@/assets/logo.png";

import { useTranslations } from "next-intl";

import { getCookie } from "@/lib/cookie";
import { useCategory }      from "@/context/CategoryContext";

import { useUI }           from "@/context/UIContext";
import { useDropdown }     from "@/context/DropdownContext";
import { useAuth }         from "@/context/AuthContext";
import { useRegionContext } from "@/context/RegionContext";
import { useCurrency }     from "@/hooks/useCurrency";


/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCROLL_DELTA    = 6;   // px — direction-change threshold
const SCROLL_SHADOW_AT = 8;  // px — when to show shadow/border
const MOBILE_BP       = 768; // px — md breakpoint

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql  = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

function useScrollHeader(hideOnScroll) {
  const [scrolled, setScrolled] = useState(false);
  const [visible,  setVisible]  = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_SHADOW_AT);

      if (!hideOnScroll) {
        setVisible(true);
        lastY.current = y;
        return;
      }

      if (Math.abs(y - lastY.current) > SCROLL_DELTA) {
        setVisible(y < lastY.current || y < 80);
        lastY.current = y;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  return { scrolled, visible };
}

function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

function useTheme() {
  // Default: light — state only ever changes via toggleTheme, never from system
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    // If nothing saved, or anything other than "dark" → force light
    const dark = stored === "dark";
    if (!dark) {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return { isDark, toggleTheme };
}

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const params   = useParams();

  const locale  = params?.locale  || "en";
  const country = params?.country || "in";

  const { setFilterOpen, setLoginOpen, loginOpen, hideSiteChrome } = useUI();
  const { openDropdown }                           = useDropdown();
  const { isLoggedIn, isListed }                   = useAuth();

  const t = useTranslations("header");

  const [activeTab,       setActiveTab]       = useState("venue");
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const { isDark, toggleTheme }               = useTheme();

   const { activeCategory }           = useCategory();

  useRegionContext(); // keeps RegionProvider mounted for modal
  useCurrency();     // keeps currency context warm

  const isMobile = useIsMobile();

  /* ---------- Page shape detection ---------- */
  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  const isSearchPage = pathname.includes("/search") || pathname.includes("/venues");
  const isDetailPage =
    segments.length === 4 &&
    segments[2] === "search" &&
    !["venues", "farmstay"].includes(segments[3]);

  /* ---------- Sync tab from URL ---------- */
  useEffect(() => {
    if (segments[3] === "farmstay") setActiveTab("farmstay");
    else if (segments[3] === "venues") setActiveTab("venue");
  }, [segments]);

  /* ---------- Body lock ---------- */
  useLockBodyScroll(regionModalOpen);

  /* ---------- Navigation helpers ---------- */
  // const goVendor = useCallback(
  //   () => router.push(`/${locale}/${country}/vendor/dashboard`),
  //   [router, locale, country]
  // );
  const [vendorLoading, setVendorLoading] = useState(false);

  const handleVendorClick = useCallback(() => {
    if (vendorLoading) return;
    setVendorLoading(true);

    // vb_pending_category is set by WizardShell after listing_create() and removed
    // by subscription-success page on payment confirmation.  Check it FIRST —
    // before isListed — because is_vendor can be set to 1 at listing creation
    // time on some backend flows, meaning isListed=true while payment is still due.
    let dest;
    try {
      const pendingCat = localStorage.getItem("vb_pending_category");
      if (pendingCat) {
        dest = `/${locale}/${country}/start-listing/${pendingCat}/payment`;
      }
    } catch (_) {}

    if (!dest) {
      dest = isListed
        ? `/${locale}/${country}/vendor/dashboard`
        : `/${locale}/${country}/list`;
    }

    setTimeout(() => {
      setVendorLoading(false);
      router.push(dest);
    }, 650);
  }, [vendorLoading, isListed, locale, country, router]);



  const handleTabChange = useCallback(
  (type) => {
    setActiveTab(type);

    const slug = type
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    router.push(`/${locale}/${country}/search/${slug}`);
  },
  [router, locale, country]
);

  const handleExplore = useCallback(() => {
  if (!activeCategory) return;

  const slug = activeCategory
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  router.push(`/${locale}/${country}/search/${slug}`);
}, [activeCategory, router, locale, country]);

  /* ---------- Vendor CTA ---------- */
  const vendorLabel = isLoggedIn && isListed ? t("switch_to_vendor") : t("list_property");

  /* ---------- Layout branches ---------- */
  const showCenterToggle = !isMobile && isSearchPage && !isDetailPage;

  /* ================================================================ */


    const [token, setToken] = useState(null);

  useEffect(() => {
    const t = getCookie("token");
    setToken(t);
  }, []);

  // Messages page sets this when a conversation thread is open full-screen
  // on mobile — the chat has its own header, so the site Navbar steps aside.
  if (hideSiteChrome) return null;

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800"
        role="banner"
      >
        <nav
          aria-label="Primary navigation"
          className="flex h-[64px] md:h-[72px] w-full items-center justify-between px-5 sm:px-8 lg:px-10"
        >
          {/* Logo — always visible on all pages and screen sizes */}
          <Brand href={`/${locale}/${country}/home`} isDark={isDark} />

              {/* Center: search-type tabs (desktop search pages) */}
              {/* {showCenterToggle && (
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
                  <SearchTabs active={activeTab} onChange={handleTabChange} />
                </div>
              )} */}

              {/* ── Right cluster ──────────────────────────────── */}
              <div className="flex items-center gap-1">

                {/* Explore — hidden on mobile, minimal icon on md+ */}
                <button
                  type="button"
                  onClick={handleExplore}
                  aria-label={t("explore_aria")}
                  className={[
                    "hidden md:inline-flex items-center gap-1.5 rounded-full",
                    "px-3 py-2 text-sm font-medium",
                    "text-gray-700 dark:text-gray-300",
                    "transition hover:bg-gray-100 dark:hover:bg-gray-800/70",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  <ExploreSearchIcon className="h-[15px] w-[15px] shrink-0" />
                  <span>{t("explore")}</span>
                </button>

                {/* Vendor CTA — visible md+ */}
                {/*
                 * Two-layer AI-Mode border:
                 *   OUTER — overflow-hidden + p-[1.5px] = 1.5 px border slot.
                 *           Spinning conic-gradient lives here, fully isolated.
                 *   INNER — solid bg covers the center. Text/icon are completely
                 *           static; zero animation touches them.
                 */}
                <style>{`
                  @keyframes vb-border-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                  }
                `}</style>

                <span
                  className={[
                    "hidden md:inline-flex relative rounded-full overflow-hidden",
                    vendorLoading ? "p-[1.5px]" : "",
                  ].join(" ")}
                >
                  {/* ── BORDER LAYER — only element that animates ── */}
                  {vendorLoading && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-[-200%]"
                      style={{
                        background:
                          "conic-gradient(from 0deg, transparent 0%, #a44bf3 20%, #499ce8 45%, transparent 70%)",
                        animation: "vb-border-spin 1.4s linear infinite",
                      }}
                    />
                  )}

                  {/* ── CONTENT LAYER — never animated, never transforms ── */}
                  <button
                    type="button"
                    onClick={handleVendorClick}
                    disabled={vendorLoading}
                    className={[
                      /* position:relative puts this above the spinning layer */
                      "relative inline-flex items-center gap-2 rounded-full",
                      "px-4 py-2 text-sm font-medium",
                      "bg-white dark:bg-gray-950",
                      "text-gray-800 dark:text-gray-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                      vendorLoading
                        ? "cursor-not-allowed"
                        : "border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600",
                    ].join(" ")}
                  >
                    {isLoggedIn && isListed
                      ? <VendorSwitchIcon className="h-4 w-4 shrink-0" />
                      : <ListPropertyIcon className="h-4 w-4 shrink-0" />
                    }
                    <span>{vendorLabel}</span>
                  </button>
                </span>

                {/* Separator — desktop only */}
                <span
                  className="mx-1 hidden md:block h-5 w-px bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />

                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? t("theme_to_light") : t("theme_to_dark")}
                  className={[
                    "inline-flex h-10 w-10 items-center justify-center rounded-full",
                    "text-gray-600 dark:text-gray-400",
                    "transition hover:bg-gray-100 dark:hover:bg-gray-800/70",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  {/* light mode → moon (click to go dark) | dark mode → sun (click to go light) */}
                  {isDark
                    ? <SunIcon  className="h-[18px] w-[18px]" />
                    : <MoonIcon className="h-[18px] w-[18px]" />
                  }
                </button>

                {/* Region / Language / Currency — globe icon */}
                <button
                  type="button"
                  onClick={() => setRegionModalOpen(true)}
                  aria-label={t("region_aria")}
                  className={[
                    "inline-flex h-10 w-10 items-center justify-center rounded-full cursor-pointer",
                    "text-gray-600 dark:text-gray-400",
                    "transition hover:bg-gray-100 dark:hover:bg-gray-800",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  <GlobeNavIcon className="h-[18px] w-[18px]" />
                </button>

                {/* Profile / User dropdown */}
                <UserDropdown onOpenRegionModal={() => setRegionModalOpen(true)}  token = { token }  />

              </div>
        </nav>
      </header>

      {/* ── Region & Language modal ──────────────────────────────── */}
      <RegionLanguageModal
        open={regionModalOpen}
        onClose={() => setRegionModalOpen(false)}
      />

      {/* ── Login modal ──────────────────────────────────────────── */}
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Brand({ href, isDark }) {
  return (
    <Link
      href={href}
      aria-label="VenueBook home"
      className="shrink-0 inline-flex items-center rounded-md cursor-pointer transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
    >
      <img
        src={isDark ? darkLogo.src ?? darkLogo : lightLogo.src ?? lightLogo}
        alt="VenueBook"
        width={140}
        height={28}
        loading="eager"
        decoding="async"
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}

/* ---------- Search-type tabs (desktop) ---------- */
function SearchTabs({ active, onChange }) {
  const tabs = [
    { id: "venue",    label: "Venues",    Icon: VenueTabIcon    },
    { id: "farmstay", label: "Farmstays", Icon: FarmstayTabIcon },
  ];

  return (
    <div
      role="tablist"
      aria-label="Listing type"
      className="relative flex items-center rounded-full bg-gray-100 dark:bg-gray-800 p-1"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        aria-hidden="true"
        className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-purple-600 shadow-sm"
        style={{ left: active === "venue" ? 4 : "calc(50% + 0px)" }}
      />
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={[
              "relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
            ].join(" ")}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Inline SVG icon components                                         */
/* ------------------------------------------------------------------ */

const svg = (path, extra = "") => {
  const Comp = ({ className }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {typeof path === "string"
        ? <path d={path} />
        : path}
      {extra && <path d={extra} />}
    </svg>
  );
  return Comp;
};

/* Explore / Search icon — thin stroke, no fill */
function ExploreSearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="7" />
      <line x1="21" y1="21" x2="15.8" y2="15.8" />
    </svg>
  );
}

/* Globe icon for header */
function GlobeNavIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/* Vendor icons */
function ListPropertyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function VendorSwitchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2" />
      <path d="M5 21V11" /><path d="M19 21V11" />
      <rect x="9" y="14" width="6" height="7" />
    </svg>
  );
}

/* Search-tab icons */
function VenueTabIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FarmstayTabIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    </svg>
  );
}

/* Back arrow */
function BackArrowIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/* Theme toggle icons */
function SunIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* Filter / sliders */
function FilterIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="4" y1="6"  x2="20" y2="6"  />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}
