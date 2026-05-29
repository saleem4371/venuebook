"use client";
/**
 * TimelineView.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Resource × Date timeline — the signature view for Venues and Farmstays.
 * Each row = one resource (hall / room / desk)
 * Each column = one day in the week
 * Booking blocks span across their date range
 *
 * For intraday categories (venues, studios, workspaces):
 *   columns = hours of the day, rows = resources
 * For multiday categories (farmstays, rentals):
 *   columns = days in week, rows = resources
 */
import { useRef } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useCalendar, getStatusStyle } from "../CalendarContext";

const CELL_W   = 120; // px per column (day or hour slot)
const ROW_H    = 72;  // px per resource row
const GUTTER   = 16;  // padding inside a cell

/* ── Intraday mode: 6am-11pm ── */
const START_HOUR = 6;
const END_HOUR   = 23;
const INTRADAY_HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function timeToCol(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return (h - START_HOUR) + (m / 60);
}

function BookingBlockIntraday({ booking, resources, accentRgb, onClick }) {
  const style  = getStatusStyle(booking.status);
  const startX = timeToCol(booking.startTime || "09:00") * CELL_W;
  const endX   = timeToCol(booking.endTime   || "10:00") * CELL_W;
  const width  = Math.max(endX - startX - 4, 40);
  const rowIdx = resources.findIndex((r) => r.id === booking.resourceId);
  if (rowIdx === -1) return null;
  const topY = rowIdx * ROW_H + GUTTER / 2;

  return (
    <motion.button
      initial={{ opacity: 0, scaleX: 0.8 }}
      animate={{ opacity: 1, scaleX: 1 }}
      whileHover={{ y: -2, boxShadow: `0 8px 24px rgba(${accentRgb},0.28)`, zIndex: 20 }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="absolute rounded-xl overflow-hidden cursor-pointer text-left border-l-[3px]"
      style={{
        left:    `${startX + 2}px`,
        top:     `${topY}px`,
        width:   `${width}px`,
        height:  `${ROW_H - GUTTER}px`,
        background:  style.bg,
        borderColor: style.border,
        zIndex: 10,
      }}
    >
      <div className="px-2 py-1.5 h-full flex flex-col justify-between">
        <p className="text-[11px] font-bold leading-tight line-clamp-1" style={{ color: style.text }}>
          {booking.title}
        </p>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: style.text, opacity: 0.7 }}>
          <span>{booking.startTime} – {booking.endTime}</span>
        </div>
        {booking.guests > 0 && (
          <div className="text-[10px]" style={{ color: style.text, opacity: 0.6 }}>
            👥 {booking.guests}
          </div>
        )}
      </div>
    </motion.button>
  );
}

