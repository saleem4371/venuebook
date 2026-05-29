"use client";
/**
 * MonthView.jsx — Redesigned
 * ──────────────────────────────────────────────────────────────────────────
 * Clean hospitality calendar grid.
 *
 * Desktop: spacious cells, dot + title + time chips, soft hover states.
 * Mobile:  compact cells with color dots → tap day → agenda panel slides in below.
 *
 * Color philosophy:
 *   Light mode: white chip, status dot, gray text, colored left line on hover
 *   Dark mode:  translucent chip, same dot system
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { useCalendar, getStatusStyle } from "../CalendarContext";

const DAY_LABELS_FULL  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS_SHORT = ["S",   "M",   "T",   "W",   "T",   "F",   "S"];
const MAX_CHIPS = 3; // desktop max before "+N more"

/* Returns bookings that fall on `date` (handles multi-day stays) */
function bookingsOnDate(all, date) {
  const d = date.format("YYYY-MM-DD");
  return all.filter((b) =>
    b.endDate ? d >= b.date && d <= b.endDate : b.date === d,
  );
}

/* ── Booking chip — used in desktop cells ── */
function BookingChip({ booking, onClick }) {
  const s = getStatusStyle(booking.status);
  const time = booking.startTime
    ? booking.startTime.slice(0, 5).replace(":00", "").replace(/^0/, "")
    : booking.date !== booking.endDate && booking.endDate
      ? `${dayjs(booking.date).format("D")}–${dayjs(booking.endDate).format("D")}`
      : null;

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md
                 text-left cursor-pointer group
                 bg-white dark:bg-white/[0.04]
                 border border-gray-100 dark:border-white/[0.05]
                 hover:border-gray-200 dark:hover:border-white/[0.10]
                 hover:shadow-sm transition-all duration-150"
      title={booking.title}
    >
      {/* Status dot */}
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{ background: s.border }}
      />

      {/* Title */}
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200
                        truncate flex-1 leading-none">
        {booking.title}
      </span>

      {/* Time */}
      {time && (
        <span className="text-[10px] text-gray-400 shrink-0 font-normal">
          {time}
        </span>
      )}
    </motion.button>
  );
}

