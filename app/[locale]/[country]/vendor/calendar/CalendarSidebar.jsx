"use client";
/**
 * CalendarSidebar.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Adaptive left sidebar — content changes completely per business category.
 * Venue: spaces + shifts + vendors
 * Farmstay: room units + housekeeping + pricing
 * Studio: studios + equipment + crew
 * Workspace: rooms + desks + teams
 * Rentals: inventory + status
 * Experiences: sessions + hosts
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import MiniCalendar from "./MiniCalendar";
import { useCalendar, getStatusStyle } from "./CalendarContext";

/* Status legend items shown at the bottom of sidebar */
const STATUS_LEGEND = {
  venues:      ["confirmed", "tentative", "setup", "buffer", "cancelled"],
  farmstays:   ["occupied", "checkin", "checkout", "cleaning", "blocked"],
  studios:     ["session", "recording", "setup", "buffer", "recurring"],
  workspaces:  ["booked", "recurring", "meeting", "blocked"],
  rentals:     ["rented", "pickup", "dropoff", "maintenance"],
  experiences: ["confirmed", "full", "few_left", "cancelled"],
};

function SidebarSection({ section, accentRgb, gradient, expandedId, onToggle }) {
  const isOpen = expandedId === section.id;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.05]">
      <button
        onClick={() => onToggle(section.id)}
        className="w-full flex items-center justify-between px-3 py-2.5
                   bg-gray-50 dark:bg-white/[0.03]
                   hover:bg-gray-100 dark:hover:bg-white/[0.06]
                   transition-colors duration-150"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {section.label}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-2 py-1.5 space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg
                             text-xs text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-white/[0.04]
                             transition-colors duration-150 text-left group"
                >
                  {item.dot && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                  )}
                  {!item.dot && (
                    <ChevronRight
                      size={10}
                      className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 shrink-0"
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                  {/* subtle hover accent */}
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    style={{ background: item.color }}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CalendarSidebar({ adapter }) {
  const { filters, setFilters, activeView } = useCalendar();

  const {
    gradient, accentRgb, accent,
    sidebarSections = [],
    bookings = [],
  } = adapter;

  /* Which category key is this? Derive from gradient signature or pass explicitly */
  const categoryKey = Object.entries({
    venues:      "linear-gradient(242deg, #a44bf3, #499ce8)",
    farmstays:   "linear-gradient(242deg, #22c55e, #14b8a6)",
    studios:     "linear-gradient(242deg, #f59e0b, #ef4444)",
    workspaces:  "linear-gradient(242deg, #3b82f6, #06b6d4)",
    rentals:     "linear-gradient(242deg, #ec4899, #8b5cf6)",
    experiences: "linear-gradient(242deg, #f97316, #eab308)",
  }).find(([, g]) => g === gradient)?.[0] ?? "venues";

  const statusLegend = STATUS_LEGEND[categoryKey] ?? [];

  const [expandedId, setExpandedId] = useState(sidebarSections[0]?.id ?? null);

  const handleToggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  /* Quick stats: count bookings per status */
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto no-scrollbar pb-6">

      {/* Mini calendar */}
      <MiniCalendar adapter={adapter} />

      {/* Quick stats */}
      <div
        className="rounded-2xl p-3 border border-gray-100 dark:border-white/[0.06]
                   bg-white dark:bg-[#0f172a] shadow-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
          Quick Stats
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] p-2.5 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{bookings.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
          </div>
          <div className="rounded-xl p-2.5 text-center"
               style={{ background: `rgba(${accentRgb},0.10)` }}>
            <p className="text-xl font-bold" style={{ color: accent }}>
              {bookings.filter((b) => ["confirmed", "occupied", "session", "booked"].includes(b.status)).length}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: accent, opacity: 0.75 }}>Active</p>
          </div>
        </div>
      </div>

      {/* Category-adaptive sections */}
      <div className="space-y-2">
        {sidebarSections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            accentRgb={accentRgb}
            gradient={gradient}
            expandedId={expandedId}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Status legend */}
      <div
        className="rounded-2xl p-3 border border-gray-100 dark:border-white/[0.06]
                   bg-white dark:bg-[#0f172a] shadow-sm"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
          Status Legend
        </p>
        <div className="space-y-2">
          {statusLegend.map((s) => {
            const style = getStatusStyle(s);
            const count = statusCounts[s] || 0;
            const isActive = filters.status === s;

            return (
              <button
                key={s}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    status: f.status === s ? "all" : s,
                  }))
                }
                className="w-full flex items-center gap-2 group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform group-hover:scale-125 duration-150"
                  style={{ background: style.border }}
                />
                <span
                  className={`text-xs flex-1 text-left transition-colors
                    ${isActive
                      ? "font-semibold"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`}
                  style={isActive ? { color: style.text } : {}}
                >
                  {style.label}
                </span>
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: style.bg,
                      color: style.text,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
