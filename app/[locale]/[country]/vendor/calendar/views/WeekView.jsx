"use client";
/**
 * WeekView.jsx — Redesigned
 * ──────────────────────────────────────────────────────────────────────────
 * Clean week time-grid (6am – 11pm).
 *
 * Booking blocks: white bg + 3px colored left border + status dot + title.
 * Softer grid lines, subtle today tint, current-time indicator preserved.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useCalendar, getStatusStyle } from "../CalendarContext";

const START_HOUR = 6;
const END_HOUR   = 23;
const HOUR_PX    = 64;
const TOTAL_H    = (END_HOUR - START_HOUR) * HOUR_PX;
const HOURS      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function timeToTop(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return (h - START_HOUR) * HOUR_PX + (m / 60) * HOUR_PX;
}
function timeToPx(startStr, endStr) {
  return Math.max(timeToTop(endStr) - timeToTop(startStr), 28);
}

/* ── Booking block — clean white chip with colored left border ── */
function BookingBlock({ booking, onClick }) {
  const s      = getStatusStyle(booking.status);
  const top    = timeToTop(booking.startTime || "09:00");
  const height = timeToPx(booking.startTime || "09:00", booking.endTime || "10:00");

  const timeLabel = booking.startTime
    ? booking.startTime.slice(0, 5).replace(":00", "").replace(/^0/, "")
    : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2, zIndex: 20 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="absolute left-1 right-1 rounded-lg overflow-hidden
                 border-l-[3px] cursor-pointer text-left
                 bg-white dark:bg-white/[0.05]
                 border border-gray-100 dark:border-white/[0.06]
                 hover:border-gray-200 dark:hover:border-white/[0.10]
                 hover:shadow-md transition-all duration-150"
      style={{
        top:         `${top}px`,
        height:      `${height}px`,
        borderLeftColor: s.border,
        zIndex: 10,
      }}
      title={booking.title}
    >
      <div className="px-2 py-1.5 h-full flex flex-col justify-start gap-0.5 overflow-hidden">
        {/* Dot + title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-[5px] h-[5px] rounded-full shrink-0"
            style={{ background: s.border }}
          />
          <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 truncate leading-none">
            {booking.title}
          </p>
        </div>

        {/* Time label (if enough space) */}
        {height > 38 && timeLabel && (
          <p className="text-[10px] text-gray-400 pl-[13px] leading-none">
            {booking.startTime?.slice(0, 5)} – {booking.endTime?.slice(0, 5)}
          </p>
        )}

        {/* Guests (if tall enough) */}
        {height > 58 && booking.guests > 0 && (
          <p className="text-[10px] text-gray-400 pl-[13px] leading-none">
            {booking.guests} guests
          </p>
        )}
      </div>
    </motion.button>
  );
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekView({ adapter }) {
  const { weekDates, openBooking, filters, searchQuery } = useCalendar();
  const { bookings = [], gradient, accent, accentRgb } = adapter;
  const today    = dayjs();
  const scrollRef = useRef(null);
  const [currentTimeY, setCurrentTimeY] = useState(null);

  /* Auto-scroll to current time on mount */
  useEffect(() => {
    const now = dayjs();
    if (now.hour() >= START_HOUR && now.hour() < END_HOUR) {
      const y = timeToTop(`${now.hour()}:${now.minute()}`);
      scrollRef.current?.scrollTo({ top: Math.max(0, y - 100), behavior: "smooth" });
    }
  }, []);

  /* Current time ticker */
  useEffect(() => {
    const update = () => {
      const now = dayjs();
      setCurrentTimeY(timeToTop(`${now.hour()}:${now.minute()}`));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  /* Filter bookings */
  const filtered = bookings.filter((b) => {
    if (!b.startTime) return false;
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (filters.resource && filters.resource !== "all" && b.resourceId !== filters.resource) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getBookingsForDay = (date) =>
    filtered.filter((b) => b.date === date.format("YYYY-MM-DD"));

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden
                 border border-gray-100 dark:border-white/[0.06]
                 bg-white dark:bg-[#0f172a] shadow-sm"
    >
      {/* ── Day header row ── */}
      <div className="flex border-b border-gray-100 dark:border-white/[0.06] shrink-0">
        {/* Time gutter */}
        <div className="w-12 shrink-0 border-r border-gray-100 dark:border-white/[0.06]" />

        {weekDates.map((date, i) => {
          const isToday   = date.isSame(today, "day");
          const isWeekend = date.day() === 0 || date.day() === 6;
          return (
            <div
              key={i}
              className={`flex-1 text-center py-3 border-r last:border-r-0
                          border-gray-100 dark:border-white/[0.04]
                ${isWeekend ? "bg-gray-50/50 dark:bg-white/[0.01]" : ""}`}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-wide"
                style={isToday ? { color: accent } : {}}
              >
                <span className={isToday ? "" : "text-gray-400 dark:text-gray-600"}>
                  {DAY_LABELS[date.day()]}
                </span>
              </p>
              <div
                className={`text-base font-black mt-1 w-7 h-7 mx-auto flex items-center justify-center rounded-full
                  ${isToday ? "text-white" : "text-gray-800 dark:text-gray-100"}`}
                style={isToday ? {
                  background: gradient,
                  boxShadow: `0 2px 10px rgba(${accentRgb},0.35)`,
                } : {}}
              >
                {date.date()}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scrollable time grid ── */}
      <div ref={scrollRef} className="flex overflow-y-auto no-scrollbar" style={{ maxHeight: "68vh" }}>

        {/* Time labels column */}
        <div className="w-12 shrink-0 border-r border-gray-100 dark:border-white/[0.06] relative">
          <div style={{ height: TOTAL_H }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 flex items-start justify-end pr-1.5"
                style={{ top: (h - START_HOUR) * HOUR_PX }}
              >
                <span className="text-[9px] font-medium text-gray-300 dark:text-gray-600 -mt-2 whitespace-nowrap">
                  {h > 12 ? `${h - 12}p` : h === 12 ? "12p" : `${h}a`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day columns */}
        {weekDates.map((date, i) => {
          const isToday   = date.isSame(today, "day");
          const isWeekend = date.day() === 0 || date.day() === 6;
          const dayBookings = getBookingsForDay(date);

          return (
            <div
              key={i}
              className={`flex-1 relative border-r last:border-r-0
                          border-gray-100 dark:border-white/[0.04]
                ${isWeekend ? "bg-gray-50/30 dark:bg-white/[0.005]" : ""}`}
              style={{ height: TOTAL_H }}
            >
              {/* Today tint */}
              {isToday && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.035]"
                  style={{ background: gradient }}
                />
              )}

              {/* Hour grid lines */}
              {HOURS.map((h) => (
                <div key={h}>
                  <div
                    className="absolute left-0 right-0 border-t border-gray-100 dark:border-white/[0.03]"
                    style={{ top: (h - START_HOUR) * HOUR_PX }}
                  />
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-gray-50 dark:border-white/[0.015]"
                    style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX / 2 }}
                  />
                </div>
              ))}

              {/* Current time line */}
              {isToday && currentTimeY !== null && currentTimeY >= 0 && currentTimeY <= TOTAL_H && (
                <div
                  className="absolute left-0 right-0 z-20 pointer-events-none"
                  style={{ top: currentTimeY }}
                >
                  <div className="h-px w-full" style={{ background: accent }} />
                  <div
                    className="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                  />
                </div>
              )}

              {/* Booking blocks */}
              {dayBookings.map((b) => (
                <BookingBlock key={b.id} booking={b} onClick={openBooking} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
