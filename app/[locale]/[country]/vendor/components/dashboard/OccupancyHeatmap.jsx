"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Plus, Eye, Check, Ban, FileText } from "lucide-react";

/* ─── Static data ──────────────────────────────────────────────────────────── */
const VENUES = [
  { id: 1, name: "Swarnagiri Mantap – Indoors"  },
  { id: 2, name: "Swarnagiri Mantap – Outdoors" },
  { id: 3, name: "Royal Banquet Hall"            },
];

const MOCK = {
  "1-0": "booked",   "1-1": "enquiry",  "1-3": "booked",
  "1-5": "reserved", "1-6": "booked",   "1-8": "enquiry",
  "1-10":"booked",   "1-13":"blocked",
  "2-0": "enquiry",  "2-2": "booked",   "2-4": "reserved",
  "2-7": "booked",   "2-9": "enquiry",  "2-11":"booked",   "2-12":"enquiry",
  "3-1": "booked",   "3-3": "enquiry",  "3-5": "booked",
  "3-6": "blocked",  "3-8": "booked",   "3-10":"reserved", "3-13":"booked",
};

const CELL = {
  available: { bg: "bg-white dark:bg-[#0f172a]",              border: "border-gray-200/80 dark:border-white/[0.06]", dot: "bg-emerald-400", label: "Available" },
  booked:    { bg: "bg-violet-500 dark:bg-violet-600",        border: "border-violet-400 dark:border-violet-700",   dot: "",               label: "Booked"    },
  enquiry:   { bg: "bg-white dark:bg-[#0f172a]",              border: "border-gray-200/80 dark:border-white/[0.06]",dot: "bg-amber-400",   label: "Enquiry"   },
  reserved:  { bg: "bg-white dark:bg-[#0f172a]",              border: "border-gray-200/80 dark:border-white/[0.06]",dot: "bg-sky-400",     label: "Reserved"  },
  blocked:   { bg: "bg-gray-100 dark:bg-white/[0.04]",        border: "border-gray-200/80 dark:border-white/[0.06]",dot: "bg-gray-400",    label: "Blocked"   },
};

const ACTIONS = {
  available: [
    { label: "+ Create Booking",        icon: Plus    },
    { label: "+ Block Date",            icon: Ban     },
    { label: "+ Create Quotation",      icon: FileText},
    { label: "+ Connect Existing Lead", icon: Check   },
  ],
  enquiry:   [
    { label: "View Enquiry",          icon: Eye   },
    { label: "Convert to Booking",    icon: Check },
  ],
  reserved:  [{ label: "View Reservation", icon: Eye }],
  booked:    [{ label: "View Booking",     icon: Eye }],
  blocked:   [{ label: "Unblock Date",     icon: Check }],
};

