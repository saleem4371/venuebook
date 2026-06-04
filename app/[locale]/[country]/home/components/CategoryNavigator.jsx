"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useParams, useRouter }                     from "next/navigation";
import { useTranslations }                          from "next-intl";
import { X }                                        from "lucide-react";

import { useCategory }                                  from "@/context/CategoryContext";
import { CATEGORIES, CATEGORY_COLORS }                  from "@/config/categoryConfig";

function useIsBelow(bp) {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const mql  = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const sync = () => setBelow(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [bp]);
  return below;
}

export default function CategoryNavigator({ loadData = [], fabBreakpoint = 768 }) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef          = useRef(null);
  const isFabMode             = useIsBelow(fabBreakpoint);

  const { activeCategory, setActiveCategory, categoryConfig } = useCategory();
  const params  = useParams();
  const router  = useRouter();
  const t       = useTranslations("categories");
  const locale  = params?.locale  ?? "en";
  const country = params?.country ?? "in";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen || isFabMode) return;
    const onMouse = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("mousedown", onMouse, true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, isFabMode]);

  useEffect(() => {
    if (!isOpen || !isFabMode) return;
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isFabMode]);

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
  const shared = { isOpen, setIsOpen, activeCategory, activeColor, activeLabel, onSelect: handleSelect, t, loadData };

  return isFabMode
    ? <FabNavigator {...shared} />
    : <DesktopNav containerRef={containerRef} {...shared} />;
}

