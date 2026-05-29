"use client";
/**
 * DayView.jsx — Redesigned
 * ──────────────────────────────────────────────────────────────────────────
 * Single-day time grid. Clean, spacious, hospitality-focused.
 *
 * Booking cards: white bg + 4px colored left border, status chip, title,
 * time + guest count shown conditionally by height. No heavy overlays.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { useCalendar, getStatusStyle } from "../CalendarContext";

const START_HOUR = 6;
const END_HOUR   = 23;
const HOUR_PX    = 80;
const HOURS      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function timeToTop(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return (h - START_HOUR) * HOUR_PX + (m / 60) * HOUR_PX;
}
function timeToPx(startStr, endStr) {
  return Math.max(timeToTop(endStr) - timeToTop(startStr), 44);
}
function timeDuration(startStr, endStr) {
  const [sh, sm] = startStr.split(":").map(Number);
  const [eh, em] = endStr.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

/* ── Day booking card ── */
function DayBookingCard({ booking, adapter, onClick }) {
  const s      = getStatusStyle(booking.status);
  const top    = timeToTop(booking.startTime || "09:00");
  const height = timeToPx(booking.startTime || "09:00", booking.endTime || "10:00");
  const dur    = timeDuration(booking.startTime || "09:00", booking.endTime || "10:00");

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 3, zIndex: 20 }}
      whileTap={{ scale: 0.99 }}
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="absolute left-2 right-4 rounded-xl overflow-hidden
                 border-l-[4px] cursor-pointer text-left
                 bg-white dark:bg-white/[0.05]
                 border border-gray-100 dark:border-white/[0.06]
                 hover:border-gray-200 dark:hover:border-white/[0.10]
                 hover:shadow-md transition-all duration-150"
      style={{
        top:             `${top}px`,
        height:          `${height}px`,
        borderLeftColor: s.border,
        zIndex: 10,
      }}
      title={booking.title}
    >
      <div className="px-3 py-2 h-full flex flex-col justify-between">

        {/* Top: status chip + title */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{ background: s.border }}
              />
              <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-snug">
                {booking.title}
              </p>
            </div>
            {height > 52 && (
              <span
                className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: s.bg, color: s.text }}
              >
                {s.label}
              </span>
            )}
          </div>

          {/* Customer name */}
          {booking.customer?.name && height > 60 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-[14px] leading-none">
              {booking.customer.name}
            </p>
          )}
        </div>

        {/* Bottom: time + guests */}
        {height > 76 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] text-gray-400 tabular-nums">
              {booking.startTime?.slice(0, 5)} – {booking.endTime?.slice(0, 5)}
              <span className="opacity-60 ml-1">({dur})</span>
            </span>
            {booking.guests > 0 && (
              <span className="text-[11px] text-gray-400">
                {booking.guests} {adapter.guestLabel?.toLowerCase() ?? "guests"}
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {height > 110 && booking.notes && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic line-clamp-1 pl-[14px]">
            {booking.notes}
          </p>
        )}
      </div>
    </motion.button>
  );
}

export default function DayView({ adapter }) {
  const { currentDate, openBooking, filters, searchQuery } = useCalendar();
  const { bookings = [], gradient, accent, accentRgb } = adapter;
  const today     = dayjs();
  const scrollRef = useRef(null);
  const [nowY, setNowY] = useState(null);

  const isToday = currentDate.isSame(today, "day");
  const isPast  = currentDate.isBefore(today, "day");

  /* Scroll to current time */
  useEffect(() => {
    if (isToday) {
      const now = dayjs();
      const y = timeToTop(`${now.hour()}:${now.minute()}`);
      scrollRef.current?.scrollTo({ top: Math.max(0, y - 120), behavior: "smooth" });
    }
  }, [isToday]);

  /* Current time ticker */
  useEffect(() => {
    const update = () => {
      if (!isToday) return setNowY(null);
      const now = dayjs();
      setNowY(timeToTop(`${now.hour()}:${now.minute()}`));
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, [isToday]);

  const filtered = bookings.filter((b) => {
    if (!b.startTime) return false;
    if (b.date !== currentDate.format("YYYY-MM-DD")) return false;
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (filters.resource && filters.resource !== "all" && b.resourceId !== filters.resource) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalH = (END_HOUR - START_HOUR) * HOUR_PX;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden
                 border border-gray-100 dark:border-white/[0.06]
                 bg-white dark:bg-[#0f172a] shadow-sm"
    >
      {/* ── Day header ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0"
        style={isToday ? {
          background: `linear-gradient(90deg, rgba(${accentRgb},0.06), transparent)`,
        } : {}}
      >
        {/* Date badge */}
        <div
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0"
          style={isToday
            ? { background: gradient, boxShadow: `0 4px 16px rgba(${accentRgb},0.30)` }
            : { background: `rgba(${accentRgb},0.08)` }
          }
        >
          <span
            className="text-[9px] font-bold uppercase"
            style={{ color: isToday ? "rgba(255,255,255,0.75)" : accent }}
          >
            {currentDate.format("MMM")}
          </span>
          <span
            className="text-xl font-black leading-none"
            style={{ color: isToday ? "#fff" : accent }}
          >
            {currentDate.date()}
          </span>
        </div>

        <div>
          <p className="text-lg font-black text-gray-900 dark:text-white">
            {isToday ? "Today" : currentDate.format("dddd")}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {currentDate.format("D MMMM YYYY")} · {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Quick add button */}
        {!isPast && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: gradient, boxShadow: `0 3px 12px rgba(${accentRgb},0.28)` }}
          >
            <Plus size={13} />
            Add
          </motion.button>
        )}
      </div>

      {/* ── Scrollable time grid ── */}
      <div ref={scrollRef} className="overflow-y-auto no-scrollbar" style={{ maxHeight: "72vh" }}>
        <div className="flex" style={{ height: totalH }}>

          {/* Time labels */}
          <div className="w-14 shrink-0 relative border-r border-gray-100 dark:border-white/[0.06]">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] font-medium text-gray-300 dark:text-gray-600"
                style={{ top: (h - START_HOUR) * HOUR_PX - 8 }}
              >
                {h > 12 ? `${h - 12}pm` : h === 12 ? "12pm" : `${h}am`}
              </div>
            ))}
          </div>

          {/* Main column */}
          <div className="flex-1 relative">

            {/* Grid lines */}
            {HOURS.map((h) => (
              <div key={h}>
                <div
                  className="absolute left-0 right-0 border-t border-gray-100 dark:border-white/[0.04]"
                  style={{ top: (h - START_HOUR) * HOUR_PX }}
                />
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-gray-50 dark:border-white/[0.02]"
                  style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX / 2 }}
                />
              </div>
            ))}

            {/* Current time line */}
            {isToday && nowY !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: nowY }}
              >
                <div className="h-px w-full" style={{ background: accent }} />
                <div
                  className="absolute -left-1 -top-[5px] text-[9px] font-bold px-1.5 py-px rounded text-white"
                  style={{ background: accent }}
                >
                  {dayjs().format("HH:mm")}
                </div>
              </div>
            )}

            {/* Booking cards */}
            {filtered.map((b) => (
              <DayBookingCard
                key={b.id}
                booking={b}
                adapter={adapter}
                onClick={openBooking}
              />
            ))}

            {/* Empty state */}
            {filtered.length === 0 && !isPast && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl mb-2">📋</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No bookings for this day
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
