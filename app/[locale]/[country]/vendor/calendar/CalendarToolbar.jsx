"use client";
/**
 * CalendarToolbar.jsx — Simplified
 * ──────────────────────────────────────────────────────────────────────────
 * A single clean bar. Inspired by Airbnb host calendar + Linear.
 *
 * Desktop:  [ ‹ May 2026 › ] [Today] | [Month][Week][Day] | [Filter▾] [🔍] [+]
 * Mobile:   [ ‹ May › ] [M|W|D]                             [≡]
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, LayoutGrid, CalendarDays, Clock,
  Search, X, SlidersHorizontal,
} from "lucide-react";
import { useCalendar } from "./CalendarContext";

const VIEWS = [
  { id: "month", label: "Month", icon: LayoutGrid  },
  { id: "week",  label: "Week",  icon: CalendarDays },
  { id: "day",   label: "Day",   icon: Clock        },
];

export default function CalendarToolbar({ adapter }) {
  const {
    activeView, setActiveView,
    rangeLabel,
    navigate, goToToday,
    filters, setFilters,
    searchQuery, setSearchQuery,
  } = useCalendar();

  const { gradient, accentRgb, accent, resources = [], resourceLabel = "Space" } = adapter;

  const [showSearch,   setShowSearch]   = useState(false);
  const [showFilter,   setShowFilter]   = useState(false);

  const activeResource = resources.find((r) => r.id === filters.resource);

  return (
    <div
      className="flex items-center gap-2 flex-wrap
                 rounded-2xl px-3 py-2.5
                 bg-white dark:bg-[#0f172a]
                 border border-gray-100 dark:border-white/[0.06]
                 shadow-sm"
    >

      {/* ── Date navigation ── */}
      <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-white/[0.04] rounded-xl px-1 py-1">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white
                     hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-150"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="px-2 text-sm font-semibold text-gray-900 dark:text-white
                         min-w-[130px] text-center whitespace-nowrap">
          {rangeLabel}
        </span>

        <button
          onClick={() => navigate(1)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white
                     hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-150"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Today */}
      <button
        onClick={goToToday}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold
                   text-gray-500 dark:text-gray-400
                   border border-gray-200 dark:border-white/[0.08]
                   hover:bg-gray-50 dark:hover:bg-white/[0.04]
                   hover:text-gray-800 dark:hover:text-white
                   transition-all duration-150"
      >
        Today
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-white/[0.08] hidden sm:block" />

      {/* ── View switcher ── */}
      <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-white/[0.04] rounded-xl p-1">
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                           transition-all duration-150
                ${isActive
                  ? "text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
              style={isActive ? {
                background: gradient,
                boxShadow: `0 1px 8px rgba(${accentRgb},0.28)`,
              } : {}}
            >
              <Icon size={12} className="shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Search ── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings…"
              onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
              className="w-full px-3 py-1.5 text-sm rounded-xl
                         bg-gray-50 dark:bg-white/[0.04]
                         border border-gray-200 dark:border-white/[0.08]
                         text-gray-800 dark:text-white
                         placeholder:text-gray-400
                         focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => { setShowSearch((v) => !v); if (showSearch) setSearchQuery(""); }}
        className={`p-2 rounded-xl transition-all duration-150
          ${showSearch
            ? "text-white"
            : "text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          }`}
        style={showSearch ? { background: gradient } : {}}
      >
        {showSearch ? <X size={16} /> : <Search size={16} />}
      </button>

      {/* ── Resource filter ── */}
      <div className="relative">
        <button
          onClick={() => setShowFilter((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                       transition-all duration-150
            ${filters.resource !== "all"
              ? "text-white"
              : "text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            }`}
          style={filters.resource !== "all" ? {
            background: gradient,
            boxShadow: `0 1px 8px rgba(${accentRgb},0.22)`,
          } : {}}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">
            {filters.resource !== "all"
              ? activeResource?.label ?? resourceLabel
              : resourceLabel + "s"}
          </span>
        </button>

        <AnimatePresence>
          {showFilter && (
            <>
              {/* Click-away backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFilter(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-56 rounded-2xl shadow-xl
                           bg-white dark:bg-[#111827]
                           border border-gray-100 dark:border-white/[0.06]
                           overflow-hidden z-50 py-1.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest
                               text-gray-400 px-4 py-1 pb-1.5">
                  {resourceLabel}s
                </p>

                {/* All option */}
                <button
                  onClick={() => { setFilters((f) => ({ ...f, resource: "all" })); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${filters.resource === "all"
                      ? "text-white font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                    }`}
                  style={filters.resource === "all" ? { background: gradient } : {}}
                >
                  All {resourceLabel}s
                </button>

                {resources.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setFilters((f) => ({ ...f, resource: r.id })); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors
                      ${filters.resource === r.id
                        ? "text-white font-semibold"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                      }`}
                    style={filters.resource === r.id ? { background: gradient } : {}}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="truncate">{r.label}</span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Active filter chip */}
      {(filters.resource !== "all" || searchQuery) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => { setFilters((f) => ({ ...f, resource: "all" })); setSearchQuery(""); }}
          className="text-[10px] font-semibold px-2 py-1 rounded-full
                     bg-gray-100 dark:bg-white/[0.06]
                     text-gray-500 dark:text-gray-400
                     hover:bg-red-50 dark:hover:bg-red-500/10
                     hover:text-red-500 transition-colors"
        >
          ✕ Clear
        </motion.button>
      )}
    </div>
  );
}