function DesktopNav({ containerRef, isOpen, setIsOpen, activeCategory, activeColor, activeLabel, onSelect, t, loadData }) {
  return (
    <div ref={containerRef} style={{ insetInlineEnd: "40px", top: "83px" }} className="fixed z-30 flex flex-col items-end">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${activeLabel} — change category`}
        className={[
          "relative flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap",
          "bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/80",
          "shadow-lg shadow-black/[0.08] dark:shadow-black/30 transition-all duration-200",
          "hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl hover:shadow-black/[0.12]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-violet-500 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950",
          isOpen ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ${activeColor.ring}` : "",
        ].join(" ")}
      >
        <IconBadge color={activeColor}>
          <CategoryIcon id={activeCategory} sizeClass="h-3.5 w-3.5" />
        </IconBadge>
        <span className="text-gray-800 dark:text-gray-100">{activeLabel}</span>
        <ChevronIcon className={["h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200", isOpen ? "rotate-180" : ""].join(" ")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label={t("selectCategory")}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: -8  }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 w-72 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl shadow-black/[0.14] dark:shadow-black/50"
          >
            <PanelContent cols={2} activeCategory={activeCategory} activeColor={activeColor} onSelect={onSelect} onClose={() => setIsOpen(false)} t={t} loadData={loadData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FabNavigator({ isOpen, setIsOpen, activeCategory, activeColor, activeLabel, onSelect, t, loadData }) {
  const hasBottomNav = useIsBelow(768);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const fabBottom = hasBottomNav
    ? "calc(72px + env(safe-area-inset-bottom, 0px) + 12px)"
    : "24px";

  return (
    <>
      <motion.button
        key="cat-fab"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        exit={{   scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        whileTap={{ scale: 0.88 }}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`${activeLabel} — switch category`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        style={{
          position: "fixed", right: 16, bottom: fabBottom,
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: `1.5px solid ${activeColor.accent}30`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 42, transition: "bottom 0.25s ease",
        }}
        className="dark:!bg-gray-900/90 dark:!border-white/10"
      >
        <span className={`inline-flex items-center justify-center overflow-hidden w-9 h-9 rounded-full ${activeColor.bg}`} aria-hidden="true">
          <CategoryIcon id={activeCategory} sizeClass="h-5 w-5" />
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="cat-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.40)",
                backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
                zIndex: 43,
              }}
            />
            <motion.div
              key="cat-sheet"
              role="dialog" aria-modal="true" aria-label={t("selectCategory")}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 44,
                borderRadius: "20px 20px 0 0",
                paddingBottom: "env(safe-area-inset-bottom, 12px)",
                maxHeight: "82vh", overflowY: "auto",
              }}
              className="bg-white dark:bg-gray-900 shadow-2xl"
            >
              <div className="flex justify-center pt-3 pb-0.5">
                <div className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="flex items-start justify-between px-5 pt-4 pb-5">
                <div>
                  <h3 className="text-[17px] font-bold tracking-tight text-gray-900 dark:text-white leading-snug">Switch Category</h3>
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">Choose what you&apos;re looking for</p>
                </div>
                <button onClick={() => setIsOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>
              <SheetGrid loadData={loadData} activeCategory={activeCategory} onSelect={onSelect} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SheetGrid({ loadData, activeCategory, onSelect }) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 pb-6">
      {loadData?.map((item) => {
        const id    = item?.name?.toLowerCase() + "s";
        const cat   = CATEGORIES[id] || {};
        const color = CATEGORY_COLORS[item.color || "violet"];
        const isAct = id === activeCategory;
        return (
          <button
            key={item.id} type="button"
            onClick={() => onSelect(id)}
            disabled={cat.comingSoon}
            aria-current={isAct ? "true" : undefined}
            className={[
              "relative flex flex-col items-center gap-2.5 rounded-2xl px-2 pt-4 pb-3.5",
              "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
              cat.comingSoon
                ? "cursor-not-allowed opacity-45"
                : isAct
                  ? `${color.light} ring-2 ${color.ring} shadow-sm`
                  : "bg-gray-50 dark:bg-gray-800/70 active:scale-[0.94] hover:bg-gray-100 dark:hover:bg-gray-800",
            ].join(" ")}
          >
            <span className={`inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl ${color.bg} shadow-sm`} aria-hidden="true">
              <CategoryIcon id={id} sizeClass="h-5 w-5" />
            </span>
            <span className={["text-[12px] font-semibold leading-snug text-center", isAct ? color.text : "text-gray-700 dark:text-gray-300"].join(" ")}>
              {item.name}
            </span>
            {isAct && <span aria-hidden="true" className={`absolute top-2 end-2 w-2 h-2 rounded-full ${color.bg}`} />}
            {cat.comingSoon && (
              <span className="absolute top-2 start-2 rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Soon</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PanelContent({ cols, activeCategory, activeColor, onSelect, onClose, t, loadData }) {
  const gridCols = cols === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 select-none">{t("selectCategory")}</p>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none">
          <XIcon />
        </button>
      </div>
      <div className={`grid ${gridCols} gap-2`}>
        {loadData?.map((item) => {
          const id    = item?.name?.toLowerCase() + "s";
          const cat   = CATEGORIES[id] || {};
          const color = CATEGORY_COLORS[item.color || "violet"];
          const isAct = id === activeCategory;
          return (
            <button
              key={item.id} type="button"
              onClick={() => onSelect(id)}
              disabled={cat.comingSoon}
              aria-current={isAct ? "true" : undefined}
              className={[
                "relative flex flex-col gap-2 rounded-xl p-3 text-start transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                cat.comingSoon
                  ? "cursor-not-allowed opacity-50"
                  : isAct
                    ? `${color.light} ring-1 ${color.ring} shadow-sm`
                    : "cursor-pointer bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100/80 dark:hover:bg-gray-800 active:scale-[0.97]",
              ].join(" ")}
            >
              <IconBadge color={color} size="md">
                <CategoryIcon id={id} sizeClass="h-4 w-4" />
              </IconBadge>
              <span className={["text-[13px] font-medium leading-snug", isAct ? color.text : "text-gray-700 dark:text-gray-300"].join(" ")}>{item.name}</span>
              {cat.comingSoon && (
                <span className="absolute top-2 end-2 rounded-full bg-gray-100 dark:bg-gray-700/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Soon</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IconBadge({ color, size = "sm", children }) {
  const dim = size === "md" ? "h-8 w-8 rounded-lg" : "h-6 w-6 rounded-full";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${dim} ${color.bg} shadow-sm`} aria-hidden="true">
      {children}
    </span>
  );
}

/* CategoryIcon — SVG-only. No image URLs; no API dependency.
   The badge container controls visual size; sizeClass drives SVG viewport. */
function CategoryIcon({ id, sizeClass = "h-4 w-4" }) {
  const normalised = id?.toLowerCase().replace(/s$/, "");
  const p = {
    className: `${sizeClass} text-white`,
    fill: "none", stroke: "currentColor", strokeWidth: "2",
    strokeLinecap: "round", strokeLinejoin: "round",
    viewBox: "0 0 24 24", "aria-hidden": "true",
  };
  switch (normalised) {
    case "venue":
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case "farmstay":
      return <svg {...p}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"/></svg>;
    case "studio":
      return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "rental":
      return <svg {...p}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
    case "workspace":
      return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case "experience":
      return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    default:
      return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  }
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