const DAY_NAMES  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function get14Days() {
  const days = [], now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function OccupancyHeatmap() {
  const [active, setActive]     = useState(null); // { venueId, dayIdx, state, rect }
  const containerRef            = useRef(null);
  const days                    = get14Days();

  /* close popover on outside click */
  useEffect(() => {
    const handler = e => {
      if (!e.target.closest("[data-heatmap-cell]") && !e.target.closest("[data-heatmap-popover]"))
        setActive(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getState = (venueId, dayIdx) => MOCK[`${venueId}-${dayIdx}`] || "available";

  const bookedCount = Object.values(MOCK).filter(s => s === "booked" || s === "reserved").length;
  const totalCells  = VENUES.length * 14;
  const occPct      = Math.round((bookedCount / totalCells) * 100);

  return (
    <div className="rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-black/20 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div>
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Occupancy · Next 14 Days</h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            <span className="font-bold text-violet-600 dark:text-violet-400">{occPct}%</span> overall occupancy across {VENUES.length} venues
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(CELL).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                k === "booked" ? "bg-violet-500" : v.dot
              }`} />
              <span className="text-[10.5px] text-gray-500 dark:text-gray-400">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid — horizontal scroll on narrow screens */}
      <div className="overflow-x-auto" ref={containerRef}>
        <div className="px-5 py-4" style={{ minWidth: 660 }}>

          {/* Day headers */}
          <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: "148px repeat(14,1fr)" }}>
            <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide self-end pb-0.5">
              Venue
            </div>
            {days.map((d, i) => {
              const isToday = i === 0;
              return (
                <div key={i} className="text-center">
                  <div className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase">
                    {DAY_NAMES[d.getDay()]}
                  </div>
                  <div className={`text-[11px] font-black mt-0.5 ${
                    isToday ? "text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-300"
                  }`}>
                    {d.getDate()}
                  </div>
                  {isToday && <div className="mx-auto mt-0.5 w-1 h-1 rounded-full bg-violet-500" />}
                </div>
              );
            })}
          </div>

          {/* Venue rows */}
          {VENUES.map(venue => (
            <div key={venue.id} className="grid gap-1.5 mb-2 items-center"
              style={{ gridTemplateColumns: "148px repeat(14,1fr)" }}>
              <p className="text-[11.5px] font-medium text-gray-700 dark:text-gray-300 truncate pr-2 leading-tight">
                {venue.name}
              </p>
              {days.map((_, dayIdx) => {
                const state   = getState(venue.id, dayIdx);
                const sty     = CELL[state];
                const isActive = active?.venueId === venue.id && active?.dayIdx === dayIdx;

                return (
                  <div key={dayIdx} className="relative flex justify-center">
                    <button
                      data-heatmap-cell
                      onClick={e => {
                        e.stopPropagation();
                        setActive(isActive ? null : { venueId: venue.id, dayIdx, state });
                      }}
                      className={[
                        "w-full aspect-square rounded-lg border flex items-center justify-center",
                        "transition-all duration-150",
                        sty.bg, sty.border,
                        isActive
                          ? "ring-2 ring-violet-400 ring-offset-1 dark:ring-offset-[#0f172a] scale-105"
                          : "hover:scale-110 hover:shadow-sm",
                      ].join(" ")}
                    >
                      {state !== "booked" && sty.dot && (
                        <span className={`w-2 h-2 rounded-full ${sty.dot}`} />
                      )}
                    </button>

                    {/* Popover */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          data-heatmap-popover
                          initial={{ opacity: 0, y: 4, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0,  scale: 1    }}
                          exit={  { opacity: 0, y: 4,  scale: 0.94 }}
                          transition={{ duration: 0.14 }}
                          className={[
                            "absolute z-50 top-full mt-2",
                            "left-1/2 -translate-x-1/2",
                            "w-44 bg-white dark:bg-[#1e293b]",
                            "border border-gray-200/80 dark:border-white/[0.10]",
                            "rounded-xl shadow-2xl p-2",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between px-1.5 mb-1.5">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              {sty.label}
                            </span>
                            <button onClick={() => setActive(null)} className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-white/10">
                              <X size={10} className="text-gray-400" />
                            </button>
                          </div>
                          {(ACTIONS[state] ?? []).map(({ label, icon: Icon }) => (
                            <button key={label}
                              className={[
                                "w-full flex items-center gap-2 text-left",
                                "text-[11.5px] font-medium text-gray-700 dark:text-gray-300",
                                "hover:bg-gray-50 dark:hover:bg-white/[0.05]",
                                "px-2 py-1.5 rounded-lg transition-colors",
                              ].join(" ")}
                            >
                              <Icon size={11} className="text-violet-500 dark:text-violet-400 flex-shrink-0" />
                              {label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          {bookedCount} of {totalCells} slots filled
        </p>
        <button className="flex items-center gap-1 text-[12px] font-semibold text-violet-600 dark:text-violet-400 hover:underline">
          View Full Calendar <ChevronRight size={13} />
        </button>
      </div>

    </div>
  );
}
