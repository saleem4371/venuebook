"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, AlertCircle, Sun, Sunrise,
  Moon, CalendarDays, Check, Sparkles, Info, Clock, Coffee, Sunset,
} from "lucide-react";

// Map shift label keywords → Lucide icon
function getShiftIcon(label = "") {
  const l = label.toLowerCase();
  if (l.includes("morning"))   return Sunrise;
  if (l.includes("afternoon")) return Sun;
  if (l.includes("evening"))   return Sunset;
  if (l.includes("night"))     return Moon;
  if (l.includes("full"))      return CalendarDays;
  if (l.includes("day"))       return Sun;
  return Clock;
}
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryColors, normalizeCategory, getCalendarMode } from "../../utils/categoryConfig";

// ─── Mock data ─────────────────────────────────────────────────────────────────
const BOOKED = new Set([
  "2026-06-27", "2026-06-28",
  "2026-07-04", "2026-07-05",
  "2026-07-12", "2026-07-13", "2026-07-14",
  "2026-07-20", "2026-07-21",
  "2026-08-01", "2026-08-02", "2026-08-03",
]);


// Per-date shift status for venue (available / reserve / booked)
const SHIFT_STATUS = {
  "2026-07-15": { morning: "booked",    afternoon: "available", evening: "available" },
  "2026-07-16": { morning: "booked",    afternoon: "available", evening: "available" },
  "2026-07-23": { morning: "booked",    afternoon: "available", evening: "available" },
  "2026-07-28": { morning: "available", afternoon: "booked",    evening: "available" },
  "2026-07-29": { morning: "available", afternoon: "booked",    evening: "booked"    },
  "2026-07-30": { morning: "booked",    afternoon: "available", evening: "booked"    },
  "2026-07-31": { morning: "available", afternoon: "booked",    evening: "available" },
  "2026-07-25": { morning: "booked",    afternoon: "available", evening: "available" },
  "2026-07-27": { morning: "available", afternoon: "reserve",   evening: "reserve"   },
};



// Normalize either "reserve" or "reserved" coming from booking data to one key
const normalizeShiftStatus = (s) => (s === "reserve" ? "reserved" : s ?? "available");

const STATUS_LABEL  = { available: "Available", reserved: "Reserved", booked: "Booked" };
const STATUS_STYLE  = {
  available: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  reserved:  "bg-amber-50   text-amber-700   border border-amber-200   dark:bg-amber-950/30   dark:text-amber-400   dark:border-amber-800",
  booked:    "bg-gray-100   text-gray-500    border border-gray-200    dark:bg-gray-800       dark:text-gray-500    dark:border-gray-700",
};

const BASE_PRICE = {
  venues: 20000,
  farmstays: 8500,
  studios: 5000,
  workspaces: 2500,
  rentals: 3500,
  experiences: 4500,
};

const GOLD_DISCOUNT = 0.07;
const MIN_NIGHTS = { farmstays: 2 };

// ─── Utilities ─────────────────────────────────────────────────────────────────
const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const sameDay = (a, b) => !!a && !!b && toKey(a) === toKey(b);

const isPast = (d) => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
};

function getPrice(date, catKey, isMember) {
  const base = BASE_PRICE[catKey] ?? 8500;
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const price = weekend ? Math.round(base * 1.35) : base;
  return isMember ? Math.round(price * (1 - GOLD_DISCOUNT)) : price;
}

