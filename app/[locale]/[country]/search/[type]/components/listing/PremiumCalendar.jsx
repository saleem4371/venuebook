"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, AlertCircle, Sun, Sunrise,
  Moon, CalendarDays, Check, Sparkles, Info,
} from "lucide-react";
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

// Partially booked venue dates (only some shifts taken)
const PARTIAL = new Set(["2026-06-30", "2026-07-08", "2026-07-22"]);

// Per-date shift status for venue (available / reserved / booked)
const SHIFT_STATUS = {
  "2026-06-30": { morning: "booked",    afternoon: "available", evening: "reserved", fullday: "booked"    },
  "2026-07-08": { morning: "available", afternoon: "booked",    evening: "available", fullday: "booked"    },
  "2026-07-22": { morning: "reserved",  afternoon: "available", evening: "available", fullday: "booked"    },
};

function getShiftStatus(date, shiftId) {
  if (!date) return "available";
  const key = toKey(date);
  return SHIFT_STATUS[key]?.[shiftId] ?? "available";
}

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
// VENUE MODE — single month + shift selection panel
// ═══════════════════════════════════════════════════════════════════════════════

function VenueMonthGrid({ year, month, selectedDate, onDateClick, colors, catKey, isMember }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
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
          const booked = BOOKED.has(key);
          const partial = PARTIAL.has(key);
          const past = isPast(date);
          const disabled = booked || past;
          const selected = sameDay(date, selectedDate);
          const isToday = key === toKey(new Date());

          return (
            <div
              key={key}
              onClick={() => !disabled && onDateClick(date)}
              className={`flex flex-col items-center py-0.5 select-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-100
                ${selected ? `${colors.selBg} shadow-sm` : ""}
                ${!disabled && !selected ? `hover:${colors.light}` : ""}
                ${isToday && !selected ? `ring-1 ${colors.selRing} ring-offset-1` : ""}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VenueCalendar({ category, colors, isMember, onSelectionChange }) {
  const catKey = normalizeCategory(category);
  const basePrice = BASE_PRICE[catKey] ?? 20000;
  const now = new Date();

  const [baseMonth, setBaseMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  const SHIFTS = [
    { id: "morning",   label: "Morning",   time: "8:00 AM – 1:00 PM",  icon: Sunrise,      mult: 0.50 },
    { id: "afternoon", label: "Afternoon", time: "1:00 PM – 6:00 PM",  icon: Sun,          mult: 0.60 },
    { id: "evening",   label: "Evening",   time: "6:00 PM – 11:00 PM", icon: Moon,         mult: 0.70 },
    { id: "fullday",   label: "Full Day",  time: "8:00 AM – 11:00 PM", icon: CalendarDays, mult: 1.00 },
  ];

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

  const activeShift   = SHIFTS.find((s) => s.id === selectedShift);
  const shiftPrice    = activeShift ? memberPrice(Math.round(basePrice * activeShift.mult)) : null;
  const shiftOriginal = activeShift ? Math.round(basePrice * activeShift.mult) : null;

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.({
      date: selectedDate,
      shift: selectedShift,
      shiftLabel: activeShift?.label ?? null,
      shiftTime: activeShift?.time ?? null,
    });
  }, [selectedDate, selectedShift]);

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
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setBaseMonth((b) => addMonths(b.year, b.month, 1))}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Gold member notice — only when no date selected */}
      {isMember && !selectedDate && (
        <div className={`flex items-center gap-2 ${colors.light} border ${colors.border} rounded-xl px-3.5 py-2 mb-4 text-xs ${colors.accent}`}>
          <Sparkles size={12} />
          <span className="font-medium">Gold member pricing active</span>
          <span className="opacity-70">— 7% off on all dates</span>
        </div>
      )}

      {/* Calendar + Shift panel — side-by-side once a date is picked */}
      <div className={`grid grid-cols-1 ${selectedDate ? "md:grid-cols-2" : ""} gap-6 transition-all duration-300`}>

        {/* Single month */}
        <VenueMonthGrid
          {...baseMonth}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          colors={colors}
          catKey={catKey}
          isMember={isMember}
        />

        {/* Shift panel — animated in */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              key="shift-panel"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="flex flex-col gap-2.5"
            >
              {/* Panel label */}
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">Select a time slot</p>

              {/* Shift rows — status tag + pricing */}
              {SHIFTS.map((shift) => {
                const ShiftIcon  = shift.icon;
                const status     = getShiftStatus(selectedDate, shift.id);
                const isBooked   = status === "booked";
                const isSelected = selectedShift === shift.id;
                const price      = memberPrice(Math.round(basePrice * shift.mult));
                const original   = Math.round(basePrice * shift.mult);

                return (
                  <button
                    key={shift.id}
                    disabled={isBooked}
                    onClick={() => !isBooked && setSelectedShift(isSelected ? null : shift.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all duration-150 text-left
                      ${isBooked   ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800" : ""}
                      ${isSelected ? `${colors.light} border-2 ${colors.border}` : ""}
                      ${!isSelected && !isBooked ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600" : ""}
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
                      {isMember && price !== original && (
                        <p className="text-[10px] line-through text-gray-400">{fmtShort(original)}</p>
                      )}
                      <p className={`font-bold text-sm ${isSelected ? colors.accent : "text-gray-900 dark:text-white"}`}>
                        {fmtShort(price)}
                      </p>
                    </div>
                  </button>
                );
              })}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend — always visible below calendar */}
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-emerald-400 inline-block" />Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block" />Reserved</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-orange-400 inline-block" />Partially Booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />Booked</span>
        <span className="flex items-center gap-1.5">
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

function StayMonthGrid({ year, month, range, hoverDate, checkoutLimit, onDateClick, onHover, colors, catKey, isMember }) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  return (
    <div className="flex-1 min-w-0">
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
          const booked = BOOKED.has(key);
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
          const isToday = key === toKey(new Date());
          const hasRangeEnd = !!range.end;

          return (
            <div
              key={key}
              className={`
                relative flex flex-col items-center py-0.5 select-none
                ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                ${inRange || inHover ? colors.rangeBg : ""}
              `}
              onClick={() => !disabled && onDateClick(date)}
              onMouseEnter={() => !disabled && onHover(date)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Right-side bridge: start → range */}
              {isStart && (hasRangeEnd || (hoverDate && hoverDate > date && !postLimit)) && (
                <span className={`absolute inset-y-0 right-0 w-1/2 ${colors.rangeBg}`} />
              )}
              {/* Left-side bridge: range → end */}
              {(isEnd || isHoverEnd) && (
                <span className={`absolute inset-y-0 left-0 w-1/2 ${colors.rangeBg}`} />
              )}

              <div className={`
                relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-100
                ${isStart || isEnd ? `${colors.selBg} shadow-sm` : ""}
                ${isHoverEnd ? `border-2 ${colors.border} ${colors.light}` : ""}
                ${!disabled && !isStart && !isEnd && !isHoverEnd ? "hover:bg-gray-100 dark:hover:bg-gray-800" : ""}
                ${isToday && !isStart && !isEnd ? `ring-1 ${colors.selRing} ring-offset-1` : ""}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StayCalendar({ category, colors, isMember, onRangeChange }) {
  const catKey = normalizeCategory(category);
  const minNights = MIN_NIGHTS[catKey] ?? 1;
  const now = new Date();

  const [baseMonth, setBaseMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [range, setRange] = useState({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState(null);
  const [rangeError, setRangeError] = useState(null);

  // Notify parent when range changes
  useEffect(() => { onRangeChange?.(range); }, [range]);

  const nextMonth = useMemo(() => addMonths(baseMonth.year, baseMonth.month, 1), [baseMonth]);

  const canGoBack = useMemo(() => {
    const prev = addMonths(baseMonth.year, baseMonth.month, -1);
    const n = new Date();
    return prev.year > n.getFullYear() || (prev.year === n.getFullYear() && prev.month >= n.getMonth());
  }, [baseMonth]);

  // First blocked date after check-in — checkout must be before this
  const checkoutLimit = useMemo(() => {
    if (!range.start || range.end) return null;
    const cur = new Date(range.start);
    cur.setDate(cur.getDate() + 1);
    for (let i = 0; i < 365; i++) {
      if (BOOKED.has(toKey(cur))) return new Date(cur);
      cur.setDate(cur.getDate() + 1);
    }
    return null;
  }, [range.start, range.end]);

  const handleDateClick = useCallback((date) => {
    setRangeError(null);
    setRange((prev) => {
      if (!prev.start || (prev.start && prev.end)) {
        return { start: date, end: null };
      }
      if (date <= prev.start) {
        return { start: date, end: null };
      }
      return { start: prev.start, end: date };
    });
    setHoverDate(null);
  }, []);

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
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={15} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={() => setBaseMonth((b) => addMonths(b.year, b.month, 1))}
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <ChevronRight size={15} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Min stay warning */}
      {tooShort && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle size={15} />
          Minimum {minNights} night{minNights > 1 ? "s" : ""} required for this property
        </div>
      )}

      {/* Gold rate notice */}
      {isMember && nights === 0 && !rangeError && (
        <div className={`flex items-center gap-2 ${colors.light} border ${colors.border} rounded-xl px-4 py-2.5 mb-4 text-sm ${colors.accent}`}>
          <Sparkles size={14} />
          <span className="font-medium">Gold member rates active</span>
          <span className="opacity-70">— 7% off every night</span>
        </div>
      )}

      {/* Dual month */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <StayMonthGrid {...baseMonth} range={range} hoverDate={hoverDate} checkoutLimit={checkoutLimit} onDateClick={handleDateClick} onHover={setHoverDate} colors={colors} catKey={catKey} isMember={isMember} />
        <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-800 self-stretch" />
        <StayMonthGrid {...nextMonth} range={range} hoverDate={hoverDate} checkoutLimit={checkoutLimit} onDateClick={handleDateClick} onHover={setHoverDate} colors={colors} catKey={catKey} isMember={isMember} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-full ${colors.selBg} inline-block`} />Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-full ${colors.rangeBg} border inline-block`} />In range
        </span>
        <span className="flex items-center gap-1.5">
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
export default function PremiumCalendar({ category = "venues", isMember = true, onSelectionChange, onRangeChange }) {
  const colors = getCategoryColors(category);
  const mode = getCalendarMode(category);

  return mode === "event"
    ? <VenueCalendar category={category} colors={colors} isMember={isMember} onSelectionChange={onSelectionChange} />
    : <StayCalendar category={category} colors={colors} isMember={isMember} onRangeChange={onRangeChange} />;
}