function BookingBlockMultiday({ booking, resources, weekDates, accentRgb, onClick }) {
  const style  = getStatusStyle(booking.status);
  const rowIdx = resources.findIndex((r) => r.id === booking.resourceId);
  if (rowIdx === -1) return null;

  const startDate = dayjs(booking.date);
  const endDate   = booking.endDate ? dayjs(booking.endDate) : startDate;

  /* Clamp to the visible week */
  const weekStart = weekDates[0];
  const weekEnd   = weekDates[6];
  const visStart  = startDate.isBefore(weekStart) ? weekStart : startDate;
  const visEnd    = endDate.isAfter(weekEnd)       ? weekEnd   : endDate;

  const colStart = weekDates.findIndex((d) => d.isSame(visStart, "day"));
  const colEnd   = weekDates.findIndex((d) => d.isSame(visEnd,   "day"));
  if (colStart === -1) return null;

  const left   = colStart * CELL_W + 4;
  const width  = Math.max((colEnd - colStart + 1) * CELL_W - 8, CELL_W - 8);
  const top    = rowIdx * ROW_H + GUTTER / 2;
  const isStart = startDate.isSame(visStart, "day");
  const isEnd   = endDate.isSame(visEnd,     "day");

  return (
    <motion.button
      initial={{ opacity: 0, scaleX: 0.9 }}
      animate={{ opacity: 1, scaleX: 1 }}
      whileHover={{ y: -2, boxShadow: `0 8px 24px rgba(${accentRgb},0.28)`, zIndex: 20 }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="absolute overflow-hidden cursor-pointer text-left"
      style={{
        left:         `${left}px`,
        top:          `${top}px`,
        width:        `${width}px`,
        height:       `${ROW_H - GUTTER}px`,
        background:   style.bg,
        border:       `1px solid ${style.border}`,
        borderRadius: `${isStart ? "12px" : "0"} ${isEnd ? "12px" : "0"} ${isEnd ? "12px" : "0"} ${isStart ? "12px" : "0"}`,
        borderLeftWidth: isStart ? "3px" : "1px",
        borderLeftColor: style.border,
        zIndex: 10,
      }}
    >
      {/* Only show content on the starting segment */}
      {isStart && (
        <div className="px-2.5 py-1.5 h-full flex flex-col justify-between">
          <p className="text-[11px] font-bold leading-tight line-clamp-1" style={{ color: style.text }}>
            {booking.title}
          </p>
          {booking.guests > 0 && (
            <div className="text-[10px] flex items-center gap-1" style={{ color: style.text, opacity: 0.7 }}>
              <span>👥 {booking.guests}</span>
              {booking.nights > 0 && <span className="ml-auto">· {booking.nights}n</span>}
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}

export default function TimelineView({ adapter }) {
  const { weekDates, currentDate, openBooking, filters, searchQuery } = useCalendar();
  const { bookings = [], resources = [], gradient, accent, accentRgb, timeMode = "intraday" } = adapter;
  const today = dayjs();
  const containerRef = useRef(null);

  const isMultiday = timeMode === "multiday";

  /* Filter */
  const filteredBookings = bookings.filter((b) => {
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const COLS         = isMultiday ? weekDates : INTRADAY_HOURS;
  const TOTAL_W      = COLS.length * CELL_W;
  const TOTAL_H      = resources.length * ROW_H;

  const formatColHeader = (col) => {
    if (isMultiday) {
      const d = col;
      const isToday = d.isSame(today, "day");
      return (
        <div className="text-center">
          <div className={`text-[10px] font-bold uppercase tracking-wide
            ${isToday ? "" : "text-gray-400 dark:text-gray-500"}`}
               style={isToday ? { color: accent } : {}}>
            {d.format("ddd")}
          </div>
          <div
            className={`text-sm font-black mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full
              ${isToday ? "text-white" : "text-gray-700 dark:text-gray-200"}`}
            style={isToday ? { background: gradient } : {}}
          >
            {d.date()}
          </div>
        </div>
      );
    }
    // Intraday
    const h = col;
    return (
      <div className="text-center">
        <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
          {h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden
                    border border-gray-100 dark:border-white/[0.06]
                    bg-white dark:bg-[#0f172a] shadow-sm">

      {/* ── Category label + legend ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]"
        style={{ background: `linear-gradient(90deg, rgba(${accentRgb},0.06), transparent)` }}
      >
        <div
          className="w-2 h-6 rounded-full shrink-0"
          style={{ background: gradient }}
        />
        <div>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
            {isMultiday ? "Multi-Day Occupancy View" : "Intraday Resource Timeline"}
          </p>
          <p className="text-[10px] text-gray-400">
            {resources.length} {adapter.resourceLabel ?? "resource"}s ·{" "}
            {filteredBookings.length} {adapter.bookingLabel ?? "booking"}s
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-gray-400">Live</span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="overflow-auto no-scrollbar">
        <div className="flex" style={{ minWidth: `${TOTAL_W + 160}px` }}>

          {/* Resource label column */}
          <div className="shrink-0" style={{ width: 160 }}>
            {/* Corner */}
            <div
              className="h-12 border-b border-r border-gray-100 dark:border-white/[0.06]
                         flex items-center px-4"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {adapter.resourceLabel ?? "Space"}
              </span>
            </div>

            {resources.map((r, i) => (
              <div
                key={r.id}
                className={`flex items-center gap-2 px-3 border-b border-r
                             border-gray-100 dark:border-white/[0.04]
                  ${i % 2 === 0 ? "bg-gray-50/50 dark:bg-white/[0.01]" : "bg-white dark:bg-[#0f172a]"}`}
                style={{ height: ROW_H }}
              >
                <span className="text-lg shrink-0">{r.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {r.label}
                  </p>
                  <p className="text-[10px] text-gray-400">cap. {r.capacity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="flex-1 relative" style={{ minWidth: TOTAL_W }}>
            {/* Column headers */}
            <div className="flex h-12 border-b border-gray-100 dark:border-white/[0.06]">
              {COLS.map((col, i) => (
                <div
                  key={i}
                  className={`shrink-0 flex items-center justify-center
                               border-r last:border-r-0
                               border-gray-100 dark:border-white/[0.04]`}
                  style={{ width: CELL_W }}
                >
                  {formatColHeader(col)}
                </div>
              ))}
            </div>

            {/* Row backgrounds */}
            <div className="relative" style={{ height: TOTAL_H }}>
              {resources.map((r, i) => (
                <div
                  key={r.id}
                  className={`absolute left-0 right-0 border-b
                               border-gray-100 dark:border-white/[0.04]
                    ${i % 2 === 0 ? "bg-gray-50/30 dark:bg-white/[0.005]" : ""}`}
                  style={{ top: i * ROW_H, height: ROW_H }}
                />
              ))}

              {/* Vertical column lines */}
              {COLS.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-gray-100 dark:border-white/[0.03]"
                  style={{ left: (i + 1) * CELL_W }}
                />
              ))}

              {/* Current time line (intraday only) */}
              {!isMultiday && (() => {
                const now = dayjs();
                const x = timeToCol(`${now.hour()}:${now.minute()}`) * CELL_W;
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none"
                    style={{ left: x, background: accent, boxShadow: `0 0 8px ${accent}` }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full -ml-[4px] -mt-1"
                      style={{ background: accent }}
                    />
                  </div>
                );
              })()}

              {/* Booking blocks */}
              {filteredBookings.map((b) =>
                isMultiday ? (
                  <BookingBlockMultiday
                    key={b.id}
                    booking={b}
                    resources={resources}
                    weekDates={weekDates}
                    accentRgb={accentRgb}
                    onClick={openBooking}
                  />
                ) : (
                  <BookingBlockIntraday
                    key={b.id}
                    booking={b}
                    resources={resources}
                    accentRgb={accentRgb}
                    onClick={openBooking}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