function fmtShort(p) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)}L`;
  if (p >= 1000) return `₹${Math.round(p / 1000)}k`;
  return `₹${p}`;
}

function fmtFull(p) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(p);
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
  return days;
}

function addMonths(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function hasBlockedInRange(start, end) {
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1); // don't include start date itself
  while (cur < end) {
    if (BOOKED.has(toKey(cur))) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ═══════════════════════════════════════════════════════════════════════════════
// TOOLTIP — small premium hover tooltip for disabled/booked/status days
// ═══════════════════════════════════════════════════════════════════════════════

function DayTooltip({ message, tone = "neutral" }) {
  if (!message) return null;

  const toneStyle = {
    neutral: "bg-gray-900 dark:bg-gray-700",
    booked:  "bg-gray-900 dark:bg-gray-700",
    partial: "bg-orange-600 dark:bg-orange-600",
    reserved:"bg-amber-600 dark:bg-amber-600",
  }[tone] ?? "bg-gray-900 dark:bg-gray-700";

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full
                 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                 transition-all duration-150 ease-out z-30 whitespace-nowrap"
    >
      <div className={`${toneStyle} text-white text-[11px] font-medium leading-none px-2.5 py-1.5 rounded-lg shadow-lg shadow-black/10`}>
        {message}
      </div>
      <div className={`w-2 h-2 ${toneStyle} rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-[3px]`} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENUE MODE — single month + shift selection panel
// ═══════════════════════════════════════════════════════════════════════════════

function VenueMonthGrid({ year,bookingFull,bookingParial, month, selectedDate, onDateClick, colors, catKey, isMember }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  return (
    <motion.div
      key={`${year}-${month}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm shadow-black/[0.02]"
    >
      <h3 className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 tracking-wide">
        {MONTH_NAMES[month]} {year}
      </h3>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-600 py-1 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const key = toKey(date);
          const booked = bookingFull?.includes(key);
          const partial = bookingParial?.includes(key);
          const past = isPast(date);
          const disabled = booked || past;
          const selected = sameDay(date, selectedDate);

          // Tooltip copy — proper, specific messaging per state
          let tooltipMessage = null;
          let tooltipTone = "neutral";
          if (booked && !past) {
            tooltipMessage = "Fully booked — no shifts available this day";
            tooltipTone = "booked";
          } else if (past) {
            tooltipMessage = "This date has passed";
            tooltipTone = "neutral";
          } else if (partial) {
            tooltipMessage = "Partially booked — some time slots still open";
            tooltipTone = "partial";
          }

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, delay: i * 0.006, ease: "easeOut" }}
              onClick={() => !disabled && onDateClick(date)}
              className={`group relative flex flex-col items-center py-0.5 select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              {tooltipMessage && <DayTooltip message={tooltipMessage} tone={tooltipTone} />}

              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150
                ${selected ? `${colors.selBg} shadow-md scale-105 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ${colors.border}` : ""}
                ${!disabled && !selected ? `hover:${colors.light} hover:scale-105` : ""}
                ${booked && !past ? "bg-gray-50 dark:bg-gray-900/60" : ""}
              `}>
                <span className={`
                  text-xs font-semibold leading-none
                  ${past ? "text-gray-300 dark:text-gray-600" : ""}
                  ${booked && !past ? "text-gray-300 dark:text-gray-600 line-through" : ""}
                  ${selected ? "text-white" : (!disabled ? "text-gray-800 dark:text-gray-200" : "")}
                `}>
                  {date.getDate()}
                </span>
                {/* Orange dot = partial booking (some shifts still available) */}
                {partial && !past && !booked && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-400 border border-white dark:border-gray-950" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function VenueCalendar({ venueshifts,bookingData, bookingFull,bookingParial, category, colors, isMember, onSelectionChange, resetKey, resetShiftKey }) {


  const catKey = normalizeCategory(category);
  const now = new Date();

  const [baseMonth, setBaseMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  // Full reset (Event Date X cleared)
  useEffect(() => { setSelectedDate(null); setSelectedShift(null); }, [resetKey]);

  // Shift-only reset (Time Slot X cleared — keeps selectedDate)
  useEffect(() => { setSelectedShift(null); }, [resetShiftKey]);



  const memberPrice = (p) => isMember ? Math.round(p * (1 - GOLD_DISCOUNT)) : p;

  const canGoBack = useMemo(() => {
    const prev = addMonths(baseMonth.year, baseMonth.month, -1);
    const n = new Date();
    return prev.year > n.getFullYear() || (prev.year === n.getFullYear() && prev.month >= n.getMonth());
  }, [baseMonth]);

  const handleDateClick = (date) => {
    if (sameDay(date, selectedDate)) {
      setSelectedDate(null);
      setSelectedShift(null);
    } else {
      setSelectedDate(date);
      setSelectedShift(null);
    }
  };

  const activeShift   = venueshifts.find((s) => s.id === selectedShift);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.({
      date: selectedDate,
      shift: selectedShift,
      shiftLabel: activeShift?.label ?? null,
      shiftTime: activeShift?.time ?? null,
      shiftAmount: activeShift?.price ?? 0,
    });
  }, [selectedDate, selectedShift]);

  function getShiftStatus(date, shiftId) {
  if (!date) return "available";
  const key = toKey(date);
  const source = bookingData ?? SHIFT_STATUS;
  return normalizeShiftStatus(source[key]?.[shiftId]);
}

  return (
    <div>

      {/* ── Compact header: date display + month nav in one row ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {selectedDate ? (
            <>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
              {selectedShift && activeShift && (
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors.light} ${colors.accent}`}>
                  {activeShift.label}
                </span>
              )}
              <button
                onClick={() => { setSelectedDate(null); setSelectedShift(null); }}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 transition-colors"
              >
                Clear
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">Select a date to view available slots</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-none">
          <button
            onClick={() => canGoBack && setBaseMonth((b) => addMonths(b.year, b.month, -1))}
            disabled={!canGoBack}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setBaseMonth((b) => addMonths(b.year, b.month, 1))}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-110 active:scale-95"
          >
            <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Gold member notice — only when no date selected */}
      {isMember && !selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 ${colors.light} border ${colors.border} rounded-xl px-3.5 py-2 mb-4 text-xs ${colors.accent}`}
        >
          <Sparkles size={12} />
          <span className="font-medium">Gold member pricing active</span>
          <span className="opacity-70">— 7% off on all dates</span>
        </motion.div>
      )}

      {/* Calendar + Shift panel — side-by-side once a date is picked */}
      <div className={`grid grid-cols-1 ${selectedDate ? "md:grid-cols-2" : ""} gap-6 transition-all duration-300`}>

        {/* Single month */}
        <AnimatePresence mode="wait">
          <VenueMonthGrid
            {...baseMonth}
            bookingFull={bookingFull}
            bookingParial={bookingParial}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
            colors={colors}
            catKey={catKey}
            isMember={isMember}
          />
        </AnimatePresence>

        {/* Shift panel — animated in */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              key="shift-panel"
              id="shift-panel"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col gap-2.5"
            >
              {/* Panel label */}
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Select a time slot</p>

              {/* Shift rows — status tag + pricing */}
              {venueshifts.map((shift, idx) => {
                const ShiftIcon  = getShiftIcon(shift.label);
                const status     = getShiftStatus(selectedDate, shift.id);
                const isBooked   = status === "booked" || status === "reserved";
                const isSelected = selectedShift === shift.id;
                const price      = Math.round(shift.price);
                const original   = Math.round(shift.price);

                const shiftTooltip =
                  status === "booked"   ? "This slot is fully booked" :
                  status === "reserved" ? "This slot is reserved — tentatively held" :
                  null;

                return (
                  <motion.div
                    key={shift.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05, ease: "easeOut" }}
                    className="group relative"
                  >
                    {shiftTooltip && (
                      <DayTooltip message={shiftTooltip} tone={status === "booked" ? "booked" : "reserved"} />
                    )}
                    <button
                      disabled={isBooked}
                      onClick={() => !isBooked && setSelectedShift(isSelected ? null : shift.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150 text-left
                        ${isBooked   ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800" : ""}
                        ${isSelected ? `${colors.light} border-2 ${colors.border} shadow-sm` : ""}
                        ${!isSelected && !isBooked ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm hover:-translate-y-0.5" : ""}
                      `}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-none transition-colors ${
                        isSelected ? colors.iconBg : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        <ShiftIcon size={15} className={isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"} />
                      </div>

                      {/* Label + time */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm leading-none mb-0.5 ${isSelected ? colors.accentBold : "text-gray-800 dark:text-gray-200"}`}>
                          {shift.label}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{shift.time}</p>
                      </div>

                      {/* Status tag */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none ${STATUS_STYLE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>

                      {/* Pricing */}
                      <div className="text-right flex-none ml-1">
                        <p className={`font-bold text-sm ${isSelected ? colors.accent : "text-gray-900 dark:text-white"}`}>
                          {fmtShort(price)}
                        </p>
                      </div>
                    </button>
                  </motion.div>
                );
              })}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend — always visible below calendar */}
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70"><span className="w-3.5 h-3.5 rounded-full bg-emerald-400 inline-block" />Available</span>
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70"><span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block" />Reserved</span>
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70"><span className="w-3.5 h-3.5 rounded-full bg-orange-400 inline-block" />Partially Booked</span>
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70"><span className="w-3.5 h-3.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />Booked</span>
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70">
          <span className="relative w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 inline-block overflow-hidden">
            <span className="absolute inset-0 flex items-center"><span className="w-full h-px bg-gray-400 rotate-45 block" /></span>
          </span>Fully Booked
        </span>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STAY MODE — dual month, Airbnb-style range with blocked-range validation
// ═══════════════════════════════════════════════════════════════════════════════

function StayMonthGrid({ year, month,bookingFull, range, hoverDate, checkoutLimit, onDateClick, onHover, colors, catKey, isMember }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  return (
    <motion.div
      key={`${year}-${month}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="flex-1 min-w-0"
    >

      
      <h3 className="text-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 tracking-wide">
        {MONTH_NAMES[month]} {year}
      </h3>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 dark:text-gray-600 py-1 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const key = toKey(date);
          const booked = bookingFull?.includes(key);
          const past = isPast(date);
          // When picking checkout: dates before/on check-in and dates >= first blocked date are slashed
          const selectingCheckout = range.start && !range.end;
          const preCheckIn = selectingCheckout && date <= range.start;
          const postLimit = selectingCheckout && checkoutLimit && date >= checkoutLimit;
          const disabled = booked || past || preCheckIn || postLimit;
          const slashed = booked || preCheckIn || postLimit;

          const isStart = sameDay(date, range.start);
          const isEnd = sameDay(date, range.end);
          const inRange = range.start && range.end && date > range.start && date < range.end;
          const inHover = selectingCheckout && hoverDate && date > range.start && date < hoverDate && !postLimit;
          const isHoverEnd = selectingCheckout && hoverDate && sameDay(date, hoverDate) && !postLimit;
          const hasRangeEnd = !!range.end;

          // Tooltip copy — proper, specific messaging per disabled reason
          let tooltipMessage = null;
          let tooltipTone = "neutral";
          if (booked && !past) {
            tooltipMessage = "Already booked — not available";
            tooltipTone = "booked";
          } else if (past) {
            tooltipMessage = "This date has passed";
          } else if (postLimit) {
            tooltipMessage = "Unavailable — a booking starts before this date";
            tooltipTone = "booked";
          } else if (preCheckIn) {
            tooltipMessage = "Checkout must be after your check-in date";
          }

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, delay: i * 0.004, ease: "easeOut" }}
              className={`
                group relative flex flex-col items-center py-0.5 select-none
                ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                ${inRange || inHover ? colors.rangeBg : ""}
              `}
              onClick={() => !disabled && onDateClick(date)}
              onMouseEnter={() => !disabled && onHover(date)}
              onMouseLeave={() => onHover(null)}
            >
              {tooltipMessage && <DayTooltip message={tooltipMessage} tone={tooltipTone} />}

              {/* Right-side bridge: start → range */}
              {isStart && (hasRangeEnd || (hoverDate && hoverDate > date && !postLimit)) && (
                <span className={`absolute inset-y-0 right-0 w-1/2 ${colors.rangeBg}`} />
              )}
              {/* Left-side bridge: range → end */}
              {(isEnd || isHoverEnd) && (
                <span className={`absolute inset-y-0 left-0 w-1/2 ${colors.rangeBg}`} />
              )}

              <div className={`
                relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150
                ${isStart || isEnd ? `${colors.selBg} shadow-md scale-105` : ""}
                ${isHoverEnd ? `border-2 ${colors.border} ${colors.light}` : ""}
                ${!disabled && !isStart && !isEnd && !isHoverEnd ? "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105" : ""}
              `}>
                <span className={`
                  text-xs font-semibold leading-none
                  ${past || preCheckIn ? "text-gray-300 dark:text-gray-600 line-through" : ""}
                  ${(booked || postLimit) && !past && !preCheckIn ? "text-gray-300 dark:text-gray-600 line-through" : ""}
                  ${isStart || isEnd ? "text-white" : ""}
                  ${isHoverEnd ? colors.accentBold : ""}
                  ${!disabled && !isStart && !isEnd && !isHoverEnd ? "text-gray-800 dark:text-gray-200" : ""}
                `}>
                  {date.getDate()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function StayCalendar({ category, bookingFull,colors, isMember, onRangeChange, resetKey, resetEndKey }) {

  const MIN_NIGHTS = {
  farmstays: 2,
  venues: 1,
  studios: 1,
};

const MAX_NIGHTS = {
  farmstays: 5,
  venues: 30,
  studios: 15,
};

  const catKey = normalizeCategory(category);
  const minNights = MIN_NIGHTS[catKey] ?? 1;
const maxNights = MAX_NIGHTS[catKey] ?? 30;
  const now = new Date();

  const [baseMonth, setBaseMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [range, setRange] = useState({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState(null);
  const [rangeError, setRangeError] = useState(null);

  // Notify parent when range changes
  useEffect(() => { onRangeChange?.(range); }, [range]);

  // Full reset (Check-in X cleared)
  useEffect(() => { setRange({ start: null, end: null }); setHoverDate(null); setRangeError(null); }, [resetKey]);

  // End-only reset (Checkout X cleared — keeps start)
  useEffect(() => { setRange((prev) => ({ ...prev, end: null })); setHoverDate(null); setRangeError(null); }, [resetEndKey]);

  const nextMonth = useMemo(() => addMonths(baseMonth.year, baseMonth.month, 1), [baseMonth]);

  const canGoBack = useMemo(() => {
    const prev = addMonths(baseMonth.year, baseMonth.month, -1);
    const n = new Date();
    return prev.year > n.getFullYear() || (prev.year === n.getFullYear() && prev.month >= n.getMonth());
  }, [baseMonth]);

  // First blocked date after check-in — checkout must be before this
  const checkoutLimit = useMemo(() => {
  if (!range.start || range.end) return null;

  const bookedDates = bookingFull || [];

  const cur = new Date(range.start);
  cur.setDate(cur.getDate() + 1);

  while (true) {
    const key = toKey(cur);

    if (bookedDates.includes(key)) {
      return new Date(cur); // First booked day
    }

    cur.setDate(cur.getDate() + 1);

    // Safety stop (1 year)
    if ((cur - range.start) / 86400000 > 365) break;
  }

  return null;
}, [range.start, range.end, bookingFull]);

  const handleDateClick = useCallback((date) => {
  setRangeError(null);

  setRange((prev) => {
    // First click
    if (!prev.start || prev.end) {
      return {
        start: date,
        end: null,
      };
    }

    // Restart if clicked before start
    if (date <= prev.start) {
      return {
        start: date,
        end: null,
      };
    }

    const nights = Math.round(
      (date - prev.start) / 86400000,
    );

    if (nights > maxNights) {
      setRangeError(
        `Maximum ${maxNights} nights can be booked.`,
      );
      return prev;
    }

    if (hasBlockedInRange(prev.start, date)) {
      setRangeError(
        "One or more selected dates are already booked."
      );
      return prev;
    }

    return {
      start: prev.start,
      end: date,
    };
  });

  setHoverDate(null);
}, [maxNights]);

  const clearRange = () => { setRange({ start: null, end: null }); setRangeError(null); };

  const nights = range.start && range.end
    ? Math.round((range.end - range.start) / 86400000) : 0;

  const tooShort = nights > 0 && nights < minNights;

  const totalPrice = useMemo(() => {
    if (!range.start || !range.end) return 0;
    let total = 0;
    const cur = new Date(range.start);
    while (cur < range.end) { total += getPrice(cur, catKey, isMember); cur.setDate(cur.getDate() + 1); }
    return total;
  }, [range, catKey, isMember]);

  const originalTotal = useMemo(() => {
    if (!range.start || !range.end) return 0;
    let total = 0;
    const cur = new Date(range.start);
    while (cur < range.end) { total += getPrice(cur, catKey, false); cur.setDate(cur.getDate() + 1); }
    return total;
  }, [range, catKey]);

  return (
    <div>
      {/* Compact header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {nights > 0
              ? `${nights} night${nights !== 1 ? "s" : ""}`
              : range.start ? "Select checkout" : "Select check-in date"}
          </span>
          {(range.start) && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {range.start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {range.end && ` – ${range.end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            </span>
          )}
          {(range.start) && (
            <button onClick={clearRange} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 transition-colors">
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 flex-none">
          <button onClick={() => canGoBack && setBaseMonth((b) => addMonths(b.year, b.month, -1))}
            disabled={!canGoBack}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100">
            <ChevronLeft size={15} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={() => setBaseMonth((b) => addMonths(b.year, b.month, 1))}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 hover:scale-110 active:scale-95">
            <ChevronRight size={15} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Range error — booked dates in range / too many nights */}
      <AnimatePresence>
        {rangeError && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 mb-4 text-sm text-red-700 dark:text-red-400"
          >
            <AlertCircle size={15} />
            {rangeError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Min stay warning */}
      <AnimatePresence>
        {tooShort && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-700 dark:text-amber-400"
          >
            <AlertCircle size={15} />
            Minimum {minNights} night{minNights > 1 ? "s" : ""} required for this property
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gold rate notice */}
      {isMember && nights === 0 && !rangeError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 ${colors.light} border ${colors.border} rounded-xl px-4 py-2.5 mb-4 text-sm ${colors.accent}`}
        >
          <Sparkles size={14} />
          <span className="font-medium">Gold member rates active</span>
          <span className="opacity-70">— 7% off every night</span>
        </motion.div>
      )}

      {/* Dual month */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <StayMonthGrid {...baseMonth} bookingFull={bookingFull} range={range} hoverDate={hoverDate} checkoutLimit={checkoutLimit} onDateClick={handleDateClick} onHover={setHoverDate} colors={colors} catKey={catKey} isMember={isMember} />
        <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-800 self-stretch" />
        <StayMonthGrid {...nextMonth} bookingFull={bookingFull}  range={range} hoverDate={hoverDate} checkoutLimit={checkoutLimit} onDateClick={handleDateClick} onHover={setHoverDate} colors={colors} catKey={catKey} isMember={isMember} />
      </div>

      {/* Total price summary — once a full range is picked */}
      {range.start && range.end && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between mt-5 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {nights} night{nights !== 1 ? "s" : ""} total
            </span>
            {isMember && totalPrice !== originalTotal && (
              <span className="text-xs line-through text-gray-400 dark:text-gray-600">{fmtFull(originalTotal)}</span>
            )}
          </div>
          <span className={`font-bold text-base ${colors.accent}`}>{fmtFull(totalPrice)}</span>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70">
          <span className={`w-3.5 h-3.5 rounded-full ${colors.selBg} inline-block`} />Selected
        </span>
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70">
          <span className={`w-3.5 h-3.5 rounded-full ${colors.rangeBg} border inline-block`} />In range
        </span>
        <span className="flex items-center gap-1.5 transition-opacity duration-150 hover:opacity-70">
          <span className="relative w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 inline-block overflow-hidden">
            <span className="absolute inset-0 flex items-center"><span className="w-full h-px bg-gray-400 rotate-45 block" /></span>
          </span>Booked
        </span>
        {isMember && (
          <span className={`flex items-center gap-1 ml-auto font-medium ${colors.accent}`}>
            <Sparkles size={11} /> Gold prices active
          </span>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT — routes to correct mode based on category
// ═══════════════════════════════════════════════════════════════════════════════
export default function PremiumCalendar({ venueshifts,bookingData,bookingFull,bookingParial, category = "venues", isMember = true, onSelectionChange, onRangeChange, resetKey, resetShiftKey, resetEndKey }) {
  const colors = getCategoryColors(category);
  const mode = getCalendarMode(category);

  return mode === "event"
    ? <VenueCalendar bookingData={bookingData} bookingFull={bookingFull} bookingParial={bookingParial} venueshifts={venueshifts} category={category} colors={colors} isMember={isMember} onSelectionChange={onSelectionChange} resetKey={resetKey} resetShiftKey={resetShiftKey} />
    : <StayCalendar category={category} bookingFull={bookingFull} colors={colors} isMember={isMember} onRangeChange={onRangeChange} resetKey={resetKey} resetEndKey={resetEndKey} />;
}