"use client";

/**
 * CategoryNavigator.jsx
 *
 * Universal floating category switcher.
 *
 * Desktop  — fixed pill anchored to the inline-end edge, below the navbar.
 *            Click expands a dropdown panel downward.
 * Mobile   — same inline-end / top anchoring. Click expands a dropdown panel
 *            downward. No bottom placement — safe for future bottom tab bar.
 *
 * Integration:
 *   1. Wrap the page/layout with <CategoryProvider>.
 *   2. Drop <CategoryNavigator /> anywhere inside it (renders fixed/portal).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useParams, useRouter }                     from "next/navigation";
import { useTranslations }                          from "next-intl";

import { useCategory }                                   from "@/context/CategoryContext";
import { CATEGORIES, CATEGORY_ORDER, CATEGORY_COLORS }  from "@/config/categoryConfig";

/* ------------------------------------------------------------------ */
/*  Internal hook — mobile breakpoint                                   */
/* ------------------------------------------------------------------ */

function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mql  = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const sync = () => setMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [bp]);
  return mobile;
}

/* ------------------------------------------------------------------ */
/*  Root component                                                      */
/* ------------------------------------------------------------------ */

export default function CategoryNavigator({loadData}) {

  console.log('load Category')
  const [isOpen,   setIsOpen]   = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const containerRef            = useRef(null);
  const isMobile                = useIsMobile();

  const { activeCategory, setActiveCategory, categoryConfig } = useCategory();

  const params  = useParams();
  const router  = useRouter();
  const t       = useTranslations("categories");

  const locale  = params?.locale  ?? "en";
  const country = params?.country ?? "in";

  /* Hydration guard */
  useEffect(() => setMounted(true), []);

  /* Outside-click close — both desktop and mobile (dropdown style) */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler, true);
    return () => document.removeEventListener("mousedown", handler, true);
  }, [isOpen]);

  /* ESC close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleSelect = useCallback((id) => {
    const cat = CATEGORIES[id];
    if (!cat || cat.comingSoon) return;
    setActiveCategory(id);
    setIsOpen(false);
    router.push(`/${locale}/${country}/search/${cat.route}`);
  }, [setActiveCategory, router, locale, country]);

  if (!mounted) return null;

  const activeColor = CATEGORY_COLORS[categoryConfig?.color ?? "violet"];
  const activeLabel = t(categoryConfig?.id ?? "venues");

  const shared = {
    isOpen, setIsOpen,
    activeCategory, activeColor, activeLabel,
    onSelect: handleSelect, t,
  };

  return isMobile
    ? <MobileNav loadData = {loadData } containerRef={containerRef} {...shared} />
    : <DesktopNav  loadData = {loadData } containerRef={containerRef} {...shared} />;
}

/* ------------------------------------------------------------------ */
/*  Desktop navigator                                                   */
/* ------------------------------------------------------------------ */