/* ── Day agenda panel (mobile tap-to-expand) ── */
function DayAgendaPanel({ date, bookings, adapter, onClose }) {
  const { openBooking } = useCalendar();
  const { gradient, accentRgb } = adapter;
  const today = dayjs();
  const isToday = date.isSame(today, "day");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22 }}
      className="mt-1 rounded-2xl bg-white dark:bg-[#0f172a]
                 border border-gray-100 dark:border-white/[0.06]
                 shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: `rgba(${accentRgb},0.06)` }}
      >
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {isToday ? "Today" : date.format("dddd, D MMMM")}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Bookings list */}
      {bookings.length > 0 ? (
        <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
          {bookings.map((b) => {
            const s = getStatusStyle(b.status);
            return (
              <motion.button
                key={b.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => { openBooking(b); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left
                           hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ background: s.border }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {b.startTime
                      ? `${b.startTime} – ${b.endTime}`
                      : b.endDate
                        ? `${b.nights ?? "?"} nights`
                        : "All day"}
                    {b.guests > 0 && ` · ${b.guests} ${adapter.guestLabel?.toLowerCase() ?? "guests"}`}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: s.bg, color: s.text }}
                >
                  {s.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No bookings on this day</p>
        </div>
      )}
    </motion.div>
  );
}

export default function MonthView({ adapter }) {
  const {
    monthDates, currentDate,
    openBooking, filters, searchQuery,
  } = useCalendar();

  const { bookings = [], gradient, accent, accentRgb } = adapter;
  const today = dayjs();

  /* Mobile: selected day for tap-to-expand panel */
  const [selectedDay, setSelectedDay] = useState(null);

  /* Filtered bookings */
  const filtered = bookings.filter((b) => {
    if (filters.status !== "all" && b.status !== filters.status) return false;
    if (filters.resource && filters.resource !== "all" && b.resourceId !== filters.resource) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDayClick = (date) => {
    if (!date) return;
    // Mobile: toggle agenda panel; Desktop: nothing (chips handle click)
    setSelectedDay((prev) => (prev && prev.isSame(date, "day") ? null : date));
  };

  return (
    <div className="flex flex-col gap-1">

      {/* ── Calendar grid ── */}
      <div
        className="rounded-2xl overflow-hidden
                   bg-white dark:bg-[#0f172a]
                   border border-gray-100 dark:border-white/[0.06]
                   shadow-sm"
      >
        {/* Day header row */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-white/[0.04]">
          {DAY_LABELS_FULL.map((label, i) => (
            <div
              key={label}
              className={`py-3 text-center text-[11px] font-bold uppercase tracking-wide
                ${i === 0 || i === 6
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-400 dark:text-gray-500"}`}
            >
              {/* Responsive: full label on desktop, single letter on mobile */}
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{DAY_LABELS_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {monthDates.map((date, idx) => {
            const col = idx % 7;
            const isLastCol = col === 6;
            // Determine row — add bottom border except last row
            const totalRows = Math.ceil(monthDates.length / 7);
            const rowIdx = Math.floor(idx / 7);
            const isLastRow = rowIdx === totalRows - 1;

            if (!date) {
              return (
                <div
                  key={`e-${idx}`}
                  className={`
                    min-h-[52px] md:min-h-[110px]
                    bg-gray-50/60 dark:bg-black/[0.06]
                    ${!isLastCol ? "border-r border-gray-100 dark:border-white/[0.03]" : ""}
                    ${!isLastRow ? "border-b border-gray-100 dark:border-white/[0.03]" : ""}
                  `}
                />
              );
            }

            const isToday   = date.isSame(today, "day");
            const isPast    = date.isBefore(today, "day");
            const isWeekend = date.day() === 0 || date.day() === 6;
            const isOtherMonth = date.month() !== currentDate.month();
            const isSelected = selectedDay && date.isSame(selectedDay, "day");

            const dayBookings = bookingsOnDate(filtered, date);
            const visible  = dayBookings.slice(0, MAX_CHIPS);
            const overflow = dayBookings.length - MAX_CHIPS;

            return (
              <div
                key={date.format("YYYY-MM-DD")}
                onClick={() => handleDayClick(date)}
                className={`
                  relative group cursor-pointer
                  min-h-[52px] md:min-h-[110px]
                  p-1.5 md:p-2
                  transition-colors duration-150
                  ${!isLastCol ? "border-r border-gray-100 dark:border-white/[0.03]" : ""}
                  ${!isLastRow ? "border-b border-gray-100 dark:border-white/[0.03]" : ""}
                  ${isOtherMonth
                    ? "bg-gray-50/40 dark:bg-black/[0.04]"
                    : isWeekend
                      ? "bg-gray-50/60 dark:bg-white/[0.005]"
                      : "bg-white dark:bg-[#0f172a]"}
                  hover:bg-gray-50 dark:hover:bg-white/[0.02]
                `}
              >
                {/* Today highlight */}
                {isToday && (
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ background: gradient }}
                  />
                )}

                {/* Selected day highlight (mobile) */}
                {isSelected && (
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none md:hidden"
                    style={{ background: gradient }}
                  />
                )}

                {/* ── Date number ── */}
                <div className="flex items-start justify-between mb-1 md:mb-1.5">
                  <span
                    className={`
                      w-6 h-6 flex items-center justify-center rounded-full
                      text-xs font-bold leading-none transition-all duration-150
                      ${isToday
                        ? "text-white"
                        : isPast
                          ? "text-gray-300 dark:text-gray-700"
                          : isOtherMonth
                            ? "text-gray-300 dark:text-gray-700"
                            : "text-gray-700 dark:text-gray-200"}
                    `}
                    style={isToday ? {
                      background: gradient,
                      boxShadow: `0 2px 8px rgba(${accentRgb},0.35)`,
                    } : {}}
                  >
                    {date.date()}
                  </span>

                  {/* Quick-add on desktop hover */}
                  {!isPast && (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="hidden md:flex opacity-0 group-hover:opacity-100
                                 w-5 h-5 rounded-full items-center justify-center
                                 text-gray-400 hover:text-white
                                 transition-all duration-150"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = gradient;
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "";
                        e.currentTarget.style.color = "";
                      }}
                    >
                      <Plus size={10} />
                    </button>
                  )}
                </div>

                {/* ── Desktop: booking chips ── */}
                <div className="hidden md:flex flex-col gap-0.5">
                  {visible.map((b) => (
                    <BookingChip key={b.id} booking={b} onClick={openBooking} />
                  ))}
                  {overflow > 0 && (
                    <button
                      className="text-left text-[10px] font-semibold text-gray-400
                                 hover:text-gray-600 dark:hover:text-gray-200
                                 px-2 py-0.5 rounded-md
                                 hover:bg-gray-100 dark:hover:bg-white/[0.05]
                                 transition-colors duration-150"
                    >
                      +{overflow} more
                    </button>
                  )}
                </div>

                {/* ── Mobile: status dots ── */}
                {dayBookings.length > 0 && (
                  <div className="flex md:hidden items-center justify-center gap-0.5 mt-1">
                    {dayBookings.slice(0, 4).map((b) => {
                      const s = getStatusStyle(b.status);
                      return (
                        <span
                          key={b.id}
                          className="w-[5px] h-[5px] rounded-full"
                          style={{ background: s.border }}
                        />
                      );
                    })}
                    {dayBookings.length > 4 && (
                      <span className="text-[8px] text-gray-400 font-bold">+</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: selected day agenda panel ── */}
      <div className="md:hidden">
        <AnimatePresence>
          {selectedDay && (
            <DayAgendaPanel
              key={selectedDay.format("YYYY-MM-DD")}
              date={selectedDay}
              bookings={bookingsOnDate(filtered, selectedDay)}
              adapter={adapter}
              onClose={() => setSelectedDay(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
