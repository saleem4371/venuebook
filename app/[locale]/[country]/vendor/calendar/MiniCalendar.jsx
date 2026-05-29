"use client";
/**
 * MiniCalendar.jsx
 * Compact calendar for the left sidebar — allows quick date jumping.
 */
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import dayjs from "dayjs";
import { useCalendar } from "./CalendarContext";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MiniCalendar({ adapter }) {
  const { currentDate, setCurrentDate, activeView, monthDates } = useCalendar();
  const [miniDate, setMiniDate] = useState(dayjs());
  const today = dayjs();

  const { gradient, accentRgb, bookings = [] } = adapter;

  /* Build mini grid for miniDate's month */
  const start = miniDate.startOf("month");
  const end   = miniDate.endOf("month");
  const cells = [];
  for (let i = 0; i < start.day(); i++) cells.push(null);
  for (let d = start; d.isBefore(end.add(1, "day"), "day"); d = d.add(1, "day")) {
    cells.push(d);
  }

  /* Which dates have bookings? */
  const bookedDates = new Set(bookings.map((b) => b.date));

  const handleDayClick = (d) => {
    if (!d) return;
    setCurrentDate(d);
    if (activeView === "month") setCurrentDate(d.startOf("month"));
  };

  const isSelected = (d) => {
    if (!d) return false;
    if (activeView === "month") return d.month() === currentDate.month() && d.year() === currentDate.year();
    return d.isSame(currentDate, "day");
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f172a]
                    border border-gray-100 dark:border-white/[0.06]
                    shadow-sm p-4">

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMiniDate((d) => d.subtract(1, "month"))}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        <button
          onClick={() => setMiniDate(dayjs())}
          className="text-xs font-bold text-gray-700 dark:text-gray-200 hover:opacity-70 transition-opacity"
        >
          {miniDate.format("MMM YYYY")}
        </button>

        <button
          onClick={() => setMiniDate((d) => d.add(1, "month"))}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {l}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;

          const isToday   = d.isSame(today, "day");
          const isSel     = isSelected(d);
          const hasBooking = bookedDates.has(d.format("YYYY-MM-DD"));
          const isPast    = d.isBefore(today, "day");

          return (
            <motion.button
              key={d.format("YYYY-MM-DD")}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleDayClick(d)}
              className={`relative mx-auto w-7 h-7 rounded-full text-[11px] font-medium
                           flex items-center justify-center transition-all duration-150
                ${isSel
                  ? "text-white font-bold shadow-md"
                  : isToday
                    ? "text-white font-bold"
                    : isPast
                      ? "text-gray-300 dark:text-gray-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                }`}
              style={
                isSel
                  ? { background: gradient }
                  : isToday && !isSel
                    ? { background: `rgba(${accentRgb},0.2)`, color: adapter.accent }
                    : {}
              }
            >
              {d.date()}
              {/* Booking dot */}
              {hasBooking && !isSel && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: adapter.accent }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