function DesktopNav({
  containerRef, isOpen, setIsOpen,
  activeCategory, activeColor, activeLabel, onSelect, t, loadData
}) {
  return (
    <div
      ref={containerRef}
      /*
       * Anchored to the inline-end edge (right in LTR, left in RTL),
       * just below the navbar (~64px + 8px gap).
       */
      style={{ insetInlineEnd: "40px", top: "83px" }}
      className="fixed z-30 flex flex-col items-end"
    >
      {/* ── Collapsed pill trigger ───────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${activeLabel} — change category`}
        className={[
          "relative flex items-center gap-2.5 rounded-full",
          "px-4 py-2.5 text-sm font-medium whitespace-nowrap",
          "bg-white dark:bg-gray-900",
          "border border-gray-200/80 dark:border-gray-700/80",
          "shadow-lg shadow-black/[0.08] dark:shadow-black/30",
          "transition-all duration-200",
          "hover:border-gray-300 dark:hover:border-gray-600",
          "hover:shadow-xl hover:shadow-black/[0.12]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
          isOpen
            ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ${activeColor.ring}`
            : "",
        ].join(" ")}
      >
        <IconBadge color={activeColor}>
          <CategoryIcon id={activeCategory} data = { loadData } className="h-3.5 w-3.5 text-white" />
        </IconBadge>

        <span className="text-gray-800 dark:text-gray-100">{activeLabel}</span>

        <ChevronIcon
          className={[
            "h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* ── Expanded panel — drops down below pill ───────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label={t("selectCategory")}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: -8  }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={[
              "mt-2 w-72",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "border border-gray-100 dark:border-gray-800",
              "shadow-2xl shadow-black/[0.14] dark:shadow-black/50",
            ].join(" ")}
          >
            <PanelContent
              cols={2}
              activeCategory={activeCategory}
              activeColor={activeColor}
              onSelect={onSelect}
              onClose={() => setIsOpen(false)}
              t={t}
              loadData={loadData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile navigator                                                    */
/* ------------------------------------------------------------------ */

function MobileNav({
  containerRef, isOpen, setIsOpen,
  activeCategory, activeColor, activeLabel, onSelect, t, loadData
}) {
  return (
    <div
      ref={containerRef}
      /*
       * Top-right anchoring — same logical-property pattern as desktop.
       * Safe-area offset keeps it clear of notches.
       * No bottom placement → no conflict with future bottom tab bar.
       */
      style={{
        insetInlineEnd: "20px",
        top: "calc(75px + env(safe-area-inset-top, 0px))",
      }}
      className="fixed z-[31] flex flex-col items-end"
    >
      {/* ── Compact pill trigger ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${activeLabel} — change category`}
        className={[
          "flex items-center gap-2 rounded-full",
          "px-3.5 py-2 text-sm font-medium whitespace-nowrap",
          "bg-white dark:bg-gray-900",
          "border border-gray-200/90 dark:border-gray-700/80",
          "shadow-lg shadow-black/[0.10] dark:shadow-black/40",
          "transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
          isOpen
            ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ${activeColor.ring}`
            : "",
        ].join(" ")}
      >
        <IconBadge color={activeColor} >
          <CategoryIcon id={activeCategory} data = { loadData } className="h-3.5 w-3.5 text-white" />
        </IconBadge>

        <span className="text-gray-800 dark:text-gray-100">{activeLabel}</span>

        <ChevronIcon
          className={[
            "h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* ── Dropdown panel — drops down below pill ───────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label={t("selectCategory")}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: -8  }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            /*
             * Width: fill from inline-start edge to 16px from inline-end
             * (where the pill is anchored), capped at 20rem so it never
             * goes too wide on tablets.
             */
            style={{ width: "min(calc(100vw - 32px), 23rem)" }}
            className={[
              "mt-2",
              "rounded-2xl overflow-hidden",
              "bg-white dark:bg-gray-900",
              "border border-gray-100 dark:border-gray-800",
              "shadow-2xl shadow-black/[0.14] dark:shadow-black/50",
            ].join(" ")}
          >
            <PanelContent
              cols={3}
              activeCategory={activeCategory}
              activeColor={activeColor}
              onSelect={onSelect}
              onClose={() => setIsOpen(false)}
              t={t}
               loadData={loadData}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared panel content                                                */
/* ------------------------------------------------------------------ */

function PanelContent({ cols, activeCategory, activeColor, onSelect, onClose, t ,loadData}) {
  const gridCols = cols === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 select-none">
          {t("selectCategory")}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none"
        >
          <XIcon />
        </button>
      </div>

      {/* Category grid */}
      <div className={`grid ${gridCols} gap-2`}>
        {/* {CATEGORY_ORDER.map((id) => {
          const cat    = CATEGORIES[id];
          const color  = CATEGORY_COLORS[cat.color];
          const isAct  = id === activeCategory;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              disabled={cat.comingSoon}
              aria-current={isAct ? "true" : undefined}
              className={[
                "relative flex flex-col gap-2 rounded-xl p-3 text-start",
                "transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                cat.comingSoon
                  ? "cursor-not-allowed opacity-50"
                  : isAct
                    ? `${color.light} ring-1 ${color.ring} shadow-sm`
                    : "cursor-pointer bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-800 active:scale-[0.97]",
              ].join(" ")}
            >
              <IconBadge color={color} size="md">
                <CategoryIcon id={id}  data = { loadData } className="h-4 w-4 text-white" />
              </IconBadge>

              <span
                className={[
                  "text-[13px] font-medium leading-snug",
                  isAct
                    ? color.text
                    : "text-gray-700 dark:text-gray-300",
                ].join(" ")}
              >
                {t(id)}
              </span>

              {cat.comingSoon && (
                <span
                  className="absolute top-2 end-2 rounded-full bg-gray-100 dark:bg-gray-700/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  aria-label="Coming soon"
                >
                  Soon
                </span>
              )}
            </button>
          );
        })} */}
        {loadData?.map((item) => {
  const id = item?.name?.toLowerCase()+'s';

  const cat = CATEGORIES[id] || {};
  const color = CATEGORY_COLORS[item.color || "violet"];
  const isAct = id === activeCategory;

  return (
    <button
      key={item.id}
      type="button"
       onClick={() => onSelect(id)}
              disabled={cat.comingSoon}
              aria-current={isAct ? "true" : undefined}
      className={[
        "relative flex flex-col gap-2 rounded-xl p-3 text-start",
        "transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        isAct
          ? `${color.light} ring-1 ${color.ring} shadow-sm`
          : "cursor-pointer bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-800 active:scale-[0.97]",
      ].join(" ")}
    >
      <IconBadge color={color} size="md">
        <CategoryIcon
          id={id}
          data={loadData}
          className="h-4 w-4 text-white object-contain"
        />
      </IconBadge>

      <span
        className={[
          "text-[13px] font-medium leading-snug",
          isAct
            ? color.text
            : "text-gray-700 dark:text-gray-300",
        ].join(" ")}
      >
        {item.name}
      </span>
    </button>
  );
})}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Primitives                                                          */
/* ------------------------------------------------------------------ */

function IconBadge({ color, size = "sm", children }) {
  const dim = size === "md" ? "h-8 w-8 rounded-lg" : "h-6 w-6 rounded-full";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${dim} ${color.bg} shadow-sm`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Category icons                                                      */
/* ------------------------------------------------------------------ */

// function CategoryIcon({ id, className , data }) {
//   switch (id) {
//     case "venues":      return <VenueIcon      className={className} />;
//     case "farmstays":   return <FarmstayIcon   className={className} />;
//     case "studios":     return <StudioIcon     className={className} />;
//     case "rentals":     return <RentalIcon     className={className} />;
//     case "workspaces":  return <WorkspaceIcon  className={className} />;
//     case "experiences": return <ExperienceIcon className={className} />;
//     default:            return <VenueIcon      className={className} />;
//   }
// }
function CategoryIcon({ id, className, data = [] }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // find matching category
  const category = data.find(
    (item) =>
      item?.name?.toLowerCase() === id?.toLowerCase()
  );

  // image from API
  if (category?.image) {
    return (
      <img
        src={`${BASE_URL}/${category.image}`}
        alt={category.name}
        className={className}
      />
    );
  }



  // fallback icons
  switch (id?.toLowerCase()) {
    case "venue":
    case "venues":
      return <VenueIcon className={className} />;

    case "farmstay":
    case "farmstays":
      return <FarmstayIcon className={className} />;

    case "studio":
    case "studios":
      return <StudioIcon className={className} />;

    case "rental":
    case "rentals":
      return <RentalIcon className={className} />;

    case "workspace":
    case "workspaces":
      return <WorkspaceIcon className={className} />;

    case "experience":
    case "experiences":
      return <ExperienceIcon className={className} />;

    default:
      return <VenueIcon className={className} />;
  }
}

const strokeProps = {
  fill: "none", stroke: "currentColor",
  strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
  "aria-hidden": "true",
};

function VenueIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...strokeProps}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FarmstayIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...strokeProps}>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
    </svg>
  );
}

function StudioIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...strokeProps}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function RentalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...strokeProps}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function WorkspaceIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...strokeProps}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function ExperienceIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...strokeProps}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
